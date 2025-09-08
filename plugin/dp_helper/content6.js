//-----------------------自动填表功能
// SaoTab6Init()
//#region 自动填表功能


const SaoTab6 = {
    init: async function ($sao_console_shadowRoot) {
        this.tab6 = $sao_console_shadowRoot.find("#sao_tabs-6")
        

        // 完全保持原有初始化逻辑

        // 异步加载初始化tab6代码
        this.tab6.html(await SaoTools.loadHtmlContent("html/SaoTab6.html"))

        // 保持原有事件绑定顺序
        this.tab6.find("#generate_code61").click(function (e) {
            this.updateData(1)
        }.bind(this))

        this.tab6.find("#generate_code62").click(function (e) {
            this.updateData(2)
        }.bind(this))

        this.tab6.find("#generate_code63").click(() => {
            this.addStartCode()
        })

        // 保持原有工具函数调用方式
        this.tab6.find("#copy_code6").click(function (e) {
            SaoTools.copyToClipboard(this.tab6.find("#sao_textarea6").val())
            alert("复制成功")
        }.bind(this))

        this.tab6.find("#clear_code6").click(function (e) {
            this.tab6.find("#sao_textarea6").val("")
        }.bind(this))
    },
  
    updateData: function(type = 1) {
      // 完全保留原数据处理逻辑
      let result = [...getInputsData().inputs, ...getTextareaData().textareas]
      
      if(type == 1){
        result = translatetToCode(result) 
      }
      if(type == 2){
        result = translatetToCode2(result) 
      }
      
      this.tab6.find("#sao_textarea6").val(result)
    },
  
    addStartCode: function() {
      // 保持原有字符串拼接方式
      let raw_code = getInitCode()
      let result = raw_code + "\n" + this.tab6.find("#sao_textarea6").val()
      this.tab6.find("#sao_textarea6").val(result) 
    },

    showTab6: function () {
      SaoLayer.show()
      $sao_console_shadowRoot.find("#sao-a-6").click()
    },

    showTab6AndUpdate: function () {
      this.showTab6()
      this.updateData(type = 1) 
    }
  }



//#region 打开tab6
//-------------------------------------------
// function SaoTab6Open() {    
//     SaoLayer.show();
//     $sao_console_shadowRoot.find("#sao-a-6").click()
// }

//#region  生成启动代码
function getInitCode() {
  let  raw_code= `        
#!/usr/bin/env python
# -*- coding:utf-8 -*-
#-导入库
from DrissionPage import Chromium, ChromiumOptions
# 创建配置对象
co = ChromiumOptions()
# 创建浏览器对象
browser = Chromium(co)
tab = browser.latest_tab
tab.get("${window.location.href}")
#访问网页
print(tab.title)
  `;
  return raw_code;
}



//#region  获取inputs数据
//-------------------------------------------

function getInputsData() {
    // 获取所有 input 元素并转换为数组
    const inputElements = document.querySelectorAll('input');
    
    // 转换为数组并遍历处理
    const inputs = Array.from(inputElements).map((element, index) => {
      // 获取元素类型（默认 'text'）
      const type = (element.getAttribute('type') || 'text').toLowerCase();
      
      // 值处理逻辑
      let value;
      if (type === 'checkbox') {
        // 复选框返回布尔值
        value = element.checked;
      } else if (type === 'radio') {
        // 单选框只返回选中状态的值
        value = element.checked ? element.value : null;
      } else {
        // 其他类型直接取值
        value = element.value;
      }
  
      // 返回数据结构
      return {
        index: index + 1,                   // 序号（从1开始）
        type: type,                         // input 类型
        value: value,                       // 处理后的值
        id: element.getAttribute('id') || '', // 优先返回空字符串
        name: element.getAttribute('name') || '',
        note: '',                           // 预留备注字段
        ele: element                        // 原始 DOM 元素引用
      };
    });
  
    return { inputs };
  }
  

//#region  获取textarea数据
function getTextareaData() {
    // 获取所有 textarea 元素并转换为数组
    const textareaElements = document.querySelectorAll('textarea');
    
    // 转换为数组并遍历处理
    const textareas = Array.from(textareaElements).map((element, index) => {
      // 返回数据结构（无 type 属性，统一为 'textarea'）
      return {
        index: index + 1,                     // 序号（从1开始）
        type: 'textarea',                     // 固定类型为 textarea
        value: element.value,                 // 直接取 value
        id: element.getAttribute('id') || '', // 优先返回空字符串
        name: element.getAttribute('name') || '',
        note: '',                             // 预留备注字段
        ele: element                          // 原始 DOM 元素引用
      };
    });
  
    return { textareas };
  }


