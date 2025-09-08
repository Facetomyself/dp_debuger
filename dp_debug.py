#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
DrissionPage 逆向调试工具
使用指定Chrome浏览器并自动加载 plugin/ 目录下的所有插件
版本要求: DrissionPage >= 4.1.0.0

功能状态:
- ✅ 浏览器启动和插件加载（自动发现所有插件）
- ✅ 网络监听（实时显示并保存）
- ✅ 控制台日志捕获（使用DrissionPage内置功能）
- ✅ DOM变化监听（MutationObserver）
- ✅ 网络包保存（JSONL格式）
- ✅ Cookie Monitor（监控所有cookie操作）

插件自动发现:
- 扫描 plugin/ 目录下的所有文件夹
- 查找包含 manifest.json 的有效Chrome扩展
- 自动加载所有发现的插件

监听功能:
- 控制台日志: 实时捕获并保存到 logs/console_logs.txt
- DOM变化: 监听页面元素变化，输出到控制台
- XHR请求: 拦截并记录网络请求
- 网络数据包: 捕获所有网络请求并保存到 data/network_packets.jsonl
- Cookie操作: 监控所有 document.cookie 的读写操作

Cookie Monitor 特性:
- 实时监控 cookie 的添加/修改/删除
- 彩色控制台输出，包含操作时间和代码位置
- 支持断点调试（可配置规则）
- 显示完整的调用栈信息
- 兼容网站自定义的 cookie 属性访问器

文件保存位置 (自动使用会话ID区分):
- 主日志: logs/dp_debug_{SESSION_ID}.log
- 控制台日志: logs/console_logs_{SESSION_ID}.txt
- 网络数据包: data/network_packets_{SESSION_ID}.jsonl

启动优化:
- 插件加载等待时间减少到1秒
- 模块初始化等待时间减少到1秒
- 按优先级顺序加载模块
- 监控循环响应时间减少到0.1秒
- 统计信息显示间隔减少到10秒

JS模块文件:
- 模块管理器: js/module_manager.js
- Cookie Monitor: js/cookie_monitor.js
- 调试工具: js/debug_utils.js
- 配置示例: js/cookie_monitor_config.js

