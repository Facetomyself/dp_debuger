window.dp_eles = 0;
function addDpValue(element) {
    // 如果元素已经有 dp 属性，则跳过
    if (element.dp)
        return;
    // 获取元素的 tagName、id 和 textContent
    let tagName = element.tagName.toLowerCase();
    // 将 tagName 转换为小写
    // 排除一些不需要的标签
    if (tagName == 'body' || tagName == 'header' || tagName == 'style' || tagName == 'script') {
        element.dp = '跳过';
        return;
    }

    let txt = element.innerText;
    // 排除一些没有的文本的元素    
    let textContent = txt == '' ? '' : '@@tx()=' + txt;

    // 构建属性部分
    let attributes = '';
    Array.from(element.attributes).forEach(function(attr) {
        // 每个属性的格式为 name=value
        let attr_info = `@@${attr.name}=${attr.value}`;
        // 排除一些不需要的属性
        if (attr.name == 'src' || attr.name == 'href')
            attr_info = '';
        attributes += attr_info;
    });

    // 格式化 dp 值
    let dpValue = `t:${tagName}${attributes}${textContent}`;

    // 设置 dp 属性
    element.dp = dpValue;

}

function DPify() {
    // 遍历所有的不含dp属性的 HTML 元素, 并为其添加dp属性
    let elements = document.querySelectorAll('*:not([dp])');
    if (elements.length == dp_eles) {
        return;
    } else {
        elements.forEach(addDpValue);
        // console.log('DPify 已完成,本次更新元素数', elements.length);
        dp_eles = elements.length;
    }
}

DPify();
window.to_dp=DPify;

// setInterval(DPify, 1000)