import Vue from 'vue'
import VueRouter from 'vue-router'

// 懒加载
const login = () => import('@/pages/login.vue')
const home = () => import('@/pages/home.vue')

const timeline = () => import('@/views/timeline/timeline.vue')
const image = () => import('@/views/image/image.vue')
const video = () => import('@/views/video/video.vue')
const folder = () => import('@/views/folder/folder.vue')
const profile = () => import('@/views/profile/profile.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: login
  },
  {
    path: '/home',
    redirect: '/home/timeline'
  },
  {
    path: '/home',
    component: home,
    children: [
      {
        path: 'timeline',
        component: timeline
      },
      {
        path: 'image',
        component: image
      },
      {
        path: 'video',
        component: video
      },
      {
        path: 'folder',
        component: folder
      },
      {
        path: 'profile',
        component: profile
      }
    ]
  },
  {
    //测试用
    path: '/test',
    component: () => import ('@/pages/test.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
