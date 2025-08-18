<template>
	<EditTable
		:name="'费率标准'"
		ref="rateInfoForm"
		:tableData="rateList"
		:tableColumns="rateInfoColumns"
		:cellClickEvent="rateDtailClickEvent"
		:headerCellClickEvent="rateDtailCellClickEvent"
		:headerCellClassName="dtailCellClassName"
		:editRules="editRulesRate"
		:rowConfig="rowConfig"
		:disabledKey="'rowDisabled'"
	/>
</template>

<script setup name="ContractDrawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { ElButton, ElInput } from 'element-plus'
import EditTable from '@/components/EditTable'
import publicApi from '@/api/public/index'
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
const activeNames = ['serveRate']
// 列表数据
const rateList = ref([])
const rateInfoForm = ref() //服务费率
// 费率
const rateInfo = ref({
	id: null,
	contractId: null, // 合同id
	cargoCode: null, // 货物
	cargoName: null,
	rateItemCode: null, // 费目
	rateItemName: null,
	tradeType: null, // 贸别
	serviceContentId: null, // 服务内容
	serviceContentName: null,
	paymentTypeCode: null, // 账期类型
	paymentTypeName: null,
	paymentDays: null, // 账期天数
	rate: null, // 费率值
	tax: null, // 税率值
	unitCode: null, //计费单位
	unitName: null,
	rateLadderList: [],
})
// 费率标准表头
const rateInfoColumns = reactive([
	{
		label: '货物',
		prop: 'cargoName',
	},
	{
		label: '费目',
		prop: 'rateItemName',
	},
	{
		label: '服务内容',
		prop: 'serviceContentName',
		sortable: true,
	},
	{
		label: '内外贸',
		prop: 'tradeType',
		sortable: true,
	},
	{
		label: '进出口',
		prop: 'impExp',
	},
	{
		label: '免堆存期',
		prop: 'freeStorageDays',
		align: 'right',
		render: row => {
			return [
				h(
					ElInput,
					{
						disabled: row.rateItemCode == 'MS00240' ? false : true,
						modelValue: row.freeStorageDays,
						'onUpdate:modelValue': val => {
							row.freeStorageDays = val
						},
					},
					{}
				),
			]
		},
	},

	{ label: '费率值', prop: 'rate', editType: 'input', editRender: {}, align: 'right' },
	{
		label: '计费单位',
		prop: 'unitName',
	},
	{
		label: '税率（%）',
		prop: 'tax',
	},
	{
		prop: '',
		label: '添加',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteDataRate(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						// disabled: true,
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 删除单条费率
const deleteDataRate = val => {
	console.log('删除单条费率', val)
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			// 过滤要删除的数据重新赋值
			rateList.value.splice(val.index, 1)
			trateClear()
		})
		.catch(err => {})
}
// 新增费率
const rateDtailCellClickEvent = even => {
	// if (even.column.field == '') {
	// 	rateList.value.push(JSON.parse(JSON.stringify(rateInfo.value)))
	// }
}
const editRulesRate = ref({
	rateItemCode: proxy.getRules({ required: true }),
	paymentTypeCode: proxy.getRules({ required: true }),
	paymentDays: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 0,
		},
	}),
	tradeType: proxy.getRules({ required: true }),
	cargoCode: proxy.getRules({ required: true }),
	rate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	unitCode: proxy.getRules({
		required: true,
	}),
	tax: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
})
// 重置表单
const resetForm = () => {
	rateList.value = []
}
defineExpose({
	rateList,
	resetForm,
})
</script>

<style lang="scss" scoped></style>
