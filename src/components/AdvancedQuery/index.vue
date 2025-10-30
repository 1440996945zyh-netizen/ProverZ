
<template>
	<el-button type="primary" icon="Filter" v-if="isShowAdvancedQuery" @click="advancedQuery">高级查询</el-button>
	<!--  高级查询构造器  -->
	<Dialog title="高级查询" v-model:visible="dialogVisible" width="50%">
		<div class="dialog-content">
			<el-form :model="queryForm" :rules="rules" ref="queryFormRef" label-width="120px" label-position="left">
				<!-- 过滤条件匹配 -->
				<el-row>
					<el-form-item label="过滤条件匹配:" prop="filterType" style="width: 350px">
						<el-select v-model="queryForm.filterType" placeholder="请选择过滤条件匹配">
							<el-option label="AND(所有条件都要求匹配)" value="AND"></el-option>
							<el-option label="OR(条件中的任意一个匹配)" value="OR"></el-option>
						</el-select>
					</el-form-item>
				</el-row>

				<!-- 动态查询条件行 -->
				<div v-for="(condition, index) in conditions" :key="index">
					<el-row :gutter="20" class="condition-row">
						<!-- 前端表格字段 -->
						<el-col :span="4">
							<el-select
								v-model="condition.columnName"
								placeholder="请选择前端表格字段"
								@change="handleColumnChange(condition, $event)"
								clearable
							>
								<el-option v-for="item in tableColumns" :key="item.prop" :label="item.label" :value="item.prop"></el-option>
							</el-select>
						</el-col>

						<!-- 运算符 -->
						<el-col :span="5">
							<Select
								:selectData="getFilteredOperatorOptions(condition.columnType)"
								v-model:value="condition.operator"
								v-model:label="condition.operatorLabel"
								:placeholder="'请选择运算符'"
								:disabled="!condition.columnName"
								@change="handleOperatorChange(condition, $event)"
							/>
						</el-col>

						<!-- 条件值 -->
						<el-col :span="getConditionValueSpan(condition)">
							<!-- 条件值 - 根据字段类型动态显示 -->
							<template v-if="condition.columnType">
								<!-- 区间类型（当运算符为 'interval' 或 'between' 时） -->
								<template v-if="condition.operator === 'interval' || condition.operator === 'between'">
									<!-- 文本类型的区间 -->
									<template v-if="condition.columnType === '1'">
										<el-row :gutter="5" style="width: 100%">
											<el-col :span="11">
												<el-input v-model="condition.startValue" placeholder="开始值" />
											</el-col>
											<el-col :span="2" style="text-align: center; line-height: 32px">-</el-col>
											<el-col :span="11">
												<el-input v-model="condition.endValue" placeholder="结束值" />
											</el-col>
										</el-row>
									</template>

									<!-- 数字类型的区间 -->
									<template v-else-if="condition.columnType === '3'">
										<el-row :gutter="5" style="width: 100%">
											<el-col :span="11">
												<el-input-number v-model="condition.startValue" placeholder="开始值" style="width: 100%" />
											</el-col>
											<el-col :span="2" style="text-align: center; line-height: 32px">-</el-col>
											<el-col :span="11">
												<el-input-number v-model="condition.endValue" placeholder="结束值" style="width: 100%" />
											</el-col>
										</el-row>
									</template>

									<!-- 日期类型的区间 -->
									<template v-else-if="condition.columnType === '4'">
										<el-row :gutter="5" style="width: 100%">
											<el-col :span="11">
												<el-date-picker
													v-model="condition.startValue"
													type="datetime"
													placeholder="开始时间"
													format="YYYY-MM-DD HH:mm:ss"
													value-format="YYYY-MM-DD HH:mm:ss"
													style="width: 100%"
												/>
											</el-col>
											<el-col :span="2" style="text-align: center; line-height: 32px">-</el-col>
											<el-col :span="11">
												<el-date-picker
													v-model="condition.endValue"
													type="datetime"
													placeholder="结束时间"
													format="YYYY-MM-DD HH:mm:ss"
													value-format="YYYY-MM-DD HH:mm:ss"
													style="width: 100%"
												/>
											</el-col>
										</el-row>
									</template>

									<!-- 下拉框类型的区间 -->
									<template v-else-if="condition.columnType === '5' || condition.columnType === '6'">
										<el-row :gutter="5" style="width: 100%">
											<el-col :span="11">
												<Select
													:dataConfig="{
														url: '/api/internal/public/getSelectData',
														params: {
															type: 'DYNAMIC',
															selectKey: condition.colSelectKey,
														},
													}"
													v-model:value="condition.startValue"
													v-model:label="condition.startValueLabel"
													:placeholder="'开始值'"
													style="width: 100%"
												/>
											</el-col>
											<el-col :span="2" style="text-align: center; line-height: 32px">-</el-col>
											<el-col :span="11">
												<Select
													:dataConfig="{
														url: '/api/internal/public/getSelectData',
														params: {
															type: 'DYNAMIC',
															selectKey: condition.colSelectKey,
														},
													}"
													v-model:value="condition.endValue"
													v-model:label="condition.endValueLabel"
													:placeholder="'结束值'"
													style="width: 100%"
												/>
											</el-col>
										</el-row>
									</template>

									<!-- 其他类型的区间（默认为文本输入） -->
									<template v-else>
										<el-row :gutter="5" style="width: 100%">
											<el-col :span="11">
												<el-input v-model="condition.startValue" placeholder="开始值" />
											</el-col>
											<el-col :span="2" style="text-align: center; line-height: 32px">-</el-col>
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
									/>

									<!-- 日期类型 -->
									<el-date-picker
										v-else-if="condition.columnType === '4'"
										v-model="condition.value"
										type="datetime"
										placeholder="请选择日期时间"
										format="YYYY-MM-DD HH:mm:ss"
										value-format="YYYY-MM-DD HH:mm:ss"
									/>

									<!-- 单选下拉框类型 -->
									<Select
										v-else-if="condition.columnType === '5'"
										:dataConfig="{
											url: '/api/internal/public/getSelectData',
											params: {
												type: 'DYNAMIC',
												selectKey: condition.colSelectKey,
											},
										}"
										v-model:value="condition.value"
										v-model:label="condition.valueLabel"
										:placeholder="'请选择'"
									/>

									<!-- 多选下拉框类型 -->
									<Select
										v-else-if="condition.columnType === '6'"
										:dataConfig="{
											url: '/api/internal/public/getSelectData',
											params: {
												type: 'DYNAMIC',
												selectKey: condition.colSelectKey,
											},
										}"
										v-model:value="condition.value"
										v-model:label="condition.valueLabel"
										:placeholder="'请选择'"
										mode="multiple"
									/>

									<!-- 其他类型默认显示文本框 -->
									<el-input v-else v-model="condition.value" placeholder="请输入值" />
								</template>
							</template>
							<el-input v-else v-model="condition.value" placeholder="请先选择字段" disabled />
						</el-col>
						<!-- 空白col保持样式统一 -->
						<el-col :span="5" v-if="getConditionValueSpan(condition) === 6"></el-col>
						<!-- 操作按钮 -->
						<el-col :span="4">
							<el-button type="primary" @click="addCondition" icon="Plus" :disabled="conditions.length >= 5"></el-button>
							<el-button
								type="danger"
								icon="Minus"
								@click="removeCondition(index)"
								:disabled="conditions.length <= 1"
							></el-button>
						</el-col>
					</el-row>
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Dialog from '@/components/Dialog/index.vue'
import Select from '@/components/Select/index.vue'
import api from '@/api/system/columnConfigManager'
import { convertToMysql, convertToOracle } from '@/utils/common/data'
import usePermissionStore from '@/store/modules/permission'
import { inject } from 'vue'
const permissionStore = usePermissionStore()
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
const { proxy } = getCurrentInstance()
// 对话框显示状态
const dialogVisible = ref(false)
// 查询表单数据
const queryForm = ref({
	filterType: 'AND',
})
const advancedQuery = () => {
	getTableColumns()
	dialogVisible.value = true
}
//菜单id
const menuId = ref('')
// 表格列配置
const tableColumns = ref([])

