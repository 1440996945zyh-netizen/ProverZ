<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600">核心工具类方法演示</h1>

    <!-- 1. 防抖函数演示 -->
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

    <!-- 2. DOM操作演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. DOM操作 (hasClass/addClass/removeClass/toggleClass)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <div id="dom-demo" class="p-4 border rounded bg-gray-100">
          <p>这个盒子用于演示DOM操作</p>
        </div>
        <el-form-item label-width="100px">
          <el-space>
            <el-button @click="addClassToElement">添加class</el-button>
            <el-button @click="removeClassFromElement">移除class</el-button>
            <el-button @click="toggleClassElement">切换class</el-button>
            <el-button @click="checkClass">检查class</el-button>
          </el-space>
        </el-form-item>
        <el-form-item label="当前状态" label-width="100px">
          <el-input v-model="domStatus" readonly></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 3. 字符串处理演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 字符串处理 (sprintf/normalizeEmptyString/byteLength/html2Text/capitalize/snakeToCamel)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- 字符串格式化 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="sprintf格式化" label-width="120px">
            <el-input v-model="sprintfTemplate" placeholder="Hello %s, your score is %s" clearable></el-input>
            <el-input v-model="sprintfArgs" placeholder="参数1,参数2" clearable class="mt-2"></el-input>
            <el-button @click="handleSprintf" type="primary" class="mt-2">格式化</el-button>
            <el-input v-model="sprintfResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 空字符串处理 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="空字符串处理" label-width="120px">
            <el-input v-model="emptyStringInput" placeholder="输入值" clearable></el-input>
            <el-button @click="handleNormalizeEmpty" type="primary" class="mt-2">处理</el-button>
            <el-input v-model="normalizeEmptyResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 字节长度计算 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="字节长度计算" label-width="120px">
            <el-input v-model="byteLengthInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="calculateByteLength" type="primary" class="mt-2">计算</el-button>
            <el-input v-model="byteLengthResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- HTML转纯文本 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="HTML转纯文本" label-width="120px">
            <el-input v-model="htmlInput" type="textarea" placeholder="输入HTML内容" clearable></el-input>
            <el-button @click="convertHtmlToText" type="primary" class="mt-2">转换</el-button>
            <el-input v-model="textResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 首字母大写 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="首字母大写" label-width="120px">
            <el-input v-model="titleCaseInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="capitalizeText" type="primary" class="mt-2">转换</el-button>
            <el-input v-model="titleCaseResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 下划线转驼峰 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="下划线转驼峰" label-width="120px">
            <el-input v-model="snakeCaseInput" placeholder="输入下划线命名" clearable></el-input>
            <el-button @click="convertSnakeToCamel" type="primary" class="mt-2">转换</el-button>
            <el-input v-model="camelCaseResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 中文处理演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. 中文处理 (chineseToPinYin/createShortCode)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- 中文转拼音 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="中文转拼音" label-width="120px">
            <el-input v-model="chineseInput" placeholder="输入中文" clearable></el-input>
            <el-button @click="convertToPinYin" type="primary" class="mt-2">转换</el-button>
            <el-input v-model="pinYinResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 创建速记码 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="创建速记码" label-width="120px">
            <el-input v-model="shortCodeInput" placeholder="输入中文" clearable></el-input>
            <el-button @click="handleCreateShortCode" type="primary" class="mt-2">创建</el-button>
            <el-input v-model="shortCodeResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. URL参数处理演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. URL参数处理 (getQueryObject/objectToQueryString/queryStringToObject)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- URL参数解析 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="URL参数解析" label-width="120px">
            <el-input v-model="urlInput" placeholder="输入URL" clearable></el-input>
            <el-button @click="parseUrlParams" type="primary" class="mt-2">解析</el-button>
            <el-input v-model="urlParamsResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 参数对象转URL -->
        <el-col :xs="24" :md="12">
          <el-form-item label="参数对象转URL" label-width="120px">
            <el-input v-model="paramsObjectInput" type="textarea" placeholder="输入JSON对象" clearable></el-input>
            <el-button @click="convertObjectToQuery" type="primary" class="mt-2">转换</el-button>
            <el-input v-model="queryResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- URL查询参数解析 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="URL查询参数解析" label-width="120px">
            <el-input v-model="queryInput" placeholder="输入查询字符串" clearable></el-input>
            <el-button @click="parseQueryParams" type="primary" class="mt-2">解析</el-button>
            <el-input v-model="queryObjectResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 数字处理演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">6. 数字处理 (formatMoney/unformatMoney/safeAdd/safeSubtract/safeMultiply/safeDivide)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- 金额格式化 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="金额格式化" label-width="120px">
            <el-input v-model="rawMoney" placeholder="输入金额数字" clearable type="number"></el-input>
            <el-select v-model="decimalPrecision" placeholder="小数位数" style="width: 100%" class="mt-2">
              <el-option label="0位" value="0"></el-option>
              <el-option label="1位" value="1"></el-option>
              <el-option label="2位" value="2"></el-option>
              <el-option label="3位" value="3"></el-option>
            </el-select>
            <el-button @click="handleFormatMoney" type="primary" class="mt-2">格式化</el-button>
            <el-input v-model="formattedMoneyResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 金额反格式化 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="金额反格式化" label-width="120px">
            <el-input v-model="formattedMoneyInput" placeholder="输入格式化金额" clearable></el-input>
            <el-button @click="handleUnformatMoney" type="primary" class="mt-2">反格式化</el-button>
            <el-input v-model="unformattedMoneyResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 安全加法 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="安全加法" label-width="120px">
            <el-input v-model="addNum1" placeholder="第一个数" clearable type="number"></el-input>
            <el-input v-model="addNum2" placeholder="第二个数" clearable type="number" class="mt-2"></el-input>
            <el-button @click="calculateAdd" type="primary" class="mt-2">计算</el-button>
            <el-input v-model="addResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 安全减法 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="安全减法" label-width="120px">
            <el-input v-model="subNum1" placeholder="第一个数" clearable type="number"></el-input>
            <el-input v-model="subNum2" placeholder="第二个数" clearable type="number" class="mt-2"></el-input>
            <el-button @click="calculateSubtract" type="primary" class="mt-2">计算</el-button>
            <el-input v-model="subResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 安全乘法 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="安全乘法" label-width="120px">
            <el-input v-model="mulNum1" placeholder="第一个数" clearable type="number"></el-input>
            <el-input v-model="mulNum2" placeholder="第二个数" clearable type="number" class="mt-2"></el-input>
            <el-button @click="calculateMultiply" type="primary" class="mt-2">计算</el-button>
            <el-input v-model="mulResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 安全除法 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="安全除法" label-width="120px">
            <el-input v-model="divNum1" placeholder="被除数" clearable type="number"></el-input>
            <el-input v-model="divNum2" placeholder="除数" clearable type="number" class="mt-2"></el-input>
            <el-button @click="calculateDivide" type="primary" class="mt-2">计算</el-button>
            <el-input v-model="divResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 路径处理演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">7. 路径处理 (getNormalPath/paramsToQueryString)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- 路径规范化 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="路径规范化" label-width="120px">
            <el-input v-model="pathInput" placeholder="输入路径" clearable></el-input>
            <el-button @click="normalizePath" type="primary" class="mt-2">规范化</el-button>
            <el-input v-model="normalizedPathResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 参数序列化 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="参数序列化" label-width="120px">
            <el-input v-model="paramsObjectInput" type="textarea" placeholder="输入JSON对象" clearable></el-input>
            <el-button @click="serializeParams" type="primary" class="mt-2">序列化</el-button>
            <el-input v-model="serializedParamsResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 8. 其他工具演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">8. 其他工具 (createUniqueString/isNumberStr/createValueCheckMap)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <!-- 生成唯一字符串 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="生成唯一字符串" label-width="120px">
            <el-button @click="generateUniqueString" type="primary">生成</el-button>
            <el-input v-model="uniqueStringResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 字符串是否为数字 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="字符串是否为数字" label-width="120px">
            <el-input v-model="numberCheckInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="checkIfNumber" type="primary" class="mt-2">检查</el-button>
            <el-input v-model="numberCheckResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
        <!-- 创建值检查映射 -->
        <el-col :xs="24" :md="12">
          <el-form-item label="创建值检查映射" label-width="120px">
            <el-input v-model="checkMapInput" placeholder="name,age,gender" clearable></el-input>
            <el-checkbox v-model="caseSensitive" label="区分大小写"></el-checkbox>
            <el-button @click="createCheckMap" type="primary" class="mt-2">创建</el-button>
            <el-input v-model="checkMapResult" readonly class="mt-2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { 
  debounce, 
  hasClass, 
  addClass, 
  removeClass, 
  toggleClass, 
  createValueCheckMap,
  sprintf,
  normalizeEmptyString,
  byteLength,
  html2Text,
  capitalize,
  snakeToCamel,
  chineseToPinYin,
  createShortCode,
  getQueryObject,
  objectToQueryString,
  queryStringToObject,
  createUniqueString,
  formatMoney,
  unformatMoney,
  isNumberStr,
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  getNormalPath,
  paramsToQueryString
} from '@/utils/common/core.js'

