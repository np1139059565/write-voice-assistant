// app.ts
App<IAppOption>({
    globalData: {
        c_mlog: null,
        wx_file: null,
        w_si: null,
        rr_manager: null
    },
    onLaunch() {
        try {
            this.globalData.c_mlog = require("common/wx/mlog.js")
            this.globalData.c_mlog.f_static_init()
            try {
                this.globalData.wx_file = require("common/wx/wx_file.js")
                this.globalData.wx_file.static_init(this.globalData.c_mlog)
                //init si
                if (this.globalData.w_si == null) {
                    this.globalData.w_si = requirePlugin("WechatSI")
                    this.globalData.c_mlog.f_info("init WechatSI...")
                }
                //init record recognition manager
                if (this.globalData.rr_manager == null) {
                    this.globalData.rr_manager = this.globalData.w_si.getRecordRecognitionManager()
                    this.globalData.c_mlog.f_info("init RecordRecognitionManager...")
                }
            } catch (e) {
                this.globalData.c_mlog.f_err(e)
            }
        } catch (e) {
            console.error(e)
        }
    },
})