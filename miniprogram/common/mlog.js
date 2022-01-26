const mfile = require("wx_file.js"),LOG_TYPES={
    DEBUG:"DEBUG",
    INFO:"INFO"
},MLOG_TITLE="mlog"

var logType=LOG_TYPES.DEBUG

module.exports.f_static_init = function (s_logType) {
    try {
        f_info("init log...")
        switch (s_logType.toUpperCase()){
            case LOG_TYPES.DEBUG:
                logType=LOG_TYPES.DEBUG;
                break;
            default:
                logType=LOG_TYPES.INFO;
                break;
        }
        f_info("switch mlog type",logType)
        module.exports.f_info = f_info
        module.exports.f_err = f_err
    } catch (e) {
        f_err(e)
    }
}
module.exports.f_static_get_msg=f_get_msg

module.exports.f_wx_static_show_toast=f_wx_show_toast
module.exports.f_wx_static_show_modal=f_wx_show_modal
module.exports.f_wx_static_show_sheet=f_wx_show_sheet

function f_info(title=null, i2, i3, i4, i5) {
    if(title==null){
        title=MLOG_TITLE
    }
    mfile.f_static_writeLog(title, f_get_msg(i2, i3, i4, i5))
    if(logType==LOG_TYPES.DEBUG){
        f_wx_show_toast(title+f_get_msg( i2, i3, i4, i5))
    }
    console.info(title, f_get_msg(i1, i2, i3, i4, i5))
}

function f_err(title, e2, e3, e4, e5) {
    if(title==null){
        title=MLOG_TITLE
    }
    mfile.f_static_writeLog(title, f_get_msg(e1, e2, e3, e4, e5))
    f_wx_show_modal(title+f_get_msg( e2, e3, e4, e5))
    console.error(title, f_get_msg(e1, e2, e3, e4, e5))
}

function f_tostr(e) {
    try {
        if (e == null) {
            return ""
        } else if (e instanceof TypeError || e.stack != null) {
            return e.stack
        } else if (e instanceof Error || e.errMsg != null || e.message != null) {//yun err
            return e.errMsg || e.message
        } else {
            return e
        }
    } catch (e1) {
        console.error("getMsg is err", e1)
    }
}

function f_get_msg(e1, e2, e3, e4, e5) {
    return (f_tostr(e1) + "," + f_tostr(e2) + "," + f_tostr(e3) + "," + f_tostr(e4) + "," + f_tostr(e5)).replaceAll(/,,/g, ",")
}

function f_wx_show_toast(title, icon, duration) {
    wx.showToast({
        title: title,
        icon: icon != null ? icon : "loading",
        duration: duration > 0 ? duration : 2000
    })
}

function f_wx_show_modal( content, ocallback, ccallback) {
    try{
        //ok,cancel
        wx.showModal({
            content: content,
            showCancel: typeof ccallback == "function",
            confirmText: "确认",
            cancelText: "取消",
            success: (res) => {
                try {
                    if (res.confirm) {
                        if (typeof ocallback == "function") {
                            ocallback()
                        }
                    } else if (res.cancel) {
                        if (typeof ccallback == "function") {
                            ccallback()
                        }
                    }
                } catch (e) {
                    err(e)
                }
            },
            fail:(res,a,b)=>{
                try{
                    f_wx_show_toast(res.errMsg)
                }catch (e){
                    err(e)
                }
            }
        })
    }catch (e){
        err(e)
    }
}

function f_wx_show_sheet(item_arr, selectedCallback, cancelcallback) {
    const MyShowActionSheet = function (config) {
        if (config.itemList.length > 6) {
            var myConfig = {};
            for (var i in config) { //for in 会遍历对象的属性，包括实例中和原型中的属性。（需要可访问，可枚举属性）
                myConfig[i] = config[i];
            }
            myConfig.page = 1;
            myConfig.itemListBak = config.itemList;
            myConfig.itemList = [];
            var completeFun = config.complete;
            myConfig.complete = function (res) {
                if (res.tapIndex == 5) {//下一页
                    myConfig.page++;
                    MyShowActionSheet(myConfig);
                } else {
                    res.tapIndex = res.tapIndex + 5 * (myConfig.page-1);
                    completeFun(res);
                }
            }
            MyShowActionSheet(myConfig);
            return ;
        }
        if (!config.page) {
            wx.showActionSheet(config);
        }else{
            var page = config.page;
            var itemListBak = config.itemListBak;
            var itemList = [];
            for (var i = 5 * (page - 1); i < 5 * page && i < itemListBak.length; i++) {
                itemList.push(itemListBak[i]);
            }
            if (5 * page < itemListBak.length) {
                itemList.push('下一页');
            }
            config.itemList = itemList;
            wx.showActionSheet(config);
        }
    }
    MyShowActionSheet({
        itemList: item_arr,//['A', 'B', 'C'],长度不能超过6,必须是字符串数组
        complete: (res) => {
            try {
                if (res.errMsg.endsWith(":ok")) {
                    this.data.mlog.info("selected", item_arr[res.tapIndex])
                    if (typeof selectedCallback == "function") {
                        selectedCallback(item_arr[res.tapIndex], res.tapIndex)
                    }
                } else {
                    if (typeof cancelcallback == "function") {
                        // this.data.mlog.info("not selected.")
                        cancelcallback()
                    }else{
                        // this.data.mlog.err("not selected.")
                    }
                }
            } catch (e) {
                this.data.mlog.err(e)
            }
        }
    })
}
