<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 15:31:04
 * @LastEditTime: 2025-09-03 15:31:04
 * @LastEditors: zhangsd
 * @Description: 字符串处理工具类 string.js
 * @FilePath: \view\src\views\example\utilityClass\detail\StringUtilsDemo.vue
-->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold mb-8 text-center text-purple-600">字符串处理工具类演示</h1>

    <!-- 工具类说明卡片 -->
    <el-card class="mb-8 shadow-md" border>
      <div class="p-4">
        <p class="text-gray-700">
          该工具类提供了丰富的字符串处理功能，包括字符串格式化、空值处理、HTML转换、大小写转换、中文转拼音、URL参数处理等实用方法。
        </p>
        <el-tag type="info" size="small" class="mt-2 mr-2">字符串格式化</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">HTML处理</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">拼音转换</el-tag>
        <el-tag type="info" size="small" class="mt-2">URL参数处理</el-tag>
      </div>
    </el-card>

    <!-- 1. 字符串格式化（%s占位符） -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">1. 字符串格式化 (sprintf)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化模板" label-width="120px">
            <el-input 
              v-model="sprintfTemplate" 
              placeholder="请输入带%s占位符的模板"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="替换参数" label-width="120px">
            <el-input 
              v-model="sprintfParams" 
              placeholder="请输入替换参数，用逗号分隔"
              clearable
            ></el-input>
            <el-text type="info" size="small" class="mt-1">提示：参数数量应与模板中的%s数量一致</el-text>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="sprintfResult"
              readonly
              placeholder="格式化结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleSprintf" 
            type="primary"
            class="mt-2"
            :disabled="!sprintfTemplate"
          >
            执行格式化
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. 转换空字符串 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. 转换空字符串 (parseStrEmpty)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入值" label-width="120px">
            <el-input 
              v-model="emptyInput" 
              placeholder="请输入任意值"
              clearable
            ></el-input>
          </el-form-item>
          <el-space direction="vertical" size="small" class="mt-2">
            <el-button 
              @click="setEmptyTestValue('undefined')" 
              type="text"
            >
              测试：设置为"undefined"
            </el-button>
            <el-button 
              @click="setEmptyTestValue('null')" 
              type="text"
            >
              测试：设置为"null"
            </el-button>
            <el-button 
              @click="setEmptyTestValue('')" 
              type="text"
            >
              测试：设置为空字符串
            </el-button>
          </el-space>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="转换结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="emptyResult"
              readonly
              placeholder="转换结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleParseStrEmpty" 
            type="primary"
            class="mt-2"
          >
            执行转换
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 字节长度计算 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 字节长度计算 (byteLength)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入字符串" label-width="120px">
            <el-input 
              v-model="byteStr" 
              placeholder="请输入要计算长度的字符串"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small">
            提示：中文、全角符号等占2-4个字节，英文、数字、半角符号占1个字节
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="计算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="byteResult"
              readonly
              placeholder="计算结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleByteLength" 
            type="primary"
            class="mt-2"
            :disabled="!byteStr"
          >
            计算字节长度
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. HTML转文本 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. HTML转文本 (html2Text)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="HTML内容" label-width="120px">
            <el-input 
              v-model="htmlContent" 
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              placeholder="请输入HTML内容"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="转换结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="html2TextResult"
              readonly
              placeholder="转换结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleHtml2Text" 
            type="primary"
            class="mt-2"
            :disabled="!htmlContent"
          >
            转换为文本
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 首字母大写 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. 首字母大写 (titleCase)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入字符串" label-width="120px">
            <el-input 
              v-model="titleCaseStr" 
              placeholder="请输入字符串"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small">
            提示：会将每个单词的首字母转换为大写（以空格分隔的视为不同单词）
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="转换结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="titleCaseResult"
              readonly
              placeholder="转换结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleTitleCase" 
            type="primary"
            class="mt-2"
            :disabled="!titleCaseStr"
          >
            执行转换
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 下划转驼峰 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">6. 下划转驼峰 (camelCase)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入下划线字符串" label-width="120px">
            <el-input 
              v-model="camelCaseStr" 
              placeholder="请输入下划线命名的字符串"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small">
            提示：将下划线分隔的命名方式转换为驼峰命名法（如user_name → userName）
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="转换结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="camelCaseResult"
              readonly
              placeholder="转换结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleCamelCase" 
            type="primary"
            class="mt-2"
            :disabled="!camelCaseStr"
          >
            执行转换
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 中文转拼音 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">7. 中文转拼音 (chineseToPinYin)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入中文字符" label-width="120px">
            <el-input 
              v-model="chineseStr" 
              placeholder="请输入中文字符"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small">
            提示：将中文转换为对应的拼音，非中文字符保持不变
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="转换结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="pinyinResult"
              readonly
              placeholder="转换结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleChineseToPinYin" 
            type="primary"
            class="mt-2"
            :disabled="!chineseStr"
          >
            转换为拼音
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 8. 创建速记码 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">8. 创建速记码 (creatShortCd)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入字符串" label-width="120px">
            <el-input 
              v-model="shortCodeStr" 
              placeholder="请输入字符串"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small">
            提示：基于拼音创建速记码，通常用于搜索、排序等场景
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="速记码结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="shortCodeResult"
              readonly
              placeholder="速记码结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleCreatShortCd" 
            type="primary"
            class="mt-2"
            :disabled="!shortCodeStr"
          >
            创建速记码
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 9. URL参数处理 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">9. URL参数处理</h2>
      </template>
      <div class="p-4">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="输入URL" label-width="120px">
              <el-input 
                v-model="urlStr" 
                placeholder="请输入包含参数的URL"
                clearable
              ></el-input>
            </el-form-item>
            <el-button 
              @click="setExampleUrl" 
              type="success"
              class="mt-2"
            >
              填充示例URL
            </el-button>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="URL参数对象" label-width="120px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6 }"
                v-model="urlParamsResult"
                readonly
                placeholder="URL参数对象将显示在这里"
              ></el-input>
            </el-form-item>
            <el-space size="small" class="mt-2">
              <el-button 
                @click="handleGetQueryObject" 
                type="primary"
                :disabled="!urlStr"
              >
                解析URL参数 (getQueryObject)
              </el-button>
              <el-button 
                @click="handleParam2Obj" 
                type="primary"
                :disabled="!urlStr"
              >
                解析查询参数 (param2Obj)
              </el-button>
            </el-space>
          </el-col>
        </el-row>
        
        <el-divider class="my-4">对象转URL参数</el-divider>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="参数对象" label-width="120px">
              <el-input 
                v-model="paramObjectStr" 
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6 }"
                placeholder='请输入JSON格式的参数对象，例如: {"name":"测试","age":20}'
                clearable
              ></el-input>
            </el-form-item>
            <el-button 
              @click="setExampleParamObject" 
              type="success"
              class="mt-2"
            >
              填充示例对象
            </el-button>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="URL参数字符串" label-width="120px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6 }"
                v-model="paramStringResult"
                readonly
                placeholder="URL参数字符串将显示在这里"
              ></el-input>
            </el-form-item>
            <el-button 
              @click="handleParam" 
              type="primary"
              class="mt-2"
              :disabled="!paramObjectStr"
            >
              转换为URL参数 (param)
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 导入Element Plus组件
import {
  ElCard, ElRow, ElCol, ElFormItem, ElInput, ElButton,
  ElTag, ElText, ElSpace, ElDivider
} from 'element-plus'
// 导入字符串处理工具类
import {
  sprintf,
  parseStrEmpty,
  byteLength,
  html2Text,
  titleCase,
  camelCase,
  chineseToPinYin,
  creatShortCd,
  getQueryObject,
  param,
  param2Obj
} from '@/utils/common/string.js'  // 请根据实际路径调整

