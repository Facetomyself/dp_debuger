// JS模块管理器
// 用于管理DrissionPage调试工具的所有JS模块

(function() {
    'use strict';

    console.log('📦 [MODULE_MANAGER] 模块管理器已启动');

    // 模块状态跟踪
    window.DP_MODULES = {
        loaded: [],
        failed: [],
        status: 'initializing'
    };

    // 模块加载器
    window.DP_MODULES.loadModule = function(moduleName, moduleCode) {
        try {
            // 执行模块代码
            eval(moduleCode);

            // 记录加载成功的模块
            this.loaded.push({
                name: moduleName,
                loadedAt: new Date().toISOString(),
                size: moduleCode.length
            });

            console.log(`✅ [MODULE_MANAGER] 模块 "${moduleName}" 加载成功 (${moduleCode.length} 字符)`);
            return true;

        } catch (error) {
            // 记录加载失败的模块
            this.failed.push({
                name: moduleName,
                error: error.message,
                failedAt: new Date().toISOString()
            });

            console.error(`❌ [MODULE_MANAGER] 模块 "${moduleName}" 加载失败:`, error);
            return false;
        }
    };

    // 获取模块状态
    window.DP_MODULES.getStatus = function() {
        return {
            status: this.status,
            loadedCount: this.loaded.length,
            failedCount: this.failed.length,
            loadedModules: this.loaded.map(m => m.name),
            failedModules: this.failed.map(m => ({name: m.name, error: m.error}))
        };
    };

    // 重新加载失败的模块
    window.DP_MODULES.retryFailed = function() {
        console.log('🔄 [MODULE_MANAGER] 正在重试加载失败的模块...');

        var retryCount = 0;
        this.failed.forEach(function(failedModule) {
            // 这里可以添加重新加载逻辑
            // 由于模块代码已经在Python端组合，我们这里只是记录
            console.log(`⏳ [MODULE_MANAGER] 模块 "${failedModule.name}" 需要重新加载`);
            retryCount++;
        });

        if (retryCount === 0) {
            console.log('✅ [MODULE_MANAGER] 没有需要重试的模块');
        }
    };

    // 初始化完成
    window.DP_MODULES.status = 'ready';
    console.log('🎉 [MODULE_MANAGER] 模块管理器初始化完成');

    // 提供全局访问接口
    window.dpGetModuleStatus = function() {
        return window.DP_MODULES.getStatus();
    };

    window.dpRetryModules = function() {
        return window.DP_MODULES.retryFailed();
    };

})();
