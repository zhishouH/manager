<template>
  <div class="dept-mange">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item>
          <el-input placeholder="请输入部门名称" v-model="queryForm.deptName" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleOpen">创建</el-button>
      </div>
      <el-table size="large" :data="deptList" row-key="_id" :tree-props="{children:'children'}">
        <el-table-column v-for="item in columns" :key="item.prop" v-bind="item"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="action=='create'?'创建部门':'编辑部门'" v-model="showModel" width="30%">
      <el-form ref="dialogForm" :model="deptForm" :rules="rules" label-width="100px">
        <el-form-item label="上级部门" prop="parentId">
          <el-cascader placeholder="请选择上级部门" v-model="deptForm.parentId" :props="{ checkStrictly:true, value:'_id', label:'deptName' }" clearable :options="deptList" :show-all-levels="true"> </el-cascader>
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input placeholder="请输入部门名称" v-model="deptForm.deptName"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="user">
          <el-select placeholder="请选择部门负责人" v-model="deptForm.user" @change="handleUser">
            <el-option v-for="item in userList" :key="item.userId" :label="item.userName" :value="`${item.userId}/${item.userName}/${item.userEmail}`"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人邮箱" prop="userEmail">
          <el-input placeholder="请输入负责人邮箱" v-model="deptForm.userEmail" disabled></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button @click="handleSumbit" type="primary">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import utils from './../utils/utils'
export default {
  name: 'Dept',
  data() {
    return {
      queryForm: {
        deptName: ''
      },
      deptList: [],
      columns: [
        { label: '部门名称', prop: 'deptName' },
        { label: '负责人', prop: 'userName' },
        {
          label: '更新时间',
          prop: 'updateTime',
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value))
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value))
          }
        }
      ],
      pager: { pageNum: 1, pageSize: 10 },
      action: 'create',
      showModel: false,
      deptForm: { parentId: [null] },
      userList: [],
      rules: {
        parentId: [{ required: true, message: '请选择上级部门', trigger: 'blur' }],
        deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
        user: [{ required: true, message: '请选择负责人', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.getDeptList()
    this.getUserAllList()
  },
  methods: {
    async getDeptList() {
      let list = await this.$api.deptList(this.queryForm)
      this.deptList = list
    },

    async getUserAllList() {
      this.userList = await this.$api.userAllList()
    },

    handleUser(val) {
      const [userId, userName, userEmail] = val.split('/')
      Object.assign(this.deptForm, { userId, userName, userEmail })
    },

    // 查询
    handleQuery() {
      this.getDeptList()
    },

    // 重置
    handleReset(form) {
      this.$refs[form].resetFields()
    },

    // 创建
    handleOpen() {
      this.action = 'create'
      this.showModel = true
    },

    // 编辑
    handleEdit(row) {
      this.action = 'edit'
      this.showModel = true
      this.$nextTick(() => {
        Object.assign(this.deptForm, row, { user: `${row.userId}/${row.userName}/${row.userEmail}` })
      })
    },

    // 删除
    async handleDel(_id) {
      this.action = 'delete'
      await this.$api.deptOperate({ _id, action: this.action })
      this.$message.success('删除成功')
      this.getDeptList()
    },

    // 取消
    handleClose() {
      this.showModel = false
      this.handleReset('dialogForm')
    },

    // 确定
    handleSumbit() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = { ...this.deptForm, action: this.action }
          delete params.user
          await this.$api.deptOperate(params)
          this.$message.success(this.action == 'create' ? '创建成功' : '编辑成功')
          this.handleClose()
          this.getDeptList()
        }
      })
    }
  }
}
</script>

<style>
</style>