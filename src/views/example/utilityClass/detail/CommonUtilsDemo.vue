<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 14:46:40
 * @LastEditTime: 2025-09-04 09:23:58
 * @LastEditors: zhangsd
 * @Description: 通用工具类使用场景 common.jsya
 * @FilePath: \view\src\views\example\utilityClass\detail\CommonUtilsDemo.vue
-->
<template>
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<h1 class="text-3xl font-bold mb-8 text-center text-blue-600">通用工具类方法演示</h1>

		<!-- 1. 防抖函数演示 - ElCard 包裹 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">1. 防抖函数 (debounce)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">在输入框中快速输入，防抖函数会在停止输入1秒后才执行搜索</el-tag>
				</el-form-item>
				<el-form-item label="搜索输入" label-width="100px">
					<el-input v-model="searchText" @input="handleSearch" placeholder="请输入搜索内容..." clearable></el-input>
				</el-form-item>
				<!-- 执行日志展示 -->
				<el-form-item label="执行日志" label-width="100px" v-if="debounceLog">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 3 }"
						v-model="debounceLog"
						readonly
						placeholder="执行日志将显示在这里"
					></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 2. 表单操作演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">2. 表单操作 (resetForm / setFormData)</h2>
			</template>
			<el-form ref="demoForm" :model="formData" label-width="100px" class="mt-4 form-demo">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="formData.name" placeholder="请输入姓名"></el-input>
				</el-form-item>
				<el-form-item label="年龄" prop="age">
					<el-input v-model.number="formData.age" placeholder="请输入年龄" type="number"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="formData.email" placeholder="请输入邮箱" type="email"></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-space size="small">
						<el-button type="primary" @click="handleSetFormData">填充表单数据</el-button>
						<el-button type="default" @click="handleResetForm">重置表单</el-button>
					</el-space>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 新增：9. 金额格式化/反格式化演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">9. 金额格式化与反格式化 (formatMoney / unformatMoney)</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
				<!-- 左侧：金额格式化（数字→标准金额字符串） -->
				<el-col :xs="24" :md="12">
					<el-form-item label="原始数字（金额）" label-width="140px">
						<el-input v-model="rawMoney" placeholder="示例：123456.78 / -98765.43 / 100000" clearable type="number"></el-input>
						<el-text type="info" size="small" class="mt-1">支持整数、小数、负数格式输入</el-text>
					</el-form-item>

					<!-- 新增：小数位数选择 -->
					<el-form-item label="保留小数位数" label-width="140px">
						<el-select v-model="decimalPrecision" placeholder="请选择小数位数" clearable style="width: 100%">
							<el-option label="0位（整数）" :="0"></el-option>
							<el-option label="1位" :value="1"></el-option>
							<el-option label="2位（默认）" :value="2"></el-option>
							<el-option label="3位" :value="3"></el-option>
							<el-option label="4位" :value="4"></el-option>
							<el-option label="6位（高精度）" :value="6"></el-option>
						</el-select>
						<el-text type="info" size="small" class="mt-1">可自定义保留的小数位数，默认保留2位</el-text>
					</el-form-item>

					<el-form-item label-width="140px">
						<el-space size="small">
							<el-button @click="handleFormatMoney" type="primary">执行金额格式化</el-button>
							<el-button @click="fillExampleValues('positive')" type="default">正数示例</el-button>
							<el-button @click="fillExampleValues('negative')" type="default">负数示例</el-button>
						</el-space>
					</el-form-item>

					<el-form-item label="格式化结果" label-width="140px">
						<el-input
							type="textarea"
							:autosize="{ minRows: 3, maxRows: 4 }"
							v-model="formattedMoneyResult"
							readonly
							placeholder="格式化后的金额将显示在这里"
						></el-input>
					</el-form-item>
				</el-col>

				<!-- 右侧：金额反格式化（标准金额字符串→数字） -->
				<el-col :xs="24" :md="12">
					<el-form-item label="格式化金额字符串" label-width="140px">
						<el-input v-model="formattedMoneyInput" placeholder="示例：123,456.78 / -98,765.43 / 100,000" clearable></el-input>
						<el-text type="info" size="small" class="mt-1">支持带有千分位逗号的金额字符串</el-text>
					</el-form-item>

					<el-form-item label-width="140px">
						<el-space size="small">
							<el-button @click="handleUnformatMoney" type="primary">执行金额反格式化</el-button>
							<el-button @click="fillFormattedExample" type="default">填充示例</el-button>
						</el-space>
					</el-form-item>

					<el-form-item label="反格式化结果" label-width="140px">
						<el-input
							type="textarea"
							:autosize="{ minRows: 2, maxRows: 3 }"
							v-model="unformattedMoneyResult"
							readonly
							placeholder="转换后的数字将显示在这里"
						></el-input>
					</el-form-item>

					<!-- 新增：反格式化后二次格式化验证 -->
					<el-form-item label="验证格式化" label-width="140px">
						<el-input v-model="reformatValidation" readonly placeholder="使用相同精度二次格式化的结果"></el-input>
						<el-text type="info" size="small" class="mt-1">用于验证反格式化的准确性</el-text>
					</el-form-item>
				</el-col>
			</el-row>
		</el-card>

		<!-- 3. 树形结构构造演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">3. 树形结构构造 (handleTree)</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
				<!-- 原始扁平数据 -->
				<el-col :xs="24" :md="12">
					<el-form-item label="原始扁平数据" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="flatDataStr" readonly></el-input>
					</el-form-item>
				</el-col>
				<!-- 转换后树形结构 -->
				<el-col :xs="24" :md="12">
					<el-form-item label="转换后树形结构" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="treeDataStr" readonly></el-input>
					</el-form-item>
					<el-button @click="convertToTree" type="primary" class="mt-2">转换为树形结构</el-button>
				</el-col>
			</el-row>
			<!-- 树形结构可视化 -->
			<el-form-item label="树形结构展示" label-width="120px" class="mt-4">
				<el-tree :data="treeData" :props="treeProps" node-key="id" default-expand-all class="w-full"></el-tree>
			</el-form-item>
		</el-card>

		<!-- 4. 日期范围参数演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">4. 日期范围参数 (addDateRange)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="选择日期范围" label-width="120px">
					<el-date-picker
						v-model="dateRange"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
					></el-date-picker>
				</el-form-item>
				<el-form-item label-width="120px">
					<el-button @click="addDateParams" type="primary">添加日期范围到参数</el-button>
				</el-form-item>
				<!-- 原始参数 -->
				<el-form-item label="原始参数" label-width="120px">
					<el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" v-model="originalParamsStr" readonly></el-input>
				</el-form-item>
				<!-- 带日期范围的参数 -->
				<el-form-item label="添加日期后参数" label-width="120px">
					<el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" v-model="paramsWithDateRangeStr" readonly></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 5. 参数序列化演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">5. 参数序列化 (tansParams)</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
				<el-col :xs="24" :md="12">
					<el-form-item label="原始参数对象" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 5, maxRows: 7 }" v-model="paramsObjectStr" readonly></el-input>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :md="12">
					<el-form-item label="序列化结果" label-width="120px">
						<el-input
							type="textarea"
							:autosize="{ minRows: 5, maxRows: 7 }"
							v-model="serializedParams"
							readonly
							placeholder="序列化后的URL参数字符串"
						></el-input>
					</el-form-item>
					<el-button @click="serializeParams" type="primary" class="mt-2">执行参数序列化</el-button>
				</el-col>
			</el-row>
		</el-card>

		<!-- 6. 数据合并演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">6. 数据合并 (mergeRecursive)</h2>
			</template>
			<el-row :gutter="16" class="mt-4">
				<el-col :xs="24" :md="8">
					<el-form-item label="源对象" label-width="80px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="sourceObjStr" readonly></el-input>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :md="8">
					<el-form-item label="目标对象" label-width="80px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="targetObjStr" readonly></el-input>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :md="8">
					<el-form-item label="合并结果" label-width="80px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="mergedResultStr" readonly></el-input>
					</el-form-item>
					<el-button @click="mergeObjects" type="primary" class="mt-2">合并对象</el-button>
				</el-col>
			</el-row>
		</el-card>

		<!-- 7. 路径规范化演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">7. 路径规范化 (getNormalPath)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="输入路径" label-width="100px">
					<el-input v-model="pathInput" placeholder="输入需要规范化的路径（如：/user//profile//settings/）" clearable></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="normalizePath" type="primary">规范化路径</el-button>
				</el-form-item>
				<!-- 规范化结果 -->
				<el-form-item label="规范化结果" label-width="100px" v-if="normalizedPath">
					<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" v-model="normalizedPath" readonly></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 8. 可编辑表格下拉框赋值演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">8. 表格下拉框赋值 (setEditTableOptions)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label-width="120px">
					<el-button @click="setTableOptions" type="primary">为表格设置下拉选项</el-button>
				</el-form-item>
				<!-- 表格列配置 -->
				<el-form-item label="表格列配置" label-width="120px">
					<el-input
						type="textarea"
						:autosize="{ minRows: 4, maxRows: 6 }"
						v-model="tableColumnsStr"
						readonly
						placeholder="处理后的表格列配置（含下拉选项）"
					></el-input>
				</el-form-item>
				<!-- 表格展示 -->
				<el-form-item label="可编辑表格" label-width="120px">
					<el-table :data="tableData" border style="width: 100%" size="medium">
						<el-table-column v-for="col in tableColumns" :key="col.prop" :prop="col.prop" :label="col.label" align="center">
							<template #default="scope">
								<el-select
									v-if="col.selectData"
									v-model="scope.row[col.prop]"
									placeholder="请选择"
									style="width: 100%"
									size="small"
								>
									<el-option
										v-for="item in col.selectData"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									></el-option>
								</el-select>
								<span v-else>{{ scope.row[col.prop] }}</span>
							</template>
						</el-table-column>
					</el-table>
				</el-form-item>
			</div>
		</el-card>
	</div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
