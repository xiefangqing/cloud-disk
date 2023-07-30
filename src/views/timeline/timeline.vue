<template>
  <div>
    <!-- 利用.sync修饰符，子组件直接修改父组件数据 -->
    <contextmenu
      v-if="rightClickFile"
      :offset="offset"
      :file.sync="rightClickFile"
    ></contextmenu>
    <file-show v-if="current" :file.sync="current"></file-show>
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) of files"
        :key="index"
        color="var(--theme-color)"
        size="large"
      >
        <el-card>
          <template #header>
            <div style="font-size: 20px">{{ activity[0].file_time }}</div>
          </template>
          <div class="box">
            <div v-for="(item, index) of activity" :key="index">
              <el-card
                :body-style="{ padding: '0' }"
                shadow="hover"
              >
                <div
                  class="item"
                  :style="{
                    background: `#ccc url(${item.file_mini}) no-repeat center`,
                    backgroundSize: 'cover'
                  }"
                  @click.right.prevent="rightClick(item, $event)"
                  @click="current = item"
                >
                  <i
                    class="el-icon-video-play"
                    v-if="/video/.test(item.file_type)"
                  ></i>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'timeline',
  data() {
    return {
      files: [],
      //请求第几页的数据
      page: 0,
      //右键点击的文件(同时也控制上下文菜单的显示)
      rightClickFile: null,
      //右键点击的坐标
      offset: {
        x: 0,
        y: 0
      },
      //当前打开展示的文件
      current: null,
      scroll_height: 0,
      client_height: 0,
      //已请求全部后台数据
      isAll: false
    }
  },
  async created() {
    //数据初始化：获得用户存储的图片和视频
    const result = await this.getData()
    this.files = result
    //获得文档高度和可视区高度
    this.$nextTick(() => {
      this.scroll_height = document.documentElement.scrollHeight
      this.client_height = document.documentElement.clientHeight
    })
  },
  mounted() {
    //监听文件操作
    this.$bus.$on('fileHandle', this.fileHandle)
    this.$bus.$on('upload', this.fileUpload)
    window.addEventListener('scroll', async () => {
      if (document.documentElement.scrollTop === this.scroll_height - this.client_height && !this.isAll) {
        const result = await this.getData()
        if (result.length === 0) {
          this.isAll = true
          return
        }
        for (let item of result) {
          this.files.push(item)
        }
        //重新获取
        this.$nextTick(() => {
          this.scroll_height = document.documentElement.scrollHeight
          this.client_height = document.documentElement.clientHeight
        })
      }
    })
  },
  methods: {
    //请求数据
    async getData() {
      const config = {
        url: '/data/getTimelineDataLimit',
        method: 'get',
        params: {
          page: this.page,
          limit: 5
        }
      }
      const result = await http(config)
      this.page++
      return result.data
    },
    //监听鼠标右击事件
    rightClick(item, e) {
      //获取鼠标点击的坐标
      this.offset.x = e.clientX
      this.offset.y = e.clientY
      this.rightClickFile = item
    },
    //文件操作后执行的回调
    fileHandle(arg) {
      const { type, file_id, file_memo, file_folder, folder_name } = arg
      if (type === 'delete') {
        //双循环
        for (let index in this.files) {
          for (let i in this.files[index]) {
            if (this.files[index][i].file_id === file_id) {
              this.files[index].splice(i, 1)
              //如果这个时间线没文件了，就移除
              if (this.files[index].length === 0) {
                this.files.splice(index, 1)
              }
              break
            }
          }
        }
      } else if (type === 'edit') {
        for (let index in this.files) {
          for (let i in this.files[index]) {
            if (this.files[index][i].file_id === file_id) {
              this.files[index][i].file_memo = file_memo
              break
            }
          }
        }
      } else if (type === 'add') {
        for (let index in this.files) {
          for (let i in this.files[index]) {
            if (this.files[index][i].file_id === file_id) {
              this.files[index][i].file_folder = file_folder
              break
            }
          }
        }
      } else if (type === 'deleteFolder') {
        for (let index in this.files) {
          for (let i in this.files[index]) {
            if (this.files[index][i].file_folder === folder_name) {
              this.files[index][i].file_folder = ''
              break
            }
          }
        }
      }
    },
    //文件上传后执行的回调
    fileUpload(completedFiles) {
      if(this.files.length == 0 || this.files[0][0].file_time !== completedFiles[0].file_time){
        this.files.unshift(completedFiles.reverse());
      }else{
        this.files[0].unshift(...completedFiles.reverse());
      }
    }




  }
}
</script>

<style lang="less" scoped>
.box {
  display: flex;
  flex-flow: wrap;
  gap: 20px 30px;
  .item {
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
.el-card.is-hover-shadow:hover {
  box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.5)
}
</style>
