
// 添加复制事件监听器


const copyBTN2 = document.getElementById('copyButton2');
copyBTN2.addEventListener('click', () => {
    copyToClipboard('xuanze_info', copyBTN2, '复制成功', '复制语法');
    flashBackgroundById2('xuanze_info');
});

// xpath 输入框 复制按钮 监听部分
document.getElementById('copyButton3').addEventListener('click', function () {
    // 直接使用this获取DOM元素
    var copyBTN3 = this;
    copyToClipboard('xpath_info2', copyBTN3, '复制成功', '复制');
});

// 添加xpath to  ele
$("#xpathToPython0").click(function() {     
    const code = window.xpath_info;
    $('#xpath_info2').val(code);
});
$("#xpathToPython1").click(function() {     
    const code = `tab.ele('x:${window.xpath_info}')`;
    $('#xpath_info2').val(code);
});
$("#xpathToPython2").click(function() {     
    const code = `tab.eles('x:${window.xpath_info}')`;
    $('#xpath_info2').val(code);
});
$("#xpathToPython3").click(function() {     
    const code = `tab.ele('x:${window.xpath_info}').click()`;
    $('#xpath_info2').val(code);
});




function flashBackgroundById2(elementId) {
    // 获取目标元素
    var $element = $('#' + elementId);

    // 确保元素存在
    if ($element.length) {
        // 获取原始背景颜色
        var originalColor = $element.css('background-color');

        // 执行闪烁动画
        $element.animate({ backgroundColor: 'gray' }, 200)
            .animate({ backgroundColor: originalColor }, 200)
            .animate({ backgroundColor: 'gray' }, 200)
            .animate({ backgroundColor: originalColor }, 200);
    }
}




//  关于 拖放文本域 的代码

// 获取页面上的拖放区域和文本域元素
// const dropZone = document.getElementById('drop_zone');
const dropZone = document.getElementById('sao_textarea');
const textarea = document.getElementById('sao_textarea');

// 为拖放区域添加拖放经过事件监听器
dropZone.addEventListener('dragover', (event) => {
    // 阻止默认动作
    event.preventDefault();
    // 设置拖放效果为复制
    event.dataTransfer.dropEffect = 'copy';
    // 为拖放区域添加拖放经过样式
    dropZone.classList.add('dragover');
});

// 为拖放区域添加拖放离开事件监听器
dropZone.addEventListener('dragleave', () => {
    // 移除拖放区域的拖放经过样式
    dropZone.classList.remove('dragover');
});

// 为拖放区域添加拖放释放事件监听器
dropZone.addEventListener('drop', (event) => {
    // 阻止默认动作
    event.preventDefault();
    // 移除拖放区域的拖放经过样式
    dropZone.classList.remove('dragover');

    // 获取拖放的文件
    const file = event.dataTransfer.files[0];
    // 如果有文件
    if (file) {
        // 创建一个文件读取器
        const reader = new FileReader();
        // 当文件读取完成时
        reader.onload = (e) => {
            // 将读取的文件内容设置为文本域的值
            textarea.value = e.target.result;
        };
        // 读取文件内容为文本
        reader.readAsText(file);
    }
});






function updateTextAreaValueById(textAreaId, newValue) {
    // 获取指定 id 的 textarea 元素
    var textArea = document.getElementById(textAreaId);

    // 检查 textarea 元素是否存在
    if (textArea) {
        // 更新 textarea 的值
        textArea.value = newValue;
    } else {
        console.error('没有找到 id 为 ' + textAreaId + ' 的 textarea 元素');
    }
}







