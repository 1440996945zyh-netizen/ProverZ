<template>
	<div class="app-container">
		<!-- 合同优惠 -->
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
			:rowConfig="rowConfig"
		/>
		<!-- :treeConfig="treeConfig" -->
	</div>
	<el-drawer v-model="contractVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="contractVisible = false">取消</el-button>
				<el-button
					type="primary"
					@click="save"
					v-hasPermi="['business:contract:add', 'business:contract:update']"
					:disabled="formDisabled"
				>
					保存
				</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="contractBenefits">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/contractBenefits/index'
import contractApi from '@/api/business/contractBenefits/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const total = ref('') // 数据总数
const tableData = ref([]) // 表数据
const contractVisible = ref(false) // 是否显示详情
const title = ref('') // 详情标题
const detailRef = ref(null) // 明细组件ref
const formDisabled = ref(false)
const tableColumns = ref([
	// 表头列
	// { label: '', prop: '', treeNode: true, width: 50 },
	{ label: '客户', prop: 'customerNames', width: 300 },
	{ label: '合同', prop: 'contractNos', width: 300 },
	{ label: '有效期起', prop: 'startTime', width: 180, align: 'center' },
	{ label: '有效期止', prop: 'endTime', width: 180, align: 'center' },
	{
		label: '状态',
		prop: 'status',
		width: 100,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? 'success' : 'primary',
					},
					{
						default: () => (row.status == '10' ? '待发布' : '已发布'),
					}
				),
			]
		},
	},
	{ label: '创建人', prop: 'createByName', width: 180 },
	{ label: '创建时间', prop: 'createTime', width: 200, align: 'center' },
	{
		prop: '',
		label: '操作',
		width: 200,
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
					},
					{ default: () => '编辑' }
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
						permission: 'business:contract:delete', // 权限
					},
					{ default: () => '删除' }
				),
			]
		},
	},
])
// 删除事件
const handleDelete = row => {
	const deleteRow = row // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}
const queryParams = ref({
	// 分页变量
	startPage: 1,
	pageSize: 10,
})
const selectData = reactive([
	// 查询条件
	{
		name: '客户名称',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'customerId', //对应字段
		span: 12,
		dataType: 'CUSTOMER_CARGO_OWNER',
		change: row => {
      if (!row) {
        proxy.setEditTableOptions(selectData, {contractNo: []})
        return
      }
			let data = {
				customerIds: row.value,
			}
			api.getLocalSelect(data).then(res => {
				// console.log('合同编号列表', res)
				proxy.setEditTableOptions(selectData, { contractNo: res.data })
			})
		},
	},
	{
		name: '合同编号',
		type: 'input',
		prop: 'contractNo',
		modelValue: 'contractNo',
		selectLabel: 'contractNo',
		selectValue: 'id',
		span: 12,
	},
])
const buttonList = reactive([
	// 搜索区域的按钮
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'business:contract:add', // 权限
	},
	{
		label: '发布', // 按钮名称
		type: 'primary', // 按钮类型
		// icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => release, // 回调函数
		permission: 'business:contract:add', // 权限
	},
	{
		label: '撤销发布', // 按钮名称
		type: 'primary', // 按钮类型
		// icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => revocation, // 回调函数
		permission: 'business:contract:add', // 权限
	},
])
// 选中行数据
const clickRow = ref('')
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	console.log('选中行数据', clickRow.value)
}
// 发布
const release = () => {
	if (!clickRow.value) {
		proxy.$modal.warning('请先选中发布数据！')
	}
	let row = clickRow.value
	proxy.$modal.confirm('是否确定发布？').then(() => {
		api.release(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('发布成功')
				getList(queryParams.value)
			}
		})
	})
}
// 撤销发布
const revocation = () => {
	if (!clickRow.value) {
		proxy.$modal.warning('请先选中撤销发布数据！')
	}
	let row = clickRow.value
	proxy.$modal.confirm('是否确定撤销发布？').then(() => {
		api.cancelRelease(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('撤销发布成功')
				getList(queryParams.value)
			}
		})
	})
}
// 新增事件
const add = () => {
	contractVisible.value = true
	title.value = '新增'
	formDisabled.value = false // 可保存
	nextTick(() => {
		const date = new Date()
		detailRef.value.resetForm() // 清空事件
		// detailRef.value.formData.form.signTime = JSON.parse(JSON.stringify(date))
		// console.log('数据回显', detailRef.value.formData)
	})
}
// 编辑事件
const edit = row => {
	const editRow = JSON.parse(JSON.stringify(row)) // 拿到所编辑行的数据
	// console.log('编辑所有数据', editRow)
	contractVisible.value = true
	title.value = '编辑'
	// formDisabled.value = false // 可保存
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		// detailRef.value.formData.form.companyIdList.
		proxy.setFormData(detailRef.value.formData.form, editRow)
    detailRef.value.formData.form.status = row.status
		console.log(33333, detailRef.value.formData.form)
		detailRef.value.formData.form.customerId = editRow.customers.map(item => item.customerId)
		detailRef.value.formData.form.contractNo = editRow.contracts.map(item => item.contractNo)
		console.log('detailRef.value.formData.form.contractNo', detailRef.value.formData.form.contractNo)
		detailRef.value.formData.tieredRateList = editRow.items.map((item, index) => {
			item.cargoCode = item.cargos.map(it => it.cargoCode).join(',')
			item.cargoName = item.cargos.map(it => it.cargoName).join(',')
			item.isTieredRateLable = item.isTieredRate == 1 ? '是' : '否'
			item.rateIndex = index * 1 + 1
			return item
		})
		console.log('detailRef.value.formData.tieredRateList', detailRef.value.formData.tieredRateList)
	})
}
// 点击查询按钮的事件
const getList = e => {
	queryParams.value = e
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		// console.log('阶梯费率主列表数据', res.data.pages)
	})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(res => {
			console.log('保存所有数据', toRaw(detailRef.value.formData))
			let { form, rateList, trates, tieredRateList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))
			console.log('tieredRateList', tieredRateList)
			let items = tieredRateList.map(item => {
				delete item.cargoCode
				delete item.cargoName
				return item
			})
			console.log('阶梯费率', items)
			let params = {
				id: form.id, //id
				contracts: form.contracts, //合同
				customers: form.customers, //客户
				startTime: form.startTime, //开始时间
				endTime: form.endTime, //结束时间
				items: JSON.parse(JSON.stringify(items)),
			}
			if (params.id == null) {
				console.log('数据保存')
				contractApi.insertTrate(params).then(res => {
					console.log('合同阶梯费率数据新增', res)
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					contractVisible.value = false
				})
			} else {
				console.log('修改')
				contractApi.updateTrate(params).then(res => {
					console.log('阶梯费率修改', res)
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					contractVisible.value = false
				})
			}
		})
	}
}
getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
