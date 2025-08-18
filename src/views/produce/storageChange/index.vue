<template>
	<!-- 库场调账 -->
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
			:total="total"
			@Status_Change="Status_Change"
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="库场调账" size="80%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">{{ '取消' }}</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="storageChange">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/storageChange/index.js'
import drawer from './drawer/index.vue'
import publicApi from '@/api/public/index'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const drawerVisible = ref(false) //新增修改抽屉

const total = ref(0)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '日期', prop: 'workDate', align: 'center' },
	{ label: '班次', prop: 'className', align: 'center' },
	{ label: '作业过程', prop: 'processDetailName', align: 'center' },
	{ label: '库场', prop: 'storehouseName', align: 'center' },
	{ label: '区域', prop: 'regionName', align: 'center' },
	{ label: '垛位', prop: 'massName', align: 'center' },
	{ label: '件数', prop: 'quantity', align: 'center' },
	{ label: '重量', prop: 'ton', align: 'center' },
	{ label: '票货信息', prop: 'cargoInfoLabel', align: 'center',width:200},
])
const selectData = reactive([
	{
		name: '作业公司', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'companyId', // 绑定字段
		span: 8, // 占位，共24
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{
		name: '日期', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'workDate', //绑定字段
		span: 8, //占位多少，总共24
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 8,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])
const buttonList = reactive([
	{
		label: '新增调账', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'produce:portStorageDetail:list', // 权限
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const add = async () => {
	drawerVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
	})
}

// 票货保存
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = {
			...drawerRef.value.formData,
		} // 取到子组件的formData
		proxy.$modal.confirm('确定保存？').then(() => {
			api.insertPortStorage(params).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('提交成功')
					drawerVisible.value = false
					getList(queryParams.value)
				}
			})
		})
	}
}

/** 初始化数据 */
// 获取默认当前时间班次
const init = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
			queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value)
}

init()
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
