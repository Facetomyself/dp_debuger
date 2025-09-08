
//逆向代码



$(document).ready(function() {
    // 监听复选框的点击事件
    $('#sao_form input[type="checkbox"]').on('click', function() {
      // 获取复选框的 name 和是否被选中
      var checkboxName = $(this).attr('name');
      var isChecked = $(this).prop('checked');
      
      // 打印复选框的 name 和选中状态
    //   console.log('Checkbox name: ' + checkboxName + ', Checked: ' + isChecked);
      $("#result").append("Checkbox name:"+ checkboxName + ", Checked:"+ isChecked+"<br/>")
      if(checkboxName=='JSON.stringify'){
        if(isChecked){
            exe('HookBox.hook_json_stringify()');
        }
      }
      if(checkboxName=='JSON.parse'){
        if(isChecked){
            exe('HookBox.hook_json_parse()');
        }
      }
      if(checkboxName=='response.json'){
        if(isChecked){
            exe('HookBox.hook_res_json()');
        }
      }
      if(checkboxName=='response.text'){
        if(isChecked){
            exe('HookBox.hook_res_text()');
        }
      }
      if(checkboxName=='xhr'){
        if(isChecked){
            exe('HookBox.hook_xhr()');
        }
      }




    });
  });



function exe(str){
    chrome.devtools.inspectedWindow.eval(str);
};

function show_result(str){
    $("#iframe_res").text(str+"\n") 
}


window.addEventListener("message", function(event) {
  // 检查来源是否可信
  if (!event.origin.includes("wxhzh")) {
    console.log("Ignored message from untrusted source");
    console.log(event);
    return;
  }

  // 输出接收到的消息
  // console.log("Received message from iframe:", event.data);
  


  const  d  = event.data;
  
  if (d.JSONParse) {
    exe(d.JSONParse);
    show_result(d.JSONParse);
  }

  if (d.JSONStringify) {
    exe(d.JSONStringify);
    show_result(d.JSONStringify);
  }
 
}, false);
