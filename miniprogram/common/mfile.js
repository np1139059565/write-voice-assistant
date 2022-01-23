const USER_DIR = wx.env.USER_DATA_PATH//wxfile://usr

const FSM = wx.getFileSystemManager()

var mlog = require("mlog.js")

/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
function info(i1,i2,i3,i4) {
    try {
        if (mlog.info != null) {
            mlog.info("mfile", i1, i2, i3, i4)
        } else {
            console.info("mfile",i1,i2,i3,i4)
            mlog.static_showToast("mfile:"+mlog.static_getMsg(i1,i2,i3,i4))
        }
    } catch (e) {
        console.error("mfile",e)
        mlog.static_showModal("mfile:"+mlog.static_getMsg(e))
    }
}

function err(e1, e2, e3,e4) {
    try {
        if (mlog.err != null) {
            mlog.err("mfile", e1,e2,e3,e4)
        } else {
            console.error("mfile",e1, e2, e3,e4)
            mlog.static_showModal("mfile:"+mlog.static_getMsg(e1, e2, e3,e4))
        }
    } catch (e) {
        console.error("mfile",e)
        mlog.static_showModal("mfile:"+mlog.static_getMsg(e))
    }
}

module.exports.static_init = (c_mlog) => {
    try {
        if (c_mlog != null) {
            mlog = c_mlog
        }
        info("init mfile...")
        info("user dir is", USER_DIR)
    } catch (e) {
        err(e)
    }
}

/**
 *
 * @param dirPath /:代码包文件 ../languageget/miniprogram
 */
function readDir(dirPath) {
    try {
        dirPath=checkAbsolutePath(dirPath)
        info("read dir", dirPath)
        return isDir(dirPath) ? FSM.readdirSync(dirPath) : []//[p1,p2]
    } catch (e) {
        err("read dir is err", e)
        return []
    }
}

/**
 *
 * @param filePath
 * @param encoding binary
 * @returns {string|ArrayBuffer|void}
 */
function readFile(filePath, encoding) {
    try {
        filePath=checkAbsolutePath(filePath)
        info("read file", filePath)
        return FSM.readFileSync(filePath, encoding != null ? encoding : "UTF-8")
    } catch (e) {
        err("read file is err", e)
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
        filePath=checkWritPath(filePath)
        //encode
        encoding = (encoding != null ? encoding : "utf8")
        //append
        const code = (isAppend && isExist(filePath) ? FSM.appendFileSync(filePath, conter, encoding) == null
            //cover
            : FSM.writeFileSync(filePath,conter, encoding) == null)

        info((isAppend ? "append" : "write") + " " + filePath, encoding, code)

        return code
    } catch (e) {
        err("write file is err", e)
        return false
    }
}

