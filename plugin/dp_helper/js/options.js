// 初始化 info 数组，直接将需要的属性添加到数组中
const info = [
    chrome.runtime.PlatformArch,
    chrome.runtime.ExtensionContext,
    chrome.runtime.MessageSender,
    chrome.runtime.PlatformOs,
    chrome.runtime.RequestUpdateCheckStatus,
    chrome.runtime.id
];

// 遍历 info 数组，将每个元素转换为 JSON 字符串，并调用 addLabel 函数
info.forEach((item) => {
    try {
        // 将元素转换为 JSON 字符串
        const jsonItem = JSON.stringify(item);
        // 调用 addLabel 函数添加标签
        addLabel(jsonItem);
    } catch (error) {
        // 处理 JSON.stringify 可能出现的错误
        console.error(`Error converting item to JSON: ${error.message}`);
    }
});

// 定义 addLabel 函数，用于创建并添加 label 元素
function addLabel(labelText) {
    // 创建 label 元素
    const label = document.createElement("label");
    // 设置 label 的文本内容
    label.textContent = labelText;
    // 将 label 元素添加到指定的 DOM 节点中
    $("#BrowserInfo div:first").append(label);
    return label;
}


//--------------
    // 刷新按钮点击事件
    $('#refresh').on('click', function() {
        location.reload();
    });

// 使用jQuery的文档就绪函数替代DOMContentLoaded
$(function() {
    // 选项卡切换功能
    $('.tab').on('click', function() {
        // 移除所有选项卡和内容的激活状态
        $('.tab, .tab-content').removeClass('active');
        
        // 添加当前选项卡激活状态
        $(this).addClass('active');
        
        // 显示对应的内容区域
        const targetId = $(this).data('tab'); // 使用jQuery的data方法获取属性
        $(`#${targetId}`).addClass('active');
    });

    // 通用事件监听器（jQuery内置支持多元素绑定，无需单独封装）
    // 复选框监听
    $('input[type="checkbox"]').on('change', function() {
        // 使用jQuery方法获取父元素和文本内容
        console.log('Checkbox changed:', this.checked, $(this).parent().text().trim());
    });

    // 数字输入框监听
    $('input[type="number"]').on('input', function() {
        console.log('Number input changed:', this.value);
    });

    // 单选框监听
    $('input[type="radio"]').on('change', function() {
        if(this.checked) {
            // 使用jQuery方法获取值和父元素文本
            console.log('Radio selected:', this.value || $(this).parent().text().trim());
        }
    });

    // 文本域监听
    $('textarea').on('input', function() {
        // 直接使用原生value属性，jQuery的val()也可以
        console.log('Textarea updated:', this.value.substring(0, 20) + '...');
    });

    // 文本输入框监听
    $('input[type="text"]').on('input', function() {
        console.log('Text input changed:', this.value);
    });

    // 下拉菜单监听
    $('select').on('change', function() {
        console.log('Select changed:', this.value);
    });
});