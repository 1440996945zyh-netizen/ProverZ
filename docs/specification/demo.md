<script setup>
import Index from './index.vue'

</script>

## Demo 示例

<Index />

::: details Click me to view the code

```js
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
			:border="true"
			:loading="false"
			:total="30"
		/>
	</div>
	<el-drawer v-model="xxxVisible" title="标题" size="50%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="xxxVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="xxx">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
// header--------------------------------------------------------
const selectData = reactive([
	{
		name: '费目名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'itemNm', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '费目类型',
		type: 'select',
		modelValue: 'itemTypeCd',
		span: 4,
		selectLabel: 'dictLabel',
		selectValue: 'dictValue',
		dataConfig: { url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE', dictType: 'FEE_ITEM_TYPE' },
	},
])
// 点击查询的事件
const getList = e => {
	buttonList[1].disabled = true
	console.log('查询拉查询拉', e)
}
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:dict:insert', // 权限
	},
	{
		label: '编辑',
		type: 'primary',
		icon: 'Edit',
		click: () => edit,
		disabled: true, // 是否可点击
		permission: 'master:dict:insert',
	},
])
const xxxVisible = ref(false) // 抽屉
const add = () => {
	xxxVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		console.log('add')
	})
}
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	xxxVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		proxy.setFormData(detailRef.value.formData,editRow) // 第一个参数为给谁赋值，第二个参数为赋什么值
		console.log(editRow, 'edit')
	})
}

const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('保存', detailRef.value.formData)
			xxxVisible.value = false
		}).catch(() => {})
	}
}
// table-------------------------------------------------------------------
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
// 表格数据
const tableData = ref([
	{ id: 10001, date: '2016-05-03', name: 'Tom', age: '179' },
	{ id: 10002, date: '2016-05-02', name: 'Tom', age: '189' },
	{ id: 10003, date: '2016-05-01', name: 'angela', age: '199' },
])
const tableColumns = ref([
	{ label: '日期', prop: 'date' },
	{ label: '姓名', prop: 'name' },
	{ label: '年龄', prop: 'age' },
	{
		prop: '',
		label: '操作',
		width: 150,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						permission:'按钮权限'
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						permission:'按钮权限'
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			console.log('delete', deleteRow)
		})
		.catch(() => {})

}
// 拿到行数据
const clickRow = ref({})
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[1].disabled = false
}
</script>

```

:::

::: details detail.vue

```js
<template>
	<div class="formData">
		<el-form label-position="left" :model="formData" label-width="80" :rules="rules" ref="ruleForm">
			<el-form-item label="date" prop="date">
				<el-input v-model="formData.date" placeholder="请输入date"/>
			</el-form-item>
			<el-form-item label="Name" prop="name">
				<el-input v-model="formData.name" placeholder="请输入Name"/>
			</el-form-item>
			<el-form-item label="age" prop="age">
				<el-input v-model="formData.age" placeholder="请输入age"/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="LowCode">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const collapseActiveNames = ref(['1', '2'])
const formData = reactive({
	name: '',
	date: '',
	age: '',
})
const rules = reactive({
	date: proxy.getRules({ required: true }),
	name: proxy.getRules({ required: true }),
	age: proxy.getRules({
		required: true,
		numberCheck: {
			int: 2,
			dec: 2,
		},
	}),
})

const validate = async () => {
	let flag = false
	console.log(ruleForm, 'ruleForm')
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields() // 第二个form清空
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>


```

:::
