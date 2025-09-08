// 骚神库 DP_helper

//#region jQuery工具箱-----------


$.fn.addRedBorder = function() {
    // 移除旧的序号标记
    $(".border-index-marker").parent().css("border", "none");
    $(".border-index-marker").remove();
    return this.each(function(index) {

        // 为当前元素设置定位上下文
        const $element = $(this).css({
            "position": "relative",  // 创建定位上下文
            "border": "1px solid red"
        });

        // 移除旧的序号标记（防止重复调用时重复添加）
        $element.find(".border-index-marker").remove();

        // 创建序号元素
        $("<div>")
            .addClass("border-index-marker")
            .text(index + 1)  // 序号从1开始
            .css({
                "position": "absolute",
                "top": "0",
                "right": "0",
                "min-width": "12px",
                "text-align": "center",
                "font-size": "10px",
                "color": "#fff",
                "background": "rgba(255,0,0,0.5)",
                "padding": "0px 0px",
                "border-radius": "0 0 0 3px",
                "z-index": "999999"
            })
            .appendTo($element);
    });
};
$.fn.delRedBorder = function() {
    // 移除旧的序号标记
    $(".border-index-marker").parent().css("border", "none");
    $(".border-index-marker").remove();
    
};
// 创建jQuery全局工具方法 toast提示
$.toast = function(text) {
    // 移除旧的toast防止重复
    $('.jquery-toast').remove();

    // 创建toast容器
    const $toast = $('<div>')
        .addClass('jquery-toast')
        .html(text)
        .css({
            'position': 'fixed',
            'top': '40%',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background': 'rgba(0,0,0,0.8)',
            'color': '#fff',
            'padding': '12px 24px',
            'border-radius': '4px',
            'font-size': '14px',
            'z-index': '999999',
            'opacity': '0',
            'transition': 'opacity 0.3s',
            'max-width': '80%',
            'word-break': 'break-word'
        })
        .appendTo('body');

    // 显示动画
    setTimeout(() => $toast.css('opacity', '1'), 10);

    // 自动消失
    setTimeout(() => {
        $toast.css('opacity', '0');
        setTimeout(() => $toast.remove(), 300);
    }, 1000);

    return this; // 保持链式调用
};

/* 使用示例：
$.toast('操作成功！').toast('第二条提示'); // 支持链式调用
*/




//#region  SaoTools工具箱-----------

