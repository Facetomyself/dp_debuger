

function eles(dp_yufa,debugMode=false) {

    // 将DP语法解析为JSON对象
    function parseStringToJson(str) {
        // 首先按'@@'分割字符串，得到key=value对
        let pairs = str.split('@@');
    
        // 创建一个空对象
        let result = {};
    
        // 遍历每一个key=value对
        pairs.forEach(pair => {
            // 按'='分割key和value
            let[key,value] = pair.split('=');
            if (key && value) {
                result[key] = value;
            }
        }
        );
    
        return result;
    }
    
    const logo='🦉';
    dp_yufa = dp_yufa.replace('t:', 't=').replace('tag:', 't=');
    let attrs_json = parseStringToJson(dp_yufa)
    var target =  Array.from(document.querySelectorAll('*'));

    if(debugMode) console.log(logo,attrs_json);

    for (let key in attrs_json) {
        let k = key;
        let v = attrs_json[key];
        if(debugMode) console.log(logo,k, v);

        switch (k) {
        case 't':
            target = Array.from(document.querySelectorAll(attrs_json['t']));
            break;

        case 'class':
            v = v.split(' ');
            v.forEach( (cls) => {
                target = target.filter(ele => ele.classList && ele.classList.contains(cls));
            }
            );
            
            break;

        case 'tx()':
            target = target.filter(ele => ele.innerText == v);
            
            break;
        case 'text()':
            target = target.filter(ele => ele.innerText == v);
            
            break;
        default:
            target = target.filter(ele => ele[k] == v);
            
            break;
        }
        
        if(debugMode) console.log(logo,target);
        
    }

    // 输出结果
    if (target.length > 0) {
        for (let i in target) {
            console.log(i, target[i])
        }
    } else {
        console.log('没有匹配的元素')
    }
    // return target;
}

window.eles = eles;