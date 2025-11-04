<template>
	<el-button type="primary" icon="Filter" v-if="isShowAdvancedQuery" @click="advancedQuery">高级查询</el-button>
	<!--  高级查询构造器  -->
	<Dialog title="高级查询" v-model:visible="dialogVisible" width="60%">
		<div class="dialog-content">
			<!-- 添加新组按钮 -->
			<div class="add-group-container">
				<el-button type="primary" @click="addGroup" icon="Plus">添加条件组</el-button>
			</div>

			<el-form :model="queryForm" :rules="rules" ref="queryFormRef" label-width="120px" label-position="left">
				<!-- 查询条件组列表 -->
				<div v-for="(group, groupIndex) in queryForm.groups" :key="group.id" class="query-group">
					<div class="group-header">
						<div class="group-header-content">
							<el-row :gutter="10" class="group-connect-row">
								<el-col :span="3" style="display: flex; align-items: center">
									<span class="group-title">条件组 {{ groupIndex + 1 }}</span>
								</el-col>
								<el-col :span="18">
									<el-form-item
										label="连接条件:"
										:prop="`groups[${groupIndex}].connectType`"
										:rules="groupFilterRules"
										class="connect-form-item"
									>
										<el-select v-model="group.connectType" placeholder="请选择连接条件" class="connect-select">
											<el-option label="AND(与前一个条件组连接)" value="AND"></el-option>
											<el-option label="OR(或前一个条件组连接)" value="OR"></el-option>
										</el-select>
									</el-form-item>
								</el-col>
							</el-row>
						</div>
						<div class="group-actions">
							<el-button
								type="danger"
								icon="Minus"
								@click="removeGroup(groupIndex)"
								:disabled="queryForm.groups.length <= 1"
							></el-button>
						</div>
					</div>

					<!-- 组内过滤条件匹配 -->
					<el-row :gutter="10" class="group-filter-row">
						<el-col :span="18">
							<el-form-item
								label="组内匹配:"
								:prop="`groups[${groupIndex}].filterType`"
								:rules="groupFilterRules"
								class="filter-form-item"
							>
								<el-select v-model="group.filterType" placeholder="请选择组内匹配" class="filter-select" :disabled="group.conditions.length === 1">
									<el-option label="AND(组内所有条件都要求匹配)" value="AND"></el-option>
									<el-option label="OR(组内条件中的任意一个匹配)" value="OR"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-button type="primary" @click="addConditionToGroup(group)" icon="Plus" class="add-condition-btn">
								添加条件
							</el-button>
						</el-col>
					</el-row>

					<!-- 组内条件列表 -->
					<div v-for="(condition, conditionIndex) in group.conditions" :key="condition.id" class="condition-wrapper">
						<el-row :gutter="10" class="condition-row">
							<!-- 前端表格字段 -->
							<el-col :span="6" :md="6" :sm="8" :xs="24" class="condition-item">
								<el-select
									v-model="condition.columnName"
									placeholder="请选择前端表格字段"
									@change="handleColumnChange(condition, $event)"
									clearable
									class="full-width"
								>
									<el-option
										v-for="item in tableColumns"
										:key="item.prop"
										:label="item.label"
										:value="item.prop"
									></el-option>
								</el-select>
							</el-col>

							<!-- 运算符 -->
							<el-col :span="6" :md="6" :sm="8" :xs="24" class="condition-item">
								<Select
									:selectData="getFilteredOperatorOptions(condition.columnType)"
									v-model:value="condition.operator"
									v-model:label="condition.operatorLabel"
									:placeholder="'请选择运算符'"
									:disabled="!condition.columnName"
									@change="handleOperatorChange(condition, $event)"
									class="full-width"
								/>
							</el-col>

							<!-- 条件值 -->
							<el-col :span="8" :md="8" :sm="8" :xs="24" class="condition-item">
								<!-- 条件值 - 根据字段类型动态显示 -->
								<template v-if="condition.columnName && condition.operator">
									<!-- 不需要值的运算符 -->
									<template v-if="['empty', 'notEmpty'].includes(condition.operator)">
										<el-input
											v-model="condition.value"
											placeholder="该运算符无需输入值"
											disabled
											class="disabled-input"
										/>
									</template>
									<!-- 区间类型（当运算符为 'interval' 或 'between' 时） -->
									<template v-else-if="condition.operator === 'interval' || condition.operator === 'between'">
										<!-- 文本类型的区间 -->
										<template v-if="condition.columnType === '1'">
											<el-row :gutter="5" class="interval-row">
												<el-col :span="11">
													<el-input v-model="condition.startValue" placeholder="开始值" />
												</el-col>
												<el-col :span="2" class="interval-separator">-</el-col>
												<el-col :span="11">
													<el-input v-model="condition.endValue" placeholder="结束值" />
												</el-col>
											</el-row>
										</template>
										<!-- 其他区间类型保持不变 -->
										<template v-else-if="condition.columnType === '3'">
											<el-row :gutter="5" class="interval-row">
												<el-col :span="11">
													<el-input-number
														v-model="condition.startValue"
														placeholder="开始值"
														class="full-width"
														:controls="false"
													/>
												</el-col>
												<el-col :span="2" class="interval-separator">-</el-col>
												<el-col :span="11">
													<el-input-number
														v-model="condition.endValue"
														placeholder="结束值"
														class="full-width"
														:controls="false"
													/>
												</el-col>
											</el-row>
										</template>
										<template v-else-if="condition.columnType === '4'">
											<el-row :gutter="5" class="interval-row">
												<el-col :span="11">
													<el-date-picker
														v-model="condition.startValue"
														type="datetime"
														placeholder="开始时间"
														:format="getDateFormat(condition.dateFormat)"
														:value-format="getDateFormat(condition.dateFormat)"
														class="full-width"
													/>
												</el-col>
												<el-col :span="2" class="interval-separator">-</el-col>
												<el-col :span="11">
													<el-date-picker
														v-model="condition.endValue"
														type="datetime"
														placeholder="结束时间"
														:format="getDateFormat(condition.dateFormat)"
														:value-format="getDateFormat(condition.dateFormat)"
														class="full-width"
													/>
												</el-col>
											</el-row>
										</template>
										<template v-else-if="condition.columnType === '5' || condition.columnType === '6'">
											<el-row :gutter="5" class="interval-row">
												<el-col :span="11">
													<Select
														:dataConfig="getSelectDataConfig(condition)"
														v-model:value="condition.startValue"
														v-model:label="condition.startValueLabel"
														:placeholder="'开始值'"
														class="full-width"
													/>
												</el-col>
												<el-col :span="2" class="interval-separator">-</el-col>
												<el-col :span="11">
													<Select
														:dataConfig="getSelectDataConfig(condition)"
														v-model:value="condition.endValue"
														v-model:label="condition.endValueLabel"
														:placeholder="'结束值'"
														class="full-width"
													/>
												</el-col>
											</el-row>
										</template>
										<template v-else>
											<el-row :gutter="5" class="interval-row">
												<el-col :span="11">
													<el-input v-model="condition.startValue" placeholder="开始值" />
												</el-col>
												<el-col :span="2" class="interval-separator">-</el-col>
												<el-col :span="11">
													<el-input v-model="condition.endValue" placeholder="结束值" />
												</el-col>
											</el-row>
										</template>
									</template>
									<!-- 非区间类型（运算符不是 'interval' 或 'between'） -->
									<template v-else>
										<!-- 文本类型 -->
										<el-input v-if="condition.columnType === '1'" v-model="condition.value" placeholder="请输入文本" />
										<!-- 数字类型 -->
										<el-input-number
											v-else-if="condition.columnType === '3'"
											v-model="condition.value"
											placeholder="请输入数字"
											class="full-width"
											:controls="false"
										/>
										<!-- 日期类型 -->
										<el-date-picker
											v-else-if="condition.columnType === '4'"
											v-model="condition.value"
											type="datetime"
											placeholder="请选择日期时间"
											:format="getDateFormat(condition.dateFormat)"
											:value-format="getDateFormat(condition.dateFormat)"
											class="full-width"
										/>
										<!-- 单选下拉框类型 -->
										<Select
											v-else-if="condition.columnType === '5'"
											:dataConfig="getSelectDataConfig(condition)"
											v-model:value="condition.value"
											v-model:label="condition.valueLabel"
											:placeholder="'请选择'"
											class="full-width"
										/>
										<!-- 多选下拉框类型 -->
										<Select
											v-else-if="condition.columnType === '6'"
											:dataConfig="getSelectDataConfig(condition)"
											v-model:value="condition.value"
											v-model:label="condition.valueLabel"
											:placeholder="'请选择'"
											multiple
											class="full-width"
										/>
										<!-- 其他类型默认显示文本框 -->
										<el-input v-else v-model="condition.value" placeholder="请输入值" />
									</template>
								</template>
								<el-input v-else v-model="condition.value" placeholder="请先选择字段和运算符" disabled />
							</el-col>

							<!-- 操作按钮 -->
							<el-col :span="2" :md="2" :sm="24" :xs="24" class="condition-actions">
								<div class="action-buttons">
									<el-button
										type="danger"
										icon="Minus"
										@click="removeConditionFromGroup(group, conditionIndex)"
										:disabled="group.conditions.length <= 1"
										plain
									></el-button>
								</div>
							</el-col>
						</el-row>
					</div>
				</div>
			</el-form>
		</div>
		<template #footer>
			<div class="footer-box">
				<div class="footer-left">
					<el-button type="warning" @click="resetAll">重 置</el-button>
					<el-button type="primary" @click="saveQueryConditions">保存查询条件</el-button>
				</div>
				<div class="footer-right">
					<el-button @click="dialogVisible = false">关 闭</el-button>
					<el-button type="primary" @click="handleQuery">查 询</el-button>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Dialog from '@/components/Dialog/index.vue'
