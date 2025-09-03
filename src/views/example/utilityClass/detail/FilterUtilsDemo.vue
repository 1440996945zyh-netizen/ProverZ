<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 16:45:00
 * @LastEditTime: 2025-09-03 16:45:00
 * @LastEditors: zhangsd
 * @Description: 字符串过滤工具类使用案例
 * @FilePath: \view\src\views\example\utilityClass\detail\FilterUtilDemo.vue
-->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold mb-8 text-center text-purple-600">字符串过滤工具类演示</h1>

    <!-- 工具类说明卡片 -->
    <el-card class="mb-8 shadow-md" border>
      <div class="p-4">
        <p class="text-gray-700">
          该工具类提供了丰富的字符串过滤功能，通过指定不同的过滤类型（type），可以对输入内容进行规则化处理，
          过滤非法字符或限制格式（如数字位数、小数位数等），确保输入数据符合业务规范。
        </p>
        <el-tag type="info" size="small" class="mt-2 mr-2">特殊字符过滤</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">数字格式限制</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">特定字符允许</el-tag>
        <el-tag type="info" size="small" class="mt-2">小数位数控制</el-tag>
      </div>
    </el-card>

    <!-- 1. 特殊字符过滤 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">1. 特殊字符过滤</h2>
      </template>
      <div class="p-4">
        <el-row :gutter="20">
          <!-- 过滤大部分特殊字符（保留空格） -->
          <el-col :xs="24" :md="12" class="mb-4 md:mb-0">
            <el-form-item label="charSpace（保留空格）" label-width="180px">
              <el-input 
                v-model="charSpaceValue" 
                @input="handleFilter('charSpace', $event)"
                placeholder="试试输入特殊符号：!@#$%^&* 等"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：过滤特殊符号，但保留空格（适合地址、标题等需要空格的场景）
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="charSpaceResult" 
                readonly
                placeholder="过滤后的结果将显示在这里"
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 过滤所有特殊符号（包括空格） -->
          <el-col :xs="24" :md="12">
            <el-form-item label="spaceChar（含空格）" label-width="180px">
              <el-input 
                v-model="spaceCharValue" 
                @input="handleFilter('spaceChar', $event)"
                placeholder="试试输入特殊符号和空格"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：过滤所有特殊符号（包括空格），仅保留纯文本（适合编码、ID等场景）
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="spaceCharResult" 
                readonly
                placeholder="过滤后的结果将显示在这里"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 2. 数字格式限制 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. 数字格式限制</h2>
      </template>
      <div class="p-4">
        <el-row :gutter="20">
          <!-- 正整数（首位不能为0） -->
          <el-col :xs="24" :md="8" class="mb-4 md:mb-0">
            <el-form-item label="posInteger（正整数）" label-width="180px">
              <el-input 
                v-model="posIntegerValue" 
                @input="handleFilter('posInteger', $event)"
                placeholder="只能输入正整数（首位不为0）"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合序号、数量等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="posIntegerResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 正负整数 -->
          <el-col :xs="24" :md="8" class="mb-4 md:mb-0">
            <el-form-item label="number（正负整数）" label-width="180px">
              <el-input 
                v-model="numberValue" 
                @input="handleFilter('number', $event)"
                placeholder="可以输入正负整数（如-123）"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合温度、海拔等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="numberResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 正小数 -->
          <el-col :xs="24" :md="8">
            <el-form-item label="positiveDecimal（正小数）" label-width="180px">
              <el-input 
                v-model="positiveDecimalValue" 
                @input="handleFilter('positiveDecimal', $event)"
                placeholder="可以输入正小数（如123.45）"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合价格、重量等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="positiveDecimalResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 3. 小数位数控制 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 小数位数精确控制</h2>
      </template>
      <div class="p-4">
        <el-row :gutter="20">
          <!-- 2位小数（金额常用） -->
          <el-col :xs="24" :md="8" class="mb-4 md:mb-0">
            <el-form-item label="exactDecimal（2位）" label-width="180px">
              <el-input 
                v-model="exactDecimalValue" 
                @input="handleFilter('exactDecimal', $event)"
                placeholder="自动保留2位小数（如123.456→123.45）"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合金额、价格等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="exactDecimalResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 6位小数（高精度场景） -->
          <el-col :xs="24" :md="8" class="mb-4 md:mb-0">
            <el-form-item label="sixDecimal（6位）" label-width="180px">
              <el-input 
                v-model="sixDecimalValue" 
                @input="handleFilter('sixDecimal', $event)"
                placeholder="自动保留6位小数（如0.1234567→0.123456）"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合汇率、利率等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="sixDecimalResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 正负两位小数 -->
          <el-col :xs="24" :md="8">
            <el-form-item label="doubleExactDecimal" label-width="180px">
              <el-input 
                v-model="doubleExactValue" 
                @input="handleFilter('doubleExactDecimal', $event)"
                placeholder="允许正负，保留2位小数"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合温差、误差值等场景
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="doubleExactResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 4. 特定字符允许 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. 特定字符允许</h2>
      </template>
      <div class="p-4">
        <el-row :gutter="20">
          <!-- 仅允许数字和字母 -->
          <el-col :xs="24" :md="6" class="mb-4 md:mb-0">
            <el-form-item label="duty（数字字母）" label-width="180px">
              <el-input 
                v-model="dutyValue" 
                @input="handleFilter('duty', $event)"
                placeholder="只能输入数字和字母"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合账号、工号等
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="dutyResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 仅允许中文 -->
          <el-col :xs="24" :md="6" class="mb-4 md:mb-0">
            <el-form-item label="chineseOnly（纯中文）" label-width="180px">
              <el-input 
                v-model="chineseOnlyValue" 
                @input="handleFilter('chineseOnly', $event)"
                placeholder="只能输入中文字符"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合中文姓名、标题等
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="chineseOnlyResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 身份证号（允许数字和x/X） -->
          <el-col :xs="24" :md="6" class="mb-4 md:mb-0">
            <el-form-item label="cardNum（身份证）" label-width="180px">
              <el-input 
                v-model="cardNumValue" 
                @input="handleFilter('cardNum', $event)"
                placeholder="只能输入数字和x/X"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：专门用于身份证号输入
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="cardNumResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>

          <!-- 拉丁字符+特定符号 -->
          <el-col :xs="24" :md="6">
            <el-form-item label="latin（拉丁字符）" label-width="180px">
              <el-input 
                v-model="latinValue" 
                @input="handleFilter('latin', $event)"
                placeholder="允许字母、数字和-_.#"
                clearable
              ></el-input>
              <el-text type="info" size="small" class="mt-1">
                说明：适合文件名、路径等
              </el-text>
            </el-form-item>
            <el-form-item label="过滤后结果" label-width="180px">
              <el-input 
                v-model="latinResult" 
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 5. 综合案例：表单场景 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. 综合案例：表单输入过滤</h2>
      </template>
      <div class="p-4">
        <el-form :model="formData" label-width="150px">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12" class="mb-4">
              <el-form-item label="产品编码（仅数字字母）">
                <el-input 
                  v-model="formData.productCode" 
                  @input="formData.productCode = filter('duty', $event)"
                  placeholder="只能输入数字和字母"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12" class="mb-4">
              <el-form-item label="产品名称（保留空格）">
                <el-input 
                  v-model="formData.productName" 
                  @input="formData.productName = filter('charSpace', $event)"
                  placeholder="过滤特殊符号，保留空格"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12" class="mb-4">
              <el-form-item label="销售价格（2位小数）">
                <el-input 
                  v-model="formData.price" 
                  @input="formData.price = filter('exactDecimal', $event)"
                  placeholder="自动保留2位小数"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12" class="mb-4">
              <el-form-item label="库存数量（正整数）">
                <el-input 
                  v-model="formData.stock" 
                  @input="formData.stock = filter('posInteger', $event)"
                  placeholder="只能输入正整数"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button type="primary" @click="showFormData">获取过滤后的数据</el-button>
          </el-form-item>
          
          <el-form-item label="表单数据预览">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              v-model="formDataPreview"
              readonly
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
// 导入Element Plus组件
import {
  ElCard, ElRow, ElCol, ElForm, ElFormItem, ElInput, 
  ElButton, ElTag, ElText
} from 'element-plus'
// 导入过滤工具函数（请根据实际路径调整）
import filter from '@/utils/verify/verify.js'

