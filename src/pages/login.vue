<template>
  <div class="container">
    <!-- 顶部信息栏 -->
    <div class="nav">
      <div>
        <el-tooltip class="item" effect="dark" content="代码仓库" placement="bottom">
          <el-link :underline="false" href="https://gitee.com/onlypluto/image-cloud-disk" target="_blank">
            <img src="@/assets/img/github.png">
          </el-link>
        </el-tooltip>
      </div>
    </div>
    <!-- 对话框 -->
    <el-card shadow="hover" >
      <!-- 登录 -->
      <template v-if="type === 'login'">
        <div class="login">
          <el-input
            type="text"
            placeholder="请输入用户名"
            v-model="username"
          ></el-input>
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="password"
          ></el-input>
          <el-button @click="login">登录</el-button>
        </div>
        <div class="option">
          <a @click="toSignUp" style="cursor: pointer">注册</a>
          <a @click="type = 'resetPassword'" style="cursor: pointer">忘记密码</a>
        </div>
      </template>
      <!-- 注册 -->
      <template v-else-if="type === 'signup'">
        <h2>注册</h2>
        <el-form class="register" :model="ruleForm" :rules="rules" ref="ruleForm">
          <el-form-item prop="set_username">
            <el-input
              type="text"
              placeholder="请设置用户名"
              v-model="ruleForm.set_username"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item prop="set_password">
            <el-input
              type="password"
              placeholder="请输入密码"
              v-model="ruleForm.set_password"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item prop="set_password_again">
            <el-input
              type="password"
              placeholder="请再次输入密码"
              v-model="ruleForm.set_password_again"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item prop="question">
            <el-select v-model="ruleForm.question" placeholder="请选择密保问题">
              <el-option
                v-for="item in items"
                :key="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="answer">
            <el-input
              type="text"
              placeholder="密保答案"
              v-model="ruleForm.answer"
              clearable
            ></el-input>
          </el-form-item>
        </el-form>
        <div class="reg-btn">
           <el-button @click="cancel" style="background: #ccc;color: #424242;">取消</el-button>
           <el-button @click="signup">注册</el-button>
        </div>
      </template>
      <!-- 重置密码 -->
      <template v-else>
        <h2>重置密码</h2>
        <div v-if="reset_type === 1">
          <el-input
            type="text"
            placeholder="请输入用户名"
            v-model="username"
            clearable
          ></el-input>
          <div class="reset-btn">
            <i class="el-icon-back" @click="cancel2"></i>
            <i class="el-icon-right" @click="showQuestion"></i>
          </div>
        </div>
        <div v-else-if="reset_type === 2">
          <h3 style="text-align: center;color: #ccc;">{{ ruleForm.question }}</h3>
          <el-input
            type="text"
            placeholder="请输入答案"
            v-model="resetpassword_answer"
            clearable
          ></el-input>
          <div class="reset-btn">
            <i class="el-icon-back" @click="reset_type = 1"></i>
            <i class="el-icon-right" @click="showReset"></i>
          </div>
        </div>
        <div v-else style="width: 250px;">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="ruleForm.set_password"
            clearable
          ></el-input>
          <el-input
            type="password"
            placeholder="请再次输入密码"
            v-model="ruleForm.set_password_again"
            clearable
            style="margin-top: 20px;"
          ></el-input>
          <div class="reset-btn">
            <i class="el-icon-back" @click="reset_type = 2"></i>
            <i class="el-icon-right" @click="reset"></i>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
import http from '@/utils/http.js'

