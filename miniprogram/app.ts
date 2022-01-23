// app.ts
App<IAppOption>({
  globalData: {
    wechatsi:null,
    rrmanager:null
  },
  onLaunch() {
    try{
      if(this.globalData.wechatsi==null){
        this.globalData.wechatsi=requirePlugin("WechatSI")
        console.info("init WechatSI...")
      }
      if(this.globalData.rrmanager==null){
        this.globalData.rrmanager=this.globalData.wechatsi.getRecordRecognitionManager()
        console.info("init RecordRecognitionManager...")
      }
    }catch(e){
      console.error(e)
    }
  },
})