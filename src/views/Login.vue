<template>
  <div class="login-wrapper">
    <div class="modal">
      <div class="title">Manager</div>
      <el-form ref="userForm" :model="user" status-icon :rules="rules">
        <el-form-item prop="userName">
          <el-input type="text" prefix-icon="user" v-model="user.userName" size="default" />
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input type="password" prefix-icon="view" v-model="user.userPwd" size="default" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="login" size="default">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import utils from '../utils/utils'
import storage from '../utils/storage'
export default {
  name: 'Login',
  data() {
    return {
      user: { userName: '', userPwd: '' },
      rules: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        userPwd: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    login() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.$api.loginApi(this.user).then(async (res) => {
            this.$store.commit('saveUserInfo', res)
            await this.loadAsyncRouotes()
            this.$router.push('/')
          })
        } else {
          return false
        }
      })
    },
    async loadAsyncRouotes() {
      let userInfo = storage.getItem('userInfo') || {}
      if (userInfo.token) {
        try {
          const { menuList } = await this.$api.permissionList()
          let routes = utils.generateRoute(menuList)
          routes.map((route) => {
            let url = `./../views/${route.component}.vue`
            route.component = () => import(/* @vite-ignore */ url)
            this.$router.addRoute('home', route)
          })
        } catch (error) {}
      }
    }
  }
}
</script>

<style lang="scss">
.login-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #F8F9F9 ;
  display: flex;
  justify-content: center;
  align-items: center;

  .modal {
    width: 350px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 0 20px 10px #ddd;
    padding: 20px;

    .title {
      font-size: 25px;
      font-weight: 700;
      text-align: center;
      line-height: 35px;
      margin: 0 auto 20px;
      padding: 5px 0;
      text-shadow: 2px 0 4px #ddd;
      border-bottom: 2px dashed #ddd;
    }

    .login-btn {
      width: 100%;
    }
  }
}
</style>