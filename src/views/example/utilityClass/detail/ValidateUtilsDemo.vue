<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 15:31:04
 * @LastEditTime: 2025-09-03 15:31:04
 * @LastEditors: zhangsd
 * @Description: 数据验证与工具类演示 validation-utils-demo.vue
 * @FilePath: \view\src\views\example\utilityClass\detail\ValidationUtilsDemo.vue
-->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold mb-8 text-center text-purple-600">数据验证与工具类演示</h1>

    <!-- 工具类说明卡片 -->
    <el-card class="mb-8 shadow-md" border>
      <div class="p-4">
        <p class="text-gray-700">
          该工具类提供了丰富的数据验证与通用工具功能，包括URL/IP验证、字符串格式校验、手机号/身份证/邮箱等格式验证、文件上传校验、数字验证及类型判断等实用方法。
        </p>
        <el-tag type="info" size="small" class="mt-2 mr-2">URL/IP验证</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">格式校验</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">文件上传验证</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">数字验证</el-tag>
        <el-tag type="info" size="small" class="mt-2">类型判断</el-tag>
      </div>
    </el-card>

    <!-- 1. URL与IP验证 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">1. URL与IP验证</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入URL/IP" label-width="120px">
            <el-input 
              v-model="urlIpInput" 
              placeholder="示例：https://www.example.com 或 192.168.1.1"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small" class="mt-1">
            支持验证：是否为HTTP/HTTPS、是否为外链、是否为有效URL、是否为有效IP
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="urlIpResult"
              readonly
              placeholder="验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleUrlIpCheck" 
            type="primary"
            class="mt-2"
            :disabled="!urlIpInput"
          >
            执行验证
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. 字符串基础验证 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. 字符串基础验证</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入字符串" label-width="120px">
            <el-input 
              v-model="strBaseInput" 
              placeholder="示例：admin、abc123、HELLO"
              clearable
            ></el-input>
          </el-form-item>
          <el-space direction="vertical" size="small" class="mt-2">
            <el-text type="info" size="small">支持验证类型：</el-text>
            <el-text type="info" size="small">- 合法用户名（仅支持admin/editor）</el-text>
            <el-text type="info" size="small">- 纯小写字母、纯大写字母、纯字母</el-text>
          </el-space>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="strBaseResult"
              readonly
              placeholder="验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleStrBaseCheck" 
            type="primary"
            class="mt-2"
            :disabled="!strBaseInput"
          >
            执行验证
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 常用格式验证 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 常用格式验证（邮箱/手机/身份证等）</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择验证类型" label-width="120px">
            <el-select v-model="formatCheckType" placeholder="请选择验证类型">
              <el-option label="邮箱" value="email"></el-option>
              <el-option label="手机号" value="phone"></el-option>
              <el-option label="固定电话" value="telephone"></el-option>
              <el-option label="身份证号" value="idCard"></el-option>
              <el-option label="银行卡号" value="bankCard"></el-option>
              <el-option label="版本号（x.x.x）" value="version"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="输入验证值" label-width="120px">
            <el-input 
              v-model="formatCheckValue" 
              :placeholder="getFormatPlaceholder()"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="formatCheckResult"
              readonly
              placeholder="验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleFormatCheck" 
            type="primary"
            class="mt-2"
            :disabled="!formatCheckType || !formatCheckValue"
          >
            执行验证
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 字母数字组合验证 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. 字母数字组合验证</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入验证值" label-width="120px">
            <el-input 
              v-model="alphaNumInput" 
              placeholder="请输入字母数字组合"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="长度范围（min-max）" label-width="120px">
            <el-input 
              v-model="alphaNumLength" 
              placeholder="示例：6-12"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="验证类型" label-width="120px">
            <el-radio-group v-model="alphaNumType">
              <el-radio label="combine">必须包含字母和数字</el-radio>
              <el-radio label="either">仅允许字母或数字（可纯字母/纯数字）</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="alphaNumResult"
              readonly
              placeholder="验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleAlphaNumCheck" 
            type="primary"
            class="mt-2"
            :disabled="!alphaNumInput || !alphaNumLength"
          >
            执行验证
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 数字验证（整数/小数位数） -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. 数字验证（整数/小数位数控制）</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入数字" label-width="120px">
            <el-input 
              v-model="numberInput" 
              placeholder="示例：123、123.45、-123.4"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="整数最大位数" label-width="120px">
            <el-input 
              v-model="intLength" 
              type="number"
              placeholder="示例：3"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="小数最大位数" label-width="120px">
            <el-input 
              v-model="decLength" 
              type="number"
              placeholder="示例：2（0表示仅整数）"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="正负允许" label-width="120px">
            <el-select v-model="plusMinus" placeholder="请选择">
              <el-option label="允许正负" value="both"></el-option>
              <el-option label="仅正数" value="+"></el-option>
              <el-option label="仅负数" value="-"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="numberResult"
              readonly
              placeholder="验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleNumberCheck" 
            type="primary"
            class="mt-2"
            :disabled="!numberInput || !intLength || decLength === undefined"
          >
            执行验证
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 类型判断（字符串/数组） -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">6. 数据类型判断</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="输入值" label-width="120px">
            <el-input 
              v-model="typeCheckInput" 
              placeholder="示例：abc、[1,2,3]、123"
              clearable
            ></el-input>
          </el-form-item>
          <el-text type="info" size="small" class="mt-1">
            提示：数组需输入JSON格式（如[1,2,3]），其他值直接输入
          </el-text>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="判断结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="typeCheckResult"
              readonly
              placeholder="判断结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleTypeCheck" 
            type="primary"
            class="mt-2"
            :disabled="!typeCheckInput"
          >
            执行判断
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 文件上传验证 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">7. 文件上传验证</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="允许文件类型" label-width="120px">
            <el-select v-model="allowFileType" placeholder="请选择允许的类型">
              <el-option label="图片（jpg/png/gif）" value="img"></el-option>
              <el-option label="视频（mp4/ogv等）" value="video"></el-option>
              <el-option label="音频（mp3/wav等）" value="audio"></el-option>
              <el-option label="Excel（xlsx/xls）" value="excel"></el-option>
              <el-option label="PDF" value="file"></el-option>
              <el-option label="多类型（img,excel）" value="img,excel"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择文件" label-width="120px">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              :before-upload="beforeFileUpload"
            >
              <el-button type="primary">点击选择文件</el-button>
              <div class="el-upload__tip mt-2" slot="tip">
                支持最大10MB，不允许文件名包含%、&字符
              </div>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="文件验证结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="fileCheckResult"
              readonly
              placeholder="文件信息及验证结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="clearFile" 
            type="default"
            class="mt-2 mr-2"
            :disabled="fileList.length === 0"
          >
            清空文件
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 导入Element Plus组件
import {
  ElCard, ElRow, ElCol, ElFormItem, ElInput, ElButton,
  ElTag, ElText, ElSpace, ElSelect, ElOption, ElRadioGroup,
  ElRadio, ElUpload, ElMessage
} from 'element-plus'
// 导入数据验证工具类（请根据实际文件路径调整）
import {
  isHttp, isExternal, validURL, isValidIP,
  validUsername, validLowerCase, validUpperCase, validAlphabets,
  validEmail, isHandset, isTelephone, isIdCard, isBankCard,
  validateAlphanumeric, validateAlphaOrnumeric, validatePhone,
  validatePostbox, validateVersion,
  isString, isArray,
  fileTypeback, validUploadFile,
  numberCheck, isLong, isDouble,
  isEmpty, isEmptyTrim, check_msg
} from '@/utils/verify/validate.js'

