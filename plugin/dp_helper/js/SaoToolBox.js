const SaoToolBox = {
    //------------返回一个当前日期和时间的字符串
    getCurrentDateTimeString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');  // 月份从0开始，需要加1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}.${month}.${day}-${hours}.${minutes}`;
    },


    //---------------复制文本到剪贴板
    copyToClipboard(text) {
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


    // ---------------------下载文本为文件
    downloadAsFile(textContent = "123", filename = '123.txt') {
        // 创建Blob对象
        var blob = new Blob([textContent], { type: 'text/plain' });
    
        // 生成下载链接
        var url = URL.createObjectURL(blob);
    
        // 触发下载
        var a = $('<a>', {
          href: url,
          download: filename
        }).appendTo('body').get(0).click();
    
        // 清理
        $(a).remove();
        URL.revokeObjectURL(url);
      },

      //-----------------脚本注入
    injectCustomJs(jsPath) {
        jsPath = jsPath || 'js/inject.js';
        var temp = document.createElement('script');
        temp.setAttribute('type', 'text/javascript');
        // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
        temp.src = chrome.runtime.getURL(jsPath);
        //确保最后加载
        window.onload=()=>{
          document.body.appendChild(temp);
        }
      },

      //--------------------获取当前激活标签页的Cookies
      async getCurrentTabCookies() {
        // 获取当前激活标签页
        const [tab] = await chrome.tabs.query({ 
          active: true, 
          currentWindow: true 
        });
      
        // 使用Promise包装API调用
        return new Promise((resolve, reject) => {
          chrome.cookies.getAll({ 
            url: tab.url 
          }, (cookies) => {
            if (chrome.runtime.lastError) {
              alert(chrome.runtime.lastError.message);
              reject(chrome.runtime.lastError);
            } else {
              console.log('Obtained cookies:', cookies);
              resolve(cookies);
            }
          });
        });
      },
}