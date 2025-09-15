<template>
	<div style="padding: 0 5px">
		<vxe-toolbar ref="xToolbar" :custom="{ immediate: true }" v-if="showToolBar"></vxe-toolbar>
		<vxe-table
			v-if="showBase"
			ref="xTable"
			:align="allAlign"
			:data="tableData"
			:size="size"
			:stripe="stripe"
			:border="border"
			:round="round"
			:height="height"
			:max-height="maxHeight"
			:auto-resize="autoResize"
			:show-header="showHeader"
			:show-footer="showFooter"
			:footer-method="footerMethod"
			:span-method="spanMethod"
			:row-config="rowConfig"
			:column-config="columnConfig"
			:radio-config="radioConfig"
			@radio-change="radioChangeEvent"
			:checkbox-config="checkboxConfig"
			@checkbox-all="selectAllChangeEvent"
			@checkbox-change="selectChangeEvent"
			:tree-config="treeConfig"
			:edit-rules="editRules"
			:edit-config="editConfig"
			:export-config="exportConfig"
			empty-text="暂无数据！"
			:loading="loading"
			:sync-resize="syncResize"
			@custom="custom"
			@header-cell-click="headerCellClickEvent"
			@header-cell-dblclick="headerCellDblclickEvent"
			@header-cell-menu="headerCellContextMenuEvent"
			@cell-click="cellClickEvent"
			@cell-dblclick="cellDBLClickEvent"
			@cell-mouseenter="cellMouseenterEvent"
			@cell-mouseleave="cellMouseleaveEvent"
			@cell-menu="cellContextMenuEvent"
			@footer-cell-click="footerCellClickEvent"
			@footer-cell-dblclick="footerCellDblclickEvent"
			@footer-cell-menu="footerCellContextMenuEvent"
			@scroll="scrollEvent"
			show-overflow
			:header-cell-class-name="headerCellClassName"
			:row-class-name="rowClassName || addIndex"
			:cell-class-name="cellClassName"
			:header-cell-style="headerCellStyle"
			:row-style="rowStyle"
			:cell-style="cellStyle"
			:scroll-y="{ enabled: true, gt: 10 }"
		>
			<vxe-column
				v-for="item in changeColumns.list"
				:key="item.prop"
				:field="item.prop"
				:title="item.label"
				:type="item.type"
				:width="typeof item.width === 'number' ? item.width : widthMap[item.width]"
				:min-width="item.minWidth"
				:fixed="item.fixed"
				:align="item.align"
				:tree-node="item.treeNode"
				:sortable="item.sortable"
				:formatter="item.formatter"
				:filters="item.filters"
				:filter-method="item.filterMethod"
				:edit-render="item.editRender ? { autofocus: '.el-input__inner' } : null"
				:show-overflow="item.showOverFlow ? item.showOverFlow : true"
				:show-header-overflow="item.showHeaderOverflow ? item.showHeaderOverflow : true"
				:show-footer-overflow="item.showFooterOverflow ? item.showFooterOverflow : true"
			>
				<template #default="{ row }" v-if="item.isThousandth">
					<el-statistic group-separator="," :precision="2" :value="Number(row[item.prop]) || 0"></el-statistic>
				</template>
				<template #header v-if="item.headerSlot">
					<div v-html="item.headerSlot"></div>
				</template>
				<template #default="{ row }" v-if="item.render">
					<RenderDom :render="item.render" :row="row" />
				</template>
				<template #default="{ row }" v-if="isSelectTable">
					<el-option :label="row[selectLabel]" :value="row[selectValue]" :disabled="row.disabled">
						<RenderDom :render="item.render" :row="row" v-if="item.render" />
						<span v-else-if="item.modelLabel && row[item.modelLabel]">
							{{ row[item.modelLabel] }}
						</span>
						<span v-else>{{ row[item.prop] }}</span>
					</el-option>
				</template>
				<template #default="{ row }" v-if="item.selectData && !item.allowCreate">
					<!-- 如果有modelLabel，则显示modelLabel，如果是多选则处理一下数组为'，'拼接 -->
					<!-- 如果没有则根据数据format -->
					<span>
						{{
							row[item.modelLabel] && item.modelLabel != undefined
								? row[item.modelLabel] instanceof Object
									? row[item.modelLabel].join()
									: row[item.modelLabel]
								: format(row[item.prop], item)
						}}
					</span>
				</template>
				<template #default="{ row }" v-else-if="item.editType === 'remoteSelect'">
					<span>
						{{ row[item.modelLabel] }}
					</span>
				</template>
				<template #default="{ row }" v-else-if="item.allowCreate">
					<span>
						{{ row[item.prop] }}
					</span>
				</template>
				<template #edit="{ row }">
					<span v-if="row.isDisable && item.disable">
						{{ item.editType === 'select' || item.editType === 'remoteSelect' ? row[item.modelLabel] : row[item.prop] }}
					</span>
					<el-input
						v-else-if="item.editType === 'input'"
						v-model="row[item.prop]"
						type="text"
						class="editInput"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						@input="e => handleInput(e, row, item.label)"
						@blur="e => handleBlur(e, row, item.label)"
						@keyup.enter.native="$refs.xTable.clearEdit()"
					></el-input>
					<Select
						v-else-if="item.editType === 'select'"
						v-model:value="row[item.prop]"
						v-model:label="row[item.modelLabel]"
						:selectData="item.selectData"
						:selectLabel="item.selectLabel"
						:selectValue="item.selectValue"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						:multiple="item.multiple"
						:allowCreate="item.allowCreate"
						@change="e => changeSelect(e, row, item.change, item.label)"
						@focus="e => focusSelect(e, row, item.change, item.label, row[item.prop])"
						@keyup.enter.native="$refs.xTable.clearEdit()"
					/>
					<RemoteSelect
						v-else-if="item.editType === 'remoteSelect'"
						v-model:value="row[item.prop]"
						v-model:label="row[item.modelLabel]"
						:dataConfig="item.dataConfig"
						:type="item.type"
						:multiple="item.multiple"
						:selectLabel="item.selectLabel"
						:selectValue="item.selectValue"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						@change="e => changeSelect(e, row, item.change, item.label)"
					/>
					<el-date-picker
						v-else-if="item.editType === 'datetime'"
						v-model="row[item.prop]"
						type="datetime"
						format="YYYY-MM-DD HH:mm"
						value-format="YYYY-MM-DD HH:mm"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						placeholder="请选择.."
						@change="changDate(row, item.label)"
					></el-date-picker>
					<nvDatePicker
						v-else-if="item.editType == 'nativedate'"
						v-model:value="row[item.prop]"
						:typeFlag="item.editType"
						:placeholder="item.name"
						@change="changDate(row, item.label)"
					/>
					<nvDatePicker
						v-else-if="item.editType == 'nativedatetime'"
						v-model:value="row[item.prop]"
						:typeFlag="item.editType"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						:placeholder="item.name"
						@change="changDate(row, item.label)"
					/>
					<vxe-input
						v-model="row[item.prop]"
						type="date"
						transfer
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						v-else-if="item.editType === 'date'"
						@keyup.enter.native="$refs.xTable.clearEdit()"
					></vxe-input>
					<vxe-input
						v-model="row[item.prop]"
						type="time"
						transfer
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						v-else-if="item.editType === 'time'"
						@keyup.enter.native="$refs.xTable.clearEdit()"
					></vxe-input>
					<!-- <el-time-picker
						v-else-if="item.editType === 'time'"
						v-model="row[item.prop]"
						:disabled-hours="false"
						:disabled-minutes="false"
						:disabled-seconds="item.disabledSeconds"
						/> -->
					<el-input
						v-else-if="item.editType === 'textarea'"
						:disabled="
							(!item.notDisabledInRow && row[disabledKey]) ||
							isGet ||
							item.disabled ||
							(item.disabledFunc ? item.disabledFunc(row) : false)
						"
						v-model="row[item.prop]"
						:rows="1"
						type="textarea"
					/>
					<el-switch
						v-else-if="item.editType === 'switch'"
						v-model="row[item.prop]"
						:active-value="item.activeValue"
						:inactive-value="item.inactiveValue"
					/>
				</template>
			</vxe-column>
		</vxe-table>
	</div>