// -------------------------- 1. URL与IP验证相关数据 --------------------------
const urlIpInput = ref('https://www.example.com/path?name=test&age=20')
const urlIpResult = ref('')

// 执行URL与IP验证
const handleUrlIpCheck = () => {
  try {
    const input = urlIpInput.value.trim()
    const result = [
      `输入值：${input}`,
      `是否为HTTP/HTTPS协议：${isHttp(input) ? '是' : '否'}`,
      `是否为外链（http/https/mailto/tel）：${isExternal(input) ? '是' : '否'}`,
      `是否为有效URL：${validURL(input) ? '是' : '否'}`,
      `是否为有效IP地址：${isValidIP(input) ? '是' : '否'}`
    ].join('\n')
    urlIpResult.value = result
  } catch (error) {
    urlIpResult.value = `验证错误：${error.message}`
  }
}

// -------------------------- 2. 字符串基础验证相关数据 --------------------------
const strBaseInput = ref('admin')
const strBaseResult = ref('')

// 执行字符串基础验证
const handleStrBaseCheck = () => {
  try {
    const input = strBaseInput.value.trim()
    const result = [
      `输入值：${input}`,
      `是否为合法用户名（admin/editor）：${validUsername(input) ? '是' : '否'}`,
      `是否为纯小写字母：${validLowerCase(input) ? '是' : '否'}`,
      `是否为纯大写字母：${validUpperCase(input) ? '是' : '否'}`,
      `是否为纯字母（不含数字/符号）：${validAlphabets(input) ? '是' : '否'}`
    ].join('\n')
    strBaseResult.value = result
  } catch (error) {
    strBaseResult.value = `验证错误：${error.message}`
  }
}

