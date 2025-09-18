#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
DrissionPage 调试/注入工具（简化版）
- 更快启动：按需加载插件与监听；避免阻塞循环
- 统一日志：无表情符，结构化信息
- 注入模块：js/module_manager.js, js/debug_utils.js, js/cookie_monitor.js, js/scroll.js
"""

import argparse
import os
import sys
import time
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional, List


# Paths
ROOT = os.path.abspath(os.path.dirname(__file__))
JS_DIR = os.path.join(ROOT, 'js')
LOG_DIR = os.path.join(ROOT, 'logs')
DATA_DIR = os.path.join(ROOT, 'data')
PLUGIN_DIR = os.path.join(ROOT, 'plugin')
CONFIG_DIR = os.path.join(ROOT, 'config')
DEFAULT_CONFIG_PATH = os.path.join(CONFIG_DIR, 'dp_debug.json')

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

SESSION_ID = datetime.now().strftime('%Y%m%d_%H%M%S')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOG_DIR, f'dp_debug_{SESSION_ID}.log'), encoding='utf-8')
    ]
)
logger = logging.getLogger('dp')

try:
    from DrissionPage import Chromium, ChromiumOptions
except ImportError as e:
    logger.error('DrissionPage 导入失败: %s', e)
    logger.error('请安装 DrissionPage: pip install drissionpage')
    sys.exit(1)


def load_config(path: str) -> Dict[str, Any]:
    if not path:
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            logger.info('已加载配置: %s', path)
            return cfg if isinstance(cfg, dict) else {}
    except FileNotFoundError:
        logger.info('未找到配置文件: %s', path)
        return {}
    except Exception as e:
        logger.warning('读取配置失败: %s', e)
        return {}


def _detect_chrome_path() -> str:
    """Locate Chrome/Chromium on Windows common paths. Return empty string if not found."""
    candidates: List[str] = []
    candidates.append(os.path.join(ROOT, 'chrome', 'Chrome-bin', 'chrome.exe'))
    if os.environ.get('DP_CHROME'):
        candidates.append(os.environ['DP_CHROME'])
    program_files = os.environ.get('ProgramFiles', r'C:\\Program Files')
    program_files_x86 = os.environ.get('ProgramFiles(x86)', r'C:\\Program Files (x86)')
    local_appdata = os.environ.get('LOCALAPPDATA', '')
    candidates += [
        os.path.join(program_files, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        os.path.join(program_files_x86, 'Google', 'Chrome', 'Application', 'chrome.exe')
    ]
    if local_appdata:
        candidates.append(os.path.join(local_appdata, 'Google', 'Chrome', 'Application', 'chrome.exe'))
    for path in candidates:
        try:
            if path and os.path.isfile(path):
                return path
        except Exception:
            pass
    return ''


class DPDebugger:
    def __init__(self, chrome_path: str, load_plugins: bool = False, plugin_names: Optional[List[str]] = None) -> None:
        self.chrome_path = chrome_path or ''
        self.load_plugins = load_plugins
        self.plugin_names = set(plugin_names or [])
        self.browser = None
        self.tab = None
        self.plugin_paths = []

        # Default browser path fallback
        if not self.chrome_path or not os.path.isfile(self.chrome_path):
            default_portable = os.path.join(ROOT, 'chrome', 'Chrome-bin', 'chrome.exe')
            if os.path.isfile(default_portable):
                self.chrome_path = default_portable
            else:
                auto = _detect_chrome_path()
                if auto:
                    self.chrome_path = auto

        if self.load_plugins:
            self._discover_plugins()

    def _discover_plugins(self) -> None:
        if not os.path.isdir(PLUGIN_DIR):
            logger.info('插件目录不存在: %s', PLUGIN_DIR)
            return
        for item in os.listdir(PLUGIN_DIR):
            p = os.path.join(PLUGIN_DIR, item)
            if os.path.isdir(p) and os.path.exists(os.path.join(p, 'manifest.json')):
                if self.plugin_names and item not in self.plugin_names:
                    continue
                self.plugin_paths.append(p)
        if self.plugin_names:
            logger.info('按白名单加载插件: %s', ', '.join(sorted(self.plugin_names)))
        logger.info('发现插件数量: %d', len(self.plugin_paths))

    def _create_options(self) -> ChromiumOptions:
        opt = ChromiumOptions()
        if self.chrome_path and os.path.isfile(self.chrome_path):
            opt.set_browser_path(self.chrome_path)

        # Performance / robustness
        if hasattr(opt, 'ignore_certificate_errors'):
            opt.ignore_certificate_errors()
        opt.set_pref('profile.managed_default_content_settings.images', 2)
        opt.set_pref('profile.default_content_setting_values.notifications', 2)
        opt.set_argument('--disable-gpu')
        opt.set_argument('--disable-features=VizDisplayCompositor')

        # Load extensions on demand
        if self.load_plugins and self.plugin_paths:
            for p in self.plugin_paths:
                try:
                    opt.add_extension(p)
                except Exception as e:
                    logger.warning('添加插件失败 %s: %s', p, e)
        return opt

    def start(self) -> None:
        logger.info('Starting browser...')
        self.browser = Chromium(self._create_options())
        self.tab = self.browser.latest_tab
        logger.info('Browser ready')

    def open(self, url: str, wait: float = 1.0) -> None:
        logger.info('Open: %s', url)
        self.tab.get(url)
        if wait > 0:
            time.sleep(wait)
        logger.info('Title: %s', self.tab.title)

    def inject_js_modules(self) -> None:
        files = ['module_manager.js', 'debug_utils.js', 'cookie_monitor.js', 'scroll.js']
        chunks: List[str] = []
        for fname in files:
            path = os.path.join(JS_DIR, fname)
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    code = f.read()
                chunks.append('\n/* ' + fname + ' */\n' + code + '\n')
                logger.info('加载 JS 模块: %s (%d 字符)', fname, len(code))
            else:
                logger.info('JS 模块缺失: %s', fname)
        if chunks:
            script = '\n'.join(chunks)
            self.tab.run_js(script)
            logger.info('Injected JS modules')

    def apply_js_config(self, cfg: Dict[str, Any]) -> None:
        if not cfg:
            return
        parts: List[str] = []

        cm = cfg.get('cookieMonitor') or {}
        if cm:
            ignore = cm.get('ignoreUnchanged', False)
            enable = cm.get('enableEvent', {"add": True, "update": True, "delete": True, "read": True})
            rules = cm.get('rules', [])
            rules_json = json.dumps(rules, ensure_ascii=False)
            enable_json = json.dumps(enable, ensure_ascii=False)
            js_cm = f"""
            if (window.DP_COOKIE_MONITOR) {{
                window.DP_COOKIE_MONITOR.ignoreUnchanged = {str(bool(ignore)).lower()};
                window.DP_COOKIE_MONITOR.enableEvent = {enable_json};
                (function() {{
                    var r = {rules_json};
                    r = r.map(function(x) {{
                        if (typeof x === 'string' && /^\/.+\/$/.test(x)) return new RegExp(x.slice(1, -1));
                        if (x && typeof x === 'object') {{
                            if (typeof x.name === 'string' && /^\/.+\/$/.test(x.name)) x.name = new RegExp(x.name.slice(1, -1));
                            if (typeof x.value === 'string' && /^\/.+\/$/.test(x.value)) x.value = new RegExp(x.value.slice(1, -1));
                        }}
                        return x;
                    }});
                    window.DP_COOKIE_MONITOR.setRules(r);
                }})();
            }}
            """
            parts.append(js_cm)

        du = cfg.get('debugUtils') or {}
        if du:
            intercept_xhr = bool(du.get('interceptXHR', False))
            intercept_fetch = bool(du.get('interceptFetch', False))
            dom_observer = bool(du.get('startDOMObserver', False))
            perf_ms = int(du.get('startPerformanceMonitorMs', 0) or 0)
            lines: List[str] = ["if (window.DP_DEBUG) {"]
            if intercept_xhr:
                lines.append("try{window.DP_DEBUG.interceptXHR();}catch(e){}");
            if intercept_fetch:
                lines.append("try{window.DP_DEBUG.interceptFetch();}catch(e){}");
            if dom_observer:
                lines.append("try{window.DP_DEBUG.startDOMObserver();}catch(e){}");
            if perf_ms and perf_ms > 0:
                lines.append(f"try{{window.DP_DEBUG.startPerformanceMonitor({perf_ms});}}catch(e){{}}");
            lines.append("}")
            parts.append("\n".join(lines))

        script = "\n".join(parts).strip()
        if script:
            self.tab.run_js(script)
            logger.info('Applied JS config')

    def start_listen(self, *patterns: str) -> None:
        pats = patterns or ('http',)
        self.tab.listen.start(*pats)
        logger.info('网络监听已启动: %s', list(pats))

    def drain_packets(self, timeout: float = 0.1):
        items: List[Any] = []
        try:
            for pkt in self.tab.listen.steps(timeout=timeout):
                items.append(pkt)
        except Exception as e:
            logger.debug('获取网络包失败: %s', e)
        return items

    def save_packet(self, pkt) -> None:
        try:
            info = {
                'time': datetime.now().isoformat(),
                'url': getattr(getattr(pkt, 'request', None), 'url', ''),
                'method': getattr(getattr(pkt, 'request', None), 'method', ''),
                'status': getattr(getattr(pkt, 'response', None), 'status', ''),
            }
            path = os.path.join(DATA_DIR, f'network_packets_{SESSION_ID}.jsonl')
            with open(path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(info, ensure_ascii=False) + '\n')
        except Exception as e:
            logger.debug('保存网络包失败: %s', e)

    def start_console(self) -> None:
        try:
            self.tab.console.start()
            logger.info('控制台日志监听已启动')
        except Exception as e:
            logger.warning('控制台日志监听启动失败: %s', e)

    def drain_console(self, timeout: float = 0.05) -> None:
        try:
            msg = self.tab.console.wait(timeout=timeout)
            if not msg:
                return
            text = getattr(msg, 'text', '')
            if text:
                logger.info('控制台: %s', text)
                path = os.path.join(LOG_DIR, f'console_logs_{SESSION_ID}.txt')
                with open(path, 'a', encoding='utf-8') as f:
                    f.write(text.replace('\r\n', '\n').replace('\r', '\n') + '\n')
        except Exception:
            pass

    def close(self) -> None:
        try:
            if self.browser:
                self.browser.quit()
                logger.info('浏览器已关闭')
        except Exception as e:
            logger.warning('关闭浏览器异常: %s', e)


def parse_args():
    p = argparse.ArgumentParser(description='DrissionPage 调试/注入工具')
    p.add_argument('--url', default=os.environ.get('DP_URL', 'about:blank'), help='目标 URL')
    p.add_argument('--inject', action='store_true', default=True, help='注入 JS 模块（默认启用）')
    p.add_argument('--no-inject', dest='inject', action='store_false', help='禁用 JS 注入')
    p.add_argument('--listen', action='store_true', default=False, help='启用网络监听')
    p.add_argument('--chrome', default=os.environ.get('DP_CHROME', os.path.join(ROOT, 'chrome', 'Chrome-bin', 'chrome.exe')), help='Chrome 路径')
    p.add_argument('--load-plugins', action='store_true', default=(os.environ.get('DP_LOAD_PLUGINS', '0') == '1'), help='加载 plugin/ 下的扩展')
    p.add_argument('--plugins', default='', help='仅加载指定插件，逗号分隔的目录名')
    default_cfg = DEFAULT_CONFIG_PATH if os.path.exists(DEFAULT_CONFIG_PATH) else ''
    p.add_argument('--config', default=default_cfg, help='配置文件路径(JSON)')
    return p.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config) if args.config else {}

    # Merge startup config (config has priority)
    startup = cfg.get('startup', {}) if isinstance(cfg, dict) else {}
    url = startup.get('url', args.url)
    inject = bool(startup.get('inject', args.inject))
    listen = bool(startup.get('listen', args.listen))
    chrome = startup.get('chrome', args.chrome)
    load_plugins = bool(startup.get('loadPlugins', args.load_plugins))
    plugin_names: List[str] = []
    if 'plugins' in startup and isinstance(startup['plugins'], list):
        plugin_names = [str(x) for x in startup['plugins']]
    elif args.plugins:
        plugin_names = [x.strip() for x in args.plugins.split(',') if x.strip()]

    logger.info('启动参数(合并配置): url=%s inject=%s listen=%s load_plugins=%s plugins=%s config=%s', url, inject, listen, load_plugins, ','.join(plugin_names) or '-', args.config or 'N/A')

    dbg = DPDebugger(chrome_path=chrome, load_plugins=load_plugins, plugin_names=plugin_names)
    try:
        dbg.start()
        dbg.open(url, wait=1.0)

        if inject:
            dbg.inject_js_modules()
            dbg.apply_js_config(cfg)
            dbg.start_console()

        if listen:
            dbg.start_listen('http')

        logger.info('工具就绪。按 Ctrl+C 退出。日志目录: %s', LOG_DIR)

        while True:
            if inject:
                dbg.drain_console(0.05)
            if listen:
                for pkt in dbg.drain_packets(0.05):
                    dbg.save_packet(pkt)
            time.sleep(0.1)
    except KeyboardInterrupt:
        logger.info('收到退出信号')
    finally:
        dbg.close()


if __name__ == '__main__':
    main()

