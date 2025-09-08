const $inputField = $('#inputField');
const $textareaField = $('#textareaField');
const $log = $('#log');

// 用于记录输入和时间的函数
function logEvent(eventType, element, value) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Event: ${eventType}, Input from "${element.tagName}" (${element.id}): "${value}"`;
    $log.text(logMessage + "\n" + $log.text());
}

// 监听 text input (input 和 keyup 事件)
$inputField.on('keydown keyup input', function(event) {
    logEvent(event.type, $(this), $(this).val());
});

// 监听 textarea input
$textareaField.on('keydown keyup input', function(event) {
    logEvent(event.type, $(this), $(this).val());
});

// 如果你想监听整个页面的键盘操作，可以监听 document
$(document).on('keydown', function(event) {
    const key = event.key;  // 获取按下的键
    console.log(`Key pressed: ${key}`);
});
