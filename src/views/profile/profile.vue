<template>
  <div>
    <!-- 信息展示 -->
    <el-card
      v-if="type === 'info_box'"
    >
      <el-container>
        <!-- 头像 -->
        <el-header height="100px">
          <div
            v-if="user_avatar"
            class="avatar"
            :style="{
              backgroundImage: `url(${user_avatar})`
            }"
          >
          </div>
          <i v-else class="el-icon-s-custom"></i>
          <input
            style="display: none"
            type="file"
            accept="image/*"
            @change="toUpload"
            ref="avatar-upload"
          ></input>
        </el-header>
        <!-- 用户信息 -->
        <el-main>
          <p>用户名：<span>{{ $store.state.user.user_name }}</span></p>
          <p>注册时间：<span>{{ $store.state.user.register_time }}</span></p>
          <p>密保问题：<span>{{ $store.state.user.user_question }}</span></p>
          <p>密保答案：<span>{{ $store.state.user.user_answer }}</span></p>
        </el-main>
        <!-- 操作按钮 -->
        <el-footer>
          <el-button @click="uploadAvatar">上传头像</el-button>
          <el-button @click="type = 'password_box'">修改密码</el-button>
          <el-button @click="toEdit">修改密保问题</el-button>
        </el-footer>
      </el-container>
    </el-card>
    <!-- 修改密码 -->
    <el-card
      style="width: 400px;"
      v-else-if="type === 'password_box'"
    >
      <el-container>
        <el-header style="font-size: 40px;">修改密码</el-header>
        <el-main>
          <el-form :model="ruleForm" :rules="rules">
            <el-form-item prop="old_password">
              <el-input
                type="password"
                v-model="ruleForm.old_password"
                placeholder="请输入原密码"
                clearable
                @paste.native.capture.prevent
              ></el-input>
            </el-form-item>
            <el-form-item prop="new_password">
              <el-input
                type="password"
                v-model="ruleForm.new_password"
                placeholder="请输入新密码"
                clearable
                @paste.native.capture.prevent
              ></el-input>
            </el-form-item>
            <el-form-item prop="new_password_again" style="margin: 0;">
              <el-input
                type="password"
                v-model="ruleForm.new_password_again"
                placeholder="请再次输入新密码"
                clearable
                @paste.native.capture.prevent
              ></el-input>
            </el-form-item>
          </el-form>
        </el-main>
        <el-footer>
          <el-button @click="cancel1">取消</el-button>
          <el-button style="background: var(--theme-color);color: white;" @click="changePassword">修改密码</el-button>
        </el-footer>
      </el-container>
    </el-card>
    <!-- 修改密保 -->
    <el-card v-else style="width: 400px;">
      <el-container>
        <el-header style="font-size: 40px;">修改密保问题</el-header>
        <el-main style="height: 150px;display: flex;flex-flow: column;justify-content: space-between">
          <el-select
            placeholder="请选择密保问题"
            v-model="new_question"
          >
            <el-option
              v-for="item in items"
              :key="item"
              :value="item"
            ></el-option>
          </el-select>
          <el-input
            type="text"
            v-model="new_answer"
            placeholder="密保答案"
            clearable
          ></el-input>
        </el-main>
        <el-footer>
          <el-button @click="cancel2">取消</el-button>
          <el-button style="background: var(--theme-color);color: white;" @click="editQuestion">提交修改</el-button>
        </el-footer>
      </el-container>
    </el-card>
  </div>
</template>

<script>
import http from '@/utils/http'
import SparkMD5 from 'spark-md5'

