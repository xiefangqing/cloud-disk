<template>
  <file-table :file_list.sync="imageList" :file_list_all="allImageList" name="图片"></file-table>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'image',
  data() {
    return {
      //所有图片列表
      imageList: [],
      //为了搜索时不重新请求
      allImageList: []
    }
  },
  mounted() {
    this.init()
    //监听文件操作和上传
    this.$bus.$on('fileHandle', this.fileHandle)
    this.$bus.$on('upload', this.fileUpload)
  },
  methods: {
    //获取数据
    async init() {
      const config = {
        url: '/data/getImageData',
        method: 'get'
      }
      const result = await http(config)
      if (result.code === 800) {
        this.imageList = this.allImageList = result.data
      } else if (result.code === 813) {
        this.$message({
          type: 'warning',
          message: '数据为空',
          customClass: 'tip-error',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '数据加载失败',
          customClass: 'tip-error',
          center: true
        })
      }
    },
    fileHandle(arg) {
      const { type, file_id, file_memo, file_folder, folder_name } = arg
      if (type === 'delete') {
        for (let index in this.imageList) {
          if (this.imageList[index].file_id === file_id) {
            this.imageList.splice(index, 1)
          }
          break
        }
        //搜索后删除的处理
        for (let index in this.allImageList) {
          if (this.allImageList[index].file_id === file_id) {
            this.allImageList.splice(index, 1)
          }
          break
        }
        return
      } else if (type === 'deleteFolder') {
        for (let index in this.imageList) {
          if (this.imageList[index].file_folder === folder_name) {
            this.imageList[index].file_folder = ''
          }
          /* 这不能加break */
        }
        return
      } else if (type === 'edit') {
        for (let index in this.imageList) {
          if (this.imageList[index].file_id === file_id) {
            this.imageList[index].file_memo = file_memo
          }
          break
        }
      }




    },
    fileUpload(uploadFiles) {
      for (let file of uploadFiles) {
        if (/image/.test(file.file_type)) {
          //塞到前面
          this.imageList.unshift(file)
        }
      }
    }



  }
}
</script>
