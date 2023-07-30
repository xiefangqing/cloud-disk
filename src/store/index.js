import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {},
    folders: [],
    token: null
  },
  mutations: {
    //登录
    login(state, payload) {
      state.user = payload.user
      state.token = payload.token
      state.folders = payload.folders
    },
    //退出
    quit(state) {
      state.user = null
      state.token = null
    },
    //更新用户的收藏夹列表
    updateFolder(state, payload) {
      state.folders.push(payload)
    },
    //更新用户头像
    changeAvatar(state, payload) {
      state.user.user_avatar = payload
    },
    //修改密码
    changePassword(state, payload) {
      state.user.user_password = payload
    },
    //修改密保
    changeQuestion(state, payload) {
      state.user.user_question = payload.question
      state.user.user_answer = payload.answer
    },
    //删除收藏夹
    deleteFolder(state, payload) {
      if (state.folders.includes(payload)) {
        state.folders.splice(state.folders.indexOf(payload), 1)
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
