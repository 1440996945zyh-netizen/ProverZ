<template>
	<div class="select">
		<el-select
			style="width: 100%"
			ref="mySelect"
			v-model="value"
			:filterable="filterable"
			:multiple="multiple"
			collapse-tags
			collapse-tags-tooltip
			:reserve-keyword="false"
			:max-collapse-tags="maxCollapseTags"
			:remote="true"
			:remote-method="remoteMethod"
			default-first-option
			remote-show-suffix
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

<script setup name="RemoteSelectTable">
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
	 * 当为表格使用该功能时，则必须传入远程函数
	 */
	remoteMethod: {
		type: Function,
		default: null,
	},
	// 默认显示多少条数据，默认为null显示全部
	number: {
		type: Number,
		default: null,
	},
	// 通过type获取下拉框数据
	type: {
		type: String,
		default: '',
	},
	// 编辑情况下传入的默认值
	defaultValue: {
		type: [String, Number],
		default: undefined,
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
	// url类型{url,method}
	dataConfig: {
		type: Object,
	},
	// type类型传参
	param: {
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
		emit('update:value', val)
	},
})
const label = computed({
	get() {
		return props.multiple ? (props.label === '' ? [] : props.label) : props.label
	},
	set(val) {
		// console.log(val, 'vadasdf')
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
		// console.log(rowData, '下拉框回调')
		label.value = labelList
		emit('change', rowData)
	} else {
		const params = options.value.filter(item => {
			if (item[props.selectValue] === value) {
				label.value = item[props.selectLabel]
				return item
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
// 默认远程筛选的函数
const remoteMethod = props.remoteMethod
	? props.remoteMethod
	: query => {
			if (query !== '') {
				if (props.type) {
					getOptionsByType(query)
				} else if (props.dataConfig && props.dataConfig.url) {
					getOptionsByUrl(query)
				}
			} else {
				options.value = []
			}
	  }
// 默认接口查看下拉框数据方法
const getOptionsByType = async (e = '') => {
	const params = {
		type: props.type,
		labelContent: e,
		valueContent: value.value instanceof Object ? value.value.join() : value.value,
		number: props.number ? props.number : props.remote ? 50 : null,
		param: props.param,
	}
	const res = await api.getRemoteSelect(params)
	options.value = res.data
	res.data.forEach(item => {
		defaultOptions.value.push(item)
	})
	defaultOptions.value = removeDuplicatesByProperty(defaultOptions.value, props.selectValue)
}
watch(
	() => props.value,
	newV => {
		// 如果是远程下拉框，且value改变，则重新查
		if ((typeof value.value === 'string' && value.value !== '') || (value.value instanceof Object && value.value.length !== 0)) {
			console.log(value, '改变了吗')
			getOptionsByType()
		}
	}
)
// 如果url改变，重新调接口
watch(
	() => props.dataConfig,
	(newV, oldV) => {
		if (newV.url !== oldV.url) {
			getOptionsByUrl()
		}
	}
)
// 根据传入url查看数据方法
const getOptionsByUrl = async query => {
	const params = {
		url: props.dataConfig.url + (query == undefined ? '' : query), //get方法query拼url，初始query为undefined则给空，post不拼
		method: props.dataConfig.method ? props.dataConfig.method : 'get',
	}
	console.log(params, 'params')
	const res = await request(params)
	options.value = res.data
	defaultOptions.value = res.data // 取到初始值，便于给filter使用。

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
	if (
		props.type &&
		((typeof value.value === 'string' && value.value !== '') || (value.value instanceof Object && value.value.length !== 0))
	) {
		// 有默认值初始才查，否则是空
		console.log(typeof value.value, value.value.length, 'mounted')
		getOptionsByType()
	} else if (
		props.dataConfig &&
		props.dataConfig.url &&
		((typeof value.value === 'string' && value.value !== '') || (value.value instanceof Object && value.value.length !== 0))
	) {
		// 如果传入了url，则走url接口
		getOptionsByUrl()
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
