# DrissionPage 网络数据采集项目

一个基于 DrissionPage 的强大网络数据采集和逆向调试工具集，支持网页自动化、数据采集、API监控等功能。

## 🚀 功能特性

### 核心功能
- ✅ **网页自动化**：基于 Chromium 的完整浏览器自动化支持
- ✅ **网络监听**：实时捕获和记录所有网络请求
- ✅ **控制台日志**：自动捕获浏览器控制台输出
- ✅ **DOM变化监听**：实时监控页面元素变化
- ✅ **Cookie监控**：跟踪所有Cookie操作
- ✅ **数据导出**：支持多种数据格式导出

### 高级特性
- 🔍 **逆向调试**：完整的网络数据包分析工具
- 📊 **数据统计**：实时统计和报告生成
- 🎯 **插件系统**：可扩展的Chrome插件支持
- 🛡️ **异常处理**：完善的错误处理和恢复机制
- 📝 **日志管理**：结构化日志记录和分析

## 📦 安装说明

### 环境要求
- Python 3.7+
- Windows 10/11
- Chrome/Chromium 浏览器

### 快速安装

1. **克隆项目**
```bash
git clone <repository-url>
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
编辑 `dp_google.py` 中的浏览器路径：
```python
co.set_browser_path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
```

## 🛠️ 使用方法

### 基本使用

1. **Google学术数据采集**
```python
from ScholarDataCollector import ScholarDataCollector

collector = ScholarDataCollector()
scholars_data = collector.collect_scholars_data(max_pages=10)
collector.save_data(scholars_data)
```

2. **逆向调试工具**
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
from DrissionPageDebug import DrissionPageDebug

debugger = DrissionPageDebug()
debugger.start_monitoring()

# 自动保存到 data/network_packets_[session_id].jsonl
```

## 📁 项目结构

```
DrissionPage/
├── dp_google.py          # Google学术数据采集器
├── dp_debug.py           # 逆向调试工具
├── data/                 # 数据存储目录
│   └── network_packets_*.jsonl  # 网络数据包
├── logs/                 # 日志文件目录
├── plugin/               # Chrome插件目录
├── js/                   # JavaScript工具脚本
├── README.md            # 项目文档
└── .gitignore          # Git忽略文件
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

### 学者数据格式
```json
{
  "name": "学者姓名",
  "citations": 1234,
  "affiliation": "所属机构",
  "homepage": "https://scholar.google.com/...",
  "page": 1,
  "index": 1
}
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

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **项目维护者** - [您的名字]
- **贡献者** - 社区贡献者

## 🙏 致谢

- [DrissionPage](https://github.com/g1879/DrissionPage) - 核心自动化框架
- [Google Scholar](https://scholar.google.com) - 数据来源
- 所有贡献者和测试者

## 📞 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
