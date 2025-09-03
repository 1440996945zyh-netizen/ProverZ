<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 14:25:44
 * @LastEditTime: 2025-09-03 14:59:59
 * @LastEditors: zhangsd
 * @Description: 数据处理工具类演示 data.js
 * @FilePath: \view\src\views\example\utilityClass\detail\DataUtilsDemo.vue
-->

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600">数据处理工具类演示</h1>

    <!-- 1. 数组去重演示 - 使用ElCard卡片布局 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">1. 数组去重 (uniqueArr)</h2>
      </template>
      <!-- 响应式布局：大屏2列，小屏1列 -->
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="原始数组" label-width="100px">
            <!-- 用只读文本域展示数据，优化样式 -->
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="originalArrayStr"
              readonly
              placeholder="原始数组数据"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="去重后数组" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="uniqueArrayResultStr"
              readonly
              placeholder="去重后的数组"
            ></el-input>
          </el-form-item>
          <!-- Element按钮：带 hover 效果和类型区分 -->
          <el-button
            @click="handleUniqueArr"
            type="primary"
            size="default"
            class="mt-2"
          >
            执行去重
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. 数组对象去重演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">2. 数组对象去重 (uniqueFunc)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="原始对象数组" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="originalObjectArrayStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="按id去重后" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="uniqueObjectArrayResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <el-button
            @click="handleUniqueObjectArr"
            type="primary"
            size="default"
            class="mt-2"
          >
            执行对象去重
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 数组对象排序演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">3. 数组对象排序 (compareValues)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="原始数组" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 7 }"
              v-model="originalSortArrayStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="排序后结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 7 }"
              v-model="sortedArrayResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <!-- 按钮组：用ElSpace控制间距 -->
          <el-space size="small" class="mt-2">
            <el-button
              @click="handleSort('age', 'asc')"
              type="primary"
              size="default"
            >
              按年龄升序
            </el-button>
            <el-button
              @click="handleSort('name', 'asc')"
              type="primary"
              size="default"
            >
              按名称升序
            </el-button>
            <el-button
              @click="handleSort('age', 'desc')"
              type="primary"
              size="default"
            >
              按年龄降序
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 清除数组空元素演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">4. 清除数组空元素 (cleanArray)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="含空元素数组" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="arrayWithEmptyValuesStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="清除后数组" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="cleanedArrayResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <el-button
            @click="handleCleanArray"
            type="primary"
            size="default"
            class="mt-2"
          >
            清除空元素
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 深度合并对象演示 - 3列布局 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">5. 深度合并对象 (objectMerge)</h2>
      </template>
      <el-row :gutter="16" class="mt-4">
        <el-col :xs="24" :md="8">
          <el-form-item label="目标对象" label-width="80px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 9 }"
              v-model="targetObjectStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="源对象" label-width="80px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 9 }"
              v-model="sourceObjectStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="合并结果" label-width="80px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 9 }"
              v-model="mergedObjectResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <el-button
            @click="handleObjectMerge"
            type="primary"
            size="default"
            class="mt-2"
          >
            合并对象
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 对象重置演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">6. 对象重置 (resetObj)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="原始对象" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="originalResetObjectStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="重置后对象" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="resetObjectResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <el-button
            @click="handleResetObject"
            type="primary"
            size="default"
            class="mt-2"
          >
            重置对象
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 深拷贝演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">7. 深拷贝 (deepClone)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="原始对象" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="originalCloneObjectStr"
              readonly
            ></el-input>
          </el-form-item>
          <!-- 橙色按钮区分“修改”操作 -->
          <el-button
            @click="modifyOriginalObject"
            type="warning"
            size="default"
            class="mt-2"
          >
            修改原始对象
          </el-button>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="拷贝对象" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="clonedObjectResultStr"
              readonly
            ></el-input>
          </el-form-item>
          <el-button
            @click="handleDeepClone"
            type="primary"
            size="default"
            class="mt-2"
          >
            执行深拷贝
          </el-button>
          <!-- 提示文本：用ElTag优化样式 -->
          <el-tag type="info" size="small" class="mt-3">
            注：修改原始对象后，拷贝对象不会变化（深拷贝特性）
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- 8. 带函数的JSON序列化/反序列化演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">8. 带函数的JSON序列化/反序列化 (stringify/parse)</h2>
      </template>
      <el-row :gutter="16" class="mt-4">
        <el-col :xs="24" :md="8">
          <el-form-item label="含函数对象" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 7, maxRows: 10 }"
              v-model="objectWithFunctionStr"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="序列化结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 7, maxRows: 10 }"
              v-model="stringifyResult"
              readonly
              placeholder="JSON序列化后的字符串"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="反序列化结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 7, maxRows: 10 }"
              v-model="parseResultStr"
              readonly
              placeholder="反序列化后的对象"
            ></el-input>
          </el-form-item>
          <el-space size="small" class="mt-2 block">
            <el-button
              @click="handleStringifyParse"
              type="primary"
              size="default"
            >
              执行序列化/反序列化
            </el-button>
            <el-button
              @click="testParsedFunction"
              type="success"
              size="default"
            >
              测试反序列化函数
            </el-button>
          </el-space>
          <!-- 函数执行结果：用ElMessage优化提示 -->
          <el-message
            v-if="functionTestResult"
            :message="functionTestResult"
            type="success"
            class="mt-3"
          ></el-message>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 1. 导入需要的Element Plus组件（局部导入，也可全局导入）
