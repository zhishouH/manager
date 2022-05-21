<template>
  <div class="leave-manage">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryForm">
        <el-form-item label="审批状态" prop="applyState">
          <el-select v-model="queryForm.applyState" placeholder="请选择状态">
            <el-option value="" label="全部"></el-option>
            <el-option :value="1" label="待审批"></el-option>
            <el-option :value="2" label="审批中"></el-option>
            <el-option :value="3" label="审批拒绝"></el-option>
            <el-option :value="4" label="审批通过"></el-option>
            <el-option :value="5" label="作废"></el-option>
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
        <el-button type="primary" @click="handleApply">申请休假 </el-button>
      </div>
      <el-table size="large" :data="applyList" stripe>
        <el-table-column v-for="item in colums" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleDetail(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row._id)" v-if="[1,2].includes(scope.row.applyState)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total" :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="申请休假" v-model="showModel" width="35%">
      <el-form ref="dialogForm" :model="leaveForm" label="120px" :rules="rules">
        <el-form-item label="休假类型" prop="applyType" required>
          <el-select v-model="leaveForm.applyType">
            <el-option label="事假" :value="1"></el-option>
            <el-option label="调休" :value="2"></el-option>
            <el-option label="年假" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="休假时间" required>
          <el-row>
            <el-col :span="8">
              <el-form-item prop="startTime" required>
                <el-date-picker v-model="leaveForm.startTime" type="date" placeholder="选择开始日期" @change="(val)=>handleDateChange('startTime',val)"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="1">——</el-col>
            <el-col :span="8">
              <el-form-item prop="endTime" required>
                <el-date-picker v-model="leaveForm.endTime" type="date" placeholder="选择结束日期" @change="(val)=>handleDateChange('endTime',val)"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" required> {{leaveForm.leaveTime}} </el-form-item>
        <el-form-item label="休假原因" prop="reasons" required>
          <el-input type="textarea" :row="3" placeholder="请输入休假原因" v-model="leaveForm.reasons"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="申请休假详情" width="35%" v-model="showDetailModel" destroy-on-close>
      <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
        <el-step title="待审批"></el-step>
        <el-step title="审批中"></el-step>
        <el-step title="审批通过/审批拒绝"></el-step>
      </el-steps>
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="休假类型">
          <div>{{detail.applyTypeName}}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{detail.time}}</div>
        </el-form-item>
        <el-form-item label="休假时长">
          <div>{{detail.leaveTime}}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{detail.reasons}}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{detail.applyStateName}}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{detail.curAuditUserName }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import api from './../api/index'
