<template>
	<div>
		<div class="clean">
			<div class="clean_date">选择清场日期：</div>
			<div style="width: 200px">
				<el-date-picker
					v-model="cleanObj.workDate"
					type="date"
					value-format="YYYY-MM-DD"
					format="YYYY-MM-DD"
					placeholder="请选择清场日期"
					:clearable="false"
				></el-date-picker>
			</div>

			<div class="clean_class">班次：</div>
			<Select
				class="selectClass"
				v-model:value="cleanObj.classCode"
				v-model:label="cleanObj.className"
				:selectLabel="'dictLabel'"
				:selectValue="'dictValue'"
				placeholder="班次"
				:dataConfig="{
					url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
				}"
				:clearable="false"
			/>
		</div>
		<div class="cargoInfo">票货：{{ cleanData.cargoInfoLabel }}</div>
		<div class="cargoInfo" v-if="cleanData.ton !== '0'">在{{ cleanData.storehouseName }}库上尚有结存，要强制对其清场吗？</div>
	</div>
</template>

<script setup>
import Select from '@/components/Select'
import api from '@/api/produce/portTrends/index.js'
const cleanObj = ref({
	cargoInfoId: '', //票货id
	storehouseId: '', //库场id
	regionId: '', //区域id
	massId: '', //垛位id
	workDate: '', //作业日期
	classCode: '', //作业班次code
	className: '', //作业班次名称
})
const cleanData = ref({
	cargoInfoLabel: '', //票货信息
	ton: '', //重量
	storehouseName: '', //场地
})
// 获取班次和当前班次接口
const getWorkShift = async () => {
	const res = await api.getCurrentShift()
	// console.log('获取当前时间班次', res)
	cleanObj.value.workDate = res.data.workDate
	cleanObj.value.classCode = res.data.classCode
	cleanObj.value.className = res.data.className
}
getWorkShift()
defineExpose({
	cleanObj,
	cleanData,
})
</script>

<style lang="scss" scoped>
.clean {
	display: flex;
	height: 40px;
	line-height: 40px;
	.clean_date {
		width: 115px;
	}
	.clean_class {
		width: 50px;
		margin-left: 10px;
	}
	.selectClass {
		width: 200px;
	}
}
.cargoInfo {
	height: 40px;
	line-height: 40px;
	font-size: 16px;
}
</style>