const SaoTools={
    // 获取插件html源码内容
    async loadHtmlContent(path) {
        const filePath = chrome.runtime.getURL(path);  // 使用传入的 path 构建完整的文件路径
    
        return new Promise((resolve, reject) => {
            fetch(filePath)
                .then(response => response.text())  // 将响应转换为文本
                .then(htmlContent => {
                    resolve(htmlContent);  // 返回 HTML 内容
                })
                .catch(error => {
                    reject('Error loading HTML file: ' + error);  // 捕获并返回错误信息
                });
        });
    },

    // 获取插件json源码内容
    async loadJsonContent(path) {
        const filePath = chrome.runtime.getURL(path);  // 使用传入的 path 构建完整的文件路径
    
        return new Promise((resolve, reject) => {
            fetch(filePath)
                .then(response => response.json())  // 将响应转换为 JSON
                .then(jsonContent => {
                    resolve(jsonContent);  // 返回 JSON 内容
                })
                .catch(error => {
                    reject('Error loading JSON file: ' + error);  // 捕获并返回错误信息
                });
        });
    },
    
    
    
    copyCookieToClipboard(){
        SaoTools.copyToClipboard(document.cookie);
        alert("Cookie复制成功✔️\n"+document.cookie);
    },
    async copyAllCookieToClipboard(url){

        chrome.cookies.getAll({ url: url }, function(cookies) {
            // console.log('Cookies for https://example.com:', cookies);
            SaoTools.copyToClipboard(cookies);
            alert("Cookie 完全体 复制成功✔️\n"+cookies);
        });         
    },
    // 打开一个新窗口
    async  minOpen(url) {
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=0,height=0,left=-1000,top=-1000`;
    
        window.open(url, 'test', params);
    },

    
    copyUAToClipboard(){
        SaoTools.copyToClipboard(navigator.userAgent);
        alert("UA复制成功✔️\n"+navigator.userAgent);
    },
    copyXpathToClipboard(){
        SaoTools.copyToClipboard(mouseOverElement.theXpath);
        copyHistory.push(mouseOverElement.theXpath,"xpath");
        alert("xpath复制成功✔️\n"+mouseOverElement.theXpath);
    },
    copyDpToClipboard(){
        SaoTools.copyToClipboard(mouseOverElement.theDP);
        copyHistory.push(mouseOverElement.theDP,"DP");
        alert("Drissionpage语法复制成功✔️\n"+mouseOverElement.theDP);
    },
    copyDPPositionToClipboard(){
        let aa=`tab.actions.move_to((${mouseOverElement.thePosition.X},${mouseOverElement.thePosition.Y}))`
        SaoTools.copyToClipboard(aa);
        copyHistory.push(aa,"坐标");
        alert("DrissionPage坐标语法复制成功✔️\n"+aa);
    },
    getMousePosition(){
        // let aa=`(${mouseOverElement.thePosition.X},${mouseOverElement.thePosition.Y})`
        let bb={X:mouseOverElement.thePosition.X,Y:mouseOverElement.thePosition.Y}
        return bb;        
       
    },

    clickAt(x, y) {
        // 创建鼠标事件
        const event = new MouseEvent('click',{
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            // 坐标相对于视口
            clientY: y
        });
    
        // 找到坐标下的元素
        const element = document.elementFromPoint(x, y);
        console.log(element)
        element.focus()
        try {
           element.click(); 
        }
        catch (error) {
            element.dispatchEvent(event);
        }
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // 模拟键盘输入
            let a=prompt("请输入要输入的内容：");
            if(a){
                element.value = a;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                return `browser.latest_tab.actions.wait(timeGap).move_to((${x},${y})).click().type("${a}")`;
            }        
        } else {
            return `browser.latest_tab.actions.wait(timeGap).move_to((${x},${y})).click()`;
        } 
    
  
    },
    sendMaximizeRequest() {
        chrome.runtime.sendMessage({
          action: "windowControl",
          data: {
            actions: { "最大化": true }
          }
        });
      },
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
    // 按键监听
    onPress(key, callback) {
        // 监听键盘按下事件
        document.addEventListener('keydown', function(event) {
            // 检查按下的键是否与指定的键匹配
            if (event.key === key) {
                // 执行回调函数
                callback();
            }
        });
    },
        
    // 向页面注入JS
    injectCustomJs(jsPath) {
        jsPath = jsPath || 'js/inject.js';
        var temp = document.createElement('script');
        temp.setAttribute('type', 'text/javascript');
        // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
        temp.src = chrome.runtime.getURL(jsPath);
  
        document.body.appendChild(temp);
      },
      getCurrentDateTime() {
        const now = new Date();        
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    copyOwlCenterPosition(){
        function getElementCenter($element) {
            // 获取元素的边界信息
            let rect = $element[0].getBoundingClientRect();
        
            // 计算元素中心的坐标
            let centerX = rect.left + rect.width / 2;
            let centerY = rect.top + rect.height / 2;
        
            // 返回元素相对于视口的中心坐标
            return { x: parseInt(centerX), y: parseInt(centerY) };
        };
        let zuobiao =getElementCenter($('#logo_font'));
        let yufa = `tab.actions.move_to((${zuobiao.x},${zuobiao.y}))`;
        SaoTools.copyToClipboard(yufa);
        copyHistory.push(yufa,"坐标");
        alert("猫头鹰坐标复制成功✔️\n"+yufa);
    },

}


//#region 复制语法历史功能--------

const copyHistory={
    // 初始化
    push:async function(text="null",type="null"){
        // 加载历史记录
       let history_array=await ConfigBox.get('元素复制历史');
       let yufa=text.toString();
       let len=history_array.length-1;
       // 超出长度，就移除最老的元素
       if(len>40){
           history_array.shift();
       }
       let new_history={"序号":len+1,"语法":yufa,"类型":type,"时间":SaoTools.getCurrentDateTime()};
       history_array.push(new_history);
       console.log(history_array);
       await ConfigBox.set('元素复制历史',history_array);
       TabListener.send(data={aa:123456789},action="更新状态",to="sidepanel");    
    },


}


//#region  配置管理-----------
const ConfigBox = {
    async get(str) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([str], function(result) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
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
                    resolve();
                }
            });
        });
    },

    async update(str, updater) {
        const oldValue = await this.get(str);
        const newValue = typeof updater === 'function' 
            ? updater(oldValue) 
            : updater;
            
        await this.set(str, newValue);
        return newValue;
    }
};



//#region  XPath解析器-----------
const XPathParser = {
    // 检查 XPath 是否唯一
    isUniqueXPath: function(xpath) {
        const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        return result.snapshotLength === 1;
    },

    // 查找包含唯一 id 的祖先元素
    findAncestorWithUniqueId: function(element) {
        return $(element).parents().filter(function() {
            return $(this).attr('id');
        }).first()[0] || null;
    },

    // 获取在祖先元素内的路径
    getPathWithinAncestor: function(ancestor, element) {
        let path = '';
        while (element && element !== ancestor) {
            const tagWithPosition = this.getTagWithPosition(element);
            path = `/${tagWithPosition}${path}`;
            element = element.parentElement;
        }
        return path;
    },

    // 获取元素标签和兄弟元素的索引
    getTagWithPosition: function(element) {
        const tagName = $(element).prop('tagName').toLowerCase();
        const siblings = $(element).parent().children(tagName);
        const index = siblings.index(element) + 1;  // jQuery's index() is zero-based
        return `${tagName}[${index}]`;
    },
    // 主要入口
    getXPath: function(element) {
        try {
            let xpath = this.getOptimalXPath(element);
            return xpath;
        } catch (error) {
            // console.log('Error in getXPath:', error);
            return "error!";
        }
    },

    // 获取最优 XPath
    getOptimalXPath: function(element, depth = 0, MAX_DEPTH = 12) {
        if (!element || depth > MAX_DEPTH) return null;

        const tagName = $(element).prop('nodeName').toLowerCase();

        // 1. 优先使用唯一的 ID
        if ($(element).attr('id') && this.isUniqueXPath(`//${tagName}[@id="${$(element).attr('id')}"]`)) {
            return `//${tagName}[@id="${$(element).attr('id')}"]`;
        }

        let className = $(element).attr('class') || '';
        className = className.replace(/outline-selector|highlight-selector/g, '').trim();

        // 2. 使用类名和属性，找到匹配的元素
        if (className && this.isUniqueXPath(`//${tagName}[contains(@class, "${className}")]`)) {
            return `//${tagName}[contains(@class, "${className}")]`;
        }

        const ancestorWithId = this.findAncestorWithUniqueId(element);
        if (ancestorWithId) {
            const idTagName = $(ancestorWithId).prop('nodeName').toLowerCase();
            const ancestorXPath = `//${idTagName}[@id="${$(ancestorWithId).attr('id')}"]`;
            const pathWithinAncestor = this.getPathWithinAncestor(ancestorWithId, element);
            return `${ancestorXPath}${pathWithinAncestor}`;
        }

        const tableAncestor = this.findAncestorTable(element);
        if (tableAncestor) {
            const tablePath = this.getTableXPath(tableAncestor, depth + 1, MAX_DEPTH);
            const elementPath = this.getPathWithinTable(tableAncestor, element);
            return `${tablePath}${elementPath.startsWith('//') ? elementPath.substring(1) : elementPath}`;
        }

        // 3. 优先使用唯一的文本内容
        const trimmedText = $(element).text().trim().replace(/\s+/g, ' ');
        if (trimmedText && this.isUniqueXPath(`//${tagName}[text()="${trimmedText}"]`)) {
            return `//${tagName}[text()="${trimmedText}"]`;
        }

        // 4. 最后使用索引
        
        return this.getElementXPathByIndex(element);
    },

    getElementXPathByIndex: function(element) {
        let xpath = '';
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let index = 1;
            let sibling = element.previousSibling;
            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }
            const tagName = element.nodeName.toLowerCase();
            xpath = `/${tagName}[${index}]` + xpath;
            element = element.parentNode;
        }
        return xpath;
    },

    // 查找表格元素祖先
    findAncestorTable: function(element) {
        return $(element).parents().filter(function() {
            return $(this).prop('tagName').toLowerCase() === 'table';
        }).first()[0] || null;
    },

    // 获取表格 XPath
    getTableXPath: function(tableElement, depth, MAX_DEPTH) {
        if (depth > MAX_DEPTH) return '';
        const tagName = $(tableElement).prop('tagName').toLowerCase();
        const siblings = $(tableElement).parent().children(tagName);
        const index = siblings.index(tableElement) + 1;
        return `//${tagName}[${index}]`;
    },

    // 获取表格内元素的路径
    getPathWithinTable: function(tableElement, element) {
        let path = '';
        while (element && element !== tableElement) {
            const tagWithPosition = this.getTagWithPosition(element);
            path = `/${tagWithPosition}${path}`;
            element = element.parentElement;
        }
        return path;
    }
};
window._xpathParser = XPathParser; // 暴露到全局

