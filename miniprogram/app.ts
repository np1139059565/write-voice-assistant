// app.ts
App<IAppOption>({
    globalData: {
        mlog: null,
        mfile: null,
        wsi: null,
        RRManager: null,
        treeData: []
    },
    onLaunch() {
        try {
            this.globalData.mlog = require("common/wx/wx_log.js")
            this.globalData.mlog.init(this.globalData.mlog.getLogTypes().INFO)
            try {
                this.globalData.mfile = require("common/wx/wx_file.js")
                //init si
                this.globalData.wsi = requirePlugin("WechatSI")
                this.globalData.RRManager = this.globalData.wsi.getRecordRecognitionManager()
            } catch (e) {
                this.globalData.mlog.err(e)
            }
        } catch (e) {
            console.error(e)
        }
    },
})