import {
  ElCard,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElButton,
  ElSpace,
  ElTag,
  ElMessage
} from 'element-plus'
// 2. 导入数据处理工具类
import {
  uniqueArr,
  uniqueFunc,
  compareValues,
  cleanArray,
  objectMerge,
  resetObj,
  deepClone,
  stringify,
  parse,
} from '@/utils/common/data.js' // 路径请根据项目实际调整

// -------------------------- 1. 数组去重演示数据 --------------------------
const originalArray = ref([1, 2, 3, 2, 4, 3, 5, 6, 5])
const uniqueArrayResult = ref([])
// 用JSON.stringify格式化数据，便于文本域展示（解决数组直接显示为[object Object]问题）
const originalArrayStr = ref(JSON.stringify(originalArray.value, null, 2))
const uniqueArrayResultStr = ref('')

const handleUniqueArr = () => {
  uniqueArrayResult.value = uniqueArr([...originalArray.value])
  uniqueArrayResultStr.value = JSON.stringify(uniqueArrayResult.value, null, 2)
}

// -------------------------- 2. 数组对象去重演示数据 --------------------------
const originalObjectArray = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三' },
  { id: 3, name: '王五' },
  { id: 2, name: '李四' },
])
const uniqueObjectArrayResult = ref([])
const originalObjectArrayStr = ref(JSON.stringify(originalObjectArray.value, null, 2))
const uniqueObjectArrayResultStr = ref('')

const handleUniqueObjectArr = () => {
  uniqueObjectArrayResult.value = uniqueFunc([...originalObjectArray.value], 'id')
  uniqueObjectArrayResultStr.value = JSON.stringify(uniqueObjectArrayResult.value, null, 2)
}

// -------------------------- 3. 数组对象排序演示数据 --------------------------
const originalSortArray = ref([
  { name: 'Bob', age: 25 },
  { name: 'Alice', age: 30 },
  { name: 'Charlie', age: 20 },
])
const sortedArrayResult = ref([])
const originalSortArrayStr = ref(JSON.stringify(originalSortArray.value, null, 2))
const sortedArrayResultStr = ref('')

const handleSort = (key, order) => {
  const arrCopy = deepClone(originalSortArray.value) // 深拷贝避免修改原数组
  sortedArrayResult.value = arrCopy.sort(compareValues(key, order))
  sortedArrayResultStr.value = JSON.stringify(sortedArrayResult.value, null, 2)
}

// -------------------------- 4. 清除数组空元素演示数据 --------------------------
const arrayWithEmptyValues = ref([1, '', null, 2, undefined, 3, false, 4, '', 5])
const cleanedArrayResult = ref([])
const arrayWithEmptyValuesStr = ref(JSON.stringify(arrayWithEmptyValues.value, null, 2))
const cleanedArrayResultStr = ref('')

const handleCleanArray = () => {
  cleanedArrayResult.value = cleanArray([...arrayWithEmptyValues.value])
  cleanedArrayResultStr.value = JSON.stringify(cleanedArrayResult.value, null, 2)
}

// -------------------------- 5. 深度合并对象演示数据 --------------------------
const targetObject = ref({
  name: '张三',
  age: 25,
  address: {
    city: '北京',
    street: '长安街',
  },
})
const sourceObject = ref({
  age: 26,
  gender: '男',
  address: {
    street: '中关村大街',
    zipcode: '100000',
  },
})
const mergedObjectResult = ref({})
const targetObjectStr = ref(JSON.stringify(targetObject.value, null, 2))
const sourceObjectStr = ref(JSON.stringify(sourceObject.value, null, 2))
const mergedObjectResultStr = ref('')

const handleObjectMerge = () => {
  const targetCopy = deepClone(targetObject.value) // 深拷贝避免修改原对象
  const sourceCopy = deepClone(sourceObject.value)
  mergedObjectResult.value = objectMerge(targetCopy, sourceCopy)
  mergedObjectResultStr.value = JSON.stringify(mergedObjectResult.value, null, 2)
}

