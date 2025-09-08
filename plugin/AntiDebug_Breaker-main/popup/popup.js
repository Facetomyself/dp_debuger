document.addEventListener('DOMContentLoaded', () => {
    const scriptsGrid = document.querySelector('.scripts-grid');
    const noResults = document.querySelector('.no-results');
    const searchInput = document.getElementById('search-input');

    // 获取当前标签页的域名
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tab = tabs[0];
        if (!tab || !tab.url) return;

        const hostname = new URL(tab.url).hostname;

        // 加载脚本元数据
        fetch(chrome.runtime.getURL('scripts.json'))
            .then(response => response.json())
            .then(scripts => {
                // 获取该域名下的启用状态
                chrome.storage.local.get([hostname], (result) => {
                    const enabledScripts = result[hostname] || [];
                    renderScripts(scripts, enabledScripts, hostname, tab);

                    // 搜索功能
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        const filteredScripts = scripts.filter(script =>
                            script.name.toLowerCase().includes(searchTerm) ||
                            script.description.toLowerCase().includes(searchTerm)
                        );
                        renderScripts(filteredScripts, enabledScripts, hostname, tab);
                    });
                });
            });
    });

    // 渲染脚本网格
    function renderScripts(scripts, enabledScripts, hostname, tab) {
        scriptsGrid.innerHTML = '';

        if (scripts.length === 0) {
            noResults.style.display = 'flex';
            return;
        }

        noResults.style.display = 'none';

        scripts.forEach(script => {
            // 确保只处理有效的脚本ID
            if (typeof script.id !== 'string' || !script.id.trim()) {
                console.error('Invalid script ID:', script);
                return;
            }

            const isEnabled = enabledScripts.includes(script.id);

            const scriptItem = document.createElement('div');
            scriptItem.className = `script-item ${isEnabled ? 'active' : ''}`;

            // 截断过长的描述
            let description = script.description;
            if (description.length > 120) {
                description = description.substring(0, 120) + '...';
            }

            scriptItem.innerHTML = `
        <div class="script-content">
          <div class="script-header">
            <div class="script-name">${script.name}</div>
            <label class="switch">
              <input type="checkbox" ${isEnabled ? 'checked' : ''} data-id="${script.id}">
              <span class="slider"></span>
            </label>
          </div>
          <div class="script-description">${description}</div>
        </div>
      `;

            scriptsGrid.appendChild(scriptItem);

            // 添加开关事件
            const checkbox = scriptItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                const scriptId = e.target.dataset.id;
                const isChecked = e.target.checked;

                chrome.storage.local.get([hostname], (result) => {
                    let enabled = result[hostname] || [];

                    // 确保只添加有效的字符串ID
                    if (typeof scriptId !== 'string' || !scriptId.trim()) {
                        console.error('Invalid script ID in change event:', scriptId);
                        return;
                    }

                    if (isChecked) {
                        if (!enabled.includes(scriptId)) {
                            enabled.push(scriptId);
                            scriptItem.classList.add('active');
                        }
                    } else {
                        enabled = enabled.filter(id => id !== scriptId);
                        scriptItem.classList.remove('active');
                    }

                    // 更新存储
                    chrome.storage.local.set({[hostname]: enabled}, () => {
                        // 通知后台更新脚本注册
                        chrome.runtime.sendMessage({
                            type: 'update_scripts_registration',
                            hostname: hostname,
                            enabledScripts: enabled
                        });

                        // 通知标签页更新状态
                        chrome.tabs.sendMessage(tab.id, {
                            type: 'scripts_updated',
                            hostname: hostname,
                            enabledScripts: enabled
                        });
                    });
                });
            });
        });
    }
});