<template>
	<el-drawer v-model="drawerVisible" append-to-body size="70%" :show-close="false">
		<template #header="{}" :with-header="false">
			<div class="title">
				<div style="width: 200px"><span>导入计划</span></div>
				<div style="display: flex">
					<el-date-picker
						style="margin-right: 10px !important"
						v-model="formData.workDate"
						type="date"
						value-format="YYYY-MM-DD"
						format="YYYY-MM-DD"
						placeholder="日期"
					></el-date-picker>
					<Select
						v-model:value="formData.classCode"
						v-model:label="formData.className"
						:selectLabel="'dictLabel'"
						:selectValue="'dictValue'"
						placeholder="班次"
						:dataConfig="{
							url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
						}"
					/>
					<el-button style="margin-left: 10px" type="primary" icon="Plus" @click="add">导入</el-button>
				</div>
			</div>
		</template>
		<el-row style="margin-top: 10px; margin-bottom: 10px; margin-left: 10px" :gutter="20">
			<el-col :span="4">
				<el-date-picker
					style="margin-right: 10px !important; width: 100px"
					v-model="searchData.workDate"
					type="date"
					value-format="YYYY-MM-DD"
					format="YYYY-MM-DD"
					placeholder="日期"
				></el-date-picker>
			</el-col>
			<el-col :span="4">
				<Select
					v-model:value="searchData.classCode"
					v-model:label="searchData.className"
					:selectLabel="'dictLabel'"
					:selectValue="'dictValue'"
					placeholder="班次"
					:dataConfig="{
						url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
					}"
				/>
			</el-col>
      <el-col :span="4">
				<Select
					v-model:value="searchData.packageCode"
					v-model:label="searchData.packageName"
					placeholder="包装"
					:dataConfig="{
						url: 'api/internal/public/getLocalSelect?type=DICT&dictType=PACKAGE_TYPE',
					}"
				/>
			</el-col>
      <el-col :span="4" v-if="flag == 'jsg'">
				<Select
          :selectData="[{value:'1',label:'是'},{value:'0',label:'否'}]"
					v-model:value="searchData.isClear"
					placeholder="是否完货"
        />
			</el-col>
			<el-col :span="4">
				<el-button style="margin-left: 10px" type="primary" icon="Search" @click="getList">查询</el-button>
			</el-col>
		</el-row>
		<div v-if="flag == 'cbjh'">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="false"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:tableHeight="'pageTableHeight'"
				:checkbox-config="checkboxConfig"
				:selectAllChangeEvent="checkboxChangeEvent"
				@checkbox-change="checkboxChange"
			/>
		</div>
		<div v-else>
			<BaseTable
				ref="baseTable"
				:showSearchHeader="false"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns1"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:tableHeight="'pageTableHeight'"
				:checkbox-config="checkboxConfig"
				:selectAllChangeEvent="checkboxChangeEvent"
				@checkbox-change="checkboxChange"
			/>
		</div>
	</el-drawer>
</template>

