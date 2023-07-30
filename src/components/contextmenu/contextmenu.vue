<template>
  <!-- 阻止在上下文菜单中右键唤出系统菜单 -->
  <div @click.right.prevent>
    <!-- 遮罩：为了关闭上下文菜单 -->
    <div class="bg" @click.self="outClick">
      <div
        :style="{
              position: 'fixed',
              top: `${y}px`,
              left: `${x}px`,
              zIndex: 1999
            }"
      >
        <ul class="context-list">
          <li
            v-for="(item, index) of menuList"
            :key="index"
            @click="handle(item.fn)"
          >
            <el-link
              :icon="item.icon"
              :style="{ color: `${item.color}` }"
              :underline="false"
            >
              {{ item.title }}
            </el-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'contextmenu',
  props: {
    offset: Object,
    file: Object
  },
  data() {
    return {
      client_width: 0,
      client_height: 0,
      menuList: [
        { icon: 'el-icon-folder-opened', title: '打开', color: 'blue', fn: 'open' },
        { icon: 'el-icon-edit-outline', title: '重命名', color: 'orange', fn: 'rename' },
        { icon: 'el-icon-delete', title: '删除', color: 'red', fn: 'delete' },
        { icon: 'el-icon-download ', title: '下载', color: 'green', fn: 'download' }
      ]
    }
  },
  mounted() {
    //获得可视区宽高
    this.client_width = document.documentElement.clientWidth
    this.client_height = document.documentElement.clientHeight
    //绑定scroll事件
    window.addEventListener('scroll', this.listenerScroll)
  },
  methods: {
    //点击菜单外面，关闭菜单
    outClick() {
      this.$emit('update:file', null)
      window.removeEventListener('scroll', this.listenerScroll)
    },
    //监听页面滚动
    listenerScroll() {
      //关闭菜单
      this.outClick()
    },
    //主调度方法
    handle(fn) {
      //调用
      this[fn]()
      //关闭
      this.$emit('update:file', null)
    },
    //打开
    open() {
      this.$parent.current = this.file
    },
    //重命名
    rename() {
      //...
    },
    //删除
    async delete() {
      const config = {
        url: '/data/deleteFile',
        method: 'delete',
        data: {
          file_id: this.file.file_id
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        this.$message({
          type: 'success',
          message: '删除成功',
          customClass: 'tip-success',
          center: true
        })
        //将文件删除操作发布到事件总线
        this.$bus.$emit('fileHandle', { type: 'delete', file_id: this.file.file_id })
      } else {
        this.$message({
          type: 'error',
          message: '删除失败',
          customClass: 'tip-error',
          center: true
        })
      }
      //关闭
      this.$emit('update:file', null)
    },
    //下载
    download() {
      const a = document.createElement('a')
      a.setAttribute('href', this.file.file_src)
      //自执行点击事件
      a.click()
      this.$message({
        type: 'success',
        message: '已开始下载',
        customClass: 'tip-success',
        center: true
      })
    }
  },
  computed: {
    //边界处理
    x() {
      if (this.client_width - this.offset.x < 170) {
        return this.offset.x - 166
      }
      return this.offset.x
    },
    y() {
      if (this.client_height - this.offset.y < 175) {
        return this.offset.y - 175
      }
      return this.offset.y
    }
  }
}
</script>

<style lang="less" scoped>
/* 遮罩 */
.bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
}
/* 上下文菜单 */
.context-list {
  width: 165px;
  background: white;
  box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.3);
  padding: 5px 0;
}

.el-link {
  display: block;
  font-size: 20px;
  line-height: 40px;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  & /deep/ &--inner {
    margin-left: 20px;
    color: #424242;
  }
  /deep/ i {
    margin-left: 15px;
  }
}
</style>