</template>

<script setup name="EditTable">
import { ref, reactive, nextTick, watch, computed, getCurrentInstance, onMounted } from 'vue'
import RenderDom from '../RenderDom/index.vue'
import tableParamsStore from '../../store/modules/tableParams'
import Sortable from 'sortablejs'
import Select from '../Select/index.vue'
import RemoteSelect from '../RemoteSelect/index.vue'
import nvDatePicker from '../nvDatePicker/index.vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
	size: {
		type: String,
		default: '',
	},
	// 是否显示toolBar
	showToolBar: {
		type: Boolean,
		default: false,
	},
	// 便于缓存时存入对应name
	name: {
		type: String,
	},
	/**
	 * 表头数据
	 * {prop:'绑定value',label:'表头名称',type:'类型',width:'宽度',showOverFlow:'是否过长显示tooltip,默认显示,不显示传ellipsis',
	 * editRender:{编辑表格一定要有},}
	 */
	tableColumns: {
		type: Array,
		default: () => [],
	},
	/**
	 * 表格数据
	 */
	tableData: {
		type: Array,
		default: () => [],
	},
	/**
	 * 对其方式
	 * 左:left，中:center，右:right
	 */
	allAlign: {
		type: String,
		default: null,
	},
	/**
	 * 表格尺寸大小
	 * medium / small / mini
	 */
	size: {
		type: String,
		default: null,
	},
	/**
	 * 是否使用斑马条纹
	 */
	stripe: {
		type: Boolean,
		default: false,
	},
	/**
	 * 行信息配置
	 */
	rowConfig: {
		type: Object,
		default: { isCurrent: true, isHover: true },
	},
	/**
	 * 列信息配置
	 */
	columnConfig: {
		type: Object,
		default: {
			resizable: true,
		},
	},
	/**
   * 单选框配置config
   * {
      highlight:true, // 选中高亮行
      strict: false, // 可以取消
      reserve:false, // 是否保留选中状态
      visibleMethod:({row}) => { // 返回显示的单选框
        return row.age > 26
      },
      checkMethod:({row}) => { // 返回可选的单选框
        return row.age > 26
      },
      checkRowKey:默认的数据中的keyField // 默认选项，需要在row.config中设置keyField
    }
   */
	radioConfig: {
		type: Object,
		default: null,
	},
	/**
	 * 单选框选中事件 ({row}) => {}
	 */
	radioChangeEvent: {
		type: Function,
		default: () => {},
	},
	/**
   * 复选框配置config
   * {
      highlight:true, // 选中高亮行
      strict: false, // 可以取消
      reserve:false, // 是否保留选中状态
      showHeader:true, // 是否显示全选
      checkAll:false, // 是否全选
      range:true, // 	开启复选框范围选择功能
      // visibleMethod:({row}) => { // 返回显示的单选框
      //   return row.age > 26
      // },
      checkMethod:({row}) => { // 返回可选的单选框
        return row.age > 26
      },
      checkRowKey:默认的数据中的keyField // 默认选项，需要在row.config中设置keyField
    }
   */
	checkboxConfig: {
		type: Object,
		default: null,
	},
	/**
	 * 树形配置
	 */
	treeConfig: {
		type: Object,
		default: null,
	},

	/**
	 * 可编辑校验规则
	 */
	editRules: {
		type: Object,
		default: null,
	},
	/**
	 * 可编辑配置
	 */
	editConfig: {
		type: Object,
		default: { trigger: 'click', mode: 'cell', autoClear: false },
	},
	/**
	 * 导出配置
	 */
	exportConfig: {
		type: Object,
		default: null,
	},
	/**
	 * 全选事件 ({checked}) => {}
	 */
	selectAllChangeEvent: {
		type: Function,
		default: () => {},
	},
	/**
	 * 是否使用边框
	 * 完整边框：true，外边框：outer，内边框：inner，去掉所有：none
	 */
	border: {
		type: [String, Boolean],
		default: null,
	},
	/**
	 * 是否使用圆角边框
	 */
	round: {
		type: Boolean,
		default: null,
	},
	/**
	 * 加载中
	 */
	loading: {
		type: Boolean,
		default: false,
	},
	/**
	 * 自动刷新
	 */
	syncResize: {
		type: [Boolean, String],
		default: false,
	},
	/**
	 * 合并单元格的方法
	 */
	spanMethod: {
		type: Function,
		default: null,
	},
	/**
	 * 是否显示底部
	 */
	showFooter: {
		type: Boolean,
		default: false,
	},
	/**
	 * 底部方法
	 */
	footerMethod: {
		type: Function,
		default: () => {},
	},
	/**
	 * 底部使用内置方法的config
	 */
	footerConfig: {
		type: Object,
	},
	/**
	 * 表头是否需要新增事件
	 */
	hasAdd: {
		type: Boolean,
		default: false,
	},
	headerCellClickEvent: {
		type: Function,
		default: null,
	},
	headerCellDblclickEvent: {
		type: Function,
		default: () => {},
	},
	headerCellContextMenuEvent: {
		type: Function,
		default: () => {},
	},
	cellClickEvent: {
		type: Function,
		default: () => {},
	},
	cellDBLClickEvent: {
		type: Function,
		default: () => {},
	},
	cellMouseenterEvent: {
		type: Function,
		default: () => {},
	},
	cellMouseleaveEvent: {
		type: Function,
		default: () => {},
	},
	cellContextMenuEvent: {
		type: Function,
		default: () => {},
	},
	footerCellClickEvent: {
		type: Function,
		default: () => {},
	},
	footerCellDblclickEvent: {
		type: Function,
		default: () => {},
	},
	footerCellContextMenuEvent: {
		type: Function,
		default: () => {},
	},
	scrollEvent: {
		type: Function,
		default: () => {},
	},
	/**
	 * 是否自适应父元素大小
	 */
	autoResize: {
		type: Boolean,
		default: false,
	},

	/**
	 * 是否显示表头
	 */
	showHeader: {
		type: Boolean,
		default: true,
	},
	/**
	 * header单元格类
	 * 设置样式时：
	 * :deep() .vxe-table .vxe-header--column.返回的类名
	 */
	headerCellClassName: {
		type: Function,
	},
	/**
	 * 行样式类
	 * :deep() .vxe-table .vxe-body--row.返回的类名
	 */
	rowClassName: {
		type: Function,
	},
	/**
	 * 单元格样式
	 * :deep() .vxe-table .vxe-body--column.返回的类名
	 */
	cellClassName: {
		type: Function,
	},
	/**
	 * header单元格样式
	 */
	headerCellStyle: {
		type: Function,
	},
	/**
	 * 行样式
	 */
	rowStyle: {
		type: Function,
	},
	/**
	 * 单元格样式
	 */
	cellStyle: {
		type: Function,
	},

	/**
	 * 表格高度, 默认在主列表使用高度
	 */
	tableHeight: {
		type: [Number, String],
		default: null,
	},
	maxHeight: {
		type: [Number, String],
		default: null,
	},
	/**
	 * 表格的最小高度
	 */
	minHeight: {
		type: [Number, String],
		default: 150,
	},
	/**
	 * 是否为下拉列表，是则默认slot显示option
	 */
	isSelectTable: {
		type: Boolean,
		default: false,
	},
	/**
	 * 绑定下拉框的label和value的key值
	 */
	selectLabel: {
		type: String,
		default: 'label',
	},
	selectValue: {
		type: String,
		default: 'value',
	},
	// 根据这个key判断哪一行不可编辑
	disabledKey: {
		type: String,
		default: 'disabledKey',
	},
	// 是否为查看状态，查看则全不可编辑
	isGet: {
		type: Boolean,
		default: false,
	},
})

