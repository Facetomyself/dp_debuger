
// https://music.migu.cn/v3


//#region 主组件对象-------------------

const SaoLayer = {
  sao_console: $('<div></div>').attr('id', "sao_console").appendTo('body'),

  setStyle: function () {
    this.sao_console.css({
      position: 'fixed',
      right: '0',
      top: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      display: 'none',
      width: '100%',
      height: '100%',
      zIndex: 9999999,

    });

  },
  // 监听点击事件 显示或者隐藏
  listen: function () {
    this.sao_console.on('click', function () {
      SaoAction.show_or_hide_sao_console();
    });
  },
  // 显示遮罩层
  show: function () {
    this.sao_console.css("display", "block");
  },
  // 隐藏遮罩层
  hide: function () {
    this.sao_console.css("display", "none");
  },

}


const  sao_console=SaoLayer.sao_console;
SaoLayer.setStyle();
SaoLayer.listen();
const sao_console_shadowRoot = sao_console[0].attachShadow({ mode: 'open' });
const $sao_console_shadowRoot=$(sao_console_shadowRoot);
initializeSaoConsoleShadowRoot();

//#region  shadowRoot 版本的元素筛选器
//---------------------------------------------------------初始化-------------------------

async function initializeSaoConsoleShadowRoot() {
  
  // 创建并附加 Shadow DOM
  const shadowRoot =sao_console_shadowRoot;

  try {
    // 加载 HTML 内容
    const htmlContent = await SaoTools.loadHtmlContent('html/SaoConsole.html');
    if (!htmlContent) {
      console.error('没有加载到有效的 HTML 内容');
      return; // 如果内容为空，退出函数
    }
    // 替换所有的 chrome-extension://eohnmmapaacjdnepmnjimojeemakmbeh 为当前扩展的 ID 加载内部专用的css
  
    let b=chrome.runtime.getURL("../css/jquery-ui.css");
    // alert(b);
     let htmlContent2 = htmlContent.replace("chrome-extension://替换成插件id/css/jquery-ui.css", b);
    shadowRoot.innerHTML = htmlContent2;
    


    // 初始化 tabs、拖动和调整大小功能
    const saoTabsElement = shadowRoot.querySelector("#sao_tabs");
    $(saoTabsElement).tabs();
    $(saoTabsElement).draggable({ cursor: "move" });
    $(saoTabsElement).resizable();
    
    // 初始化各个tab ###################################################>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    SaoListener.onKeyDown();
    SaoTab1.init();
    SaoYulan.listen();
    SaoEditor.init();
    await SaoTab2.init();
    SaoSetup.init();
    SaoTab5.listen();
    await SaoTab6.init($sao_console_shadowRoot);

  } catch (error) {
    console.log('加载 HTML 内容失败:', error);
  }

  console.log("saoconsole sr元素初始化完成");
}


//#region 各个子组件对象
//------------------------------各个子组件对象-------------------------

const SaoListener = {
  onKeyDown: function () {
    $(document).keydown(function (event) {
      switch (event.key) {
        case 'F8': // F8键
          SaoAction.catch_yufa_to_sao_console();
          SaoTab2.clickOnce();
          break;

        case 'F4': // F4键
          SaoAction.catch_yufa_to_sao_console();
          SaoTab1.clickOnce();
          break;

        case 'Escape': // ESC键
          SaoAction.show_or_hide_sao_console();
          break;

        case 'F9': // F9键
          SaoAction.show_or_hide_sao_console();
          SaoEditor.clickOnce();
              //移除遮罩层
          overlayKeyMoueLogger.hide(); 
          SaoEditor.updateCode();
          break;
      }
    });
  },
};





//#region 捕获鼠标处元素-------------------------



