<template>
	<div class="demo-collapse">
		<el-container>
			<el-aside width="50%">
				<BaseTable
					ref="baseTable"
					:tableHeight="tableHeight"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:loading="false"
					:border="true"
					:showPagination="false"
				/>
			</el-aside>
			<el-aside width="50%">
				<BaseTable
					ref="baseTable"
					:tableHeight="tableHeight"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:loading="false"
					:border="true"
					:showPagination="false"
				/>
			</el-aside>
		</el-container>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import request from '@/utils/request'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import BaseTable from '@/components/BaseTable/index.vue'

const baseTable = ref()
const tableColumns = ref([
	{ label: '日期', prop: 'invoiceName' },
	{ label: '班次', prop: 'invoiceName' },
	{ label: '操作过程', prop: 'invoiceName' },
	{ label: '子过程', prop: 'invoiceName' },
	{ label: '从', prop: 'invoiceName' },
	{ label: '到', prop: 'invoiceName' },
	{ label: '重量', prop: 'invoiceName' },
	{ label: '件数', prop: 'invoiceName' },
	{ label: '备注', prop: 'invoiceName' },
])
const tableData = reactive([])

const tableHeight = reactive(window.innerHeight - 280)
const dictData = reactive([])
const getDict = () => {
	request({
		url: `/api/internal/public/getDictListByType/CUSTOMER_TYPE`,
		method: 'get',
	}).then(res => {
		dictData.value = res.data
	})
}

onMounted(() => {
	// getDict()
})
defineExpose({})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
