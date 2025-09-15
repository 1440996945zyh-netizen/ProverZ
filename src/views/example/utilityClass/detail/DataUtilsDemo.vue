<!--
 * @Author: zhangsd
 * @Date: 2025-09-15 11:29:38
 * @LastEditTime: 2025-09-15 11:42:41
 * @LastEditors: zhangsd
 * @Description: 数据工具类代码使用示例
 * @FilePath: \view\src\views\example\utilityClass\detail\DataUtilsDemo.vue
-->
<template>
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<h1 class="text-3xl font-bold mb-8 text-center text-blue-600">数据处理工具方法演示</h1>

		<!-- 1. 数组去重 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">1. 数组去重 (removeDuplicates)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始数组" label-width="100px">
					<el-input v-model="arrayInput" placeholder="例如：1,2,2,3,3,4,5,5" clearable></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="handleRemoveDuplicates" type="primary">去重</el-button>
				</el-form-item>
				<el-form-item label="去重后结果" label-width="100px">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 3 }"
						v-model="deduplicatedArray"
						readonly
						placeholder="去重后的数组将显示在这里"
					></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 2. 数组对象去重 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">2. 数组对象去重 (removeDuplicatesByProperty)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始对象数组" label-width="100px">
					<el-input
						v-model="objectArrayInput"
						type="textarea"
						placeholder="示例：[{\'id\':1,\'name\':\'张三\'},{\'id\':2,\'name\':\'李四\'},{\'id\':1,\'name\':\'张三\'}]"
						clearable
					></el-input>
				</el-form-item>
				<el-form-item label="去重属性" label-width="100px">
					<el-input v-model="uniqueProperty" placeholder="例如：id" clearable></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="handleRemoveDuplicatesByProperty" type="primary">去重</el-button>
				</el-form-item>
				<el-form-item label="去重后结果" label-width="100px">
					<el-input
						type="textarea"
						:autosize="{ minRows: 4, maxRows: 6 }"
						v-model="deduplicatedObjectArray"
						readonly
						placeholder="去重后的对象数组将显示在这里"
					></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 3. 数组对象排序 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">3. 数组对象排序 (createSortComparator)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始对象数组" label-width="100px">
					<el-input
						v-model="sortArrayInput"
						type="textarea"
						placeholder="示例：[{\'id\':3,\'name\':\'张三\'},{\'id\':1,\'name\':\'李四\'},{\'id\':2,\'name\':\'王五\'}]"
						clearable
					></el-input>
				</el-form-item>
				<el-form-item label="排序属性" label-width="100px">
					<el-input v-model="sortProperty" placeholder="例如：id" clearable></el-input>
				</el-form-item>
				<el-form-item label="排序顺序" label-width="100px">
					<el-select v-model="sortOrder" placeholder="请选择排序顺序" clearable style="width: 100%">
						<el-option label="升序" value="asc"></el-option>
						<el-option label="降序" value="desc"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="handleSortArray" type="primary">排序</el-button>
				</el-form-item>
				<el-form-item label="排序后结果" label-width="100px">
					<el-input
						type="textarea"
						:autosize="{ minRows: 4, maxRows: 6 }"
						v-model="sortedArray"
						readonly
						placeholder="排序后的对象数组将显示在这里"
					></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 4. 清除数组空元素 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">4. 清除数组空元素 (filterFalsyValues)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始数组" label-width="100px">
					<el-input v-model="falsyArrayInput" placeholder="例如：1,0,null,undefined,'',false,2" clearable></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="handleFilterFalsy" type="primary">清除空元素</el-button>
				</el-form-item>
				<el-form-item label="清理后结果" label-width="100px">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 3 }"
						v-model="filteredArray"
						readonly
						placeholder="清理后的数组将显示在这里"
					></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 5. 深度合并对象 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">5. 深度合并对象 (deepMerge)</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
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

		<!-- 6. 对象重置 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">6. 对象重置 (clearObjectValues)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始对象" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="resetObjInput" readonly></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="resetObject" type="primary">重置对象</el-button>
				</el-form-item>
				<el-form-item label="重置后结果" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="resetObjResult" readonly></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 7. 深拷贝 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">7. 深拷贝 (deepClone)</h2>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="原始对象" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="cloneObjInput" readonly></el-input>
				</el-form-item>
				<el-form-item label-width="100px">
					<el-button @click="cloneObject" type="primary">深拷贝</el-button>
				</el-form-item>
				<el-form-item label="深拷贝结果" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="cloneObjResult" readonly></el-input>
				</el-form-item>
				<el-form-item label="修改拷贝对象" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="modifiedCloneObj" readonly></el-input>
				</el-form-item>
				<el-form-item label="原始对象是否被修改" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" v-model="originalAfterModify" readonly></el-input>
				</el-form-item>
			</div>
		</el-card>

		<!-- 8. 带函数的JSON序列化与反序列化 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">
					8. 带函数的JSON序列化与反序列化 (stringifyWithFunctions / parseWithFunctions)
				</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
				<el-col :xs="24" :md="12">
					<el-form-item label="原始对象（含函数）" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="funcObjInput" readonly></el-input>
					</el-form-item>
					<el-form-item label-width="120px">
						<el-button @click="stringifyFunctionObject" type="primary">序列化</el-button>
					</el-form-item>
					<el-form-item label="序列化结果" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="stringifiedResult" readonly></el-input>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :md="12">
					<el-form-item label="反序列化结果" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="parsedResult" readonly></el-input>
					</el-form-item>
					<el-form-item label-width="120px">
						<el-button @click="parseFunctionObject" type="primary">反序列化</el-button>
					</el-form-item>
					<el-form-item label="执行函数" label-width="120px">
						<el-input
							type="textarea"
							:autosize="{ minRows: 2, maxRows: 3 }"
							v-model="executedFunctionResult"
							readonly
						></el-input>
					</el-form-item>
					<el-form-item label-width="120px">
						<el-button @click="executeFunction" type="primary">执行函数</el-button>
					</el-form-item>
				</el-col>
			</el-row>
		</el-card>

		<!-- 9. 树形结构构造 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">9. 树形结构构造 (flattenToTree)</h2>
			</template>
			<el-row :gutter="20" class="mt-4">
				<el-col :xs="24" :md="12">
					<el-form-item label="原始扁平数据" label-width="120px">
						<el-input type="textarea" :autosize="{ minRows: 6, maxRows: 8 }" v-model="flatDataStr" readonly></el-input>
					</el-form-item>
				</el-col>
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

		<!-- 10. 可编辑表格下拉框赋值 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<h2 class="text-xl font-semibold text-purple-600">10. 可编辑表格下拉框赋值 (setEditTableOptions)</h2>
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
          <!-- <EditTable
            :data="tableData"
            :tableColumns="tableColumns"
            :border="true"
            style="width: 100%"
          >
          </EditTable> -->
					
				</el-form-item>
			</div>
		</el-card>
	</div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
