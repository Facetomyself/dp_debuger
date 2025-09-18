// JS 模块管理器（无表情符、结构化日志）
(function () {
    'use strict';

    function nowISO() { return new Date().toISOString(); }
    function log(level, message, extra) {
        var line = nowISO() + ' [DP_MODULES] ' + message;
        if (extra !== undefined) { console[level](line, extra); }
        else { console[level](line); }
    }

    if (!window.DP_MODULES) {
        window.DP_MODULES = {
            status: 'initializing',
            loaded: [],
            failed: [],
            load: function (moduleName, moduleCode) {
                try {
                    (0, eval)(String(moduleCode));
                    this.loaded.push({ name: moduleName, time: nowISO(), size: String(moduleCode || '').length });
                    log('log', 'Loaded module "' + moduleName + '"');
                    return true;
                } catch (err) {
                    this.failed.push({ name: moduleName, error: String(err), time: nowISO() });
                    log('error', 'Failed to load module "' + moduleName + '": ' + (err && err.message ? err.message : err));
                    return false;
                }
            },
            getStatus: function () {
                return {
                    status: this.status,
                    loadedCount: this.loaded.length,
                    failedCount: this.failed.length,
                    loaded: this.loaded.map(function (m) { return m.name; }),
                    failed: this.failed.map(function (m) { return m.name; })
                };
            },
            retryFailed: function () {
                var list = this.failed.slice();
                this.failed = [];
                if (!list.length) { log('log', 'No failed modules to retry'); return; }
                for (var i = 0; i < list.length; i++) {
                    log('log', 'Retry required for module "' + list[i].name + '"');
                }
            }
        };

        window.dpGetModuleStatus = function () { return window.DP_MODULES.getStatus(); };
        window.dpRetryModules = function () { return window.DP_MODULES.retryFailed(); };
    }

    window.DP_MODULES.status = 'ready';
    log('log', 'Module manager ready');
})();