const DrissionPageParser={
    _getDpValue(element) {
  
        // 获取元素的 tagName、id 和 textContent
        let tagName = element.tagName.toLowerCase();
        // 将 tagName 转换为小写
        // 排除一些不需要的标签
        if (tagName == 'body' || tagName == 'header' || tagName == 'style' || tagName == 'script') {
            element.dp = '跳过';
            return false;
        }
    
        let txt = element.innerText;
        // 排除一些没有的文本的元素    
        let textContent = txt == '' ? '' : '@@tx()=' + txt;
    
        // 构建属性部分
        let attributes = '';
        Array.from(element.attributes).forEach(function(attr) {
            // 每个属性的格式为 name=value
            let attr_info = `@@${attr.name}=${attr.value}`;
            // 排除一些不需要的属性
            if (attr.name == 'src' || attr.name == 'href')
                attr_info = '';
            attributes += attr_info;
        });
    
        // 格式化 dp 值
        let dpValue = `t:${tagName}${attributes}${textContent}`;
    
        // 设置 dp 属性
        // element.dp = dpValue;
        return dpValue;
    
    },
    getDpValue(element) {
        if(element) {return this._getDpValue(element);}
        else {
            return "error!";
        }

    },

 
}


//#region  元素信息浮窗-----------
const FloatingWindowOfElement = {
    _isShow:ConfigBox.get("是否显示浮窗"),
    iframeLevel:0,
    WindowContent:'骚神库元素语法自动显示插件',
    $navbar: null,
    createWindow() {
        // 获取当前网页的标题
        const pageTitle = document.title;
    
        // 创建导航栏元素
        this.$navbar = $('<div>', { id: 'FloatingWindowOfElement' });
        // 将导航栏添加到页面的最前面
        $('body').prepend(this.$navbar);
    },

    updateContentAndPosition() {
        // 清空导航栏内容
        this.$navbar.empty();
        //正则表达是全局替换，增加容错处理
        try { 
            var thedp = mouseOverElement.theDP.replace(/@@/g, '<br>'); 
        } catch (error) {
            var thedp = "无法解析.";
        }


        let X=mouseOverElement.thePosition.X;
        let Y=mouseOverElement.thePosition.Y;
        let XX=mouseOverElement.thePosition.xx;
        let YY=mouseOverElement.thePosition.yy;
        
        let nav_innerHtml=`
        <div>
                <p style="font-size: 12px;font-weight: bolder">🔒️alt+0开关跟踪浮窗 alt+9开关固定浮窗 第${FloatingWindowOfElement.iframeLevel}层iframe</p>
                <hr>
                <div>
                    <p style="font-size: 12px;font-weight: bolder">🔹alt+1 复制DP坐标语法</p>
                    <p style="font-size: 12px;">浏览器坐标 x:${X} y:${Y}  ${XX} ${YY}</p>
                    <hr>
                    <p style="font-size: 12px;font-weight: bolder">🔹alt+2 复制XPath唯一语法--></p>
                    <p style="font-size: 12px;">${mouseOverElement.theXpath}</p>
                    <hr>
                    <p style="font-size: 12px;font-weight: bolder">🔹alt+3 复制DP自定义语法.--></p>
                    <p style="font-size: 10px;">${thedp}</p>

                </div>

        </div>
        `        
       this.$navbar.append(nav_innerHtml);
       this._moveWindow(X+20,Y+20);
    },
    // 移动窗口，智能检查碰撞
    _moveWindow(){
        const OFFSET = 300;
        const pianyi = 20;
    
        // 获取导航栏元素
        const $daohanglan =this.$navbar;
    
        setTimeout(function () {
            // 获取元素的宽度（包括边框、内边距和滚动条）
            const width = $daohanglan.outerWidth();
    
            // 获取元素的高度（包括边框、内边距和滚动条）
            const height = $daohanglan.outerHeight();
    
            // 获取鼠标事件的 X 和 Y 坐标
            const clientX = mouseOverElement.thePosition.X;
            
            const pageY = mouseOverElement.thePage.Y;
    
            // 根据窗口大小和鼠标位置设置左侧位置
            if (clientX < $(window).outerWidth() - width - 40) {
                $daohanglan.css('left', clientX + pianyi + 'px');
            } else {
                $daohanglan.css('left', clientX - pianyi - width + 'px');
            }
    
            // 根据窗口大小和鼠标位置设置顶部位置
            if (pageY < $(window).outerHeight() - height - 40) {
                $daohanglan.css('top', pageY + pianyi + 'px');
            } else {
                $daohanglan.css('top', pageY - pianyi - height + 'px');
            }
    
        }, 0); // 延迟0毫秒（即立即执行）
    }, 
    displayWindow() {
        this.$navbar.show();
        ConfigBox.set("是否显示浮窗", true);
        this._isShow = true;
    },
    hideWindow() {
        this.$navbar.hide();
        ConfigBox.set("是否显示浮窗", false);
        this._isShow = false;
        ElementsBorderDrawer.clear();
    },
    switchWindow() {
        if (this.$navbar.is(":visible")) {
            this.hideWindow();
        } else {
            this.displayWindow();
        }
    },   
    
    init() {
        this.createWindow();
        ConfigBox.get("是否显示浮窗").then(function(value) {
            if (value) {
                FloatingWindowOfElement.displayWindow();
            } else {
                FloatingWindowOfElement.hideWindow();
            }
        });
    }
};