import Select from '@/components/Select/index.vue'
import api from '@/api/system/columnConfigManager'
import { convertToMysql, convertToOracle } from '@/utils/common/data'
import usePermissionStore from '@/store/modules/permission'
import publicApi from '@/api/public'

import { inject } from 'vue'
import { useRoute } from 'vue-router'

const permissionStore = usePermissionStore()
const route = useRoute()
const props = defineProps({
	// 是否显示查询条件
	isShowAdvancedQuery: {
		type: Boolean,
		default: false,
	},
	// 表格id
	id: {
		type: String,
		default: null,
	},
})

const onQuery = inject('onQuery') // 注入父组件提供的方法

// 对话框显示状态
const dialogVisible = ref(false)

// 查询表单数据
const queryForm = ref({
	groups: [],
})

const advancedQuery = () => {
	getTableColumns()
	dialogVisible.value = true
}

//菜单id
const menuId = ref('')

// 表格列配置
const tableColumns = ref([])

// 表单验证规则
const rules = ref({})

// 组内过滤条件验证规则
const groupFilterRules = [{ required: true, message: '请选择连接条件', trigger: 'blur' }]

// 表单引用
const queryFormRef = ref(null)

//菜单id
const menuDataList = ref([])

// 根据字段类型过滤运算符的映射关系
const operatorTypeMap = {
	1: ['equals', 'notEquals', 'empty', 'notEmpty', 'contain', 'notContain'], // 文本
	3: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterEqualsThan', 'lessEqualsThan', 'empty', 'notEmpty', 'interval'], // 数字
	4: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterEqualsThan', 'lessEqualsThan', 'empty', 'notEmpty', 'interval'], // 日期
	5: ['equals', 'notEquals', 'empty', 'notEmpty', 'equalsAny', 'notEqualsAny'], // 单选下拉框
	6: ['equals', 'notEquals', 'empty', 'notEmpty', 'containAll', 'containAny'], // 多选下拉框
}

