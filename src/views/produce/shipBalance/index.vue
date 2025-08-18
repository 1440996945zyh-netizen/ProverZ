<template>
	<div>
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
			/>
		</div>
		<el-drawer v-model="detailVisible" title="详情" size="80%">
			<detail ref="detailRef" @add="add" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="shipBalance">
import detail from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/shipBalance/index.js'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
// header检索参数
const selectData = reactive([
/*	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 24,
		dataType: 'VOYAGE',
	},*/
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 12, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 12, // 占位，共24
  },
	// {
	// 	name: '费目类型',
	// 	type: 'select',
	// 	modelValue: 'itemTypeCd',
	// 	span: 12,
	// 	dataConfig: { url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE', dictType: 'FEE_ITEM_TYPE' },
	// },
])
const queryParams = ref({
	// 检索参数
	startPage: 1,
	pageSize: 10,
})

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '整船调整', // 按钮名称
		type: 'primary', // 按钮类型
		icon: '', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'produce:shipBalance:adjust', // 权限
	},
])

// 新增事件
const add = () => {
  if(clickRow.value.shipvoyageItemId == null){
    proxy.$message.error("请选择一条数据！")
    return;
  }
	detailVisible.value = true
	nextTick(() => {
    detailRef.value.dtoList=[]
    api.getCargoInfo(clickRow.value.shipvoyageItemId)
			.then(res => {

       if(res.data.errorMsg!=null && res.data.errorMsg != ''){
         proxy.$message.error( res.data.errorMsg)
       }
				detailRef.value.tableData = res.data.result
				// proxy.$modal.msgSuccess(res.msg)
			})
			.catch(() => {})
	})
}
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
	{
		label: '船名航次',
		prop: 'shipNameVoyage',
		render: row => {
			return [h('div', {}, (row.shipNameVoyage = row.shipName + '_' + row.voyage))]
		},
	},
	{ label: '内外贸', prop: 'tradeType', minWidth: 100 },
	{ label: '装卸', prop: 'loadUnload', width: 100 },
	{ label: '船代名称', prop: 'customerName', width: 300 },
	{ label: '交接量', prop: 'ton', width: 160 },
])

// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deletebyid(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
}
// 保存事件
const save = async () => {
		const params = JSON.parse(JSON.stringify(detailRef.value.dtoList)) // 取到子组件的formData
    if(params.length == 0){
      proxy.$modal.msgWarning('请选择一条数据')
      return
    }
		proxy.$modal.confirm('确定保存？').then(() => {
			api.save(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				detailVisible.value = false
				getList(queryParams.value)
			})
		})
}
// 默认查询
getList(queryParams.value)
</script>
