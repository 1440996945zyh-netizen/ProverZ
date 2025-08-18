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
		<el-drawer v-model="drawerVisible" :title="title" size="48%">
			<el-collapse v-model="activeNames" @change="handleChange">
				<el-collapse-item title="基础信息" name="1">
					<detail ref="detailRef" />
				</el-collapse-item>
				<el-collapse-item title="机械配置" name="2">
					<template #title>
						<el-row class="listOperate">
							<div style="float: left">
								<span class="leftSpan">机械配置</span>
							</div>
							<div style="float: right">
								<el-button type="primary" icon="Plus" @click.stop="machineListRef.add()">新建</el-button>
							</div>
						</el-row>
					</template>
					<machineList ref="machineListRef" />
				</el-collapse-item>
				<el-collapse-item title="工人配置" name="3">
					<template #title>
						<el-row class="listOperate">
							<div style="float: left">
								<span class="leftSpan">工人配置</span>
							</div>
							<div style="float: right">
								<el-button type="primary" icon="Plus" @click.stop="workerListRef.add()">新建</el-button>
							</div>
						</el-row>
					</template>
					<workerList ref="workerListRef" />
				</el-collapse-item>
				<el-collapse-item title="工属具配置" name="4">
					<template #title>
						<el-row class="listOperate">
							<div style="float: left">
								<span class="leftSpan">工属具配置</span>
							</div>
							<div style="float: right">
								<el-button type="primary" icon="Plus" @click.stop="workwarListRef.add()">新建</el-button>
							</div>
						</el-row>
					</template>
					<workWarList ref="workwarListRef" />
				</el-collapse-item>
			</el-collapse>

			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="technology">
import BaseTable from '@/components/BaseTable/index.vue'
import machineList from './machineList/index.vue'
import workerList from './workerList/index.vue'
import workWarList from './workWarList/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/technology/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const machineListRef = ref() //机械配置表格ref
const workerListRef = ref() //工人配置表格ref
const workwarListRef = ref() //工具属配置表格ref
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const activeNames = ref(['1', '2', '3', '4'])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '作业过程名称', prop: 'processName' },
	{ label: '作业工艺名称', prop: 'techniqueName' },
	{ label: '货物名称', prop: 'cargoNames' },
	{ label: '状态', prop: 'status' },
	{ label: '录入人', prop: 'createName' },
	{ label: '录入时间', prop: 'createTime', width: 160 },
	{
		prop: '',
		label: '操作',
		width: 200,
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
		name: '作业过程名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'name', // 绑定字段
		span: 4, // 占位，共24
	},
])
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:process:addprocess', // 权限
	},
	{
		label: '编辑',
		type: 'primary',
		icon: 'Edit',
		click: () => edit,
		disabled: true, // 是否可点击
		permission: 'master:process:updateprocess',
	},
])
const drawerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	buttonList[1].disabled = true
	api.listTechnology(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}

// 新增事件
const add = () => {
	title.value = '添加作业工艺'
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineListRef.value.tableData = []
		workerListRef.value.tableData = []
		workwarListRef.value.tableData = []
	})
}
// 编辑事件
const edit = row => {
	title.value = '修改作业工艺'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineListRef.value.tableData = []
		workerListRef.value.tableData = []
		workwarListRef.value.tableData = []
		api.selectTechniQueById(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			detailRef.value.formData = resData
			detailRef.value.formData.processCodes = resData.processCodes ? resData.processCodes.split(',') : []
			detailRef.value.formData.processNames = resData.processNames ? resData.processNames.split(',') : []
			detailRef.value.formData.cargoNames = resData.cargoNames ? resData.cargoNames.split(',') : []
			detailRef.value.formData.cargoCodes = resData.cargoCodes ? resData.cargoCodes.split(',') : []
			detailRef.value.formData.status = resData.status == 'true' ? true : false
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('是否删除作业工艺名称为" ' + deleteRow.techniqueName + ' "的数据项?')
		.then(() => {
			api.deleteTechniqueById(deleteRow.id).then(res => {
				if (res.code === '0000') {
				}
				getList(queryParams.value)
				proxy.$modal.msgSuccess('删除成功')
			})
		})

		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (
		(await detailRef.value.validate()) &&
		(await machineListRef.value.validate()) &&
		(await workerListRef.value.validate()) &&
		(await workwarListRef.value.validate())
	) {
		let params = {
			...detailRef.value.formData,
			listMachine: JSON.parse(JSON.stringify(machineListRef.value.tableData)),
			listWorker: JSON.parse(JSON.stringify(workerListRef.value.tableData)),
			listWorkwar: JSON.parse(JSON.stringify(workwarListRef.value.tableData)),
		}

		params.processCodes = params.processCodes.join(',')
		params.processNames = params.processNames.join(',')
		params.cargoCodes = params.cargoCodes.join(',')
		params.cargoNames = params.cargoNames.join(',')

		proxy.$modal.confirm('是否保存？').then(() => {
			if (params.id) {
				api.updateTechnique(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('修改成功')
						drawerVisible.value = false
						getList(queryParams.value)
					}
				})
			} else {
				api.addTechnique(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						drawerVisible.value = false
						getList(queryParams.value)
					}
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[1].disabled = false
}
getList(queryParams.value)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px 0 0;
	justify-content: space-between;
	align-items: center;
}
</style>
