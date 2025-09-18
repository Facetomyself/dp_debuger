// DrissionPage 调试工具（无表情符、结构化日志）
(function () {
    'use strict';

    function ts() { return new Date().toISOString(); }
    function info(msg) { console.log(ts() + ' [DP_DEBUG] ' + msg); }
    function warn(msg) { console.warn(ts() + ' [DP_DEBUG] ' + msg); }
    function error(msg) { console.error(ts() + ' [DP_DEBUG] ' + msg); }

    if (window.DP_DEBUG) { return; }

    // 创建全局调试对象
    window.DP_DEBUG = {
        domObserver: null,
        performanceInterval: null,

        getAllCookies: function () { return document.cookie; },

        getLocalStorage: function () {
            var items = {};
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    items[key] = localStorage.getItem(key);
                }
            } catch (e) { warn('getLocalStorage failed: ' + e); }
            return items;
        },

        getSessionStorage: function () {
            var items = {};
            try {
                for (var i = 0; i < sessionStorage.length; i++) {
                    var key = sessionStorage.key(i);
                    items[key] = sessionStorage.getItem(key);
                }
            } catch (e) { warn('getSessionStorage failed: ' + e); }
            return items;
        },

        // XHR 拦截
        interceptXHR: function () {
            try {
                var originalOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function (method, url) {
                    info('[XHR] ' + method + ' ' + url);
                    this.addEventListener('load', function () {
                        info('[XHR_RESPONSE] ' + this.status + ' ' + this.responseURL);
                    });
                    return originalOpen.apply(this, arguments);
                };
                info('XHR interceptor enabled');
            } catch (e) { error('interceptXHR failed: ' + e); }
        },

        // fetch 拦截
        interceptFetch: function () {
            try {
                if (!window.fetch) { warn('fetch not available'); return; }
                var _fetch = window.fetch;
                window.fetch = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var input = args[0];
                    var init = args[1] || {};
                    var method = (init && init.method) || 'GET';
                    var url = (typeof input === 'string') ? input : (input && input.url) || '';
                    info('[FETCH] ' + method + ' ' + url);
                    return _fetch.apply(this, args).then(function (resp) {
                        try { info('[FETCH_RESPONSE] ' + resp.status + ' ' + (resp.url || url)); } catch (_) {}
                        return resp;
                    });
                };
                info('Fetch interceptor enabled');
            } catch (e) { error('interceptFetch failed: ' + e); }
        },

        // DOM 变化监听
        startDOMObserver: function () {
            if (this.domObserver) { info('DOM observer already running'); return; }
            try {
                var obs = new MutationObserver(function (mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                        var mu = mutations[i];
                        if (mu.type === 'childList' && mu.addedNodes && mu.addedNodes.length) {
                            info('[DOM] added ' + mu.addedNodes.length + ' node(s)');
                        }
                    }
                });
                obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
                this.domObserver = obs;
                info('DOM observer started');
            } catch (e) { error('startDOMObserver failed: ' + e); }
        },

        stopDOMObserver: function () {
            if (this.domObserver) { this.domObserver.disconnect(); this.domObserver = null; info('DOM observer stopped'); }
        },

        getPageStats: function () {
            return {
                url: window.location.href,
                title: document.title,
                cookiesCount: (document.cookie || '').split(';').filter(function (s) { return s.trim(); }).length,
                localStorageCount: (function(){ try { return localStorage.length; } catch (_) { return 0; } })(),
                sessionStorageCount: (function(){ try { return sessionStorage.length; } catch (_) { return 0; } })(),
                scriptsCount: (document.scripts || []).length,
                linksCount: (document.links || []).length,
                imagesCount: (document.images || []).length
            };
        },

        startPerformanceMonitor: function (intervalMs) {
            if (this.performanceInterval) { info('Performance monitor already running'); return; }
            var step = Math.max(1000, Number(intervalMs) || 5000);
            var self = this;
            this.performanceInterval = setInterval(function () {
                try {
                    var timing = (performance && performance.timing) || {};
                    var mem = (performance && performance.memory) || {};
                    info('[PERF] usedJSHeapMB=' + (mem.usedJSHeapSize ? Math.round(mem.usedJSHeapSize / 1048576) : 'n/a') +
                         ' load=' + (timing.loadEventEnd && timing.navigationStart ? (timing.loadEventEnd - timing.navigationStart) : 'n/a') + 'ms');
                } catch (e) { warn('perf read failed: ' + e); }
            }, step);
            info('Performance monitor started');
        },

        stopPerformanceMonitor: function () {
            if (this.performanceInterval) { clearInterval(this.performanceInterval); this.performanceInterval = null; info('Performance monitor stopped'); }
        }
    };

    info('Debug utilities ready');
})();