// 获取组件实例
const instance = getCurrentInstance()

// -------------------------- 1. 防抖函数演示 --------------------------
const searchText = ref('')
const debounceLog = ref('')

// 创建防抖处理函数（延迟1000ms）
const handleSearch = debounce(e => {
  debounceLog.value = `执行搜索: ${e.target.value} (${new Date().toLocaleTimeString()})`
}, 1000)

// -------------------------- 2. DOM操作演示 --------------------------
const domStatus = ref('')

const addClassToElement = () => {
  const element = document.getElementById('dom-demo')
  addClass(element, 'highlighted')
  updateDomStatus()
}

const removeClassFromElement = () => {
  const element = document.getElementById('dom-demo')
  removeClass(element, 'highlighted')
  updateDomStatus()
}

const toggleClassElement = () => {
  const element = document.getElementById('dom-demo')
  toggleClass(element, 'highlighted')
  updateDomStatus()
}

const checkClass = () => {
  const element = document.getElementById('dom-demo')
  const has = hasClass(element, 'highlighted')
  domStatus.value = has ? '已添加highlighted类' : '未添加highlighted类'
}

const updateDomStatus = () => {
  const element = document.getElementById('dom-demo')
  domStatus.value = hasClass(element, 'highlighted') ? '已添加highlighted类' : '未添加highlighted类'
}

