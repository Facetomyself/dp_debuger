// const $switch_btn= $('#switch_logger');
const $log = $('#log');
const $coder = $('#coder');
const $start_btn= $('#start_btn');
var first_time=true;


window.init_code=`  
#!/usr/bin/env python
# -*- coding:utf-8 -*-

from DrissionPage import Chromium
browser= Chromium()
tab=browser.new_tab()
tab.set.window.size(宽,高)
tab.get("网址") 
`
//初始化代码
chrome.devtools.inspectedWindow.eval(
    'JSON.stringify({url:window.location.href,kuan:window.outerWidth,gao:window.outerHeight}) ',  // 执行的 JavaScript 表达式
    function(result, isException) {  // 回调函数，处理返回的结果
      if (isException) {
        console.error('Error evaluating expression:', result);
      } else {
        // alert('Current URL:'+result);  // 输出当前网页的 URL
        let j=JSON.parse(result);
        init_code=init_code.replace("网址",j.url).replace("宽",j.kuan).replace("高",j.gao);
        $coder.text(init_code );        
        
        first_time=false;

      }
    }
  );
  





// ---------------监听来自background.js的消息

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === '转发消息到键鼠记录器') {
    console.log('Received message from content.js through background.js:', message.data);
    let json_message=JSON.parse(message.data);
                
    if(first_time){
        $coder.text(init_code );
        update_logger(message.data);
        update_coder(json_message);
        first_time=false;
    }else{

        update_logger(message.data);
        update_coder(json_message);
    }
  }
});




function update_logger(logMessage){
    $log.text(logMessage + "\n" + $log.text());
}


function update_coder(json_info){    
    let a=$coder.text();
    let b=translate_to_code(json_info);
    $coder.text(a + "\n" +  b);
}


function translate_to_code(json_data) {
  const j = json_data;

  if (j.type == "click") {
    let a = "";
    if (j.isSizeChanged )
      a = `tab.set.window.size(${j.windowWidth+12}, ${j.windowHeight})` + "\n";   // 13    -4

    let b = `tab.actions.wait(0.5).move_to((${j.mouseX},${j.mouseY})).click()`; 
    let c = a + b;
    return c;
  }

  if (j.type == "input") {
    let a = "";
    if (j.isSizeChanged )
      a = `tab.set.window.size(${j.windowWidth}, ${j.windowHeight})` + "\n";
    let b = `tab.actions.wait(0.5).type("${j.inputValue}")`;
    let c = a + b;
    return c;
  }
}


// 启动按钮代码

$start_btn.click(function () {
  // 在这里执行你想要的操作
  $(this).text("开启录制")
  // alert("已开始录制")
  // 向 background.js 发送消息
  chrome.runtime.sendMessage({ action: '键鼠记录器发送消息到content-打开记录器', data: true });
 }

);

$start_btn.click()


//复制按钮代码
$(document).ready(function() {
    $('#copy_btn').click(function() {
        // 获取要复制的文本
        var text = $('#coder').text();

        // 创建一个临时的textarea元素
        var tempTextArea = $('<textarea>').val(text).appendTo('body');

        // 选中textarea中的内容
        tempTextArea.select();
        tempTextArea[0].setSelectionRange(0, 99999);  // 支持移动设备

        // 执行复制操作
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                // alert("已复制到剪贴板!");
                $('#copy_btn').text("复制成功");
                setTimeout(function() {
                    $('#copy_btn').text("复制");
                }, 1000);
            } else {
                alert("复制失败！");
            }
        } catch (err) {
            console.error('执行复制时出错:', err);
        }

        // 移除临时textarea元素
        tempTextArea.remove();
    });
});