// -------------------------- 1. 特殊字符过滤相关数据 --------------------------
const charSpaceValue = ref('')
const charSpaceResult = ref('')
const spaceCharValue = ref('')
const spaceCharResult = ref('')

// -------------------------- 2. 数字格式限制相关数据 --------------------------
const posIntegerValue = ref('')
const posIntegerResult = ref('')
const numberValue = ref('')
const numberResult = ref('')
const positiveDecimalValue = ref('')
const positiveDecimalResult = ref('')

// -------------------------- 3. 小数位数控制相关数据 --------------------------
const exactDecimalValue = ref('')
const exactDecimalResult = ref('')
const sixDecimalValue = ref('')
const sixDecimalResult = ref('')
const doubleExactValue = ref('')
const doubleExactResult = ref('')

// -------------------------- 4. 特定字符允许相关数据 --------------------------
const dutyValue = ref('')
const dutyResult = ref('')
const chineseOnlyValue = ref('')
const chineseOnlyResult = ref('')
const cardNumValue = ref('')
const cardNumResult = ref('')
const latinValue = ref('')
const latinResult = ref('')

// -------------------------- 5. 综合案例表单数据 --------------------------
const formData = reactive({
  productCode: '',
  productName: '',
  price: '',
  stock: ''
})
const formDataPreview = ref('')