function filterJsonArray(jsonArray) {
    if (!Array.isArray(jsonArray)) {
      throw new TypeError('输入必须是一个 JSON 数组');
    }
  
    return jsonArray.filter(item => {
      // 确保 item 是对象且包含 type 和 value 属性
      if (typeof item !== 'object' || item === null) return false;
  
      // 过滤条件：type 不是 hidden，且 value 有有效值
      return item.type !== 'hidden' && 
             item.value !== undefined && 
             item.value !== null && 
             item.value !== '' &&
             !(typeof item.value === 'number' && isNaN(item.value));
    });
  }

//#region 自动填表功能1
function translatetToCode(jsonArray) {
    return jsonArray
        .filter(item => item.value) // 过滤掉空值和false值
        .map(item => {
            if (item.type === 'text' || item.type === 'password' || item.type === 'email' || item.type === 'date'||item.type === 'number') {
                return `tab.ele('t:input',${item.index}).input('${item.value}')  # textInput${item.index}_${item.name}`;
            }
            if (item.type === 'checkbox') {
                return `tab.ele('t:input',${item.index}).run_js('this.checked=${item.value}')  # checkboxInput${item.index}_${item.name}`;
            }
            if (item.type === 'textarea') {
                return `tab.ele('t:textarea',${item.index}).input('${item.value}')  # textareaInput${item.index}_${item.name}`; 
            }
            if (item.type === 'radio') {
                return `tab.ele('t:input',${item.index}).run_js('this.checked=${item.value}')  # radioInput${item.index}_${item.name}`; 
            }
            if (item.type === 'number') {
                return `tab.ele('t:input',${item.index}).run_js('this.value=${item.value}')  # numberInput${item.index}_${item.name}`; 
            }
            if(item.type=="date"){
                return `tab.ele('t:input',${item.index}).run_js('this.value=${item.value}')  # dateInput${item.index}_${item.name}`;
            }
            return null; // 处理其他类型
        })
        .filter(Boolean) // 过滤掉 null 值
        .join('\n');
}



//#region自动填表功能2
function translatetToCode2(jsonArray) {
    return jsonArray
        .filter(item => item.value)  // 过滤掉空值
        .map(item => {
            const selector = item.id ? `'#${item.id}'` : `'t:input',${item.index}`;
            
            if (item.type === 'text' || item.type === 'password' || item.type === 'email' || item.type === 'date'||item.type === 'number') {
                return `tab.ele(${selector}).input('${item.value}')  # textInput${item.index}_${item.name}`;
            }
            if (item.type === 'checkbox') {
                return `tab.ele(${selector}).run_js('this.checked=${item.value}')  # checkboxInput${item.index}_${item.name}`;
            }
            if (item.type === 'textarea') {
                let a=selector.replace("t:input","t:textarea")
                return `tab.ele(${a}).input('${item.value}')  # textareaInput${item.index}_${item.name}`; 
            }
            if (item.type === 'radio') {
                return `tab.ele(${selector}).run_js('this.checked=${item.value}')  # radioInput${item.index}_${item.name}`; 
            }
            if (item.type === 'number') {
                return `tab.ele(${selector}).run_js('this.value=${item.value}')  # numberInput${item.index}_${item.name}`; 
            }
            if(item.type=="date"){
                return `tab.ele(${selector}).run_js('this.value=${item.value}')  # dateInput${item.index}_${item.name}`; 
            }
            return null; // 处理其他类型
        })
        .filter(Boolean) // 过滤掉 null 值
        .join('\n');
}


//#region iframe判断





const SaoFrame = {
    isInIframe() {
        try {
            // 如果当前窗口不是顶层窗口，说明在iframe中
            return window.self !== window.top;
        } catch (e) {
            // 跨域访问时会抛出异常，此时也说明在iframe中
            return true;
        }
    },

    iframeWork() {
        let a=getIframeLayerLevel()
        console.log("iframeWork---------------"+a);
        if (window.top === window.top.top) {
        $("#logo_font").text("F"+a);
        $("#logo_font").css("color","black");
    }
}

}


