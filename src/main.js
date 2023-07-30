import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/style/base.less'
import { formatToMB } from '@/utils/util'

Vue.use(ElementUI)

//全局注册公共组件
import components from '@/components'
Vue.use(components)

//注册事件总线方法(创建一个空的Vue实例作为交互的中介)
Vue.prototype.$bus = new Vue()

//注册全局过滤器
Vue.filter('formatToMB', formatToMB)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