// import EditTable from '@/components/EditTable.vue'
// 导入Element Plus组件
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
	ElSelect,
	ElOption,
	ElTable,
	ElTableColumn,
} from 'element-plus'
// 导入数据处理工具方法
import {
	removeDuplicates,
	removeDuplicatesByProperty,
	createSortComparator,
	filterFalsyValues,
	deepMerge,
	clearObjectValues,
	deepClone,
	stringifyWithFunctions,
	parseWithFunctions,
	flattenToTree,
	setEditTableOptions,
} from '@/utils/common/data.js'

// 获取组件实例
const instance = getCurrentInstance()

// -------------------------- 1. 数组去重 --------------------------
const arrayInput = ref('1,2,2,3,3,4,5,5')
const deduplicatedArray = ref('')

const handleRemoveDuplicates = () => {
	const arr = arrayInput.value
		.split(',')
		.map(item => item.trim())
		.filter(item => item !== '')
	const result = removeDuplicates(arr)
	deduplicatedArray.value = JSON.stringify(result, null, 2)
}

// -------------------------- 2. 数组对象去重 --------------------------
const objectArrayInput = ref('[{\"id\":1,\"name\":\"张三\"},{\"id\":2,\"name\":\"李四\"},{\"id\":1,\"name\":\"张三\"}]')
const uniqueProperty = ref('id')
const deduplicatedObjectArray = ref('')

const handleRemoveDuplicatesByProperty = () => {
	let arr
	try {
		arr = JSON.parse(objectArrayInput.value)
	} catch (error) {
		console.error('JSON解析错误:', error)
		deduplicatedObjectArray.value = '输入不是有效的JSON格式，请检查格式是否正确'
		return
	}

	const result = removeDuplicatesByProperty(arr, uniqueProperty.value)
	deduplicatedObjectArray.value = JSON.stringify(result, null, 2)
}

// -------------------------- 3. 数组对象排序 --------------------------
const sortArrayInput = ref('[{\"id\":3,\"name\":\"张三\"},{\"id\":1,\"name\":\"李四\"},{\"id\":2,\"name\":\"王五\"}]')
const sortProperty = ref('id')
const sortOrder = ref('asc')
const sortedArray = ref('')

const handleSortArray = () => {
	let arr
	try {
		arr = JSON.parse(sortArrayInput.value)
	} catch (error) {
		console.error('JSON解析错误:', error)
		sortedArray.value = '输入不是有效的JSON格式，请检查格式是否正确'
		return
	}

	const comparator = createSortComparator(sortProperty.value, sortOrder.value)
	const sorted = [...arr].sort(comparator)
	sortedArray.value = JSON.stringify(sorted, null, 2)
}