// 导入Element Plus组件（若全局导入可省略）
import {
	ElCard,
	ElRow,
	ElCol,
	ElForm,
	ElFormItem,
	ElInput,
	ElButton,
	ElSpace,
	ElTag,
	ElTree,
	ElDatePicker,
	ElSelect,
	ElOption,
	ElTable,
	ElTableColumn,
} from 'element-plus'
// 导入通用工具类方法（新增 formatMoney / unformatMoney 导入）
import {
	debounce,
	resetForm,
	setFormData,
	handleTree,
	addDateRange,
	tansParams,
	mergeRecursive,
	getNormalPath,
	setEditTableOptions,
	formatMoney, // 新增：金额格式化方法
	unformatMoney, // 新增：金额反格式化方法
} from '@/utils/common/common.js' // 请根据实际路径调整

// 获取组件实例，用于表单重置
const instance = getCurrentInstance()

// -------------------------- 1. 防抖函数演示 --------------------------
const searchText = ref('')
const debounceLog = ref('')

// 创建防抖处理函数（延迟1000ms）
const handleSearch = debounce(e => {
	debounceLog.value = `执行搜索: ${e.target.value} (${new Date().toLocaleTimeString()})`
}, 1000)

// -------------------------- 2. 表单操作演示 --------------------------
const formData = ref({ name: '', age: null, email: '' })
// 示例填充数据
const sampleFormData = {
	name: '张三',
	age: 28,
	email: 'zhangsan@example.com',
	extraField: '不会显示（仅匹配表单已有字段）',
}

