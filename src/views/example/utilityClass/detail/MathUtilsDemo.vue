<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 15:23:54
 * @LastEditTime: 2025-09-03 15:25:59
 * @LastEditors: zhangsd
 * @Description: 数学运算工具类 math.js
 * @FilePath: \view\src\views\example\utilityClass\detail\MathUtilsDemo.vue
-->

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold mb-8 text-center text-indigo-600">数学运算工具类演示</h1>

    <!-- 工具类说明卡片 -->
    <el-card class="mb-8 shadow-md" border>
      <div class="p-4">
        <p class="text-gray-700">
          该工具类提供了精确的数学运算功能，解决了JavaScript中浮点数运算精度丢失的问题，特别适用于金额计算等对精度要求较高的场景。
        </p>
        <el-tag type="info" size="small" class="mt-2 mr-2">精确计算</el-tag>
        <el-tag type="info" size="small" class="mt-2 mr-2">浮点数处理</el-tag>
        <el-tag type="info" size="small" class="mt-2">金额运算</el-tag>
      </div>
    </el-card>

    <!-- 1. 加法运算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">1. 加法运算 (numAdd)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="第一个数字" label-width="120px">
            <el-input 
              v-model="addNum1" 
              type="number"
              placeholder="请输入第一个数字"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="第二个数字" label-width="120px">
            <el-input 
              v-model="addNum2" 
              type="number"
              placeholder="请输入第二个数字"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="普通加法问题" label-width="120px">
            <el-tag type="warning" size="small">
              普通加法: 0.1 + 0.2 = {{ 0.1 + 0.2 }} (存在精度问题)
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="运算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="addResult"
              readonly
              placeholder="运算结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleAdd" 
            type="primary"
            class="mt-2"
            :disabled="!addNum1 && !addNum2"
          >
            执行加法运算
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. 减法运算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">2. 减法运算 (numSub)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="被减数" label-width="120px">
            <el-input 
              v-model="subNum1" 
              type="number"
              placeholder="请输入被减数"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="减数" label-width="120px">
            <el-input 
              v-model="subNum2" 
              type="number"
              placeholder="请输入减数"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="普通减法问题" label-width="120px">
            <el-tag type="warning" size="small">
              普通减法: 1.0 - 0.9 = {{ 1.0 - 0.9 }} (存在精度问题)
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="运算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="subResult"
              readonly
              placeholder="运算结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleSubtract" 
            type="primary"
            class="mt-2"
            :disabled="!subNum1 && !subNum2"
          >
            执行减法运算
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 乘法运算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">3. 乘法运算 (numMulti)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="第一个乘数" label-width="120px">
            <el-input 
              v-model="multiNum1" 
              type="number"
              placeholder="请输入第一个乘数"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="第二个乘数" label-width="120px">
            <el-input 
              v-model="multiNum2" 
              type="number"
              placeholder="请输入第二个乘数"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="普通乘法问题" label-width="120px">
            <el-tag type="warning" size="small">
              普通乘法: 0.2 * 0.3 = {{ 0.2 * 0.3 }} (存在精度问题)
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="运算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="multiResult"
              readonly
              placeholder="运算结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleMultiply" 
            type="primary"
            class="mt-2"
            :disabled="!multiNum1 || !multiNum2"
          >
            执行乘法运算
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 除法运算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">4. 除法运算 (numDiv)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="被除数" label-width="120px">
            <el-input 
              v-model="divNum1" 
              type="number"
              placeholder="请输入被除数"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="除数" label-width="120px">
            <el-input 
              v-model="divNum2" 
              type="number"
              placeholder="请输入除数"
              clearable
              :disabled="divDisabled"
            ></el-input>
          </el-form-item>
          <el-form-item label="普通除法问题" label-width="120px">
            <el-tag type="warning" size="small">
              普通除法: 0.3 / 0.1 = {{ 0.3 / 0.1 }} (结果正确但存在其他情况问题)
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="运算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="divResult"
              readonly
              placeholder="运算结果将显示在这里"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleDivide" 
            type="primary"
            class="mt-2"
            :disabled="!divNum1 || !divNum2 || divNum2 == 0"
          >
            执行除法运算
          </el-button>
          <el-tag type="danger" size="small" class="ml-2 mt-2" v-if="divNum2 == 0">
            除数不能为0
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 金额计算综合示例 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-indigo-600">5. 金额计算综合示例</h2>
      </template>
      <div class="p-4">
        <p class="text-gray-700 mb-4">模拟购物车金额计算场景，展示如何组合使用上述运算方法：</p>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="商品单价" label-width="120px">
              <el-input 
                v-model="price" 
                type="number"
                placeholder="请输入商品单价"
                clearable
                step="0.01"
                min="0"
              ></el-input>
            </el-form-item>
            <el-form-item label="购买数量" label-width="120px">
              <el-input 
                v-model="quantity" 
                type="number"
                placeholder="请输入购买数量"
                clearable
                step="1"
                min="1"
              ></el-input>
            </el-form-item>
            <el-form-item label="折扣率(%)" label-width="120px">
              <el-input 
                v-model="discount" 
                type="number"
                placeholder="请输入折扣率"
                clearable
                step="1"
                min="0"
                max="100"
              ></el-input>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="12">
            <el-form-item label="计算过程" label-width="120px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 4 }"
                v-model="amountCalculation"
                readonly
              ></el-input>
            </el-form-item>
            <el-form-item label="最终金额" label-width="120px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                v-model="finalAmount"
                readonly
                placeholder="最终金额将显示在这里"
              ></el-input>
            </el-form-item>
            <el-button 
              @click="calculateAmount" 
              type="primary"
              class="mt-2"
              :disabled="!price || !quantity || !discount"
            >
              计算金额
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
// 导入Element Plus组件
import {
  ElCard, ElRow, ElCol, ElFormItem, ElInput, ElButton,
  ElTag
} from 'element-plus'
// 导入数学运算工具类
import math from '@/utils/common/math.js'  // 请根据实际路径调整

