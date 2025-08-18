<template>
	<div class="app-container">
		<EditTable
			ref="baseTable"
			:showToolBar="true"
			:name="'demo'"
			:tableHeight="300"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:loading="false"
			:total="total"
			:hasAdd="true"
			:footerConfig="footerConfig"
			:show-footer="true"
			@change="changeSelect"
		/>
		<!-- <BaseTable
			ref="baseTable"
			:showToolBar="true"
			:name="'demo'"
			:tableHeight="300"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:loading="false"
			:total="total"
			:footerConfig="footerConfig"
			:show-footer="true"
		/> -->
		<FormatInput :defaultValue="'333333'" @input="v => (value = v)" />
		<vxe-button @click="saveEvent">保存数</vxe-button>
		<div style="width: 320px">
			<Upload @changeFile="changeFile" />
		</div>
	</div>
</template>

<script setup name="Demo">
// import api from '@/api/monitor/online'
import { ref, reactive, nextTick, onMounted, h } from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Upload from '@/components/Upload/index.vue'
import FormatInput from '@/components/FormatInput/index.vue'
import { formatMoney } from '@/utils/index.js'
import { ElButton } from 'element-plus'
// const { proxy } = getCurrentInstance() // 相当于vue2里的this

onMounted(() => {
	// 需要使用表头移动功能则调用
	baseTable.value.colDrop()
})
const value = ref('')
const total = ref(100)
// VUE3使用ref的方法
const baseTable = ref()
// 表头传参，编辑表格、格式化、render渲染等用法
const tableColumns = reactive([
	{ prop: '', label: '序号', type: 'checkbox' },
	{ prop: 'name', label: '姓名按说', width: 100, editType: 'remoteSelect', editRender: {}, dataConfig: { url: '/222' } },
	{
		prop: 'sex',
		label: '性别',
		editType: 'select',
		modelLabel: 'myLabel', // 下拉框label绑定的值
		editRender: {},
		selectData: [
			{ label: '你好', value: '1', sex: 'A' },
			{ label: '我在', value: '2', sex: 'B' },
			{ label: '干嘛', value: '3', sex: 'C' },
		],
	},
	{ prop: 'age', label: '年龄', formatter: ({ cellValue }) => formatMoney(cellValue), editType: 'input', editRender: {} },
	{ prop: 'file', label: '附件' },
])
// 表格数据
const tableData = reactive([
	{
		id: 10001,
		name: 'Test1',
		role: 'Develop',
		sex: 'Man',
		age: 28000,
		fileName: 1423,
		address: 'test abc',
		fileList: {
			createBy: null,
			createByName: null,
			createTime: null,
			updateBy: null,
			updateByName: null,
			updateTime: null,
			loginUserId: '1',
			loginUserName: '超级管理员',
			loginUserType: null,
			now: '2023-06-21 17:17:52',
			shorthandCode: null,
			id: '1671447331867856896',
			businessId: null,
			businessType: '0001',
			fileBucket: 'ppm',
			filePath: '2023-06-21/',
			fileSaveName: '1671447331867856896ffff.doc',
			fileName: 'ffff.doc',
			fileIcon: null,
			fileType: '0',
			fileSuffix: 'doc',
			fileUrl: null,
			name: 'ffff.doc',
		},
	},
	{
		id: 10002,
		name: 'Test2Test2Test2Test2Test2Test2Test2',
		role: 'TestDevelopDevelopDevelopDevelopDevelop',
		sex: 'Women',
		age: 2233,
		fileName: 1423,
		address: 'Guangzhou',
	},
	{
		id: 10003,
		name: 'Test3',
		role: 'PM',
		sex: 'Man',
		age: 32,
		fileName: 1423,
		address: 'Shanghai',
	},
	{
		id: 10004,
		name: 'Test4',
		role: 'Designer',
		sex: 'Women',
		age: 24,
		fileName: 1423,
		address: 'Shanghai',
	},
])
// 编辑框配置
const editConfig = reactive({ trigger: 'click', mode: 'cell' })
const saveEvent = () => {
	console.log(value.value, 'tableData')
	// baseTable.value.removeCheckboxRow()
}
const changeFile = file => {
	console.log(file)
}
const changeSelect = row => {
	console.log(row.sex, '22row')
}
const footerConfig = reactive({
	columns: [{ prop: 'age', formatter: formatMoney }],
	functions: ['平均值', '合计'],
})
</script>
<style lang="scss" scoped>
:deep() .vxe-table .vxe-header--column.col-blue {
	background-color: #2db7f5;
	color: #fff;
}
:deep() .vxe-table .vxe-body--row.row-green {
	background-color: #187;
	color: #fff;
}
</style>
