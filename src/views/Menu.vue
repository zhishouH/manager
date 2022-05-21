<template>
  <div class="menu-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-select v-model="queryForm.menuState">
            <el-option :value="1" label="正常"></el-option>
            <el-option :value="2" label="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd(1)">新增</el-button>
      </div>
      <el-table size="large" :data="menuList" row-key="_id" :tree-props="{children:'children'}">
        <el-table-column v-for="item in colums" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button @click="handleAdd(2,scope.row)" size="small" type="primary">新增</el-button>
            <el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
            <el-button @click="handleDel(scope.row._id)" size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="dialogTitle" v-model="showModel" width="30%">
      <el-form ref="dialogForm" :model="menuForm" label-width="70px" :rules="rules">
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader placeholder="请选择菜单" v-model="menuForm.parentId" :options="menuList" :props="{ checkStrictly: true ,value: '_id', label: 'menuName'   }" clearable />
          <span style="color:red">&nbsp;&nbsp;&nbsp;&nbsp;未选，则默认创建一级菜单</span>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-show="menuForm.menuType===1">
          <el-input v-model="menuForm.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path" v-show="menuForm.menuType===1">
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="权限标识" prop="menuCode" v-show="menuForm.menuType===2">
          <el-input v-model="menuForm.menuCode" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-show="menuForm.menuType===1">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState" v-show="menuForm.menuType===1">
          <el-radio-group v-model="menuForm.menuState">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import utils from './../utils/utils'
export default {
  name: 'Menu',
  data() {
    return {
      queryForm: { menuState: 1 },
      menuList: [],
      colums: [
        { label: '菜单名称', prop: 'menuName', width: 140 },
        { label: '图标', prop: 'icon' },
        {
          label: '菜单类型',
          prop: 'menuType',
          formatter(row, column, value) {
            return {
              1: '菜单',
              2: '按钮'
            }[value]
          }
        },
        { label: '权限标识', prop: 'menuCode' },
        { label: '路由地址', prop: 'path', width: 140 },
        { label: '组件路径', prop: 'component', width: 140 },
        {
          label: '菜单状态',
          prop: 'menuState',
          width: 90,
          formatter(row, column, value) {
            return {
              1: '正常',
              2: '停用'
            }[value]
          }
        },
        {
          label: '创建时间',
          prop: 'createTime',
          width: 180,
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value))
          }
        }
      ],
      showModel: false,
      menuForm: { parentId: [null], menuType: 1, menuState: 1 },
      action: '',
      rules: {
        menuName: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度仔2-8个字符', trigger: 'blur' }
        ]
      },
      dialogTitle: ''
    }
  },
  mounted() {
    this.getMenuList()
  },
  methods: {
    // 菜单列表初始化
    async getMenuList() {
      try {
        let list = await this.$api.menuList(this.queryForm)
        this.menuList = list
      } catch (error) {
        throw new Error(error)
      }
    },

    // 表单查询
    handleQuery() {
      this.getMenuList()
    },

    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields()
    },

    // 新增菜单
    handleAdd(type, row) {
      this.showModel = true
      this.action = 'add'
      this.dialogTitle = '新增菜单'
      if (type === 2) {
        this.menuForm.parentId = [...row.parentId, row._id].filter((item) => item)
      }
    },

    // 编辑菜单
    handleEdit(row) {
      this.showModel = true
      this.action = 'edit'
      this.dialogTitle = '编辑菜单'
      this.$nextTick(() => {
        Object.assign(this.menuForm, row)
      })
    },

    // 删除菜单
    async handleDel(_id) {
      await this.$api.menuSubmit({ _id, action: 'delete' })
      this.$message.success('删除成功')
      this.getMenuList()
    },

    // 取消
    handleClose() {
      this.showModel = false
      this.handleReset('dialogForm')
    },

    // 提交
    handleSubmit() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let { action, menuForm } = this
          let params = { ...menuForm, action }
          let res = await this.$api.menuSubmit(params)
          this.showModel = false
          this.$message.success(action == 'add' ? '新增成功' : '编辑成功')
          this.handleReset('dialogForm')
          this.getMenuList()
        }
      })
    }
  }
}
</script>