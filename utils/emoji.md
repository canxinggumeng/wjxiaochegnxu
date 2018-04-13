#Emoji 文档

##融云消息 message 里的 emoji 说明

1. 发消息时，必须直接发送emoji原生字符。如：😀 ，转换方法：symbolToEmoji
2. Web SDK接收消息时接收到的是unicode编码(”\uf600”)，需用 messageDecode 转化成原生emoji



##SDK 说明

###emoji SDK 内置支持 128个emoji表情，主要是为了做消息输入框的表情选项

###emoji SDK 初始化

1. 使用默认配置, 直接初始化
    RongIMLib.RongIMEmoji.init();

2. 不使用默认配置，自定义初始化
    // 表情信息可参考 <a href="http://unicode.org/emoji/charts/full-emoji-list.html">http://unicode.org/emoji/charts/full-emoji-list.html</a>
    
    // 扩展表情，设置扩展表情的信息
    var emoji = {
        dataSource: {
            "表情unicode码":{
                "en":"英文名称",
                "zh":"中文名称",
                "tag":"原生表情字符",
            },
        }
    };
    // 自定义设置
    var config = {
        lang: '选择的语言',
        reg: '匹配unicode的正则表达式'  //解析unicode emoji的范围，doc：http://unicode.org/reports/tr51/index.html
    };
    init(emoji, config);



###SDK API  var emoji = require("./emoji.js");

1. var emojis = emoji.emojis;  
    获取全部原生表情， ["😀", "😁", ………]

2. var names = emoji.names;    
    获取全部表情的对应文字说明, 语言为config中设置的语言，默认中文，["[大笑]", "[露齿而笑]", ………]

3. var data = emoji.data;  
    获取所有数据，方便二次开发 [{emoji:"😀",en:"grinning",name:"[大笑]",zh:"大笑"}, ………]

4. var names = emoji.names;    
    获取全部表情的对应文字说明, 语言为config中设置的语言，默认中文

5. var symbol = emoji.emojiToSymbol('我😁 '); 
    返回值：我[露齿而笑] 

6. var emoji = emoji.symbolToEmoji('我[露齿而笑] ');
    返回值：我😁 
    说明：发送消息时，消息体里必须使用原生emoji字符，需要使用该方法进行转换。

7. var message = emoji.unicodeToEmoji('收到一条消息 \uf601'); 
    返回值： 收到一条消息 😁   
    说明：SDK 接收消息后，消息内的 Emoji 会被解码为对应的 unicode 码，如：\uf600。需使用该方法转化才能正确显示。