const tableData = computed({
	get() {
		return props.tableData
	},
	set(val) {
		console.log('set', val)
		emit('update:tableData', val)
	},
})
const emit = defineEmits(['checkbox-change', 'rowSelect-change', 'change', 'input', 'chang_date'])
// table高度
const tableParams = tableParamsStore()
const normalTableHeight = computed(() => tableParams.normalTableHeight)
const pageTableHeight = computed(() => tableParams.pageTableHeight)
const tabTableHeight = computed(() => tableParams.tabTableHeight)
const drawerNormalTableHeight = computed(() => tableParams.drawerNormalTableHeight)
const drawerPageTableHeight = computed(() => tableParams.drawerPageTableHeight)
const drawerHeaderPageTableHeight = computed(() => tableParams.drawerHeaderPageTableHeight)
const heightObj = reactive({
	normalTableHeight,
	pageTableHeight,
	tabTableHeight,
	drawerNormalTableHeight,
	drawerPageTableHeight,
	drawerHeaderPageTableHeight,
})
const height = ref(0)
watch(
	heightObj,
	newV => {
		if (typeof props.tableHeight === 'string') {
			console.log(props.tableHeight, heightObj[props.tableHeight])
			height.value = heightObj[props.tableHeight] < props.minHeight ? props.minHeight : heightObj[props.tableHeight]
		} else if (typeof props.tableHeight === 'number') {
			height.value = props.tableHeight < props.minHeight ? props.minHeight : props.tableHeight
		} else {
			// 不传默认
			height.value = pageTableHeight.value < props.minHeight ? props.minHeight : pageTableHeight.value
		}
	},
	{ immediate: true, deep: true }
)
watch(
	props.tableColumns,
	newV => {
		changeColumns.list = props.tableColumns.filter(item => item.isHidden !== true)
	},
	{ deep: true }
)