export default {
  name: 'profile',
  data() {
    return {
      type: 'info_box',
      //用户头像
      user_avatar: this.$store.state.user.user_avatar,
      //密保选项
      items: [],
      //新密保问题
      new_question: '',
      //新密保答案
      new_answer: '',
      user_question: this.$store.state.user.user_question,
      user_answer: this.$store.state.user.user_answer,
      //表单验证规则
      ruleForm: {
        //旧密码
        old_password: '',
        //新密码
        new_password: '',
        new_password_again: ''
      },
      rules: {
        old_password: [
          { required: true, message: '不能为空' },
          { min: 6, max: 20, message: '密码长度为6~20位', trigger: 'blur' }
        ],
        new_password: [
          { required: true, message: '不能为空' },
          { min: 6, max: 20, message: '密码长度为6~20位', trigger: 'blur' }
        ],
        new_password_again: [
          { required: true, message: '不能为空' },
          { min: 6, max: 20, message: '密码长度为6~20位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //把头像上传到服务器
    async toUpload() {
      //把上传的文件得到
      const avatar_file = Array.from(this.$refs['avatar-upload'].files)[0]
      const data = new FormData()
      data.append('user_avatar', avatar_file)
      const config = {
        url: '/user/uploadAvatar',
        method: 'post',
        data
      }
      const result = await http(config)
      if (result.code === 812) {
        this.user_avatar = result.user_avatar
        this.$store.commit('changeAvatar', this.user_avatar)
        this.$message({
          type: 'success',
          message: '上传头像成功',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '上传头像失败',
          customClass: 'tip-error',
          center: true
        })
      }
    },
    //上传头像
    uploadAvatar() {
      const file = this.$refs['avatar-upload'];
      file.click()
    },
    //取消修改密码
    cancel1() {
      this.ruleForm.old_password = ''
      this.ruleForm.new_password = ''
      this.ruleForm.new_password_again = ''
      this.type = 'info_box'
    },
    //更改密码
    async changePassword() {
      console.log(this.ruleForm)
      if (SparkMD5.hash(this.ruleForm.old_password) !== this.$store.state.user.user_password) {
        this.$message({
          type: 'error',
          message: '原密码错误',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      if (this.ruleForm.new_password !== this.ruleForm.new_password_again) {
        this.$message({
          type: 'error',
          message: '两次密码不一致',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: '/user/changePassword',
        method: 'put',
        data: {
          user_password: SparkMD5.hash(this.ruleForm.new_password),
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        this.$store.commit('changePassword', SparkMD5.hash(this.ruleForm.new_password))
        this.$message({
          type: 'success',
          message: '修改成功',
          customClass: 'tip-success',
          center: true
        })
        this.cancel1()
      } else {
        this.$message({
          type: 'error',
          message: '修改失败',
          customClass: 'tip-error',
          center: true
        })
      }
    },
    //密保
    async toEdit() {
      this.type = 'question_box'
      const config = {
        url: "/login/getquestions",
        method: "get"
      }
      const result = await http(config)
      this.items = result.data
    },
    //取消修改密保
    cancel2() {
      this.new_question = ''
      this.new_answer = ''
      this.type = 'info_box'
    },
    //修改密保
    async editQuestion() {
      if (this.new_question === this.user_question && this.new_answer === this.user_answer) {
        this.$message({
          type: 'error',
          message: '没做出任何修改',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: "/user/editQuestion",
        method: "put",
        data: {
          user_question: this.new_question,
          user_answer: this.new_answer,
        },
      }
      const result = await http(config);
      if (result.code === 808) {
        this.$store.commit('changeQuestion', {
          question: this.new_question,
          answer: this.new_answer
        })
        this.cancel2()
        this.$message({
          type: 'success',
          message: '修改成功',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '修改失败',
          customClass: 'tip-error',
          center: true
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  width: 500px;
  margin: 2vw auto;
}
.el-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 60px;
}
.el-main {
  margin: 0 auto;
  p {
    font-size: 25px;
    color: #424242;
  }

}
.el-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 30px;
  .el-button {
    height: 40px;
  }
}
.el-input {
  width: 250px;
  font-size: 15px;
}

/* 头像 */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
}
</style>
