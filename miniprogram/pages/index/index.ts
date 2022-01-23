// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
    data: {
        editor: {
            ctx: null
        },
        button: {
            text: "start"
        }
    },
    onLoad() {
        try {
            console.info(app.globalData.rrmanager)
            app.globalData.rrmanager.onRecognize = (res) => {
                console.info("recogn...", res)
            }
            app.globalData.rrmanager.onStop = (res) => {
                try {
                    // this.data.editor.ctx.setContents()
                    this.data.editor.ctx.insertText({text: res.result})
                    console.info("stop...", res)
                } catch (e) {
                    console.error(e)
                }
            }
            app.globalData.rrmanager.onStart = (res) => {
                console.info("start...", res)
            }
            app.globalData.rrmanager.onError = (res) => {
                console.error("err...", res)
            }
            //init editor
            if (this.data.editor.ctx == null) {
                this.data.editor.ctx = wx.createSelectorQuery().select("#i-editor").context((ccr) => {
                    this.data.editor.ctx = ccr.context
                    this.setData(this.data)
                }).exec()
            }
            //init file tree
            this.data.absolutePath = app.globalData.c_mfile.static_getUserDir("write-voice-assistant")
            app.globalData.c_mlog.info("absolutePath", this.data.absolutePath)
            this.setData(this.data)
            this.refushTree()
        } catch (e) {
            console.error(e)
        }
    },
    f_voice_start() {
        try {
            if (this.data.button.text.toUpperCase() == "START") {
                this.data.button.text = "stop"
                this.setData(this.data)
                app.globalData.rrmanager.start({lang: "zh_CN", duration: 3000})
                console.info("start...")
            } else {
                this.data.button.text = "start"
                this.setData(this.data)
                app.globalData.rrmanager.stop()
                console.info("stop...")
            }
        } catch (e) {
            console.error(e)
        }
    },

    refushTree: function () {
        try {
            this.data.childArr = app.globalData.c_mfile.static_readDir(this.data.absolutePath).map(childName => {
                var childInfo = "permission"
                const stat = app.globalData.c_mfile.static_getFInfo(this.data.absolutePath + childName)
                if (stat != null) {
                    if (stat.isDirectory()) {
                        childInfo = "dir"
                    } else {
                        childInfo = "file:" + stat.size
                    }
                }
                return {text: childName + ":" + childInfo, eventData: childName}
            })
            this.data.childArr.splice(0, 0, {text: "..", eventData: ".."})
            this.setData(this.data)
        } catch (e1) {
            app.globalData.c_mlog.err(e1)
        }
    },
    openFile: function (fileName) {
        try {
            this.data.editor.ctx.clear()
            this.data.editor.ctx.insertText({text:app.globalData.c_mfile.static_readFile(this.data.absolutePath + fileName)})

            this.data.editFileName = fileName
            this.setData(this.data)
        } catch (e1) {
            app.globalData.c_mlog.err(e1)
        }
    },
    saveFile: function () {
        try {
            const editFilePath = this.data.absolutePath + this.data.editFileName
            if (app.globalData.c_mfile.static_isExist(editFilePath)) {
                app.globalData.c_mlog.static_showModal("保存?",() => {
                    this.data.editor.ctx.getContents({
                        success:res=>{
                            const wcode = app.globalData.c_mfile.static_writeFile(editFilePath, res.text)
                            if(wcode){
                                this.data.editFileName = null
                                this.setData(this.data)
                                this.data.editor.ctx.clear()
                            }
                            app.globalData.c_mlog.static_showModal("保存文件结果：" + wcode)
                        }
                    })
                }, () => {})
            } else {
                //not find;clear
                this.data.editFileName = null
                this.setData(this.data)
                this.data.editor.ctx.clear()
            }
        } catch (e1) {
            app.globalData.c_mlog.err(e1)
        }
    },
    refushEditConter: function (e) {
        this.data.editConter = e.detail.text
        this.setData(this.data)
    },
    clickChild: function (e) {
        try {
            const childName = e.currentTarget.dataset.event1Data1
            switch (childName) {
                case "..":
                    // back wxfile://usr/
                    if (true) {
                        const absoluteArr = this.data.absolutePath.split("/").filter((child, i) => i == 1 || child != "")
                        this.data.absolutePath = absoluteArr.splice(0, absoluteArr.length - 1).join("/") + "/"
                        this.setData(this.data)
                        this.refushTree()
                    } else {
                        app.globalData.c_mlog.err("is root dir:" + this.data.absolutePath)
                    }
                    break;
                default:
                    // next
                    const childPath = this.data.absolutePath + childName
                    const stat = app.globalData.c_mfile.static_getFInfo(childPath)
                    if (stat != null && stat.isDirectory()) {
                        // open dir
                        this.data.absolutePath = childPath + "/"
                        this.setData(this.data)
                        this.refushTree()
                    } else if (stat.isFile()) {
                        //save file
                        if (childName == this.data.editFileName) {
                            this.saveFile()
                        } else {
                            // open file
                            const callback = () => {
                                this.openFile(childName)
                            }
                            if (stat.size > 1024) {
                                app.globalData.c_mlog.static_showModal("文件过大，任然打开?", callback, () => {
                                })
                            } else callback()
                        }
                    }
                    break;
            }
        } catch (e1) {
            app.globalData.c_mlog.err(e1)
        }
    },
    removeChild: function (e) {
        try {
            const fPath = this.data.absolutePath + e.currentTarget.dataset.event1Data1
            app.globalData.c_mlog.static_showModal("确定删除 " + fPath + "?", () => {
                if (app.globalData.c_mfile.static_rmPath(fPath)) {
                    this.refushTree()
                }
            }, () => {
            })
        } catch (e1) {
            app.globalData.c_mlog.err(e1)
        }
    }
})