// 填充表单数据
const handleSetFormData = () => {
	setFormData(formData.value, sampleFormData)
}

// 重置表单
const handleResetForm = () => {
	resetForm.call(instance.proxy, 'demoForm')
}

// -------------------------- 新增：9. 金额格式化/反格式化演示 --------------------------
const rawMoney = ref('123456.789')
const decimalPrecision = ref(2) // 默认保留2位小数
const formattedMoneyResult = ref('')
const formattedMoneyInput = ref('123,456.79')
const unformattedMoneyResult = ref('')
const reformatValidation = ref('')
// 填充示例值
const fillExampleValues = type => {
	if (type === 'positive') {
		rawMoney.value = '987654.321'
		decimalPrecision.value = 2
	} else if (type === 'negative') {
		rawMoney.value = '-12345.678'
		decimalPrecision.value = 3
	}
	handleFormatMoney()
}

// 填充格式化示例
const fillFormattedExample = () => {
	formattedMoneyInput.value = '-12,345.68'
	handleUnformatMoney()
}
// 执行金额格式化
const handleFormatMoney = () => {
  try {
    if (!rawMoney.value && rawMoney.value !== 0) {
      formattedMoneyResult.value = '请输入有效的金额数字';
      return;
    }
    
    // 关键修复：用 ?? 替代 ||，确保 0 能被正确识别
    const precision = Number(decimalPrecision.value) ?? 2;
    const result = formatMoney(Number(rawMoney.value), precision);
    
    formattedMoneyResult.value = [
      `原始值：${rawMoney.value}`,
      `保留${precision}位小数：${result}`,
      `数据类型：字符串`
    ].join('\n');
    
    // 同步到反格式化输入框
    formattedMoneyInput.value = result;
  } catch (error) {
    formattedMoneyResult.value = `格式化失败：${error.message}`;
  }
};

