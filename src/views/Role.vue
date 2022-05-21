<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">创建</el-button>
      </div>
      <el-table size="large" stripe :data="roleList">
        <el-table-column v-for="item in colums" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
            <el-button @click="handleOpenPermission(scope.row)" size="small" type="primary">设置权限</el-button>
            <el-button @click="handleDel(scope.row._id)" size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev,pager,next" :total="pager.total" :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog :title="dialogTile" v-model="showModel" width="30%">
      <el-form ref="dialogForm" :model="roleForm" label-width="70px" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="2" v-model="roleForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 权限表单 -->
    <el-dialog title="权限设置" v-model="showPermission" width="30%">
      <el-form label-width="70px">
        <el-form-item label="角色名称"> {{curRoleName}} </el-form-item>
        <el-form-item label="选择权限">
          <el-tree ref="tree" :data="menuList" show-checkbox node-key="_id" default-expand-all :props="{label:'menuName'}"></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission=false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import utils from './../utils/utils'
export default {
  name: 'Role',
  data() {
    return {
      queryForm: { roleName: '' },
      colums: [
        { label: '角色名称', prop: 'roleName' },
        { label: '备注', prop: 'remark' },
        {
          label: '权限列表',
          prop: 'permissionList',
          width: 250,
          formatter: (row, column, value) => {
            let names = []
            let list = value.halfCheckedKeys || []
            list.map((key) => {
              let name = this.actionMap[key]
              if (key && name) names.push(name)
            })
            return names.join(',')
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          width: 180,
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value))
          }
        },
        {
          label: '更新时间',
          prop: 'updateTime',
          width: 180,
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value))
          }
        }
      ],
      roleList: [],
      pager: { total: 0, pageNum: 1, pageSize: 10 },
      roleForm: {},
      rules: { roleName: [{ required: true, message: '请输入角色名称' }] },
      showModel: false,
      action: 'create',
      dialogTile: '',
      showPermission: false,
      curRoleId: '',
      curRoleName: '',
      menuList: [],
      // 菜单映射表
      actionMap: {}
    }
  },
  mounted() {
    this.getRoleList()
    this.getMenuList()
  },
  methods: {
    // 角色列表初始化
    async getRoleList() {
      try {
        let { list, page } = await this.$api.roleList({ ...this.queryForm, ...this.pager })
        this.roleList = list
        this.pager.total = page.total
      } catch (error) {
        throw new Error(error)
      }
    },

    // 菜单列表初始化
    async getMenuList() {
      try {
        let list = await this.$api.menuList()
        this.menuList = list
        this.getActionMap(list)
      } catch (error) {
        throw new Error(error)
      }
    },

    // 查询
    handleQuery() {
      this.getRoleList()
    },
    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields()
    },

    // 创建
    handleAdd() {
      this.action = 'create'
      this.dialogTile = '创建角色'
      this.showModel = true
    },

    // 编辑
    handleEdit(row) {
      this.action = 'edit'
      this.dialogTile = '编辑角色'
      this.showModel = true
      this.$nextTick(() => {
        this.roleForm = { _id: row._id, roleName: row.roleName, remark: row.remark }
      })
    },

    // 删除
    async handleDel(_id) {
      await this.$api.roleOperate({ _id, action: 'delete' })
      this.$message.success('删除成功')
      this.getRoleList()
    },

    // 取消
    handleClose() {
      this.handleReset('dialogForm')
      this.showModel = false
    },

    // 提交
    handleSubmit() {
      this.$refs.dialogForm.validate(async (vaild) => {
        if (vaild) {
          let { roleForm, action } = this
          let params = { ...roleForm, action }
          let res = await this.$api.roleOperate(params)
          if (res) {
            this.showModel = false
            this.$message.success(action == 'create' ? '创建成功' : '编辑成功')
            this.handleReset('dialogForm')
            this.getRoleList()
          }
        }
      })
    },

    // 分页
    handleCurrentChange(current) {
      this.pager.pageNum = current
      this.getRoleList()
    },

    handlePermissionClose() {
      this.showPermission = false
    },

    // 权限设置
    handleOpenPermission(row) {
      this.curRoleId = row._id
      this.curRoleName = row.roleName
      this.showPermission = true
      let { checkedKeys } = row.permissionList
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys(checkedKeys)
      })
    },

    async handlePermissionSubmit() {
      let nodes = this.$refs.tree.getCheckedNodes()
      let halfKeys = this.$refs.tree.getHalfCheckedKeys()
      let checkedKeys = []
      let parentKeys = []
      nodes.map((node) => {
        if (!node.children) {
          checkedKeys.push(node._id)
        } else {
          parentKeys.push(node._id)
        }
      })
      let params = {
        _id: this.curRoleId,
        permissionList: { checkedKeys, halfCheckedKeys: parentKeys.concat(halfKeys) }
      }
      await this.$api.updatePermission(params)
      this.showPermission = false
      this.$message.success('设置成功')
      this.getRoleList()
    },

    getActionMap(list) {
      let actionMap = {}
      const deep = (arr) => {
        while (arr.length) {
          let item = arr.pop()
          if (item.children && item.action) {
            actionMap[item._id] = item.menuName
          }
          if (item.children && !item.action) {
            deep(item.children)
          }
        }
      }
      deep(JSON.parse(JSON.stringify(list)))
      this.actionMap = actionMap
    }
  }
}
</script>