//  加载json数据并渲染都网页中

document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('nav-list');
    const codeSnippets = document.getElementById('code-snippets');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.snippets.forEach(snippet => {
                // 添加导航项
                const navItem = document.createElement('li');
                const navLink = document.createElement('a');
                navLink.href = `#${snippet.id}`;
                navLink.textContent = snippet.title;
                navItem.appendChild(navLink);
                navList.appendChild(navItem);

                // 添加代码块
                const codeBlock = document.createElement('div');
                codeBlock.className = 'code-block';
                codeBlock.id = snippet.id;

                // 添加标题
                const titleElement = document.createElement('h3');
                titleElement.textContent = snippet.title;  // 显示标题
                codeBlock.appendChild(titleElement);

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = '复制';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(snippet.code).then(() => {
                        alert('代码已复制到剪贴板！');
                    });
                };
                codeBlock.appendChild(copyButton);

                const codeElement = document.createElement('pre');
                codeElement.textContent = snippet.code;
                codeBlock.appendChild(codeElement);

                codeSnippets.appendChild(codeBlock);
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
