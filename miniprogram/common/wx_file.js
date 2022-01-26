//wxfile://usr
const USER_DIR = wx.env.USER_DATA_PATH,FSM = wx.getFileSystemManager()

var mlog = require("mlog.js")


module.exports.f_static_init = (m_log=null) => {
    try {
        if (m_log != null) {
            mlog = m_log
        }
        f_info("init wx_file...")
        f_info("user dir is", USER_DIR)
    } catch (e) {
        f_err(e)
    }
}
module.exports.f_static_mkdir = f_mkdir
module.exports.f_static_unzip_sync = f_unzip_sync
module.exports.f_static_downUrlFileSync = downUrlFileSync
module.exports.f_static_copyFile = copyFile
module.exports.f_static_copyDir = copyDir

module.exports.f_static_rmpath = f_remove_path

module.exports.f_static_writeFile = writeFile
module.exports.f_static_writeLog = writeLog

module.exports.f_static_get_user_dir = (dir="") => {
    return USER_DIR + "/"+dir+(dir.endsWith("/")?"":"/")
}
module.exports.f_static_readdir = f_readdir
module.exports.f_static_readfile = f_readfile
module.exports.f_static_get_stat = f_get_stat
module.exports.f_static_is_exist = f_is_exist
module.exports.f_static_isDir = isDir


/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
function f_info(i1, i2, i3, i4) {
    try {
        if (mlog.f_info != null) {
            mlog.f_info("wx_file", i1, i2, i3, i4)
        } else {
            console.info("wx_file", i1, i2, i3, i4)
            mlog.f_wx_static_show_toast("wx_file:" + mlog.f_static_get_msg(i1, i2, i3, i4))
        }
    } catch (e) {
        console.error("wx_file", e)
        mlog.f_wx_static_show_modal("wx_file:" + mlog.f_static_get_msg(e))
    }
}

function f_err(e1, e2, e3, e4) {
    try {
        if (mlog.f_err != null) {
            mlog.f_err("wx_file", e1, e2, e3, e4)
        } else {
            console.error("wx_file", e1, e2, e3, e4)
            mlog.f_wx_static_show_modal("wx_file:" + mlog.f_static_get_msg(e1, e2, e3, e4))
        }
    } catch (e) {
        console.error("wx_file", e)
        mlog.f_wx_static_show_modal("wx_file:" + mlog.f_static_get_msg(e))
    }
}


function f_mkdir(dirPath) {
    try {
        dirPath = checkAbsolutePath(dirPath)
        const dinfo = f_get_stat(dirPath)
        if (dinfo != null) {
            if (dinfo.isFile()) {
                f_err("file already exists")
                return false
            } else {
                f_info("dir already exists")
                return true
            }
        } else {
            const code = FSM.mkdirSync(dirPath, true) == null
            f_info("mkdir", dirPath, code)
            return code
        }
    } catch (e) {
        f_err("mkdir is err", e)
    }
}

function f_unzip_sync(zipPath, dstPath, callback) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        zipPath = checkAbsolutePath(zipPath)
        dstPath = checkWritPath(dstPath)
        //check dst path
        if (false == dstPath.endsWith("/")) {
            dstPath += "/"
        }
        // const jszip=new JSZIP()
        // const iconv=require("../dsf/iconv-lite/index")
        // jszip.loadAsync(readFile(zipPath,"binary"),{decodeFileName: (arraybuffer)=>{
        //     return String.fromCharCode.apply(null, new Uint16Array(arraybuffer));
        //     }}).then(res=>{
        //     //res:{a.txt:{dir:false}}
        //     Object.keys(res.files).map(fname=>{
        //         const dstPath1=dstPath+fname
        //         if(res.files[fname].dir==false){
        //             res.file(res.files[fname].name).async("arraybuffer").then(conter=>{
        //                 writeFile(dstPath1,conter,false,"binary")
        //             })
        //         }
        //     })
        // })

        FSM.unzip({
            zipFilePath: zipPath,
            targetPath: dstPath,
            complete(a, b) {
            },
            success(res) {
                //res:{errMsg:unzip:ok}
                mcallback(res.errMsg.endsWith(":ok"))
            }
        })
    } catch (e) {
        f_err(e)
    }
}

