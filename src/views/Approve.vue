<template>
  <div class="approve-manage">
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
      </div>
      <el-table size="large" :data="applyList" stripe>
        <el-table-column v-for="item in colums" :key="item.prop" :prop="item.prop" :label="item.label" :width="item.width" :formatter="item.formatter" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleDetail(scope.row)" v-if="scope.row.curAuditUserName == userInfo.userName && [1,2].includes(scope.row.applyState)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination" background layout="prev, pager, next" :total="pager.total" :page-size="pager.pageSize" @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="审核" width="35%" v-model="showDetailModel" destroy-on-close>
      <el-form ref="dialogForm" :model="auditForm" label-width="120px" label-suffix=":" :rules="rules">
        <el-form-item label="申请人">
          <div>{{detail.applyUser.userName}}</div>
        </el-form-item>
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
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" placeholder="请输入审核备注" v-model="auditForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleApprove('pass')">审核通过</el-button>
          <el-button @click="handleApprove('refuse')" type="primary">驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import api from './../api/index'
import { ElMessage } from 'element-plus'
import utils from './../utils/utils'
import { useStore } from 'vuex'
export default {
  name: 'Approve',
  setup() {
    // 获取composition API 上下文对象
    const { ctx, appContext } = getCurrentInstance()

    const $store = useStore()

    const queryForm = reactive({ applyState: 1 })

    const pager = reactive({ pageNum: 1, pageSize: 10, total: 0 })
    // 定义动态表格-格式
    const colums = reactive([
      { label: '单号', prop: 'orderNo' },
      {
        label: '申请人',
        prop: '',
        formatter(row) {
          return row.applyUser.userName
        }
      },
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

    const showDetailModel = ref(false)

    // 详情弹框对象
    let detail = ref({})

    const userInfo = $store.state.userInfo

    // 表单规则
    const rules = reactive({
      remark: [{ required: true, message: '请输入审核备注', trigger: 'change' }]
    })

    // 申请表单
    const auditForm = reactive({
      remark: ''
    })

    // 初始化接口调用
    onMounted(() => {
      getApplyList()
    })

    // 加载申请列表
    const getApplyList = async () => {
      let params = { ...queryForm, ...pager, type: 'approve' }
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

    // 取消表单
    const handleClose = () => {
      showDetailModel.value = false
      handleReset('dialogForm')
    }

    // 审核
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

    const handleApprove = (action) => {
      ctx.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = { action, remark: auditForm.remark, _id: detail.value._id }
          try {
            await api.leaveApprove(params)
            handleClose()
            ElMessage({ message: '处理成功', center: true, type: 'success' }, appContext)
            getApplyList()
            $store.commit('saveNoticeCount', $store.state.noticeCount - 1)
          } catch (error) {}
        }
      })
    }

    return {
      queryForm,
      pager,
      colums,
      applyList,
      leaveForm,
      showDetailModel,
      rules,
      detail,
      userInfo,
      auditForm,
      getApplyList,
      handleQuery,
      handleReset,
      handleCurrentChange,
      handleClose,
      handleDetail,
      handleApprove
    }
  }
}
</script>
