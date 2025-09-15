<template>
	<div class="select">
		<el-select
			style="width: 100%"
			ref="mySelect"
			v-model="value"
			:filterable="filterable"
			:multiple="multiple"
			:collapse-tags="collapseTags"
			collapse-tags-tooltip
			:reserve-keyword="reserveKeyword"
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
			@focus="focus"
			@remove-tag="removeTag"
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

<script setup name="RemoteSelect">
import { nextTick, onMounted, ref, reactive, computed, watch } from 'vue'
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
		default: '请输入筛选条件...',
	},
	loading: {
		type: Boolean,
		default: false,
	},
	// url类型 {url:'',method:'get'}
	dataConfig: {
		type: Object,
	},
	// type类型传参
	param: {
		type: Object,
	},
	// 是否展开显示
	collapseTags: {
		type: Boolean,
		default: true,
	},
	//列表过滤 已选中数据
	selectFilter: {
		type: Boolean,
		default: false,
	},
	// 是否在选中一个选项后保留当前的搜索关键词
	reserveKeyword: {
		type: Boolean,
		default: false,
	},
})

const options = ref([])
const defaultOptions = ref([])
const mySelect = ref(null)
const hasChanged = ref(false)
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
		emit('update:label', val)
	},
})
const emit = defineEmits(['change', 'blur', 'focus', 'removeTag', 'update:value', 'update:label'])
// 子传父选中值
const changeSelect = value => {
	hasChanged.value = true // 修改之后给标记，不重新调接口
	if (props.multiple) {
		// console.log(value, defaultOptions.value, 'muvalue')
		const labelList = []
		let rowData = []
		value.forEach(item => {
			defaultOptions.value.forEach(i => {
				if (item === i[props.selectValue]) {
					labelList.push(i[props.selectLabel])
					rowData.push(i)
				}
			})
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
const removeTag = value => {
	emit('removeTag', value)
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
let num = ref(0)
const getOptionsByType = async (e = '') => {
	const params = {
		type: props.type,
		labelContent: e,
		valueContent: value.value instanceof Object ? value.value.join() : value.value,
		number: props.number ? props.number : props.remote ? 50 : null,
		param: props.param,
	}
	const res = await api.getRemoteSelect(params)
	let filterData = []
	// 过滤已选中的数据
	num.value++
	options.value = res.data
	res.data.forEach(item => {
		defaultOptions.value.push(item)
	})
	defaultOptions.value = removeDuplicatesByProperty(defaultOptions.value, props.selectValue)
	// console.log('num.value', num.value)
	if (props.selectFilter && num.value !== 1) {
		filterData = res.data.filter(item => {
			return !props.value.includes(item.value)
		})
		// console.log('过滤后的数据', filterData)
		options.value = filterData
		filterData.forEach(item => {
			defaultOptions.value.push(item)
		})
		defaultOptions.value = removeDuplicatesByProperty(defaultOptions.value, props.selectValue)
		// return
	}
}
// 如果且value给了初始值，则根据初始值查询
watch(
	() => props.value,
	async newV => {
		if ((typeof value.value === 'string' && value.value !== '') || (value.value instanceof Object && value.value.length !== 0)) {
			if (hasChanged.value) {
				hasChanged.value = false
				return
			}
			await getOptionsByType()
			num.value = 0
			emit('change', props.multiple ? options.value : options.value[0]) // 将下拉框数据返回，数据结构为[]，多选则返回多个
		}
	}
)
// 如果url改变，重新调接口
watch(
	() => props.dataConfig,
	(newV, oldV) => {
		if (newV.url !== oldV.url) {
			getOptionsByUrl()
			console.trace(newV, old, '重新获取')
		}
	}
)
// 根据传入url查看数据方法
const getOptionsByUrl = async query => {
	const params = {
		url: dataConfig.url + (query == undefined ? '' : query), //get方法query拼url，初始query为undefined则给空，post不拼
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