// 列宽度
const widthMap = reactive({
	time: 160,
	operate: 150,
	date: 120,
	status: 90,
	phoneNumber: 120,
})
const xTable = ref()
const xToolbar = ref()
// 默认增加index
const addIndex = ({ row, rowIndex }) => {
	row.index = rowIndex
}
// 导出csv格式数据
const exportDataEvent = () => {
	const $table = xTable.value
	$table.openExport({
		// 默认勾选源
		original: true,
	})
}
// 导入
const importDataEvent = () => {
	const $table = xTable.value
	$table.importData()
}

// 单选框设置选中
const setRadioRow = row => {
	const $table = xTable.value
	$table.setRadioRow(row)
}
// 单选框设置清空
const clearRadioRow = () => {
	const $table = xTable.value
	$table.clearRadioRow()
}
// 复选框设置选中
const setCheckboxRow = arr => {
	const $table = xTable.value
	$table.setCheckboxRow(arr, true)
}
// 复选框设置全选
const setAllCheckboxRow = () => {
	const $table = xTable.value
	$table.setAllCheckboxRow(true)
}
// 复选框设置清空
const clearCheckboxRow = () => {
	const $table = xTable.value
	$table.clearCheckboxRow()
}
// 复选框获取选中
const getSelectEvent = () => {
	const $table = xTable.value
	if ($table) {
		const selectRecords = $table.getCheckboxRecords()
		console.log('复选框获取选中', selectRecords)
		return selectRecords
	}
}
const selectChangeEvent = () => {
	const $table = xTable.value
	const records = $table.getCheckboxRecords()
	emit('checkbox-change', records)
}
// 删除选中
const removeCheckboxRow = () => {
	const $table = xTable.value
	$table.removeCheckboxRow()
}
let showBase = ref(true)

