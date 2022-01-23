// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    editor:{
      ctx:null
    },
    button:{
      text:"start"
    }
  },
  onLoad() {
    try{
      console.info(app.globalData.rrmanager)
      app.globalData.rrmanager.onRecognize=(res)=>{
        console.info("recogn...",res)
      }
      app.globalData.rrmanager.onStop=(res)=>{
        try{
          // this.data.editor.ctx.setContents()
          this.data.editor.ctx.insertText({text:res.result})
          console.info("stop...",res)
        }catch(e){
          console.error(e)
        }
     }
     app.globalData.rrmanager.onStart=(res)=>{
       console.info("start...",res)
     }
     app.globalData.rrmanager.onError=(res)=>{
       console.error("err...",res)
     }
     //init editor
     if(this.data.editor.ctx==null){
       this.data.editor.ctx=wx.createSelectorQuery().select("#i-editor").context((ccr)=>{
         this.data.editor.ctx=ccr.context
         this.setData(this.data)
       }).exec()
     }
    }catch(e){
      console.error(e)
    }
  },
  f_button(){
    try{
      if(this.data.button.text.toUpperCase()=="START"){
        this.data.button.text="stop"
        this.setData(this.data)
        app.globalData.rrmanager.start({lang:"zh_CN",duration:3000})
        console.info("start...")
      }else{
        this.data.button.text="start"
        this.setData(this.data)
        app.globalData.rrmanager.stop()
        console.info("stop...")
      }
    }catch(e){
      console.error(e)
    }
  }
})
