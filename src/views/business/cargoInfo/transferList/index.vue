<template>
	<div>
		<BaseTable
			style="padding: 0px"
			ref="baseTable"
			:showSearchHeader="false"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:total="total"
      disabledKey="rowDisabled"
		/>
	</div>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/cargoInfo/index'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const tableData = ref([])
const transferRef = ref(null)
const transferTitle = ref('货权转移')
const transferVisible = ref(false) //货权转移抽屉
const emit = defineEmits(['editEmit', 'deleteEmit'])
const tableColumns = ref([
  { label: '源票货号', prop: 'sourceCargoInfoNo',width: 160 , align: 'center'},
  { label: '目标票货号', prop: 'targetCargoInfoNo',width: 160 , align: 'center'},
	{ label: '目标货主', prop: 'cargoOwnerName', align: 'center' },
	/*{ label: '目标货代', prop: 'cargoAgentName' },*/
	{ label: '货转日期', prop: 'transferDate', align: 'center', width: 120 },
	/*{ label: '货堆费起算日期', prop: 'storageDate', align: 'center', width: 150 },*/
	{ label: '货转件数', prop: 'quantity', align: 'right' , width: 100},
	{ label: '货转重量', prop: 'ton', align: 'right' , width: 120},
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
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:cargoTransfer:update', // 权限
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
							transferDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Edit',
						permission: 'business:cargoTransfer:delete', // 权限
            disabled: row.status == '10',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
/** 删除按钮操作 */
function transferDelete(row) {
	console.log('删除', row)
	const idList = row.id || ids.value
	proxy.$modal
		.confirm('确定删除目标货主为"' + row.cargoOwnerName + '"的数据项?')
		.then(function () {
			return api.deleteTransfer(idList)
		})
		.then(() => {
			// getList(queryParams.value);
			proxy.$modal.msgSuccess('删除成功')
			emit('deleteEmit')
		})
		.catch(() => {})
}
// 编辑数据回显
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	emit('editEmit', editRow)
}

defineExpose({
	tableData,
})
</script>

<style lang="scss" scoped></style>
