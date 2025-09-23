<template>
	<div>
		<vxe-table border :height="tableHeight" :data="tableData">
			<vxe-colgroup title="集港" align="center">
				<vxe-column field="workDte" title="日期" align="center" width="100"></vxe-column>
				<vxe-column field="classId" title="班次" align="center" width="100"></vxe-column>
				<vxe-column field="truckNo" title="集港车号" width="100"></vxe-column>
				<vxe-column field="consignNam" title="代理" width="100"></vxe-column>
				<vxe-column field="cargoNam" title="货名" width="100"></vxe-column>
				<vxe-column field="batch" title="卷号" width="100"></vxe-column>
				<vxe-column field="ioyardNo" title="入库记录号" width="100"></vxe-column>
				<vxe-column field="yardNam" title="库场" width="100"></vxe-column>
				<vxe-column field="locCod" title="垛位" width="100"></vxe-column>
				<vxe-column field="piecesNum" title="件数" width="100" align="right"></vxe-column>
				<vxe-column field="weightWgt" title="吨数" width="100" align="right"></vxe-column>
				<vxe-column field="cargoVol" title="体积" width="100" align="right"></vxe-column>
				<vxe-column field="format" title="规格" width="100"></vxe-column>
				<vxe-column field="compileNo" title="材质" width="100"></vxe-column>
			</vxe-colgroup>
			<vxe-colgroup title="倒运" align="center">
				<vxe-column field="turnWorkDte" title="日期" align="center" width="100"></vxe-column>
				<vxe-column field="turnClassId" title="班次" align="center" width="100"></vxe-column>
				<vxe-column field="trunIoyardNo" title="入库记录号" width="100"></vxe-column>
				<vxe-column field="turnYardNam" title="库场" width="100"></vxe-column>
				<vxe-column field="turnLocCod" title="垛位" width="100"></vxe-column>
				<vxe-column field="turnPiecesNum" title="件数" width="100" align="right"></vxe-column>
				<vxe-column field="turnWeightWgt" title="吨数" width="100" align="right"></vxe-column>
				<vxe-column field="turnCargoVol" title="体积" width="100" align="right"></vxe-column>
			</vxe-colgroup>
			<vxe-colgroup title="装船" align="center">
				<vxe-column field="shipNam" title="船名" width="100"></vxe-column>
				<vxe-column field="shipNo" title="船号" width="100"></vxe-column>
				<vxe-column field="cabinNo" title="舱别" width="100"></vxe-column>
				<vxe-column field="shipPiecesNum" title="件数" width="100" align="right"></vxe-column>
				<vxe-column field="shipWeightWgt" title="吨数" width="100" align="right"></vxe-column>
				<vxe-column field="shipCargoVol" title="体积" width="100" align="right"></vxe-column>
			</vxe-colgroup>
			<vxe-column title="操作" align="center" width="100" fixed="right"></vxe-column>
		</vxe-table>
		<div class="foot" v-show="total > 0">
			<pagination :total="total" v-model:page="pageParams.startPage" v-model:limit="pageParams.pageSize" @pagination="searchClickB" />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import tableParamsStore from '@/store/modules/tableParams'

const props = defineProps({
	searchClick: Function,
})

const tableParams = tableParamsStore()
const tableHeight = computed(() => tableParams.tabTableHeight)
const tableData = ref([])

const total = ref(0)
const pageParams = ref({
	startPage: 1,
	pageSize: 20,
})
const searchClickB = e => {
	const params = Object.assign(pageParams.value, e)
	props.searchClick(params)
}
defineExpose({
	tableData,
	total,
	pageParams,
})
</script>

<style scoped>
.foot {
	display: flex;
	justify-content: space-between;
	padding-left: 5px;
}
</style>