// -------------------------- 3. 常用格式验证相关数据 --------------------------
const formatCheckType = ref('email')
const formatCheckValue = ref('test@example.com')
const formatCheckResult = ref('')

// 获取格式验证占位符
const getFormatPlaceholder = () => {
  const placeholders = {
    email: '示例：test@example.com',
    phone: '示例：13800138000',
    telephone: '示例：010-12345678 或 021-87654321-1234',
    idCard: '示例：110101199001011234 或 11010119900101123X',
    bankCard: '示例：6222021234567890123',
    version: '示例：1.0.0 或 2.3.4'
  }
  return placeholders[formatCheckType.value] || '请输入验证值'
}

// 执行常用格式验证
const handleFormatCheck = () => {
  try {
    const type = formatCheckType.value
    const value = formatCheckValue.value.trim()
    let result = false
    let checkName = ''

    switch (type) {
      case 'email':
        result = validEmail(value) || validatePostbox(value)
        checkName = '邮箱格式'
        break
      case 'phone':
        result = isHandset({ cellValue: value }) || validatePhone(value)
        checkName = '手机号格式'
        break
      case 'telephone':
        result = isTelephone({ cellValue: value })
        checkName = '固定电话格式'
        break
      case 'idCard':
        result = isIdCard({ cellValue: value })
        checkName = '身份证号格式'
        break
      case 'bankCard':
        result = isBankCard({ cellValue: value })
        checkName = '银行卡号格式'
        break
      case 'version':
        result = validateVersion(value)
        checkName = '版本号格式（x.x.x）'
        break
      default:
        throw new Error('未知的验证类型')
    }

    // 处理validator函数返回值（可能返回Error对象）
    if (result instanceof Error) {
      formatCheckResult.value = `输入值：${value}\n${checkName}验证：失败\n原因：${result.message}`
    } else {
      formatCheckResult.value = `输入值：${value}\n${checkName}验证：${result ? '成功' : '失败'}`
    }
  } catch (error) {
    formatCheckResult.value = `验证错误：${error.message}`
  }
}

// -------------------------- 4. 字母数字组合验证相关数据 --------------------------
const alphaNumInput = ref('Abc12345')
const alphaNumLength = ref('6-12')
const alphaNumType = ref('combine')
const alphaNumResult = ref('')

// 执行字母数字组合验证
const handleAlphaNumCheck = () => {
  try {
    const input = alphaNumInput.value.trim()
    const [min, max] = alphaNumLength.value.split('-').map(Number)
    
    if (isNaN(min) || isNaN(max) || min > max) {
      throw new Error('长度范围格式错误，请输入"min-max"格式（如6-12）')
    }

    let result = false
    let checkDesc = ''
    if (alphaNumType.value === 'combine') {
      result = validateAlphanumeric(input, min, max)
      checkDesc = `必须包含字母和数字，长度${min}-${max}位`
    } else {
      result = validateAlphaOrnumeric(input, min, max)
      checkDesc = `仅允许字母或数字，长度${min}-${max}位`
    }

    alphaNumResult.value = [
      `输入值：${input}`,
      `验证规则：${checkDesc}`,
      `验证结果：${result ? '成功' : '失败'}`
    ].join('\n')
  } catch (error) {
    alphaNumResult.value = `验证错误：${error.message}`
  }
}

// -------------------------- 5. 数字验证相关数据 --------------------------
const numberInput = ref('123.45')
const intLength = ref(3)
const decLength = ref(2)
const plusMinus = ref('both')
const numberResult = ref('')

// 执行数字验证
const handleNumberCheck = () => {
  try {
    const input = numberInput.value.trim()
    const intLen = parseInt(intLength.value)
    const decLen = parseInt(decLength.value)
    let startWith = plusMinus.value === 'both' ? '' : plusMinus.value

    // 构造numberCheck需要的rule参数
    const rule = {
      rule: {
        int: intLen,
        dec: decLen,
        startWith
      },
      cellValue: input
    }

    // 调用numberCheck验证（返回Error或undefined）
    const checkError = numberCheck(rule)
    
    const resultArr = [
      `输入值：${input}`,
      `验证规则：整数最多${intLen}位，小数最多${decLen}位，${
        plusMinus.value === 'both' ? '允许正负' : 
        plusMinus.value === '+' ? '仅允许正数' : '仅允许负数'
      }`,
      `是否为整数格式：${isLong(input) ? '是' : '否'}`,
      `是否为数字格式（含小数）：${isLong(input) || isDouble(input) ? '是' : '否'}`
    ]

    if (checkError instanceof Error) {
      resultArr.push(`验证结果：失败\n原因：${checkError.message}`)
    } else {
      resultArr.push('验证结果：成功')
    }

    numberResult.value = resultArr.join('\n')
  } catch (error) {
    numberResult.value = `验证错误：${error.message}`
  }
}