const changeColumns = reactive({
	name: '修改后的头',
	list: props.tableColumns.filter(item => item.isHidden !== true),
})
const colDrop = () => {
	const wrapperTr = document.querySelector('.vxe-header--row')
	const $table = xTable.value

	new Sortable(wrapperTr, {
		animation: 180,
		delay: 0,
		// direction: 'horizontal',
		onEnd: evt => {
			showBase.value = false
			const oldColumns = $table.getColumns() // 拿到交换位置之前显示的表头
			// 根据显示的表头判断移动元素在全部元素的index
			const oldIndex = changeColumns.list.findIndex(item => item.prop === oldColumns[evt.oldIndex].field)
			const newIndex = changeColumns.list.findIndex(item => item.prop === oldColumns[evt.newIndex].field)
			console.log(oldIndex, newIndex)
			// 根据index交换表头位置
			const oldItem = changeColumns.list[oldIndex]
			changeColumns.list.splice(oldIndex, 1)
			changeColumns.list.splice(newIndex, 0, oldItem)
			nextTick(() => {
				showBase.value = true
				nextTick(() => {
					colDrop()
					const $table = xTable.value
					// 移动之后根据老显示表头进行重新渲染，避免移动后显示列变化
					$table.getColumns().forEach(column => {
						column.visible = false
						oldColumns.forEach(item => {
							if (column.field === item.field) {
								column.visible = true
							}
						})
					})
					if ($table) {
						$table.refreshColumn()
					}
					// 移动后重新绑定toolbar
					const $toolbar = xToolbar.value
					$table.connect($toolbar)
				})
			})
			// }, 0)
		},
	})
}
// 工具栏方法
const custom = params => {
	const removeDuplicatesByProperty = (arr, uniId) => {
		const res = new Map()
		return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
	}
	const $table = xTable.value
	const visibleColumn = []
	// 从原有表头筛选出展示表头
	$table.getColumns().forEach(item => {
		props.tableColumns.forEach(i => {
			if (i.prop === item.field) {
				visibleColumn.push(i)
			}
		})
	})
	switch (params.type) {
		case 'confirm': {
			// 将表头信息保存到本地
			localStorage.setItem(props.name + '_tableColumn', JSON.stringify(visibleColumn))
			break
		}
		case 'reset': {
			const arr = props.tableColumns
			changeColumns.list = arr
			const $table = xTable.value
			if ($table) {
				$table.refreshColumn()
			}
			break
		}
		case 'close': {
			console.log(visibleColumn)
			break
		}
	}
}
// 表格校验
const validAllEvent = async () => {
	const $table = xTable.value
	const errMap = await $table.validate(true)
	if (errMap) {
		proxy.$modal.msgWarning('请完善表格信息！')
	} else {
	}
	return !errMap
}
const rowValid = async rowData => {
	const $table = xTable.value
	const errMap = await $table.validate(rowData)
	if (errMap) {
		proxy.$modal.msgWarning('请完善表格信息！')
	} else {
	}
	return !errMap
}
// 处理edit-select展示内容
const format = (v, data) => {
	const label = data.selectLabel ? data.selectLabel : 'label' // 得到label字段名
	const value = data.selectValue ? data.selectValue : 'value' // 得到value字段名
	let formatLabel = [] // 定义展示内容
	data.selectData.forEach(item => {
		if (v === item[value]) {
			formatLabel.push(item[label])
		}
		if (Array.isArray(v)) {
			v.forEach(i => {
				if (i == item[value]) {
					formatLabel.push(item[label])
				}
			})
		}
	})
	return formatLabel.join(',')
}
// 下拉框change事件
const changeSelect = (e, row, handleChange, title) => {
	emit('change', e, row, title) // row是table的当前行数据，e是下拉框选中行数据
	// console.log('666666666666666', e)
	if (handleChange) handleChange(e, row, title) // 调用个人的change方法
}
// 下拉框change事件
const focusSelect = (e, row, handleChange, title, isCheck) => {
	emit('focus', row, e, title, isCheck) // row是table的当前行数据，e是下拉框选中行数据
}

