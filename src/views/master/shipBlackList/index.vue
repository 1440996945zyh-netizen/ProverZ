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
        :cellDBLClickEvent="cellDBLClickEvent"
				:total="total"
			/>
		</div>
		<el-drawer v-model="customerVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto" >
					<el-button @click="customerVisible = false">取消</el-button>
					<el-button type="primary" @click="save" >保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="shipBlackList">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/shipBlackList/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const total2 = ref(0)
const customerVisible = ref(false)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const rules = reactive({
	idea: [{ required: true, message: '请输入驳回意见', trigger: 'blur' }],
})
// 表格数据
const checkboxList = ref([])
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
		prop: 'shipName',
		label: '中文船名',
		width: 100,
	},
	{
		prop: 'shipNameEn',
		label: '英文船名',
		width: 110,
	},
	{
		prop: 'shipKindLabel',
		label: '船舶类型',
		width: 100,
	},
	{
		prop: 'nationCode',
		label: '国籍',
		width: 100,
	},
	{
		prop: 'imo',
		label: 'IMO',
		width: 100,
	},
	{
		prop: 'mmsi',
		label: 'MMSI',
		width: 100,
	},
	{
		prop: 'callNo',
		label: '呼号',
		width: 100,
	},
	{
		prop: 'shipLength',
		label: '船长',
		width: 100,
		align: 'right',
	},
	{
		prop: 'shipHeight',
		label: '船高',
		width: 100,
		align: 'right',
	},
	{
		prop: 'shipWidth',
		label: '船宽',
		width: 100,
		align: 'right',
	},
	{
		prop: 'captainName',
		label: '船主',
		width: 100,
	},
	{
		prop: 'netWeight',
		label: '净吨',
		width: 100,
		align: 'right',
	},
	{
		prop: 'totalWeight',
		label: '总吨',
		width: 100,
		align: 'right',
	},
	{
		prop: 'dwt',
		width: 100,
		label: '载重吨',
		align: 'right',
	},
	{
		prop: 'selfWeight',
		label: '船舶自重',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hatchNum',
		label: '舱口数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'mouldedDepth',
		label: '型深',
		width: 100,
		align: 'right',
	},
	{
		prop: 'captainPhone',
		width: 'phoneNumber',
		label: '船长电话',
		align: 'center',
	},
	{
		prop: 'shipTypeLabel',
		label: '船型',
		width: 100,
	},
	{
		prop: 'nationLabel',
		label: '船籍代码',
		width: 100,
	},
	{
		prop: 'cabinLayerNum',
		label: '舱层数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'cabinVolume',
		label: '仓容',
		width: 100,
	},
	{
		prop: 'hatchSize',
		label: '舱口尺寸',
		width: 100,
		align: 'right',
	},
	{
		prop: 'speed',
		label: '船速',
		width: 100,
		align: 'right',
	},
	{
		prop: 'maxSpeed',
		label: '最大船速',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hangerNum',
		label: '吊机数量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'headerCockpitDistance',
		label: '头驾距离',
		width: 100,
	},
	{
		prop: 'hangerLocation',
		label: '吊机位置',
		width: 100,
	},
	{
		prop: 'surplusWaterDepth',
		label: '富余水深',
		width: 100,
		align: 'right',
	},
	{
		prop: 'fullLoadWater',
		label: '满载吃水',
		width: 100,
		align: 'right',
	},
	{
		prop: 'emptyLoadWater',
		label: '空载吃水',
		width: 100,
		align: 'right',
	},
	{
		prop: 'waterVolume',
		label: '淡水容量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hangerLoad',
		label: '机舱位置',
		width: 100,
	},
	{
		prop: 'cabinType',
		label: '舱型',
		width: 100,
	},
	{
		prop: 'hatchCoverTypeLabel',
		label: '舱口盖类型',
		width: 120,
	},
	{
		prop: 'builtYm',
		label: '建造年月',
		width: 'date',
		align: 'center',
	},
	{
		label: '状态',
		prop: 'status',
		width: 'status',
		fixed: 'right',
		render: row => {
			let typeFlag = ''
			typeFlag = row.status == 10 ? 'success' : row.status == 9 ? 'danger' : row.status == 1 ? '' : 'info'
			let textFlag = ''
			textFlag = row.status == 10 ? '审批通过' : row.status == 9 ? '驳回' : row.status == 1 ? '待审核' : '停用'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => textFlag,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width:  240,
		align: 'center',
		fixed: 'right',
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
						permission: 'master:shipBlack:update', // 权限
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
						permission: 'master:shipBlack:delete', // 权限
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
		name: '中文船名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'shipName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 12, // 占位，共24
		selectData: [
			{
				value: '0',
				label: '停用',
			},
			{
				value: '1',
				label: '待审核',
			},
			{
				value: '9',
				label: '驳回',
			},
			{
				value: '10',
				label: '审批通过',
			},
		],
	},
])

const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:shipBlack:add', // 权限
	},
])
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  console.log(clickRow.value)
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  edit(row)
}
const edit = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  title.value = '编辑'
  customerVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.id = ''
    detailRef.value.formData["certificatePath"] = row.certificatePath
    detailRef.value.formData.fileIds = []
    api.getDataById(editRow.id).then(res => {
      let msg = JSON.parse(JSON.stringify(res.data))
      msg.certificatePath = row.certificatePath;
      proxy.setFormData(detailRef.value.formData, msg)
      if (!detailRef.value.formData.fileIds) {
        detailRef.value.formData.fileIds = []
      }
    })
  })
}

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.status = 1
		proxy.$bus.emit('resetFileList')
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
// 驳回

// val == 1 保存事件 val == 2 驳回事件
const save = async () => {
	console.log(detailRef.value.formData)
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
          getList(queryParams.value)
					customerVisible.value = false
				})
			} else if (title.value == '新增') {
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
getList(queryParams.value)
</script>
