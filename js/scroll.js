// ===== 页面滚动辅助工具 =====
// 功能：平滑滚动到指定元素位置
// 适用场景：需要自动滚动到某个元素（如验证码、按钮等）时使用

// 查找目标元素
const captchaDiv = document.querySelector('.\\66 unction');

// 获取元素位置信息
const rect = captchaDiv.getBoundingClientRect();

// 计算目标滚动位置
const target = rect.top + window.scrollY;

// 获取当前滚动位置
let current = window.scrollY;

// 设置滚动参数
const step = 5;        // 每次滚动距离（像素）
const interval = 5;    // 滚动间隔时间（毫秒）

// 创建平滑滚动定时器
const scrollInterval = setInterval(() => {
    // 检查是否还未到达目标位置
    if (current < target) {
        // 继续向下滚动
        current += step;
        window.scrollTo(0, current); // 滚动到新位置（保持水平位置不变）
    } else {
        // 已到达或超过目标位置，停止滚动
        clearInterval(scrollInterval); // 清除定时器，停止滚动
    }
}, interval);