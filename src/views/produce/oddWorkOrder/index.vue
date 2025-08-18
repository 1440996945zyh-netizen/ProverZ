<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
      :rowStyle="rowStyle"
      :tableHeight="'pageTableHeight'"
      :cellClickEvent="cellClickEvent"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="checkboxChangeEvent"
      @checkbox-change="checkboxChange"
      :loading="false"
      :total="total"
		/>
	</div>
	<el-drawer v-model="detailVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div>
				<el-button @click="detailVisible = false">取消</el-button>
				<el-button type="primary" @click="save" v-if='editAuditLive'>保存</el-button>
        <el-button type="primary" @click="auditSave" v-if='approveAuditLive'>审核</el-button>
			</div>
		</template>
	</el-drawer>
  <!--  商务回执驳回弹窗  -->
  <el-dialog title="驳回" v-model="rejectDialogVisible" width="40%">
    <el-form :model="rejectFormData" ref="rejectFormRef" label-width="80px" :rules="rejectRules">

        <el-form-item
          label="驳回原因"
          prop="rejectReason"
        >
          <el-input type="textarea" v-model="rejectFormData.rejectReason"></el-input>
        </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">关 闭</el-button>
        <el-button @click="submitRejectForm" type="primary" >保 存</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog title="作废" v-model="abandonedDialogVisible" width="40%">
    <el-form :model="abandonedFormData" ref="abandonedFormRef" label-width="80px" :rules="abandonedRules">

        <el-form-item
          label="作废原因"
          prop="abandonedReason"
        >
          <el-input type="textarea" v-model="abandonedFormData.abandonedReason"></el-input>
        </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="abandonedDialogVisible = false">关 闭</el-button>
        <el-button @click="submitAbandonedForm" type="primary" >保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="oddWork">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/produce/oddWorkOrder/index.js'
import publicApi from '@/api/public/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const editAuditLive = ref(false) // 保存是否显示
const isDisabled = ref(false) // 保存是否显示
const approveAuditLive = ref(false) // 审核是否显示
const detailRef = ref(null) // 明细组件ref
const rejectDialogVisible = ref(false)
const abandonedDialogVisible = ref(false)
const route = useRoute()
const routeType = JSON.parse(route.meta.query).id
const buttonHidden = routeType == '3' || routeType == '4' ? ref(true) : ref(false) // 操作列是否显示
const rejectFormData = reactive({
  id:'',
  rejectReason:'',
})
const abandonedFormData = reactive({
  id:'',
  abandonedReason:'',
})
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const total = ref(0)
const rejectRules = ref({
  rejectReason: [{ required: true, message: '驳回原因不能为空' }],
})
const abandonedRules = ref({
  abandonedReason: [{ required: true, message: '作废原因不能为空' }],
})
const rejectFormRef = ref()
const abandonedFormRef = ref()
// header检索参数
const selectData = reactive([
	{
		name: '零工类型', //日期搜索
		type: 'select', //搜索框类型
		modelValue: 'oddType', //绑定字段
		span: 8, //占位多少，总共24
    selectData: [
      { label: '机械零工', value: '1' },
      { label: '人员零工', value: '2' },
    ],
	},
  {
    name: '起始时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'searchStartTime', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '截止时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'searchEndTime', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '作业部门',
    type: 'select',
    modelValue: 'deptNo',
    span: 3,
    dataConfig:{ url: '/api/v1/interface/tPrdOddInterface/getDepts'},
  },
  {
    name: '申请部门',
    type: 'select',
    prop: 'createFromDeptId', // 便于赋值
    modelValue: 'createFromDeptId',
    modelLabel: 'createFromDeptName',
    span: 3,
    disabled:isDisabled,
    dataConfig: {
      params: { type: 'DEPT_LEVEL', deptLevel: '2' },
      method: 'get',
    },
  },
  {
    name: '零工单号',
    type: 'input', // 搜索框类型
    modelValue: 'oddPlanNo', // 绑定字段
    span:3,
  },
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 3,
    dataConfig:{ url: '/api/internal/public/getDictListByType/ODD_STATUS' },
	},
  {
    name: '是否驳回', //日期搜索
    type: 'select', //搜索框类型
    modelValue: 'isReject', //绑定字段
    span: 3, //占位多少，总共24
    selectData: [
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ],
  },
  {
    name: '作业内容',
    type: 'input', // 搜索框类型
    modelValue: 'workContent', // 绑定字段
    span:3,
  },
])

// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)

  if(routeType == '1'){
    queryParams.value.pageType = 1
  }else if(routeType == '2'){
    queryParams.value.pageType = 2
  } else if(routeType == '3'){
    queryParams.value.pageType = 3
  } else if (routeType == '4'){
    queryParams.value.pageType = 4
  }
	api.getList(queryParams.value).then(res => {
    let tmpList = []
    tmpList = res.data.pages
    if(tmpList.length >= 1){
      tmpList.forEach(item=>{
        item.routeType = routeType
      })
    }
    tableData.value = tmpList
    total.value = res.data.totalNum
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '零工申请', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => add, // 回调函数
		permission: (routeType == '1') ?'produce:oddWorkOrder:add': "", // 权限
	},
  { // 二级审核
    label: '批量审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Money', // 按钮图标，支持element-Plus中所有图标
    click: () => auditList, // 回调函数
    permission: (routeType == '3') ? "produce:oddWorkOrder:auditList" : "", // 权限
  },
  { // 取消二级审核
    label: '批量销审', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => revokeReview, // 回调函数
    permission: (routeType == '3') ? "produce:oddWorkOrder:revokeReview"  : "",// 权限
  },
  { // 三级审核
    label: '批量审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Money', // 按钮图标，支持element-Plus中所有图标
    click: () => batchApprove, // 回调函数
    permission: (routeType == '4') ? "produce:oddWorkOrder:batchApprove" : "", // 权限
  },
  { // 取消三级审核
    label: '批量销审', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => cancelBatchApprove, // 回调函数
    permission: (routeType == '4') ? "produce:oddWorkOrder:cancelBatchApprove"  : "",// 权限
  }
])
const title = ref('')
// 新增事件
const add = () => {
	title.value = '新增'
	detailVisible.value = true
  editAuditLive.value = true
  approveAuditLive.value = false
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
    detailRef.value.editOrAudit = false //清空禁止按钮
    detailRef.value.isHidden = false //清空禁止按钮
    detailRef.value.formData.id = '' // 新增清空
    detailRef.value.formData.status = ''
    detailRef.value.init()
	})
}
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', type: 'checkbox', width: 40,fixed: 'left',},
  {
    label: '零工类型',
    prop: 'oddType',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.oddType == '1' ? 'primary' : 'success',
          },
          {
            default: () =>
              row.oddType == '1' ? '机械' : row.oddType == '2' ? '人员' :  row.oddType,
          }
        ),
      ]
    },
  },
  { prop: 'oddPlanNo', label: '零工单号', align: 'center',width: 120 },
	{ prop: 'workDeptName', label: '作业部门', align: 'center', width: 120 },
	{
		label: '状态',
		prop: 'status',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			let typeFlag = ''
			typeFlag =
				row.status == 10 ? 'info' : row.status == 20 ? 'info' : row.status == 30 ? 'success'
          : row.status == 40 ? 'success' :row.status == 50 ? 'primary' :row.status == 60 ? 'primary' : 'info'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => row.statusText,
					}
				),
			]
		},
	},
	{ prop: 'macTypeName', label: '机械类型', width: 120, align: 'center' },
	{ prop: 'macNo', label: '机械编号', align: 'center',width: 120 },
	{ prop: 'macAmount', label: '机械数量', align: 'right',width: 100 },
	{ prop: 'workerAmount', label: '人员数量', align: 'right',width: 100 },
	{ prop: 'workContent', label: '作业内容', align: 'center',width: 150 },
  { prop: 'reportTime', label: '作业时间', align: 'center',width: 230 },
  /*{ prop: 'reportEndTime', label: '作业结束时间', align: 'left',width: 150 },*/
  { prop: 'workDuration', label: '作业总时长', align: 'right',width: 100 },
  { prop: 'workHours', label: '总工时', align: 'right',width: 100 },
  { prop: 'remark', label: '备注', align: 'center',width: 150 },
  { prop: 'createByName', label: '申请人', align: 'center',width: 100 },
	{ prop: 'createTime', label: '申请时间', align: 'center',width: 150 },
	{ prop: 'createFromDeptName', label: '申请部门', align: 'center',width: 120 },
  { prop: 'updateByName', label: '填报人', align: 'center',width: 100 },
  { prop: 'updateTime', label: '填报时间', align: 'center',width: 150 },
  { prop: 'confirmByName', label: '确认人', align: 'center',width: 100 },
  { prop: 'confirmTime', label: '确认时间', align: 'center',width: 150 },
  { prop: 'firstApproveByName', label: '一级审核人', align: 'center',width: 100 },
  { prop: 'firstApproveTime', label: '一级审核时间', align: 'center',width: 150 },
  { prop: 'secondApproveByName', label: '二级审核人', align: 'center',width: 100 },
  { prop: 'secondApproveTime', label: '二级审核时间', align: 'center',width: 150 },
  { prop: 'thirdApproveByName', label: '三级审核人', align: 'center',width: 100 },
  { prop: 'thirdApproveTime', label: '三级审核时间', align: 'center',width: 150 },
  { prop: 'rejectByName', label: '驳回人', align: 'center',width: 100 },
  { prop: 'rejectTime', label: '驳回时间', align: 'center',width: 150 },
  { prop: 'rejectReason', label: '驳回原因', align: 'center',width: 150 },
  { prop: 'abandonedByName', label: '作废人', align: 'center',width: 100 },
  { prop: 'abandonedTime', label: '作废时间', align: 'center',width: 150 },
  { prop: 'abandonedReason', label: '作废原因', align: 'center',width: 150 },
	{
		label: '操作',
		width: 300,
		align: 'center',
		fixed: 'right',
    isHidden: false,
		render: row => {
			return [
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              view(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'produce:oddWorkOrder:view', // 权限
          },
          {
            default: () => '查看',
          }
        ),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: (row.routeType == '1' && (row.status == '10' || row.status == '20')) ?'produce:oddWorkOrder:update': " ", // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission:(row.routeType == '1' && (row.status == '10' || row.status == '20')) ? 'produce:oddWorkOrder:delete': " ", // 权限
					},
					{
						default: () => '删除',
					}
				),
		  h(
			  ElButton,
			  {
				  onClick: () => {
					  console.log(row)
					  audit(row)
				  },
				  type: 'primary',
				  link: true,
				  icon: 'View',
				  permission:(row.routeType == '1' || row.routeType == '2') && (row.status =='10' || row.status =='20' || (row.status =='30' && row.routeType =='2')) ? 'produce:oddWorkOrder:audit': " ", // 权限
			  },
			  {
				  default: () => (row.routeType == '1' ) ? '确认': "审核",
			  }
		  ),
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              revokeOneReview(row)
            },
            type: 'primary',
            link: true,
            icon: 'Refresh',
            permission:(row.routeType == '1' || row.routeType == '2') && ((row.status =='30' && row.routeType == '1') || (row.status =='40' && row.routeType == '2') ) ? 'produce:oddWorkOrder:revokeOneReview': " ", // 权限
          },
          {
            default: () => (row.routeType == '1' ) ? '取消确认': "销审",
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              reject(row)
            },
            type: 'primary',
            link: true,
            icon: 'Refresh',
            //permission:(row.routeType == '2' || row.routeType == '3' || row.routeType == '4') && (row.isReject !='1') && (row.status !='60' && row.status !='99') ? 'produce:oddWorkOrder:reject': " ", // 权限
            permission:((row.routeType == '2' && row.status == '30') || (row.routeType == '3' && row.status == '40') || (row.routeType == '4' && row.status == '50')) && (row.isReject !='1') && (row.status !='60' && row.status !='99') ? 'produce:oddWorkOrder:reject': " ", // 权限
          },
          {
            default: () => '驳回',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              abandoned(row)
            },
            type: 'primary',
            link: true,
            icon: 'Refresh',
            //permission:(row.routeType == '2' || row.routeType == '3' || row.routeType == '4') && (row.status !='60' && row.status !='99') ? 'produce:oddWorkOrder:abandoned': " ", // 权限
            permission:((row.routeType == '2' && row.status == '30') || (row.routeType == '3' && row.status == '40') || (row.routeType == '4' && row.status == '50')) && (row.status !='60' && row.status !='99') ? 'produce:oddWorkOrder:abandoned': " ", // 权限
          },
          {
            default: () => '作废',
          }
        ),
			]
		},
	},
])

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	detailVisible.value = true
  if (editRow.status == '99') {
    editAuditLive.value = false
  } else {
    editAuditLive.value = true
  }
  approveAuditLive.value = false
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
    detailRef.value.editOrAudit = false //清空禁止按钮
    detailRef.value.isHidden = false //清空禁止按钮
    api.getDetailById(editRow.id).then(res => {
      const oddWork = res.data
      if (oddWork.macNo != null && oddWork.macNo != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.macNo.split(',');
        oddWork.macNo = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.macNo = macNoArray;
      }
      if (oddWork.macId != null && oddWork.macId != '') {
        // 将字符串转换回数组
        const macIdArray = oddWork.macId.split(',');
        oddWork.macId = macIdArray
      }else {
        // 将空字符串转换为数组
        const macIdArray = [];
        oddWork.macId = macIdArray;
      }
      if (oddWork.oddUserIds != null && oddWork.oddUserIds != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.oddUserIds.split(',');
        oddWork.oddUserIds = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.oddUserIds = macNoArray;
      }
      proxy.setFormData(detailRef.value.formData, oddWork)
      detailRef.value.init()
      detailRef.value.inits()
      detailRef.value.queryParams.id = editRow.id
      detailRef.value.getLogList()
      if (editRow.macTypeCode == '0016') {
        detailRef.value.isHourMeterHidden = false
      } else {
        detailRef.value.isHourMeterHidden = true
      }
    })
  })
}
// 编辑事件
const view = row => {
  title.value = '查看'
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  detailVisible.value = true
  editAuditLive.value = false
  approveAuditLive.value = false
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.editOrAudit = true //清空禁止按钮
    detailRef.value.isHidden = true //清空禁止按钮
    api.getDetailById(editRow.id).then(res => {
      const oddWork = res.data
      if (oddWork.macNo != null && oddWork.macNo != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.macNo.split(',');
        oddWork.macNo = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.macNo = macNoArray;
      }
      if (oddWork.macId != null && oddWork.macId != '') {
        // 将字符串转换回数组
        const macIdArray = oddWork.macId.split(',');
        oddWork.macId = macIdArray
      }else {
        // 将空字符串转换为数组
        const macIdArray = [];
        oddWork.macId = macIdArray;
      }
      if (oddWork.oddUserIds != null && oddWork.oddUserIds != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.oddUserIds.split(',');
        oddWork.oddUserIds = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.oddUserIds = macNoArray;
      }
      proxy.setFormData(detailRef.value.formData, oddWork)
      detailRef.value.init()
      detailRef.value.inits()
      detailRef.value.queryParams.id = editRow.id
      detailRef.value.getLogList()
      if (editRow.macTypeCode == '0016') {
        detailRef.value.isHourMeterHidden = false
      } else {
        detailRef.value.isHourMeterHidden = true
      }
    })
  })
}
const audit = row => {
	title.value = '审核'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	detailVisible.value = true
  editAuditLive.value = false
  approveAuditLive.value = true
	nextTick(() => {
    if(routeType == '1'){
      detailRef.value.editOrAudit = true //审核禁止输入
      detailRef.value.isHidden = true //清空禁止按钮
    }else{
      detailRef.value.editOrAudit = false //取消审核禁止输入
      detailRef.value.isHidden = false //清空禁止按钮
    }
		detailRef.value.resetForm() // 清空事件
    api.getDetailById(editRow.id).then(res => {
      const oddWork = res.data
      if (oddWork.macNo != null && oddWork.macNo != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.macNo.split(',');
        oddWork.macNo = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.macNo = macNoArray;
      }
      if (oddWork.macId != null && oddWork.macId != '') {
        // 将字符串转换回数组
        const macIdArray = oddWork.macId.split(',');
        oddWork.macId = macIdArray
      }else {
        // 将空字符串转换为数组
        const macIdArray = [];
        oddWork.macId = macIdArray;
      }
      if (oddWork.oddUserIds != null && oddWork.oddUserIds != '') {
        // 将字符串转换回数组
        const macNoArray = oddWork.oddUserIds.split(',');
        oddWork.oddUserIds = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        oddWork.oddUserIds = macNoArray;
      }
      proxy.setFormData(detailRef.value.formData, oddWork)
      detailRef.value.init()
      detailRef.value.inits()
      detailRef.value.queryParams.id = editRow.id
      detailRef.value.getLogList()
      if (editRow.macTypeCode == '0016') {
        detailRef.value.isHourMeterHidden = false
      } else {
        detailRef.value.isHourMeterHidden = true
      }
    })
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 批量审核事件
const auditList = row => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  proxy.$modal.confirm('确定审核？').then(() => {
    let tmpList = []
    tmpList = checkboxList.value.map(item=>{
      return item.id
    })
    api.auditThree(tmpList).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      detailVisible.value = false
      getList(queryParams.value)
    })
  })
}

