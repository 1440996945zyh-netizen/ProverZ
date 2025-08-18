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
		<el-drawer v-model="customerVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="customerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="closeSail">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/dispatch/closeSail/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	beginTimes: '',
	endTimes: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '开始时间', prop: 'startTime', align: 'left' },
	{ label: '结束时间', prop: 'endTime', align: 'left' },
	{ label: '封航状态', prop: 'status', align: 'left' ,width: 170},
	{ label: '封航时长(小时)', prop: 'timeLength', align: 'left',width: 160 },
	{ label: '封航原因', prop: 'closeReasonName', align: 'left',width: 120 },
  { label: '影响艘次', prop: 'shipVoyageNum' , align: 'left',width: 100},
  { label: '注意事项', prop: 'remark', align: 'left' ,width: 200},
	{ label: '影响船舶', prop: 'effectShipvoyage' , align: 'left'},
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'dispatch:closeSail:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'dispatch:closeSail:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		type: 'nativedate', // 搜索框类型
		modelValue: 'beginTimes', // 绑定字段
		span: 8, // 占位，共24
		name: '开始时间',
	},
	{
		type: 'nativedate', // 搜索框类型
		modelValue: 'endTimes', // 绑定字段
		span: 8, // 占位，共24
		name: '结束时间',
	},
	{
		name: '航次', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'shipvoyageId', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'SCN',
	},
	// {
	// 	name: '封航状态', // 搜索框name
	// 	type: 'remoteSelect', // 搜索框类型
	// 	modelValue: 'shipvoyageId', // 绑定字段
	// 	span: 8, // 占位，共24
  //   selectData: [
  //     { label: '是', value: '是' },
  //     { label: '否', value: '否' },
  //   ],
	// },
  {
    name: '封航状态',
    type: 'select', //输入框
    modelValue: 'status', //对应字段
    selectData:[
      {value:'1',label:'封航中'},
      {value:'0',label:'封航结束'},
    ],
    span: 3
  },

])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'dispatch:closeSail:add', // 权限
	},
	{
		label: '导出', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Download', // 按钮图标，支持element-Plus中所有图标
		click: () => getExport, // 回调函数
		permission: 'dispatch:closeSail:add', // 权限
	},
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	// queryParams.value.beginTimes = proxy.addDateRange(e).dateRange ? proxy.addDateRange(e).dateRange[0] : ''
	// queryParams.value.endTimes = proxy.addDateRange(e).dateRange ? proxy.addDateRange(e).dateRange[1] : ''
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 重置按钮操作 */
function resetQuery() {
	proxy.resetForm('queryRef')
	handleQuery()
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
// 导出事件
const getExport = () => {
  api.getExport(queryParams.value).then(async res => {
    downLoadBlob(res, '封航信息')
  })
}
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	customerVisible.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.typeList = []
		api.getDataById(editRow.id).then(res => {
			let msg = res.data
			msg.closeReason = { label: res.data.closeReasonName, value: res.data.closeReasonCode }
			if(msg.effectShipvoyage!=null){
        let length = msg.effectShipvoyage.split(",").length;
        msg.shipVoyageNum = length;
      }
			proxy.setFormData(detailRef.value.formData, msg)
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					customerVisible.value = false
				})
			} else {
				delete detailRef.value.formData.id
				api.insert(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					customerVisible.value = false
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