// 执行金额反格式化（同步修改精度处理）
const handleUnformatMoney = () => {
  try {
    if (!formattedMoneyInput.value) {
      unformattedMoneyResult.value = '请输入有效的格式化金额字符串';
      reformatValidation.value = '';
      return;
    }
    
    const result = unformatMoney(formattedMoneyInput.value);
    // 同样用 ?? 处理精度
    const precision = Number(decimalPrecision.value) ?? 2;
    
    unformattedMoneyResult.value = [
      `原始字符串：${formattedMoneyInput.value}`,
      `转换后：${result}`,
      `数据类型：${typeof result}`
    ].join('\n');
    
    // 二次格式化验证
    reformatValidation.value = formatMoney(result, precision);
  } catch (error) {
    unformattedMoneyResult.value = `反格式化失败：${error.message}`;
    reformatValidation.value = '';
  }
};


// -------------------------- 3. 树形结构构造演示 --------------------------
const flatData = ref([
	{ id: 1, name: '一级节点1', parentId: 0 },
	{ id: 2, name: '一级节点2', parentId: 0 },
	{ id: 3, name: '二级节点1-1', parentId: 1 },
	{ id: 4, name: '二级节点1-2', parentId: 1 },
	{ id: 5, name: '三级节点1-1-1', parentId: 3 },
	{ id: 6, name: '二级节点2-1', parentId: 2 },
])
const treeData = ref([])
const treeProps = { children: 'children', label: 'name' }
// 字符串格式（用于文本域展示）
const flatDataStr = ref(JSON.stringify(flatData.value, null, 2))
const treeDataStr = ref('')

// 转换为树形结构
const convertToTree = () => {
	treeData.value = handleTree(flatData.value, 'id', 'parentId', 'children')
	treeDataStr.value = JSON.stringify(treeData.value, null, 2)
}

// -------------------------- 4. 日期范围参数演示 --------------------------
const dateRange = ref([])
const originalParams = ref({ page: 1, size: 10, keyword: '测试' })
const paramsWithDateRange = ref({})
// 字符串格式
const originalParamsStr = ref(JSON.stringify(originalParams.value, null, 2))
const paramsWithDateRangeStr = ref('')

// 添加日期范围到参数（用 JSON 深拷贝替换原 deepClone）
const addDateParams = () => {
	const paramsCopy = JSON.parse(JSON.stringify(originalParams.value))
	paramsWithDateRange.value = addDateRange(paramsCopy, dateRange.value)
	paramsWithDateRangeStr.value = JSON.stringify(paramsWithDateRange.value, null, 2)
}

