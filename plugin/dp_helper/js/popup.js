
//---------------更新logo和版本号---
const updateNameAndVersion = () => {
  // 更新插件名和版本号
  let app_name = chrome.i18n.getMessage("manifest_name");
  let app_version = chrome.i18n.getMessage("manifest_version");
  $("#app_name").text(app_name + app_version + "VIP版");
  
}
updateNameAndVersion();



//----------------搜索功能--------------

const search = () => {
  function open_search_website() {
      let info = $('#search_input').val();  // 获取输入框的值
      window.open("https://drissionpage.cn/search?q=" + info, "_blank");
  }

  // 使用 jQuery 为元素添加事件监听器
  $('#search').on('click', open_search_website);

  $('#search_input').on('keydown', function (event) {
      if (event.key === 'Enter') {
          open_search_website();
      }
  });


}
search();

//------------监听按钮------------------


// 切换信息浮窗
$('#kaiguan2').on('click', function() {
  // 查询当前活动标签页
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0]; // 获取当前活动标签页               
      chrome.tabs.sendMessage(activeTab.id, { from:"popup",to:"content",action: "开关信息浮窗" });
      console.log('打开超级按钮');
  });
});

// 打开侧边栏
$('#kaiguan3').on('click', function() {
  // 查询当前活动标签页
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0]; // 获取当前活动标签页
      chrome.sidePanel.open({ windowId: activeTab.windowId });
  });
});

// $("#options").on("click", function() {
//     chrome.runtime.openOptionsPage();
// });
$("#options").on("click", function() {
  // 获取当前所有窗口
  chrome.windows.getAll({populate: true}, function(windows) {
    // 遍历所有窗口，检查是否已有符合条件的窗口
    let found = false;
    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];
      // 检查是否为弹出窗口，并且包含 options.html
      if (window.type === 'popup' && window.tabs.some(tab => tab.url.includes('options.html'))) {
        // 如果找到了，激活该窗口
        chrome.windows.update(window.id, {focused: true});
        found = true;
        break;
      }
    }

    // 如果没有找到相同的窗口，创建新窗口
    if (!found) {
      chrome.windows.create({
        url: chrome.runtime.getURL('options.html'),
        type: 'popup',
        width: 600,
        height: 800
      });
    }
  });
});



$("#reset").on("click", function() {
    chrome.runtime.reload();
});

//插件中心
$("#ExtensionsCenter").on("click", function() {
    chrome.tabs.create({
        url: 'chrome://extensions/'
    }, function(tab) {
        // 可选：创建标签页成功后的回调函
        console.log('New tab created with ID: ', tab.id);
    });
});
//版本信息
$("#VersionInfo").on("click", function() {
  // chrome.runtime.activeTab

    chrome.tabs.create({
        url: 'chrome://version/'
    }, function(tab) {
        // 可选：创建标签页成功后的回调函
        console.log('New tab created with ID: ', tab.id);
    });
});
//后台审查
$("#BackgroundCheck").on("click", function() {
    chrome.tabs.create({
        url: 'chrome://inspect' 
    }) 
})
//命令中心
$("#CMDabout").on("click", function() {
    chrome.tabs.create({
        url: 'chrome://about' 
    }) 
})



//---------------弹出框
// 封装复选框显示/隐藏的函数
function toggleInputCheckbox(checkboxId, inputId) {
  $(checkboxId).on('change', function () {
      $(inputId).toggle($(this).is(':checked'));
  });
}

// 调用函数处理复选框
toggleInputCheckbox('#loadBrowser', '#loadBrowser_input');
toggleInputCheckbox('#loadExtensions', '#loadExtensions_input');
toggleInputCheckbox('#debugPort', '#debugPort_input');

// 处理选择框
$("#more-select").on("change", function() {
  const selectedValue = $(this).val();
  switch (selectedValue) {
      case "dp":
          window.open("https://drissionpage.cn/");
          break;
      case "open_self":
          window.open(chrome.runtime.getURL('popup.html'));
          break;
      case "spider_box":
          window.open("https://spiderbox.cn/");
          break;
      case "mars_code":
          window.open("https://www.marscode.cn/dashboard");
          break;
      case "crxsoso":
          window.open("https://www.crxsoso.com/");
          break;
      case "cdp":
          window.open("https://chromedevtools.github.io/devtools-protocol/");
          break;
      case "copy_cookie":
        // alert("cookie已复制到剪切板");
        (async () => {          
          const cookieString = await get_active_tab_cookie();
          SaoToolBox.copyToClipboard(cookieString);
          alert("cookie已复制到剪切板");
        })();
        break;
      case "crack_debugger":
        (async () => {
        let code =`
tab.add_init_js('''setInterval = function() {}''')
tab.add_init_js('''debugger = function() {}''')` 
        SaoToolBox.copyToClipboard(code);
        alert("破解代码已复制到剪切板"); 
        })();
        break;  
          
  }
  $(this).val("more");
});


//------------复制当前网页启动代码------------------




$(document).ready(function () {
  // 初始化 Popup 窗口
  ToolBox.initPopupWindow();

  $("#go").click(ToolBox.handleFormSubmit);
  $("#go2").click(ToolBox.handleFormSubmit2);

});