FloatingWindowOfElement.init();







//#region  鼠标悬浮处元素-----------
const mouseOverElement = {
    _lastElement: null,
    theElement: null,
    theXpath: "",
    theDP: "",
    thePosition: {
        X:0,
        Y:0,
        xx:0,
        yy:0,
    },
    thePage:{
        X:0,
        Y:0,
    },

    // 更新当前鼠标悬浮的元素
    updateMouseOverElement(event) {
        
        
        // 获取鼠标当前位置的元素
        const element = document.elementFromPoint(event.clientX, event.clientY);
        mouseOverElement.thePosition.X = event.clientX;
        mouseOverElement.thePosition.Y = event.clientY;
        mouseOverElement.thePosition.xx = event.clientX/document.body.scrollWidth;
        mouseOverElement.thePosition.yy = event.clientY/document.body.scrollHeight
        mouseOverElement.thePage.X = event.pageX;
        mouseOverElement.thePage.Y = event.pageY;

       

        // 更新 theElement 为当前鼠标悬浮的元素
        mouseOverElement.theElement = element;
        // 更新 theXpath 为当前鼠标悬浮的元素的 XPath
        mouseOverElement.theXpath = XPathParser.getXPath(element);
        // 更新 theDP 为当前鼠标悬浮的元素的 dp
        mouseOverElement.theDP = DrissionPageParser.getDpValue(element);
        // console.log(mouseOverElement.theElement);
        // console.log("xpath-> ",mouseOverElement.theXpath);
        // 更新导航栏文本
        FloatingWindowOfElement.updateContentAndPosition();
        // 给元素上彩色
        if (FloatingWindowOfElement._isShow || staticFloatingWindow._isShowing) {
             // 检测是否是重复元素，重复元素更新语法，不更新颜色
            if(this._lastElement === element) return;
            this._lastElement = element;
            ElementsBorderDrawer.clear();
            ElementsBorderDrawer.drawBorderWithText(element, element.tagName);
        }

    },

    // 初始化事件监听
    init() {
        // 监听鼠标移动事件
        document.addEventListener('mousemove', mouseOverElement.updateMouseOverElement);
    },
}

