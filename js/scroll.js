// 页面滚动辅助工具（无表情符、结构化日志）
(function () {
    'use strict';

    function ts() { return new Date().toISOString(); }
    function log(msg) { console.log(ts() + ' [DP_SCROLL] ' + msg); }
    function warn(msg) { console.warn(ts() + ' [DP_SCROLL] ' + msg); }

    if (window.DP_SCROLL) { return; }

    function smoothScrollToElement(el, options) {
        try {
            options = options || {};
            var offset = Number(options.offset || 0);
            var behavior = options.behavior || 'smooth';
            var rect = el.getBoundingClientRect();
            var y = Math.max(0, rect.top + window.pageYOffset + offset);
            window.scrollTo({ top: y, behavior: behavior });
            log('Scrolled to element. top=' + y + ' behavior=' + behavior);
            return true;
        } catch (e) { warn('smoothScrollToElement failed: ' + e); return false; }
    }

    window.DP_SCROLL = {
        to: function (selector, options) {
            var el = (typeof selector === 'string') ? document.querySelector(selector) : selector;
            if (!el) { warn('Element not found for selector: ' + selector); return false; }
            return smoothScrollToElement(el, options);
        },
        toId: function (id, options) {
            var el = document.getElementById(id);
            if (!el) { warn('Element not found by id: ' + id); return false; }
            return smoothScrollToElement(el, options);
        }
    };

    log('Scroll utilities ready');
})();