// -------------------------- 4. 清除数组空元素 --------------------------
const falsyArrayInput = ref('1,0,null,undefined, "",false,2')
const filteredArray = ref('')

const handleFilterFalsy = () => {
	const arr = falsyArrayInput.value.split(',').map(item => {
		item = item.trim()
		if (item === 'null') return null
		if (item === 'undefined') return undefined
		if (item === '""') return ''
		if (item === 'false') return false
		if (item === '0') return 0
		return item
	})
	const result = filterFalsyValues(arr)
	filteredArray.value = JSON.stringify(result, null, 2)
}

// -------------------------- 5. 深度合并对象 --------------------------
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

const mergeObjects = () => {
	let source, target
	try {
		source = JSON.parse(JSON.stringify(sourceObj.value))
		target = JSON.parse(JSON.stringify(targetObj.value))
	} catch (error) {
		console.error('JSON解析错误:', error)
		mergedResultStr.value = '输入不是有效的JSON格式，请检查格式是否正确'
		return
	}
	const sourceCopy = JSON.parse(JSON.stringify(sourceObj.value))
	const targetCopy = JSON.parse(JSON.stringify(targetObj.value))
	mergedResult.value = deepMerge(sourceCopy, targetCopy)
	mergedResultStr.value = JSON.stringify(mergedResult.value, null, 2)
}

// -------------------------- 6. 对象重置 --------------------------
const resetObjInput = ref(
	JSON.stringify(
		{
			name: '测试',
			info: {
				address: '北京',
				phone: '13800138000',
				children: [
					{ name: '孩子1', age: 5 },
					{ name: '孩子2', age: 3 },
				],
			},
			tags: ['前端', 'Vue'],
			empty: null,
		},
		null,
		2
	)
)

const resetObjResult = ref('')

const resetObject = () => {
	const obj = JSON.parse(resetObjInput.value)
	clearObjectValues(obj)
	resetObjResult.value = JSON.stringify(obj, null, 2)
}

// -------------------------- 7. 深拷贝 --------------------------
const cloneObjInput = ref(
	JSON.stringify(
		{
			name: '原始对象',
			info: {
				address: '上海',
				phone: '13800138000',
				children: [
					{ name: '孩子1', age: 5 },
					{ name: '孩子2', age: 3 },
				],
			},
			tags: ['前端', 'Vue'],
			empty: null,
		},
		null,
		2
	)
)

const cloneObjResult = ref('')
const modifiedCloneObj = ref('')
const originalAfterModify = ref('')

const cloneObject = () => {
	const obj = JSON.parse(cloneObjInput.value)
	const cloned = deepClone(obj)
	cloneObjResult.value = JSON.stringify(cloned, null, 2)
	modifiedCloneObj.value = JSON.stringify(cloned, null, 2)
}

const modifyClone = () => {
	const cloned = JSON.parse(cloneObjResult.value)
	cloned.name = '修改后的克隆对象'
	cloned.info.address = '北京'
	cloned.tags.push('React')
	cloned.info.children[0].age = 6
	modifiedCloneObj.value = JSON.stringify(cloned, null, 2)
}

// -------------------------- 8. 带函数的JSON序列化与反序列化 --------------------------
const funcObjInput = ref({
  name: '带函数的对象',
  age: 30,
  sayHello: function() {
    return `Hello, my name is ${this.name}`
  },
  calculate: function(a, b) {
    return a + b
  },
  nested: {
    data: [1, 2, 3],
    func: function() {
      return 'nested function'
    }
  }
})

const stringifiedResult = ref('')
const parsedResult = ref('')
const executedFunctionResult = ref('')

const stringifyFunctionObject = () => {
  stringifiedResult.value = stringifyWithFunctions(funcObjInput.value)
}

const parseFunctionObject = () => {
	const parsed = parseWithFunctions(stringifiedResult.value)
	parsedResult.value = JSON.stringify(parsed, null, 2)
	// 保存解析后的对象以便后续使用
	window.parsedObj = parsed
}

const executeFunction = () => {
	if (!window.parsedObj) return
	const result = window.parsedObj.sayHello()
	executedFunctionResult.value = result
}

// -------------------------- 9. 树形结构构造 --------------------------
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
	treeData.value = flattenToTree(flatData.value, 'id', 'parentId', 'children')
	treeDataStr.value = JSON.stringify(treeData.value, null, 2)
}

// -------------------------- 10. 可编辑表格下拉框赋值 --------------------------
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
	mergeObjects() // 初始化数据合并
	cloneObject() // 初始化深拷贝
	stringifyFunctionObject() // 初始化函数序列化
	parseFunctionObject() // 初始化函数反序列化
	resetObject() // 初始化对象重置
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