if (SaoFrame.isInIframe()) {
    console.log("当前页面在iframe中");
    setTimeout(() => {
        SaoFrame.iframeWork();
        
    }, 100);
} else {
    console.log("当前页面在顶层窗口中");
}


function getIframeLayerLevel() {
    let level = 0;
    try {
        let currentWindow = window.self;
        while (currentWindow !== window.top) {
            level++;
            // 尝试访问父窗口，若跨域会抛出异常
            currentWindow = currentWindow.parent;
        }
    } catch (e) {
        // 捕获跨域访问错误，直接返回当前已计算的层数
        console.warn("Cross-origin error. Stopped at level:", level);
    }
    return level;
}


function getIframeInfo() {
  if (window.frameElement) {
    a={
      "parent_url":window.parent.location.href,
      "iframe_level":getIframeLayerLevel(),
      "self_url":window.location.href,
      "self_frame":window.frameElement,
      "self_frame_xpath":window.parent._xpathParser.getXPath(window.frameElement),
    }

    // console.log(a);
  }else{
    a={"iframe_level":0} 
  }
  return a;
}


window._iframe_info=getIframeInfo()
FloatingWindowOfElement.iframeLevel=window._iframe_info.iframe_level;

if(window._iframe_info.iframe_level==1){
  $("#FloatingWindowOfElement").css("color","blue");  
}

if(window._iframe_info.iframe_level==2){
  $("#FloatingWindowOfElement").css("color","red");  
}



//#region  显示软件信息-----------
const AppInfo = {
  // 获取国际化消息
  greetingMessage: chrome.i18n.getMessage("greeting", "骚神"),
  appName: chrome.i18n.getMessage("manifest_name"),
  appVersion: chrome.i18n.getMessage("manifest_version"),
  

  // 打印欢迎信息
  logGreeting() {
    console.log(
      "\n" +
      " %c 骚神出品® %c " + this.appName + this.appVersion + " VIP版./%c" +window._iframe_info.iframe_level+ "层iframe" + "\n" +
      "\n",
      "color: #fadfa3; background: #030307; padding:3px 0; font-size:14px;",
      "background: #fadfa3; padding:3px 0; font-size:14px;",
      "color: #fadfa3; background: #030307; padding:3px 0; font-size:14px;",
    );
  }
};

// 调用方法
AppInfo.logGreeting();


//#region  SaoMaskLayer



const SaoMaskLayer = {
  _maskElement: null,

  show(options = {}) {
    if (this._maskElement) return;

    const mask = document.createElement('div');
    mask.id='SaoMaskLayer';
    mask.style.position = 'fixed';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.width = '100vw';
    mask.style.height = '100vh';
    mask.style.backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.5)';
    mask.style.zIndex = options.zIndex || '9999';
    mask.style.pointerEvents = 'auto';
    mask.style.transition = 'opacity 0.3s ease';
    mask.style.opacity = '0';
    
    // 强制触发一次重绘以启用过渡动画
    requestAnimationFrame(() => {
      mask.style.opacity = '1';
    });

    if (options.clickToClose) {
      mask.addEventListener('click', () => this.hide());
    }

    document.body.appendChild(mask);
    this._maskElement = mask;
  },

  hide() {
    if (this._maskElement) {
      const mask = this._maskElement;
      mask.style.opacity = '0';
      // 等待动画结束后移除
      setTimeout(() => {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
        this._maskElement = null;
      }, 300);
    }
  },

  toggle() {
    if (this._maskElement) {
      this.hide();
    } else {
      this.show();
    }
  }
};

// 绑定 Alt+q 快捷键
window.addEventListener('keydown', (e) => {
  if (e.altKey && e.code === 'KeyQ') {
    e.preventDefault();  // 防止默认行为（如浏览器快捷键冲突）
    ElementsBorderDrawer.toggle();
  }
});

// SaoMaskLayer.show()

