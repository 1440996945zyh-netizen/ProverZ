<template>
	<div style="padding: 0 5px">
		<!-- 表格封装 -->
		<SearchHeader
			ref="SearchHeaderRef"
			v-if="showSearchHeader"
			:selectData="selectData"
			@searchClick="searchClickB"
			:buttonList="buttonList"
			:defaultWidth="defaultWidth"
			:showNum="showNum"
			:isShowAdvancedQuery="isShowAdvancedQuery"
			:id="id"
			:queryAdvancedParams="queryAdvancedParams"
		/>

		<div class="table-with-toolbar" style="position: relative">
			<vxe-toolbar ref="xToolbar" :custom="{ immediate: true }" v-if="showToolBar && name"></vxe-toolbar>
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
				:highlight-current-row="true"
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
				:scroll-y="scrollY"
				@column-resize="
					params => {
						console.log('列宽调整事件触发：', params) // 直接打印参数
						handleColumnResize(params)
					}
				"
				:name="name"
			>
				<vxe-column
					v-for="item in changeColumns.list"
					:key="item.prop"
					:field="item.prop"
					:title="item.label"
					:type="item.type"
					:width="getSavedColumnWidths()[item.prop] || (typeof item.width === 'number' ? item.width : widthMap[item.width])"
					:min-width="item.minWidth"
					:fixed="item.fixed"
					:align="item.align"
					:tree-node="item.treeNode"
					:sortable="!item.sortable && item.prop ? true : false"
					:formatter="item.formatter"
					:filters="item.filters"
					:filter-method="item.filterMethod"
					:edit-render="item.editRender"
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
					<template #default="{ row }" v-if="item.vHtml">
						<div v-html="row[item.prop]"></div>
					</template>
					<template #default="{ row }" v-if="item.render">
						<RenderDom :render="item.render" :row="row" />
					</template>
					<template #default="{ row }" v-if="isSelectTable">
						<el-option :label="row[selectLabel]" :value="row[selectValue]" :disabled="row.disabled">
							<RenderDom :render="item.render" :row="row" v-if="item.render" />
							<span v-else>{{ row[item.prop] }}</span>
						</el-option>
					</template>
				</vxe-column>
			</vxe-table>
			<div class="foot" v-show="total > 0 && showPagination">
				<!-- 自定义文本数据 -->
				<div v-html="htmlContent"></div>
				<pagination
					:total="total"
					v-model:page="queryParams.startPage"
					v-model:limit="queryParams.pageSize"
					@pagination="searchClickB"
					@searchClick="getSearchData"
				/>
			</div>
		</div>
	</div>
</template>
<script setup name="BaseTable">
import { ref, reactive, nextTick, watch, computed, getCurrentInstance, onMounted, onUnmounted, provide } from 'vue'
import RenderDom from '../RenderDom/index.vue'
import SearchHeader from '../../components/SearchHeader/index.vue'
import useAppStore from '../../store/modules/app'
import tableParamsStore from '../../store/modules/tableParams'
import pagination from '../../components/Pagination/index.vue'
import Sortable from 'sortablejs'
const appStore = useAppStore()
const { proxy } = getCurrentInstance()