/**
 *
 * @param dirPath /:代码包文件 ../languageget/miniprogram
 */
function f_readdir(dirPath) {
    try {
        dirPath = checkAbsolutePath(dirPath)
        f_info("read dir", dirPath)
        return isDir(dirPath) ? FSM.readdirSync(dirPath) : []//[p1,p2]
    } catch (e) {
        f_err("read dir is err", e)
        return []
    }
}

/**
 *
 * @param filePath
 * @param encoding binary
 * @returns {string|ArrayBuffer|void}
 */
function f_readfile(filePath, encoding) {
    try {
        filePath = checkAbsolutePath(filePath)
        f_info("read file", filePath)
        return FSM.readFileSync(filePath, encoding != null ? encoding : "UTF-8")
    } catch (e) {
        f_err("read file is err", e)
        return (encoding != null ? null : "")
    }
}

/**
 *
 * @param filePath
 * @param conter
 * @param isAppend false
 * @param encoding utf-8
 * @returns {boolean}
 */
function writeFile(filePath, conter, isAppend, encoding) {
    try {
        //init path
        filePath = checkWritPath(filePath)
        //encode
        encoding = (encoding != null ? encoding : "utf8")
        //append
        const code = (isAppend && f_is_exist(filePath) ? FSM.appendFileSync(filePath, conter, encoding) == null
            //cover
            : FSM.writeFileSync(filePath, conter, encoding) == null)

        f_info((isAppend ? "append" : "write") + " " + filePath, encoding, code)

        return code
    } catch (e) {
        f_err("write file is err", e)
        return false
    }
}

function writeLog(title, body) {
    try {
        const tdate = new Date().toJSON()
        const filePath = checkAbsolutePath("mlog/" + tdate.split("T")[0] + ".mlog", true)
        //check parent path
        const ppath = filePath.substr(0, filePath.lastIndexOf("/"))
        if (!isDir(ppath)) {
            FSM.mkdirSync(ppath, true)
        }

        const logmsg = tdate + " " + title + ":\r\n" + body + "\r\n"
        if (f_is_exist(filePath, true)) {
            FSM.appendFileSync(filePath, logmsg, "utf-8")
        } else {
            FSM.writeFileSync(filePath, logmsg, "utf-8")
        }
    } catch (e) {
        console.error(e)
        mlog.f_wx_static_show_modal(mlog.f_static_get_msg(e))
    }
}

/**
 *
 * @param path
 * @returns {void|*} Stats:
 * .mode:
 * .size:
 * .lastAccessedTime:
 * .lastModifiedTime:
 * .isDirectory() 判断当前文件是否一个目录
 * .isFile() 判断当前文件是否一个文件
 */
function f_get_stat(path) {
    try{
        return FSM.statSync(checkAbsolutePath(path), false)
    }catch (e){
        f_err(e)
        return null
    }
}

function f_is_exist(path) {
    try {
        path = checkAbsolutePath(path)
        return typeof path == "string" && FSM.accessSync(path) == null
    } catch (e) {
        if (e.message.indexOf("no such file or directory") >= 0) {
            f_info(path, e.message)
        } else {
            f_err(e)
        }
        return false
    }
}

function isDir(path) {
    try {
        path = checkAbsolutePath(path)
        const pinfo = f_get_stat(path)
        return pinfo != null && pinfo.isDirectory()
    } catch (e) {
        f_err("check is dir err", e)
        return false
    }
}

function f_remove_path(path) {
    try {
        path = checkAbsolutePath(path)
        const pinfo = f_get_stat(path)
        if (pinfo != null) {
            if (pinfo.isDirectory()) {
                f_info("rm dir:" + path)
                return FSM.rmdirSync(path, true) == null
            } else {
                f_info("rm file:" + path)
                return FSM.unlinkSync(path) == null
            }
        } else {
            f_info("rm is success:path is not find.")
            return true
        }
    } catch (e) {
        f_err(e)
        return false
    }
}



