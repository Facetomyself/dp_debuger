// 在document_start阶段执行
(() => {
    // 优先从本地存储获取启用状态
    const getEnabledScripts = () => {
        try {
            const hostname = window.location.hostname;
            const storageData = localStorage.getItem('AntiDebug_Breaker');
            if (storageData) {
                const parsed = JSON.parse(storageData);
                return parsed[hostname] || [];
            }
        } catch (e) {
            console.warn('[AntiDebug] Failed to read localStorage', e);
        }
        return [];
    };

    // 从扩展存储获取最新状态
    const hostname = window.location.hostname;
    chrome.storage.local.get([hostname], (result) => {
        const latestEnabledScripts = result[hostname] || [];

        // 更新本地存储
        try {
            const storageData = localStorage.getItem('AntiDebug_Breaker') || '{}';
            const parsed = JSON.parse(storageData);
            parsed[hostname] = latestEnabledScripts.filter(
                id => typeof id === 'string' && id.trim() !== ''
            );
            localStorage.setItem('AntiDebug_Breaker', JSON.stringify(parsed));
        } catch (e) {
            console.warn('[AntiDebug] Failed to update localStorage', e);
        }
    });

    // 监听来自popup的更新
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'scripts_updated' && message.hostname === hostname) {
            // 更新本地存储
            try {
                const storageData = localStorage.getItem('AntiDebug_Breaker') || '{}';
                const parsed = JSON.parse(storageData);
                parsed[hostname] = message.enabledScripts;
                localStorage.setItem('AntiDebug_Breaker', JSON.stringify(parsed));
            } catch (e) {
                console.warn('[AntiDebug] Failed to update localStorage', e);
            }
        }
    });
})();