//#region 元素描边
const ElementsBorderDrawer = {
  _isActive: false,
  _oldTarget: null,
  _corlorMap:{
      'input': 'red',
      'h2': 'orange',
      'h3': 'yellow',
      'a': 'green',
      'label': 'blue',
      'button': 'indigo',
      'h1': 'violet',
      'select': 'red',
      'textarea': 'orange',
      'p': 'yellow',
      'span': 'green',
      'div': 'blue',
      'img': 'indigo',
      'header': 'violet',
      'footer': 'red',
      'nav': 'orange',
      'ul': 'yellow',
      'li': 'green',
      'iframe': 'purple'
    },


  init() {
    this._visibleElementsInfo = this.getVisibleElementsInfo();
    this._visibleElementsInfo.forEach(info => {
      this.drawBorderWithText(info.element, info.element.tagName);
    });
    this._isActive = true;
  },
  getVisibleElementsInfo() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, button,a,iframe'));
    const visibleInputs = inputs.filter(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth
      );
    });

    return visibleInputs.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        element: el,
        tagname: el.tagName.toLowerCase(),
        // xpath: XPathParser.getXPath(el) || '',
        x: Math.round(rect.left + 10),
        y: Math.round(rect.top + rect.height / 2 - 10)
      };
    });
  },

  //#region 元素上色描边
  drawBorderWithText(element, labelText) {
    // 检查元素是否存在
    if (!element || !element.getBoundingClientRect) {
      console.error('Invalid element provided');
      return null;
    }
    
   
 
    let elementColor = this._corlorMap[element.tagName.toLowerCase()] || 'gray';

    // 获取元素的位置和大小信息
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 创建边框容器
    const borderDiv = document.createElement('div');
    borderDiv.className = 'custom-border-overlay';

    // 设置样式
    borderDiv.style.position = 'absolute';
    borderDiv.style.left = (rect.left + scrollX) + 'px';
    borderDiv.style.top = (rect.top + scrollY) + 'px';
    borderDiv.style.width = rect.width + 'px';
    borderDiv.style.height = rect.height + 'px';
    borderDiv.style.border = '2px solid ' + elementColor;
    borderDiv.style.display = 'flex';
    borderDiv.style.alignItems = 'center';
    borderDiv.style.justifyContent = 'center';
    borderDiv.style.fontSize = '14px';
    borderDiv.style.fontFamily = 'Arial, sans-serif';
    borderDiv.style.color = 'white';
    borderDiv.style.textAlign = 'center';
    borderDiv.style.padding = '5px';
    borderDiv.style.boxSizing = 'border-box';
    borderDiv.style.zIndex = '999999';
    borderDiv.style.pointerEvents = 'none'; // 防止遮挡原元素的交互
    borderDiv.style.wordWrap = 'break-word';

    // 设置文字内容
    borderDiv.textContent = labelText || '';

    // 添加到页面
    document.body.appendChild(borderDiv);
    // 设置背景色
    this.applyBorderColorAsBackground(borderDiv);

    // 返回创建的边框元素，方便后续操作（如删除）
    return borderDiv;
  },
  //-------------------------------
  applyBorderColorAsBackground(element) {
    if (!element || !element.style) return;

    const borderColor = window.getComputedStyle(element).borderColor;
    const rgba = toRGBA(borderColor, 0.2);
    if (rgba) {
      element.style.backgroundColor = rgba;
    }

    function toRGBA(colorStr, alpha) {
      const tempCtx = document.createElement("canvas").getContext("2d");
      tempCtx.fillStyle = colorStr;
      const parsed = tempCtx.fillStyle; // 转换为标准格式

      let r, g, b;

      if (parsed.startsWith('#')) {
        if (parsed.length === 7) {
          r = parseInt(parsed.slice(1, 3), 16);
          g = parseInt(parsed.slice(3, 5), 16);
          b = parseInt(parsed.slice(5, 7), 16);
        } else {
          return null;
        }
      } else if (parsed.startsWith('rgb')) {
        const matches = parsed.match(/\d+/g);
        if (!matches || matches.length < 3) return null;
        [r, g, b] = matches.map(Number);
      } else {
        return null;
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  },

  // 清除所有添加的边框效果，有延迟动画
  clear() {
    const overlays = document.querySelectorAll('.custom-border-overlay');
    setTimeout(() => {
      overlays.forEach(overlay => overlay.remove());
    }, 200);
    this._isActive = false;
    // overlays.forEach(overlay => overlay.remove());
  },

  // 切换边框效果的显示/隐藏
  toggle() {
    if (this._isActive) {
      this.clear();
    } else {
      this.init();
    }
  }

}