const props = defineProps({
	// 是否显示header
	showSearchHeader: {
		type: Boolean,
		default: false,
	},
	// 是否显示header
	showMoreFlag: {
		type: Boolean,
		default: false,
	},
	/**
	 * 搜索框数据
	 * {
		name: '指令编号',
		type: 'input',
		modelValue: 'trustNo',
		span: 4,
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 4,
		selectValue: 'dictValue',
		selectLabel: 'dictLabel',
		selectData: [],
	},
	 */
	selectData: {
		type: Array,
		default: [],
	},
	size: {
		type: String,
		default: '',
	},
	endSelect: {
		type: Array,
		default: () => [],
	},
	// 右侧按钮 [{ label: '新建', type: 'primary', icon: 'Plus', click: () => {} }]
	buttonList: {
		type: Array,
	},
	// 查询按钮事件
	searchClick: {
		type: Function,
	},
	// 左侧筛选部分宽度自定义
	defaultWidth: {
		type: [Number, String],
		default: 25,
	},
	showNum: {
		type: [Number, String],
		default: 3,
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
		default: null,
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
		default: true,
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
	 * 底部传入自定义数据
	 */
	htmlContent: {
		type: String,
		default: null,
	},
	/**
	 * 底部方法
	 */
	footerMethod: {
		type: Function,
	},
	/**
	 * 底部使用内置方法的config
	 */
	footerConfig: {
		type: Object,
	},
	scrollY: {
		type: Object,
		default: () => ({ enabled: true, gt: 10 }),
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
		default: () => {},
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
	// 分页数据总量
	total: {
		type: Number,
		default: 0,
	},
	// 是否显示分页
	showPagination: {
		type: Boolean,
		default: true,
	},
	/**
	 * 是否显示高级查询筛选器
	 */
	isShowAdvancedQuery: {
		type: Boolean,
		default: false,
	},
	/**
	 * 表格id
	 */
	id: {
		type: String,
		default: null,
	},
	/**
	 * 查询参数 业务类型业务URL的时候传参
	 */
	queryAdvancedParams: {
		type: Object,
		default: () => {},
	},
})
const emit = defineEmits(['checkbox-change', 'rowSelect-change'])

// 表格高度
const tableParams = tableParamsStore()
const normalTableHeight = computed(() => tableParams.normalTableHeight)
const pageTableHeight = computed(() => tableParams.pageTableHeight)
const tabTableHeight = computed(() => tableParams.tabTableHeight)
const drawerNormalTableHeight = computed(() => tableParams.drawerNormalTableHeight)
const drawerPageTableHeight = computed(() => tableParams.drawerPageTableHeight)
const drawerHeaderPageTableHeight = computed(() => tableParams.drawerHeaderPageTableHeight)
const tabTableHeightTwo = computed(() => tableParams.tabTableHeightTwo)
const tabTableHeight1 = computed(() => tableParams.tabTableHeight1)
const tabTableSummary = computed(() => tableParams.tabTableSummary)
const heightObj = reactive({
	normalTableHeight,
	pageTableHeight,
	tabTableHeight,
	drawerNormalTableHeight,
	drawerPageTableHeight,
	drawerHeaderPageTableHeight,
	tabTableHeightTwo,
	tabTableHeight1,
	tabTableSummary,
	null: null,
})
const height = ref(0)
watch(
	heightObj,
	newV => {
		if (typeof props.tableHeight === 'string') {
			// console.log(props.tableHeight, heightObj[props.tableHeight])
			height.value = heightObj[props.tableHeight] < props.minHeight ? props.minHeight : heightObj[props.tableHeight]
		} else if (typeof props.tableHeight === 'number') {
			height.value = props.tableHeight < props.minHeight ? props.minHeight : props.tableHeight
		} else {
			if (props.showMoreFlag) {
				height.value = tabTableHeight1.value + 50
			} else {
				// 不传默认
				height.value = pageTableHeight.value < props.minHeight ? props.minHeight : pageTableHeight.value
			}
		}
	},
	{ immediate: true, deep: true }
)
// 列宽度
const widthMap = reactive({
	time: 160,
	operate: 150,
	date: 120,
	status: 90,
	phoneNumber: 120,
})
const tableData = computed({
	get() {
		return props.tableData
	},
	set(val) {
		// console.log('set', val)
		emit('update:tableData', val)
	},
})
// header----------------------------------------------------------------
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
/**
 * 高级查询
 * @description: 高级查询
 */
const advancedQuery = ref([])
provide('onQuery', data => {
    console.log('父组件收到数据：', data)
    advancedQuery.value = data ? JSON.parse(JSON.stringify(data)) : []
    
    // 构建基础参数
    const baseParams = {
        ...queryParams.value,
        ...seachData.value
    }
    
    // 只有当 advancedQuery 有数据时才添加该字段
    const paramsForImmediateQuery = advancedQuery.value && advancedQuery.value.length > 0 
        ? { ...baseParams, advancedQuery: JSON.stringify(advancedQuery.value) }
        : baseParams
        
    console.log('高级查询触发，立即查询参数：', paramsForImmediateQuery)
    props.searchClick(paramsForImmediateQuery) // 直接调用父组件传递的查询回调
})

const seachData = ref({})

const searchClickB = e => {
    // 构建基础参数
    const buildBaseParams = () => {
        const base = { ...queryParams.value, ...seachData.value }
        // 只有当 advancedQuery 有数据时才添加该字段
        if (advancedQuery.value && advancedQuery.value.length > 0) {
            base.advancedQuery = JSON.stringify(advancedQuery.value)
        }
        return base
    }
    
    if (e.pagination) {
        if (queryParams.value.startPage !== 1 || queryParams.value.pageSize !== 10) {
            const params = { ...e, ...buildBaseParams() }
            props.searchClick(params)
            return
        } else {
            seachData.value.startPage = queryParams.value.startPage
            seachData.value.pageSize = queryParams.value.pageSize
            
            const params = { ...e, ...buildBaseParams() }
            seachData.value = JSON.parse(JSON.stringify(queryParams.value))
            props.searchClick(params)
            return
        }
    } else {
        seachData.value = JSON.parse(JSON.stringify(e))
        e.startPage = queryParams.value.startPage
        e.pageSize = queryParams.value.pageSize
        
        const params = { ...e, ...buildBaseParams() }
        console.log('组件params', params)
        props.searchClick(params)
    }
}
const SearchHeaderRef = ref()
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
		return selectRecords
	}
}
// 单选框获取选中
const getRadioRecord = () => {
	const $table = xTable.value
	if ($table) {
		const selectRecords = $table.getRadioRecord()
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
// 清空行选中
const clearCurrentColumn = row => {
	const $table = xTable.value
	$table.setCurrentRow()
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
			// console.log(oldIndex, newIndex)
			// 根据index交换表头位置
			const oldItem = changeColumns.list[oldIndex]
			changeColumns.list.splice(oldIndex, 1)
			changeColumns.list.splice(newIndex, 0, oldItem)
			console.log('changeColumns.list', changeColumns.list)
			nextTick(() => {
				showBase.value = true
				nextTick(() => {
					colDrop()
					// 新增：列拖拽后重新应用保存的列宽
					initColumnWidth(true)
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
	const uniqueFunc = (arr, uniId) => {
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
			// console.log(visibleColumn)
			break
		}
	}
}
// header清空
const resetSearch = () => {
	SearchHeaderRef.value.resetSearch()
}
// 表头单元格点击事件
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
// 表头单元格类
const headerCellClassName = props.hasAdd
	? ({ column }) => {
			if (column.field === props.tableColumns[props.tableColumns.length - 1].prop) {
				// 最后一列添加事件
				return 'add'
			}
	  }
	: props.headerCellClassName
const footerMethod = props.footerConfig
	? ({ columns, data }) => {
			const render = []
			// console.log(render, 'renerd')

			const functionsObj = { 平均值: averageNum, 合计: sumNum }
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
			// console.log(render, 'renerd')
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
nextTick(() => {
	// 将表格和工具栏进行关联
	const $table = xTable.value
	const $toolbar = xToolbar.value
	if (props.showToolBar && $table && $toolbar) {
		$table.connect($toolbar) // 确保表格与工具栏绑定
		console.log('工具栏与表格已关联')
	}
	// 拿到本地缓存的表头，如果有缓存则走缓存
	const columns = JSON.parse(localStorage.getItem(props.name + '_tableColumn'))
	if (columns != null) {
		$table.getColumns().forEach(column => {
			column.visible = false
			columns.forEach(item => {
				if (column.field === item.prop) {
					// console.log(column.field, 'column')
					column.visible = true
				}
			})
		})

		if ($table) {
			$table.refreshColumn()
		}
	}
})
/**
 * field:列表显示字段（prop参数）
 */
// 操作列隐藏
const hideColEvent = field => {
	const $table = xTable.value
	if ($table) {
		$table.hideColumn(field)
	}
}
// 操作列显示
const showColEvent = field => {
	const $table = xTable.value
	if ($table) {
		$table.showColumn(field)
	}
}
// 重置操作列表
const resetColEvent = () => {
	const $table = xTable.value
	if ($table) {
		$table.resetColumn()
	}
}
// 展开树形所有节点
const toggleTreeEvent = () => {
	const $table = xTable.value
	if ($table) {
		$table.setAllTreeExpand(true)
	}
}
const clearTreeExpand = () => {
	const $table = xTable.value
	if ($table) {
		$table.clearTreeExpand()
	}
}

// 1. 防抖计时器（避免列宽调整时频繁保存）
const resizeDebounceTimer = ref(null)
// 2. 列宽存储的本地存储键名（基于props.name确保唯一性，避免多表格冲突）
const columnWidthStorageKey = computed(() => (props.name ? `${props.name}_columnWidths` : ''))
// 保存列宽到本地存储
const saveColumnWidth = (column, width) => {
	if (!columnWidthStorageKey.value) {
		console.warn('表格未配置"name"属性，无法保存列宽')
		return
	}

	const validWidth = Number(width)
	if (isNaN(validWidth) || validWidth <= 0) {
		console.warn(`无效列宽：${width}，跳过保存`)
		return
	}

	try {
		const savedWidths = localStorage.getItem(columnWidthStorageKey.value) || '{}'
		const widthMap = JSON.parse(savedWidths)
		widthMap[column.field] = validWidth
		localStorage.setItem(columnWidthStorageKey.value, JSON.stringify(widthMap))
		console.log(`列宽保存成功：${column.field} = ${validWidth}px`)
	} catch (error) {
		console.error('列宽保存失败：', error)
	}
}
// 新增：初始化时读取本地存储的列宽
/**
 * 初始化列宽（从本地存储恢复）
 * @param {Boolean} force - 是否强制覆盖现有宽度（默认false：仅列无宽度时应用）
 */
const initColumnWidth = (force = false) => {
	// 跳过无name或表格未初始化的场景
	if (!columnWidthStorageKey.value) return
	const $table = xTable.value
	if (!$table) {
		console.warn(`[${props.name}] 表格实例未初始化，延迟恢复列宽`)
		nextTick(() => initColumnWidth(force)) // 延迟1帧重试
		return
	}

	try {
		const savedWidths = getSavedColumnWidths()
		if (Object.keys(savedWidths).length === 0) return // 无保存的列宽，直接返回

		// 遍历表格列，应用保存的宽度
		const tableColumns = $table.getColumns()
		tableColumns.forEach(column => {
			const savedWidth = savedWidths[column.field]
			if (savedWidth) {
				// 强制恢复：覆盖现有宽度；非强制：仅列无宽度时应用
				if (force || !column.width) {
					column.width = Number(savedWidth)
				}
			}
		})

		// 刷新表格列，使宽度生效
		$table.refreshColumn()
		console.log(`[${props.name}] 列宽已从本地存储恢复`)
	} catch (error) {
		console.error(`[${props.name}] 列宽恢复失败：`, error)
		localStorage.removeItem(columnWidthStorageKey.value)
	}
}
/**
 * @param {Object} params - vxe-table列宽调整参数
 * @param {Object} params.column - 调整的列信息（包含field字段）
 * @param {Number} params.width - 调整后的列宽（px）
 */
const handleColumnResize = ({ column, width }) => {
	// 跳过无name的场景（无法唯一标识存储）
	if (!columnWidthStorageKey.value) {
		console.warn('表格未配置"name"属性，无法保存列宽')
		return
	}

	// 过滤无效宽度（非数字、负数、0）
	const validWidth = Number(width)
	if (isNaN(validWidth) || validWidth <= 0) {
		console.warn(`无效列宽：${width}，跳过保存`)
		return
	}

	// 防抖保存（300ms内多次调整只触发1次保存，减少localStorage读写）
	clearTimeout(resizeDebounceTimer.value)
	resizeDebounceTimer.value = setTimeout(() => {
		try {
			// 读取已保存的列宽配置
			const savedWidthsStr = localStorage.getItem(columnWidthStorageKey.value) || '{}'
			const widthMap = JSON.parse(savedWidthsStr)

			// 更新当前列的宽度
			widthMap[column.field] = validWidth

			// 写入本地存储
			localStorage.setItem(columnWidthStorageKey.value, JSON.stringify(widthMap))
			console.log(`[${props.name}] 列宽保存成功：${column.field} = ${validWidth}px`)
		} catch (error) {
			console.error(`[${props.name}] 列宽保存失败：`, error)
		}
	}, 300) // 防抖间隔可根据需求调整（建议200-500ms）
}
/**
 * 获取用户保存的列宽配置
 * @returns {Object} - 列宽配置（key: 列field, value: 宽度px）
 */

const getSavedColumnWidths = () => {
	if (!columnWidthStorageKey.value) {
		console.warn('表格未配置"name"属性，无法获取保存的列宽')
		return {}
	}

	try {
		const savedWidthsStr = localStorage.getItem(columnWidthStorageKey.value) || '{}'
		const savedWidths = JSON.parse(savedWidthsStr)
		// 过滤无效值（确保返回的宽度是有效正数）
		return Object.fromEntries(Object.entries(savedWidths).filter(([_, width]) => Number(width) > 0))
	} catch (error) {
		console.error(`[${props.name}] 获取保存的列宽失败：`, error)
		// 解析失败时清除错误存储，避免下次加载异常
		localStorage.removeItem(columnWidthStorageKey.value)
		return {}
	}
}

/**
 * 重置列宽为默认值（清除本地保存 + 恢复表格默认宽度）
 */
const resetColumnWidths = () => {
	// 1. 清除本地存储的列宽
	if (columnWidthStorageKey.value) {
		localStorage.removeItem(columnWidthStorageKey.value)
		console.log(`[${props.name}] 保存的列宽已清除`)
	}

	// 2. 恢复列的默认宽度（从props.tableColumns读取）
	const $table = xTable.value
	if ($table) {
		const tableColumns = $table.getColumns()
		tableColumns.forEach(column => {
			// 找到组件配置的默认列信息
			const defaultColConfig = props.tableColumns.find(item => item.prop === column.field)
			// 应用默认宽度（优先用item.width，无则用widthMap映射，否则清空）
			column.width = defaultColConfig
				? typeof defaultColConfig.width === 'number'
					? defaultColConfig.width
					: widthMap[defaultColConfig.width]
				: null
		})
		$table.refreshColumn()
		console.log(`[${props.name}] 列宽已重置为默认值`)
	}
}
watch(
	props.tableColumns,
	newV => {
		changeColumns.list = props.tableColumns.filter(item => item.isHidden !== true)
		// 列列表变化后，重新恢复保存的列宽
		nextTick(() => initColumnWidth(true))
	},
	{ deep: true }
)

onMounted(() => {
	if (props.showToolBar) {
		nextTick(() => {
			const confirmBtn = document.querySelector('.btn--confirm')
			if (confirmBtn) confirmBtn.innerText = '保存'
		})
	}

	// 初始化列宽（从本地存储加载）
	nextTick(() => {
		initColumnWidth()
	})
})
onUnmounted(() => {
	clearTimeout(resizeDebounceTimer.value)
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
	getRadioRecord,
	removeCheckboxRow,
	colDrop,
	resetSearch,
	hideColEvent,
	showColEvent,
	resetColEvent,
	clearCurrentColumn,
	SearchHeaderRef,
	toggleTreeEvent,
	clearTreeExpand,
	getSavedColumnWidths, // 新增：获取用户保存的列宽
	resetColumnWidths, // 新增：重置列宽为默认值
	initColumnWidth, // 新增：手动触发列宽恢复（可选）
})
</script>
<style scoped lang="scss">
.foot {
	display: flex;
	justify-content: space-between;
	padding-left: 5px;
}
:deep(.el-statistic__content) {
	font-size: inherit !important;
}
// 表格与工具栏的父容器：确保定位上下文，同时控制内部溢出
.table-with-toolbar {
	position: relative; // 关键：子元素绝对定位的基准
	overflow: visible; // 允许工具栏超出容器（避免被截断）
	// padding-right: 40px; // 给工具栏预留位置，避免表格列被遮挡
}

.vxe-toolbar {
	position: absolute;
	// top: 102px;
	right: -16px;
	z-index: 999;
	transition: all 0.5s;
	background-color: transparent;
}
.vxe-toolbar:hover {
	right: 0px;
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
.sketch_content {
	overflow: auto;
	border-top: 1px solid #eff1f4;
	border-bottom: 1px solid #eff1f4;
	padding: 0px 30px 11px 27px;
}
.el-icon--view {
	position: absolute;
	top: 17px;
	cursor: pointer;
	opacity: 0.75;
	color: #606266;
	margin-left: 5px;
}
.vxe-table--tooltip-wrapper {
	z-index: 10000 !important;
}
</style>