// 运算符标签映射
const operatorLabelMap = {
	equals: '等于',
	notEquals: '不等于',
	greaterThan: '大于',
	lessThan: '小于',
	greaterEqualsThan: '大于等于',
	lessEqualsThan: '小于等于',
	empty: '为空',
	notEmpty: '非空',
	contain: '包含',
	notContain: '不包含',
	containAll: '同时包含',
	containAny: '包含任意一个',
	interval: '区间',
	equalsAny: '等于任意一个',
	notEqualsAny: '不等于任意一个',
}

// 日期格式映射
const dateFormatMap = ref([])
const getDateFormatOptions = async () => {
	// 获取日期格式
	const dateRes = await publicApi.getLocalSelect({ type: 'CONSTANT', types: 'AD_SEARCH_COL_DATE_FORMAT' })
	dateFormatMap.value = dateRes.data.map(item => ({
		value: item.value,
		label: item.label,
	}))
}

/**
 * 获取下拉框数据配置
 */
const getSelectDataConfig = condition => {
	if (!condition.colSelectSource || !condition.colSelectKey) {
		return {
			url: '/api/internal/public/getLocalSelect',
			params: {},
		}
	}

	// 根据 colSelectSource 的不同值设置不同的参数
	if (condition.colSelectSource === 'DICT') {
		return {
			url: '/api/internal/public/getLocalSelect',
			params: {
				type: condition.colSelectSource,
				dictType: condition.colSelectKey,
			},
		}
	} else if (condition.colSelectSource === 'CONSTANT') {
		return {
			url: '/api/internal/public/getLocalSelect',
			params: {
				type: condition.colSelectSource,
				types: condition.colSelectKey,
			},
		}
	} else {
		// 其他情况默认使用 type 和 types 参数
		return {
			url: '/api/internal/public/getLocalSelect',
			params: {
				type: condition.colSelectSource,
				types: condition.colSelectKey,
			},
		}
	}
}

