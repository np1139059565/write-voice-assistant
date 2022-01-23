const mfile = require("mfile.js")

const LOG_TYPES={
    DEBUG:"DEBUG",
        INFO:"INFO"
}
var logType=LOG_TYPES.DEBUG

module.exports.static_init = function (c_mfile,s_logType) {
    try {
        info("init log...")
        // switch (s_logType.toUpperCase()){
        //     case LOG_TYPES.DEBUG:
        //         logType=LOG_TYPES.DEBUG;
        //         break;
        //     default:
        //         logType=LOG_TYPES.INFO;
        //         break;
        // }
        info("switch mlog type",logType)
        module.exports.info = info
        module.exports.err = err
    } catch (e) {
        err(e)
    }
}

function info(i1, i2, i3, i4, i5) {
    mfile.static_writeLog("mlog info", getMsg(i1, i2, i3, i4, i5))
    if(logType==LOG_TYPES.DEBUG){
        showToast(getMsg(i1, i2, i3, i4, i5))
    }
    console.info("mlog info", getMsg(i1, i2, i3, i4, i5))
}

function err(e1, e2, e3, e4, e5) {
    mfile.static_writeLog("mlog err", getMsg(e1, e2, e3, e4, e5))
    showModal("mlog err:", getMsg(e1, e2, e3, e4, e5))
    console.error("mlog err", getMsg(e1, e2, e3, e4, e5))
}

function getStr(e) {
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

function getMsg(e1, e2, e3, e4, e5) {
    return (getStr(e1) + "," + getStr(e2) + "," + getStr(e3) + "," + getStr(e4) + "," + getStr(e5)).replaceAll(/,,/g, ",")
}

function showToast(title, icon, duration) {
    wx.showToast({
        title: title,
        icon: icon != null ? icon : "loading",
        duration: duration > 0 ? duration : 2000
    })
}

function showModal(title, content, ocallback, ccallback) {
    try{
        //ok,cancel
        wx.showModal({
            // title: conter,//titile 无换行
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
            }
        })
    }catch (e){
        err(e)
    }
}


module.exports.static_showToast=showToast
module.exports.static_showModal=showModal
module.exports.static_getMsg=getMsg