// -------------------------- 1. 字符串格式化相关数据 --------------------------
const sprintfTemplate = ref('Hello, %s! Today is %s.')
const sprintfParams = ref('World, Monday')
const sprintfResult = ref('')

// 执行字符串格式化
const handleSprintf = () => {
  try {
    // 将参数字符串分割为数组
    const paramsArray = sprintfParams.value ? sprintfParams.value.split(',').map(p => p.trim()) : []
    
    // 创建参数数组，第一个元素是模板字符串
    const args = [sprintfTemplate.value, ...paramsArray]
    
    // 调用工具类方法
    const result = sprintf.apply(null, args)
    
    // 显示结果
    sprintfResult.value = result || '格式化失败：参数数量与占位符数量不匹配'
  } catch (error) {
    sprintfResult.value = `格式化错误：${error.message}`
  }
}

// -------------------------- 2. 转换空字符串相关数据 --------------------------
const emptyInput = ref('undefined')
const emptyResult = ref('')

// 设置测试值
const setEmptyTestValue = (value) => {
  emptyInput.value = value
  handleParseStrEmpty()
}

// 执行空字符串转换
const handleParseStrEmpty = () => {
  // 处理特殊值
  let inputValue = emptyInput.value
  if (inputValue === 'undefined') inputValue = undefined
  if (inputValue === 'null') inputValue = null
  
  // 调用工具类方法
  const result = parseStrEmpty(inputValue)
  
  // 显示结果和原始值信息
  emptyResult.value = `转换结果: "${result}"\n` +
                     `原始值类型: ${typeof inputValue}\n` +
                     `原始值: ${inputValue === undefined ? 'undefined' : 
                              inputValue === null ? 'null' : `"${inputValue}"`}`
}

// -------------------------- 3. 字节长度计算相关数据 --------------------------
const byteStr = ref('Hello 世界！123')
const byteResult = ref('')

// 计算字节长度
const handleByteLength = () => {
  // 调用工具类方法
  const length = byteLength(byteStr.value)
  
  // 显示结果
  byteResult.value = `字符串: "${byteStr.value}"\n` +
                    `字节长度: ${length}\n` +
                    `字符数量: ${byteStr.value.length}`
}

