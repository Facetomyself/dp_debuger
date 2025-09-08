const OverlayManager = {
  overlay: null,
  
  init() {
    this.overlay = $('<div>').css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999999,
      cursor: 'pointer'
    });
  },

  show() {
    $('body').append(this.overlay);
  },

  remove() {
    this.overlay && this.overlay.remove();
  },

  async loadHtml(htmlContentPath) {
    try {
      const htmlContent = await SaoTools.loadHtmlContent(htmlContentPath);
      this.overlay.html(htmlContent);
    } catch (error) {
      console.error('加载 HTML 内容失败:', error);
    }
  },

  bindClickEvent() {
    this.overlay.on('click', () => {
      SaoTools.copyDPPositionToClipboard();
      this.remove();
    });
  },

  async findElementAndBindClickEvent(bingdingElementId) {
    const element = $(bingdingElementId);
    if (element.length) {
      element.on('click', () => {
        this.show();
        this.bindClickEvent();
      });
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.findElementAndBindClickEvent(bingdingElementId);
    }
  },

  async setupOverlay(htmlContentPath, bingdingElementId) {
    this.init();
    await this.loadHtml(htmlContentPath);
    await this.findElementAndBindClickEvent(bingdingElementId);
  }
};

// 直接使用对象方法初始化
OverlayManager.setupOverlay("html/setupOverlay.html", '#sao-copyOnce');



//----------------------------------------------------

//--------------键鼠记录语法历史功能--------

const keyMouseLogger={
  // 初始化
  push:async function(text="null",type="null"){
      // 加载历史记录
     let history_array=await ConfigBox.get('键鼠动作记录历史');
     let yufa=text.toString();
     let len=history_array.length-1;
 
     let new_history={"序号":len+1,"语法":yufa,"类型":type,"时间":SaoTools.getCurrentDateTime()};
     history_array.push(new_history);
     console.log(history_array);
     await ConfigBox.set('键鼠动作记录历史',history_array);      
  },


}

//-----------------------------------



//----------------------------------

class OverlayManager2 {
  constructor() {
    this.overlay = null;  // 遮罩层元素
    this.actions = [];  // 动作数组    
    this.init();  // 初始化遮罩层

  }

  // 初始化遮罩层
  init() {
    this.overlay = $('<div>')
      .css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.2)',
        zIndex: 9999999,
        cursor: 'pointer'
      }).hide();      
      
  }
  async init_actions(){
    this.actions= await ConfigBox.get('键鼠动作记录历史');
  }

  // 显示遮罩层
  addTobody() {
          $('body').append(this.overlay);      
  }

  show() {
    this.overlay.show();
  }
  hide() {
    this.overlay.hide();
  }
  
  reset(){
    this.actions=[];
    this.overlay.hide();
    this.clearActions();
  }
  start(code){
    this.actions=[];
    this.overlay.show();    
    this.appendActions(code);
  }
  
  // 移除遮罩层
  remove() {
    if (this.overlay) {
      this.overlay.remove();
    }
  }

  // 异步加载 HTML 内容到遮罩层
  async loadHtml(htmlContentPath) {
    try {
      const htmlContent = await SaoTools.loadHtmlContent(htmlContentPath);
      this.overlay.html(htmlContent);
    } catch (error) {
      console.error('加载 HTML 内容失败:', error);
    }
  }

  // 绑定遮罩层的点击事件
  async bindClickEvent() {
    this.actions=await ConfigBox.get('键鼠动作记录历史');

    this.overlay.on('click', (event) => {
      let aa={X:event.clientX,Y:event.clientY}
      // let oneAction=`browser.latest_tab.actions.wait(0.9).move_to((${aa.X},${aa.Y})).click()`
      this.overlay.hide();
      
      this.appendActions(SaoTools.clickAt(aa.X,aa.Y)); 

      this.overlay.show();     
    });
  }

  appendActions(code) {
    this.actions.push(code);
    let b = this.actions.join('\n');
    this.overlay.find('#keymouseloggerPRE').text(b);
    ConfigBox.set('键鼠动作记录历史', this.actions);
  }
  clearActions(code) {
    this.actions=[];
    let b = this.actions.join('\n');
    this.overlay.find('#keymouseloggerPRE').text(b);
    ConfigBox.set('键鼠动作记录历史', this.actions);
  }

  showActions() {
    let actionsText = this.actions.join('\n');
    this.overlay.find('#keymouseloggerPRE').text(actionsText);
  }
  

  startRecord(){
    SaoTools.sendMaximizeRequest();  // 最大化浏览器窗口
    this.show();  // 显示遮罩层
    let a=`
#开始记录或网页刷新或者弹出新网页
#URL :  ${window.location.href}
#标题:  ${window.document.title}
browser.latest_tab.wait(1)
    `

    this.appendActions(a);    
  } 




  初始化并启动遮罩层管理
  async setupOverlay(htmlContentPath) {    
    await this.loadHtml(htmlContentPath);  // 加载 HTML 内容
    let a=await ConfigBox.get('键鼠动作记录开关');
    if(a){
      this.startRecord();
    }
    await this.bindClickEvent();  // 绑定遮罩层点击事件
    this.addTobody();  // 显示遮罩层        
  }
}


const overlayKeyMoueLogger= new OverlayManager2();
overlayKeyMoueLogger.setupOverlay("html/setupOverlay2.html");
overlayKeyMoueLogger.init_actions();

//--------------------------------检测键盘事件

const keyMap = {
  "PageDown": 'Keys.PAGE_DOWN',
  "PageUp": 'Keys.PAGE_UP',
  "Enter": 'Keys.ENTER',
  "Home": "Keys.HOME",
  "End": "Keys.END",
  "Escape": "Keys.ESCAPE",
  "ArrowLeft": "Keys.LEFT",
  "ArrowRight": "Keys.RIGHT",
  "ArrowUp": "Keys.UP",
  "ArrowDown": "Keys.DOWN",
  "Backspace": "Keys.BACKSPACE",
  "Delete": "Keys.DELETE",
  "Alt": "Keys.ALT",
  "Control": "Keys.CONTROL",
  "Shift": "Keys.SHIFT",
  " ": "Keys.SPACE"
} 

document.addEventListener('keydown', function(event) {
  // console.log(event.key);
  // overlayKeyMoueLogger.overlay.is(':visible');
  if(keyMap[event.key] && overlayKeyMoueLogger.overlay.is(':visible')){
    let ac=`browser.latest_tab.actions.wait(timeGap).type(${keyMap[event.key]})`
    overlayKeyMoueLogger.appendActions(ac);
    
  }
});


