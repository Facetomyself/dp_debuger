# DrissionPage 逆向调试工具集

一个强大的网页自动化和逆向工程调试工具集，基于 DrissionPage 框架，支持网络监听、插件扩展、Cloudflare绕过等高级功能。

## 🚀 核心功能

### 逆向调试功能
- 🔍 **网络监听**：实时捕获和分析所有网络请求/响应
- 📊 **数据包分析**：自动解析并保存网络数据包
- 🎯 **Cookie监控**：跟踪所有Cookie操作和变化
- 📝 **控制台日志**：捕获浏览器控制台输出
- 🌐 **DOM监听**：实时监控页面元素变化

### 插件系统
- 🔧 **AntiDebug Breaker**：绕过网站的反调试机制
- 🛠️ **DP Helper**：强大的开发者工具扩展
- 📦 **模块化设计**：支持自定义插件开发

### 高级特性
- 🎮 **自动化脚本**：支持复杂的网页自动化操作
- 📈 **数据导出**：多种格式的数据保存和导出
- 🛡️ **异常处理**：完善的错误恢复机制
- 🔄 **多线程处理**：支持并发任务执行

## 📦 安装说明

### 环境要求
- Python 3.7+
- Windows 10/11
- Chrome/Chromium 浏览器

### 快速安装

1. **克隆项目**
```bash
git clone https://github.com/Facetomyself/dp_debuger
cd DrissionPage
```

2. **创建虚拟环境**
```bash
# 使用conda
conda create -n drissionpage python=3.9
conda activate drissionpage

# 或使用venv
python -m venv venv
venv\Scripts\activate  # Windows
```

3. **安装依赖**
```bash
# 安装DrissionPage
pip install DrissionPage

# 或从源码安装（推荐）
pip install git+https://github.com/g1879/DrissionPage.git
```

4. **配置浏览器路径**
编辑 `dp_debug.py` 中的浏览器路径：
```python
co.set_browser_path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
```

## 🛠️ 使用方法

### 快速开始

1. **启动逆向调试工具**
```bash
python dp_debug.py
```

### 高级用法

#### 自定义浏览器配置
```python
from DrissionPage import ChromiumOptions

co = ChromiumOptions()
co.headless(False)                    # 显示浏览器窗口
co.set_argument('--start-maximized')  # 最大化窗口
co.set_argument('--ignore-certificate-errors')  # 忽略证书错误
co.set_local_port('9222')             # 指定调试端口
co.set_browser_path(r"path\to\browser.exe")  # 指定浏览器路径
```

#### 网络监听和数据保存
```python
from dp_debug import DrissionPageDebug

debugger = DrissionPageDebug()
debugger.start_monitoring()

# 自动保存到 data/network_packets_[session_id].jsonl
```


## 📁 项目结构

```
DrissionPage/
├── dp_debug.py           # 主调试工具
├── cloudflare/           # Cloudflare绕过工具
│   ├── main.py          # 主程序
│   └── helper.py        # 辅助函数
├── chrome/              # Chrome浏览器环境
│   ├── Chrome-bin/     # Chrome可执行文件
│   └── chromedriver.exe # WebDriver
├── plugin/              # Chrome扩展插件
│   ├── AntiDebug_Breaker-main/  # 反调试绕过插件
│   └── dp_helper/       # 开发者工具插件
├── js/                  # JavaScript工具脚本
│   ├── cookie_monitor.js     # Cookie监控
│   ├── debug_utils.js        # 调试工具
│   └── module_manager.js     # 模块管理器
├── data/                # 数据存储目录
│   └── network_packets_*.jsonl  # 网络数据包
├── logs/                # 日志文件目录
│   ├── console_logs_*.txt    # 控制台日志
│   └── dp_debug_*.log        # 调试日志
├── README.md           # 项目文档
└── .gitignore         # Git忽略文件
```

## 🔧 配置选项

### 环境变量
```bash
# 设置代理（如果需要）
export http_proxy=http://proxy.example.com:8080
export https_proxy=http://proxy.example.com:8080

# 或清除代理
unset http_proxy
unset https_proxy
```

### 配置文件
项目支持以下配置文件：

- `config/browser.json` - 浏览器配置
- `config/plugins.json` - 插件配置
- `config/logging.json` - 日志配置

## 📊 数据格式说明

### 网络数据包格式
```json
{
  "timestamp": "2024-01-01 12:00:00",
  "url": "https://example.com/api/data",
  "method": "GET",
  "status_code": 200,
  "request_headers": {...},
  "response_headers": {...},
  "body_size": 1024,
  "response_size": 2048,
  "content_type": "application/json",
  "body_sample": "{\"data\": \"example\"}"
}
```

### Cookie监控数据格式
```json
{
  "timestamp": "2024-01-01 12:00:00",
  "action": "set",
  "domain": "example.com",
  "name": "session_id",
  "value": "abc123...",
  "path": "/",
  "expires": "2024-12-31T23:59:59Z",
  "httpOnly": false,
  "secure": true
}
```

### 控制台日志格式
```
[2024-01-01 12:00:00] [INFO] 页面加载完成
[2024-01-01 12:00:01] [ERROR] JavaScript错误: TypeError: Cannot read property
[2024-01-01 12:00:02] [WARN] 网络请求失败，重试中...
```

## 🐛 常见问题

### 浏览器启动失败
**问题**: `FileNotFoundError: 无法找到浏览器可执行文件路径`

**解决方法**:
1. 检查浏览器路径是否正确
2. 确保浏览器已安装且路径存在
3. 尝试使用绝对路径

### 网络连接问题
**问题**: pip安装时出现代理错误

**解决方法**:
1. 使用国内镜像源
2. 清除代理设置
3. 使用VPN或直接连接

### 数据格式错误
**问题**: JSON文件中出现格式错误

**解决方法**:
1. 检查数据中是否包含特殊字符
2. 使用最新的数据清理功能
3. 查看日志文件了解具体错误

## 📈 性能优化

### 内存优化
- 定期清理过期的数据包
- 使用流式处理大文件
- 合理设置缓存大小

### 网络优化
- 使用连接池复用连接
- 设置合理的超时时间
- 实现重试机制

## 🙏 致谢

- [DrissionPage](https://github.com/g1879/DrissionPage) - 核心自动化框架
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) - 浏览器调试协议
- 所有开源贡献者和社区成员


