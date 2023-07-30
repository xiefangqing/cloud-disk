<template>
  <div>
    <el-container>
      <!-- 应用栏 -->
      <el-header>
        <h1>云盘</h1>
        <div>
          <div class="head-picture" :style="{
            backgroundImage: `url(${user_avatar})`
          }">
            <i v-if="!user_avatar" class="el-icon-s-custom" style="margin-left: 20px;"></i>
          </div>
          <div class="quit">
            <i class="el-icon-switch-button" @click="quit"></i>
          </div>
        </div>
      </el-header>
      <el-container style="margin-top: 60px;">
        <!-- 导航栏 -->
        <el-aside width="200px" style="position: fixed">
          <el-menu
            :default-active="$route.path"
            router
          >
            <el-menu-item
              v-for="(item, index) of menu"
              :key="index"
              :index="item.link"
            >
              <template #title>
                <span>{{ item.title }}</span>
              </template>
              <i :class="item.icon"></i>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <!-- 内容区 -->
        <el-main style="margin-left: 200px;">
          <upload></upload>
          <transition name="slide-fade" mode="out-in">
            <keep-alive>
              <router-view/>
            </keep-alive>
          </transition>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      //导航菜单
      menu: [
        { icon: 'el-icon-s-management', title: '时光轴', link: '/home/timeline' },
        { icon: 'el-icon-camera-solid', title: '照片管理', link: '/home/image' },
        { icon: 'el-icon-video-camera-solid', title: '视频管理', link: '/home/video' },
        { icon: 'el-icon-star-on', title: '收藏夹', link: '/home/folder' },
        { icon: 'el-icon-s-tools', title: '个人设置', link: '/home/profile' },
      ]
    }
  },
  computed: {
    //头像
    user_avatar() {
      return this.$store.state.user.user_avatar;
    }
  },
  methods: {
    //退出
    quit() {
      this.$store.commit('quit')
      this.$router.replace('/login')
    }
  }
}
</script>

<style lang="less" scoped>
//应用栏
.el-header {
  position: fixed;
  left: 0;
  right: 0;
  background: var(--theme-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  z-index: 20;
  h1 {
    font-size: 30px;
    color: white;
  }
  div {
    display: flex;
    align-items: center;
    font-size: 30px;
    color: white;
    div {
      margin-left: 15px;
    }
  }
}
//头像
.head-picture {
  width: 47px;
  height: 47px;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
}
//退出按钮
.quit {
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  text-align: center;
  i {
    flex: 1;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
//导航栏
.el-aside {
  ul {
    //没数据时也能把导航的高度撑开
    min-height: calc(100vh - 60px);
    height: 100%;
  }
}
.el-main {
  text-color: "#424242";
  active-text-color: var(--theme-color);
}
.el-menu-item {
  i {
    font-size: 30px;
    margin-right: 25px;
  }
  font-size: 20px;
}
</style>