// -------------------------- 6. 类型判断相关数据 --------------------------
const typeCheckInput = ref('[1, 2, 3, "test"]')
const typeCheckResult = ref('')

// 执行类型判断
const handleTypeCheck = () => {
  try {
    const input = typeCheckInput.value.trim()
    let value = input
    let parseError = false

    // 尝试解析JSON（处理数组情况）
    try {
      value = JSON.parse(input)
    } catch (e) {
      // 解析失败则视为普通字符串
      parseError = true
    }

    const result = [
      `原始输入：${input}`,
      `解析后值：${JSON.stringify(value, null, 2)}`,
      `是否为字符串类型：${isString(value) ? '是' : '否'}`,
      `是否为数组类型：${isArray(value) ? '是' : '否'}`,
      `原始输入是否为空值：${isEmpty(input) ? '是' : '否'}`,
      `原始输入去空格后是否为空：${isEmptyTrim(input) ? '是' : '否'}`
    ].join('\n')

    typeCheckResult.value = result
  } catch (error) {
    typeCheckResult.value = `判断错误：${error.message}`
  }
}

// -------------------------- 7. 文件上传验证相关数据 --------------------------
const allowFileType = ref('img')
const fileList = ref([])
const fileCheckResult = ref('')

// 文件选择变化处理
const handleFileChange = (uploadFile) => {
  try {
    // 清空文件列表，仅保留当前选择的文件
    fileList.value = [uploadFile]
    const file = uploadFile.raw

    // 1. 获取文件类型分类
    const fileType = fileTypeback(allowFileType.value, file)
    
    // 2. 执行文件验证
    const checkResult = validUploadFile(allowFileType.value, file)
    
    // 3. 构造结果信息
    const result = [
      `文件名：${file.name}`,
      `文件大小：${(file.size / 1024 / 1024).toFixed(2)} MB`,
      `文件类型（扩展名）：${file.name.split('.').pop().toLowerCase()}`,
      `系统分类：${fileType}（${getAllowTypeDesc(allowFileType.value)}）`,
      `验证结果：${checkResult ? '失败' : '成功'}`
    ]

    if (checkResult) {
      result.push(`验证失败原因：${checkResult}`)
      ElMessage.error(checkResult)
    } else {
      result.push('验证通过：文件类型和大小符合要求')
      ElMessage.success('文件验证通过')
    }

    fileCheckResult.value = result.join('\n')
  } catch (error) {
    fileCheckResult.value = `文件验证错误：${error.message}`
    ElMessage.error(`文件处理错误：${error.message}`)
  }
}

// 文件上传前验证（阻止自动上传）
const beforeFileUpload = (file) => {
  handleFileChange({ raw: file })
  return false // 阻止默认上传行为
}

// 清空文件
const clearFile = () => {
  fileList.value = []
  fileCheckResult.value = ''
}

// 获取允许的文件类型描述
const getAllowTypeDesc = (type) => {
  const typeDesc = {
    img: '图片（jpg/jpeg/png/gif）',
    video: '视频（mp4/ogv/ogg/webm）',
    audio: '音频（wav/mp3/ogg/acc/webm/amr）',
    excel: 'Excel（xlsx/xls）',
    file: 'PDF'
  }
  if (type.includes(',')) {
    return type.split(',').map(t => typeDesc[t] || t).join('、')
  }
  return typeDesc[type] || type
}

// -------------------------- 页面初始化 --------------------------
const init = () => {
  handleUrlIpCheck()
  handleStrBaseCheck()
  handleFormatCheck()
  handleAlphaNumCheck()
  handleNumberCheck()
  handleTypeCheck()
  // 文件验证初始化（默认无文件）
}

// 页面加载时执行初始化
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
/* 文件上传组件样式调整 */
.upload-demo {
  margin-top: 4px;
}
.el-upload__tip {
  color: #666 !important;
}
/* 单选框组间距 */
.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>