/**
 * 获取过滤后的运算符选项
 */
const getFilteredOperatorOptions = columnType => {
	if (!columnType) {
		return []
	}

	const allowedOperators = operatorTypeMap[columnType] || []
	return allowedOperators.map(op => ({
		value: op,
		label: operatorLabelMap[op] || op,
	}))
}

// 创建新的查询条件对象
function createNewCondition() {
	return {
		id: Date.now() + Math.floor(Math.random() * 1000),
		columnName: '',
		operator: '',
		operatorLabel: '',
		value: '',
		startValue: null,
		endValue: null,
		startValueLabel: null,
		endValueLabel: null,
		valueLabel: null,
		dateFormat: '1', // 默认日期格式code
	}
}

// 创建新的查询组
function createNewGroup() {
	return {
		id: Date.now() + Math.floor(Math.random() * 1000),
		connectType: 'AND', // 连接条件 - 与前一个条件组的连接方式
		filterType: 'AND', // 组内匹配
		conditions: [createNewCondition()],
	}
}

/**
 * 获取日期格式
 */
const getDateFormat = dateFormatCode => {
	console.log('dateFormatCode =>', dateFormatCode);
	console.log('dateFormatMap.value.find(item => item.value == dateFormatCode)?.label =>', dateFormatMap.value.find(item => item.value == dateFormatCode)?.label);
	return dateFormatMap.value.find(item => item.value == dateFormatCode)?.label || ''
}

/**
 * 运算符选择变化时的处理
 * @param condition 查询条件对象
 * @param selectedValue 选择的运算符值
 */
const handleOperatorChange = (condition, selectedValue) => {
	// 如果是不需要值的运算符，清空所有值
	if (['empty', 'notEmpty'].includes(selectedValue)) {
		condition.value = null
		condition.valueLabel = null
		condition.startValue = null
		condition.endValue = null
		condition.startValueLabel = null
		condition.endValueLabel = null
	}
	// 如果从不需要值的运算符切换到区间运算符
	else if (selectedValue === 'interval' || selectedValue === 'between') {
		condition.value = null
		condition.valueLabel = null
		// 如果区间值未设置，初始化为空
		if (condition.startValue === undefined) condition.startValue = null
		if (condition.endValue === undefined) condition.endValue = null
	}
	// 如果从不需要值或区间运算符切换到普通运算符
	else {
		condition.startValue = null
		condition.endValue = null
		condition.startValueLabel = null
		condition.endValueLabel = null
	}
}
// 添加查询条件到组
const addConditionToGroup = group => {
	if (group.conditions.length < 5) {
		group.conditions.push(createNewCondition())
	} else {
		ElMessage.warning('最多只能添加5个查询条件')
	}
}

