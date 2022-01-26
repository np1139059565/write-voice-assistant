// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
    data: {
        editor: {
            ctx: null,
            file_name:""
        },
        tree:{
            path:"",
            child_arr:[]//[{text,evData}]
        },
        tts: {
            text: "start",
            style:"background:green"
        }
    },
    onLoad:function() {
        try {
            //init bind event
            app.globalData.rr_manager.onRecognize = (res) => {
                app.globalData.c_mlog.f_info("recognize...", res.result)
            }
            app.globalData.rr_manager.onStop = (res) => {
                try {
                    app.globalData.c_mlog.f_info("stop...", res.result)
                    this.data.editor.ctx.insertText({text: res.result})
                    //re start...
                    if(this.data.tts.text.toUpperCase()=="STOP"){
                        app.globalData.rr_manager.start({lang: "zh_CN", duration: 10000})
                    }
                } catch (e) {
                    app.globalData.c_mlog.f_err(e)
                }
            }
            app.globalData.rr_manager.onStart = (res) => {
                app.globalData.c_mlog.f_info("start...", res)
            }
            app.globalData.rr_manager.onError = (res) => {
                app.globalData.c_mlog.f_err("err...", res.msg)
                //stop
                if(res.msg!="please stop after start"){
                    this.f_click_tts(null,true)
                }
            }
            //init editor
            if (this.data.editor.ctx == null) {
                this.data.editor.ctx = wx.createSelectorQuery().select("#i-editor").context((ccr) => {
                    this.data.editor.ctx = ccr.context
                    this.setData(this.data)
                }).exec()
            }
            //refush tree
            this.f_refush_child()
        } catch (e) {
            app.globalData.c_mlog.f_err(e)
        }
    },
    f_click_tts(e,isStop=false) {
        try {
            if (false==isStop&&this.data.tts.text.toUpperCase() == "START") {
                app.globalData.c_mlog.f_info("start...")
                this.data.tts.text = "stop"
                this.data.tts.style=""
                this.setData(this.data)
                app.globalData.rr_manager.start({lang: "zh_CN", duration: 3000})
            } else {
                app.globalData.c_mlog.f_info("stop...")
                this.data.tts.text = "start"
                this.data.tts.style="background:green"
                this.setData(this.data)
                app.globalData.rr_manager.stop()
            }
        } catch (e1) {
            app.globalData.c_mlog.f_err(e1)
        }
    },

    f_refush_child: function (isClearEdit=false) {
        try {
            //init path
            if(this.data.tree.path==""){
                this.data.tree.path = app.globalData.wx_file.f_static_get_user_dir("write-voice-assistant")
                 app.globalData.wx_file.f_static_mkdir(this.data.tree.path)
            }

            //refush child
            this.data.tree.child_arr = app.globalData.wx_file.f_static_readdir(this.data.tree.path).map(dirName => {
                var msg = "permission"
                const stat = app.globalData.wx_file.f_static_get_stat(this.data.tree.path + dirName)
                if (stat != null) {
                    if (stat.isDirectory()) {
                        msg = "d"
                    } else {
                        msg = "f:" + stat.size
                    }
                }
                return {text: dirName + ":" + msg, evData: dirName}
            })
            //add ".." child
            this.data.tree.child_arr.splice(0, 0, {text: "..", evData: ".."})

            if(isClearEdit){
                //clear editor
                this.data.editor.file_name=""
                this.data.editor.ctx.clear()
            }
        } catch (e1) {
            app.globalData.c_mlog.f_err(e1)
        }finally {
            this.setData(this.data)
            app.globalData.c_mlog.f_info("refush child", this.data.tree.path)
        }
    },
    f_open_file: function (fileName) {
        try {
            this.data.editor.file_name=fileName
            this.data.editor.ctx.clear()
            this.data.editor.ctx.insertText({text:app.globalData.wx_file.f_static_readfile(this.data.tree.path + fileName)})
        } catch (e1) {
            app.globalData.c_mlog.f_err(e1)
        }finally {
            this.setData(this.data)
            app.globalData.c_mlog.f_info("open file",this.data.tree.path,this.data.editor.file_name)
        }
    },
    f_save_file: function () {
        try {
            app.globalData.c_mlog.f_wx_static_show_modal("保存?",() => {
                this.data.editor.ctx.getContents({
                    success:res=>{
                        try{
                            app.globalData.c_mlog.f_wx_static_show_toast("保存结果："
                                + app.globalData.wx_file.f_static_writeFile(this.data.tree.path+this.data.editor.file_name, res.text))
                            this.f_refush_child()
                        }catch (e){
                            app.globalData.c_mlog.f_err(e)
                        }
                    }
                })
            }, () => {})
        } catch (e) {
            app.globalData.c_mlog.f_err(e)
        }
    },

    f_next: function (e) {
        try {
            const childName = e.currentTarget.dataset.event1Data1
            switch (childName) {
                case "..":
                    // back...
                    const backPath=this.data.tree.path.substr(0,
                        this.data.tree.path.substr(0,this.data.tree.path.length-1).lastIndexOf("/"))+"/"
                    if (false==app.globalData.wx_file.f_static_get_user_dir().endsWith(backPath)) {
                        this.data.tree.path = backPath
                        this.setData(this.data)
                        this.f_refush_child(true)
                    } else {
                        app.globalData.c_mlog.f_err("is root dir",backPath)
                    }
                    break;
                default:
                    // next
                    const childPath = this.data.tree.path + childName
                    const stat = app.globalData.wx_file.f_static_get_stat(childPath)
                    if(stat!=null&&stat.isDirectory()){
                        this.data.tree.path = childPath + "/"
                        this.setData(this.data)
                        this.f_refush_child(true)
                    }else{
                        this.f_refush_child()
                    }
                    break;
            }
        } catch (e1) {
            app.globalData.c_mlog.f_err(e1)
        }
    },
    f_show_menus: function (e) {
        try {
            const sheet=[]
            const childName=e.currentTarget.dataset.event1Data1
            const childPath=this.data.tree.path+childName
            const stat=app.globalData.wx_file.f_static_get_stat(childPath)
            if(stat!=null){
                sheet.push("DELETE")
                if(stat.isDirectory()){
                    sheet.push("NEXT")
                }else{
                    sheet.push("OPEN")
                    if(childName==this.data.editor.file_name){
                        sheet.push("SAVE")
                    }
                }
            }
            app.globalData.c_mlog.f_wx_static_show_sheet(sheet,(sval,sindex)=>{
                try{
                    switch (sval){
                        case "DELETE":
                            app.globalData.c_mlog.f_wx_static_show_modal("确定删除 " + childName + "?", () => {
                                app.globalData.c_mlog.f_wx_static_show_toast("del is "+app.globalData.wx_file.f_static_rmpath(childPath))
                                this.f_refush_child(true)
                            }, () => {
                            })
                            break;
                        case "SAVE":
                            this.f_save_file()
                            break;
                        case "NEXT":
                            this.data.tree.path = childPath+"/"
                            this.setData(this.data)
                            this.f_refush_child(true)
                            break;
                        case "OPEN":
                            if (stat.size > 1024) {
                                app.globalData.c_mlog.f_wx_static_show_modal("文件过大，任然打开?", () => {
                                    this.f_open_file(childName)
                                }, () => {
                                })
                            } else {
                                this.f_open_file(childName)
                            }
                            break;

                    }
                }catch (e1){
                    app.globalData.c_mlog.f_err(e1)
                }
            },()=>{})


        } catch (e1) {
            app.globalData.c_mlog.f_err(e1)
        }
    }
})
