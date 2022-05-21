<template>
  <div class="basic-layout">

    <!-- 左侧导航栏 start -->
    <div :class="['nav-side',isCollapse?'fold':'unfold']">

      <!-- title start -->
      <div class="manager-title">
        <el-icon>
          <calendar />
        </el-icon>
        <span v-show="!isCollapse">Manager</span>
      </div>
      <!-- title end -->
      <!-- 导航菜单 start -->
      <el-menu :default-active="activeMenu" background-color="#001529" text-color="#fff" router :collapse="isCollapse" class="nav-menu">
        <TreeMenu :userMenu="userMenu" />
      </el-menu>
      <!-- 导航菜单 end -->
    </div>
    <!-- 左侧导航栏 end -->

    <!-- 右侧内容区 start -->
    <div :class="['content-right',isCollapse?'fold':'unfold']">

      <!-- 面包屑 start -->
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <el-icon>
              <fold />
            </el-icon>
          </div>
          <div class="bread">
            <BreadCrumb />
          </div>
        </div>
        <div class="user-info">
          <el-badge :is-dot="noticeCount>0?true:false" class="notice" @click="$router.push('/audit/approve')">
            <el-icon>
              <bell />
            </el-icon>
          </el-badge>
          <el-dropdown @command="handleLogout">
            <span class="user-link">
              {{userInfo.userName}}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">邮箱：{{userInfo.userEmail}}</el-dropdown-item>
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 面包屑 end -->

      <!-- 内容区 start -->
      <div class="wrapper">
        <router-view />
      </div>
      <!-- 内容区 end -->
    </div>
    <!-- 右侧内容区 end -->

  </div>
</template>

<script>
import TreeMenu from './TreeMenu.vue'
import BreadCrumb from './BreadCrumb.vue'
export default {
  name: 'Home',
  components: { TreeMenu, BreadCrumb },
  data() {
    return {
      isCollapse: false,
      userInfo: this.$store.state.userInfo || {},
      noticeCount: 0,
      userMenu: [],
      activeMenu: location.hash.slice(1)
    }
  },
  computed: {
    noticeCount() {
      return this.$store.state.noticeCount
    }
  },
  mounted() {
    this.getNoticeCount()
    this.getMenuList()
  },
  methods: {
    handleLogout(key) {
      if (key === 'email') return
      this.$store.commit('saveUserInfo', '')
      this.userInfo = {}
      this.$router.push('/login')
    },
    toggle() {
      this.isCollapse = !this.isCollapse
    },
    async getNoticeCount() {
      try {
        const count = await this.$api.noticeCount()
        this.$store.commit('saveNoticeCount', count)
      } catch (error) {
        console.error(error)
      }
    },
    async getMenuList() {
      try {
        const { menuList, actionList } = await this.$api.permissionList()
        this.userMenu = menuList
        this.$store.commit('saveUserMenu', menuList)
        this.$store.commit('saveUserAction', actionList)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss">
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
    transition: width 1s;

    .manager-title {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      line-height: 50px;
      font-size: 24px;

      span {
        margin-left: 5px;
        font-weight: 600;
      }
    }

    .nav-menu {
      border-right: none;
    }
    // 合并
    &.fold {
      width: 64px;
    }
    // 展开
    &.unfold {
      width: 200px;
    }
  }

  .content-right {
    margin-left: 200px;
    transition: all 1s;
    
    .nav-top {
      height: 50px;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;

      .nav-left {
        display: flex;
        align-items: center;

        .menu-fold {
          margin-right: 8px;
          font-size: 18px;
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;

        .notice {
          line-height: 30px;
          margin-right: 10px;
          cursor: pointer;
        }

        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .wrapper {
      height: calc(100vh - 50px);
      padding: 20px;
      background-color: #eef0f3;
    }

     // 合并
    &.fold {
      margin-left: 64px;
    }
    // 展开
    &.unfold {
      margin-left: 200px;
    }
  }
}
</style>