// 初始化鼠标悬浮元素的监听
mouseOverElement.init();







//#region  键盘监听器-----------
const KeyboardListener = {
    // 初始化键盘监听器
    init() { 
        // 监听按键   F2 F8  F9  alt+1
        $(document).keydown(function(event) {
            if (event.altKey && event.key === "0") {
                FloatingWindowOfElement.switchWindow();
                
            };
            if (event.altKey && event.key === "9") {
                staticFloatingWindow.switchWindow();
                
            };
            if (event.altKey && event.key === "1") {
                SaoTools.copyDPPositionToClipboard();
                
            }
            if (event.altKey && event.key === "2") {
                SaoTools.copyXpathToClipboard();
                
            }
            if (event.altKey && event.key === "3") {
                // SaoTools.copyDpToClipboard();
                // SaoAction.catch_simple_dp_yufa_to_sao_tab1();
                SaoAction.catch_yufa_to_sao_console();
                SaoTab1.clickOnce();                
            }
            if(event.key==="F10"){
                SaoTab6.showTab6AndUpdate();
            }
       });
    },
};
KeyboardListener.init();


//#region  标签页监听器-----------
const TabListener = {

    listen_popup_background() {
        // 监听来自 popup 页面的消息
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.from === "popup" && message.to == "content") {
                // 在这里处理接收到的消息
                console.log("Received message from popup: ", message);
                if (message.action === "开关信息浮窗") {
                    FloatingWindowOfElement.switchWindow();

                }

            };
        
            if (message.action === '键鼠记录器发送消息到content-打开记录器') {
                console.log(message.action);
                KeyMouseRecorder.isOn = true;
                // alert(message);
                // 在页面上进行相关操作
            }
            if (message.data == '自动填表') {
                alert("自动填表");
            }
            
        });
    },
    send(data = {}, action = "更新状态", to = "popup") {
        chrome.runtime.sendMessage({
            from: "content",
            to: to,
            action: action,
            data: data,
        });
    },
    listenStringSeletion() {

        //监听文本选择，把消息发送给后台脚本，更新右键菜单
        document.addEventListener('selectionchange', function () {
            var selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                // console.log('Selected text:', selection.toString());
                // 更新右键菜单菜单名-有道翻译
                TabListener.send(data={youdao_text:selection.toString()},action="更新右键菜单",to="background");

            }
        });
    },
 

};