// 从组中移除查询条件
const removeConditionFromGroup = (group, index) => {
	if (group.conditions.length > 1) {
		group.conditions.splice(index, 1)
	} else {
		ElMessage.warning('至少保留一个查询条件')
	}
}

// 添加新组
const addGroup = () => {
	queryForm.value.groups.push(createNewGroup())
}

// 移除组
const removeGroup = index => {
	if (queryForm.value.groups.length > 1) {
		queryForm.value.groups.splice(index, 1)
	} else {
		ElMessage.warning('至少保留一个条件组')
	}
}

// 处理字段变更
// 字段选择变化时的处理
const handleColumnChange = (condition, selectedValue) => {
	// 根据选中的字段更新条件中的字段类型和选择键
	const selectedCol = tableColumns.value.find(col => col.colKey == selectedValue)
	if (selectedCol) {
		condition.columnType = selectedCol.colType
		condition.colSelectKey = selectedCol.colSelectKey
		condition.colSelectSource = selectedCol.colSelectSource
		condition.dateFormat = selectedCol.dateFormat || ''
		// 设置日期格式
		if (selectedCol.colType === '4' && selectedCol.dateFormat) {
			condition.dateFormat = selectedCol.dateFormat
		}
		// 清空之前的值和运算符
		condition.value = null
		condition.valueLabel = null
		condition.startValue = null
		condition.endValue = null
		condition.startValueLabel = null
		condition.endValueLabel = null
		condition.operator = null
		condition.operatorLabel = null
	}
}

// 获取列的显示名称
const getColumnLabel = columnKey => {
	if (!columnKey) return '未选择字段'
	const column = tableColumns.value.find(item => item.prop === columnKey)
	return column ? column.label : columnKey
}

/**
 * @description 验证当前查询条件
 * @param isSubmit 是否提交查询
 */

