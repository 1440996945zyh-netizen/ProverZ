<template>
	<div class="equipment-detail-wrapper">
		<!-- 新增时使用折叠面板 -->
		<Add v-if="isAddMode" ref="addRef" :readonly="readonly" />
		<!-- 修改/查看时使用标签页 -->
		<Main v-else ref="mainRef" :formData="formData" :readonly="readonly" :mode="mode" @update:formData="handleFormDataUpdate" @saved="handleSaved" />
	</div>
</template>

<script setup name="equipmentInfoDetail">
import { ref, reactive, watch, getCurrentInstance, computed } from 'vue'
import Main from './equipmentMain.vue'
import Add from './add.vue'

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false,
	},
	mode: {
		type: String,
		default: 'add', // 'add' 或 'edit'
	},
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()
const mainRef = ref(null)
const addRef = ref(null)

// 判断是否为新增模式
const isAddMode = computed(() => {
	return props.mode === 'add'
})

// 表单数据
const formData = reactive({
	id: null,
	equipCode: '',
	equipName: '',
	equipBigCategoryId: null,
	equipBigCategoryName: '',
	equipMiddleCategoryId: null,
	equipMiddleCategoryName: '',
	equipSmallCategoryId: null,
	equipSmallCategoryName: '',
	specificCode: '',
	modelNumber: '',
	equipSystemCode: '',
	equipTechState: null,
	equipTechStateName: '',
	equipState: null,
	equipStateName: '',
	unit: null,
	unitName: '',
	insuranceDate: '',
	useCompanyId: null,
	useCompanyName: '',
	useOrgId: null,
	useOrgName: '',
	responsiCode: null,
	responsiName: '',
	isParticular: '0',
	remark: '',
	sourceType: null,
	sourceTypeName: '',
	factoryNumber: '',
	equipWeight: null,
	purchaseTime: '',
	usageTime: '',
	supplierUnit: '',
	manufacturer: '',
	emissionStandard: '',
	enginePower: null,
	assetsNo: '',
	originalValue: null,
	netValue: null,
	depreciationPeriod: null,
	depreciatedPeriod: null,
	// 特种设备信息
	particularRegistrationCode: '',
	specialDiscoverCycle: null,
	certifiType: null,
	certifiTypeName: '',
	certifiCode: '',
	releaseDate: '',
	certifiUser: '',
	expireDate: '',
	validDate: null,
	certifiState: null,
	specialRemark: '',
})

// 处理表单数据更新（仅用于修改/查看模式）
const handleFormDataUpdate = (data) => {
	Object.keys(data).forEach(key => {
		if (formData.hasOwnProperty(key)) {
			formData[key] = data[key]
		}
	})
}

// 获取当前活动的组件引用
const getActiveRef = () => {
	return isAddMode.value ? addRef.value : mainRef.value
}

// 获取当前活动的formData
const getActiveFormData = () => {
	if (formData.id) {
		// 修改/查看模式：使用 index.vue 的 formData
		return formData
	} else {
		// 新增模式：使用 add.vue 的 formData
		return addRef.value?.formData || formData
	}
}

// 验证表单
const validate = async () => {
	const activeRef = getActiveRef()
	if (activeRef && typeof activeRef.validate === 'function') {
		return await activeRef.validate()
	}
	return true
}

// 重置表单
const resetForm = () => {
	// 先重置子组件的表单
	const activeRef = getActiveRef()
	if (activeRef && typeof activeRef.resetForm === 'function') {
		activeRef.resetForm()
	}
	// 再重置主表单数据
	Object.keys(formData).forEach(key => {
		if (key === 'id') {
			formData[key] = null
		} else if (key === 'isParticular') {
			formData[key] = '0'
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else {
			formData[key] = ''
		}
	})
}

// 加载编辑时的下拉列表数据（这个方法会被父组件调用）
const loadEditCategoryData = () => {
	const activeRef = getActiveRef()
	if (activeRef && typeof activeRef.loadEditCategoryData === 'function') {
		activeRef.loadEditCategoryData()
	}
}

// 计算属性：获取当前活动的formData
const currentFormData = computed(() => {
	return getActiveFormData()
})

// 处理保存成功事件
const handleSaved = () => {
	emit('saved')
}

defineExpose({
	get formData() {
		return getActiveFormData()
	},
	validate,
	resetForm,
	loadEditCategoryData,
	get mainRef() {
		return mainRef.value
	},
})
</script>

<style scoped lang="scss">
.equipment-detail-wrapper {
	width: 100%;
	height: 100%;
}
</style>
