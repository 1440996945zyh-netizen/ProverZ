<template>
	<div class="select">
		<el-select
			style="width: 100%"
			ref="mySelect"
			v-model="value"
			:filterable="true"
			:filter-method="filterMethod"
			:multiple="multiple"
			collapse-tags
			collapse-tags-tooltip
			:reserve-keyword="false"
			:max-collapse-tags="maxCollapseTags"
			default-first-option
			:clearable="clearable"
			:disabled="disabled"
			:placeholder="placeholder"
			:loading="loading"
			@change="changeSelect"
			@blur="blur"
		>
			<BaseTable
				:tableColumns="tableColumns"
				:tableData="options"
				:border="true"
				:auto-resize="true"
				tableHeight="auto"
				:maxHeight="200"
				:isSelectTable="true"
				:selectLabel="selectLabel"
				:selectValue="selectValue"
			/>
		</el-select>
	</div>
</template>

<script setup name="SelectTable">
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
	size: {
		type: String,
		default: 'default',
	},
	filterable: {
		type: Boolean,
		default: true,
	},
	/**
	 * 当为表格时使用该功能时，则必须传入过滤函数
	 * 初始传入所有数据，记得调用 @ blur使其失去焦点时能恢复所有数据
	 */
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
	selectData: {
		type: Array,
		default: () => [],
	},
})

const options = ref([])
const defaultOptions = ref([])
const mySelect = ref(null)
const EditTableRef = ref()
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		emit('update:value', val)
	},
})
const label = computed({
	get() {
		return props.multiple ? (props.label === '' ? [] : props.label) : props.label
	},
	set(val) {
		console.log(val, 'vadasdf')
		emit('update:label', val)
	},
})
const emit = defineEmits(['change', 'changeEditTable', 'blur', 'update:value', 'update:label'])
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
			rowData = options.value.filter(i => {
				if (item === i[props.selectValue]) {
					return i
				}
			})
		})
		console.log(rowData, '下拉框回调')
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
const valueQuery = ref('') // 拿到筛选输入值，便于判断
// 下拉表格默认本地筛选方法
const filterMethod = query => {
	if (query) {
		valueQuery.value = query
		typeof value.value === 'string' ? (value.value = query) : '' // 自定义方法需要给绑定值赋值，不然会有问题
		options.value = defaultOptions.value.filter(item => {
			return item[props.selectLabel].toLowerCase().includes(query.toLowerCase())
		})
		console.log(query, options.value, 'qurere')
	} else {
		console.log('33333')
		if (value.value === valueQuery.value) typeof value.value === 'string' ? (value.value = '') : '' // 如果当前value为输入的value，则清空
		options.value = defaultOptions.value
	}
}
// 下拉表格，重写filter函数
const myFilterMethod = props.filterMethod ? props.filterMethod : filterMethod

// 如果url改变，重新调接口
watch(
	() => props.dataConfig,
	(newV, oldV) => {
		if (newV.url !== oldV.url) {
			getOptionsByUrl()
			console.log(newV, old, '重新获取')
		}
	}
)

// 根据传入url查看数据方法
const getOptionsByUrl = async () => {
	const params = {
		url: props.dataConfig.url ? props.dataConfig.url : `/api/internal/public/getLocalSelect/${props.dataConfig.type}`,
		method: props.dataConfig.method ? props.dataConfig.method : 'get',
		data: props.dataConfig.params,
	}
	const res = await request(params)
	options.value = res.data
	defaultOptions.value = res.data // 取到初始值，便于给filter使用。

	// options.value = [
	// 	{ label: '你好', value: '1', sex: 'A' },
	// 	{ label: '我在', value: '2', sex: 'B' },
	// 	{ label: '干嘛', value: '3', sex: 'C' },
	// ]
	// defaultOptions.value = [
	// 	{ label: '你好', value: '1', sex: 'A' },
	// 	{ label: '我在', value: '2', sex: 'B' },
	// 	{ label: '干嘛', value: '3', sex: 'C' },
	// ]
}
onMounted(() => {
	if (props.dataConfig && (props.dataConfig.url || props.dataConfig.type)) {
		// 如果传入了url，则走url接口
		console.log('mounted')
		getOptionsByUrl()
	} else {
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
