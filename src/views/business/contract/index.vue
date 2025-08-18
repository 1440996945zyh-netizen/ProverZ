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
			:total="total"
			:treeConfig="treeConfig"
			:rowConfig="rowConfig"
		/>
	</div>

	<el-drawer v-model="contractVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="contractVisible = false">取消</el-button>
				<el-button type="primary" @click="save" v-hasPermi="['business:contract:add', 'business:contract:update']">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="contract">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import contractApi from '@/api/business/contract/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const contractVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const clickRow = ref(null)

const baseTable = ref(null)
const rowConfig = { keyField: 'id' }
const selectData = reactive([
	// 查询条件
	{
		name: '作业公司',
		type: 'select',
		modelValue: 'companyId',
		span: 8,
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{ name: '客户名称', type: 'input', modelValue: 'customerName', span: 8 },
	{ name: '合同编号', type: 'input', modelValue: 'contactNo', span: 8, maxlength: 100 },
	{
		name: '合同类型',
		type: 'select',
		modelValue: 'contractType',
		span: 2,
		dataConfig: {
			url: '/api/internal/public/getDictListByType/CONTRACT_TYPE',
		},
	},
	{
		name: '合同状态',
		type: 'select',
		modelValue: 'status',
		span: 2,
		selectData: [
			{
				value: '10',
				label: '签订',
			},
			{
				value: '20',
				label: '生效',
			},
		],
	},
  {
    name: '货物名称', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 2, // 占位，共24
  },
  {
    name: '是否上传合同附件',
    type: 'select',
    modelValue: 'hasContractFile',
    span: 2,
    selectData: [
      {
        value: '是',
        label: '是',
      },
      {
        value: '否',
        label: '否',
      },
    ],
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
		label: '生效', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Open', // 按钮图标，支持element-Plus中所有图标
		click: () => updateStstus, // 回调函数
		permission: 'business:contract:takeEffect', // 权限
	},
	{
		label: '取消生效', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'TurnOff', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelEffect, // 回调函数
		permission: 'business:contract:takeEffect', // 权限
	},
	{
		label: '补充协议', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'DocumentAdd', // 按钮图标，支持element-Plus中所有图标
		click: () => addSA, // 回调函数
		permission: 'business:contract:add', // 权限
	},
])
const tableColumns = ref([
	// 表头列
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', prop: '', treeNode: true, width: 50 },
	{ label: '作业公司', prop: 'companyNames', width: 150 },
	{ label: '合同编号', prop: 'contactNo', width: 200 },
	{ label: '客户', prop: 'customerName', width: 230 },
	{ label: '合同类型', prop: 'contractTypeLabel', align: 'center', width: 120 }, // TODO
	{ label: '录入日期', prop: 'signTime', width: 'time', align: 'center' },
	{ label: '有效期起始日', prop: 'startTime', width: 'time', align: 'center' },
	{ label: '有效期终止日', prop: 'endTime', width: 'time', align: 'center' },
	{ label: '创建人', prop: 'createByName', width: 120 },
	{ label: '生效人', prop: 'validByName', width: 120 },
	{ label: '合同附件', prop: 'hasContractFile', fixed: 'right', align: 'center',width: 100 },
	{
		label: '合同状态',
		prop: 'statusLabel',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? '' : 'success',
					},
					{
						default: () => {
							return row.statusLabel
						},
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 150,
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
const queryParams = ref({
	// 分页变量
	startPage: 1,
	pageSize: 10,
})

const treeConfig = reactive({
	// highlight: true,
	transform: true,
	rowField: 'id',
	parentField: 'parentId',
	lazy: true,
	hasChildField: 'hasChild',
	loadMethod({ row }) {
		// console.log('22222', row)
		// 异步加载子节点
		return fetchChildListApi(row)
	},
})
const fetchChildListApi = async row => {
	const res = await contractApi.getListByParentId(row.id)

	return res.data
}

/**--------------方法------------ */
// 点击查询按钮的事件
const getList = e => {
	console.log('合同查询', e)
	clickRow.value = null //清空选中行数据
	buttonList[1].disabled = true //控制生效按钮
	buttonList[2].disabled = true //控制取消生效按钮
	buttonList[3].disabled = true //控制补充协议按钮
	queryParams.value = e || queryParams.value
	contractApi.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		setTimeout(() => {
			baseTable.value.clearTreeExpand()
		}, 50)
		res.data.pages.forEach(item => {
			if (item.isSubMatch == '1') {
				tableData.value = res.data.pages.map(item => {
					item.hasChild = true
					return item
				})
				setTimeout(() => {
					baseTable.value.toggleTreeEvent()
				}, 50)
			}
		})
	})
}

// table获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	console.log('行点击事件', clickRow.value)
	if (clickRow.value.status != '20') {
		buttonList[1].disabled = false //控制生效按钮
	} else {
		buttonList[1].disabled = true
	}
	if (clickRow.value.status == '20') {
		buttonList[2].disabled = false //控制生效按钮
	} else {
		buttonList[2].disabled = true
	}
	if (!clickRow.value.parentId) {
		buttonList[3].disabled = false //控制补充协议按钮
	} else {
		buttonList[3].disabled = true
	}
}
// 新增事件
const add = () => {
	contractVisible.value = true
	title.value = '新增'

	nextTick(() => {
		const date = new Date()
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formDisabled = false // 可修改
		// 设置状态
		detailRef.value.formData.form.status = 10
		// detailRef.value.isAdd = true //新增
		detailRef.value.init(true) // 初始化数据

		detailRef.value.formData.form.signTime = JSON.parse(JSON.stringify(date))
		// console.log('数据回显', detailRef.value.formData)
	})
}
// 新增补充协议
const addSA = () => {
	if (!clickRow.value || !clickRow.value.id) {
		proxy.$message.error('请选择合同！')
		return
	}

	const editRow = clickRow.value // 拿到所编辑行的数据
	contractVisible.value = true
	title.value = '补充协议'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formDisabled = false // 可修改
		detailRef.value.init(true) // 初始化数据
		contractApi.getById(editRow.id).then(res => {
			let detailData = JSON.parse(JSON.stringify(res.data))
			console.log('补充协议', res)
			proxy.setFormData(detailRef.value.formData.form, res.data)
			detailRef.value.formData.form.companyIdList = detailData.companyList.map(item => item.companyId) //作业公司
			detailRef.value.formData.form.companyNameList = detailData.companyList.map(item => item.companyName)
			detailRef.value.formData.form.relevancyCustomerId = detailData.customers.map(item => item.customerId) //关联客户
			detailRef.value.formData.form.relevancyCustomerName = detailData.customers.map(item => item.customerName)
			detailRef.value.formData.form.cargoCodes = [] //货物
			detailRef.value.formData.form.signTime = new Date().toLocaleDateString().replaceAll('/', '-') //货物
			console.log('签订日期', detailRef.value.formData.form.signTime)

			//处理id

			detailRef.value.formData.form.parentId = detailRef.value.formData.form.id
			detailRef.value.formData.form.id = null
			// 设置状态
			detailRef.value.formData.form.status = 10
			// 处理其他
			detailRef.value.formData.form.fileIds = []
			detailRef.value.formData.rateList = []
		})
	})
}
// 编辑事件
const edit = row => {
	const editRow = row // 拿到所编辑行的数据
	contractVisible.value = true
	title.value = '编辑'

	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formDisabled = false // 可修改
		// detailRef.value.isAdd = false //编辑
		contractApi.getById(editRow.id).then(res => {
      if (res.data.depositBasisName != null && res.data.depositBasisName != '') {
        // 将字符串转换回数组
        const macNoArray = res.data.depositBasisName.split(',');
        res.data.depositBasisName = macNoArray
      } else {
        // 将空字符串转换为数组
        const macNoArray = [];
        res.data.depositBasisName = macNoArray;
      }
      if (res.data.depositBasisCode != null && res.data.depositBasisCode != '') {
        // 将字符串转换回数组
        const macIdArray = res.data.depositBasisCode.split(',');
        res.data.depositBasisCode = macIdArray
      }else {
        // 将空字符串转换为数组
        const macIdArray = [];
        res.data.depositBasisCode = macIdArray;
      }

			if ('10' != res.data.status) {
				detailRef.value.formDisabled = true // 不可修改
			}
			let detailData = JSON.parse(JSON.stringify(res.data))
			// console.log('单条合同数据', detailData)
			// console.log('数据回显', detailRef.value.formData)
			proxy.setFormData(detailRef.value.formData.form, res.data)
			detailRef.value.formData.form.companyIdList = detailData.companyList.map(item => item.companyId) //作业公司
			detailRef.value.formData.form.companyNameList = detailData.companyList.map(item => item.companyName)
			detailRef.value.formData.form.relevancyCustomerId = detailData.customers.map(item => item.customerId) //关联客户
			detailRef.value.formData.form.relevancyCustomerName = detailData.customers.map(item => item.customerName)

			// console.log('detailRef.value.formData.cargoRateGbCargoList', detailRef.value.formData.cargoRateGbCargoList)
			detailRef.value.formData.rateList = detailData.rateList.filter(item => {
				//货物服务费率列表
				if (item.type == 20) {
					return item
				}
			}) //货物服务费率
			// console.log('detailRef.value.formData.rateList', detailRef.value.formData.rateList)
			detailRef.value.formData.cargoRatesList = detailData.rateList.filter(item => {
				//货物费率详情列表
				if (item.type == 10) {
					return item
				}
			})
			detailRef.value.editCargoRate(detailRef.value.formData.cargoRatesList)
			detailRef.value.init(false) // 初始化数据
			//货物费率列表(详细)
			// if (detailData.trates) {
			// 	// console.log('阶梯费率', detailData.trates)
			// 	detailRef.value.formData.tieredRateList = detailData.trates.map(item => {
			// 		return {
			// 			rateIndex: item.id,
			// 			cargoName: item.trateCargos.map(it => it.cargoName).join(','),
			// 			cargoCode: item.trateCargos.map(it => it.cargoCode).join(','),
			// 			tradeType: item.tradeType,
			// 			preferentialRate: item.preferentialRate,
			// 			isTieredRateLable: item.isTieredRate == '0' ? '否' : '是',
			// 			isTieredRate: item.isTieredRate,
			// 			trateCargos: item.trateCargos,
			// 			trateDetails: item.trateDetails ? item.trateDetails : [],
			// 		}
			// 	})
			// }
		})
	})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(res => {
			// console.log('保存所有数据', toRaw(detailRef.value.formData))
			let { form, cargoRatesList, rateList, trates, tieredRateList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))
			form.relevancyCustomerId = []
			form.relevancyCustomerName = []
			form.companyIdList = []
			form.companyNameList = []
			let rateLists = []
			// 货物费率

			cargoRatesList.forEach(item => {
				item.type = 10
				// console.log(item)
				rateLists.push(item)
			})
			console.log('cargoRatesList', cargoRatesList)
			// 服务费率
			rateList.forEach(item => {
				item.type = 20
				rateLists.push(item)
			})
			console.log('rateLists', rateLists)
			let params = {
				...form,
				rateList: rateLists,
				trates: tieredRateList,
			}
      if (params.depositBasisName != null && params.depositBasisName.length > 0) {
        const macNoStr =  params.depositBasisName.join(',');
        params.depositBasisName = macNoStr;
      }else {
        params.depositBasisName = ''; // 将null转换为空字符串
      }
      if (params.depositBasisCode != null && params.depositBasisCode.length > 0) {
        const macIdStr =  params.depositBasisCode.join(',');
        params.depositBasisCode = macIdStr;
      }else {
        params.depositBasisCode = ''; // 将null转换为空字符串
      }
			if (params.id == null) {
				// console.log('数据保存')
				contractApi.add(params).then(res => {
					console.log('合同数据新增', res)

					proxy.$message.success(res.msg)
					getList(queryParams.value)
					contractVisible.value = false
				})
			} else {
				// console.log('修改')
				contractApi.update(params).then(res => {
					console.log('合同修改', res)
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					contractVisible.value = false
				})
			}
		})
	}
}
const updateStstus = () => {
	if (clickRow.value && clickRow.value.id) {
		proxy.$modal.confirm('确定生效?').then(res => {
			let data = { ...clickRow.value }
			data.status = '20'
			contractApi.updateStatus(data).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
	} else {
		proxy.$message.error('请选择合同！')
	}
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			contractApi.delete(deleteRow.id).then(res => {
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
const cancelEffect = () => {
	if (clickRow.value && clickRow.value.id) {
		proxy.$modal.confirm('确定取消生效?').then(res => {
			let data = clickRow.value
			// console.log('取消生效', data)
			contractApi.cancel(data.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
	} else {
		proxy.$message.error('请选择合同！')
	}
}
// 初始化方法
const init = () => {
	// 获取主列表数据
	getList(null)
}
init()
</script>
