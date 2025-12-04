<template>
	<!-- 搜索框封装 -->
	<div>
		<div class="selectBox" id="selectBox">
			<el-row class="left" id="left" :style="leftRowWidth">
				<el-col name="header" v-for="item in showSelectData" :span="item.span" style="padding-right: 10px" :key="item.modelValue">
					<el-input
						:placeholder="item.name"
						v-if="item.type == 'input'"
						:maxlength="item.maxlength ? item.maxlength : 20"
						v-model="searchData[item.modelValue]"
						clearable
						@keyup.enter="searchHandler"
					></el-input>
					<Select
						v-if="item.type == 'select'"
						v-model:value="searchData[item.modelValue]"
						v-model:label="searchData[item.modelLabel]"
						:selectLabel="item.selectLabel ? item.selectLabel : 'label'"
						:selectValue="item.selectValue ? item.selectValue : 'value'"
						:dataConfig="item.dataConfig"
						:selectData="item.selectData"
						:filterable="item.filterable ? item.filterable : true"
						:filter-method="item.myFilterMethod"
						:multiple="item.multiple"
						:max-collapse-tags="item.maxCollapseTags"
						:remote="item.remote"
						:clearable="item.clearable ? item.clearable : true"
						:disabled="item.disabled"
						:placeholder="item.name"
						:loading="item.loading"
						@change="row => (item.change ? item.change(row) : '')"
					/>
					<RemoteSelect
						v-else-if="item.type == 'remoteSelect'"
						v-model:value="searchData[item.modelValue]"
						v-model:label="searchData[item.modelLabel]"
						:selectLabel="item.selectLabel ? item.selectLabel : 'label'"
						:selectValue="item.selectValue ? item.selectValue : 'value'"
						:dataConfig="item.dataConfig"
						:number="item.number"
						:filterable="item.filterable ? item.filterable : true"
						:filter-method="item.myFilterMethod"
						:multiple="item.multiple"
						:max-collapse-tags="item.maxCollapseTags"
						:remote="item.remote"
						:clearable="item.clearable ? item.clearable : true"
						:disabled="item.disabled"
						:placeholder="item.name"
						:loading="item.loading"
						:type="item.dataType"
						@change="row => (item.change ? item.change(row) : '')"
					/>
					<el-date-picker
						v-if="item.type == 'year'"
						v-model="searchData[item.modelValue]"
						type="year"
						value-format="YYYY"
						format="YYYY"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'date'"
						v-model="searchData[item.modelValue]"
						type="date"
						value-format="YYYY-MM-DD"
						format="YYYY-MM-DD"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'month'"
						v-model="searchData[item.modelValue]"
						type="month"
						value-format="YYYY-MM"
						format="YYYY-MM"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'datetime'"
						v-model="searchData[item.modelValue]"
						type="datetime"
						value-format="YYYY-MM-DD hh:mm:ss"
						format="YYYY-MM-DD hh:mm:ss"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'daterange'"
						v-model="searchData[item.modelValue]"
						type="daterange"
						unlink-panels
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
						:shortcuts="item.shortcuts.length > 0 ? item.shortcuts : shortcuts"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'datetimerange'"
						v-model="searchData[item.modelValue]"
						type="datetimerange"
						unlink-panels
						range-separator="至"
						start-placeholder="开始时间"
						end-placeholder="结束时间"
						value-format="YYYY-MM-DD HH:mm"
						format="YYYY-MM-DD HH:mm"
						:placeholder="item.name"
					></el-date-picker>
					<nvDatePicker
						v-if="item.type == 'nativedate'"
						v-model:value="searchData[item.modelValue]"
						:typeFlag="item.type"
						:placeholder="item.name"
					/>
				</el-col>
			</el-row>
			<div id="button">
				<el-button
					@click="getMore"
					v-if="
						(buttonList.length > 0 && selectData.length > (props.showNum ? props.showNum : 3)) ||
						(buttonList.length === 0 && selectData.length > (props.showNum ? props.showNum : 6))
					"
				>
					更多查询
					<i class="el-icon-caret-bottom"></i>
				</el-button>
				<el-button type="primary" icon="Search" @click="searchHandler" ref="searchDom" v-if="showSearch">查询</el-button>
				<el-button icon="RefreshRight" @click="resetSearch" ref="searchDom" v-if="showReset">重置</el-button>
				<!-- 高级查询 -->
				<AdvancedQuery
					ref="advancedQueryRef"
					:isShowAdvancedQuery="isShowAdvancedQuery"
					:id="id"
					:queryAdvancedParams="queryAdvancedParams"
				/>
			</div>
			<div class="right" id="right">
				<template v-if="!showToolTip">
					<el-button
						v-for="item in filterButton"
						:key="item.label"
						:type="item.type"
						:icon="item.icon"
						@click="buttonClick(item.click)"
						:disabled="item.disabled"
						v-hasPermi="[item.permission]"
					>
						{{ item.label }}
					</el-button>
				</template>
				<template v-else>
					<el-tooltip v-for="item in filterButton" :key="item.label" :content="item.label" placement="top-start">
						<el-button
							:type="item.type"
							:icon="item.icon"
							@click="buttonClick(item.click)"
							:disabled="item.disabled"
							v-hasPermi="[item.permission]"
						>
							<!-- {{ item.label }} -->
						</el-button>
					</el-tooltip>
				</template>
				<el-dropdown v-for="item in dropdownSelect" :key="item.label" placement="bottom-start" style="margin-left: 10px">
					<el-button :icon="item.icon" v-hasPermi="[item.permission]" :type="item.type">
						{{ !showToolTip ? item.label : '' }}
					</el-button>
					<template v-slot:dropdown>
						<el-dropdown-menu>
							<el-dropdown-item
								v-for="buttonItem in item.buttonList"
								:key="buttonItem.label"
								@click="buttonClick(buttonItem.click)"
								v-hasPermi="[buttonItem.permission]"
							>
								{{ buttonItem.label }}
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<el-select
					:placeholder="'请选择' + item.name"
					v-for="item in endSelect"
					:key="item.name"
					v-model="searchData[item.modelValue]"
					@change="i => handleChange(i, item.selectData)"
					filterable
					clearable
					style="width: 150px; margin-left: 10px"
				>
					<el-option
						v-for="opt in item.selectData"
						:key="opt[item.selectValue]"
						:disabled="opt.disabled"
						:label="opt[item.selectLabel]"
						:value="opt[item.selectValue]"
					></el-option>
				</el-select>
			</div>
		</div>
		<!-- 高级查询 -->
		<div class="selectBox" v-show="showMore" style="border-top: none">
			<el-row class="left_high">
				<el-col v-for="item in moreSelectData" :span="item.span" style="padding-right: 10px" :key="item.modelValue">
					<el-input
						:placeholder="item.name"
						v-if="item.type == 'input'"
						v-model="searchData[item.modelValue]"
						clearable
						@keyup.enter="searchHandler"
					></el-input>
					<Select
						v-if="item.type == 'select'"
						v-model:value="searchData[item.modelValue]"
						v-model:label="searchData[item.modelLabel]"
						:selectLabel="item.selectLabel ? item.selectLabel : 'label'"
						:selectValue="item.selectValue ? item.selectValue : 'value'"
						:dataConfig="item.dataConfig"
						:selectData="item.selectData"
						:filterable="item.filterable ? item.filterable : true"
						:filter-method="item.myFilterMethod"
						:multiple="item.multiple"
						:max-collapse-tags="item.maxCollapseTags"
						:remote="item.remote"
						:clearable="item.clearable != null || item.clearable != undefined || item.clearable != '' ? item.clearable : true"
						:disabled="item.disabled"
						:placeholder="item.name"
						:loading="item.loading"
						@change="row => (item.change ? item.change(row) : '')"
					/>
					<RemoteSelect
						v-else-if="item.type == 'remoteSelect'"
						v-model:value="searchData[item.modelValue]"
						v-model:label="searchData[item.modelLabel]"
						:selectLabel="item.selectLabel ? item.selectLabel : 'label'"
						:selectValue="item.selectValue ? item.selectValue : 'value'"
						:dataConfig="item.dataConfig"
						:number="item.number"
						:filterable="item.filterable ? item.filterable : true"
						:filter-method="item.myFilterMethod"
						:multiple="item.multiple"
						:max-collapse-tags="item.maxCollapseTags"
						:remote="item.remote"
						:clearable="item.clearable ? item.clearable : true"
						:disabled="item.disabled"
						:placeholder="item.name"
						:loading="item.loading"
						:type="item.dataType"
						@change="row => (item.change ? item.change(row) : '')"
					/>
					<el-date-picker
						v-if="item.type == 'year'"
						v-model="searchData[item.modelValue]"
						type="year"
						value-format="YYYY"
						format="YYYY"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'date'"
						v-model="searchData[item.modelValue]"
						type="date"
						value-format="YYYY-MM-DD"
						format="YYYY-MM-DD"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'month'"
						v-model="searchData[item.modelValue]"
						type="month"
						value-format="YYYY-MM"
						format="YYYY-MM"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'datetime'"
						v-model="searchData[item.modelValue]"
						type="datetime"
						value-format="YYYY-MM-DD hh:mm:ss"
						format="YYYY-MM-DD hh:mm:ss"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'daterange'"
						v-model="searchData[item.modelValue]"
						type="daterange"
						unlink-panels
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
						:shortcuts="item.shortcuts.length > 0 ? item.shortcuts : shortcuts"
					/>
					<el-date-picker
						v-if="item.type == 'datetimerange'"
						v-model="searchData[item.modelValue]"
						type="datetimerange"
						unlink-panels
						range-separator="至"
						start-placeholder="开始时间"
						end-placeholder="结束时间"
						value-format="YYYY-MM-DD HH:mm"
						format="YYYY-MM-DD HH:mm"
						:placeholder="item.name"
					></el-date-picker>
					<el-date-picker
						v-if="item.type == 'portTime' && item.vif"
						v-model="searchData[item.modelValue]"
						type="datetimerange"
						unlink-panels
						range-separator="至"
						start-placeholder="开始时间"
						end-placeholder="结束时间"
						value-format="YYYY-MM-DD HH:mm"
						format="YYYY-MM-DD HH:mm"
						:placeholder="item.name"
					></el-date-picker>
				</el-col>
			</el-row>
		</div>
	</div>
