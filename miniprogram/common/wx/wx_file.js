//wxfile://usr
const USER_DIR = wx.env.USER_DATA_PATH,
    FSM = wx.getFileSystemManager(),
    MODULE_LOG = require("wx_log.js")



/**
 * 
 * @param {*} dirPath 
 * @returns 
 */
function mkdir(dirPath) {
    dirPath = absolute(dirPath)
    FSM.mkdirSync(dirPath, true) == null
}

/**
 * 
 * 类型 属性		默认值	必填	说明
 * @param {string} filePath 是	要追加内容的文件路径 (本地路径)
 * @param {string/ArrayBuffer} data 是	要追加的文本或二进制数据
 * @param {*} append false
 * @param {string} encoding utf8	否	指定写入文件的字符编码
 *  合法值	说明
 *   ascii	
 *   base64	
 *   binary	
 *   hex	
 *   ucs2	以小端序读取
 *   ucs-2	以小端序读取
 *   utf16le	以小端序读取
 *   utf-16le	以小端序读取
 *   utf-8	
 *   utf8	
 *   latin1	
 *   success	function		否	接口调用成功的回调函数
 *   fail	function		否	接口调用失败的回调函数
 *   complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
 * @returns 
 */
function write(filePath, str, append = false, encoding = "utf8", isLog = false) {
    filePath = absolute(filePath)
    //check parent path
    const parentPath = getParentPath(filePath)
    if (!isExist(parentPath)) {
        mkdir(parentPath)
        MODULE_LOG.info("mkdir", parentPath)
    }
    //log..
    if (!isLog) {
        MODULE_LOG.info("write file", filePath, append, encoding, str.length)
    }
    //write str..
    return FSM[isExist(filePath) && append ? "appendFileSync" : "writeFileSync"](filePath, str, encoding) == null
}
function getParentPath(path) {
    if (path.endsWith("/")) {
        path = path.substr(0, path.length - 1)
    }
    return path.split("/").reverse().filter((c, i) => i > 0).reverse().join("/")
}

function remove(path) {
    path = absolute(path)
    const stat = getState(path)
    if (stat.isDirectory()) {
        MODULE_LOG.info("rm dir", path)
        return FSM.rmdirSync(path, true) == null
    } else {
        MODULE_LOG.info("rm file", path)
        return FSM.unlinkSync(path, true) == null
    }
}

/**
 * 
 * @param {*} path
 * @returns 
 */
function absolute(path = "") {
    if (typeof path == "string") {
        if (path.startsWith(USER_DIR) || path.startsWith("/")) {
            return path
        } else {
            return USER_DIR + "//" + path//双斜杠可以解决权限问题
        }
    } else throw new TypeError("path is not str")
}

/**
 * 
 * @param {*} path 
 * @returns 
 */
function isExist(path) {
    try {
        path = absolute(path)
        return FSM.accessSync(path) == null
    } catch (e) {
        //垃圾api如果文件不存在则会报错，所以必须用try包着
        if (e.message.indexOf("no such file or directory") == -1) {
            // MODULE_LOG.info(e.message)
            throw e
        } else return false
    }
}

/**
 * 
 * @param {*} path 
 * @returns 
 */
function isDir(path) {
    path = absolute(path)
    const stat = getState(path)
    return stat != null && stat.isDirectory()
}

/**
 *
 * @param path 目录没有权限时使用双重"//"试试
 * @returns {void|*} Stats:
 * .mode:
 * .size:
 * .lastAccessedTime:
 * .lastModifiedTime:
 * .isDirectory() 判断当前文件是否一个目录
 * .isFile() 判断当前文件是否一个文件
 */
const getState = (path) => FSM.statSync(path, false)

/**
 * 
 * @param {string} dirPath 
 * @returns {Array[string]} files
 */
function dirList(dirPath) {
    dirPath = absolute(dirPath)
    return FSM.readdirSync(dirPath)
}

/**
 * 	属性	类型	默认值	必填	说明	最低版本
 
position	number		否	从文件指定位置开始读，如果不指定，则从文件头开始读。读取的范围应该是左闭右开区间 [position, position+length)。有效范围：[0, fileLength - 1]。单位：byte	2.10.0
length	number		否	指定文件的长度，如果不指定，则读到文件末尾。有效范围：[1, fileLength]。单位：byte	2.10.0
success	function		否	接口调用成功的回调函数	
fail	function		否	接口调用失败的回调函数	
complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）	
object.success 回调函数
 
 * @param {string} filePath 是	要读取的文件的路径 (本地路径)
 * @param {string} encoding			否	指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容	
合法值	说明
ascii	
base64	
binary	
hex	
ucs2	以小端序读取
ucs-2	以小端序读取
utf16le	以小端序读取
utf-16le	以小端序读取
utf-8	
utf8	
latin1	
 * @returns 
 */
function read(filePath, encoding = "utf-8") {
    filePath = absolute(filePath)
    MODULE_LOG.info("read file...", filePath, encoding)
    return isExist(filePath) ? FSM.readFileSync(filePath, encoding) : null
}



module.exports.mkdir = mkdir
module.exports.write = write

module.exports.remove = remove

module.exports.absolute = absolute

module.exports.dirList = dirList
module.exports.read = read
module.exports.getState = getState
module.exports.isExist = isExist
module.exports.isDir = isDir