TabListener.listen_popup_background();
TabListener.listenStringSeletion();

TabListener.send(data={aa:123456789},to="sidepanel");
// TabListener.send(data={aa:123456789},action="打开侧边栏",to="background");


//#region  圆按钮-----------


const CircleButton = {
    $circleButton: null,

    createCircleButton(htmlContent) {

        CircleButton.$circleButton = $('<div></div>').attr('id', 'cebianlan').html(htmlContent);
        // 超级按钮菜单添加监听事件
        $('body').append(this.$circleButton);
        // 变成可拖拽的按钮  对话框的浮窗
        $(function () {$("#cebianlan").draggable();  });
    },
    listenMouseClick() {
        $('#sao1').click(() => { FloatingWindowOfElement.switchWindow(); });
        $('#sao7').click(() => { window.open("https://ip77.net/", "_blank"); });
        $('#sao5').click(() => { SaoTools.copyUAToClipboard(); });
        $('#sao_cookie').click(() => { SaoTools.copyCookieToClipboard(); });
        $('#sao_help_doc').click(() => { window.open("https://wxhzhwxhzh.github.io/sao/dp_helper/基本用法.html", "_blank"); });
        $('#sao_help2').click(() => { window.open("https://wxhzhwxhzh.github.io/sao/", "_blank"); });
        $('#sao_zuobiao').click( () => { SaoTools.copyOwlCenterPosition();});
        $('#sao_history').click( () => { TabListener.send(data={aa:123},action="打开侧边栏",to="background"); });
        $('#sao11').click( () => { SaoTab6.showTab6AndUpdate(); });
    },
    async init() {
        let htmlContent =await  SaoTools.loadHtmlContent("html/CircleButton.html");
        this.createCircleButton(htmlContent);
        this.listenMouseClick();
    },
}
// CircleButton.createCircleButton();
// CircleButton.listenMouseClick();
CircleButton.init();


//#region 第二个信息浮窗没用到