// -------------------------- 4. HTML转文本相关数据 --------------------------
const htmlContent = ref('<div class="container"><h1>标题</h1><p>这是一段<span style="color: red;">HTML</span>内容</p></div>')
const html2TextResult = ref('')

// 执行HTML转文本
const handleHtml2Text = () => {
  // 调用工具类方法
  const result = html2Text(htmlContent.value)
  
  // 显示结果
  html2TextResult.value = result
}

// -------------------------- 5. 首字母大写相关数据 --------------------------
const titleCaseStr = ref('hello world! this is a test.')
const titleCaseResult = ref('')

// 执行首字母大写转换
const handleTitleCase = () => {
  // 调用工具类方法
  const result = titleCase(titleCaseStr.value)
  
  // 显示结果
  titleCaseResult.value = `原始字符串: "${titleCaseStr.value}"\n` +
                         `转换结果: "${result}"`
}

// -------------------------- 6. 下划转驼峰相关数据 --------------------------
const camelCaseStr = ref('user_name, user_age, create_time, is_active')
const camelCaseResult = ref('')

// 执行下划转驼峰转换
const handleCamelCase = () => {
  // 处理多个值的情况
  const results = camelCaseStr.value.split(',').map(item => {
    const trimmed = item.trim()
    return `${trimmed} → ${camelCase(trimmed)}`
  })
  
  // 显示结果
  camelCaseResult.value = results.join('\n')
}

// -------------------------- 7. 中文转拼音相关数据 --------------------------
const chineseStr = ref('中国，北京！Hello')
const pinyinResult = ref('')

// 执行中文转拼音
const handleChineseToPinYin = () => {
  // 调用工具类方法
  const result = chineseToPinYin(chineseStr.value)
  
  // 显示结果
  pinyinResult.value = `原始字符串: "${chineseStr.value}"\n` +
                      `拼音结果: "${result}"`
}

// -------------------------- 8. 创建速记码相关数据 --------------------------
const shortCodeStr = ref('张三，李四，王五')
const shortCodeResult = ref('')

// 执行创建速记码
const handleCreatShortCd = () => {
  // 处理多个值的情况
  const results = shortCodeStr.value.split(',').map(item => {
    const trimmed = item.trim()
    return `${trimmed} → ${creatShortCd(trimmed)}`
  })
  
  // 显示结果
  shortCodeResult.value = results.join('\n')
}

// -------------------------- 9. URL参数处理相关数据 --------------------------
const urlStr = ref('')
const urlParamsResult = ref('')
const paramObjectStr = ref('')
const paramStringResult = ref('')

// 设置示例URL
const setExampleUrl = () => {
  urlStr.value = 'https://example.com/path?name=测试&age=25&isStudent=true&score=95.5'
  handleGetQueryObject()
}

// 设置示例参数对象
const setExampleParamObject = () => {
  paramObjectStr.value = '{"name":"测试用户","age":30,"address":"北京市朝阳区","hobbies":["读书","运动"]}'
}

// 解析URL参数 (getQueryObject)
const handleGetQueryObject = () => {
  try {
    // 调用工具类方法
    const result = getQueryObject(urlStr.value)
    
    // 显示结果
    urlParamsResult.value = `getQueryObject 结果:\n${JSON.stringify(result, null, 2)}`
  } catch (error) {
    urlParamsResult.value = `解析错误：${error.message}`
  }
}

// 解析查询参数 (param2Obj)
const handleParam2Obj = () => {
  try {
    // 调用工具类方法
    const result = param2Obj(urlStr.value)
    
    // 显示结果
    urlParamsResult.value = `param2Obj 结果:\n${JSON.stringify(result, null, 2)}`
  } catch (error) {
    urlParamsResult.value = `解析错误：${error.message}`
  }
}

// 转换为URL参数 (param)
const handleParam = () => {
  try {
    // 解析JSON字符串为对象
    const paramObject = JSON.parse(paramObjectStr.value)
    
    // 调用工具类方法
    const result = param(paramObject)
    
    // 显示结果
    paramStringResult.value = result
  } catch (error) {
    paramStringResult.value = `转换错误：${error.message}`
  }
}

// 初始化计算结果
const init = () => {
  handleSprintf()
  handleParseStrEmpty()
  handleByteLength()
  handleHtml2Text()
  handleTitleCase()
  handleCamelCase()
  handleChineseToPinYin()
  handleCreatShortCd()
  setExampleUrl()
  setExampleParamObject()
}

// 页面加载时初始化
init()
</script>

<style scoped>
/* 统一Element组件样式，与其他工具类演示页面保持一致 */
.el-card {
  transition: all 0.3s ease;
  margin-bottom: 24px;
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
/* 适配主界面滚动容器 */
.container {
  box-sizing: border-box;
}
/* 统一表单项间距 */
.el-form-item {
  margin-bottom: 16px;
}
</style>
    