export default {
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('用户名不能为空！'));
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error('长度在 6 到 20 个字之间'));
      } else if (/[^1-9A-Za-z]/.test(value)) {
        callback(new Error('只能由字母和数字组成！'));
      } else {
        this.checkName()
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码！'));
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error('长度在 6 到 20 个字之间'));
      } else if (this.ruleForm.set_password !== value) {
        callback(new Error('两次密码输入不一致！'));
      } else {
        callback()
      }
    }


    return {
      username: '',
      password: '',
      //表单数据对象
      ruleForm: {
        //注册用户名
        set_username: '',
        //注册密码
        set_password: '',
        set_password_again: '',
        //密保问题
        question: '',
        //问题答案
        answer: ''
      },
      //表单验证规则
      rules: {
        set_username: [
          { validator: validateUsername, trigger: 'blur' }
        ],
        set_password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        set_password_again: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        question: [
          { required: true, message: '必须选择', trigger: 'blur' },
        ],
        answer: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { max: 20, message: '答案不能超过20字', trigger: 'blur' }
        ]
      },
      //控制对话框显示
      type: 'login',
      //注册用的密保问题列表
      items: [],
      //重置密码到哪一步了
      reset_type: 1,
      //重置密码时用户输入的密保答案
      resetpassword_answer: ''
    }
  },
  methods: {
    //登录
    async login() {
      if (this.username === '' || this.password === '') {
        this.$message({
          type: 'error',
          message: '用户名或密码不能为空！',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: '/login/login',
        method: 'post',
        data: {
          user_name: this.username,
          user_password: SparkMD5.hash(this.password)
        }
      }
      //向登录接口发请求
      const result = await http(config)
      switch(result.code) {
        case 802:
          //登录成功
          this.$store.commit('login', {
            user: result.data.user,
            token: result.data.token,
            folders: result.data.folders
          })
          //跳转到Home页
          this.$router.push('/home/timeline')
          this.$message({
            type: 'success',
            message: '欢迎你的到来',
            customClass: 'tip-success',
            center: true
          })
          break
        case 803:
          //无此用户
          this.$message({
            type: 'error',
            message: '用户不存在，请注册！',
            customClass: 'tip-error',
            center: true
          })
          break
        case 804:
          //密码错误
          this.$message({
            type: 'error',
            message: '密码错误！',
            customClass: 'tip-error',
            center: true
          })
      }
    },
    //切换注册对话框
    async toSignUp() {
      this.type = 'signup'
      //请求密保问题列表
      const config = {
        url: '/login/getquestions',
        method: 'get'
      }
      const result = await http(config)
      this.items = result.data
    },
    //检查用户名是否已经存在
    async checkName() {
      const config = {
        url: '/login/checkname',
        method: 'post',
        data: {
          user_name: this.ruleForm.set_username
        }
      }
      const result = await http(config)
      if (result.code === 809) {
        this.$message({
          type: 'error',
          message: '用户名已存在！',
          customClass: 'tip-error',
          center: true
        })
        this.ruleForm.set_username = ''
      }
    },
    //取消
    cancel() {
      //清空所有ruleForm的数据并回退到登录
      this.type = 'login'
      this.$refs.ruleForm.resetFields()
    },
    //重置密码时的取消（因为没有用表单验证，所以不能使用resetFields）
    cancel2() {
      this.type = 'login'
      this.username = this.password = this.ruleForm.question = this.ruleForm.answer =  this.resetpassword_answer = this.ruleForm.set_password = this.ruleForm.set_password_again = ''
    },
    //注册
    signup() {
      this.$refs.ruleForm.validate(async (valid, failFields) => {
        if (valid) {
          //通过验证才发送请求进行注册
          const config = {
            url: '/login/signin',
            method: 'post',
            data: {
              user_name: this.ruleForm.set_username,
              user_password: SparkMD5.hash(this.ruleForm.set_password),
              user_question: this.ruleForm.question,
              user_answer: this.ruleForm.answer,
              mock: 'mock'
            }
          }
          const result = await http(config)
          if (result.code === 820) {
            //注册成功
            this.type = 'login'
            this.username = this.ruleForm.set_username
            this.$refs.ruleForm.resetFields()
            this.$message({
              type: 'success',
              message: '注册成功',
              customClass: 'tip-success',
              center: true
            })
          } else {
            this.$message({
              type: 'error',
              message: result.message,
              customClass: 'tip-error',
              center: true
            })
          }
        } else {
          this.$message({
            type: 'error',
            message: '未通过验证，无法注册',
            customClass: 'tip-error',
            center: true
          })
        }
      })
    },
    //重置密码：请求用户密保问题
    async showQuestion() {
      const config = {
        url: '/login/getuserquestion',
        method: 'get',
        params: {
          user_name: this.username
        }
      }
      const result = await http(config)
      if (result.code !== 801) {
        this.ruleForm.question = result.data.user_question
        this.ruleForm.answer = result.data.user_answer
        this.reset_type = 2
      } else {
        this.$message({
          type: 'error',
          message: '没有这个用户',
          customClass: 'tip-error',
          center: true
        })
      }
    },
    //重置密码：验证密保答案
    showReset() {
      if (this.ruleForm.answer !== this.resetpassword_answer) {
        this.$message({
          type: 'error',
          message: '密保答案错误!',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      this.reset_type = 3
    },
    //重置密码
    async reset(){
      if (this.ruleForm.set_password === '' || this.ruleForm.set_password_again === '') {
        this.$message({
          type: 'error',
          message: '不能为空！',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      if (this.ruleForm.set_password !== this.ruleForm.set_password_again) {
        this.$message({
          type: 'error',
          message: '两次输入密码不一致！',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: '/login/resetpassword',
        method: 'post',
        data: {
          user_name: this.username,
          user_password: SparkMD5.hash(this.ruleForm.set_password)
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //修改成功清空数据
        this.cancel2()
        //回到第一步
        this.reset_type = 1
        this.$message({
          type: 'success',
          message: '密码重置成功！',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '重置失败！',
          customClass: 'tip-error',
          center: true
        })
      }
    }



  }
}
</script>

<style lang="less" scoped>
//公共
/deep/ input{
  border-radius: 100px;
  background: rgba(250, 250, 250, 0.486);
  border: none;
  font-size: 16px;
  color: #222;
  &::placeholder {
    color: #87706C;
  }
}
/deep/ .el-form-item__error {
  left: 15px;
}
.el-input, .el-select {
  width: 250px;
}
.el-button {
  width: 150px;
  line-height: 40px;
  background: var(--theme-color);
  border: none;
  padding: 0 16px;
  color: #eeeded;
  font-size: 16px;
}


//总容器
.container {
  height: 100vh;
  background: url("../assets/img/bg1.png");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
//顶部信息栏
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #050716;
  div {
    display: flex;
    justify-content: flex-end;
    .item {
      margin-right: 25px;
      img {
        height: 40px;
        padding: 5px 0;
      }
    }
  }
}
//对话框
.el-card {
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 400px;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  position: relative;
  border: 1px solid #222831;
  &.is-hover-shadow:hover {
    box-shadow: 0px 0px 15px 0px black;
  }
}
//登录
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  .el-input {
    margin: 20px 0;
  }
  .el-button {
    margin-top: 20px;
  }
}
.option {
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}
//注册
h2 {
  font-size: 44px;
  text-align: center;
  color: var(--theme-color);
  margin-bottom: 20px;
}
.register {
  display: flex;
  flex-flow: column;
  align-items: center;
  width: 400px;
}
.reg-btn {
  display: flex;
  justify-content: space-evenly;
  margin-top: 20px;
  button {
    width: 100px;
  }
}
//重置按钮
.reset-btn {
  display: flex;
  justify-content: space-around;
  font-size: 50px;
  margin-top: 20px;
  color: var(--theme-color);
  i {
    cursor: pointer;
  }
}


</style>