// 三级批量审核事件
const batchApprove = row => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  proxy.$modal.confirm('确定审核？').then(() => {
    let tmpList = []
    tmpList = checkboxList.value.map(item=>{
      return item.id
    })
    api.batchApprove(tmpList).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      detailVisible.value = false
      getList(queryParams.value)
    })
  })
}
// 取消三级审核
const cancelBatchApprove = () => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  proxy.$modal.confirm('是否确定撤销审核？').then(() => {
    let tmpList = []
    tmpList = checkboxList.value.map(item=>{
      return item.id
    })
    api.cancelBatchApprove(tmpList).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('撤销成功')
    })
  })
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
    if(params.oddType == '1' && params.macAmount <= 0){
      proxy.$message.warning('机械数量不能小于等于0')
      return;
    }
    if(params.oddType == '2' && params.workerAmount <= 0){
      proxy.$message.warning('人员数量不能小于等于0')
      return;
    }
    if (params.macNo != null && params.macNo.length > 0) {
      const macNoStr =  params.macNo.join(',');
      params.macNo = macNoStr;
    }else {
      params.macNo = ''; // 将null转换为空字符串
    }
    if (params.macId != null && params.macId.length > 0) {
      const macIdStr =  params.macId.join(',');
      params.macId = macIdStr;
    }else {
      params.macId = ''; // 将null转换为空字符串
    }
    if (params.oddUserIds != null && params.oddUserIds.length > 0) {
      const oddUserIdsStr =  params.oddUserIds.join(',');
      params.oddUserIds = oddUserIdsStr;
    }else {
      params.oddUserIds = ''; // 将null转换为空字符串
    }
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id == '' || params.id == null) {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
const auditSave = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		console.log('保存', params)
    if (params.macNo != null && params.macNo.length > 0) {
      const macNoStr =  params.macNo.join(',');
      params.macNo = macNoStr;
    }else {
      params.macNo = ''; // 将null转换为空字符串
    }
    if (params.macId != null && params.macId.length > 0) {
      const macIdStr =  params.macId.join(',');
      params.macId = macIdStr;
    }else {
      params.macId = ''; // 将null转换为空字符串
    }
    if (params.oddUserIds != null && params.oddUserIds.length > 0) {
      const oddUserIdsStr =  params.oddUserIds.join(',');
      params.oddUserIds = oddUserIdsStr;
    }else {
      params.oddUserIds = ''; // 将null转换为空字符串
    }
    if(routeType == '1') {
      proxy.$modal.confirm('确定审核？').then(() => {
        api.auditOne(params).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          detailVisible.value = false
          getList(queryParams.value)
        })
      })
    }else if(routeType == '2'){
      proxy.$modal.confirm('确定审核？').then(() => {
        api.auditTwo(params).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          detailVisible.value = false
          getList(queryParams.value)
        })
      })
    }
	}
}
const revokeOneReview = row => {
  const editRow = row || clickRow.value
    if(routeType == '1') {
      proxy.$modal.confirm('确定销审？').then(() => {
        api.revokeOne(editRow.id).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          detailVisible.value = false
          getList(queryParams.value)
        })
      })
    }else if(routeType == '2'){
      proxy.$modal.confirm('确定销审？').then(() => {
        api.revokeTwo(editRow.id).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          detailVisible.value = false
          getList(queryParams.value)
        })
      })
    }
}
const revokeReview = () => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  proxy.$modal.confirm('是否确定撤销审核？').then(() => {
    let tmpList = []
    tmpList = checkboxList.value.map(item=>{
      return item.id
    })
    api.cancelReview(tmpList).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('撤销成功')
    })
  })
}
const clickRow = ref({})
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const checkboxList = ref([])
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
}
const checkboxChange = data => {
  checkboxList.value = data
}
// 驳回
const reject = row => {
  const rejectRow = row || clickRow.value
  rejectDialogVisible.value = true

  //清除回执驳回表单的数据
  rejectFormData.id = rejectRow.id
  rejectFormData.rejectReason=''
}
//驳回保存事件
const submitRejectForm = ()=>{
  if(rejectFormData.id == null || rejectFormData.id == ''){
    proxy.$message.error('未找到要驳回的零工申请')
    return
  }
  if (rejectFormData.rejectReason == null || rejectFormData.rejectReason == '') {
    proxy.$message.error('驳回原因不能为空')
    return
  }
  proxy.$modal.confirm('是否确定驳回？').then(() => {
    api.reject(rejectFormData).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('驳回成功')
    })
    rejectDialogVisible.value = false;
  })
}
//作废保存事件
const submitAbandonedForm = ()=>{
  if(abandonedFormData.id == null || abandonedFormData.id == ''){
    proxy.$message.error('未找到要作废的零工申请')
    return
  }
  if (abandonedFormData.abandonedReason == null || abandonedFormData.abandonedReason == '') {
    proxy.$message.error('作废原因不能为空')
    return
  }
  proxy.$modal.confirm('是否确定作废？').then(() => {
    api.abandoned(abandonedFormData).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('作废成功')
    })
    abandonedDialogVisible.value = false;
  })
}
// 作废
const abandoned = row => {
  const abandonedRow = row || clickRow.value
  abandonedDialogVisible.value = true

  //清除作废表单的数据
  abandonedFormData.id = abandonedRow.id
  abandonedFormData.abandonedReason=''
}
const rowStyle = i => {
  if (i.row.isReject && i.row.isReject == '1') {
    return 'color:red'
  }
  return null
}

/** 初始化数据 */
//初始化函数
const init = async () => {
  await nextTick(() => {
    if(routeType == '2'){
      proxy.$bus.emit('setInitSearchData', { status: '30' })
      queryParams.value.status = '30'
    }else if(routeType == '3'){
      proxy.$bus.emit('setInitSearchData', { status: '40' })
      queryParams.value.status = '40'
    }else if(routeType == '4'){
      proxy.$bus.emit('setInitSearchData', { status: '50' })
      queryParams.value.status = '50'
    }
  })
  // 获取登录用户信息
  await publicApi.getLoginDeptMess().then(async res => {
    console.log(res)
    if (routeType == '2' || routeType == '3' || routeType == '4') {
      if (res.data.level == '4'||res.data.level == '2') {
        isDisabled.value = true
        nextTick(() => {
          proxy.$bus.emit('setInitSearchData',
            {
              createFromDeptId:res.data.companyDeptId,
              createFromDeptName:res.data.classDeptName
            }
          )
          queryParams.value.createFromDeptId = res.data.companyDeptId;
          queryParams.value.createFromDeptName = res.data.classDeptName;
        })
      }
    }
  })
  getList(queryParams.value)
}
init()
</script>
