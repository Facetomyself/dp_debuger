

  function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.runtime.getURL(jsPath);
    //确保最后加载
    window.onload=()=>{
      document.body.appendChild(temp);
    }
  }
  function injectCustomJs4(jscode) {
   ;
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');

    temp.textContent=jscode;
    //确保最后加载
    window.onload=()=>{
      document.body.appendChild(temp);
    }
  }
  function injectCustomJs3(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.runtime.getURL(jsPath);

    document.documentElement.appendChild(temp);
  }
  function injectCustomJs2(jsPath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(jsPath); // 加载扩展内的脚本
    document.documentElement.appendChild(script);
    script.onload = () => script.remove(); // 加载后移除 DOM 节点
    console.log("注入成功"+script.src);
    
  }




  // let jscode=` 
  //   console.log("Hello from injected script");
  //   alert("注入脚本执行！");

  // `


  // injectCustomJs4(jscode);