const SaoAction = {
  catch_simple_dp_yufa_to_sao_tab1: function () {    
      sao_console.css("display", "block");
      // let a = window.anotherGlobalVar_simple.split("@@");
      SaoFilter.clearAll();
      let a = mouseOverElement.theElement;
      let tag = a.tagName.toLowerCase();
      SaoFilter.setTagName(tag);

      if (a.hasAttribute('id')) {
        attr = "id";
        attr_value = a.id;
        SaoFilter.setTagAttribute(attr, attr_value);
      } else if (a.hasAttribute('class')) {
        attr = "class";
        attr_value = a.className;
        SaoFilter.setTagAttribute(attr, attr_value);
      };
      

      if (a.innerText && a.innerText.length > 0 && a.innerText.length < 20) {
        SaoFilter.setTextContent(a.innerText);
      }
      SaoFilter.scan();

  },

  catch_all_yufa_to_sao_tab2:function(){  
      sao_console.css("display", "block");
      let b=mouseOverElement;
      // SaoUniversalCopyer.set_dp(b.theDP);  // 这个是完整语法，但是太长了，所以只复制简单的dp语法
      SaoUniversalCopyer.set_dp(SaoFilter.get_dp_yufa());
      SaoUniversalCopyer.set_xpath(mouseOverElement.theXpath);
      SaoUniversalCopyer.set_zuobiao(b.thePosition.X+","+b.thePosition.Y);    

  },
  catch_yufa_to_sao_console:function(){
    if (sao_console.css("display") == "none") {
      SaoAction.catch_simple_dp_yufa_to_sao_tab1();
      SaoAction.catch_all_yufa_to_sao_tab2();
    }
    else {
      sao_console.css("display", "none");
    }
  },

  show_or_hide_sao_console: function () {
    if (sao_console.css("display") == "none") {
      sao_console.css("display", "block");
    } else {
      sao_console.css("display", "none");
    }
  },


}




const SaoFilter = {
  // 初始化命中的jQuery对象组
  machtedJquerObjetcts:$(),
  setTagName: function (tag) {
    $sao_console_shadowRoot.find("#tag_name").val(tag);
  },
  setTagAttribute: function (attr, attr_value) {
    $sao_console_shadowRoot.find("#tag_shuxing").val(attr);
    $sao_console_shadowRoot.find("#tag_zhi").val(attr_value);
  },
  setTextContent: function (text) {
    $sao_console_shadowRoot.find("#tag_wenben").val(text);
  },
  scan: function () {
    searchElementsAndDisplayToTable();
    // this.updateBianLiangMing();
  },
  clearAll() {
    $sao_console_shadowRoot.find("#tag_name").val("");
    $sao_console_shadowRoot.find("#tag_shuxing").val("");
    $sao_console_shadowRoot.find("#tag_zhi").val("");
    $sao_console_shadowRoot.find("#tag_wenben").val("");
    searchElementsAndDisplayToTable();
  },
  counter:1,

  get_dp_yufa: function () {
    let dp_yufa = $sao_console_shadowRoot.find("#dp_yufa").text();
    return dp_yufa;
  },
};










//#region 第一个标签页

