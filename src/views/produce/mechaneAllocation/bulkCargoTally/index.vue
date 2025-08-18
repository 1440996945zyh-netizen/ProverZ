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
			:cellClickEvent="cellClickEvent"
		/>
	</div>
  <el-dialog v-model="dialogFormVisible" title="理货" width="380">
    <el-form ref="ruleForm" :model="form" :rules="rules">
      <el-form-item label="料斗直装" label-width="100px">
        <el-select v-model="form.directFetching" placeholder="是否料斗直装">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label='选择场地' label-width="100px" prop="massId">
        <div>
          <RemoteSelect
            type='ALL_STORAGE_MASS'
            v-model:value="form.massId"
            v-model:label="form.label"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="bulkCargoTally">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/bulkCargoTally/index.js'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag, RowAlign } from 'element-plus'
const { proxy } = getCurrentInstance()
import RemoteSelect from '@/components/RemoteSelect'
import awaitingDragStarted from "../../../../../docs/.vitepress/cache/deps/sortablejs";
const ruleForm = ref()
const dialogFormVisible = ref(false)
const formLabelWidth = '100px'
const form = reactive({
  massId: '',
  label: '',
  directFetching: "0",
})
const macWorkPC = async () => {
  console.log(clickRow.value)
  proxy.$modal.confirm('车辆' + clickRow.value.workMacName + '确定理货？').then(() => {
    api.macWorkPC(clickRow.value).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('理货完成！')
        getList(queryParams.value)
      }
    })
  })
}
//打开弹窗
const openDialogForm=()=>{
  if(!clickRow.value){
    proxy.$message.warning('请选择车辆！')
    return ;
  }
  form.directFetching = "0"
  form.massId = ""
  form.label = ""
  dialogFormVisible.value = true;
}
// 校验规则
const rules = ref({
  massId: proxy.getRules({ required: true }),
})
const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      flag = true
    } else {
      flag = false
      proxy.$modal.msgWarning('请选择场地信息！')
    }
  })
  return flag
}
const confirm = async () =>{
  let flag = await validate();
  if(flag===true){
    dialogFormVisible.value = false
    clickRow.value["massId"] = form.massId
    clickRow.value["directFetching"] = form.directFetching
    macWorkPC();
  }
}

const total = ref(0)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref(null) //点击当前行

const queryParams = ref({
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '车辆', prop: 'workMacName', align: 'center' },
	{
		label: '状态',
		prop: 'workTimeStatus',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTimeStatus == 20 ? 'success' : 'danger',
					},
					{
						default: () => row.workTimeStatus == 20 ? '作业中' : '未作业',
					}
				),
			]
		},
	},
	{ label: '船名', prop: 'shipName', align: 'center'},
	{ label: 'SCN', prop: 'scn', align: 'center'},
	{ label: '货名', prop: 'cargoName', align: 'center'},
	{ label: '作业垛位', prop: 'massNamesSource', align: 'center'},
	{ label: '进港时间', prop: 'weighInDt', align: 'center'},
	{ label: '货主', prop: 'cargoOwnerName', align: 'center'},
	{ label: '磅单编号', prop: 'poundRemark', align: 'center'},
])
const selectData = reactive([
  {
    name: '车牌号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'carNo', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '作业区域',
    type: 'select', //下拉框字典
    modelValue: 'workAreaCd', //对应字段
    span: 12,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      url: '/api/internal/public/getDictListByType/WORK_AREA',
      method: 'get',
    },
  },
])
const buttonList = reactive([
	{
		label: '理货', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
		click: () => openDialogForm, // 回调函数
		permission: 'machine:tMacTerminal:query', // 权限
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 点击查询的事件
const getList = e => {
	clickRow.value = null;
	queryParams.value = e
	api.getWorkPlanByConditionForAppPC(e).then(res => {
		tableData.value = res.data
	})
}
/** 初始化数据 */
getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
