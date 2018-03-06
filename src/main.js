// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import echarts from 'echarts' /**引入echarts */
import ElementUI from 'element-ui'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(ElementUI);

import store from './store'

/*引入第三方icon*/
import './assets/font/iconfont.css'
import 'element-ui/lib/theme-default/index.css'
import '@/assets/styles/reset.css'
import '@/assets/styles/style.css'

Vue.prototype.$echarts = echarts; /*注册*/
Vue.prototype.$axios = axios; /*注册*/
Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({ 
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {
    App
  }
})