const SaoTab1 = {


  init: function () {
    // 把html字符添加到页面
    // $sao_console_shadowRoot.find("#sao_tabs-1").html(this.html)
    this.fillDataList_shuxing();
    this.fillDataList_tagname();
    this.listen();
    // 改变样式 确保 input字体颜色为红色
    $sao_console_shadowRoot.find("#sao_tabs-1 input").css("color", "red");
  },
  clickOnce: function () {
    $sao_console_shadowRoot.find("#sao-a-1").click();
  },

  fillDataList_shuxing: function () {
    let shuxing_list = ["id", "class", "style", "href", "src", "alt", "title", "type", "placeholder", "name", "value"];
    let dataList_shuxing = $sao_console_shadowRoot.find("#dataList_shuxing");
    dataList_shuxing.empty();
    for (let i = 0; i < shuxing_list.length; i++) {
      let option = $('<option>').val(shuxing_list[i]).text(shuxing_list[i]);
      dataList_shuxing.append(option);
    }
  },
  fillDataList_tagname: function () {
    let tagname_list = ["input", "textarea", "button", "select", "section", "option", "div", "span", "a", "img", "iframe", "form", "label", "input", "textarea", "button", "select", "option", "div", "span", "a", "img", "iframe", "form", "label"];
    let dataList_tagname = $sao_console_shadowRoot.find("#dataList_tagname");
    dataList_tagname.empty();
    for (let i = 0; i < tagname_list.length; i++) {
      let option = $('<option>').val(tagname_list[i]).text(tagname_list[i]);
      dataList_tagname.append(option);
    }
  },
  listen: () => {

    // 监听 #sao_tabs-1 元素的 input 事件，事件发生时触发回调函数
    $sao_console_shadowRoot.find("#sao_tabs-1 ").on("input", "*", searchElementsAndDisplayToTable );

    // 复制语法
    $sao_console_shadowRoot.find("#copy_yufa").on("click", () => {
      let DP_yufa =  $sao_console_shadowRoot.find("#dp_yufa").text()

      navigator.clipboard.writeText(DP_yufa);
      copyHistory.push(text=DP_yufa,type="DP");
      alert("复制成功"+DP_yufa);
    });
    // 复制语法并添加索引
    $sao_console_shadowRoot.find("#copy_yufa_add_index").on("click", () => {
      let DP_yufa = $sao_console_shadowRoot.find("#dp_yufa").text();
      let index = prompt("请输入要添加的索引数字：", "1");
      if (index !== null) {
        DP_yufa = `ele("${DP_yufa}",index=${index})`
      } else {
        DP_yufa = `ele("${DP_yufa}",index=1)`;
      }

      navigator.clipboard.writeText(DP_yufa);
      copyHistory.push(text = DP_yufa, type = "DP");
      alert("复制成功" + DP_yufa);
    });
    // 复制xpath语法
    $sao_console_shadowRoot.find("#copy_xpath").on("click", () => {
      let xpath_yufa =  $sao_console_shadowRoot.find("#xpath_yufa").text()

      navigator.clipboard.writeText(xpath_yufa);
      copyHistory.push(text=xpath_yufa,type="xpath");
      alert("复制成功"+xpath_yufa);
    });




    // 清空按钮 清空 标签名
    $sao_console_shadowRoot.find("#clear_tag_name").on("click", () => {

      $sao_console_shadowRoot.find("#tag_name").val("");
      searchElementsAndDisplayToTable();
    })
    // 清空按钮 清空 文本内容
    $sao_console_shadowRoot.find("#clear_wenben").on("click", () => {

      $sao_console_shadowRoot.find("#tag_wenben").val("");
      searchElementsAndDisplayToTable();
    })
    // 清空按钮 清空 标签属性
    $sao_console_shadowRoot.find("#clear_shuxing").on("click", () => {
      $sao_console_shadowRoot.find("#tag_shuxing").val("");
      $sao_console_shadowRoot.find("#tag_zhi").val("");
      searchElementsAndDisplayToTable();
    })

    // 阻止子元素 #yulan 拖动
    $sao_console_shadowRoot.find('#yulan').on('mousedown', function (event) {
      event.stopPropagation();  // 阻止事件冒泡，防止触发父级拖动事件
    });

    // 阻止 #sao_tabs 的事件冒泡
    $sao_console_shadowRoot.find('#sao_tabs').on("click", function (event) {
      event.stopPropagation();
    });
  }

}


// SaoTab1.init();
// sao_console.html(html_str);
// fillDataList_shuxing();
// fillDataList_tagname();
















//#region 扫描元素并显示到表格里

