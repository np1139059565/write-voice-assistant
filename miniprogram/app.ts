// app.ts
App<IAppOption>({
  globalData: {
    c_mlog:null,
    c_mfile:null,
    wechatsi:null,
    rrmanager:null
  },
  onLaunch() {
    try{
      this.globalData.c_mlog=require("common/mlog.js")
      this.globalData.c_mlog.static_init()
      try{
        this.globalData.c_mfile=require("common/mfile.js")
        this.globalData.c_mfile.static_init(this.globalData.c_mlog)
        if(this.globalData.wechatsi==null){
          this.globalData.wechatsi=requirePlugin("WechatSI")
          console.info("init WechatSI...")
        }
        if(this.globalData.rrmanager==null){
          this.globalData.rrmanager=this.globalData.wechatsi.getRecordRecognitionManager()
          console.info("init RecordRecognitionManager...")
        }
      }catch (e1){
        this.globalData.c_mlog.err(e1)
      }
    }catch(e){
      console.error(e)
    }
  },
})