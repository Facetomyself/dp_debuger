const initCode = `
js_code='''
return (async (url) => {
    const response = await fetch(url);
    const data = await response.json();    
    return data;
})("网址");
'''  
json_data=tab.run_js(js_code)`;
        
$(document).ready(function() {
    // 存储生成的代码
    let currentGeneratedCode = initCode;
    
    // 初始化文本区域
    // $('#fetch_code').val(currentGeneratedCode);
    
    // 输入事件处理
    $('#fetch_url').on('input', function() {
        console.log('当前输入值:', $(this).val());
        currentGeneratedCode = initCode.replace(/网址/g, $(this).val());
        $('#fetch_code').val(currentGeneratedCode);
    });
    
    // 复制按钮处理
    $('#copy_button').click(function() {
        // 使用当前存储的代码
        var $temp = $('<textarea>');
        $('body').append($temp);
        $temp.val(currentGeneratedCode).select();
        document.execCommand('copy');
        $temp.remove();
        alert('已复制到剪贴板: ' + currentGeneratedCode);
    });
});