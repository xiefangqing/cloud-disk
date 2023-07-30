<template>
  <div>
    <folder-show
      v-if="folder_click"
      :folder.sync="folder_click"
    ></folder-show>
    <!-- 显示区域 -->
    <div style="display: flex;gap: 0 20px;">
      <div
        v-for="(item, index) in folders"
        :key="index"
        class="folder"
        @click="folder_click = item"
      >
        <i class="el-icon-folder"></i>
        <span>{{ item }}</span>
      </div>
      <div class="add-folder" @click="dialog1 = true">
        <i class="el-icon-plus"></i>
        <span>新建收藏夹</span>
      </div>
    </div>
    <!-- 新建收藏夹对话框 -->
    <el-dialog
      :visible.sync="dialog1"
      width="30%"
      center
      :show-close="false"
      close-on-press-escape
      custom-class="new-folder"
    >
      <div>
        <h2>新建文件夹</h2>
        <i class="el-icon-folder"></i>
        <el-input
          v-model="folder_name"
          placeholder="请输入文件夹名"
          autofocus
          style="width: 70%"
        ></el-input>
      </div>
      <template #footer>
        <el-button @click="(dialog1 = false), (folder_name = '')">取 消</el-button>
        <el-button style="background: var(--theme-color); color: white;margin-left: 50px;" @click="createFolder">创 建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'folder',
  created() {
    this.folders = this.$store.state.folders
  },
  data() {
    return {
      //收藏夹列表
      folders: [],
      //新建收藏夹对话框
      dialog1: false,
      //文件夹名称
      folder_name: '',
      //控制文件夹的展示
      folder_click: false
    }
  },
  methods: {
    //创建文件夹
    async createFolder() {
      //检测
      if (this.folder_name === '' || /[^0-9A-Za-z\u4e0 0-\u9fa5]/.test(this.folder_name)) {
        this.$message({
          type: 'error',
          message: '名称不能为空且由数字、字母和中文组成',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      const config = {
        url: '/data/foundfolder',
        method: 'post',
        data: {
          folder_name: this.folder_name
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //创建成功，更新store中数据
        this.$store.commit('updateFolder', this.folder_name)
        this.$message({
          type: 'success',
          message: '创建收藏夹成功',
          customClass: 'tip-success',
          center: true
        })
        //关闭
        this.dialog1 = false
        this.folder_name = ''
      } else {
        this.$message({
          type: 'error',
          message: result.message,
          customClass: 'tip-error',
          center: true
        })
      }



    }
  }
}
</script>

<style lang="less" scoped>
/* 显示区域 */
.folder {
  width: 100px;
  display: flex;
  flex-flow: column;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
  border-radius: 4px;
  i {
    font-size: 60px;
    color: var(--theme-color);
  }
  span {
    text-align: center;
  }
  &:hover {
    background: #eee;
  }
}
.add-folder {
  &:extend(.folder);
  background: #eee;
  i {
    font-size: 60px;
    color: white;
  }
  &:hover {
    background: #ccc;
  }
}
/* 新建收藏夹对话框 */
.new-folder {
  div {
    text-align: center;
    h2 {
      font-size: 30px;
    }
    .el-icon-folder {
      display: block;
      font-size: 60px;
      margin: 30px 0;
      color: var(--theme-color);
    }
  }
  .el-button {
    width: 100px;
  }
}

</style>
