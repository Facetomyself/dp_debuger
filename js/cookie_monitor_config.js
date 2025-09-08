// Cookie Monitor 配置示例
// 将此文件的内容添加到 cookie_monitor.js 中的 debuggerRules 数组中

// 示例配置：
// const debuggerRules = [
//     // 1. 简单的字符串匹配 - 当cookie名称等于"session"时断点
//     "session",
//
//     // 2. 正则表达式匹配 - 当cookie名称匹配"user_\d+"时断点
//     /user_\d+/,
//
//     // 3. 高级配置 - 指定事件类型和匹配条件
//     {
//         "events": "add | update",  // 只监控添加和更新事件
//         "name": "auth_token",      // cookie名称
//         "value": /^eyJ/           // cookie值以"eyJ"开头（JWT token特征）
//     },
//
//     // 4. 监控特定值的cookie
//     {
//         "events": "update",
//         "value": /admin/i  // cookie值包含"admin"
//     }
//
//     // 5. 监控所有删除操作
//     {
//         "events": "delete"
//     }
// ];

// 当前配置（空配置表示不设置断点，但会显示所有cookie操作日志）
// 修改 debuggerRules 数组来启用断点功能
const debuggerRules = [
    // 在这里添加你的断点规则
    // 例如：
    // "session",           // 当设置名为session的cookie时断点
    // /token_\d+/,         // 当cookie名匹配token_数字时断点
    // {"events": "add", "name": "auth"}  // 当添加auth cookie时断点
];

// 使用说明：
// 1. 将上面的 debuggerRules 配置复制到 cookie_monitor.js 文件中
// 2. 修改其中的规则来匹配你想要监控的cookie
// 3. 当JavaScript代码触发匹配的cookie操作时，会自动进入debugger断点
// 4. 在浏览器的开发者工具中查看调用栈，找到设置cookie的代码位置