<script setup name="instructions">
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select'
import { onMounted,} from 'vue'
import api from '@/api/dispatch/workPlan/index.js'
import { getBeforeAfter } from '@/utils/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { ElTag } from 'element-plus'
const searchData = ref({
	workDate: '',
	classCode: '',
	className: '',
  packageCode:'',
  packageName:'',
  isClear:'0',
})
const searchJSGData = ref({
  workDate: '',
  classCode: '',
  className: '',
  packageCode:'',
  packageName:'',
  isClear:'0',
})
const drawerVisible = ref(false)
const emit = defineEmits(['importSuccess'])
const importDate = ref({}) // 导入数据
const value = computed({
	get() {
		// return props.value
	},
	set(val) {
		emit('update:value', val)
	},
})
const formData = ref({
	planType: '',
	workDate: '',
	classCode: '',
	className: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50 },
  { prop: 'trustNo', label: '通知单编号', width: 160, align: 'center' },
	{
		prop: 'statusLabel',
		label: '状态',
		width: 100,
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag =
				row.status == 10
					? 'info'
					: row.status == 20
					? 'success'
					: row.status == 30
					? 'primary'
					: row.status == 40
					? 'danger'
					: 'success'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
	{ prop: 'processName', label: '作业过程', width: 160, align: 'left' },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 160, align: 'left' },
	{ prop: 'hatch', label: '舱口', width: 160, align: 'left' },
	{ prop: 'workNum', label: '货种', width: 160, align: 'left' },
	{ prop: 'customerName', label: '客户名称', width: 160, align: 'left' },
	{ prop: 'loadUnload', label: '装卸', width: 100, align: 'left' },
	{ prop: 'berthName', label: '泊位', width: 160, align: 'left' },
	{ prop: 'massNamesSource', label: '库场区域', width: 160, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 160, align: 'left' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 160, align: 'left' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 160, align: 'left' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 160, align: 'left' },
	{ prop: 'laborNum', label: '装卸队', width: 100, align: 'left' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'left' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'left' },
	{ prop: 'dispatchByName', label: '调渡员', width: 100, align: 'left' },
	{ prop: 'quantityPlan', label: '计划件数', width: 100, align: 'left' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'left' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 160, align: 'canter' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 160, align: 'canter' },
	{ prop: 'remark', label: '作业要求', width: 100, align: 'left' },
])
const tableColumns1 = ref([
	{ label: '', type: 'checkbox', width: 50 },
	{ prop: 'trustNo', label: '通知单编号', width: 160, align: 'center' },
	{ prop: 'companyName', label: '作业公司', width: 110, align: 'left' },
	{ prop: 'workDate', label: '日期', width: 160, align: 'center' },
	{ prop: 'className', label: '班次', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', width: 120, align: 'center' },
	// { prop: 'cargoAgentName', label: '货代', width: 120, align: 'center' },
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ label: '结算依据', prop: 'settlementBasisName', width: 120, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '作业机械', width: 180, align: 'left' },
	{ prop: 'laborNum', label: '装卸队', width: 110, align: 'left' },
	{ prop: 'processName', label: '作业过程', width: 150, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'left' },
	// { prop: 'deptName', label: '申请部门', width: 'time', align: 'left' },
])
const selectData = reactive([
	{
		name: '日期', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'workDate', //绑定字段
		span: 12, //占位多少，总共24
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
	range: false, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 导入事件
const add = () => {
	if (!formData.value.workDate || !formData.value.classCode) {
		proxy.$message.warning('请填写日期和班次！')
		return
	}
	if (checkboxList.value.length == 0) {
		return proxy.$message.warning('请勾选数据！')
	}
	//2023/11/17 临时写死 导入上班次可能会出现classCode和ClassName不对应的情况
  if(formData.value.classCode == '01'){
    formData.value.className == '白班'
  }else if(formData.value.classCode == '02'){
    formData.value.className == '夜班'
  }
	proxy.$modal
		.confirm('确定导入此数据吗？')
		.then(async res => {
			let ids = checkboxList.value.map(item => item.id)
			const params = JSON.parse(JSON.stringify(ids))
      const JSGparams = JSON.parse(JSON.stringify(checkboxList.value))
			console.log(flag.value)
			if (flag.value == 'cbjh') {
				api.reqImportWorkPlan(params, formData.value.workDate, formData.value.classCode, formData.value.className).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					drawerVisible.value = false
					emit('importSuccess', true)
				})
			} else if(flag.value == 'jsg')  {
        console.log(formData.value)
        api.insertJSGBatch(JSGparams, formData.value.workDate, formData.value.classCode, formData.value.className).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          drawerVisible.value = false
          emit('importSuccess', true)
        })
      }else  {
				console.log(formData.value)
				api.insertBatch(params, formData.value.workDate, formData.value.classCode, formData.value.className).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					drawerVisible.value = false
					emit('importSuccess', true)
				})
			}
		})
		.catch(err => {})
}
watch(
	() => drawerVisible.value,
	newV => {
		// console.log('有新值吗', newV)
		if (newV) {
			console.log(newV)
			nextTick(() => {})
		}
	},
	{ deep: true }
)
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
	checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
	checkboxList.value = data
}
const flag = ref()
const getList = e => {
	if (!formData.value.workDate || !formData.value.classCode) {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}
	searchData.value = Object.assign(searchData.value, e)
	if (flag.value == 'cbjh') {
    searchData.value.planType = '1'//23/12/08 船舶计划的导入上班次只能查出来上班次的船舶计划
    searchData.value.JSGtemp = ''
		api.reqGetWorkPlanList(searchData.value).then(res => {
			tableData.value = res.data
		})
	} else if(flag.value == 'jsg') {
    searchData.value.planType = '2'
    searchData.value.JSGWorkDate = formData.value.workDate
    searchData.value.classJSGCode = formData.value.classCode
    searchData.value.classJSGName = formData.value.className
    searchData.value.JSGtemp = '1' //集疏港昼夜计划查询标志位
		api.reqGetWorkPlanList(searchData.value).then(res => {
			tableData.value = res.data
		})
	}else if(flag.value == 'zyjh') {
    searchData.value.planType = '3'
    api.reqGetWorkPlanList(searchData.value).then(res => {
      tableData.value = res.data
    })
  }
}
const getSelectData = val => {
	flag.value = val
	api.getNowDate({ dateTime: getBeforeAfter('before', 0.5, 'YYYY-MM-DD hh:mm:ss') }).then(res => {
		searchData.value.workDate = res.data.workDate
		searchData.value.classCode = res.data.classCode
		searchData.value.className = res.data.className
		getList(searchData.value)
	})
}
// init()
defineExpose({
	importDate,
	value,
	drawerVisible,
	formData,
	getSelectData,
})
</script>

<style scoped>
.title {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}
</style>