// -------------------------- 3. 字符串处理演示 --------------------------
const sprintfTemplate = ref('Hello %s, your score is %s')
const sprintfArgs = ref('张三,95')
const sprintfResult = ref('')

const handleSprintf = () => {
  const args = sprintfArgs.value.split(',').map(arg => arg.trim())
  sprintfResult.value = sprintf(sprintfTemplate.value, ...args)
}

const emptyStringInput = ref(null)
const normalizeEmptyResult = ref('')

const handleNormalizeEmpty = () => {
  normalizeEmptyResult.value = normalizeEmptyString(emptyStringInput.value)
}

const byteLengthInput = ref('Hello 世界')
const byteLengthResult = ref('')

const calculateByteLength = () => {
  byteLengthResult.value = byteLength(byteLengthInput.value).toString()
}

const htmlInput = ref('<p>这是一个<b>HTML</b>字符串</p>')
const textResult = ref('')

const convertHtmlToText = () => {
  textResult.value = html2Text(htmlInput.value)
}

const titleCaseInput = ref('hello world')
const titleCaseResult = ref('')

const capitalizeText = () => {
  titleCaseResult.value = capitalize(titleCaseInput.value)
}

const snakeCaseInput = ref('user_profile_settings')
const camelCaseResult = ref('')

const convertSnakeToCamel = () => {
  camelCaseResult.value = snakeToCamel(snakeCaseInput.value)
}