function searchElementsAndDisplayToTable(){
  console.log("开始校验.");  // 打印一条日志，表示输入框失去焦点（或者输入内容时）

  

  // 获取输入框的值
  let tag_input = $sao_console_shadowRoot.find("#tag_name").val();  // 获取标签名输入框的值
  let attr = $sao_console_shadowRoot.find("#tag_shuxing").val();    // 获取属性名输入框的值
  let attr_val = $sao_console_shadowRoot.find("#tag_zhi").val();    // 获取属性值输入框的值
  let text = $sao_console_shadowRoot.find("#tag_wenben").val();     // 获取文本输入框的值

  // 生成 DP 语法
  let DP_yufa = to_DP_yufa(tag_input,attr,attr_val,text);  

  $sao_console_shadowRoot.find("#dp_yufa").text(DP_yufa);

  // 生成 xpath 语法
  let xpath_yufa = to_xpath_yufa(tag_input,attr,attr_val,text);  

  $sao_console_shadowRoot.find("#xpath_yufa").text(xpath_yufa);



  // 创建一个空数组，用来保存匹配的元素信息
  let element_str_array = [];
  let yulan = $sao_console_shadowRoot.find("#yulan");  // 获取展示结果的区域

  // 初始化筛选的元素为整个 body
  let $shuaixuan = $("body");
  

  


  // 如果标签名输入框不为空，使用 .find() 方法查找相应的标签
  if (tag_input.length > 0) {
    $shuaixuan = $shuaixuan.find(tag_input);
  } else {
    // 如果标签名为空，则查找所有元素
    $shuaixuan = $shuaixuan.find("*");
  }

  // 如果属性名不为空，进一步筛选具有指定属性且属性值匹配的元素
  if (attr.length > 0) {
    $shuaixuan = $shuaixuan.filter(function () {
      return $(this).attr(attr) == attr_val;  // 过滤出属性值匹配的元素
    });
  }

  // 如果文本框内容不为空，进一步筛选包含指定文本的元素
  if (text.length > 0) {
    $shuaixuan = $shuaixuan.filter(function () {
      return $(this).text().includes(text);  // 过滤出文本包含指定字符串的元素
    });
  }

  // 如果用户没有输入任何查询条件，提示用户输入查询条件
  if (tag_input.length == 0 && attr.length == 0 && text.length == 0) {
    yulan.text("请输入查询条件..");
    return;  // 退出函数，不继续执行下面的代码
  }
  // 排除 #sao_console 元素及其子元素 过滤掉插件本身的元素
  $shuaixuan= $shuaixuan.not('#sao_console, #sao_console *');
  $shuaixuan= $shuaixuan.not('#yuananniu, #yuananniu *');
  $shuaixuan= $shuaixuan.not('#cebianlan, #cebianlan *');
  $shuaixuan= $shuaixuan.not('#daohanglan, #daohanglan *');
  $shuaixuan= $shuaixuan.not('#float_content');
  $shuaixuan= $shuaixuan.not('#float_content *');

  SaoYulan.element_str_array=$shuaixuan;
  SaoFilter.machtedJquerObjetcts=$shuaixuan;
  $sao_console_shadowRoot.find("#numberOfRepeatingElements").text($shuaixuan.length);

  // 遍历所有匹配的元素，将其信息添加到元素数组中
  $shuaixuan.each(function (index, element) {
    // console.log(index, element);  
    let element_str = nodeToJson(element);  // 将元素转换为 JSON 对象
    let element_str_json = JSON.stringify(element_str);  // 将 JSON 对象转换为字符串
    let aa = index + " " + element_str_json;  // 创建一个包含索引和元素信息的字符串
    element_str_array.push(element_str);  // 将字符串添加到数组中
  });

  // 如果没有找到匹配的元素，显示未找到的提示
  if (element_str_array.length == 0) {
    yulan.text("未找到..");
    return;  // 退出函数
  }

  // 将所有匹配的元素信息连接成一个字符串，并展示在页面上
  // let str = element_str_array.join("\n"); 
  // yulan.text(str);
  SaoYulan.turnArrayToTable(element_str_array);

}


function to_DP_yufa(tag_input,attr,attr_val,text){
  let a="";
  let b="";
  let c="";
  let d="";
  if (tag_input.length > 0) {
    a = "t:"+tag_input;
  } 
  if(attr.length > 0 && attr_val.length > 0) {
    b = "@@"+attr + "=" + attr_val;
  }
  if(text.length > 0) {
    c ="@@"+"tx():"+text;
  }
  d=a+b+c;
  if(d.length == 0){
    d = "未生成..";
  }
  return d;

}

function to_xpath_yufa(tag_input, attr, attr_val, text) {
  let a = ""; // 标签部分
  let b = ""; // 属性部分
  let c = ""; // 文本部分
  let d = ""; // 最终生成的 XPath 表达式

  // 处理标签名
  if (tag_input.length > 0) {
    a = tag_input; // 直接使用标签名
  } else {
    a = "*"; // 如果没有标签名，默认匹配所有元素
  }

  // 处理属性和属性值
  if (attr.length > 0 && attr_val.length > 0) {
    b = `[@${attr}='${attr_val}']`; // 生成属性条件
  }

  // 处理文本内容（改为 contains 逻辑）
  if (text.length > 0) {
    c = `[contains(text(), '${text}')]`; // 生成文本条件，使用 contains 函数
  }

  // 拼接最终的 XPath 表达式
  d = `//${a}${b}${c}`;

  // 如果没有生成任何条件，返回提示
  if (d === "//*") {
    d = "未生成有效的 XPath 表达式";
  }

  return d;
}





