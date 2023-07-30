//导入组件
import upload from './upload'
import contextmenu from './contextmenu'
import fileShow from './fileShow'
import folderShow from './folderShow'
import fileTable from './fileTable'

//组件列表
const components = [
  upload,
  contextmenu,
  fileShow,
  folderShow,
  fileTable
]


function install(Vue){
  //遍历组件列表，并全局注册他们
  components.forEach(item => {
    Vue.component(item.name, item)
  })
}

//导出的这个对象被Vue.use()使用时，会自动调用他的install方法
export default {
  install
}
