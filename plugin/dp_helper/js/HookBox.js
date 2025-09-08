const HookBox = {
    config:{res_json:false,
         res_text:false,
         xhr:false,
         fetch:false,
         json_stringify:false,
         json_parse:false,
         websocket_send:false,
         createElement:false,
         setAttribute:false,
         },

  

    hook_res_json: function () {
        
        // 保存原始的 Response.prototype.json 方法
        const originalJson = Response.prototype.json;

        // 重写 Response.prototype.json 方法
        Response.prototype.json = function () {
            return originalJson.call(this).then((data) => {
                // 在控制台打印 JSON 数据
                console.log('Hook Response.JSON => ', data);

                // 返回原始的 JSON 数据
                return data;
            });
        };
        console.log("Hooked response.json");


    },
    hook_res_text: function () {
        // 保存原始的 Response.prototype.text 方法
        const originalText = Response.prototype.text;
    
        // 重写 Response.prototype.text 方法
        Response.prototype.text = function () {
            return originalText.call(this).then((data) => {
                // 在控制台打印返回的文本数据
                console.log('Hook Response.TEXT => ', data);
    
                // 返回原始的文本数据
                return data;
            });
        };
        console.log("Hooked response.text");
    },
    
    hook_xhr:function () {
        let openCache = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function (method, url) {
            console.log("Hook xhr method => %s, url => %s", method, url);
            if (url.indexOf("spiderapi.cn") !== -1) {
                // debugger;
            }
            return openCache.apply(this, arguments);
        };
        console.log("Hooked xhr");
    },

    hook_fetch:function () {
        let fetchCache = Object.getOwnPropertyDescriptor(window, "fetch");
        Object.defineProperty(window, "fetch", {
            value: function (url) {
                console.log("Hook fetch url => ", url);
                // debugger;
                return fetchCache.value.apply(this, arguments);
            }
        });
        console.log("Hooked fetch");
    },
    hook_json_stringify: function (back_to_normal=false) {
        let stringifyCache = JSON.stringify;
    
        if (back_to_normal) {
            // 恢复原始的 JSON.stringify
            JSON.stringify = stringifyCache;
            console.log("Restored original JSON.stringify");
        } else {
            // Hook JSON.stringify
            JSON.stringify = function (params) {
                console.log("Hook JSON.stringify => ", params);
                return stringifyCache(params);
            };
            console.log("Hooked JSON.stringify");
        }
    },
    
    hook_json_parse:function () {
        let parseCache = JSON.parse;
        JSON.parse = function (params) {
            console.log("Hook JSON.parse => ", params);
            // debugger;
            return parseCache(params);
        };
        console.log("Hooked JSON.parse");
    },
    hook_websocket_send:function () {
        let sendCache = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            console.info("Hook WebSocket send => ", data);
            return sendCache(data);
        };
        console.log("Hooked WebSocket send");
    },

    hook_createElement:function () {
        let createElementCache = document.createElement;
        document.createElement = function (tagName) {
            console.info("Hook createElement tagName => ", tagName);
            if(tagName === "div") {
                // debugger;
            }
            return createElementCache(tagName);
        };
        console.log("Hooked createElement");
    },
    hook_setAttribute:function () {
        // 保存原始的 setAttribute 方法
        const originalSetAttribute = Element.prototype.setAttribute;

        // 重写 setAttribute 方法
        Element.prototype.setAttribute = function(name, value) {
        // 在调用原方法前打印日志或执行其他操作
        // console.log(`Hook setAttribute =>: ${name} = ${value}`);
        console.log(`Hook setAttribute => Element:`, this.tagName, `Attribute: ${name} = ${value}`);

        // 调用原始的 setAttribute 方法
        originalSetAttribute.call(this, name, value);

    
        };
        console.log("Hooked setAttribute");
    },
    
    
    
    
    
    

    init: function () {

        if (this.config.res_json)  this.hook_res_json();
        if (this.config.res_text) this.hook_res_text();
        if (this.config.xhr) this.hook_xhr();
        if (this.config.fetch) this.hook_fetch();
        if (this.config.json_stringify) this.hook_json_stringify();
        if (this.config.json_parse) this.hook_json_parse();
        if (this.config.websocket_send) this.hook_websocket_send();
        if (this.config.createElement) this.hook_createElement();
        if (this.config.setAttribute) this.hook_setAttribute();
        
    },
    showConfig:function () {
               
        console.log('骚神插件HOOKBOX 功能加载.. ');
        console.table(this.config);
    },
    loadConfig:function (config) {
        this.config = config;
        this.init();
    }
};


// HookBox.init();
