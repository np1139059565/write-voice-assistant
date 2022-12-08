// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
    data: {
        leftPart: {
            style: "",//"left:0",
            openText: ">",
            tree: {
                path: "",
                childArr: []//[{text,isDir}]
            }
        },
        editor: {
            ctx: null,
            filePath: ""
        },
        tts: {
            text: 0,
            style: "background:green",
            duration:10000
        }
    },
    onLoad: function () {
        try {
            //init tree
            this.data.leftPart.tree.path = app.globalData.mfile.absolute("write-voice-assistant/")
            if (!app.globalData.mfile.isExist(this.data.leftPart.tree.path)) {
                app.globalData.mfile.mkdir(this.data.leftPart.tree.path)
            }
            this.refushDir()
            //init editor
            const dom = wx.createSelectorQuery().select("#i_editor")
            this.data.editor.ctx = dom.context((ccr) => {
                this.data.editor.ctx = ccr.context
                this.setData(this.data)
            }).exec()
            //init bind event
            app.globalData.RRManager.onRecognize = (res) => {
                app.globalData.mlog.info("recognize...", res.result)
            }
            app.globalData.RRManager.onStop = (res) => {
                try {
                    app.globalData.mlog.info("stop...", res.result)
                    this.data.editor.ctx.insertText({ text: res.result })
                    //re start...
                    if (!this.data.tts.style.endsWith(":green")) {
                        this.data.tts.text = this.data.tts.duration
                        this.setData(this.data)
                        app.globalData.RRManager.start({ lang: "zh_CN", duration: this.data.tts.duration })
                    }
                } catch (e) {
                    app.globalData.mlog.err(e)
                }
            }
            app.globalData.RRManager.onStart = (res) => {
                app.globalData.mlog.info("start...", res)
            }
            app.globalData.RRManager.onError = (res) => {
                app.globalData.mlog.err("err...", res.msg)
                //stop
                if (res.msg != "please stop after start") {
                    this.clickTTS(null, true)
                }
            }
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    openLeft() {
        try {
            if (this.data.leftPart.style != "") {
                this.data.leftPart.style = ""
                this.data.leftPart.openText = ">"
            } else {
                this.data.leftPart.style = "left:0"
                this.data.leftPart.openText = "<"
            }
            this.setData(this.data)
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    refushDir(dirPath) {
        try {
            //refush path
            if (dirPath == null) {
                dirPath = this.data.leftPart.tree.path
            }
            //refush child
            const childArr = app.globalData.mfile.dirList(dirPath)
            this.data.leftPart.tree.path = dirPath//必须等上面获取子节点成功后才能更新路径,否则报错后界面上看到的路径跟实际路径不一致
            this.data.leftPart.tree.childArr = childArr.map(childName => {
                const childInfo = { text: childName, isDir: false, isEdit: false }
                try {
                    const childPath = this.data.leftPart.tree.path + childName
                    const stat = app.globalData.mfile.getState(childPath)
                    if (stat.isDirectory()) {
                        childInfo.text += ":d"
                        childInfo.isDir = true
                    } else if (stat.isFile()) {
                        childInfo.text += (":f:" + stat.size)
                        //定位正在编辑的文件
                        if (this.data.editor.filePath == childPath) {
                            childInfo.isEdit = true
                        }
                    }
                } catch (e) {
                    app.globalData.mlog.info(e)
                }
                return childInfo
            })
            //add ".." child
            this.data.leftPart.tree.childArr.splice(0, 0, { text: "..", isDir: true })
            //这里非常重要,setData只是更新wxml绑定的数据,就算不执行这一句,实际上数据也保存了
            this.setData(this.data)
        } catch (e1) {
            app.globalData.mlog.err(e1)
        }
    },
    next: function (e) {
        try {
            const childName = e.target.dataset.text.split(":")[0]
            switch (childName) {
                // back...
                case "..":
                    const parentPath = this.data.leftPart.tree.path.substr(0,
                        this.data.leftPart.tree.path.substr(0, this.data.leftPart.tree.path.length - 1).lastIndexOf("/") + 1)
                    const absolutePath = app.globalData.mfile.absolute()
                    //check is root dir
                    if (parentPath.startsWith(absolutePath)) {
                        this.refushDir(parentPath)
                    } else {
                        app.globalData.mlog.showModal({ content: "is root dir", showCancel: false })
                        this.refushDir()
                    }
                    break;
                default:
                    const nextPath = this.data.leftPart.tree.path + childName + "/"
                    // next
                    this.refushDir(nextPath)
                    break;
            }
        } catch (e1) {
            app.globalData.mlog.err(e1)
        }
    },
    showMenus: function (e) {
        try {
            const sheetArr = ["REMOVE"]
            const childName = e.currentTarget.dataset.text.split(":")[0]
            const childPath = this.data.leftPart.tree.path + childName
            //add menu by state
            const stat = app.globalData.mfile.getState(childPath)
            if (stat.isDirectory()) {
                sheetArr.push("NEXT")
                sheetArr.push("CREATE")
                sheetArr.push("TREE")
            } else {
                sheetArr.push("OPEN")
                if (childPath == this.data.editor.filePath) {
                    sheetArr.push("SAVE")
                }
            }
            //
            app.globalData.mlog.showSheet({
                itemList: sheetArr,
                success: (res) => {
                    try {
                        const sval = sheetArr[res.tapIndex]
                        switch (sval) {
                            case "REMOVE":
                                this.remove(childPath)
                                break;
                            case "NEXT":
                                const nextPath = this.data.leftPart.tree.path = childPath + "/"
                                this.refushDir(nextPath)
                                break;
                            case "OPEN":
                                this.open(childPath)
                                break;
                            case "SAVE":
                                this.save(childPath)
                                break;
                            case "CREATE":
                                this.createNewFile(childPath)
                                break;
                            case "TREE":
                                this.showEchart(childPath)
                                break;
                        }
                    } catch (e1) {
                        app.globalData.mlog.err(e1)
                    }
                },
                fail: () => { }
            })


        } catch (e1) {
            app.globalData.mlog.err(e1)
        }
    },
    remove(path) {
        try {
            app.globalData.mlog.showModal({
                content: "确定删除" + path + "?",
                success: (res) => {
                    try {
                        if (res.confirm) {
                            const isOK = app.globalData.mfile.remove(path)
                            app.globalData.mlog.showToast("删除结果 " + isOK)
                            this.refushDir()
                        }
                    } catch (e) {
                        app.globalData.mlog.err(e)
                    }
                }
            })
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    open: function (filePath) {
        try {
            this.data.editor.ctx.clear()
            this.data.editor.ctx.insertText({
                text: app.globalData.mfile.read(filePath)
            })
            this.data.editor.filePath = filePath
            this.setData(this.data)
            this.refushDir()
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    save: function (filePath) {
        try {
            app.globalData.mlog.showModal({
                content: "确定保存" + filePath + "?",
                success: (res) => {
                    try {
                        if (res.confirm) {
                            this.data.editor.ctx.getContents({
                                success: eres => {
                                    try {
                                        const isOK = app.globalData.mfile.write(this.data.editor.filePath, eres.text)
                                        app.globalData.mlog.showToast("保存结果 " + isOK)
                                        this.refushDir()
                                    } catch (e) {
                                        app.globalData.mlog.err(e)
                                    }
                                }
                            })
                        }
                    } catch (e) {
                        app.globalData.mlog.err(e)
                    }
                }
            })
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    clickTTS(e, isStop = false) {
        try {
            if (false == isStop && this.data.tts.style.endsWith(":green")) {
                app.globalData.mlog.info("start...")
                this.data.tts.text = this.data.tts.duration
                this.data.tts.style = ""
                this.setData(this.data)
                app.globalData.RRManager.start({ lang: "zh_CN", duration: this.data.tts.duration })
            } else {
                app.globalData.mlog.info("stop...")
                this.data.tts.text = 0
                this.data.tts.style = "background:green"
                this.setData(this.data)
                app.globalData.RRManager.stop()
            }
        } catch (e1) {
            app.globalData.mlog.err(e1)
        }
    },
    createNewFile: function (dirPath) {
        this.data.editor.ctx.getContents({
            success: res => {
                try {
                    const fileName = res.text.split("\n")[0].trim()
                    if (fileName != "") {
                        const filePath = dirPath + "/" + fileName
                        app.globalData.mlog.showModal({
                            content: "create file:" + filePath + "?",
                            success: (res1) => {
                                try {
                                    if (res1.confirm) {
                                        const isOK = app.globalData.mfile.write(filePath, res.text)
                                        app.globalData.mlog.showToast("保存结果：" + isOK)
                                        if (isOK) {
                                            this.open(filePath)
                                        }
                                    }
                                } catch (e1) {
                                    app.globalData.mlog.err(e1)
                                }
                            }
                        })
                    } else {
                        app.globalData.mlog.showModal({ content: "file name is err", showCancel: false })
                    }
                } catch (e1) {
                    app.globalData.mlog.err(e1)
                }
            }
        })
    },
    showEchart(dirPath){
        const treeData=this.getTree(dirPath,{name:dirPath})
        this.openPage("/pages/tree/index?data="+JSON.stringify(treeData))
    },
    getTree(path,tree){
        const state=app.globalData.mfile.getState(path)
        if(state.isDirectory()){
            tree.children=[]
            const childArr = app.globalData.mfile.dirList(path)
            for(var i in childArr){
                tree.children.push(this.getTree(path+"/"+childArr[i],{name:childArr[i]}))
            }
        }else{
            tree.value=state.size
        }
        return tree
    },
    openPage: function (pagePath) {
        // /pages/tree/index
        wx.navigateTo({
            url: pagePath,
        })
    }
})
