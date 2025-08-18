<template>
	<div>
		<div class="clean">
			<div class="clean_date">选择完货日期：</div>
			<div style="width: 200px">
				<el-date-picker
					v-model="cleanObj.workDate"
					type="date"
					value-format="YYYY-MM-DD"
					format="YYYY-MM-DD"
					placeholder="请选择完货日期"
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
	</div>
</template>

<script setup>
import Select from '@/components/Select'
import api from '@/api/produce/portTrends/index.js'
const cleanObj = ref({
	cargoInfoId: '', //票货id
	workDate: '', //作业日期
	classCode: '', //作业班次code
	className: '', //作业班次名称
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