//#region  预览框
const SaoYulan = {

  listen: () => {
    // 监听 #yulan 元素上的span元素点击事件
    $sao_console_shadowRoot.find('#yulan').on('click', 'span', function (event) {
      // 阻止事件冒泡，避免影响其他元素
      event.stopPropagation();

      // 获取被点击的 span 元素的文本内容
      let text = $(this).text();
      if (text.includes("=")) {
        let a = text.split("=");
        let b = a[0];
        let c = a[1];
        $sao_console_shadowRoot.find("#tag_shuxing").val(b);
        $sao_console_shadowRoot.find("#tag_zhi").val(c);
        searchElementsAndDisplayToTable();
        return;

      }
      // 显示一个提示框，内容为被点击的 span 元素的文本内容
      alert("复制成功 " + text);     
      copyToClipboard(text);
    });
    $sao_console_shadowRoot.find("#yulan").on("click", ".yulan_tag_index", function () {
      let text = $(this).text();
      // alert("复制成功 " + text);
      text = parseInt(text) - 1;
      
      
      SaoYulan.element_str_array.eq(text)
      .effect("highlight", { color: "red" }, 500)   // 红色高亮效果                                         // 延迟 500 毫秒，确保高亮动画完成后再开始弹跳
      .effect("bounce", { times: 3, distance: 30 }, 500); // 弹跳效果
  
      

    
      SaoYulan.element_str_array[text].scrollIntoView({ // 滚动指定元素 视野内
        behavior: 'smooth',  // 平滑滚动
        block: 'start'  // 元素对齐到视图的顶部
      });
      // console.log(e);

    });

    //监听 #yulan 元素上的标记元素  按钮
    $sao_console_shadowRoot.find("#MarkAll").click(()=>{SaoFilter.machtedJquerObjetcts.addRedBorder();$.toast("标记成功");})
    //监听 #yulan 元素上的标记元素  按钮
    $sao_console_shadowRoot.find("#unMarkAll").click(()=>{SaoFilter.machtedJquerObjetcts.delRedBorder(); $.toast("取消标记成功");})

  },

  turnArrayToTable: function (element_str_array) {
    
    // 开始构建表格
    var tableHtml = '<table id="table_yulan" border="1"><thead><tr><th>序号</th><th>Tag Name</th><th>Attributes</th><th>Text Content</th></tr></thead><tbody>';

    element_str_array.forEach(function (item, index) {
      var attributesHtml = '';

      // 遍历属性对象并生成 HTML 格式
      for (var key in item.attributes) {
        if (item.attributes.hasOwnProperty(key)) {
          let value = item.attributes[key];

          let kv = '<span class="sao_zhi_value">' + key + "=" + value + '</span>';
          attributesHtml += kv + ";\n";
        }
      }

      // 插入表格行
      tableHtml += '<tr>';
      tableHtml += '<td style="width:5px" class="yulan_tag_index">' + (index + 1) + '</td>'; // 序号列，从零开始自动加 1
      tableHtml += '<td style="width:10px"  >' + item.tagName + '</td>'; //元素名
      tableHtml += '<td>' + attributesHtml + '</td>';  // 元素属性
      tableHtml += '<td style="max-width:100px" class="yulan_txt">' + '<span class="sao_zhi_value">' + item.textContent + '</span>' + '</td>';  // 文本内容
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    // 将表格插入到 pre 标签中
    $sao_console_shadowRoot.find('#yulan').html(tableHtml);
  },
  element_str_array: [],


}








function nodeToJson(node) {
    var obj = {
        tagName: node.tagName || "",             // 标签名
        attributes: {},                           // 属性
        textContent: node.textContent.length > 20? node.textContent.substring(0, 20) : node.textContent || ""       // 超过20就只取前面20字符文本内容
    };

    // 提取节点的属性
    if (node.attributes) {
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            obj.attributes[attr.name] = attr.value;
        }
    }

    return obj;
}








// 内部编辑器
var SaoEditor = {
  url: window.location.href,
  变量数量: 0,
  init_code: `
#!/usr/bin/env python
# -*- coding:utf-8 -*-
#-导入库
from DrissionPage import Chromium,ChromiumOptions
#--导入参数
from DrissionPage.common import Keys
timeGap=0.9

co = ChromiumOptions()

# 创建浏览器对象
browser = Chromium(co)
tab = browser.latest_tab
# 访问网页-
tab.get("${window.location.href}")
print(tab.title)

tab.set.window.max()
`,

    init: function () {
      // $sao_console_shadowRoot.find("#sao_textarea").text(SaoEditor.init_code);
      // alert(SaoEditor.init_code);
      SaoEditor.updateCode();
      $sao_console_shadowRoot.find("#copy_code").click(SaoEditor.copy);
      $sao_console_shadowRoot.find("#clear_code").click(SaoEditor.clear);
      $sao_console_shadowRoot.find("#chushihua_code").click(SaoEditor.init);
      $sao_console_shadowRoot.find("#continueRecord").click(() => { overlayKeyMoueLogger.show(); SaoAction.show_or_hide_sao_console(); SaoTools.sendMaximizeRequest(); });

      $sao_console_shadowRoot.find("#resetRecord").click(SaoEditor.resetRecord);
      $sao_console_shadowRoot.find("#startRecord").click(
        async () => {
          await ConfigBox.set("键鼠动作记录开关", true);
          overlayKeyMoueLogger.start(SaoEditor.init_code);
          SaoAction.show_or_hide_sao_console();
          SaoTools.sendMaximizeRequest();          
        });

    },
  resetRecord: function () {
    SaoAction.show_or_hide_sao_console();
    SaoEditor.updateCode();
    ConfigBox.set("键鼠动作记录开关", false);
  },  

  copy: function () {
    let code = $sao_console_shadowRoot.find("#sao_textarea").text();
    copyToClipboard(code);
    alert("复制成功");
  },

  clear: function () {
    $sao_console_shadowRoot.find("#sao_textarea").text("");
  },

  updateCode:async function () {
    // let a=$sao_console_shadowRoot.find("#sao_textarea").text() + "\n" + code;
    let code = await ConfigBox.get("键鼠动作记录历史");
    code=code.join("\n");
    // let a= this.init_code+"\n" + code;
    $sao_console_shadowRoot.find("#sao_textarea").text(code);
  },

  clickOnce: function () {
    $sao_console_shadowRoot.find("#sao-a-3").click();

  },



}











function copyToClipboard(code) {
  // 创建一个临时的 textarea 元素
  var $textArea = $('<textarea></textarea>').val(code).css({
      position: 'absolute',
      opacity: 0
  });

  // 将 textarea 添加到页面中
  $('body').append($textArea);
  
  // 选中 textarea 中的文本
  $textArea.select();
  
  try {
      // 执行复制操作
      var successful = document.execCommand('copy');
      if (successful) {
          console.log("成功复制到剪贴板！");
      } else {
          console.error("复制失败: execCommand");
      }
  } catch (err) {
      console.error("复制失败:", err);
  }
  
  // 移除临时的 textarea 元素
  $textArea.remove();
}




// 逆向工具



const SaoTab2 = {

  init:async function () {
    let html_str = await SaoTools.loadHtmlContent('html/SaoTab2.html');
    // 把html字符添加到页面
    $sao_console_shadowRoot.find("#sao_tabs-2").html(html_str);
    

    // 改变样式 确保 input字体颜色为红色
    $sao_console_shadowRoot.find("#sao_tabs-2 input").css("color", "red");
    SaoUniversalCopyer.listen();
    
  },
  clickOnce: function () {   
      
    $sao_console_shadowRoot.find("#sao-a-2").click();
    
  },


}






//#region 万能复制
const SaoUniversalCopyer = {
  set_xpath: function (str) {
    $sao_console_shadowRoot.find("#textInput2").val(str);
  },

  set_zuobiao: function (str) {
    $sao_console_shadowRoot.find("#textInput1").val(str);
  },
  set_dp: function (str) {
    $sao_console_shadowRoot.find("#textInput3").val(str);
  },

  listen: function () {
    // 定义一个复制和提示的公共函数
    function handleCopy(inputId,type="unknown") {
      const value = $sao_console_shadowRoot.find(inputId).val();
      SaoTools.copyToClipboard(value);
      copyHistory.push(text=value,type=type); // 将复制的值添加到历史记录中
      alert(`复制成功 ${value}`);
    }

    // 监听 #copyBtn1 和 #copyBtn2 的 click 事件
    $sao_console_shadowRoot.find("#copyBtn1").on('click', function (event) {
      event.stopPropagation();
      handleCopy("#textInput1","坐标");
    });

    $sao_console_shadowRoot.find("#copyBtn2").on('click', function (event) {
      event.stopPropagation();
      handleCopy("#textInput2","xpath");
    });
    $sao_console_shadowRoot.find("#copyBtn3").on('click', function (event) {
      event.stopPropagation();
      handleCopy("#textInput3","dp");
    });
    //转到复制历史
    $sao_console_shadowRoot.find("#copyHistory2").on('click', function (event) {
      event.stopPropagation();
      SaoTab5.clickOnce();
      $sao_console_shadowRoot.find("#actionsBtn9").click();
      // alert("打开复制历史");
    });
    //去重筛选
    $sao_console_shadowRoot.find("#DeduplicationBtn").on('click', function (event) {
      event.stopPropagation();
      SaoTab1.clickOnce();
    });
    // 加X:并且复制
    $sao_console_shadowRoot.find("#copyAddBtn2").on('click', function (event) {
      event.stopPropagation();
      let value = $sao_console_shadowRoot.find("#textInput2").val();
      let new_value = "x:" + value;
      SaoTools.copyToClipboard(new_value);
      alert(`复制成功 ${new_value}`);
    });
  },
};








//#region 设置中心
const SaoSetup = {
  listen: function () {
    $sao_console_shadowRoot.find("#floatSwichBtn").click(() => { FloatingWindowOfElement.switchWindow(); });
    $sao_console_shadowRoot.find("#staticSwitchBtn").click(() => { staticFloatingWindow.switchWindow(); });
    $sao_console_shadowRoot.find("#copyHistoryBtn").click( () => { TabListener.send(data={aa:123},action="打开侧边栏",to="background"); });
    $sao_console_shadowRoot.find("#copy_ua").click(() => { SaoTools.copyUAToClipboard(); });
    $sao_console_shadowRoot.find("#copy_cookie").click(() => { SaoTools.copyCookieToClipboard();  });
    $sao_console_shadowRoot.find("#saoCtool").click(() => { SaoTools.minOpen("https://ctool.dev/tool.html#/tool/json?category=conversion")  });    
    $sao_console_shadowRoot.find("#saoJsonCrack").click(() => { SaoTools.minOpen("https://jsoncrack.com/editor")  });    
    $sao_console_shadowRoot.find("#coderSearchList").click(() => { SaoTools.minOpen("https://reference.tool.nuomiphp.com/")  });    
    $sao_console_shadowRoot.find("#spiderTools").click(() => { SaoTools.minOpen("https://spidertools.cn/")  });    

  },
  init: function () {
    SaoSetup.listen();
  },
};












//#region 第五个标签页
const SaoTab5 = {
  listen: function () {
    $sao_console_shadowRoot.find("#copyDecodeUrlBtn").click(SaoTab5.copytheUrl);
    $sao_console_shadowRoot.find("#decodeUrlBtn").click(SaoTab5.decodeUrl);
    $sao_console_shadowRoot.find("#actionsBtn").click(() => { SaoTab5.fillTableFromJSONPath("json/action.json"); });
    $sao_console_shadowRoot.find("#actionsBtn2").click(() => { SaoTab5.fillTableFromJSONPath("json/简化写法.json"); });
    $sao_console_shadowRoot.find("#actionsBtn3").click(() => { SaoTab5.fillTableFromJSONPath("json/启动参数.json"); });
    $sao_console_shadowRoot.find("#actionsBtn4").click(() => { SaoTab5.fillTableFromJSONPath("json/标签页.json"); });
    $sao_console_shadowRoot.find("#actionsBtn5").click(() => { SaoTab5.fillTableFromJSONPath("json/等待.json"); });
    $sao_console_shadowRoot.find("#actionsBtn6").click(() => { SaoTab5.fillTableFromJSONPath("json/数据监听.json"); });
    $sao_console_shadowRoot.find("#actionsBtn7").click(() => { SaoTab5.fillTableFromJSONPath("json/定位语法.json"); });
    $sao_console_shadowRoot.find("#actionsBtn8").click(() => { SaoTab5.fillTableFromJSONPath("json/操作元素.json"); });
    $sao_console_shadowRoot.find("#actionsBtn9").click(SaoTab5.getCopyHistoryAndFillTable);

    //代码仓库 
    let url = "chrome-extension://" + chrome.runtime.id + "/codeHouse/code.html";
    $sao_console_shadowRoot.find("#codeHouse").click(() => { SaoTools.minOpen(url) });
    SaoTab5.prettyAElements();
    SaoTab5.clickTocopy();
  },
  async getCopyHistoryAndFillTable() {
    let history_array = await ConfigBox.get('元素复制历史');
    SaoTab5.fillTableFromJson(history_array);
  },



  copytheUrl: function () {
    let a = $sao_console_shadowRoot.find("#decodeUrlInput").val();
    SaoTools.copyToClipboard(a);
    alert("复制成功: " + a);
  },
  decodeUrl: function () {
    let a = $sao_console_shadowRoot.find("#decodeUrlInput").val();
    let b = "";  // 提前声明变量 b
    try {
      // 使用 decodeURIComponent 解码 URL
      b = decodeURIComponent(a);
    } catch (error) {
      // 如果出错，给 b 赋值错误信息
      b = "解码失败: " + a;
    }
    // 更新输入框的值
    $sao_console_shadowRoot.find("#decodeUrlInput").val(b);
  },
  prettyAElements: function () {
    // 查找所有链接元素
    const links = $sao_console_shadowRoot.find("#actionDiv a");

    // 为每个链接元素绑定点击事件
    links.click(function () {
      // 移除所有链接的下划线相关样式
      links.css({
        'text-decoration': 'none',
        'text-decoration-color': 'transparent',
        'text-decoration-style': 'none',
        'text-decoration-thickness': '0',
        'text-underline-offset': '0'
      });
      // 给当前被点击的链接添加淡蓝色的下划线，并设置与文字底部的距离
      $(this).css({
        'text-decoration': 'underline',
        'text-decoration-color': 'dodgerblue',
        'text-decoration-style': 'solid',
        'text-decoration-thickness': '2px',
        'text-underline-offset': '6px'
      });
    });

  },
  clickTocopy: function (event) {
    $sao_console_shadowRoot.find("#SaoTable").on('click', 'td', function (event) {
      event.stopPropagation(); // 阻止事件冒泡

      // 获取被点击的单元格
      const cell = event.target;

      // 获取单元格中的文本内容
      const text = cell.innerText || cell.textContent;
      // 将文本内容复制到剪贴板
      SaoTools.copyToClipboard(text);

      // 提示用户复制成功
      alert("文本已复制到剪贴板: " + text);
    });
  },

  fillTableFromJSONPath: async function (jsonDataPath) {
    // 从 JSON 文件加载数据
    let jsonData = await SaoTools.loadJsonContent(jsonDataPath);
    // 获取表格元素
    var table = $sao_console_shadowRoot.find("#SaoTable");

    // 清空表格
    table.empty();

    if (jsonData && jsonData.length > 0) {
      // 获取表格头部的键
      var headers = Object.keys(jsonData[0]);

      // 创建表头
      var headerRow = $("<tr>");
      headers.forEach(function (header) {
        headerRow.append("<th>" + header + "</th>");
      });
      table.append(headerRow);

      // 填充表格内容
      jsonData.forEach(function (item) {
        var row = $("<tr>");
        headers.forEach(function (header) {
          row.append("<td>" + item[header] + "</td>");
        });
        table.append(row);
      });
    }
  },
  fillTableFromJson: function (jsonData) {
    // 获取表格元素
    var table = $sao_console_shadowRoot.find("#SaoTable");

    // 清空表格内容
    table.empty();

    if (jsonData && jsonData.length > 0) {
      // 从首个数据对象提取表头
      var headers = Object.keys(jsonData[0]);

      // 创建表头行
      var headerRow = $("<tr>");
      headers.forEach(function (header) {
        headerRow.append($("<th>").text(header));  // 使用text()防止XSS
      });
      table.append(headerRow);

      // 填充表格数据
      jsonData.forEach(function (item) {
        var row = $("<tr>");
        headers.forEach(function (header) {
          row.append($("<td>").text(item[header]));  // 使用text()确保内容安全
        });
        table.append(row);
      });
    }
  },
  clickOnce: function () {
    $sao_console_shadowRoot.find("#sao-a-5").click();
  },



}














