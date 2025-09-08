// DrissionPage 调试工具 - 调试辅助脚本
// 包含 DOM 监听器、XHR 拦截器等功能

(function() {
    'use strict';

    console.log('🔧 [DP_DEBUG] 调试工具模块已加载');

    // 创建全局调试对象
    window.DP_DEBUG = {
        // 获取所有Cookie
        getAllCookies: function() {
            return document.cookie;
        },

        // 获取LocalStorage
        getLocalStorage: function() {
            var items = {};
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                items[key] = localStorage.getItem(key);
            }
            return items;
        },

        // 获取SessionStorage
        getSessionStorage: function() {
            var items = {};
            for (var i = 0; i < sessionStorage.length; i++) {
                var key = sessionStorage.key(i);
                items[key] = sessionStorage.getItem(key);
            }
            return items;
        },

        // XHR请求拦截器
        interceptXHR: function() {
            var originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                console.log('[XHR] ' + method + ' ' + url);
                this.addEventListener('load', function() {
                    console.log('[XHR Response] ' + this.responseURL + ' Status: ' + this.status);
                });
                return originalOpen.apply(this, arguments);
            };
            console.log('🌐 [DP_DEBUG] XHR拦截器已启动');
        },

        // DOM变化监听器
        startDOMObserver: function() {
            if (this.domObserver) {
                console.log('👁️ [DP_DEBUG] DOM监听器已在运行');
                return;
            }

            this.domObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const tagName = node.tagName ? node.tagName.toLowerCase() : '';
                                const className = node.className || '';
                                const id = node.id || '';
                                const currentTime = new Date().toLocaleTimeString();

                                // 只记录重要的DOM变化
                                if (tagName === 'div' || tagName === 'span' || tagName === 'p' ||
                                    className.includes('message') || className.includes('chat') ||
                                    className.includes('comment')) {
                                    console.log('[DOM] ' + currentTime + ' - ' + tagName +
                                              (id ? '#' + id : '') +
                                              (className ? '.' + className : '') +
                                              ' - ' + (node.textContent || '').substring(0, 100));
                                }
                            }
                        });
                    }
                });
            });

            // 开始观察整个文档
            try {
                this.domObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false
                });
                console.log('👁️ [DP_DEBUG] DOM监听器已启动');
            } catch (e) {
                console.error('❌ [DP_DEBUG] DOM监听器启动失败:', e);
            }
        },

        // 停止DOM监听器
        stopDOMObserver: function() {
            if (this.domObserver) {
                this.domObserver.disconnect();
                this.domObserver = null;
                console.log('🛑 [DP_DEBUG] DOM监听器已停止');
            }
        },

        // 获取页面统计信息
        getPageStats: function() {
            return {
                url: window.location.href,
                title: document.title,
                cookiesCount: document.cookie.split(';').length,
                localStorageCount: localStorage.length,
                sessionStorageCount: sessionStorage.length,
                scriptsCount: document.scripts.length,
                linksCount: document.links.length,
                imagesCount: document.images.length
            };
        },

        // 页面性能监控
        startPerformanceMonitor: function() {
            if (this.performanceInterval) {
                console.log('📊 [DP_DEBUG] 性能监控已在运行');
                return;
            }

            this.performanceInterval = setInterval(function() {
                const memory = performance.memory;
                const timing = performance.timing;
                const now = new Date().toLocaleTimeString();

                console.log('[PERF] ' + now +
                          ' | Memory: ' + Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB' +
                          ' | Load: ' + (timing.loadEventEnd - timing.navigationStart) + 'ms');
            }, 5000);

            console.log('📊 [DP_DEBUG] 性能监控已启动');
        },

        // 停止性能监控
        stopPerformanceMonitor: function() {
            if (this.performanceInterval) {
                clearInterval(this.performanceInterval);
                this.performanceInterval = null;
                console.log('🛑 [DP_DEBUG] 性能监控已停止');
            }
        }
    };

    console.log('✅ [DP_DEBUG] 调试工具模块初始化完成');

})();
