<template>
  <div>
    <div class="title">
      <h1>所有{{ name }}</h1>
      <div>
        按名称搜索：
        <el-input
          v-model="search"
          placeholder="输入关键字后回车"
          @keydown.enter.native="filterFile"
        />
      </div>
    </div>
    <el-table
      :data="file_list_computed.slice((currentPage-1)*pageSize, currentPage*pageSize)"
      style="width: 100%;font-size: 20px;"
      @selection-change="handleSelectionChange"
      :row-key="rowKey"
      @row-click="handleRowClick"
      ref="table"
    >
      <el-table-column type="selection" width="55" reserve-selection></el-table-column>
      <el-table-column prop="file_mini" label="文件" width="180">
        <template slot-scope="scope">
          <img :src="scope.row.file_mini" min-width="100" height="100">
        </template>
      </el-table-column>
      <el-table-column prop="file_name" label="名称" align="right" width="180" sortable></el-table-column>
      <el-table-column prop="file_size" label="大小" align="right"  sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.file_size | formatToMB }}MB</span>
        </template>
      </el-table-column>
      <el-table-column prop="file_time" label="上传时间" align="right" sortable></el-table-column>
      <el-table-column prop="file_folder" label="收藏夹" align="center" sortable></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <div class="btn">
            <i class="el-icon-folder-opened" style="background: blue;" @click.stop="(file = scope.row), ($refs.table.clearSelection())"></i>
            <i class="el-icon-delete" style="background: red" @click.stop="deleteFile(scope.row.file_id)"></i>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="option">
      <el-button style="font-size: 20px;background: var(--theme-color);color: white;" @click="bulkDelete">批量删除</el-button>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15]"
        :page-size="pageSize"
        layout="prev, pager, next, total, sizes"
        :total="file_list_computed.length"
        background
      >
      </el-pagination>
    </div>
    <file-show v-if="file" :file.sync="file"></file-show>
  </div>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'fileTable',
  props: {
    file_list: Array,
    file_list_all: Array,
    name: String
  },
  computed: {
    file_list_computed() {
      return this.file_list
    }
  },
  data() {
    return {
      //打开的文件
      file: null,
      //当前是第几页
      currentPage: 1,
      //每页几条数据
      pageSize: 5,
      //选中项
      selectFile: [],
      search: '',
      //搜索过渡后的文件列表
      new_file_list: []
    }
  },
  methods: {
    //返回唯一id值
    rowKey(row) {
      return row.file_id
    },
    //删除文件
    async deleteFile(file_id) {
      //清除选中项
      this.$refs.table.clearSelection()
      const config = {
        url: '/data/deleteFile',
        method: 'delete',
        data: {
          file_id
        }
      }
      const result = await http(config)
      if (result.code === 808) {
        //将文件操作发布到事件总线
        this.$bus.$emit('fileHandle', { type: 'delete', file_id })
        //把列表中的删去
        for (let index in this.file_list_computed) {
          if (this.file_list_computed[index].file_id === file_id) {
            this.file_list_computed.splice(index, 1)
          }
        }
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
    //pageSize改变时会触发
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
    },
    //currentPage改变时会触发
    handleCurrentChange(page) {
      this.currentPage = page
    },
    //选择项改变触发
    handleSelectionChange(select_item) {
      this.selectFile = select_item
    },
    //某一行被点击时触发
    handleRowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    //批量删除
    async bulkDelete() {
      if (this.selectFile.length === 0) {
        this.$message({
          type: 'error',
          message: '没有选中项',
          customClass: 'tip-error',
          center: true
        })
        return
      }
      let file_list	= []
      for (let file of this.selectFile) {
        file_list.push(file.file_id)
      }
      const config = {
        url: '/data/bulkDelete',
        method: 'delete',
        data: {
          file_list
        }
      }
      const result = await http(config)
      for (let item of result.data) {
        //将文件操作发布到总线(做成组件时再改)
        this.$bus.$emit('fileHandle', { type: 'delete', file_id: item })
        //更新表格数据
        for (let i in this.file_list_computed) {
          if (this.file_list_computed[i].file_id === item) {
            this.file_list_computed.splice(i, 1)
          }
        }
      }
      //选中项清空
      this.$refs.table.clearSelection()
      this.$message({
        type: 'success',
        message: '删除成功',
        customClass: 'tip-success',
        center: true
      })
    },
    //搜索过滤
    filterFile() {
      this.new_file_list = this.file_list_all.filter(data => !this.search || data.file_name.toLowerCase().includes(this.search.toLowerCase()))
      //父组件更新
      this.$emit('update:file_list', this.new_file_list)
    }




  }
}
</script>

<style lang="less" scoped>
//头部
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    font-size: 40px;
    margin: 10px 0;
  }
  div {
    font-size: 20px;
    .el-input {
      width: 300px;
    }
  }
}
//操作按钮
.btn {
  display: flex;
  justify-content: center;
  gap: 20px;
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
//底部
.option {
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
//选择按钮
/deep/ .el-checkbox__inner {
  width: 20px;
  height: 20px;
  &::after {
    left: 7px;
    height: 14px;
  }
}
</style>