// -------------------------- 6. 对象重置演示数据 --------------------------
const originalResetObject = ref({
  name: '测试',
  age: 30,
  hobbies: ['读书', '运动'],
  info: {
    address: '测试地址',
    phone: '123456789',
  },
})
const resetObjectResult = ref({})
const originalResetObjectStr = ref(JSON.stringify(originalResetObject.value, null, 2))
const resetObjectResultStr = ref('')

const handleResetObject = () => {
  const objCopy = deepClone(originalResetObject.value) // 深拷贝避免修改原对象
  resetObj(objCopy)
  resetObjectResult.value = objCopy
  resetObjectResultStr.value = JSON.stringify(resetObjectResult.value, null, 2)
}

// -------------------------- 7. 深拷贝演示数据 --------------------------
const originalCloneObject = ref({
  name: '深拷贝测试',
  data: [1, 2, 3],
  info: {
    a: 10,
    b: { c: 20 },
  },
})
const clonedObjectResult = ref({})
// 响应式更新字符串展示
const originalCloneObjectStr = ref(JSON.stringify(originalCloneObject.value, null, 2))
const clonedObjectResultStr = ref('')

const handleDeepClone = () => {
  clonedObjectResult.value = deepClone(originalCloneObject.value)
  clonedObjectResultStr.value = JSON.stringify(clonedObjectResult.value, null, 2)
}

const modifyOriginalObject = () => {
  // 修改原始对象的多层属性
  originalCloneObject.value.name = '已修改（原始对象）'
  originalCloneObject.value.data.push(4)
  originalCloneObject.value.info.b.c = 30
  // 更新展示字符串
  originalCloneObjectStr.value = JSON.stringify(originalCloneObject.value, null, 2)
}

// -------------------------- 8. 带函数的JSON序列化/反序列化演示数据 --------------------------
const objectWithFunction = ref({
  name: '带函数的对象',
  value: 100,
  calculate: (a, b) => a + b, // 加法函数
  info: {
    date: new Date().toLocaleDateString(),
    format: (str) => str.toUpperCase(), // 字符串大写函数
  },
})
const stringifyResult = ref('')
const parseResult = ref({})
const parseResultStr = ref('')
const functionTestResult = ref('') // 函数执行结果提示

// 格式化含函数的对象（函数无法用JSON.stringify直接展示，需特殊处理）
const objectWithFunctionStr = ref(`{
  "name": "带函数的对象",
  "value": 100,
  "calculate": (a, b) => a + b, // 加法函数
  "info": {
    "date": "${objectWithFunction.value.info.date}",
    "format": (str) => str.toUpperCase() // 字符串大写函数
  }
}`)

const handleStringifyParse = () => {
  // 执行序列化
  stringifyResult.value = stringify(objectWithFunction.value)
  // 执行反序列化
  parseResult.value = parse(stringifyResult.value)
  // 格式化反序列化结果（便于展示）
  parseResultStr.value = `{
  "name": "${parseResult.value.name}",
  "value": ${parseResult.value.value},
  "calculate": 函数 (可点击"测试反序列化函数"验证),
  "info": {
    "date": "${parseResult.value.info.date}",
    "format": 函数 (字符串大写功能)
  }
}`
}

// 测试反序列化后的函数是否可用
const testParsedFunction = () => {
  if (parseResult.value && typeof parseResult.value.calculate === 'function') {
    // 测试加法函数
    const addResult = parseResult.value.calculate(2, 3)
    // 测试字符串大写函数
    const formatResult = parseResult.value.info.format('test string')
    // 用Element的Message组件展示结果
    functionTestResult.value = `函数执行成功！加法(2+3)=${addResult}，字符串格式化="test string"→"${formatResult}"`
    // 3秒后清空提示
    setTimeout(() => {
      functionTestResult.value = ''
    }, 3000)
  } else {
    ElMessage({
      message: '请先执行序列化/反序列化操作！',
      type: 'warning'
    })
  }
}

// -------------------------- 页面初始化 --------------------------
const init = () => {
  handleUniqueArr()
  handleUniqueObjectArr()
  handleSort('name', 'asc')
  handleCleanArray()
  handleObjectMerge()
  handleResetObject()
  handleDeepClone()
  handleStringifyParse()
}

// 页面加载时初始化所有结果
init()
</script>

<style scoped>
/* 微调Element组件样式，适配演示场景 */
.el-card {
  transition: all 0.3s ease;
}
.el-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.el-input--textarea[readonly] {
  background-color: #f5f7fa !important;
  color: #333 !important;
}
.el-form-item__label {
  font-weight: 500 !important;
}
</style>