// input事件
const handleInput = (e, row, label) => {
	emit('input', e, row, label) // e是输入值，row是当前行数据
}
// input框失焦事件
const handleBlur = (e, row, label) => {
	emit('blur', e, row, label) // e是输入值，row是当前行数据
}
const changDate = (row, title) => {
	// console.log('时间选择器触发', row)
	emit('chang_date', row, title) //row是当前行数据
}
// 默认添加事件
const headerCellClickEvent = props.hasAdd
	? ({ column }) => {
			if (column.field === props.tableColumns[props.tableColumns.length - 1].prop) {
				// 最后一列添加事件
				let newObj = {}
				props.tableColumns.forEach(item => {
					newObj[item.prop] = ''
				})
				tableData.value.push(newObj)
			}
			// console.log(`表头单元格点击`, column, props.tableColumns[props.tableColumns.length - 1])
	  }
	: props.headerCellClickEvent
// 是否需要添加
const headerCellClassName = props.hasAdd
	? ({ column }) => {
			if (column.field === props.tableColumns[props.tableColumns.length - 1].prop) {
				// 最后一列添加事件
				return 'add'
			}
	  }
	: props.headerCellClassName
// 默认表尾事件
const footerMethod = props.footerConfig
	? ({ columns, data }) => {
			const render = []
			const functionsObj = { 平均值: averageNum, 合计: sumNum, 总计: sumNumRound }
			props.footerConfig.functions.forEach(item => {
				render.push(
					columns.map((column, columnIndex) => {
						if (columnIndex === 0) {
							return item
						}
						const i = props.footerConfig.columns.findIndex(c => c.prop === column.field)
						// 需要formatter处理的
						if (i > -1 && props.footerConfig.columns[i].formatter) {
							return props.footerConfig.columns[i].formatter(functionsObj[item](data, column.field))
						} else if (i > -1) {
							// 无需处理直接计算的
							return functionsObj[item](data, column.field)
						}
						return null
					})
				)
			})
			return render
	  }
	: props.footerMethod
