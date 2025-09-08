
// 判断是否已经加载 jQuery
if (typeof jQuery === 'undefined') {
    // 创建一个 script 元素
    const script = document.createElement('script');
    // 设置 jQuery 的 CDN 地址，这里使用 jQuery 3.7.1 版本
    script.src = 'https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js';
    script.onload = function() {
        // jQuery 加载完成后执行的代码
        console.log('jQuery 加载完成');
        // 这里可以放置依赖 jQuery 的代码
    };
    script.onerror = function() {
        // jQuery 加载失败时执行的代码
        console.error('无法加载 jQuery');
    };
    // 将 script 元素添加到页面的 head 中
    document.head.appendChild(script);
}




const XPathParser= {
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



// iframe 信息生成

window._xpathParser = XPathParser;


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