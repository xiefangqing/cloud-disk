import axios from 'axios'
import store from '@/store'
import router from '@/router'

const BASE_URL = 'https://alonepluto.info/api/cloud/v1'
const SECRET_KEY = 'ZK78RER4CVBR5'

export default function http(config) {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000
  })
  //请求拦截器
  instance.interceptors.request.use(config => {
    //防止接口被恶意调用，节约服务器资源，调用所有接口均需向服务器传递SecretKey
    config.headers.SecretKey = SECRET_KEY
    if (/login/.test(config.url)) {
      //请求登录接口，不添加token
      return config
    } else {
      //其它接口都携带token
      config.headers.Authorization = store.state.token
      return config
    }
  }, error => {
    console.log(error)
  })
  //响应拦截器
  instance.interceptors.response.use(res => {
    if (res.data.code === 805 || res.data.code === 806 || res.data.code === 822 || res.data.code === 823) {
      //无法验证token，跳转到登录页
      router.replace('/login')
    }
    return res.data
  }, err => {
    console.log(err)
  })
  //返回axios实例
  return instance(config)
}