function writeLog(title, body) {
    // try {
        const tdate = new Date().toJSON()
        const filePath=checkAbsolutePath("mlog/" + tdate.split("T")[0] + ".mlog",true)
        //check parent path
        const ppath = filePath.substr(0, filePath.lastIndexOf("/"))
        if(!isDir(ppath)){
            FSM.mkdirSync(ppath, true)
        }

        const logmsg=tdate + " " + title + ":\r\n" + body + "\r\n"
        if(isExist(filePath,true) ){
            FSM.appendFileSync(filePath,logmsg, "utf-8")
        }else{
            FSM.writeFileSync(filePath,logmsg,"utf-8")
        }

    // } catch (e) {
    //     err("write file is err", e)
    //     return false
    // }
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
function getFInfo(path) {
    try {
        path=checkAbsolutePath(path)
        if (isExist(path)) {
            return FSM.statSync(path, false)
        } else {
            return null
        }
    } catch (e) {
        err("get file info is err", e)
        return null
    }
}

function isExist(path,isLog) {
    try {
        path=checkAbsolutePath(path)
        return typeof path == "string" && FSM.accessSync(path) == null
    } catch (e) {
        if(!isLog){
            if (e.message.indexOf("no such file or directory") >= 0) {
                info(path, e.message)
            } else {
                err(e)
            }
        }
        return false
    }
}

function isDir(path) {
    try {
        path=checkAbsolutePath(path)
        const pinfo = getFInfo(path)
        return pinfo != null && pinfo.isDirectory()
    } catch (e) {
        err("check is dir err", e)
        return false
    }
}

function removePath(path) {
    try {
        path=checkAbsolutePath(path)
        const pinfo = getFInfo(path)
        if (pinfo != null) {
            if (pinfo.isDirectory()) {
                info("rm dir:" + path)
                return FSM.rmdirSync(path, true) == null
            } else {
                info("rm file:" + path)
                return FSM.unlinkSync(path) == null
            }
        } else {
            info("rm is success:path is not find.")
            return true
        }
    } catch (e) {
        return err(e)
    }
}

function mkDir(dirPath) {
    try {
        dirPath=checkAbsolutePath(dirPath)
        const dinfo = getFInfo(dirPath)
        if (dinfo != null) {
            if (dinfo.isFile()) {
                err("file already exists")
                return false
            } else {
                info("dir already exists")
                return true
            }
        } else {
            const code = FSM.mkdirSync(dirPath, true) == null
            info("mkdir", dirPath, code)
            return code
        }
    } catch (e) {
        err("mkdir is err", e)
    }
}

function copyFile(srcFPath, dstFPath) {
    try {
        srcFPath=checkAbsolutePath(srcFPath)
        const srcFileInfo = getFInfo(srcFPath)
        //check src file is find
        if (srcFileInfo != null && srcFileInfo.isFile()) {
            if (dstFPath.endsWith("/")) {
                dstFPath = dstFPath.substr(0, dstFPath.length - 1)
            }
            //check dst path
            dstFPath=checkWritPath(dstFPath)
            const dstFileInfo = getFInfo(dstFPath)
            if (dstFileInfo != null&&dstFileInfo.isDirectory()) {
                err("dst path is dir", dstFPath)
                return false
            }
            //copy file
            const code = FSM.copyFileSync(srcFPath, dstFPath) == null
            info("copy file " + srcFPath, dstFPath, code)
            if(!code){
                err("copy file is fail",srcFPath,dstFPath)
            }
            return code
        } else {
            err("src path is not file")
            return false
        }
    } catch (e) {
        err(e)
        return false
    }
}

/**
 *
 * @param srcPath wxfile://usr/tmp/dgg3efh573hj73js5sc5/
 * @param dstPath wxfile://usr/languageget/
 */
function copyDir(srcPath, dstPath,upProgressEvent) {
    try{
        srcPath=checkAbsolutePath(srcPath)
        dstPath=checkWritPath(dstPath)
        // check dst path
        if (!dstPath.endsWith("/")) {
            dstPath += "/"
        }
        //check is exist
        if (isExist(srcPath)) {
            //check is dir
            if (isDir(srcPath)) {
                // check src path
                if (!srcPath.endsWith("/")) {
                    srcPath += "/"
                }
                const pName = srcPath.split("/").reverse()[1]
                const cNameArr = readDir(srcPath)
                return cNameArr.map((cname,i) =>{
                    //up progress
                    if(typeof upProgressEvent=="function"){
                        upProgressEvent(cNameArr.length,i)
                    }
                    return copyDir(srcPath + cname, dstPath + pName,upProgressEvent)
                }).filter(code => code).length == cNameArr.length
            } else{
                return copyFile(srcPath, dstPath + srcPath.split("/").reverse()[0])
            }
        } else {
            err("not find src path",srcPath)
            return false
        }
    }catch (e){
        err(e)
        return false
    }
}

function downUrlFileSync(url, localPath, callback, isShowLoading) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        if (isShowLoading) {
            wx.showLoading({
                title: '下载...',
                mask: true//防止触摸
            })
        }
        removePath(localPath)
        wx.downloadFile({
            url: url,
            complete(a,b) {
               try{
                   var code = a.errMsg.endsWith(":ok")
                   if (!code) {
                       err(a.errMsg)
                   }
                   if (isShowLoading) {
                       wx.hideLoading()
                   }
               }catch (e){
                   err(e)
               }
            },
            success(res) {
                //res:{statusCode,tempFilePath}
                const code = res.statusCode === 200
                if (code) {
                    //copy cache to local
                    localPath=checkWritPath(localPath)
                    info("download url file is "+code, url, res)
                    mcallback(copyFile(res.tempFilePath, localPath))
                } else {
                    err("download url file to cache is err.", url)
                    mcallback(code)
                }
            }
        })
    } catch (e) {
        if (isShowLoading) {
            wx.hideLoading()
        }
        err(e)
        mcallback(false)
    }
}

function unzipSync(zipPath, dstPath, callback, isShowLoading) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        zipPath=checkAbsolutePath(zipPath)
        dstPath=checkWritPath(dstPath)
        if (isShowLoading) {
            wx.showLoading({
                title: '解压...',
                mask: true//防止触摸
            })
        }
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
            complete(a,b) {
                if (isShowLoading) {
                    wx.hideLoading()
                }
            },
            success(res) {
                //res:{errMsg:unzip:ok}
                mcallback(res.errMsg.endsWith(":ok"))
            }
        })
    } catch (e) {
        err(e)
    }
}

function checkWritPath(path){
    try{
        if(typeof path=="string"){
            //check is absolute path
            path=checkAbsolutePath(path)
            //check parent path
            const ppath = path.substr(0, path.lastIndexOf("/"))
            if (isDir(ppath) == false) {
                mkDir(ppath)
            }
            return path
        }else return null
    }catch (e){
        err(e)
        return null
    }
}
function checkAbsolutePath(path){
    return (path.startsWith(USER_DIR)?"":USER_DIR + "/")+path
}

// ------------------open event----------------------
module.exports.static_mkDir = mkDir
module.exports.static_unzipSync = unzipSync
module.exports.static_downUrlFileSync = downUrlFileSync
module.exports.static_copyFile = copyFile
module.exports.static_copyDir = copyDir

module.exports.static_rmPath = removePath

module.exports.static_writeFile = writeFile
module.exports.static_writeLog = writeLog

module.exports.static_getUserDir = () => {
    return USER_DIR + "/"
}
module.exports.static_readDir = readDir
module.exports.static_readFile = readFile
module.exports.static_getFInfo = getFInfo
module.exports.static_isExist = isExist
module.exports.static_isDir = isDir