import { ElMessage } from 'element-plus'
import utils from './../utils/utils'
export default {
  name: 'Leave',
  setup() {
    // 获取composition API 上下文对象
    const { ctx, appContext } = getCurrentInstance()

    const queryForm = reactive({ applyState: 1 })

    const pager = reactive({ pageNum: 1, pageSize: 10, total: 0 })
    // 定义动态表格-格式
    const colums = reactive([
      { label: '单号', prop: 'orderNo' },
      {
        label: '休假时间',
        prop: '',
        formatter(row) {
          return (
            utils.formateDate(new Date(row.startTime), 'yyyy-MM-dd') +
            '到' +
            utils.formateDate(new Date(row.endTime), 'yyyy-MM-dd')
          )
        }
      },
      { label: '休假时长', prop: 'leaveTime' },
      {
        label: '休假类型',
        prop: 'applyType',
        formatter(row, column, value) {
          return {
            1: '事假',
            2: '调休',
            3: '年假'
          }[value]
        }
      },
      { label: '休假原因', prop: 'reasons' },
      {
        label: '申请时间',
        prop: 'createTime',
        width: 220,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value))
        }
      },
      { label: '审批人', prop: 'auditUsers' },
      { label: '当前审批人', prop: 'curAuditUserName' },
      {
        label: '审批状态',
        prop: 'applyState',
        formatter: (row, column, value) => {
          return {
            1: '待审批',
            2: '审批中',
            3: '审批拒绝',
            4: '审批通过',
            5: '作废 '
          }[value]
        }
      }
    ])

    // 申请列表
    const applyList = ref([])

    // 休假弹框表单
    const leaveForm = reactive({
      applyType: 1,
      startTime: '',
      endTime: '',
      leaveTime: '0天',
      reasons: ''
    })

    //
    const showModel = ref(false)
    const showDetailModel = ref(false)
    let detail = ref({})
    // 操作行为
    const action = ref('create')

    // 表单规则
    const rules = reactive({
      startTime: [{ type: 'date', required: true, message: '请输入开始日期', trigger: 'change' }],
      endTime: [{ type: 'date', required: true, message: '请输入结束日期', trigger: 'change' }],
      reasons: [{ required: true, message: '请输入休假原因', trigger: ['change', 'blur'] }]
    })

    // 初始化接口调用
    onMounted(() => {
      getApplyList()
    })

    // 加载申请列表
    const getApplyList = async () => {
      const params = { ...queryForm, ...pager }
      let { list, page } = await api.applyList(params)
      applyList.value = list
      pager.total = page.total
    }

    // 查询事件，获取用户列表
    const handleQuery = () => {
      getApplyList()
    }

    // 重置查询表单
    const handleReset = (from) => {
      ctx.$refs[from].resetFields()
    }

    // 分页事件处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current
      getUserList()
    }

    // 点击申请休假展示弹框
    const handleApply = () => {
      showModel.value = true
      action.value = 'create'
    }

    // 取消表单
    const handleClose = () => {
      showModel.value = false
      handleReset('dialogForm')
    }

    // 确定表单
    const handleSubmit = () => {
      ctx.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          try {
            let params = { ...leaveForm, action: action.value }
            let res = await api.leaveOperate(params)
            ElMessage({ message: '创建成功', center: true, type: 'success' }, appContext)
            handleClose()
            getApplyList()
          } catch (error) {}
        }
      })
    }

    // 获取休假时长
    const handleDateChange = (key, val) => {
      let { startTime, endTime } = leaveForm
      if (!startTime || !endTime) return
      if (startTime > endTime) {
        ElMessage({ message: '开始日期不能晚于结束日期', center: true, type: 'error' }, appContext)
        leaveForm.leaveTime = '0天'
        setTimeout(() => {
          leaveForm[key] = ''
        }, 0)
      } else {
        leaveForm.leaveTime = (endTime - startTime) / (24 * 60 * 60 * 1000) + 1 + '天'
      }
    }

    // 查看
    const handleDetail = (row) => {
      let data = { ...row }
      data.applyTypeName = {
        1: '事假',
        2: '调休',
        3: '年假'
      }[data.applyType]
      data.time =
        utils.formateDate(new Date(data.startTime), 'yyyy-MM-dd') +
        '到' +
        utils.formateDate(new Date(data.endTime), 'yyyy-MM-dd')
      data.applyStateName = {
        1: '待审批',
        2: '审批中',
        3: '审批拒绝',
        4: '审批通过',
        5: '作废'
      }[data.applyState]
      detail.value = data
      showDetailModel.value = true
    }

    // 作废
    const handleDelete = async (_id) => {
      try {
        let params = { _id, action: 'delete' }
        let res = await api.leaveOperate(params)
        ElMessage({ message: '删除成功', center: true, type: 'success' }, appContext)
        getApplyList()
      } catch (error) {}
    }

    return {
      queryForm,
      pager,
      colums,
      applyList,
      leaveForm,
      showModel,
      showDetailModel,
      action,
      rules,
      detail,
      getApplyList,
      handleQuery,
      handleReset,
      handleCurrentChange,
      handleApply,
      handleClose,
      handleSubmit,
      handleDateChange,
      handleDetail,
      handleDelete
    }
  }
}
</script>