// -------------------------- 1. 加法运算相关数据 --------------------------
const addNum1 = ref(0.1)
const addNum2 = ref(0.2)
const addResult = ref('')

// 执行加法运算
const handleAdd = () => {
  // 转换为数字类型
  const num1 = Number(addNum1.value)
  const num2 = Number(addNum2.value)
  
  // 调用工具类方法
  const result = math.numAdd(num1, num2)
  
  // 显示结果和计算过程
  addResult.value = `${num1} + ${num2} = ${result}\n` +
                   `普通JavaScript计算结果: ${num1 + num2}`
}

// -------------------------- 2. 减法运算相关数据 --------------------------
const subNum1 = ref(1.0)
const subNum2 = ref(0.9)
const subResult = ref('')

// 执行减法运算
const handleSubtract = () => {
  // 转换为数字类型
  const num1 = Number(subNum1.value)
  const num2 = Number(subNum2.value)
  
  // 调用工具类方法
  const result = math.numSub(num1, num2)
  
  // 显示结果和计算过程
  subResult.value = `${num1} - ${num2} = ${result}\n` +
                   `普通JavaScript计算结果: ${num1 - num2}`
}

// -------------------------- 3. 乘法运算相关数据 --------------------------
const multiNum1 = ref(0.2)
const multiNum2 = ref(0.3)
const multiResult = ref('')

// 执行乘法运算
const handleMultiply = () => {
  // 转换为数字类型
  const num1 = Number(multiNum1.value)
  const num2 = Number(multiNum2.value)
  
  // 调用工具类方法
  const result = math.numMulti(num1, num2)
  
  // 显示结果和计算过程
  multiResult.value = `${num1} × ${num2} = ${result}\n` +
                     `普通JavaScript计算结果: ${num1 * num2}`
}

// -------------------------- 4. 除法运算相关数据 --------------------------
const divNum1 = ref(0.3)
const divNum2 = ref(0.1)
const divResult = ref('')
const divDisabled = ref(false)

// 监听除数变化，避免输入0
watch(divNum2, (newVal) => {
  if (newVal === 0) {
    divDisabled.value = true
  } else {
    divDisabled.value = false
  }
})

// 执行除法运算
const handleDivide = () => {
  // 转换为数字类型
  const num1 = Number(divNum1.value)
  const num2 = Number(divNum2.value)
  
  // 验证除数不为0
  if (num2 === 0) {
    divResult.value = '错误：除数不能为0'
    return
  }
  
  // 调用工具类方法
  const result = math.numDiv(num1, num2)
  
  // 显示结果和计算过程
  divResult.value = `${num1} ÷ ${num2} = ${result}\n` +
                   `普通JavaScript计算结果: ${num1 / num2}`
}

// -------------------------- 5. 金额计算综合示例相关数据 --------------------------
const price = ref(99.99)      // 商品单价
const quantity = ref(3)       // 购买数量
const discount = ref(80)      // 折扣率(%)
const amountCalculation = ref('')  // 计算过程
const finalAmount = ref('')        // 最终金额

// 计算金额
const calculateAmount = () => {
  // 转换为数字类型
  const p = Number(price.value)
  const q = Number(quantity.value)
  const d = Number(discount.value) / 100  // 转换为折扣系数
  
  // 分步计算：总价 = 单价 × 数量
  const totalPrice = math.numMulti(p, q)
  
  // 计算折扣后价格：总价 × 折扣率
  const discountedPrice = math.numMulti(totalPrice, d)
  
  // 保留两位小数（金额通常保留两位小数）
  const formattedPrice = discountedPrice.toFixed(2)
  
  // 记录计算过程
  amountCalculation.value = `1. 计算总价: ${p} × ${q} = ${totalPrice}\n` +
                           `2. 计算折扣后价格: ${totalPrice} × ${discount.value}% = ${discountedPrice}\n` +
                           `3. 保留两位小数: ${formattedPrice}`
  
  // 显示最终金额
  finalAmount.value = `¥ ${formattedPrice}`
}

// 初始化计算结果
const init = () => {
  handleAdd()
  handleSubtract()
  handleMultiply()
  handleDivide()
  calculateAmount()
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
