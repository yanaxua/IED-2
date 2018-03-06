import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
      instance:null,/*当前选中的实例,创建和点击将改变这个数值*/
      wordLis:[],/*字段列表*/
      dataBase:[],/*数据库列表*/
      echartsCreat:{},/*创建echarts事件的标记*/
      reportList:[],/*已有报表列表*/
    },
    mutations: {
      instanceChange(state,val){
        state.instance = val;
      },
      wordLisChange(state,val){
        state.wordLis = val;
      },
      dataBaseChange(state,val){
        state.dataBase = val;
      },
      echartsCreatChange(state,val){
        state.echartsCreat = val;
      },
      reportListAdd(state,val){
        state.reportList= val;
      }
    },
    actions: {
      
    }
})
export default store