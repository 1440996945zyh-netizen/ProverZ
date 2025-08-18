<template>
	<el-popover :visible="visible" :width="400">
		<vxe-table
			border
			show-overflow
			:data="tableData"
			:column-config="{ resizable: true }"
			:edit-config="{ trigger: 'click', mode: 'cell', autoClear: false }"
			height="300"
		>
			<vxe-column field="equipmentTypeName" title="机械类型" :width="100"></vxe-column>
			<vxe-column field="num" title="编号/数量" :edit-render="{ autofocus: '.el-input__inner' }">
				<template #default="{ row }">
					<span>{{ row.num }}</span>
<!--					<span v-else>{{ format(row) }}</span>-->
				</template>
				<template #edit="{ row }">
					<el-input
						v-model="row.num"
						type="text"
						@input="row.num = proxy.verify('positiveNumber', row.num)"
					></el-input>
				</template>
			</vxe-column>
		</vxe-table>
		<div class="button">
			<el-button type="primary" @click="submit">确定</el-button>
			<el-button @click="visible = false">取消</el-button>
		</div>
		<template #reference>
			<el-input v-model="value" @click="visibleShow" :disabled="disabled"></el-input>
		</template>
	</el-popover>
</template>

<script setup name="MechaniacalType">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import Select from '@/components/Select/index.vue'
import publicApi from '@/api/public/index.js'
const emit = defineEmits(['change', 'update:value'])
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const props = defineProps({
	workPlanId: {
		type: String,
	},
	workPositionCode: {
		type: String,
	},
	value: {
		type: String,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		console.log('set', val)
		emit('update:value', val)
	},
})
const num = ref(0)
const visibleShow = () => {
	num.value++
	visible.value = true
	console.log('有值吗', tableData.value, num.value)
	if (num.value == 1) {
		getEquipmentDispatch()
	}
	init()
}
// watch(
// 	() => props.workPlanId,
// 	(newV, oldV) => {
// 		console.log('新值', newV)
// 		console.log('旧值', oldV)
// 		getEquipmentDispatch()
// 	},
// 	{ deep: true }
// )
const visible = ref(false)
// 表格数据
const tableData = ref([])
const equipData = ref([])
const init = () => {
	publicApi.getLocalSelect({ type: 'MAC', macTypeCode: '0007' }).then(res => {
		equipData.value = res.data
	})
}

const getEquipmentDispatch = () => {
	console.log(props, 'props.workPlanId')
	tableData.value = []
	publicApi.getEquipmentDispatch({ workPlanId: props.workPlanId, workPositionCode: props.workPositionCode }).then(res => {
		JSON.parse(JSON.stringify(res.data)).forEach(item => {
			if (item.equipmentIds && item.equipmentNames) {
				item.equipmentIds = item.equipmentIds.split(',')
				item.equipmentNames = item.equipmentNames.split(',')
			}
			tableData.value.push(item)
		})
		emit('change', res.data) // 将数据返回
		console.log(555, res.data)
	})
}

const submit = () => {
	document.body.click()
	let str = ''
	let arr = []
	JSON.parse(JSON.stringify(tableData.value)).forEach(item => {
		if (item.num) {
			str = str + item.equipmentTypeName + item.num + ','
		}
		if (item.equipmentNames && item.equipmentNames.length > 0) {
			str = str + item.equipmentNames.join() + ','
		}

		if (item.equipmentIds) {
			item.equipmentIds = item.equipmentIds.join()
		}
		if (item.equipmentNames) {
			item.equipmentNames = item.equipmentNames.join()
		}
		arr.push(item) // 处理机械数据
		value.value = str.slice(0, -1)
	})
	visible.value = false
	emit('change', arr)
}
const format = row => {
	return row.equipmentNames ? row.equipmentNames.join() : ''
}
const closePopover = () => {
	visible.value = false
	tableData.value.forEach(item => {
		item.num = ''
		item.equipmentIds = []
		item.equipmentNames = []
	})
}
// init()
// getEquipmentDispatch()
defineExpose({
	tableData,
	value,
	closePopover,
	getEquipmentDispatch,
	num,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.button {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
}
</style>
<style>
.vxe-select--panel {
	z-index: 9997 !important;
}
.vxe-input--panel.type--date,
.vxe-input--panel.type--month,
.vxe-input--panel.type--week,
.vxe-input--panel.type--year {
	z-index: 9998 !important;
}
</style>