const FloatingWindowTwo={
    $theWindow: null,
    setup:function () {
        // 创建悬浮窗
        var $floatingWindow = $('<div>', {
            class: 'floating-window',
            id: 'floatingWindow'
        });
        this.$theWindow=$floatingWindow;
    
        // 创建标题栏
        var $titleBar = $('<div>', {
            class: 'title-bar',
            id: 'titleBar',
            text: '信息浮窗(可拖动)'
        });
    
        // 创建关闭按钮
        var $closeBtn = $('<span>', {
            class: 'close-btn',
            id: 'closeBtn',
            html: '&nbsp;&nbsp;X'
        });
    
        // 添加关闭按钮到标题栏
        $titleBar.append($closeBtn);
    
        // 点击关闭按钮隐藏浮窗
        $closeBtn.on('click', function() {
            $floatingWindow.hide();
        });
    
       // 创建内容区域
        var $content = $('<div>', {
            id: 'float_content',
            class: 'content',
            html: $('#daohanglan').html() // 使用html()方法获取元素的内容
        }).css("user-select", "text");
        // 将标题栏和内容区域添加到浮窗
        $floatingWindow.append($titleBar).append($content);
    
        // 将浮窗添加到body中
        $floatingWindow.hide().appendTo('body');
        // 使浮窗可拖动
        $(function(){ $("#floatingWindow").draggable();})
        // 更新内容
        setInterval(() => {
            $('#float_content').html(FloatingWindowOfElement.$navbar.html());
            
    
        }, 300);
        
    },
    listenMouseClick() {
        $('#sao3').click(() => { FloatingWindowTwo.$theWindow.toggle(); });
    }

}

// // 初始化悬浮窗
// FloatingWindowTwo.setup();
// // 监听鼠标点击
// FloatingWindowTwo.listenMouseClick();




//#region  固定信息浮窗shadow root window---


const staticFloatingWindow = {
    $hostElement: null,
    SaoShadowRootNode: null,
    _isShowing: ConfigBox.get("是否显示固定浮窗"),
    

    async init() {
        // 创建并初始化宿主元素
        this.$hostElement = $('<div id="SaoShadowHost"></div>');

        // 将宿主元素添加到body中
        $('body').append(this.$hostElement);  // 修正这里使用 this.$hostElement 代替 $hostElement
        // 初始化时检查是否显示浮窗
        ConfigBox.get("是否显示固定浮窗").then(function(value) {
            if (value) {
                staticFloatingWindow.displayWindow();
            } else {
                staticFloatingWindow.hideWindow();
            }
        });

        // 创建 Shadow DOM 并关联到宿主元素
         this.SaoShadowRootNode = this.$hostElement[0].attachShadow({ mode: 'open' });

        // 加载 HTML 内容
        let htmlContent = await SaoTools.loadHtmlContent("html/StaticWindow.html");

        // 将加载的 HTML 内容插入到 Shadow DOM 中
        this.SaoShadowRootNode.innerHTML = htmlContent;

        // 获取 Shadow DOM 中的 #floatingWindow 和 #float_content 元素
        const floatingWindow = $(this.SaoShadowRootNode).find('#floatingWindow');
        const float_content = $(this.SaoShadowRootNode).find('#float_content');

        // 使 floatingWindow 元素可拖动
        floatingWindow.draggable();

        // 定期更新 #float_content 内容
        setInterval(() => {
            // 假设 FloatingWindowOfElement.$navbar 是一个有效的 jQuery 对象
            float_content.html(FloatingWindowOfElement.$navbar.html());
        }, 300);
        this.listenMouseClick();
    },
    displayWindow() {
        this.$hostElement.show();
        ConfigBox.set("是否显示固定浮窗", true);
        this._isShowing=true;
    },
    hideWindow() {
        this.$hostElement.hide();
        ConfigBox.set("是否显示固定浮窗", false);
        this._isShowing=false;
    },
    switchWindow() {
        if (this.$hostElement.is(":visible")) {
            this.hideWindow();
        } else {
            this.displayWindow();
        }
    },
    listenMouseClick() {
        $('#sao3').click(() => { staticFloatingWindow.switchWindow(); });
        $(this.SaoShadowRootNode).find('#closeBtn').click(() => { staticFloatingWindow.hideWindow(); })
    }
};