模块化架构:
- 每个功能独立为JS模块文件
- 运行时动态组合所有模块
- 支持模块加载状态监控
- 提供模块重试机制
"""

import os
import sys
import time
import json
import logging
from datetime import datetime

# 创建专门的文件夹
os.makedirs('logs', exist_ok=True)
os.makedirs('data', exist_ok=True)

# 生成本次启动的会话ID
SESSION_ID = datetime.now().strftime('%Y%m%d_%H%M%S')

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'logs/dp_debug_{SESSION_ID}.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

try:
    from DrissionPage import Chromium, ChromiumOptions
    logger.info("DrissionPage 导入成功")
except ImportError as e:
    logger.error(f"DrissionPage 导入失败: {e}")
    logger.error("请确保已安装 DrissionPage >= 4.1.0.0")
    logger.error("安装命令: pip install DrissionPage")
    sys.exit(1)


class DPDebugger:
    """DrissionPage 逆向调试器"""

    def __init__(self):
        self.chrome_path = r"D:\python_project\DrissionPage\chrome\Chrome-bin\chrome.exe"
        self.plugin_base_path = r"D:\python_project\DrissionPage\plugin"
        self.plugin_paths = []
        self.browser = None
        self.tab = None

        # 发现并验证所有插件
        self._discover_plugins()
        self._validate_paths()

    def _discover_plugins(self):
        """自动发现所有插件"""
        if not os.path.exists(self.plugin_base_path):
            logger.warning(f"插件基础目录不存在: {self.plugin_base_path}")
            return

        # 扫描插件目录，查找所有包含 manifest.json 的目录
        for item in os.listdir(self.plugin_base_path):
            plugin_path = os.path.join(self.plugin_base_path, item)
            manifest_path = os.path.join(plugin_path, 'manifest.json')

            if os.path.isdir(plugin_path) and os.path.exists(manifest_path):
                self.plugin_paths.append(plugin_path)
                logger.info(f"发现插件: {item} -> {plugin_path}")

        if not self.plugin_paths:
            logger.warning(f"在 {self.plugin_base_path} 中未发现任何有效插件")
        else:
            logger.info(f"共发现 {len(self.plugin_paths)} 个插件")

    def _validate_paths(self):
        """验证Chrome和插件路径"""
        if not os.path.exists(self.chrome_path):
            raise FileNotFoundError(f"Chrome 路径不存在: {self.chrome_path}")

        logger.info(f"Chrome 路径: {self.chrome_path}")

        # 验证每个插件路径
        valid_plugins = []
        for plugin_path in self.plugin_paths:
            if os.path.exists(plugin_path):
                valid_plugins.append(plugin_path)
                plugin_name = os.path.basename(plugin_path)
                logger.info(f"插件路径验证通过: {plugin_name} -> {plugin_path}")
            else:
                plugin_name = os.path.basename(plugin_path)
                logger.warning(f"插件路径不存在: {plugin_name} -> {plugin_path}")

        self.plugin_paths = valid_plugins
        logger.info(f"有效插件数量: {len(self.plugin_paths)}")

    def create_options(self):
        """创建浏览器启动选项"""
        options = ChromiumOptions()

        # 设置浏览器路径
        options.set_browser_path(self.chrome_path)

        # 添加所有发现的插件
        for plugin_path in self.plugin_paths:
            try:
                plugin_name = os.path.basename(plugin_path)
                logger.info(f"尝试添加插件: {plugin_name} -> {plugin_path}")

                # 检查 manifest.json 是否存在
                manifest_path = os.path.join(plugin_path, 'manifest.json')
                if not os.path.exists(manifest_path):
                    logger.warning(f"插件 {plugin_name} 缺少 manifest.json 文件")
                    continue

                options.add_extension(plugin_path)
                logger.info(f"✅ 插件添加成功: {plugin_name}")

            except Exception as e:
                plugin_name = os.path.basename(plugin_path)
                logger.error(f"❌ 插件添加失败: {plugin_name} - {e}")
                logger.error(f"插件路径: {plugin_path}")

        # 基础配置
        options.ignore_certificate_errors()  # 忽略证书错误
        options.set_pref('profile.managed_default_content_settings.images', 2)  # 禁用图片，提高速度
        options.set_pref('profile.default_content_setting_values.notifications', 2)  # 禁用通知
        options.set_pref('profile.managed_default_content_settings.media_stream', 2)  # 禁用媒体流

        # 调试相关配置
        options.set_pref('devtools.timeline', True)  # 启用时间线
        options.set_argument('--disable-web-security')  # 禁用网络安全策略
        options.set_argument('--disable-features=VizDisplayCompositor')  # 禁用可视化合成器

        # 设置用户代理（可选，用于伪装）
        options.set_user_agent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        return options

    def start_browser(self):
        """启动浏览器"""
        try:
            logger.info("正在启动浏览器...")
            options = self.create_options()
            self.browser = Chromium(options)
            self.tab = self.browser.latest_tab
            logger.info("浏览器启动成功")

            # 减少插件加载等待时间（从3秒减少到1秒）
            time.sleep(1)
            logger.info("插件加载完成")

        except Exception as e:
            logger.error(f"浏览器启动失败: {e}")
            raise

    def open_url(self, url, wait_time=2):
        """打开指定URL"""
        try:
            logger.info(f"正在打开: {url}")
            self.tab.get(url)
            if wait_time > 0:
                time.sleep(wait_time)
            logger.info(f"页面加载完成: {self.tab.title}")
        except Exception as e:
            logger.error(f"打开URL失败: {e}")
            raise

    def setup_listeners(self, urls=None):
        """设置网络监听"""
        if urls is None:
            urls = ['api', 'data', '.json', '.xml']

        logger.info(f"开始监听网络请求: {urls}")
        self.tab.listen.start(*urls)
        logger.info("网络监听已启动")

    def get_listened_packets(self, timeout=10):
        """获取监听到的数据包并保存"""
        try:
            packets = []
            start_time = time.time()
            saved_count = 0

            while time.time() - start_time < timeout:
                for packet in self.tab.listen.steps(timeout=1):
                    packets.append(packet)
                    logger.info(f"🌐 捕获到数据包: {packet.url}")

                    # 保存网络包详情到文件
                    try:
                        packet_info = self._extract_packet_info(packet)
                        if packet_info:
                            self._save_packet_to_file(packet_info)
                            saved_count += 1

                    except Exception as save_e:
                        logger.warning(f"保存网络包失败: {save_e}")

            if saved_count > 0:
                logger.info(f"💾 已保存 {saved_count} 个网络数据包到 data/network_packets.jsonl")

            return packets
        except Exception as e:
            logger.error(f"获取数据包失败: {e}")
            return []

    def _extract_packet_info(self, packet):
        """从数据包中提取信息 - 使用分析结果的正确方法"""
        try:
            packet_info = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'url': '',
                'method': 'UNKNOWN',
                'status_code': 'UNKNOWN',
                'request_headers': {},
                'response_headers': {},
                'body_size': 0,
                'response_size': 0,
                'content_type': '',
                'user_agent': '',
                'server': '',
                'content_length': 0
            }

            # 🚀 核心发现：使用 packet.request 和 packet.response 对象
            # 从分析结果得知，数据包的基本属性（如url, method）可能不存在
            # 需要从 request 和 response 子对象中获取

            # 1. 解析请求信息
            if hasattr(packet, 'request') and packet.request:
                request = packet.request
                packet_info['url'] = getattr(request, 'url', '')
                packet_info['method'] = getattr(request, 'method', 'UNKNOWN')

                # 获取请求头
                if hasattr(request, 'headers'):
                    headers = request.headers
                    if isinstance(headers, dict):
                        packet_info['request_headers'] = headers
                        packet_info['content_type'] = headers.get('content-type', headers.get('Content-Type', ''))
                        packet_info['user_agent'] = headers.get('user-agent', headers.get('User-Agent', ''))

                # 获取请求体大小（如果有post_data）
                if hasattr(request, 'post_data') and request.post_data:
                    packet_info['body_size'] = len(str(request.post_data))

            # 2. 解析响应信息
            if hasattr(packet, 'response') and packet.response:
                response = packet.response
                packet_info['status_code'] = getattr(response, 'status', 'UNKNOWN')

                # 获取响应头
                if hasattr(response, 'headers'):
                    headers = response.headers
                    if isinstance(headers, dict):
                        packet_info['response_headers'] = headers
                        packet_info['server'] = headers.get('server', '')
                        packet_info['content_length'] = headers.get('content-length', headers.get('Content-Length', 0))

                # 获取响应体内容和大小（核心改进）
                if hasattr(response, 'body') and response.body:
                    try:
                        body_content = response.body
                        packet_info['response_body'] = body_content

                        # 根据内容类型计算大小和提取信息
                        if isinstance(body_content, dict):
                            # JSON对象 - 已解析
                            packet_info['response_size'] = len(body_content)
                            packet_info['body_type'] = 'parsed_json'
                            packet_info['body_keys'] = list(body_content.keys())[:10]  # 前10个键
                            packet_info['body_sample'] = str(body_content)[:200] + '...' if len(str(body_content)) > 200 else str(body_content)

                        elif isinstance(body_content, list):
                            # JSON数组 - 已解析
                            packet_info['response_size'] = len(body_content)
                            packet_info['body_type'] = 'parsed_list'
                            packet_info['body_sample'] = str(body_content)[:200] + '...' if len(str(body_content)) > 200 else str(body_content)

                        elif isinstance(body_content, str):
                            # 字符串内容
                            packet_info['response_size'] = len(body_content)
                            packet_info['body_type'] = 'string'
                            packet_info['body_sample'] = body_content[:200] + '...' if len(body_content) > 200 else body_content

                        elif isinstance(body_content, bytes):
                            # 字节内容
                            packet_info['response_size'] = len(body_content)
                            packet_info['body_type'] = 'bytes'
                            # 尝试解码为字符串
                            try:
                                decoded = body_content.decode('utf-8')
                                packet_info['body_sample'] = decoded[:200] + '...' if len(decoded) > 200 else decoded
                            except:
                                packet_info['body_sample'] = f'<bytes: {len(body_content)} bytes>'

                        else:
                            # 其他类型
                            packet_info['response_size'] = -1
                            packet_info['body_type'] = str(type(body_content))
                            packet_info['body_sample'] = str(body_content)[:200] + '...' if len(str(body_content)) > 200 else str(body_content)

                    except Exception as e:
                        packet_info['response_size'] = -1
                        packet_info['body_error'] = str(e)
                        logger.debug(f"获取响应体失败: {e}")

                # 如果没有body但有content-length，使用content-length
                if packet_info.get('response_size', 0) == 0 and packet_info.get('content_length'):
                    try:
                        packet_info['response_size'] = int(packet_info['content_length'])
                    except:
                        pass

            # 3. 备用方案：如果上面的方法都失败了，尝试直接从packet获取
            if not packet_info['url'] and hasattr(packet, 'url'):
                packet_info['url'] = getattr(packet, 'url', '')
            if packet_info['method'] == 'UNKNOWN' and hasattr(packet, 'method'):
                packet_info['method'] = getattr(packet, 'method', 'UNKNOWN')

            return packet_info
        except Exception as e:
            logger.warning(f"提取数据包信息失败: {e}")
            return None

    def _save_packet_to_file(self, packet_info):
        """保存数据包信息到文件"""
        try:
            network_packet_file = f'data/network_packets_{SESSION_ID}.jsonl'
            with open(network_packet_file, 'a', encoding='utf-8') as f:
                json.dump(packet_info, f, ensure_ascii=False, default=str)
                f.write('\n')
        except Exception as e:
            logger.error(f"写入数据包文件失败: {e}")

    def get_saved_packets_count(self):
        """获取已保存的数据包数量"""
        try:
            network_packet_file = f'data/network_packets_{SESSION_ID}.jsonl'
            with open(network_packet_file, 'r', encoding='utf-8') as f:
                return sum(1 for line in f)
        except FileNotFoundError:
            return 0
        except Exception as e:
            logger.error(f"读取数据包文件失败: {e}")
            return 0

    def capture_console_logs(self):
        """捕获控制台日志 - 使用DrissionPage内置功能"""
        try:
            # 启动控制台监听
            self.tab.console.start()
            logger.info("✅ 控制台日志监听已启动")
        except Exception as e:
            logger.error(f"❌ 启动控制台监听失败: {e}")

    def get_console_logs(self):
        """获取控制台日志 - 使用DrissionPage内置功能"""
        try:
            # 非阻塞方式获取控制台消息
            console_msg = self.tab.console.wait(timeout=0.1)
            if console_msg:
                log_text = console_msg.text
                logger.info(f"控制台: {log_text}")

                # 保存到文件（使用会话ID区分）
                try:
                    console_log_file = f'logs/console_logs_{SESSION_ID}.txt'
                    with open(console_log_file, 'a', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {log_text}\n")
                except Exception as save_e:
                    logger.warning(f"保存控制台日志失败: {save_e}")

                return [log_text]
            return []
        except Exception as e:
            # 超时是正常的，不需要报错
            if "timeout" not in str(e).lower():
                logger.error(f"获取控制台日志失败: {e}")
            return []

    def inject_debug_script(self):
        """注入调试脚本，读取独立的JS模块文件"""
        try:
            # 读取所有JS模块文件
            js_files = {
                'module_manager': os.path.join(os.path.dirname(__file__), 'js', 'module_manager.js'),
                'cookie_monitor': os.path.join(os.path.dirname(__file__), 'js', 'cookie_monitor.js'),
                'debug_utils': os.path.join(os.path.dirname(__file__), 'js', 'debug_utils.js')
            }

            combined_script = "// ===== DrissionPage 逆向调试工具 =====\n"
            combined_script += "// 自动组合所有JS模块文件\n\n"

            # 按优先级顺序加载模块（核心功能优先）
            load_order = ['debug_utils', 'cookie_monitor', 'module_manager']  # 调试工具优先，模块管理器最后

            for name in load_order:
                if name in js_files:
                    file_path = js_files[name]
                    if os.path.exists(file_path):
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            combined_script += f"// ===== {name.upper()} 模块 =====\n"
                            combined_script += content + "\n\n"
                            logger.info(f"✅ 已读取 {name} 模块 ({len(content)} 字符)")
                        except Exception as e:
                            logger.warning(f"读取 {name} 模块失败: {e}")
                    else:
                        logger.warning(f"{name} 模块文件不存在: {file_path}")

            # 添加初始化脚本（优化版本，减少等待时间）
            init_script = """
