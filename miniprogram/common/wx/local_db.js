const MODULE_wx_log = require("wx_log.js"),
    MODULE_MFILE = require("mfile.js"),
    MODULE_MYUN = require("myun.js"),
    TABLE_PATH="/.tables"

var local_tables = {},
    db_name = null


//此时MODULE_wx_log还是空的，所以不能直接赋值，必须当做函数调用
const err=(...args)=>MODULE_wx_log.err(args)
const info=(...args)=>MODULE_wx_log.info(args)
function f_download_db(callback) {
    info("download db...")
    const mcallback=(code,r)=>{
        if(typeof callback=="function"){
            callback(code,r)
        }
    }
    f_query_wx_yun_db((code, arr) => {
        try{
            if(code){
                //write local table
                arr.map(tableInfo=>{
                    const table_name=tableInfo._id
                    local_tables[table_name]=table_name
                    MODULE_MFILE.f_static_writefile(db_name + "/" + table_name, JSON.stringify(arr))
                })
                MODULE_MFILE.f_static_writefile(db_name + TABLE_PATH, JSON.stringify(local_tables))
                mcallback(code)
            }
        }catch(e){
            err(e)
            mcallback(false,e)
        }
    })
}
/**
 *
 * @param {*} callback  
 * @param {*} params:
 *              database,
 *              querytype:
 *                  get
 *                  updatetable
 *                  update
 *              geo:
 *                  where :{_id}
 *                  limit :number
 *                  orderBy
 *                  skip
 *                  field
 *                  doc
 * @returns code,arr
 */
 const f_query_wx_yun_db=(callback,params=null) =>MODULE_MYUN.f_run_wx_yun_event("wx_yun_db", Object.assign({
    database: db_name,
    querytype: "get",
    geo: {}//空geo代表查询所有表格的数据
},params), (code, rdata) => {
    const mcallback=(code,r)=>{
        if(typeof callback=="function"){
            callback(code,r)
        }
    }
    try{
        //database res
        if (code) {
            if (null != rdata.result.code && !rdata.result.code) {
                code = false
                rdata=rdata.result.errMsg
            } else {
                rdata = rdata.result.data
            }
        }
        mcallback(code,rdata)
    }catch(e){
        err(e)
        mcallback(false,e)
    }
})

/**
 * 
 * @param {*} tableName 
 * @param {*} callback 
 * @returns 
 */
 const f_query_wx_yun_table=(tableName,callback)=>f_query_wx_yun_db((code,rdata)=>{
    const mcallback=(code,r)=>{
        if(typeof callback=="function"){
            callback(code,r)
        }
    }
    try{
        if (rdata.length == 0) {
            code = false
            rdata="not find table"
        }
        mcallback(code,rdata)
    }catch(e){
        err(e)
        mcallback(false,e)
    }
},{geo:{"where": { "_id": tableName }}})


/**
 * 
 * @param {*} tableName 
 * @returns 
 */
function f_query_local_table(tableName) {
    return MODULE_MFILE.f_static_readfile(db_name +"/"+ tableName)
}


function f_check_local_tables(){
    //loading table names...
    const table_name_path=db_name+TABLE_PATH
    Object.assign(local_tables,JSON.parse(MODULE_MFILE.f_static_readfile(table_name_path)))

    //check tables...
    return Object.values(local_tables).map(table_name=>MODULE_MFILE.f_static_isexist(db_name+"/"+table_name)).filter(r=>!r).length==0
}


module.exports.init = (dbName, callback) => {
    const mcallback = (code) => {
        //init methods
        if (code) {
            module.exports.f_query_local_table = f_query_local_table
        }

        if (typeof callback == "function") {
            callback(code)
        }
    }
    info("init local_db...")

    if (dbName != null) {
        db_name = dbName
        info("switch local database path", db_name)

        //check local db
        if (MODULE_MFILE.f_static_isdir(db_name)&&f_check_local_tables())
            mcallback(true)
        else {
            f_download_db(mcallback)
        }
    } else {
        mcallback(false, "database name is null!")
    }
}
module.exports.f_static_get_tables = () => {
    return local_tables
}
