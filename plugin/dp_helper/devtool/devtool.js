chrome.devtools.panels.elements.createSidebarPane('💖️骚神语法转换', function (sidebar) {
    // sidebar initialization code here
    sidebar.setPage('devtool/convert.html')
    
    // sidebar.onShown.addListener(handleShown)
    // sidebar.onHidden.addListener(handleHidden)
  });

chrome.devtools.panels.elements.createSidebarPane('🚩骚神逆向助手', function (sidebar) {
    sidebar.setPage('devtool/reverse.html')
  });  

  chrome.devtools.panels.create('🐭键鼠记录器', 'icon.png', 'devtool/键盘鼠标记录.html', () => {
    console.log('user switched to 键鼠记录');    



  });  


  chrome.devtools.panels.create('⚒️JShook工具箱', 'icon.png', 'devtool/power_tool.html', () => {
    console.log('user switched toJShook工具箱');
    
  });
  chrome.devtools.panels.create('Fetch工具箱', 'icon.png', 'devtool/fetch_tool.html', () => {
    console.log('user switched toFetch工具箱');
    
  });


  // chrome.devtools.panels.create('🔴高手进阶', 'icon.png', 'html/jin_jie.html', () => {
  //   console.log('user switched to🔴高手进阶');
  // });


 
  