function copyFile(srcFPath, dstFPath) {
    try {
        srcFPath = checkAbsolutePath(srcFPath)
        const srcFileInfo = f_get_stat(srcFPath)
        //check src file is find
        if (srcFileInfo != null && srcFileInfo.isFile()) {
            if (dstFPath.endsWith("/")) {
                dstFPath = dstFPath.substr(0, dstFPath.length - 1)
            }
            //check dst path
            dstFPath = checkWritPath(dstFPath)
            const dstFileInfo = f_get_stat(dstFPath)
            if (dstFileInfo != null && dstFileInfo.isDirectory()) {
                f_err("dst path is dir", dstFPath)
                return false
            }
            //copy file
            const code = FSM.copyFileSync(srcFPath, dstFPath) == null
            f_info("copy file " + srcFPath, dstFPath, code)
            if (!code) {
                f_err("copy file is fail", srcFPath, dstFPath)
            }
            return code
        } else {
            f_err("src path is not file")
            return false
        }
    } catch (e) {
        f_err(e)
        return false
    }
}

/**
 *
 * @param srcPath wxfile://usr/tmp/dgg3efh573hj73js5sc5/
 * @param dstPath wxfile://usr/languageget/
 */
function copyDir(srcPath, dstPath, upProgressEvent) {
    try {
        srcPath = checkAbsolutePath(srcPath)
        dstPath = checkWritPath(dstPath)
        // check dst path
        if (!dstPath.endsWith("/")) {
            dstPath += "/"
        }
        //check is exist
        if (f_is_exist(srcPath)) {
            //check is dir
            if (isDir(srcPath)) {
                // check src path
                if (!srcPath.endsWith("/")) {
                    srcPath += "/"
                }
                const pName = srcPath.split("/").reverse()[1]
                const cNameArr = readDir(srcPath)
                return cNameArr.map((cname, i) => {
                    //up progress
                    if (typeof upProgressEvent == "function") {
                        upProgressEvent(cNameArr.length, i)
                    }
                    return copyDir(srcPath + cname, dstPath + pName, upProgressEvent)
                }).filter(code => code).length == cNameArr.length
            } else {
                return copyFile(srcPath, dstPath + srcPath.split("/").reverse()[0])
            }
        } else {
            f_err("not find src path", srcPath)
            return false
        }
    } catch (e) {
        f_err(e)
        return false
    }
}

function downUrlFileSync(url, localPath, callback) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        f_remove_path(localPath)
        //file max 200MB
        wx.downloadFile({
            url: url,
            complete(a, b) {
                try {
                    var code = a.errMsg.endsWith(":ok")
                    if (!code) {
                        f_err(a.errMsg)
                    }
                } catch (e) {
                    f_err(e)
                }
            },
            success(res) {
                //res:{statusCode,tempFilePath}
                const code = res.statusCode === 200
                if (code) {
                    //copy cache to local
                    localPath = checkWritPath(localPath)
                    f_info("download url file is " + code, url, res)
                    mcallback(copyFile(res.tempFilePath, localPath))
                } else {
                    f_err("download url file to cache is err.", url)
                    mcallback(code)
                }
            }
        })
    } catch (e) {
        f_err(e)
        mcallback(false)
    }
}



function checkWritPath(path) {
    try {
        if (typeof path == "string") {
            //check is absolute path
            path = checkAbsolutePath(path)
            //check parent path
            const ppath = path.substr(0, path.lastIndexOf("/"))
            if (isDir(ppath) == false) {
                mkDir(ppath)
            }
            return path
        } else return null
    } catch (e) {
        f_err(e)
        return null
    }
}

function checkAbsolutePath(path) {
    return (path.startsWith(USER_DIR) ? "" : USER_DIR + "/") + path
}