// 条件列表
const conditions = ref([createNewCondition()])

// 所有运算符选项
const allOperatorOptions = ref([])

const route = useRoute()
// 表单验证规则
const rules = ref({
	filterType: [{ required: true, message: '请选择过滤条件匹配', trigger: 'blur' }],
})

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

/**
 * 获取条件值的span宽度
 * @param condition 查询条件对象
 * @returns 条件值的span宽度
 */
const getConditionValueSpan = condition => {
	// 如果是区间运算符，返回11（为两个输入框留出足够空间）
	if (condition.operator === 'interval' || condition.operator === 'between') {
		return 11
	}
	// 否则返回较小的值，比如6或8（根据实际需要调整）
	return 6
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
	}
}

/**
 * 运算符选择变化时的处理
 * @param condition 查询条件对象
 * @param selectedValue 选择的运算符值
 */
const handleOperatorChange = (condition, selectedValue) => {
	console.log('condition, selectedValue =>', condition, selectedValue)
	// 如果从区间运算符切换到非区间运算符，清空区间值
	if (selectedValue !== 'interval' && selectedValue !== 'between') {
		condition.startValue = null
		condition.endValue = null
		condition.startValueLabel = null
		condition.endValueLabel = null
	} else {
		// 如果从非区间运算符切换到区间运算符，清空单值
		condition.value = null
		condition.valueLabel = null
	}
}

// 添加查询条件
const addCondition = () => {
	if (conditions.value.length < 5) {
		conditions.value.push(createNewCondition())
	} else {
		ElMessage.warning('最多只能添加5个查询条件')
	}
}

