<template>
  <div>
    <el-button
      class="btn"
      circle
      @click="btnClick"
    >
      <i v-if="!uploading" class="el-icon-plus"></i>
      <span v-else style="font-size: 20px;line-height: 50px;">{{ completed_counter }}/{{ files.length }}</span>
    </el-button>
    <input
      style="display: none"
      type="file"
      accept="image/*,video/*"
      multiple
      ref="file"
      @change="fileChange"
    ></input>
    <!-- 上传列表 -->
    <el-dialog
      :visible="sheet"
      width="800px"
      title="上传列表"
      center
      :show-close="false"
    >
      <el-table
        :data="files"
        :show-header="false"
        size="mini"
      >
        <el-table-column type="index" :index="1"></el-table-column>
        <el-table-column property="name"></el-table-column>
        <el-table-column width="100">
          <template slot-scope="scope">
            <el-button
              circle
              style="border: none;font-size: 20px;"
              icon="el-icon-close"
              @click="deleteItem(scope.$index, scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="upload-btn">
          <el-button @click="sheet = false">取消</el-button>
          <el-button @click="upload" style="background: var(--theme-color);color: white;">开始上传</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { cutBlob } from '@/utils/util'
import http from '@/utils/http'
import SparkMD5 from 'spark-md5'
import {mkMini} from '../../utils/util'
export default {
  name: 'upload',
  mounted() {
    this.hash = SparkMD5.hash(this.$store.state.user.user_id)
  },
  data() {
    return {
      //文件列表
      files: [],
      //开始上传
      uploading: false,
      //上传完成的文件数量
      completed_counter: 0,
      //控制上传列表的显示
      sheet: false,
      //用户id的hash
      hash: null,
      //已经成功上传的文件
      completed_files: []
    }
  },
  watch: {
    files() {
      if (this.files.length === 0) {
        this.sheet = false
      }
    }
  },
  methods: {
    //监听按钮的点击事件，触发file的click事件
    btnClick() {
      if (this.uploading) {
        this.$message({
          type: 'error',
          message: '上传任务未完成',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      this.$refs.file.click()
    },
    //选择文件后的处理
    fileChange() {
      this.sheet = true
      this.files = Array.from(this.$refs.file.files)
    },
    //删除已选择的文件
    deleteItem(index) {
      this.files.splice(index, 1)
    },
    //上传
    async upload() {
      this.sheet = false
      this.uploading = true
      for(let file of this.files) {
        //文件切片，返回装着所有片的数组chunkArr和fileInfo
        let file_chunk = await cutBlob(file)
        //遍历切片数组，上传每一个切片
        let promise_all = file_chunk.chunkArr.map((item, index) => {
          return new Promise(async (resolve, reject) => {
            let data = new FormData()
            data.append('chunk', item)
            data.append('index', index)
            data.append('hash', this.hash)
            const config = {
              url: 'upload/upload',
              method: 'post',
              data
            }
            let result = await http(config)
            if (result.code === 812) {
              resolve()
            } else {
              reject('upload.vue_100行往下，切片上传出了问题')
            }
          })
        })
        let result1 = await Promise.all(promise_all).then(res => {
          return 'success'
        }).catch(err => {
          this.$message({
            type: 'error',
            message: `${file_chunk.fileInfo.name}上传失败`,
            customClass: 'tip-error',
            center: true
          })
          console.log(err)
        })
        //切片全部上传完成，通知服务器合并切片
        //制作迷你图
        let mini = await mkMini(file)
        const config = {
          url: '/upload/completed',
          method: 'post',
          data: {
            hash: this.hash,
            chunkNum: file_chunk.fileInfo.total,
            file_name: file_chunk.fileInfo.name,
            file_size: file_chunk.fileInfo.size,
            file_type: file_chunk.fileInfo.type,
            file_mini: mini
          }
        }
        let result2 = await http(config)
        if (result2.code === 808) {
          this.completed_counter ++
          this.completed_files.push(result2.data)
        }
      }
      //关闭上传
      this.uploading = false
      this.completed_counter = 0
      this.files = []
      this.$message({
        type: 'success',
        message: '上传完成',
        customClass: 'tip-success',
        center: true
      })
      //发布事件
      this.$bus.$emit('upload', this.completed_files)
      this.completed_files = []
    }
  }
}
</script>

<style lang="less" scoped>
.btn {
  width: 50px;
  height: 50px;
  padding: 0;
  font-size: 30px;
  position: fixed;
  right: 40px;
  bottom: 30px;
  z-index: 20;
  background: var(--theme-color);
  color: white;
}
.el-table {
  font-size: 20px;
}
.upload-btn {
  .el-button {
    margin: 0 30px 12px;
    width: 120px;
  }
}
</style>