// -------------------------- 4. 中文处理演示 --------------------------
const chineseInput = ref('你好世界')
const pinYinResult = ref('')

const convertToPinYin = () => {
  pinYinResult.value = chineseToPinYin(chineseInput.value)
}

const shortCodeInput = ref('你好世界')
const shortCodeResult = ref('')

const handleCreateShortCode = () => {
  shortCodeResult.value = createShortCode(shortCodeInput.value)
}

// -------------------------- 5. URL参数处理演示 --------------------------
const urlInput = ref('https://example.com/path?name=张三&age=25')
const urlParamsResult = ref('')

const parseUrlParams = () => {
  const params = getQueryObject(urlInput.value)
  urlParamsResult.value = JSON.stringify(params, null, 2)
}

const paramsObjectInput = ref('{"name":"张三","age":25,"tags":["a","b"]}')
const queryResult = ref('')

const convertObjectToQuery = () => {
  const params = JSON.parse(paramsObjectInput.value)
  queryResult.value = objectToQueryString(params)
}

const queryInput = ref('name=张三&age=25&tags=a&tags=b')
const queryObjectResult = ref('')

const parseQueryParams = () => {
  const params = queryStringToObject(queryInput.value)
  queryObjectResult.value = JSON.stringify(params, null, 2)
}

// -------------------------- 6. 数字处理演示 --------------------------
const rawMoney = ref(123456.789)
const decimalPrecision = ref(2)
const formattedMoneyResult = ref('')

const handleFormatMoney = () => {
  formattedMoneyResult.value = formatMoney(Number(rawMoney.value), decimalPrecision.value)
}

const formattedMoneyInput = ref('123,456.79')
const unformattedMoneyResult = ref('')

const handleUnformatMoney = () => {
  unformattedMoneyResult.value = unformatMoney(formattedMoneyInput.value)
}

const addNum1 = ref(0.1)
const addNum2 = ref(0.2)
const addResult = ref('')

const calculateAdd = () => {
  addResult.value = safeAdd(Number(addNum1.value), Number(addNum2.value))
}

const subNum1 = ref(1.5)
const subNum2 = ref(0.7)
const subResult = ref('')

const calculateSubtract = () => {
  subResult.value = safeSubtract(Number(subNum1.value), Number(subNum2.value))
}

const mulNum1 = ref(0.1)
const mulNum2 = ref(0.2)
const mulResult = ref('')

const calculateMultiply = () => {
  mulResult.value = safeMultiply(Number(mulNum1.value), Number(mulNum2.value))
}

const divNum1 = ref(1)
const divNum2 = ref(3)
const divResult = ref('')

const calculateDivide = () => {
  divResult.value = safeDivide(Number(divNum1.value), Number(divNum2.value))
}

// -------------------------- 7. 路径处理演示 --------------------------
const pathInput = ref('/user//profile//settings/')
const normalizedPathResult = ref('')

const normalizePath = () => {
  normalizedPathResult.value = getNormalPath(pathInput.value)
}

const serializeParamsResult = ref('')

const serializeParams = () => {
  const params = JSON.parse(paramsObjectInput.value)
  serializedParamsResult.value = paramsToQueryString(params)
}

// -------------------------- 8. 其他工具演示 --------------------------
const uniqueStringResult = ref('')

const generateUniqueString = () => {
  uniqueStringResult.value = createUniqueString()
}

const numberCheckInput = ref('123.45')
const numberCheckResult = ref('')

const checkIfNumber = () => {
  numberCheckResult.value = isNumberStr(numberCheckInput.value) ? '是数字' : '不是数字'
}

const checkMapInput = ref('name,age,gender')
const caseSensitive = ref(true)
const checkMapResult = ref('')

const createCheckMap = () => {
  const checkMap = createValueCheckMap(checkMapInput.value, !caseSensitive.value)
  checkMapResult.value = `检查结果:\nname: ${checkMap('name')}\nName: ${checkMap('Name')}\nage: ${checkMap('age')}`
}
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
.highlighted {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}
</style>