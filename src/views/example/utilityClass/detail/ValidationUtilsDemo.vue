<!--
 * @Author: zhangsd
 * @Date: 2025-09-15 14:34:05
 * @LastEditTime: 2025-09-15 15:22:50
 * @LastEditors: zhangsd
 * @Description: 表单验证工具方法演示
 * @FilePath: \view\src\views\example\utilityClass\detail\ValidationUtilsDemo.vue
-->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600">表单验证工具方法演示</h1>

    <!-- 1. 表单处理相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">1. 表单处理相关 (resetForm / setFormData)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form ref="demoForm" :model="formData" label-width="100px" class="form-demo">
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
            <el-space>
              <el-button type="primary" @click="handleSetFormData">填充表单数据</el-button>
              <el-button type="default" @click="handleResetForm">重置表单</el-button>
            </el-space>
          </el-form-item>
        </el-form>
        <el-form-item label="当前表单数据" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            v-model="formDataStr"
            readonly
          ></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 2. URL/外链验证相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. URL/外链验证相关 (isHttpOrHttps / isExternal / validURL)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="8">
          <el-form-item label="URL验证" label-width="80px">
            <el-input v-model="urlInput" placeholder="输入URL" clearable></el-input>
            <el-button @click="handleValidateUrl" type="primary" class="mt-2">验证URL</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="urlResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="外链检测" label-width="80px">
            <el-input v-model="externalPath" placeholder="输入路径" clearable></el-input>
            <el-button @click="handleCheckExternal" type="primary" class="mt-2">检测外链</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="externalResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="HTTP/HTTPS检测" label-width="80px">
            <el-input v-model="httpUrl" placeholder="输入URL" clearable></el-input>
            <el-button @click="handleCheckHttpProtocol" type="primary" class="mt-2">检测协议</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="httpResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 基础验证相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 基础验证相关 (validUsername / validLowerCase / validUpperCase / validAlphabets / validEmail / isString / isArray)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="8">
          <el-form-item label="用户名验证" label-width="80px">
            <el-input v-model="usernameInput" placeholder="输入用户名" clearable></el-input>
            <el-button @click="handleValidateUsername" type="primary" class="mt-2">验证用户名</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="usernameResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="小写字母验证" label-width="80px">
            <el-input v-model="lowercaseInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="handleValidateLowercase" type="primary" class="mt-2">验证小写字母</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="lowercaseResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="大写字母验证" label-width="80px">
            <el-input v-model="uppercaseInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="handleValidateUppercase" type="primary" class="mt-2">验证大写字母</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="uppercaseResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="纯字母验证" label-width="80px">
            <el-input v-model="alphabetsInput" placeholder="输入字符串" clearable></el-input>
            <el-button @click="handleValidateAlphabets" type="primary" class="mt-2">验证纯字母</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="alphabetsResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="邮箱验证" label-width="80px">
            <el-input v-model="emailInput" placeholder="输入邮箱" clearable></el-input>
            <el-button @click="handleValidateEmail" type="primary" class="mt-2">验证邮箱</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="emailResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="字符串验证" label-width="80px">
            <el-input v-model="stringInput" placeholder="输入值" clearable></el-input>
            <el-button @click="handleValidateStringType" type="primary" class="mt-2">验证字符串类型</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="stringResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="数组验证" label-width="80px">
            <el-input v-model="arrayInput" placeholder="输入数组" clearable></el-input>
            <el-button @click="handleValidateArrayType" type="primary" class="mt-2">验证数组类型</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="arrayResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 表单验证规则相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. 表单验证规则相关 (各种验证规则)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="数字格式验证" label-width="120px">
            <el-input v-model="numberInput" placeholder="输入数字" clearable></el-input>
            <el-form-item label="整数位数" label-width="100px">
              <el-input v-model="intLength" type="number" placeholder="整数位数" clearable></el-input>
            </el-form-item>
            <el-form-item label="小数位数" label-width="100px">
              <el-input v-model="decLength" type="number" placeholder="小数位数" clearable></el-input>
            </el-form-item>
            <el-form-item label="正负号" label-width="100px">
              <el-select v-model="plusMinus" placeholder="选择正负号" style="width: 120px">
                <el-option label="正数" value="+"></el-option>
                <el-option label="负数" value="-"></el-option>
                <el-option label="任意" value=""></el-option>
              </el-select>
            </el-form-item>
            <el-button @click="handleValidateNumberFormat" type="primary" class="mt-2">验证数字格式</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="numberValidationResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="银行卡验证" label-width="120px">
            <el-input v-model="bankCardInput" placeholder="输入银行卡号" clearable></el-input>
            <el-button @click="handleValidateBankCard" type="primary" class="mt-2">验证银行卡</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="bankCardResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="手机号验证" label-width="120px">
            <el-input v-model="phoneInput" placeholder="输入手机号" clearable></el-input>
            <el-button @click="handleValidateMobilePhone" type="primary" class="mt-2">验证手机号</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="phoneResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="电话号码验证" label-width="120px">
            <el-input v-model="telInput" placeholder="输入电话号码" clearable></el-input>
            <el-button @click="handleValidateTelephone" type="primary" class="mt-2">验证电话号码</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="telResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="身份证验证" label-width="120px">
            <el-input v-model="idCardInput" placeholder="输入身份证号" clearable></el-input>
            <el-button @click="handleValidateIdCard" type="primary" class="mt-2">验证身份证</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="idCardResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 其他验证相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. 其他验证相关 (validateAlphanumeric / validateAlphaNumeric / validatePhone / validateEmail / validateVersion / isValidIP)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="8">
          <el-form-item label="字母数字组合" label-width="80px">
            <el-input v-model="alphaNumericInput" placeholder="输入字符串" clearable></el-input>
            <el-form-item label="最小长度" label-width="80px">
              <el-input v-model="minLength" type="number" placeholder="最小长度" clearable></el-input>
            </el-form-item>
            <el-form-item label="最大长度" label-width="80px">
              <el-input v-model="maxLength" type="number" placeholder="最大长度" clearable></el-input>
            </el-form-item>
            <el-button @click="handleValidateAlphaNumeric" type="primary" class="mt-2">验证字母数字组合</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="alphaNumericResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="字母或数字" label-width="80px">
            <el-input v-model="alphaOrNumericInput" placeholder="输入字符串" clearable></el-input>
            <el-form-item label="最小长度" label-width="80px">
              <el-input v-model="minLength2" type="number" placeholder="最小长度" clearable></el-input>
            </el-form-item>
            <el-form-item label="最大长度" label-width="80px">
              <el-input v-model="maxLength2" type="number" placeholder="最大长度" clearable></el-input>
            </el-form-item>
            <el-button @click="handleValidateAlphaOrNumeric" type="primary" class="mt-2">验证字母或数字</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="alphaOrNumericResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="电话号码验证" label-width="80px">
            <el-input v-model="phoneInput2" placeholder="输入电话号码" clearable></el-input>
            <el-button @click="handleValidatePhone2" type="primary" class="mt-2">验证电话号码</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="phoneResult2"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="邮箱验证" label-width="80px">
            <el-input v-model="emailInput2" placeholder="输入邮箱" clearable></el-input>
            <el-button @click="handleValidateEmail2" type="primary" class="mt-2">验证邮箱</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="emailResult2"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="版本号验证" label-width="80px">
            <el-input v-model="versionInput" placeholder="输入版本号" clearable></el-input>
            <el-button @click="handleValidateVersion" type="primary" class="mt-2">验证版本号</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="versionResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="IP地址验证" label-width="80px">
            <el-input v-model="ipInput" placeholder="输入IP地址" clearable></el-input>
            <el-button @click="handleValidateIP" type="primary" class="mt-2">验证IP地址</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="ipResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 文件验证相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">6. 文件验证相关 (determineFileType / validUploadFile)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="文件类型判断" label-width="120px">
            <el-input v-model="fileTypeInput" placeholder="输入文件名" clearable></el-input>
            <el-form-item label="允许类型" label-width="120px">
              <el-input v-model="allowedTypes" placeholder="img,video,pdf" clearable></el-input>
            </el-form-item>
            <el-button @click="handleDetermineFileType" type="primary" class="mt-2">判断文件类型</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="fileTypeResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="文件上传校验" label-width="120px">
            <el-input v-model="uploadFileInput" placeholder="输入文件名" clearable></el-input>
            <el-form-item label="允许类型" label-width="120px">
              <el-input v-model="uploadAllowedTypes" placeholder="img,video,pdf" clearable></el-input>
            </el-form-item>
            <el-form-item label="文件大小(KB)" label-width="120px">
              <el-input v-model="fileSize" type="number" placeholder="文件大小" clearable></el-input>
            </el-form-item>
            <el-button @click="handleValidateUploadFile" type="primary" class="mt-2">校验上传文件</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="uploadResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 输入修正相关 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">7. 输入修正相关 (filterInput)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入修正" label-width="120px">
            <el-input v-model="inputValue" placeholder="输入内容" clearable></el-input>
            <el-form-item label="修正类型" label-width="120px">
              <el-select v-model="filterType" placeholder="选择修正类型" style="width: 150px">
                <el-option label="数字" value="number"></el-option>
                <el-option label="正整数" value="positiveNumber"></el-option>
                <el-option label="小数" value="decimal"></el-option>
                <el-option label="正小数" value="positiveDecimal"></el-option>
                <el-option label="精确到两位小数" value="exactDecimal"></el-option>
                <el-option label="精确到六位小数" value="sixDecimal"></el-option>
                <el-option label="中文" value="chineseOnly"></el-option>
                <el-option label="字母数字" value="duty"></el-option>
                <el-option label="数字和中文" value="numChinese"></el-option>
                <el-option label="银行卡号" value="cardNum"></el-option>
                <el-option label="拉丁字母" value="latin"></el-option>
                <el-option label="带空格的拉丁字母" value="latinSpace"></el-option>
              </el-select>
            </el-form-item>
            <el-button @click="handleFilterInput" type="primary" class="mt-2">修正输入</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="filteredResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="精确小数修正" label-width="120px">
            <el-input v-model="decimalInput" placeholder="输入小数" clearable></el-input>
            <el-form-item label="小数位数" label-width="120px">
              <el-select v-model="decimalPrecision" placeholder="选择小数位数" style="width: 150px">
                <el-option label="1位" value="onePoint"></el-option>
                <el-option label="2位" value="twoPoint"></el-option>
                <el-option label="3位" value="threePoint"></el-option>
                <el-option label="4位" value="fourPoint"></el-option>
              </el-select>
            </el-form-item>
            <el-button @click="handleFilterDecimal" type="primary" class="mt-2">修正小数</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="decimalResult"
              readonly
              class="mt-2"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import {
  ElCard,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSpace,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import {
  resetForm,
  setFormData,
  isHttpOrHttps,
  isExternal,
  validURL,
  validUsername,
  validLowerCase,
  validUpperCase,
  validAlphabets,
  validEmail,
  isString,
  isArray,
  getRules,
  validateEmailRule,
  validateNumberFormat,
  createNumberValidationError,
  isEmptyTrim,
  isInteger,
  isDecimal,
  isBankCard,
  isMobilePhone,
  isTelephone,
  isIdCard,
  isEmpty,
  validationMessages,
  validateAlphaNumeric,
  validatePhone,
  validateEmail as validateEmail2,
  validateVersion,
  isValidIP,
  determineFileType,
  validUploadFile,
  filterInput as filterInputMethod
} from '@/utils/common/form-validation.js'

// 获取组件实例
const instance = getCurrentInstance()

// 1. 表单处理相关
const formData = ref({
  name: '',
  age: null,
  email: ''
})
const formDataStr = ref(JSON.stringify(formData.value, null, 2))

const handleSetFormData = () => {
  const sampleData = {
    name: '张三',
    age: 28,
    email: 'zhangsan@example.com',
    extraField: '不会显示（仅匹配表单已有字段）'
  }
  setFormData(formData.value, sampleData)
  formDataStr.value = JSON.stringify(formData.value, null, 2)
}

const handleResetForm = () => {
  resetForm.call(instance.proxy, 'demoForm')
  formDataStr.value = JSON.stringify(formData.value, null, 2)
}

// 2. URL/外链验证相关
const urlInput = ref('https://example.com  ')
const urlResult = ref('')

const handleValidateUrl = () => {
  urlResult.value = validURL(urlInput.value) ? 'URL格式有效' : 'URL格式无效'
}

const externalPath = ref('https://example.com  ')
const externalResult = ref('')

const handleCheckExternal = () => {
  externalResult.value = isExternal(externalPath.value) ? '是外链' : '不是外链'
}

const httpUrl = ref('http://example.com')
const httpResult = ref('')

const handleCheckHttpProtocol = () => {
  httpResult.value = isHttpOrHttps(httpUrl.value) ? '是HTTP/HTTPS协议' : '不是HTTP/HTTPS协议'
}

// 3. 基础验证相关
const usernameInput = ref('admin')
const usernameResult = ref('')

const handleValidateUsername = () => {
  usernameResult.value = validUsername(usernameInput.value) ? '有效用户名' : '无效用户名'
}

const lowercaseInput = ref('abc')
const lowercaseResult = ref('')

const handleValidateLowercase = () => {
  lowercaseResult.value = validLowerCase(lowercaseInput.value) ? '仅包含小写字母' : '不满足条件'
}

const uppercaseInput = ref('ABC')
const uppercaseResult = ref('')

const handleValidateUppercase = () => {
  uppercaseResult.value = validUpperCase(uppercaseInput.value) ? '仅包含大写字母' : '不满足条件'
}

const alphabetsInput = ref('abcABC')
const alphabetsResult = ref('')

const handleValidateAlphabets = () => {
  alphabetsResult.value = validAlphabets(alphabetsInput.value) ? '仅包含字母' : '不满足条件'
}

const emailInput = ref('test@example.com')
const emailResult = ref('')

const handleValidateEmail = () => {
  emailResult.value = validEmail(emailInput.value) ? '有效邮箱' : '无效邮箱'
}

const stringInput = ref('hello')
const stringResult = ref('')

const handleValidateStringType = () => {
  stringResult.value = isString(stringInput.value) ? '是字符串' : '不是字符串'
}

const arrayInput = ref('[1,2,3]')
const arrayResult = ref('')

const handleValidateArrayType = () => {
  let value = arrayInput.value
  try {
    value = JSON.parse(arrayInput.value)
  } catch (e) {
    // 如果不是有效JSON，保持原样
  }
  arrayResult.value = isArray(value) ? '是数组' : '不是数组'
}

// 4. 表单验证规则相关
const numberInput = ref('123.45')
const intLength = ref(5)
const decLength = ref(2)
const plusMinus = ref('')
const numberValidationResult = ref('')

const handleValidateNumberFormat = () => {
  const rule = {
    int: intLength.value,
    dec: decLength.value,
    startWith: plusMinus.value,
    cellValue: numberInput.value
  }
  try {
    validateNumberFormat(rule, numberInput.value, (err) => {
      numberValidationResult.value = err ? err.message : '验证通过'
    })
  } catch (e) {
    numberValidationResult.value = '验证错误: ' + e.message
  }
}

const bankCardInput = ref('6225880000000000')
const bankCardResult = ref('')

const handleValidateBankCard = () => {
  const rule = { cellValue: bankCardInput.value }
  try {
    isBankCard(rule, bankCardInput.value, (err) => {
      bankCardResult.value = err ? err.message : '验证通过'
    })
  } catch (e) {
    bankCardResult.value = '验证错误: ' + e.message
  }
}

const phoneInput = ref('13800138000')
const phoneResult = ref('')

const handleValidateMobilePhone = () => {
  const rule = { cellValue: phoneInput.value }
  try {
    isMobilePhone(rule, phoneInput.value, (err) => {
      phoneResult.value = err ? err.message : '验证通过'
    })
  } catch (e) {
    phoneResult.value = '验证错误: ' + e.message
  }
}

const telInput = ref('010-12345678')
const telResult = ref('')

const handleValidateTelephone = () => {
  const rule = { cellValue: telInput.value }
  try {
    isTelephone(rule, telInput.value, (err) => {
      telResult.value = err ? err.message : '验证通过'
    })
  } catch (e) {
    telResult.value = '验证错误: ' + e.message
  }
}

const idCardInput = ref('110101199003072316')
const idCardResult = ref('')

const handleValidateIdCard = () => {
  const rule = { cellValue: idCardInput.value }
  try {
    isIdCard(rule, idCardInput.value, (err) => {
      idCardResult.value = err ? err.message : '验证通过'
    })
  } catch (e) {
    idCardResult.value = '验证错误: ' + e.message
  }
}

// 5. 其他验证相关
const alphaNumericInput = ref('abc123')
const minLength = ref(3)
const maxLength = ref(6)
const alphaNumericResult = ref('')

const handleValidateAlphaNumeric = () => {
  alphaNumericResult.value = validateAlphaNumeric(alphaNumericInput.value, minLength.value, maxLength.value) 
    ? '符合字母数字组合规则' : '不符合字母数字组合规则'
}

const alphaOrNumericInput = ref('abc123')
const minLength2 = ref(3)
const maxLength2 = ref(6)
const alphaOrNumericResult = ref('')

const handleValidateAlphaOrNumeric = () => {
  alphaOrNumericResult.value = validateAlphaNumeric(alphaOrNumericInput.value, minLength2.value, maxLength2.value) 
    ? '符合字母或数字规则' : '不符合字母或数字规则'
}

const phoneInput2 = ref('010-12345678')
const phoneResult2 = ref('')

const handleValidatePhone2 = () => {
  phoneResult2.value = validatePhone(phoneInput2.value) ? '符合电话号码格式' : '不符合电话号码格式'
}

const emailInput2 = ref('test@example.com')
const emailResult2 = ref('')

const handleValidateEmail2 = () => {
  emailResult2.value = validateEmail2(emailInput2.value) ? '符合邮箱格式' : '不符合邮箱格式'
}

const versionInput = ref('1.2.3')
const versionResult = ref('')

const handleValidateVersion = () => {
  versionResult.value = validateVersion(versionInput.value) ? '符合版本号格式' : '不符合版本号格式'
}

const ipInput = ref('192.168.1.1')
const ipResult = ref('')

const handleValidateIP = () => {
  ipResult.value = isValidIP(ipInput.value) ? '符合IP地址格式' : '不符合IP地址格式'
}

// 6. 文件验证相关
const fileTypeInput = ref('image.jpg')
const allowedTypes = ref('img,video')
const fileTypeResult = ref('')

const handleDetermineFileType = () => {
  const file = {
    name: fileTypeInput.value,
    size: 1024
  }
  fileTypeResult.value = determineFileType(allowedTypes.value, file)
}

const uploadFileInput = ref('image.jpg')
const uploadAllowedTypes = ref('img,video')
const fileSize = ref(512)
const uploadResult = ref('')

const handleValidateUploadFile = () => {
  const file = {
    name: uploadFileInput.value,
    size: fileSize.value * 1024
  }
  const result = validUploadFile(uploadAllowedTypes.value, file)
  uploadResult.value = result ? result : '验证通过'
}

// 7. 输入修正相关
const inputValue = ref('123.45abc')
const filterType = ref('number')
const filteredResult = ref('')

const handleFilterInput = () => {
  filteredResult.value = filterInputMethod(filterType.value, inputValue.value)
}

const decimalInput = ref('123.45678')
const decimalPrecision = ref('twoPoint')
const decimalResult = ref('')

const handleFilterDecimal = () => {
  decimalResult.value = filterInputMethod(decimalPrecision.value, decimalInput.value)
}

// 初始化数据
const init = () => {
  handleValidateUrl()
  handleCheckExternal()
  handleCheckHttpProtocol()
  handleValidateUsername()
  handleValidateLowercase()
  handleValidateUppercase()
  handleValidateAlphabets()
  handleValidateEmail()
  handleValidateStringType()
  handleValidateArrayType()
  handleValidateNumberFormat()
  handleValidateBankCard()
  handleValidateMobilePhone()
  handleValidateTelephone()
  handleValidateIdCard()
  handleValidateAlphaNumeric()
  handleValidateAlphaOrNumeric()
  handleValidatePhone2()
  handleValidateEmail2()
  handleValidateVersion()
  handleValidateIP()
  handleDetermineFileType()
  handleValidateUploadFile()
  handleFilterInput()
  handleFilterDecimal()
}

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