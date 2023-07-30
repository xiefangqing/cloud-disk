<template>
  <div class="box">
    <file-show
      v-if="file"
      :file.sync="file"
    ></file-show>
    <el-card
      v-else
      class="folder"
      :body-style="{
        display: 'flex',
        gap: '10px 20px',
        position: 'relative',
        flex: 1
      }"
    >
      <template #header>
        <div class="title">
          <span>{{ folder }}</span>
          <i class="el-icon-error" @click="closeShow"></i>
        </div>
      </template>
      <div v-for="(item, index) in files" :key="index">
        <el-card
          style="border: none;"
          shadow="hover"
          :body-style="{
            padding: 0,
          }"
        >
          <div
            class="item"
            :style="{
              background: `#ccc url(${item.file_mini}) no-repeat center`,
              backgroundSize: 'cover',
            }"
            @click="file = item"
          >
            <i class="el-icon-video-play" v-if="/video/.test(item.file_type)"></i>
          </div>
          <div style="text-align: center">{{ item.file_name }}</div>
        </el-card>
      </div>
      <div class="footer">
        <el-link :underline="false" @click="deleteFolder">删除收藏夹</el-link>
        <p>共计 {{ image_counter }} 张照片，{{ video_counter }} 个视频</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'folderShow',
  props: {
    folder: String
  },
  data() {
    return {
      //图片数量
      image_counter: 0,
      //视频数量
      video_counter: 0,
      //文件列表
      files: [],
      //控制文件打开的对话框显示
      file: null
    }
  },
  mounted() {
    this.init()
    this.$bus.$on('fileHandle', this.fileHandle)
  },
  methods: {
    //数据初始化
    async init() {
      const config = {
        url: '/data/getFolderData',
        method: 'get',
        params: {
          folder: this.folder
        }
      }
      const result = await http(config)
      this.files = result.data.result
      this.image_counter = result.data.counter.image
      this.video_counter = result.data.counter.video
    },
    //文件操作
    fileHandle(arg) {
      const {type, file_id, file_memo, file_folder, current_folder, file} = arg;
      if (type === 'delete') {
        //删除
        for(let index in this.files) {
          if (this.files[index].file_id === file_id) {
            this.files.splice(index, 1)
          }
        }
      } else if (type === 'add'){
        //从原来的文件夹中删除
        if (this.folder === current_folder) {
          for (let index in this.files) {
            if (this.files[index].file_id === file_id) {
              this.files.splice(index, 1)
            }
          }
        }
        //添加到新的文件夹
        if (this.folder === file_folder) {
          this.files.push(file)
        }
      }
    },
    //删除收藏夹
    async deleteFolder() {
      const config = {
        url: '/data/deleteFolder',
        method: 'delete',
        data: {
          folder_name: this.folder
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        this.$store.commit('deleteFolder', this.folder)
        this.$bus.$emit('fileHandle', { type: 'deleteFolder', folder_name: this.folder })
        this.$message({
          type: 'success',
          message: '删除收藏夹成功',
          customClass: 'tip-success',
          center: true
        })
        this.closeShow()
      } else {
        this.$message({
          type: 'success',
          message: '删除收藏夹失败',
          customClass: 'tip-success',
          center: true
        })
      }
    },
    //关闭收藏夹显示
    closeShow() {
      this.$emit('update:folder', null)
    }


  }
}
</script>

<style lang="less" scoped>
.box {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}
.folder {
  width: 80vw;
  height: 35vw;
  background: #424242;
  display: flex;
  flex-flow: column;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 30px;
    color: #dadada;
  }
}
/deep/ .el-card__header {
  border-bottom: 2px solid white;
}


.item {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 0;
}
.el-card.is-hover-shadow:hover {
  box-shadow: 0px 0px 15px 0px black;
}


//底部信息
.footer {
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 20px;
  color: white;
}
</style>
