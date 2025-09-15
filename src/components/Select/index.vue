<template>
	<div class="select">
		<el-select
			style="width: 100%"
			ref="mySelect"
			v-model="value"
			:filterable="filterable"
			:filter-method="filterMethod"
			:multiple="multiple"
			collapse-tags
			collapse-tags-tooltip
			:reserve-keyword="false"
			:max-collapse-tags="maxCollapseTags"
			default-first-option
			:allow-create="allowCreate"
			:clearable="clearable"
			:disabled="disabled"
			:placeholder="placeholder"
			:loading="loading"
			@change="changeSelect"
			@blur="blur"
			@focus="focus"
		>
			<el-option
				v-for="item in options"
				:key="item[selectValue]"
				:label="item[selectLabel]"
				:value="item[selectValue]"
				:disabled="item.disabled"
			></el-option>
		</el-select>
	</div>
</template>

<script setup name="Select">
import { nextTick, onMounted, ref, reactive, defineProps, computed, watch } from 'vue'
import BaseTable from '../BaseTable/index.vue'
import api from '../../api/public/index.js'
import request from '../../utils/auth/request'
import { removeDuplicatesByProperty } from '../../utils/common/data'
const props = defineProps({
	value: {
		type: [Array, String],
		default: '',
	},
	label: {
		type: [Array, String],
		default: '',
	},
	// 是否为selectTable
	selectTable: {
		type: Boolean,
		default: false,
	},
	// selectTable的表头,记得要传宽度
	tableColumns: {
		type: Array,
		default: () => [],
	},
	selectLabel: {
		type: String,
		default: 'label',
	},
	selectValue: {
		type: String,
		default: 'value',
	},
	selectData: {
		type: Array,
	},
	size: {
		type: String,
		default: 'default',
	},
	filterable: {
		type: Boolean,
		default: true,
	},
	filterMethod: {
		type: Function,
		default: null,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	// 多选最多显示几个tags
	maxCollapseTags: {
		type: Number,
		default: 3,
	},
	// 手动输入创建条目
	allowCreate: {
		type: Boolean,
		default: false,
	},
	clearable: {
		type: Boolean,
		default: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: '请选择...',
	},
	loading: {
		type: Boolean,
		default: false,
	},
	dataConfig: {
		type: Object,
	},
})

const options = ref([])
const defaultOptions = ref([])
const mySelect = ref(null)
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		if (val) {
			emit('update:value', val)
		} else {
			emit('update:value', '')
			emit('update:label', '')
		}
	},
})
const label = computed({
	get() {
		return props.multiple ? (props.label === '' ? [] : props.label) : props.label
	},
	set(val) {
		emit('update:label', val)
	},
})
const emit = defineEmits(['change', 'blur', 'focus', 'update:value', 'update:label'])
// 子传父选中值
const changeSelect = value => {
	if (props.multiple) {
		const labelList = []
		value.forEach(item => {
			defaultOptions.value.forEach(i => {
				if (item === i[props.selectValue]) {
					labelList.push(i[props.selectLabel])
				}
			})
		})
		let rowData = []
		value.forEach(item => {
			rowData.push(
				options.value.filter(i => {
					if (item === i[props.selectValue]) {
						return i
					}
				})[0]
			)
		})
		label.value = labelList
		emit('change', rowData)
	} else {
		const params = options.value.filter(item => {
			if (item[props.selectValue] === value) {
				label.value = item[props.selectLabel]
				return item[props.selectLabel]
			}
		})[0]
		emit('change', params)
	}
}
const blur = () => {
	setTimeout(() => {
		// 关闭下拉框调用，下拉框数据初始化
		emit('blur')
	}, 500)
}
const focus = () => {
	emit('focus')
}
// 如果url改变，重新调接口
watch(
	() => props.dataConfig,
	(newV, oldV) => {
		if ((newV.url && newV.url !== oldV.url) || (newV.params && newV.params.parent !== oldV.params.parent)) {
			getOptionsByUrl()
			// value.value = ''
		}
	}
)
// 如果数据源改变，重新赋值
watch(
	() => props.selectData,
	newV => {
		options.value = newV
		defaultOptions.value = newV
		console.log('数据源改变')
	},
	{ deep: true, immediate: true }
)
// 根据传入url查看数据方法
const getOptionsByUrl = async () => {
	const params = {
		url: props.dataConfig.url ? props.dataConfig.url : `/api/internal/public/getLocalSelect`,
		method: props.dataConfig.method ? props.dataConfig.method : 'get',
		params: props.dataConfig.params,
	}
	const res = await request(params)
	if (props.dataConfig.dictType) {
		options.value = res.data[props.dataConfig.dictType]
		defaultOptions.value = res.data[props.dataConfig.dictType] // 取到初始值，便于给filter使用。
	} else {
		options.value = res.data
		defaultOptions.value = res.data // 取到初始值，便于给filter使用。
	}

	// options.value = [
	// 	{ label: 'A', value: '1' },
	// 	{ label: 'B', value: '2' },
	// 	{ label: 'C', value: '3' },
	// ]
	// defaultOptions.value = [
	// 	{ label: 'A', value: '1' },
	// 	{ label: 'B', value: '2' },
	// 	{ label: 'C', value: '3' },
	// ]
}
onMounted(() => {
	if (props.dataConfig && (props.dataConfig.url || props.dataConfig.params)) {
		// 如果传入了url，则走url接口
		// console.log('mounted')
		getOptionsByUrl()
	} else if (props.selectData) {
		// 如果是本地写死的情况，自己传进来
		options.value = props.selectData
		defaultOptions.value = props.selectData
	}
})
defineExpose({
	options,
})
</script>

<style lang="scss" scoped>
.select {
	width: 100%;
}
</style>