// -------------------------- 5. 参数序列化演示 --------------------------
const paramsObject = ref({
	name: '测试',
	age: 25,
	filters: { status: 'active', type: ['A', 'B'] },
	emptyValue: '', // 空值不会被序列化
})
const serializedParams = ref('')
// 字符串格式
const paramsObjectStr = ref(JSON.stringify(paramsObject.value, null, 2))

// 执行参数序列化
const serializeParams = () => {
	serializedParams.value = tansParams(paramsObject.value)
}

// -------------------------- 6. 数据合并演示 --------------------------
const sourceObj = ref({
	name: '源对象',
	info: { a: 10, b: 20 },
	list: [1, 2, 3],
})
const targetObj = ref({
	name: '目标对象',
	info: { b: 30, c: 40 },
	status: 'active',
})
const mergedResult = ref({})
// 字符串格式
const sourceObjStr = ref(JSON.stringify(sourceObj.value, null, 2))
const targetObjStr = ref(JSON.stringify(targetObj.value, null, 2))
const mergedResultStr = ref('')

// 合并对象（用 JSON 深拷贝替换原 deepClone）
const mergeObjects = () => {
	const sourceCopy = JSON.parse(JSON.stringify(sourceObj.value))
	const targetCopy = JSON.parse(JSON.stringify(targetObj.value))
	mergedResult.value = mergeRecursive(sourceCopy, targetCopy)
	mergedResultStr.value = JSON.stringify(mergedResult.value, null, 2)
}

// -------------------------- 7. 路径规范化演示 --------------------------
const pathInput = ref('/user//profile//settings/')
const normalizedPath = ref('')

// 规范化路径
const normalizePath = () => {
	normalizedPath.value = getNormalPath(pathInput.value)
}

// -------------------------- 8. 表格下拉框赋值演示 --------------------------
const tableColumns = ref([
	{ prop: 'name', label: '姓名' },
	{ prop: 'gender', label: '性别' },
	{ prop: 'status', label: '状态' },
])
const tableData = ref([
	{ id: 1, name: '张三', gender: 'male', status: 'active' },
	{ id: 2, name: '李四', gender: 'female', status: 'inactive' },
	{ id: 3, name: '王五', gender: 'male', status: 'active' },
])
// 字符串格式（用于文本域展示）
const tableColumnsStr = ref(JSON.stringify(tableColumns.value, null, 2))

// 为表格设置下拉选项
const setTableOptions = () => {
	const options = {
		gender: [
			{ label: '男', value: 'male' },
			{ label: '女', value: 'female' },
		],
		status: [
			{ label: '活跃', value: 'active' },
			{ label: '非活跃', value: 'inactive' },
		],
	}
	setEditTableOptions(tableColumns.value, options)
	// 更新展示用的字符串
	tableColumnsStr.value = JSON.stringify(tableColumns.value, null, 2)
}

// -------------------------- 初始化数据 --------------------------
const init = () => {
	convertToTree() // 初始化树形结构
	setTableOptions() // 初始化表格下拉选项
	serializeParams() // 初始化参数序列化
	mergeObjects() // 初始化数据合并
	addDateParams() // 初始化日期范围参数（默认空）
	handleFormatMoney() // 初始化金额格式化示例
	handleUnformatMoney() // 初始化金额反格式化示例
}

// 页面加载时执行初始化
init()
</script>

<style scoped>
/* 统一Element组件样式，对齐DataUtilsDemo */
.el-card {
	transition: all 0.3s ease;
}
.el-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.el-input--textarea[readonly],
.el-input[readonly] {
	background-color: #f5f7fa !important;
	color: #333 !important;
}
.el-form-item__label {
	font-weight: 500 !important;
}
.form-demo {
	max-width: 600px;
}
/* 适配主界面滚动容器 */
.container {
	box-sizing: border-box;
}
/* 新增：金额演示模块样式补充 */
.el-col :deep(.el-form-item) {
	margin-bottom: 16px;
}
</style>