//------------------工具函数-----------
const ToolBox = {


  // 初始化 Popup 窗口
  async initPopupWindow() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.url) {
      try {
        let url = new URL(tab.url);
        $('#input').val(url.href);  // 设置输入框的值为当前标签页的主机名
      } catch (e) {
        // 解析 URL 失败时忽略
      }
    }

    $('#input').focus();  // 聚焦输入框
  },

  // 表单提交处理函数
  async handleFormSubmit(event) {
    const $input = $('#input');         // 获取输入框元素
    event.preventDefault();   // 阻止表单默认提交行为 

    const url = $input.val();  // 获取输入框的值

    if (!url) {
      return;  // 如果输入框为空，则不执行任何操作
    }
    SaoToolBox.copyToClipboard(await get_code2(url));
    alert(url + '该网址DP启动代码已复制到剪切板');

  },
  async handleFormSubmit2(event) {
    const $input = $('#input');         // 获取输入框元素
    event.preventDefault();   // 阻止表单默认提交行为 

    const url = $input.val();  // 获取输入框的值
    if (!url) {
      return;  // 如果输入框为空，则不执行任何操作
    }
    let a=await get_code2(url);
    // let a=await InitCode.get_code(url);
    let b=prompt("请输入文件名",SaoToolBox.getCurrentDateTimeString()+".py");
    if(b==null){
      return; 
    }
    SaoToolBox.downloadAsFile(a,b);         

  },


 

};




//--- 初始化代码生成器 ----------

const InitCode = {

  // 获取浏览器配置参数的函数
  get_args: function () {
    const args = []; // 存储所有需要的配置项
    // 配置项和对应的浏览器参数映射
    const options = {
      isHeadless: 'co.headless(True)',  // 无头模式
      isDisableImage: 'co.no_imgs(True)',  // 禁用图片
      isMaximize: "co.set_argument('--start-maximized')",  // 最大化窗口
      isIgnoreErrors: "co.set_argument('--ignore-certificate-errors')",  // 忽略证书错误
      autoOpenDevTools: "co.set_argument('--auto-open-devtools-for-tabs')",  // 自动打开开发者工具
      unsafeExtensions: "co.set_argument(' --enable-unsafe-extension-debugging ')",  // 启用不安全的扩展调试
      isIncognito: 'co.incognito(True)',  // 隐身模式
    };

    // 遍历配置选项，检查是否被选中并添加到配置数组中
    Object.keys(options).forEach(option => {
      if (document.getElementById(option).checked) {
        args.push(options[option]);  // 如果选中则添加到配置项数组
      }
    });

    // 处理加载debug端口的情况
    if ($('#debugPort').is(':checked')) {
      // 获取扩展路径
      const extensionPath = $("#debugPort_input").val();
      args.push(`co.set_local_port('${extensionPath}')`);  // 添加扩展
    };
    // 处理加载扩展的情况
    if ($('#loadExtensions').is(':checked')) {
      // 获取扩展路径
      const extensionPath = $("#loadExtensions_input").val();
      args.push(`co.add_extension(r'${extensionPath}')`);  // 添加扩展
    };
    //处理加载浏览器路径情况
    if ($('#loadBrowser').is(':checked')) {
      // 获取浏览器路径
      const browserPath = $("#loadBrowser_input").val();
      args.push(`co.set_browser_path(r'${browserPath}')`);  // 添加扩展
    };

    // 返回拼接好的配置字符串
    return args.join("\n") + "\n";
  },  
 
};




  // 获取当前窗口的活动标签页
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  const tabId = activeTab.id; // 获取 tabId
  console.log("当前活动标签页的 ID---:", tabId);
  $("#tab_id").text(tabId)
});




function extractHostname(url) {
  try {
    // 创建URL对象
    const urlObj = new URL(url);
    // 返回hostname
    return urlObj.hostname;
  } catch (e) {
    // 如果URL无效，返回null
    return null;
  }
}




async function get_code2(targetUrl) {
  let wangzhi = targetUrl;
  let ck = "";
  let peizhi = InitCode.get_args();
  // 处理加载cookie的情况
  if ($('#loadCookie').is(':checked')) {   
    const cookieString = await get_active_tab_cookie();    
    ck = `
# 加载cookie..    
cookies = r'${cookieString}'
tab.set.cookies(cookies)`
  }
  // 生成最终的代码
  let code = `        
#!/usr/bin/env python
# -*- coding:utf-8 -*-
#-导入库
from DrissionPage import Chromium, ChromiumOptions
# 创建配置对象
co = ChromiumOptions()
${peizhi}
# 创建浏览器对象
browser = Chromium(co)
tab = browser.latest_tab
${ck}
#访问网页..
tab.get("${wangzhi}")
print(tab.title)
`;
  return code;
}


async function get_active_tab_url() { 
  // const [tab] 是为了直接从 chrome.tabs.query() 返回的数组中提取第一个元素 
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log(tab.url);
  return tab.url;  
}
async function get_active_tab_host_name() {  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url); 
  console.log(url.hostname);
  return url.hostname;  
}

async function get_active_tab_cookie(){
  let cookiesData = await SaoToolBox.getCurrentTabCookies();  
  let cookieString = cookiesData.map(cookie => `${cookie.name}=${cookie.value}`).join(";");
  let hostname=await get_active_tab_host_name();
  cookieString = `domain=${hostname};` + cookieString;
  return cookieString;
}