/**
 * 创建单选按钮组
 * @param {Array} options - 包含单选按钮选项的数组
 */
function createRadioButtons(options) {
    // 获取id为option的div元素，用于放置单选按钮
    var optionDiv = document.getElementById('option');

    // 清空div中原有的内容
    optionDiv.innerHTML = '';

    // 遍历options数组中的每个选项
    options.forEach(function (optionText, index) {
        // 创建一个单选按钮input元素
        var radioButton = document.createElement('input');
        // 设置单选按钮的类型为radio
        radioButton.type = 'radio';
        // 设置单选按钮的name属性，确保单选效果
        radioButton.name = 'option';
        // 设置单选按钮的值为选项文本
        radioButton.value = optionText;
        // 设置单选按钮的样式，底部外边距为5像素
        radioButton.style.marginBottom = '5px';

        // 如果是第一个选项，设置单选按钮为选中状态
        if (index === 0) {
            radioButton.checked = true;
        }

        // 创建一个label标签，用于显示选项文本
        var label = document.createElement('label');
        // 设置label的文本内容为选项文本
        label.textContent = optionText;
        // 设置label的样式，右侧外边距为10像素
        label.style.marginRight = '10px';

        // 将单选按钮添加到label标签中
        label.appendChild(radioButton);
        // 将label标签添加到optionDiv中
        optionDiv.appendChild(label);
    });
}



var optionsArray = ['不修饰', 'eles', 'click()', 'input()', 'text','相对定位'];

// 调用函数，传入数组参数
createRadioButtons(optionsArray);



//  监听智能补全 单选框的点击事件
document.getElementById('option').addEventListener('click', function (event) {
    this.querySelectorAll('input[name="option"]').forEach((r) => {
        if(r.checked){
            console.log('被选中 ',r.value);
            update_smart_fill(r);
        }
    })
})
;

function update_smart_fill(ele) {
    let temp = 'erro';
    var DP_content = document.getElementById('xuanze_info');
    var temp_content = [window.DP, `eles('${window.DP}')`, `page('${window.DP}').click()`, `page('${window.DP}').input()`, `page('${window.DP}').text`]
    if (ele.checked) {
        console.log(ele.value); // 打印选中的单选框的值
        console.log(window.DP); // 打印选中的单选框的 DOM 元素.
        switch (ele.value) {
            case '不修饰':
                temp = temp_content[0];
                break;
            case 'eles':
                temp = temp_content[1];
                break;
            case 'click()':
                temp = temp_content[2];
                break;
            case 'input()':
                temp = temp_content[3];
                break;
            case 'text':
                temp = temp_content[4];
                break;
            case '相对定位':
                temp =`page('${toDP_yufa(window.info_father)}').after('t:${window.info_json.tagname}')` ;
                break;
            default:
                temp = 'erro'
        }
        DP_content.value = temp;
    }
}

/**
 * 将 JSON 字符串转换为特定的字符串格式
 * @param {string} json_string - 要转换的 JSON 字符串
 * @returns {string} - 转换后的字符串
 */
function toDP_yufa(json_string) {
    // 将 JSON 字符串解析为对象
    let temp_json = JSON.parse(json_string);
    // 初始化字符串
    let temp_string = 't:' + temp_json.tagname;

    // 如果对象有 id 属性，则将其添加到字符串中
    if (temp_json.id) {
        temp_string += '@@id=' + temp_json.id;
        return temp_string;
    }
    // 如果对象有 innerText 属性，则将其添加到字符串中
    if (temp_string.innerText) {
        temp_string += '@@text()=' + temp_json.innerText;
        return temp_string;
    }
    // 返回最终的字符串
    return temp_string;
}



// 获取id为reverse_search的按钮元素
let reverse_search_btn=document.getElementById('reverse_search')

// 为按钮添加点击事件监听器
reverse_search_btn.addEventListener('click',function(){
    // 将按钮的文本内容更改为'输出到控制台'
    this.textContent='输出到控制台';
    
    // 在控制台中输出'reverse_search'
    console.log('reverse_search');
    // 调用reverse_search函数
    reverse_search();
    // 设置一个超时函数，在1500毫秒后执行
    setTimeout(() => {
        // 将按钮的文本内容更改回'反查'
        this.textContent='反查';        
    }, 1500);
});
;

function reverse_search(){
    // let temp=window.DP;
    let temp=document.getElementById('xuanze_info').value;
    //红色字体样式
    chrome.devtools.inspectedWindow.eval(`console.log("%c  【${temp}】 ","color: red;font-size: 16px;")`);

    chrome.devtools.inspectedWindow.eval(`console.log("的反向查询结果")`);
    chrome.devtools.inspectedWindow.eval(`eles("${temp}")`);
}


// 暂存代码

// const temp_save_btn=document.getElementById('temp_save')

// temp_save_btn.addEventListener('click', function () {

//     let temp = document.getElementById('xuanze_info').value;
//     window.sao_search_history.push(temp);
//     let txt="";
//     window.sao_search_history.forEach((item) => {
//         txt+=item+'\n';
//     });

//     updateTextAreaValueById('sao_textarea', txt);
   
// })


$("#temp_save").on("click", function () {
    $("#opener").click();
});
