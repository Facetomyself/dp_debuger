# DrissionPage 逆向调试与调试辅助

基于 DrissionPage 的网页自动化与逆向调试辅助工具。提供可插拔的 JS 注入、控制台日志采集、网络抓包（JSONL）等能力，默认入口为 `dp_debug.py`，无需 PowerShell 启动脚本。

## 环境与安装
- 要求：Windows 10/11、Python 3.8+、已安装 Chrome/Edge/Chromium（自动探测，或通过环境变量 `DP_CHROME` 指定路径）。
- 安装依赖：`pip install DrissionPage`

## 快速开始
```powershell
python dp_debug.py --url https://example.com --listen --log-level INFO
```
- 常用选项：
  - `--headless`（无头）、`--devtools`（自动打开 DevTools）、`--user-data-dir <目录>`、`--proxy http://127.0.0.1:7890`
  - `--inject/--no-inject` 控制 JS 模块注入；`--js a.js,b.js` 注入额外 JS（相对 `js/` 或绝对路径）
  - `--listen` 启用网络抓包；`--listen-patterns http,ws` 指定类型；`--save-network data\packets.jsonl` 指定输出文件

## 网络抓包（可配细节）
- 过滤：`--net-include "api.example.com,/\/login\//"`，`--net-exclude "static.example.com"`
- 类型过滤：`--net-content-types "application/json,text/plain"`
- 内容控制：`--net-headers/--no-net-headers`，`--net-bodies/--no-net-bodies`（默认不抓取 body）
- 截断：`--max-body-chars 4096`（超过部分以 `...[TRUNCATED]` 标记）
- 脱敏：`--redact-headers "authorization,proxy-authorization,cookie,set-cookie"`

示例：
```powershell
python dp_debug.py --listen --net-bodies --max-body-chars 8192 `
  --net-include api.example.com --net-content-types application/json `
  --save-network data\network_packets.jsonl
```

## 配置文件（可选）
`config/dp_debug.json` 支持覆盖命令行参数。关键节：
```json
{
  "startup": {
    "url": "https://example.com",
    "inject": true,
    "listen": true,
    "chrome": "",
    "headless": false,
    "devtools": true,
    "jsFiles": ["debug_utils.js"],
    "listenPatterns": ["http", "ws"],
    "saveNetwork": "data/network_packets.jsonl",
    "logLevel": "DEBUG",
    "timeout": 0
  },
  "network": {
    "include": ["api.example.com", "/login/"],
    "exclude": [],
    "contentTypes": ["application/json"],
    "headers": true,
    "bodies": false,
    "maxBodyChars": 4096,
    "redactHeaders": ["authorization", "cookie", "set-cookie"]
  }
}
```

## 输出与目录
- 日志：`logs/dp_debug_<session>.log`，控制台：`logs/console_logs_<session>.{txt,jsonl}`
- 抓包：`data/network_packets_<session>.jsonl`
- 主要目录：`dp_debug.py`、`js/`（注入脚本）、`plugin/`（浏览器扩展）、`config/`（示例配置）

## 常见问题
- DrissionPage 导入失败：执行 `pip install DrissionPage`；或升级 Python 与 pip。
- 找不到浏览器：设置环境变量 `DP_CHROME` 指向 `chrome.exe`/`msedge.exe`，或将可执行文件放在 `chrome/Chrome-bin/`。

