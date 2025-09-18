// DrissionPage Cookie Monitor（无表情符、结构化日志）
// 目标：拦截 document.cookie 读写，记录 add/update/delete/read，并支持断点规则
(function () {
    'use strict';

    var TS = function () { return new Date().toISOString(); };
    var LOG_PREFIX = '[DP_COOKIE]';
    function info(msg, obj) { if (obj !== undefined) { console.log(TS() + ' ' + LOG_PREFIX + ' ' + msg, obj); } else { console.log(TS() + ' ' + LOG_PREFIX + ' ' + msg); } }
    function warn(msg) { console.warn(TS() + ' ' + LOG_PREFIX + ' ' + msg); }
    function error(msg) { console.error(TS() + ' ' + LOG_PREFIX + ' ' + msg); }

    if (window.DP_COOKIE_MONITOR) { return; }

    function parseCookieString(str) {
        var input = String(str || '');
        var semi = input.indexOf(';');
        var pair = semi >= 0 ? input.slice(0, semi) : input;
        var eq = pair.indexOf('=');
        var name = eq >= 0 ? pair.slice(0, eq).trim() : pair.trim();
        var value = eq >= 0 ? pair.slice(eq + 1).trim() : '';
        return { name: decodeURIComponent(name || ''), value: decodeURIComponent(value || ''), raw: input };
    }

    function stringify(obj) { try { return JSON.stringify(obj); } catch (_) { return String(obj); } }

    function getCookieMap() {
        var out = {};
        var text = document.cookie || '';
        if (!text) { return out; }
        var parts = text.split(';');
        for (var i = 0; i < parts.length; i++) {
            var kv = parts[i].split('=');
            var k = (kv[0] || '').trim();
            if (!k) { continue; }
            var v = kv.slice(1).join('=');
            try { out[decodeURIComponent(k)] = decodeURIComponent(v || ''); }
            catch (_) { out[k] = v || ''; }
        }
        return out;
    }

    function willDelete(raw) {
        var s = String(raw || '').toLowerCase();
        if (s.indexOf('max-age') !== -1) {
            var m = /max-age\s*=\s*(-?\d+)/i.exec(s);
            if (m && Number(m[1]) <= 0) { return true; }
        }
        if (s.indexOf('expires') !== -1) {
            var e = /expires\s*=\s*([^;]+)/i.exec(s);
            if (e) { try { if (new Date(e[1]).getTime() <= Date.now()) { return true; } } catch (_) {} }
        }
        return false;
    }

    function matchRule(rule, eventName, name, value) {
        try {
            // string/regexp matches cookie name only
            if (typeof rule === 'string') { return name === rule; }
            if (rule instanceof RegExp) { return rule.test(name); }
            // object: events | name | value
            if (rule && typeof rule === 'object') {
                var okEvent = true;
                if (rule.events) {
                    okEvent = false;
                    String(rule.events).split('|').forEach(function (e) {
                        if (eventName === String(e).trim()) { okEvent = true; }
                    });
                }
                var okName = true;
                if (rule.name !== undefined) {
                    okName = (rule.name instanceof RegExp) ? rule.name.test(name) : (String(rule.name) === name);
                }
                var okValue = true;
                if (rule.value !== undefined) {
                    okValue = (rule.value instanceof RegExp) ? rule.value.test(value) : (String(rule.value) === value);
                }
                return okEvent && okName && okValue;
            }
        } catch (_) {}
        return false;
    }

    function shouldBreak(eventName, name, value) {
        var rules = (window.DP_COOKIE_MONITOR && window.DP_COOKIE_MONITOR.rules) || [];
        for (var i = 0; i < rules.length; i++) {
            if (matchRule(rules[i], eventName, name, value)) { return true; }
        }
        return false;
    }

    var originalDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') || Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie') || Object.getOwnPropertyDescriptor(document.__proto__ || {}, 'cookie');
    // Fallback in case descriptor is not reachable
    if (!originalDesc) {
        try { originalDesc = Object.getOwnPropertyDescriptor(document, 'cookie'); } catch (_) {}
    }

    function install() {
        if (!originalDesc) { warn('No original descriptor for document.cookie. Monitor may be limited.'); }
        var getFn = originalDesc && originalDesc.get ? originalDesc.get.bind(document) : function () { return '' + document.cookie; };
        var setFn = originalDesc && originalDesc.set ? originalDesc.set.bind(document) : function (v) { document.cookie = v; };

        Object.defineProperty(document, 'cookie', {
            configurable: true,
            enumerable: true,
            get: function () {
                var text = getFn();
                if (window.DP_COOKIE_MONITOR.enableEvent.read) {
                    info('READ ' + stringify({ length: (text || '').length }));
                    if (shouldBreak('read', '', '')) { debugger; }
                }
                return text;
            },
            set: function (value) {
                var parsed = parseCookieString(value);
                var before = getCookieMap();
                var existed = Object.prototype.hasOwnProperty.call(before, parsed.name);
                var prevVal = before[parsed.name];
                var evt = 'add';
                var changed = true;
                if (willDelete(value)) { evt = 'delete'; }
                else if (existed) {
                    evt = 'update';
                    changed = String(prevVal) !== String(parsed.value);
                }
                if (!changed && window.DP_COOKIE_MONITOR.ignoreUnchanged) {
                    // forward without logging when unchanged and configured to ignore
                    return setFn(value);
                }

                if (window.DP_COOKIE_MONITOR.enableEvent[evt]) {
                    info(evt.toUpperCase() + ' ' + stringify({ name: parsed.name, value: parsed.value, changed: changed }));
                    if (shouldBreak(evt, parsed.name, parsed.value)) { debugger; }
                }
                return setFn(value);
            }
        });
        info('Cookie monitor installed');
    }

    function uninstall() {
        if (originalDesc) {
            Object.defineProperty(document, 'cookie', originalDesc);
            info('Cookie monitor uninstalled');
        }
    }

    window.DP_COOKIE_MONITOR = {
        enableEvent: { add: true, update: true, delete: true, read: true },
        ignoreUnchanged: false,
        rules: [],
        setRules: function (arr) { this.rules = Array.isArray(arr) ? arr.slice() : []; info('Rules updated size=' + this.rules.length); },
        enable: function () { install(); },
        disable: function () { uninstall(); }
    };

    // auto install
    install();
})();

