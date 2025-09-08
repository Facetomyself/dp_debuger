



// 对话框设置
// 初始化对话框
$("#dialog").dialog({
    // 设置对话框宽度为300像素
    width: 300,
    // 禁止对话框自动打开
    autoOpen: false,
    // 启用模态模式，阻止与页面其他部分的交互
    modal: true,
    // 设置对话框位置为顶部居中
    position: { my: "top", at: "top", of: window },
    // 定义对话框打开时的回调函数
    open: function () {
        // 动态修改遮罩层的样式
        $(".ui-widget-overlay").css({
            // 设置遮罩层背景色为半透明黑色
            "background": "rgba(50, 0, 0, 0.5)"
        });
    }
});


// 为按钮绑定点击事件
$("#opener").click(function () {
    // 打开对话框
    $("#dialog").dialog("open");
    // 调用初始化函数
    chuShiHua();
});

// 初始化函数
function chuShiHua() {
    // 定义变量a，初始值为'tab'
    // let a = $("#tab_input").val()
    let a = 'tab'
    // 定义变量b，获取输入框的值
    let b = $("#ele_input").val()
    // 定义变量c，获取选择框的值
    let c = $("#xuanze_info").val()
    // 定义变量d，将a、b、c拼接成一个字符串
    let d = `${b}=${a}.ele("${c}")`;
    // 将拼接后的字符串设置到指定元素中
    $("#zancun_div").text(d);
}


// 为取消按钮绑定点击事件
$("#sao_dialog_cancel").click(function () {
    // 关闭对话框
    $("#dialog").dialog("close");
});

// 为确认按钮绑定点击事件
$("#sao_dialog_confirm").click(function () {
    // 关闭对话框
    $("#dialog").dialog("close");
    // 获取文本域的值
    let a =  $("#sao_textarea").val()
    // 获取指定元素的文本内容
    let b= $("#zancun_div").text()
    // 将获取到的内容进行拼接
    let c = `${a}\n${b}`
    // 将拼接后的内容设置到文本域中
    $("#sao_textarea").val(c)
});


// 监听输入框变化事件
$("#ele_input").on("input", function() {
    // 获取并打印改变后的值
   chuShiHua();
  });
// 监听鼠标悬浮事件
$("#ele_input").on("mouseover", function() {
    // 当鼠标悬浮时，设置输入框的焦点
    this.focus();
});


// 为包含文本 "复制所有" 的 a 标签绑定点击事件
$('a:contains("复制所有")').on('click', function() {
    // 获取 id 为 sao_textarea 的文本域
    let textarea = $('#sao_textarea')[0];

    // 选中文本域中的所有文本
    textarea.select();

    // 执行复制命令
    document.execCommand('copy');

    // 修改按钮文本为 "复制成功"
    this.innerText = '复制成功';

    // 1500 毫秒后，将按钮文本改回 "复制所有"
    setTimeout(() => {
        this.innerText = '复制所有';
    }, 1500);
});

// 为包含文本 "清空所有" 的 a 标签绑定点击事件
$('a:contains("清空所有")').on('click', function() {
    // 获取 id 为 sao_textarea 的文本域
    let textarea = $('#sao_textarea')[0];

    // 清空文本域中的所有文本
    $('#sao_textarea').val('');
});