</template>
<script setup name="SearchHeader">
import { reactive, ref, computed, onMounted, watch, getCurrentInstance, nextTick,inject } from 'vue'
import Select from '../Select/index.vue'
import nvDatePicker from '../nvDatePicker/index.vue'
import RemoteSelect from '../RemoteSelect/index.vue'
import tableParamsStore from '../../store/modules/tableParams'
import AdvancedQuery from '../AdvancedQuery/index.vue'
const { proxy } = getCurrentInstance()
const tableParams = tableParamsStore()

const emit = defineEmits(['searchClick', 'handleChange'])
const searchData = ref({
	startPage: 1,
	pageSize: 10,
})
// 高级查询
const advancedQueryRef = ref(null)
const showMore = ref(false)
const props = defineProps({
	// 搜索框集合
	selectData: {
		type: Array,
		default: [],
	},
	size: {
		type: String,
		default: '',
	},
	dropdownSelect: {
		type: Array,
		default: () => [],
	},
	endSelect: {
		type: Array,
		default: () => [],
	},
	buttonList: {
		type: Array,
		default: () => [],
	},
	showSearch: {
		type: Boolean,
		default: true,
	},
	showReset: {
		type: Boolean,
		default: true,
	},
	// 带tabs时触发高度
	showMoreFlag: {
		type: Boolean,
		default: false,
	},
	defaultWidth: {
		type: [Number, String],
		default: 25,
	},
	showNum: {
		type: [Number, String],
		default: 3,
	},
	//是否显示高级查询筛选器
	isShowAdvancedQuery: {
		type: Boolean,
		default: false,
	},
	/**
	 * 表格id (用于高级查询)
	 */
	id: {
		type: String,
		default: null,
	},
	/**
	 * 高级查询参数
	 */
	queryAdvancedParams: {
		type: Object,
		default: () => {},
	},
})
const showSelectData = computed(() => {
	const showData = props.selectData.filter(item => !item.isHidden)
	if (props.buttonList.length > 0) {
		return showData.slice(0, props.showNum ? props.showNum : 3)
	} else {
		return showData.slice(0, props.showNum ? props.showNum : 6)
	}
})
const moreSelectData = computed(() => {
	const showData = props.selectData.filter(item => !item.isHidden)
	if (props.buttonList.length > 0) {
		return showData.slice(props.showNum ? props.showNum : 3, 20)
	} else {
		return showData.slice(props.showNum ? props.showNum : 6, 20)
	}
})
// 动态计算左侧宽度
const leftRowWidth = computed(() => {
	if (props.buttonList.length === 0) {
		const len = showSelectData.value.length
		if (len <= 1) {
			return 'width: calc(30% - 180px);'
		} else if (len <= 2) {
			return 'width: calc(40% - 180px);'
		} else if (len <= 3) {
			return 'width: calc(50% - 180px);'
		} else {
			return 'width: calc(60% - 180px);'
		}
	} else {
		return `width: ${props.defaultWidth}%;`
	}
})
const getMore = () => {
	showMore.value = !showMore.value
	if (props.showMoreFlag) {
		if (showMore.value) {
			tableParams.setTableHeight(-49)
		} else {
			tableParams.setTableHeight(0)
		}
	} else {
		if (showMore.value) {
			tableParams.setTableHeight(-48)
		} else {
			tableParams.setTableHeight(0)
		}
	}
}
const filterButton = computed(() => {
	return props.buttonList.filter(item => item.vif !== false)
})
const shortcuts = [
	{
		text: '上周',
		value: () => {
			const currentTimestamp = Date.now()
			const currentDate = new Date(currentTimestamp)
			// 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
			const currentDayOfWeek = currentDate.getDay()
			// 计算上周的起始日期和结束日期的时间戳
			const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
			const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
			const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
			const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
			return [lastWeekStartDate, lastWeekEndDate]
		},
	},
	{
		text: '本周',
		value: () => {
			const currentDate = new Date()
			const currentDayOfWeek = currentDate.getDay()
			// 获取本周的起始日期和结束日期
			const thisWeekStartDate = new Date(currentDate)
			thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
			const thisWeekEndDate = new Date(currentDate)
			thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
			return [thisWeekStartDate, thisWeekEndDate]
		},
	},
	{
		text: '上月',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 获取上个月的起始日期和结束日期
			const lastMonthStartDate = new Date(currentDate)
			lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

			const lastMonthEndDate = new Date(currentDate)
			lastMonthEndDate.setDate(0)
			return [lastMonthStartDate, lastMonthEndDate]
		},
	},
	{
		text: '本月',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 获取本月的起始日期和结束日期
			const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
			const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
			const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
			return [currentMonthStartDate, currentMonthEndDate]
		},
	},
	{
		text: '上季',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 获取上季度的起始日期和结束日期
			const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
			const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
			const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
			return [lastQuarterStartDate, lastQuarterEndDate]
		},
	},
	{
		text: '本季',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 获取本季度的起始日期和结束日期
			const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
			const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
			const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
			const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
			return [currentQuarterStartDate, currentQuarterEndDate]
		},
	},
	{
		text: '去年',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 计算去年的起始日期和结束日期
			const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
			const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
			return [lastYearStartDate, lastYearEndDate]
		},
	},
	{
		text: '今年',
		value: () => {
			// 获取当前日期
			const currentDate = new Date()
			// 计算今年的起始日期和结束日期
			const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
			const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
			return [currentYearStartDate, currentYearEndDate]
		},
	},
]
// 查询按钮事件
const searchHandler = () => {
	emit('searchClick', searchData.value)
}
// 修改下拉框数据触发事件
const handleChange = (i, data) => {
	emit('handleChange', i, data)
}
/**
 * 按钮事件
 */
