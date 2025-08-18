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
			/>
		</div>
		<el-drawer v-model="detailVisible" :title="title" size="30%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
</template>

<script setup name="serviceContent">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/serviceContent/index.js'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
// header检索参数
const selectData = reactive([
	{
		name: '服务名、助记码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'serviceNm', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '作业过程',
		type: 'select',
		modelValue: 'workProcessCd',
		span: 12,
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			params: { type: 'MAIN_WORK_PROCESS' },
		},
	},
])
const queryParams = ref({
	// 检索参数
})

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getlist(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:serviceContent:add', // 权限
	},
])
const title = ref('')
// 新增事件
const add = () => {
	title.value = '新增'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 新建清空id
	})
}
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = ref([
	{
		prop: 'serviceNm',
		label: '服务名',
	},
	{
		prop: 'processNms',
		label: '作业过程',
	},
  {
    prop: 'inOut',
    label: '进出口',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: 'success',
            link: true,
          },
          {
            default: () => row.inOut=='IN'?"进口":"出口",
          }
        )
      ]
    },
  },{
    prop: 'inOutStorage',
    label: '出入库/直取',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: 'success',
            link: true,
          },
          {
            default: () => row.inOutStorage=='1'?"出入库":"直取",
          }
        )
      ]
    },
  },
	{
		prop: 'remark',
		label: '备注',
	},
	{
		prop: '',
		label: '操作',
		width: 200,
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
						permission: 'master:serviceContent:update', // 权限
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
						permission: 'master:serviceContent:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getbyid(editRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData, res.data)
			detailRef.value.formData.processNms = detailRef.value.formData.processNms.split(',')
			detailRef.value.formData.processList = detailRef.value.formData.processStr.split(',')
      detailRef.value.formData.inOutStorage =  detailRef.value.formData.inOutStorage+"";
      detailRef.value.formData.inOut =  detailRef.value.formData.inOut+"";
		})
	})
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
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		params.processNms = params.processNms.join()
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
// 默认查询
getList(queryParams.value)
</script>
