
// var sao_2=document.getElementById('sao2');
// var history_json=[];
// var count=0;


// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     // 接受 content.js 发送的消息
//     if (message.cebianlan) {
//         sao_2.innerHTML = message.cebianlan;
//     }
//     if (message.cebianlan_f9) {
//         // document.getElementById('zidingyi2').innerHTML = message.cebianlan_f9;
//         data=JSON.parse(message.cebianlan_f9);
//         // 使用 unshift 方法在数组开头插入新数据
//         let DP_语法=jsonToDP_String(data);
//         DP_语法=DP_语法.replace('tagName=','t:').replace('innerText=','text()=').toLowerCase();
//         history_json.unshift({'序号':count++,'DP完整官方语法':DP_语法});


//         //动态创建复选框
//         createCheckboxesFromJSON(data);
//         //更新 侧边栏页面的Drissionpage的语法内容
//         updateZidingyi_div();
//         createTableFromJson(history_json);
//     }
// });


//------------------------- 配置管理-----------
const sidePanelConfigBox = {
  async get(str) {
      return new Promise((resolve, reject) => {
          chrome.storage.local.get([str], function(result) {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  console.log(str+'--> currently is ' + result[str]);
                  resolve(result[str]);
              }
          });
      });
  },
  async set(str, value) {
      return new Promise((resolve, reject) => {
          chrome.storage.local.set({ [str]: value }, function() {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  console.log(str+'--> is set to ' + value);
                  resolve();
              }
          });
      });
  },
};


//----------表格生成

function displayArrayAsTable(data) {
  // 获取目标 div 元素
  const $container = $('#history_json');
  
  // 创建表格元素
  let $table = $('<table>').attr('border', '1'); // 设置表格边框

  // 创建表头行
  const headers = Object.keys(data[0]); // 获取数组中第一个对象的键作为表头
  let $headerRow = $('<tr>'); // 创建表头行
  headers.forEach(header => {
    $headerRow.append($('<th>').text(header)); // 创建表头单元格并添加
  });
  $table.append($headerRow); // 添加表头到表格

  // 创建数据行
  data.forEach(item => {
    let $row = $('<tr>'); // 创建一行
    headers.forEach(header => {
        if(header=="语法"){
            $row.append($('<td class="yufa">').text(item[header])); 
        }else{

            $row.append($('<td>').text(item[header])); // 为每列添加数据
        }
    });
    $table.append($row); // 将行添加到表格
  });

  // 清空容器并将表格添加到容器中
  $container.empty(); // 清空原有内容
  $container.append($table); // 将表格添加到容器
}




//--------------------监听语法点击
$(document).on('click', '.yufa', function() {
  let yufa=$(this).text();
//   console.log(yufa);
  sidePanelTools.copyToClipboard(yufa);
  alert('⏱️历史记录复制成功 \n'+yufa);
});


//-------------------------获取历史记录
async function getHistory() {

  let h=await sidePanelConfigBox.get('元素复制历史');
  // h=JSON.stringify(h);
  // $("#history_json").text(h);
  displayArrayAsTable(h);
  
}

getHistory();


//------------------------- 历史记录管理-----------
$("#update_history").on('click',getHistory);
$("#clear_history").on('click',async function(){
  await sidePanelConfigBox.set('元素复制历史',[{"序号":0,"语法":"0", "时间":"0","类型":"0"},]);
  getHistory();
});

//------------------------- 标签页监听器-----------
const TabListener = {

  listen_content() {
      // 监听来自 content 页面的消息
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          if (request.from === "content" && request.to == "sidepanel" && request.action === "更新状态") {
              // 在这里处理接收到的消息
              console.log("Received message from content: " ,request);
              getHistory();      
          };
       
      });
  },
  send(data={},action="更新状态",to="popup"){
    chrome.runtime.sendMessage({
        from: "sidepanel",
        to: to,
        action: action,
        data: data,
    });
}


};


TabListener.listen_content();


//------------------工具函数
const sidePanelTools={
    copyToClipboard(text) {
        // 存储到数组
        
        // 创建一个隐藏的 textarea 元素
        const textarea = document.createElement('textarea');
        
        // 将待复制的文本设置为 textarea 的值
        textarea.value = text;
    
        // 将 textarea 元素加入到 DOM 中
        document.body.appendChild(textarea);
    
        // 选中 textarea 中的文本
        textarea.select();
        
        // 执行复制操作
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    
        // 复制后移除 textarea 元素
        document.body.removeChild(textarea);
    },
}