// 处理过滤逻辑
const handleFilter = (type, value) => {
  // 调用过滤工具函数
  const filteredValue = filter(type, value)
  
  // 根据类型更新对应的结果
  switch (type) {
    case 'charSpace':
      charSpaceResult.value = filteredValue
      break
    case 'spaceChar':
      spaceCharResult.value = filteredValue
      break
    case 'posInteger':
      posIntegerResult.value = filteredValue
      break
    case 'number':
      numberResult.value = filteredValue
      break
    case 'positiveDecimal':
      positiveDecimalResult.value = filteredValue
      break
    case 'exactDecimal':
      exactDecimalResult.value = filteredValue
      break
    case 'sixDecimal':
      sixDecimalResult.value = filteredValue
      break
    case 'doubleExactDecimal':
      doubleExactResult.value = filteredValue
      break
    case 'duty':
      dutyResult.value = filteredValue
      break
    case 'chineseOnly':
      chineseOnlyResult.value = filteredValue
      break
    case 'cardNum':
      cardNumResult.value = filteredValue
      break
    case 'latin':
      latinResult.value = filteredValue
      break
  }
}

// 显示表单数据
const showFormData = () => {
  formDataPreview.value = JSON.stringify(formData, null, 2)
}

// 初始化示例数据
const init = () => {
  // 特殊字符过滤示例
  charSpaceValue.value = '测试！@# 过滤特殊符号，但保留空格'
  handleFilter('charSpace', charSpaceValue.value)
  
  spaceCharValue.value = '测试 123！@# 过滤所有符号和空格'
  handleFilter('spaceChar', spaceCharValue.value)
  
  // 数字格式示例
  posIntegerValue.value = '0123a45'
  handleFilter('posInteger', posIntegerValue.value)
  
  // 小数控制示例
  exactDecimalValue.value = '123.4567'
  handleFilter('exactDecimal', exactDecimalValue.value)
  
  // 特定字符示例
  cardNumValue.value = '11010119900101123x#'
  handleFilter('cardNum', cardNumValue.value)
}

// 页面加载时初始化
init()
</script>

<style scoped>
/* 统一Element组件样式 */
.el-card {
  transition: all 0.3s ease;
  margin-bottom: 24px;
}
.el-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.el-input[readonly],
.el-input--textarea[readonly] {
  background-color: #f5f7fa !important;
  color: #333 !important;
}
.el-form-item__label {
  font-weight: 500 !important;
}
/* 表单项间距 */
.el-form-item {
  margin-bottom: 16px;
}
/* 容器样式 */
.container {
  box-sizing: border-box;
}
</style>