// 移除查询条件
const removeCondition = index => {
	if (conditions.value.length > 1) {
		conditions.value.splice(index, 1)
	} else {
		ElMessage.warning('至少保留一个查询条件')
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

// 验证当前查询条件
const validateConditions = (isSubmit = true) => {
	for (const condition of conditions.value) {
		if (!condition.columnName) {
			isSubmit && ElMessage.error('请选择前端表格字段')
			return false
		}

		if (!condition.operator) {
			isSubmit && ElMessage.error(`请为【${getColumnLabel(condition.columnName)}】选择运算符`)
			return false
		}

		// 不需要值的运算符
		if (['is null', 'is not null'].includes(condition.operator)) {
			continue
		}

		// 区间运算符需要两个值
		if (condition.operator === 'interval' || condition.operator === 'between') {
			if (condition.startValue === null || condition.endValue === null) {
				isSubmit && ElMessage.error(`请为【${getColumnLabel(condition.columnName)}】设置完整的区间值`)
				return false
			}
		}
		// 其他运算符需要一个值
		else if (!condition.value) {
			isSubmit && ElMessage.error(`请为【${getColumnLabel(condition.columnName)}】设置条件值`)
			return false
		}
	}
	return true
}

// 处理查询
const handleQuery = () => {
	if (validateConditions()) {
		// 构建查询参数
		const queryParams = {
			filterType: queryForm.value.filterType,
			conditions: conditions.value.map(cond => {
				const column = tableColumns.value.find(item => item.prop === cond.columnName)
				return {
					columnName: cond.columnName,
					columnLabel: getColumnLabel(cond.columnName),
					operator: cond.operator,
					operatorLabel: cond.operatorLabel,
					value: cond.value,
					startValue: cond.startValue,
					endValue: cond.endValue,
					fieldType: column ? column.fieldType : '',
				}
			}),
		}

		// 转换为SQL格式
		const sql = convertToMysql(conditions.value, queryForm.value.filterType)
		const oracleSql = convertToOracle(conditions.value, queryForm.value.filterType)
		queryParams.sql = sql
		queryParams.filterType = queryForm.value.filterType // 添加filterType到返回结果中

		console.log('queryParams =>', queryParams)
		console.log('Generated SQL =>', queryParams.sql)
		console.log('Generated Oracle SQL =>', oracleSql)

		// 触发查询事件
		// emit('query', queryParams)
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
		filterType: queryForm.value.filterType,
		conditions: JSON.parse(JSON.stringify(conditions.value)),
		updatedAt: new Date().toISOString(),
	}

	const storageKey = `advancedQuery_${props.id}`
	localStorage.setItem(storageKey, JSON.stringify(queryData))

	ElMessage.success('查询条件保存成功')
	// dialogVisible.value = false
}

// 从本地存储加载查询条件
const loadQueryConditions = () => {
	const storageKey = `advancedQuery_${props.id}`
	const stored = localStorage.getItem(storageKey)

	if (stored) {
		try {
			const queryData = JSON.parse(stored)
			queryForm.value.filterType = queryData.filterType || 'AND'
			conditions.value = queryData.conditions || [createNewCondition()]
		} catch (e) {
			console.error('加载查询条件失败', e)
			localStorage.removeItem(storageKey)
			// 使用默认值
			queryForm.value.filterType = 'AND'
			conditions.value = [createNewCondition()]
		}
	} else {
		// 没有保存的查询条件，使用默认值
		queryForm.value.filterType = 'AND'
		conditions.value = [createNewCondition()]
	}
}

/**
 * @description 查询菜单下拉数结构
 */
const getTreeselect = async () => {
	// 从store中获取菜单数据，而不是调用接口
	const menuData = permissionStore.getMenuData()
	menuDataList.value = menuData
	// 查找当前路由对应的菜单项
	const currentMenu = permissionStore.findMenuByPath(route.path)
	menuId.value = currentMenu?.id || ''
}

const getTableColumns = () => {
	api.getDetail({
		menuId: menuId.value,
		tableId: props.id,
	}).then(res => {
		tableColumns.value = res.data.map(item => ({
			prop: item.colKey,
			label: item.colLabel,
			fieldType: item.colSelectKey,
			colType: item.colType,
			...item,
		}))
	})
}

// 重置所有条件
const resetAll = () => {
	proxy.$modal
		.confirm('确定要重置查询条件并清空本地保存的查询配置吗？')
		.then(() => {
			conditions.value = [createNewCondition()]
			queryForm.value.filterType = 'AND'

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
	await getTreeselect()
	// 只有在表格ID存在时才加载查询条件
	if (props.id) {
		loadQueryConditions()
	}
})

// 定义组件事件
const emit = defineEmits(['query'])
</script>

<style scoped>
.dialog-content {
	padding: 10px 0;
}

.condition-row {
	padding: 8px 0;
	border-bottom: 1px dashed #eee;
}

.condition-row:last-child {
	border-bottom: none;
}

.footer-box {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