const validateConditions = (isSubmit = true) => {
	if (queryForm.value.groups.length === 0) {
		isSubmit && ElMessage.error('至少需要一个查询条件组')
		return false
	}

	for (let groupIndex = 0; groupIndex < queryForm.value.groups.length; groupIndex++) {
		const group = queryForm.value.groups[groupIndex]

		if (!group.connectType) {
			isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组请选择连接条件`)
			return false
		}

		if (!group.filterType) {
			isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组请选择组内匹配`)
			return false
		}

		for (let conditionIndex = 0; conditionIndex < group.conditions.length; conditionIndex++) {
			const condition = group.conditions[conditionIndex]

			if (!condition.columnName) {
				isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组的第${conditionIndex + 1}个条件请选择前端表格字段`)
				return false
			}

			if (!condition.operator) {
				isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组的第${conditionIndex + 1}个条件请选择运算符`)
				return false
			}

			// 不需要值的运算符，跳过验证
			if (['empty', 'notEmpty'].includes(condition.operator)) {
				continue
			}

			// 区间运算符需要两个值
			if (condition.operator === 'interval' || condition.operator === 'between') {
				if (condition.startValue === null || condition.endValue === null) {
					isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组的第${conditionIndex + 1}个条件请设置完整的区间值`)
					return false
				}
			}
			// 其他运算符需要一个值
			else if (!condition.value) {
				isSubmit && ElMessage.error(`第${groupIndex + 1}个条件组的第${conditionIndex + 1}个条件请设置条件值`)
				return false
			}
		}
	}

	return true
}
// 处理查询
const handleQuery = () => {
	if (validateConditions()) {
		// 构建查询参数
		const queryParams = queryForm.value.groups.map(group => {
			return {
				connectType: group.connectType, // 连接条件
				filterType: group.filterType, // 组内匹配
				conditions: group.conditions.map(cond => {
					const column = tableColumns.value.find(item => item.prop === cond.columnName)
					
					// 处理多选类型的值
					let processedValue = cond.value
					let processedStartValue = cond.startValue
					let processedEndValue = cond.endValue
					
					if (column && column.colType === '6') {
						// 如果是多选类型且值是数组，转换为逗号分隔的字符串
						if (Array.isArray(cond.value)) {
							processedValue = cond.value.join(',')
						}
						// 如果区间值也是数组
						if (Array.isArray(cond.startValue)) {
							processedStartValue = cond.startValue.join(',')
						}
						if (Array.isArray(cond.endValue)) {
							processedEndValue = cond.endValue.join(',')
						}
					}
					
					return {
						columnName: cond.columnName,
						columnLabel: getColumnLabel(cond.columnName),
						operator: cond.operator,
						operatorLabel: cond.operatorLabel,
						value: processedValue, // 使用处理后的值
						startValue: processedStartValue, // 使用处理后的值
						endValue: processedEndValue, // 使用处理后的值
						colType: column ? column.colType : '',
						dateFormat: getDateFormat(cond.dateFormat), // 日期格式code
					}
				}),
			}
		})

		// 转换为SQL格式（这里需要根据新的数据结构调整）
		// const sql = convertToMysql(conditions.value, queryForm.value.filterType)
		// const oracleSql = convertToOracle(conditions.value, queryForm.value.filterType)
		// queryParams.sql = sql

		console.log('queryParams =>', queryParams)
		// console.log('Generated SQL =>', queryParams.sql)
		// console.log('Generated Oracle SQL =>', oracleSql)

		// 触发查询事件
		onQuery(queryParams)

		ElMessage.success('查询条件已应用')
		dialogVisible.value = false
	}
}

// 保存查询条件到本地存储
const saveQueryConditions = () => {
	if (!validateConditions(false)) {
		return
	}

	const queryData = {
		groups: JSON.parse(JSON.stringify(queryForm.value.groups)),
		updatedAt: new Date().toISOString(),
	}

	const storageKey = `advancedQuery_${props.id}`
	localStorage.setItem(storageKey, JSON.stringify(queryData))

	ElMessage.success('查询条件保存成功')
}

// 从本地存储加载查询条件
const loadQueryConditions = () => {
	const storageKey = `advancedQuery_${props.id}`
	const stored = localStorage.getItem(storageKey)

	if (stored) {
		try {
			const queryData = JSON.parse(stored)
			queryForm.value.groups = queryData.groups || [createNewGroup()]
		} catch (e) {
			console.error('加载查询条件失败', e)
			localStorage.removeItem(storageKey)
			// 使用默认值
			queryForm.value.groups = [createNewGroup()]
		}
	} else {
		// 没有保存的查询条件，使用默认值
		queryForm.value.groups = [createNewGroup()]
	}
}

/**
 * @description 查询菜单下拉数结构
 * @param {*} route 当前路由信息
 */
const getTreeselect = async () => {
	// 从store中获取菜单数据，而不是调用接口
	const menuData = permissionStore.getMenuData()
	menuDataList.value = menuData
	// 查找当前路由对应的菜单项
	const currentMenu = permissionStore.findMenuByPath(route.path)
	menuId.value = currentMenu?.id || ''
}
/**
 * @description 查询表格下拉数结构
 * @param {*} props 组件属性
 */
const getTableColumns = () => {
	api.getDetail({
		menuId: menuId.value,
		tableId: props.id,
	}).then(res => {
		tableColumns.value = res.data.map(item => ({
			prop: item.colKey,
			label: item.colLabel,
			colSelectKey: item.colSelectKey,
			colSelectSource: item.colSelectSource,
			colType: item.colType,
			dateFormat: item.dateFormat || '1', // 默认日期格式code
			...item,
		}))
	})
}

// 重置所有条件
const resetAll = () => {
	ElMessageBox.confirm('确定要重置查询条件并清空本地保存的查询配置吗？', '确认重置', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			queryForm.value.groups = [createNewGroup()]

			// 清空本地存储中对应的查询条件
			if (props.id) {
				const storageKey = `advancedQuery_${props.id}`
				localStorage.removeItem(storageKey)
			}

			ElMessage.success('查询条件已重置')
		})
		.catch(() => {
			// 用户取消操作
		})
}

// 组件挂载时加载保存的查询条件
onMounted(async () => {
	getDateFormatOptions()
	await getTreeselect()
	// 只有在表格ID存在时才加载查询条件
	if (props.id) {
		loadQueryConditions()
	} else {
		// 如果没有ID，初始化一个空的组
		queryForm.value.groups = [createNewGroup()]
	}
})

// 定义组件事件
const emit = defineEmits(['query'])
</script>

<style scoped lang="scss">
.dialog-content {
	padding: 10px 0;
}

.query-group {
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	background-color: #ffffff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
}

.query-group:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	border-color: #dcdfe6;
}

.group-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid #f0f0f0;
}

.group-header-content {
	flex: 1;
}

.group-title {
	font-weight: 600;
	color: #303133;
	font-size: 14px;
	// margin-bottom: 8px;
	display: block;
}

.group-connect-row {
	margin-bottom: 0;
}

.connect-form-item {
	margin-bottom: 0;
}

.connect-select {
	width: 100%;
}

.group-actions {
	display: flex;
	gap: 8px;
	align-self: flex-start;
	margin-left: 12px;
}

.group-filter-row {
	margin-bottom: 16px;
	padding: 0 8px;
}

.filter-form-item {
	margin-bottom: 0;
}

.filter-select {
	width: 100%;
}

.add-condition-btn {
	width: 100%;
}

.condition-wrapper {
	margin-bottom: 8px;
}

.condition-row {
	padding: 10px 0;
	border-bottom: 1px solid #f5f7fa;
	display: flex;
	align-items: flex-start;
	gap: 10px;
	transition: background-color 0.2s ease;
}

.condition-row:hover {
	background-color: #f9f9f9;
}

.condition-row:last-child {
	border-bottom: none;
}

.condition-item {
	min-width: 0; /* 允许flex item收缩 */
}

.interval-row {
	display: flex;
	align-items: center;
	width: 100%;
}

.interval-separator {
	text-align: center;
	line-height: 32px;
	flex-shrink: 0;
	font-weight: bold;
	color: #909399;
}

.full-width {
	width: 100%;
}

.condition-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.action-buttons {
	display: flex;
	gap: 6px;
	flex-wrap: nowrap;
}

.action-buttons .el-button {
	flex-shrink: 0;
}

.add-group-container {
	text-align: center;
	margin: 0px 0 10px 0;
}

.add-group-container .el-button {
	padding: 8px 20px;
}

.footer-box {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
	padding-top: 10px;
	border-top: 1px solid #ebeef5;
}

.footer-left,
.footer-right {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	justify-content: flex-start;
}
.disabled-input {
	:deep(.el-input__wrapper) {
		background-color: #f5f7fa;
		cursor: not-allowed;
		opacity: 0.7;
	}

	:deep(.el-input__inner) {
		color: #909399;
	}
}

.condition-item {
	transition: all 0.3s ease;
}

/* 隐藏不需要的输入框时的动画效果 */
.condition-item[style*='display: none'] {
	opacity: 0;
	transform: scale(0.95);
	transition: all 0.2s ease;
}
/* 响应式调整 */
@media (max-width: 768px) {
	.dialog-content {
		padding: 5px 0;
	}

	.query-group {
		padding: 12px;
		margin-bottom: 12px;
	}

	.group-header {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
	}

	.group-actions {
		align-self: flex-end;
		margin-left: 0;
		margin-top: 8px;
	}

	.condition-row {
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
	}

	.condition-item,
	.condition-actions {
		width: 100%;
	}

	.interval-row {
		flex-direction: row;
		gap: 5px;
	}

	.interval-row .el-col {
		flex: 1;
	}

	.interval-separator {
		flex-shrink: 0;
	}

	.footer-box {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
	}

	.footer-left,
	.footer-right {
		justify-content: center;
		width: 100%;
	}

	.interval-row {
		flex-direction: column;
		gap: 5px;
	}

	.interval-row .el-col {
		width: 100%;
	}

	.interval-separator {
		line-height: 1.5;
	}
}

@media (max-width: 480px) {
	.action-buttons {
		flex-direction: column;
		align-items: flex-start;
	}

	.footer-left,
	.footer-right {
		flex-direction: column;
		align-items: stretch;
	}

	.footer-left .el-button,
	.footer-right .el-button {
		width: 100%;
		margin-bottom: 5px;
	}

	.interval-row {
		flex-direction: column;
		gap: 5px;
	}

	.interval-separator {
		text-align: center;
	}
}
</style>