staticFloatingWindow.init();


//#region  -脚本注入器--
const ScriptInjector = {
    injectCustomJs(jsPath) {
        jsPath = jsPath || 'js/inject.js';
        var temp = document.createElement('script');
        temp.setAttribute('type', 'text/javascript');
        // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
        temp.src = chrome.runtime.getURL(jsPath);
  
        document.body.appendChild(temp);
      },
    init:function(){
        // this.injectCustomJs("js/jquery-3.7.1.min.js");
        this.injectCustomJs("js/DPify.js");
        this.injectCustomJs("js/sao_eles.js");
        this.injectCustomJs("js/HookBox.js");
        this.injectCustomJs("js/HookBoxs.js");
        this.injectCustomJs("js/XpathParser.js");
    }
};


ScriptInjector.init();



//#region   键鼠记录器-----------
const KeyMouseRecorder = {


    isOn:false,
    late_time_windowSize:{width:window.outerWidth,height:window.outerHeight},
    
    
    // content.js
    send_message_to_devtool_via_background:function (msg) {
                // 发送消息给 background.js
        // chrome.runtime.sendMessage({ type: 'FROM_CONTENT', data: msg});
        // 向 background.js 发送消息
        chrome.runtime.sendMessage({ action: '发送消息到键鼠记录器', data: msg });

    },
    
    
    handleMouseClick:function (event) {
        let self=KeyMouseRecorder;
        if(self.isOn==false) return;
        // 获取鼠标点击的坐标（相对于浏览器窗口）
        const mouseX = event.clientX;
        const mouseY = event.clientY;
    
        // 获取当前浏览器的宽度和高度
        const windowWidth = window.outerWidth;
        const windowHeight = window.outerHeight;
    
        // 获取当前时间（ISO 格式）
        const currentTime = new Date().toISOString();
    
        // 获取当前网页的 URL
        const currentUrl = window.location.href;
    
        // 创建一个 JSON 对象并打印
        const clickData = {
            type: 'click',
            mouseX: mouseX,
            mouseY: mouseY,
            windowWidth: windowWidth,
            windowHeight: windowHeight,
            time: currentTime,
            isSizeChanged:false,
            url: currentUrl
        };
        if(self.late_time_windowSize.width==clickData.windowWidth && self.late_time_windowSize.height==clickData.windowHeight){
            clickData.isSizeChanged=false;       
        }else{
            clickData.isSizeChanged=true;
            self.late_time_windowSize.width=clickData.windowWidth;
            self.late_time_windowSize.height=clickData.windowHeight;
        }
    
        // console.log(JSON.stringify(clickData));
        KeyMouseRecorder.send_message_to_devtool_via_background(JSON.stringify(clickData));
    },
    

    
    // 监听页面上输入框失去焦点的事件
    
    handleBlurTarget(target) {
        if(this.isOn==false) return;
        // 获取元素的当前值（文本内容）
        const inputValue = target.value;
    
        // 获取当前浏览器的宽度和高度
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        // 获取当前时间（ISO 格式）
        const currentTime = new Date().toISOString();
    
        // 获取当前网页的 URL
        const currentUrl = window.location.href;
    
        // 创建一个 JSON 对象并打印
        const inputData = {
            type: 'input',
            inputValue: inputValue,
            windowWidth: windowWidth,
            windowHeight: windowHeight,
            time: currentTime,
            url: currentUrl
        };
    
        // console.log(JSON.stringify(inputData));
        this.send_message_to_devtool_via_background(JSON.stringify(inputData));
    },
    
    
    
    
    
    
    // 通过事件委托监听所有的 input 和 textarea 元素的失去焦点事件
    listenToInputAndTextarea() {
        $(document).on('blur', 'input, textarea', function() {
            console.log('失去焦点的元素值:', $(this).val());
            KeyMouseRecorder.handleBlurTarget(this);
        });   
    
    },
    

        // 绑定鼠标点击事件

    listenMouseClick: function () {
        document.addEventListener('click', KeyMouseRecorder.handleMouseClick);      
    },

    start:function () {
        KeyMouseRecorder.listenMouseClick();
        KeyMouseRecorder.listenToInputAndTextarea();
    }


}
KeyMouseRecorder.start();






  




















