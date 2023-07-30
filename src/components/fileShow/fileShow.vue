<template>
  <div>
    <!-- 添加到收藏夹 -->
    <el-dialog
      class="folder"
      :visible="dialog1"
      width="30%"
      center
      :show-close="false"
      :append-to-body="true"
    >
      <div style="text-align: center;color: var(--theme-color)">
        <div style="font-size: 30px;">加入到收藏夹</div>
        <i style="display: block;font-size: 60px;margin: 30px 0;" class="el-icon-folder"></i>
        <el-select
          placeholder="请选择收藏夹"
          v-model="folder"
        >
          <el-option
            v-for="item in $store.state.folders"
            :key="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
      <template #footer>
        <el-button @click="dialog1 = false">取 消</el-button>
        <el-button @click="addFolder" style="background: var(--theme-color); color: white;margin-left: 50px;">加 入</el-button>
      </template>
    </el-dialog>
    <!-- 删除对话框 -->
    <el-dialog
      :visible="dialog2"
      width="30%"
      center
      :show-close="false"
      :append-to-body="true"
    >
      <div style="font-size: 20px;text-align: center">确定要删除吗？</div>
      <template #footer>
        <el-button @click="dialog2 = false">取 消</el-button>
        <el-button @click="deleteFile" style="background: var(--theme-color); color: white;margin-left: 50px;">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 遮罩 -->
    <div class="bg" @click.self="outClick">
      <el-card
        shadow="hover"
        :body-style="{
          padding: 0,
          height: '100%',
          display: 'flex'
      }"
      >
        <i class="el-icon-error" @click.self="outClick"></i>
        <img
          v-if="/image/.test(file.file_type)"
          :src="file.file_src"
          width="70%"
          height="100%"
          :style="{ objectFit: 'contain' }"
        >
        <video
          v-if="/video/.test(file.file_type)"
          :src="file.file_src"
          width="70%"
          height="100%"
          controls
        ></video>
        <div class="content">
          <div class="content-memo">
            <!-- 绑定双击事件 -->
            <h2 v-if="!edit" @dblclick="edit = true">{{ file.file_memo || '无备忘' }}</h2>
            <div v-else>
              <input
                type="text"
                v-model="memo"
                autofocus
                placeholder="请填写备忘信息，最大不超过50字"
                maxlength="50"
                @keydown.enter="editMemo"
              ></input>
            </div>
          </div>
          <div class="content-info" style="height: 50%;">
            <div class="file">
              <p>名称：<span>{{ file.file_name }}</span></p>
              <p>照片大小：<span>{{ file.file_size | formatToMB }}MB</span></p>
              <p>上传时间：<span>{{ file.file_time }}</span></p>
              <p>收藏夹：<span>{{ file.file_folder }}</span></p>
            </div>
            <div class="btn">
              <i class="el-icon-folder-opened" style="background: blue;" @click="dialog1 = true"></i>
              <i class="el-icon-edit-outline" style="background: orange" @click="edit = true"></i>
              <i class="el-icon-delete" style="background: red" @click="dialog2 = true"></i>
              <i class="el-icon-download" style="background: green" @click="downloadFile"></i>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'fileShow',
  props: {
    file: Object
  },
  data() {
    return {
      edit: false,
      //备忘信息
      memo: '',
      //控制添加到收藏夹对话的显示
      dialog1: false,
      //删除对话框的显示
      dialog2: false,
      folder: ''
    }
  },
  methods: {
    //点图片外面，关闭图片展示
    outClick() {
      this.$emit('update:file', null)
    },
    //编辑备忘
    async editMemo() {
      if (this.memo === '') {
        this.edit = false
        this.$message({
          type: 'error',
          message: '备忘信息为空',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: '/data/editMemo',
        method: 'put',
        data: {
          file_id: this.file.file_id,
          file_memo: this.memo
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //及时更新
        this.file.file_memo = this.memo
        //将操作发布到事件总线
        this.$bus.$emit('fileHandle', { type: 'edit', file_id: this.file.file_id, file_memo: this.memo })
        this.$message({
          type: 'success',
          message: '备忘编辑成功',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '备忘编写失败',
          customClass: 'tip-error',
          center: true
        })
      }
      this.edit = false
    },
    //下载文件
    downloadFile() {
      const a = document.createElement('a')
      a.setAttribute('href', this.file.file_src)
      a.click()
      this.$message({
        type: 'success',
        message: '已开始下载',
        customClass: 'tip-success',
        center: true
      })
    },
    //删除文件
    async deleteFile() {
      const config = {
        url: "/data/deleteFile",
        method: "delete",
        data: {
          file_id: this.file.file_id,
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //关闭展示窗口
        this.$emit('update:file', null)
        //将文件操作发布到事件总线
        this.$bus.$emit('fileHandle', { type: 'delete', file_id: this.file.file_id })
        this.$message({
          type: 'success',
          message: '删除成功',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '删除失败',
          customClass: 'tip-error',
          center: true
        })
      }
    },
    //添加到收藏夹
    async addFolder() {
      if (this.folder === this.file.file_folder) {
        this.dialog1 = false
        this.$message({
          type: 'error',
          message: '该文件已在此收藏夹中，操作无效',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url:'/data/addFolder',
        method:'post',
        data: {
          file_id: this.file.file_id,
          file_folder: this.folder
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //注意这里是先发布再更新，在folderShow中有处理
        //把文件操作发布到事件总线
        this.$bus.$emit('fileHandle', { type: 'add', file_id: this.file.file_id, file_folder: this.folder, current_folder: this.file.file_folder, file: this.file })
        //及时更新
        this.file.file_folder = this.folder
        this.$message({
          type: 'success',
          message: '已加入收藏夹',
          customClass: 'tip-success',
          center: true
        })
      } else {
        this.$message({
          type: 'error',
          message: '操作失败',
          customClass: 'tip-error',
          center: true
        })
      }
      this.dialog1 = false
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

  display: flex;
  justify-content: center;
  align-items: center;
}

.el-card {
  width: 85vw;
  height: 45vw;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  position: relative;
}

/* 关闭按钮 */
.el-icon-error {
  position: absolute;
  top: 5px;
  right: 5px;
}

//右边内容区
.content {
  flex: 1;
  padding: 0 10px;
  border-left: 2px solid black;
  &-memo {
    height: 30%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-top: 50px;
    input {
      width: 250px;
      color: white;
      outline: none;
      background: transparent;
      height: 28px;
      border: none;
      font-size: 15px;
      border-bottom: 2px solid orange;
      &::-webkit-input-placeholder {
        color: orange;
      }
    }
  }
  &-info {
    display: flex;
    justify-content: center;
    flex-flow: column;
    .file {
      display: flex;
      flex-flow: column;
      gap: 10px;
      color: #bdbdbd;
      font-size: 18px;
      margin-bottom: 50px;
      span {
        color: white;
      }
    }
    .btn {
      display: flex;
      justify-content: center;
      gap: 30px;
      align-items: center;
      flex: 1;
      font-size: 30px;
      i {
        border-radius: 50%;
        width: 50px;
        line-height: 50px;
        text-align: center;
        cursor: pointer;
        color: white;
      }
    }
  }
}

//加入收藏夹的对话框
.folder /deep/ .el-dialog__header {
  padding: 0;
}




</style>
