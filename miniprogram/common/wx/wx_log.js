const MODULE_FILE = require("wx_file.js"),
    LOG_TYPES = {
        DEBUG: "DEBUG",
        INFO: "INFO"
    },
    INFO_TYPES = {
        ERROR: "ERROR",
        INFO: "INFO"
    }

var logType = LOG_TYPES.DEBUG



/**
 * 
 * @param  {...any} args 
 * @returns 
 */
function err(...args) {
    //非调试状态下发生异常则立即退出
    if (logType != LOG_TYPES.DEBUG) {
        showLoading("请退出重新打开试试!", { mask: true })
    }
    info(args.concat(INFO_TYPES.ERROR))
}

/**
 * 
 * @param  {...any} args :inf...,infoType
 */
function info(...args) {
    try {
        //弥补不定参数调用不定参数的缺陷
        if (args instanceof Array && args[0] instanceof Array && args.length == 1) {
            args[0].map((v, i) => args.splice(i, i > 0 ? 0 : 1, v))
        }

        const infoType = INFO_TYPES[args[args.length - 1]] != null ? args.pop() : INFO_TYPES.INFO
        const msg = args.map(o => f_get_msg(o)).join(",").replaceAll(/,,/g, ",")
        //check is log type
        if (logType != LOG_TYPES.DEBUG) {
            showToast(msg)
            //write to log file
            const timeStr = new Date().toJSON()
            const logPath = "wx_log/" + timeStr.split("T")[0] + ".wx_log"
            MODULE_FILE.write(logPath, timeStr + " " + infoType + ":\r\n" + msg + "\r\n", true, "utf8", true)
        }
        //write to conctol
        console[infoType.toLowerCase()](infoType, msg)
    } catch (e) {
        const msg=f_get_msg(e)
        console.error(msg)
        showLoading(msg)
    }
}

/**
 * 
 * @param {object} o 
 * @returns 
 */
function f_get_msg(o) {
    if (o == null) {
        return ""
    } else if (o instanceof TypeError || o.stack != null) {
        return o.stack
    } else if (o instanceof Error || o.errMsg != null || o.message != null) {//yun err
        return o.errMsg || o.message
    } else {
        return o
    }
}

/**
 * 
 * @param {string} title 
 * @param {object} options 
 *  属性 类型 默认值 必填 说明 最低版本
 *  title string  是 提示的内容 
 *  icon string success 否 图标 
 *      合法值 说明
 *      success 显示成功图标，此时 title 文本最多显示 7 个汉字长度
 *      error 显示失败图标，此时 title 文本最多显示 7 个汉字长度
 *      loading 显示加载图标，此时 title 文本最多显示 7 个汉字长度
 *      none 不显示图标，此时 title 文本最多可显示两行，1.9.0及以上版本支持
 *  image string  否 自定义图标的本地路径，image 的优先级高于 icon 1.1.0
 *  duration number 1500 否 提示的延迟时间
 *  mask boolean false 否 是否显示透明蒙层，防止触摸穿透
 *  success function  否 接口调用成功的回调函数
 *  fail function  否 接口调用失败的回调函数
 *  complete function  否 接口调用结束的回调函数（调用成功、失败都会执行） 
 * @returns 
 */
const showToast = (title, options = {}) => wx.showToast(Object.assign({ title: title, icon: "success" }, options))

/**
 * 
 * @param {object} options
 *  属性       类型     默认值 必填 说明 最低版本
 *  title      string         否   提示的标题 
 *  content    string         否 提示的内容 
 *  showCancel boolean true   否 是否显示取消按钮 
 *  cancelText string  取消    否 取消按钮的文字，最多 4 个字符 
 *  cancelColor string #000000 否 取消按钮的文字颜色，必须是 16 进制格式的颜色字符串 
 *  confirmText string 确定    否 确认按钮的文字，最多 4 个字符 
 *  confirmColor string #576B95 否 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串 
 *  editable boolean false     否 是否显示输入框 2.17.1
 *  placeholderText string     否 显示输入框时的提示文本 2.17.1
 *  success function           否 接口调用成功的回调函数 
 *    Object res
 *    属性	类型	说明	最低版本
 *    content	string	editable 为 true 时，用户输入的文本	
 *    confirm	boolean	为 true 时，表示用户点击了确定按钮	
 *    cancel	boolean	为 true 时，表示用户点击了取消（用于 Android 系统区分点击蒙层关闭还是点击取消按钮关闭）	1.1.0
 *  fail function              否 接口调用失败的回调函数 
 *  complete function          否 接口调用结束的回调函数（调用成功、失败都会执行） 
 * @returns 
 */
const showModal = (options) => wx.showModal(options)

/**
 * 
 * @param {object} options
 * 属性	类型	默认值	必填	说明
 * title	string		是	提示的内容
 * mask	boolean	false	否	是否显示透明蒙层，防止触摸穿透
 * success	function		否	接口调用成功的回调函数
 * fail	function		否	接口调用失败的回调函数
 * complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
 */
function showSheet(options) {
    //check itemList.length>6
    const MAX_LENGTH = 6
    const NEXT_OPTION = "下一页"
    if (options.itemList.length > MAX_LENGTH || options.itemList[MAX_LENGTH - 1] == NEXT_OPTION) {
        //save data
        if (options.itemListCopy == null) {
            options.itemListCopy = options.itemList
            options.successCopy = options.success
            options.page = 1
            options.success = (r) => {
                try {
                    if (options.itemList[r.tapIndex] == NEXT_OPTION) {
                        options.page += 1
                        showSheet(options)
                    } else {
                        options.successCopy(r)
                    }
                } catch (e) {
                    if (typeof options.fail == "function") {
                        options.fail(e)
                    }
                }
            }
        }
        //next page
        options.itemList = options.itemListCopy.filter((v, i) =>
            i < (options.page * MAX_LENGTH)
        ).map((v, i) =>
            (i + 1 == MAX_LENGTH) ? NEXT_OPTION : v
        )
    }
    //show sheet
    wx.showActionSheet(options)
}

/**
 * 
 * @param {string} title 
 * @param {*} options 
 * 属性 类型 默认值 必填 说明
 * title string  是 提示的内容
 * mask boolean false 否 是否显示透明蒙层，防止触摸穿透
 * success function  否 接口调用成功的回调函数
 * fail function  否 接口调用失败的回调函数
 * complete function  否 接口调用结束的回调函数（调用成功、失败都会执行）
 * @returns 
 */
const showLoading = (title, options) => wx.showLoading(Object.assign({ title: title }, options))



module.exports.init = function (logType1 = LOG_TYPES.DEBUG) {
    switch (logType1.toUpperCase()) {
        case LOG_TYPES.DEBUG:
            logType = LOG_TYPES.DEBUG;
            break;
        default:
            logType = LOG_TYPES.INFO;
            break;
    }
    info("init module wx_log...")
    info("switch wx_log type", logType)
}
module.exports.info = info
module.exports.err = err
module.exports.getLogTypes = () => LOG_TYPES
module.exports.showToast = showToast
module.exports.showModal = showModal
module.exports.showSheet = showSheet
module.exports.showLoading = showLoading