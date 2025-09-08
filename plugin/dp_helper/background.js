
// 初始设置
const SaoConfig={
    "yuananniu_show":true,
    "version":"9.1",
    "color":"blue",
    "是否显示浮窗":true,
    "是否显示固定浮窗":true,
    "是否开启键鼠记录器":true,
    "welcome":"骚神 DP_helper 插件安装成功!",
    "元素复制历史":[{"序号":0,"语法":"0", "时间":"0","类型":"0"},],
    "键鼠动作记录历史":["#代码录制"],
    "键鼠动作记录开关":false,
    "latest_page_url":"https://www.baidu.com/",
};

//---------------------------------更新logo和版本号---
const updateNameAndVersion = () => {
    // 更新插件名和版本号
    let app_name = chrome.i18n.getMessage("manifest_name");
    let app_version = chrome.i18n.getMessage("manifest_version");
    SaoConfig.name=app_name;
    SaoConfig.version=app_version;
    
};

updateNameAndVersion();



//设置版本号
chrome.action.setBadgeText({ text:SaoConfig.version });
//设置背景色
chrome.action.setBadgeBackgroundColor({ color: SaoConfig.color });




//------------------------------ 永久储存对象 初始化


chrome.runtime.onInstalled.addListener( async function(details) {
    if (details.reason === 'install' || details.reason === 'update' ) {
        // hook_response_json();
        console.log('首次安装');
        
        chrome.storage.local.set(SaoConfig, function () {
            console.log('永久存储对象 yuananiu_show 已经初始化');
                       
        });
        chrome.storage.local.get(['welcome'], function (result) {
            console.log('Value currently is' + result.welcome);
            Tools.new_alert(result.welcome);
        });
        

    } else {
        console.log('早已安装');
    }
    
});

//------------------------------ 工具函数

const Tools={
   new_alert(str){
        chrome.notifications.create(null, {
            type: 'image',
            iconUrl: 'img/saoshen2.png',
            title: '系统提示',
            message: str,
            imageUrl: 'img/saoshen2.png'
        });
    },

}


//#region 右键菜单
//------------------------------ 右键菜单
// 检查是否已存在具有相同 ID 的菜单项,如果有就清空

chrome.contextMenus.removeAll(
);

// 创建新的右键菜单  一级菜单
create_right_menu();

function create_right_menu() {



    chrome.contextMenus.create({
        id: "youdao",
        title: "有道翻译",
        contexts: ["selection"],
       
    });

    chrome.contextMenus.create({
        id: "copyDP",
        title: "复制 Drissionpage完整语法",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "copyXpath",
        title: "复制 Xpath语法",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "autoFill",
        title: "自动填表",
        contexts: ["all"]
    });

};

// 根据菜单项ID调用不同的函数// 根据菜单项ID调用不同的函数
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const functions = {
        "copyDP": copyDP,
        "copyXpath": copyXpath,
        "autoFill": autoFill,     

        "youdao": youdao,
    };

    const func = functions[info.menuItemId];
    
    if (func) {
        let executeScriptParams = {
            target: { tabId: tab.id },
            function: func
        };

        // 如果是特定的菜单项，传入额外的参数
        if (info.menuItemId === 'youdao') {
            executeScriptParams.args = [info.selectionText];
            // chrome.contextMenus.update("youdao",{title:`有道翻译 ${info.selectionText} `});
            console.log(info);
        }

        chrome.scripting.executeScript(executeScriptParams);
    } else {
        console.log("Unsupported menu item ID:", info.menuItemId);
    }
});


//#region 工具函数

//------------------工具函数

function youdao(word) {
    window.open(`https://dict.youdao.com/result?word=${word}&lang=en`);
}
function copyXpath(){
SaoTools.copyXpathToClipboard();
}
function copyDP(){
    SaoTools.copyDpToClipboard();
}
function autoFill(){
    console.log("自动填表");
    SaoTab6.showTab6AndUpdate();
}







//#region 综合监听
//---------------------- 综合监听来自其他脚本的消息

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // 接受popup.js发送的消息，读取本地储存对象，并返回消息给popup.js
    if (message.from === "popup_page") {
        (async () => {
            let aa = await chrome.storage.local.get('yuananniu_show');
            sendResponse({ yuananniu_show: aa });
        })();
        // 返回 true 表示异步操作，sendResponse 将在异步操作完成后调用
        return true;
    } 

    //接受content.js发送的消息,更新右键菜单的二级菜单名
    if (message.to==="background" && message.from==="content" && message.action==="更新右键菜单") {        
        chrome.contextMenus.update("youdao", { title: `用有道翻译-> "${message.data.youdao_text}"` });
    }
    


    // 来自content的消息
    if (message.to==="background" && message.from==="content" && message.action==="打开侧边栏") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            // tabs 是一个数组，可能有多个标签页，我们通常只取第一个（当前活动标签页）
            const activeTab = tabs[0];      
            chrome.sidePanel.open({ windowId: activeTab.windowId });
            
        });
    }
    // 监听并转发来自 content.js 的消息
    if (message.action === '发送消息到键鼠记录器') {        
        // 假设 devtools 页面已经连接到 background.js
        chrome.runtime.sendMessage({ action: '转发消息到键鼠记录器', data: message.data });
      }
    
    // 监听并转发来自 devtool 的消息  
    if (message.action === '键鼠记录器发送消息到content-打开记录器') {
        // 查找活动标签页（或通过其他方式获取目标 tabId）
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id; // 获取当前标签页的 tabId
            chrome.tabs.sendMessage(tabId, { action: '键鼠记录器发送消息到content-打开记录器', data: message.data });
        });
    }  
    
});

//-----监听最大化的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "windowControl") {
      const actions = request.data?.actions;
      
      if (actions && actions["最大化"]) {
        chrome.windows.getCurrent(window => {
          chrome.windows.update(window.id, { state: "maximized" });
        });
        sendResponse({ status: "最大化成功" });
      }
    }
    return true; // 保持消息通道开放
  });

//---监听活动标签页的切换

//   chrome.tabs.onActivated.addListener((activeInfo) => {
//     // 获取新活动标签页的详细信息
//     chrome.tabs.get(activeInfo.tabId,async (tab) => {
//      ConfigBox.set('latest_page_url',tab.url);
//      let aa= await ConfigBox.get("键鼠动作记录历史")
//      aa.push("tab=browser.latest_tab")
//      ConfigBox.set('键鼠动作记录历史',aa);

//     });
//   });


chrome.tabs.onActivated.addListener((activeInfo) => {
    // 获取新活动标签页的详细信息
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log("新活动标签页信息:", {
        url: tab.url,
        title: tab.title,
        windowId: activeInfo.windowId
      });
    });
  });


// chrome.scripting.executeScript({
//     args: [G.MobileUserAgent.toString()],
//     target: { tabId: details.tabId, frameIds: [details.frameId] },
//     func: function () {
//         Object.defineProperty(navigator, 'userAgent', { value: arguments[0], writable: false });
//     },
//     injectImmediately: true,
//     world: "MAIN"
// });
  

// chrome.action.onClicked.addListener((tab) => {
//     // 移动端 UA（示例：Chrome Android）
//     const mobileUA = "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36";
  
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },       // 当前标签页
//       args: [mobileUA],                // 传递 UA 参数
//       func: (ua) => {
//         // 覆盖 navigator.userAgent
//         Object.defineProperty(navigator, 'userAgent', {
//           value: ua,
//           writable: false              // 禁止页面恢复原始 UA
//         });
//       },
//       world: "MAIN"                    // 在页面主环境执行
//     });
//   });