const buttonClick = (i, e) => {
	i()()
}
const onQuery = inject('onQuery') // 注入父组件提供的方法
/**
 * 重置事件
 */
const resetSearch = async keys => {
	if (typeof keys === 'string') {
		searchData.value[keys] = ''
	} else if (keys instanceof Array) {
		for (const key in searchData.value) {
			keys.forEach(item => {
				if (key === item) {
					searchData.value[key] = ''
				}
			})
		}
	} else {
		if (JSON.stringify(resetSearchData.value) == '{}') {
			for (const key in searchData.value) {
				if (key !== 'startPage' && key !== 'pageSize') {
					searchData.value[key] = ''
				}
			}
		} else {
			for (const key in searchData.value) {
				if (key !== 'startPage' && key !== 'pageSize') {
					searchData.value[key] = ''
				}
			}
			searchData.value = Object.assign(searchData.value, JSON.parse(JSON.stringify(resetSearchData.value)))
		}
	}
	// 2. 高级查询清空：调用静默清空方法（无弹窗）
	if (props.isShowAdvancedQuery && advancedQueryRef.value) {
		await advancedQueryRef.value.clearAllConditions()
			// 触发查询事件
		onQuery()
	}
}
const resetSearchData = ref({}) // 重置的对象
const showToolTip = ref(false) // 是否显示图标+toolTip
const bodyWidth = ref('') // 记录body的宽度
const rightButtonWidth = ref('') // 记录全部button的宽度
const designByWidth = () => {
	// 根据宽度修改样式函数
	const boxWidth = document.getElementById('selectBox').clientWidth
	const leftWidth = document.getElementById('left').clientWidth
	const buttonWidth = document.getElementById('button').clientWidth
	const rightWidth = document.getElementById('right').clientWidth
	// console.log({ buttonWidth, rightWidth })
	// 如果表格宽度不够，则显示tooltip+button
	if (boxWidth > leftWidth + buttonWidth + rightWidth) {
		if (boxWidth < leftWidth + buttonWidth + rightButtonWidth.value) {
			// 二次判断宽度够不够转换前的宽度，如果不够就继续显示true
			showToolTip.value = true
		} else {
			showToolTip.value = false
		}
	} else {
		showToolTip.value = true
	}
	bodyWidth.value = document.body.clientWidth
}
onMounted(() => {
	proxy.$bus.on('setInitSearchData', value => {
		// value 是需要赋值的key-value键值对
		Object.keys(value).forEach((item, index) => {
			searchData.value[item] = Object.values(value)[index]
		})
		resetSearchData.value = JSON.parse(JSON.stringify(searchData.value))
	})
	rightButtonWidth.value = document.getElementById('right').clientWidth // 记录显示全部按钮时的宽度，用来判断分辨率修改的情况
	designByWidth()
	window.addEventListener(
		'resize',
		() => {
			designByWidth()
		},
		false
	)
})
defineExpose({
	resetSearch,
	searchData,
})
</script>
<style lang="scss" scoped>
.selectBox {
	height: 40px;
	margin: 8px 0;
	.left {
		display: flex;
		float: left;
	}
	.left_high {
		float: left;
		width: 100%;
	}
	#button {
		float: left;
	}
	.right {
		float: right;
		display: flex;
		justify-content: flex-end;
	}
}
// .el-col-3 {
// 	max-width: calc(12.5% - 55px);
// }
// .el-col-4 {
// 	max-width: calc(16.6666666667% - 55px);
// }
// .el-col-5 {
// 	max-width: calc(20.8% - 55px);
// }
// .el-col-6 {
// 	max-width: calc(25% - 55px);
// }
// .el-col-7 {
// 	max-width: calc(29.2% - 55px);
// }
// .el-col-8 {
// 	max-width: calc(33.3% - 55px);
// }
.newDateStyle {
	width: 100%;
	height: 32px;
	line-height: 28px;
	padding-left: 10px;
	border-radius: 4px;
	border: 1px solid #dcdfe6;
	box-shadow: none;
	font-size: 13px;
	color: #606266;
	font-family: Arial;
	display: inline-block;
}
.newDateStyle:focus {
	outline: none;
	border: 1px solid #1890ff;
}
// input.show_placeholder:before {
// 	content: attr(placeholder);
// }
// :deep(.el-button){
// 	margin: 0 !important;
// }
</style>