// 计算平均值
const averageNum = (list, field) => {
	let count = 0
	list.forEach(item => {
		count += Number(item[field])
	})
	return count / list.length
}
// 计算合
const sumNum = (list, field) => {
	let count = 0
	list.forEach(item => {
		count += Number(item[field])
	})
	return count
}
// 计算合
const sumNumRound = (list, field) => {
	let count = 0
	list.forEach(item => {
		count += Number(item[field])
	})
	return count.toFixed(2)
}
nextTick(() => {
	// 将表格和工具栏进行关联
	const $table = xTable.value
	const $toolbar = xToolbar.value
	if (props.showToolBar) {
		$table.connect($toolbar)
	}
	// 拿到本地缓存的表头，如果有缓存则走缓存
	const columns = JSON.parse(localStorage.getItem(props.name + '_tableColumn'))
	if (columns != null) {
		$table.getColumns().forEach(column => {
			column.visible = false
			columns.forEach(item => {
				if (column.field === item.prop) {
					console.log(column.field, 'column')
					column.visible = true
				}
			})
		})

		if ($table) {
			$table.refreshColumn()
		}
	}
})
onMounted(() => {
	//if (props.showToolBar) document.querySelector('.btn--confirm').innerText = '保存'
})
defineExpose({
	exportDataEvent,
	importDataEvent,
	setRadioRow,
	clearRadioRow,
	setAllCheckboxRow,
	setCheckboxRow,
	clearCheckboxRow,
	getSelectEvent,
	removeCheckboxRow,
	colDrop,
	validAllEvent,
	rowValid,
})
</script>
<style scoped lang="scss">
:deep .el-statistic__content {
	font-size: inherit !important;
}
.vxe-toolbar {
	position: fixed;
	top: 102px;
	right: -16px;
	z-index: 999;
	transition: all 0.5s;
	background-color: transparent;
}
.vxe-toolbar:hover {
	right: 0px;
}
:deep(.vxe-cell) {
	padding-left: 5px !important;
	padding-right: 5px !important;
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
.add {
	cursor: pointer;
	color: red;
}
</style>