// ===== 初始化脚本 =====
(function() {
    'use strict';

    console.log('🚀 [DP_DEBUG] 开始初始化所有调试功能...');

    // 快速初始化 - 立即尝试初始化，不等待
    function initModules() {
        try {
            // 直接初始化所有模块，不使用setInterval
            if (typeof window.DP_DEBUG !== 'undefined') {
                if (window.DP_DEBUG.interceptXHR) {
                    window.DP_DEBUG.interceptXHR();
                }
                if (window.DP_DEBUG.startDOMObserver) {
                    window.DP_DEBUG.startDOMObserver();
                }
                if (window.DP_DEBUG.startPerformanceMonitor) {
                    window.DP_DEBUG.startPerformanceMonitor();
                }
                console.log('🎉 [DP_DEBUG] 所有调试功能已启用');
                return true;
            }
        } catch (e) {
            console.error('❌ [DP_DEBUG] 初始化失败:', e);
        }
        return false;
    }

    // 立即尝试初始化
    if (!initModules()) {
        // 如果失败，尝试一次延迟初始化（减少到1秒）
        setTimeout(function() {
            if (!initModules()) {
                console.log('⏰ [DP_DEBUG] 初始化延迟完成');
            }
        }, 1000);
    }

})();
"""
            combined_script += init_script

            # 执行组合后的脚本
            self.tab.run_js(combined_script)
            logger.info("✅ 所有JS模块注入成功")

            # 输出模块加载状态
            logger.info("📦 已加载的JS模块:")
            for name in js_files.keys():
                file_path = js_files[name]
                if os.path.exists(file_path):
                    size = os.path.getsize(file_path)
                    logger.info(f"  - {name}: {size} bytes")
                else:
                    logger.info(f"  - {name}: ❌ 文件不存在")

        except Exception as e:
            logger.error(f"❌ 注入调试脚本失败: {e}")
            # 尝试只注入基础功能
            try:
                basic_script = """
                console.log('🔧 [DP_DEBUG] 基础调试功能已启用');
                window.DP_DEBUG = {
                    getAllCookies: function() { return document.cookie; },
                    getLocalStorage: function() {
                        var items = {};
                        for (var i = 0; i < localStorage.length; i++) {
                            items[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
                        }
                        return items;
                    }
                };
                """
                self.tab.run_js(basic_script)
                logger.info("⚠️ 已注入基础调试功能")
            except Exception as e2:
                logger.error(f"❌ 基础调试功能注入也失败: {e2}")

    def get_page_info(self):
        """获取页面基本信息"""
        try:
            info = {
                'title': self.tab.title,
                'url': self.tab.url,
                'cookies': self.tab.run_js("return document.cookie;"),
                'user_agent': self.tab.run_js("return navigator.userAgent;"),
                'local_storage_count': self.tab.run_js("return localStorage.length;"),
                'session_storage_count': self.tab.run_js("return sessionStorage.length;")
            }
            return info
        except Exception as e:
            logger.error(f"获取页面信息失败: {e}")
            return {}

    def close(self):
        """关闭浏览器"""
        try:
            if self.browser:
                self.browser.quit()
                logger.info("浏览器已关闭")
        except Exception as e:
            logger.error(f"关闭浏览器失败: {e}")


def main():
    """主函数"""
    debugger = None
    try:
        logger.info("=== DrissionPage 逆向调试工具启动 ===")

        # 创建调试器
        debugger = DPDebugger()

        # 启动浏览器
        debugger.start_browser()

        # 🚀 立即启动监听（在页面访问前）
        debugger.setup_listeners(['http'])  # 监听所有HTTP请求

        # 注入调试脚本
        debugger.inject_debug_script()

        # 启动控制台日志捕获
        debugger.capture_console_logs()

        # 示例：打开一个测试页面
        test_url = "https://www.nodeseek.com/"
        debugger.open_url(test_url)

        # 获取页面信息
        page_info = debugger.get_page_info()
        logger.info(f"页面信息: {page_info}")

        # 立即开始监听（减少等待时间）
        logger.info("🚀 浏览器已启动，可以开始逆向调试...")
        logger.info(f"📁 日志文件: logs/dp_debug_{SESSION_ID}.log")
        logger.info(f"📁 控制台日志: logs/console_logs_{SESSION_ID}.txt")
        logger.info(f"📁 网络数据: data/network_packets_{SESSION_ID}.jsonl")
        logger.info("按 Ctrl+C 退出")

        # 保持运行，等待用户手动操作
        packet_count = 0
        start_time = time.time()
        last_stats_time = 0

        while True:
            time.sleep(0.1)  # 从0.5秒减少到0.1秒，更快响应

            # 检查控制台日志
            logs = debugger.get_console_logs()
            if logs:
                for log in logs:
                    logger.info(f"📝 控制台: {log}")

            # 检查是否有新的网络包
            packets = debugger.get_listened_packets(timeout=0.1)  # 减少超时时间
            if packets:
                packet_count += len(packets)
                for packet in packets:
                    logger.info(f"🌐 网络请求: {packet.url}")

            # 每10秒显示一次统计信息（从30秒减少到10秒）
            current_time = time.time()
            if current_time - last_stats_time >= 10:
                total_saved = debugger.get_saved_packets_count()
                logger.info(f"📊 统计: 捕获 {packet_count} 个网络包，已保存 {total_saved} 个到文件")
                last_stats_time = current_time

    except KeyboardInterrupt:
        logger.info("收到退出信号...")
    except Exception as e:
        logger.error(f"运行出错: {e}")
        raise
    finally:
        if debugger:
            debugger.close()


if __name__ == "__main__":
    main()
