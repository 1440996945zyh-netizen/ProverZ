<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600">日期时间处理工具方法演示（优化版）</h1>

    <!-- 1. 基本日期格式化 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">1. 基本日期格式化 (formatDate)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="日期输入" label-width="100px">
          <el-date-picker
            v-model="dateInput"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="格式化格式" label-width="100px">
          <el-select v-model="format" placeholder="选择格式" style="width: 100%">
            <el-option label="L LTS (默认)" value="L LTS"></el-option>
            <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss"></el-option>
            <el-option label="YYYY年MM月DD日 HH时mm分ss秒" value="YYYY年MM月DD日 HH时mm分ss秒"></el-option>
            <el-option label="dddd, MMMM Do YYYY, h:mm:ss a" value="dddd, MMMM Do YYYY, h:mm:ss a"></el-option>
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
            <el-option label="HH:mm:ss" value="HH:mm:ss"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="formatDateDemo" type="primary">格式化日期</el-button>
        </el-form-item>
        <el-form-item label="格式化结果" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            v-model="formattedDateResult"
            readonly
          ></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 2. 相对时间计算 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">2. 相对时间计算 (formatRelativeTime)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="日期输入" label-width="100px">
          <el-date-picker
            v-model="relativeDateInput"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="calculateRelativeTime" type="primary">计算相对时间</el-button>
        </el-form-item>
        <el-form-item label="相对时间结果" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            v-model="relativeTimeResult"
            readonly
          ></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 3. 日期加减 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">3. 日期加减 (addDate)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="基准日期" label-width="100px">
            <el-date-picker
              v-model="baseDate"
              type="datetime"
              placeholder="选择基准日期"
              value-format="YYYY-MM-DD HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="加减数量" label-width="100px">
            <el-input v-model="amount" type="number" placeholder="输入数字" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="时间单位" label-width="100px">
            <el-select v-model="unit" placeholder="选择单位" style="width: 100%">
              <el-option label="年" value="year"></el-option>
              <el-option label="月" value="month"></el-option>
              <el-option label="日" value="day"></el-option>
              <el-option label="小时" value="hour"></el-option>
              <el-option label="分钟" value="minute"></el-option>
              <el-option label="秒" value="second"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化格式" label-width="100px">
            <el-select v-model="addDateFormat" placeholder="选择格式" style="width: 100%">
              <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss"></el-option>
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
              <el-option label="HH:mm:ss" value="HH:mm:ss"></el-option>
              <el-option label="L LTS" value="L LTS"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label-width="100px">
            <el-button @click="calculateDateAddition" type="primary">计算</el-button>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="dateAdditionResult"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 日期差计算 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">4. 日期差计算 (dateDiff)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="开始日期" label-width="100px">
            <el-date-picker
              v-model="startDate"
              type="datetime"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="结束日期" label-width="100px">
            <el-date-picker
              v-model="endDate"
              type="datetime"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="时间单位" label-width="100px">
            <el-select v-model="diffUnit" placeholder="选择单位" style="width: 100%">
              <el-option label="年" value="year"></el-option>
              <el-option label="月" value="month"></el-option>
              <el-option label="日" value="day"></el-option>
              <el-option label="小时" value="hour"></el-option>
              <el-option label="分钟" value="minute"></el-option>
              <el-option label="秒" value="second"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label-width="100px">
            <el-button @click="calculateDateDiff" type="primary">计算日期差</el-button>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="日期差结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="dateDiffResult"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 周期获取 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">5. 周期获取 (getWeekStart/getWeekEnd)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="基准日期" label-width="100px">
          <el-date-picker
            v-model="weekDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="getWeekInfo" type="primary">获取周信息</el-button>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="周开始日期(周一)" label-width="100px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                v-model="weekStartResult"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="周结束日期(周日)" label-width="100px">
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 3 }"
                v-model="weekEndResult"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 6. 当前时间前后N天 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">6. 当前时间前后N天 (getDaysBeforeAfter)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="方向" label-width="100px">
            <el-select v-model="direction" placeholder="选择方向" style="width: 100%">
              <el-option label="前" value="before"></el-option>
              <el-option label="后" value="after"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="天数" label-width="100px">
            <el-input v-model="days" type="number" placeholder="输入天数" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="日期格式" label-width="100px">
            <el-select v-model="beforeAfterFormat" placeholder="选择格式" style="width: 100%">
              <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss"></el-option>
              <el-option label="YYYY-MM-DD hh:mm" value="YYYY-MM-DD hh:mm"></el-option>
              <el-option label="YYYY-MM-DD hh" value="YYYY-MM-DD hh"></el-option>
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
              <el-option label="YYYY-MM" value="YYYY-MM"></el-option>
              <el-option label="YYYY" value="YYYY"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label-width="100px">
            <el-button @click="getBeforeAfterDate" type="primary">获取日期</el-button>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="beforeAfterResult"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 当前日期获取 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">7. 当前日期获取 (getCurrentDate)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="日期格式" label-width="100px">
          <el-select v-model="currentDateFormat" placeholder="选择格式" style="width: 100%">
            <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss"></el-option>
            <el-option label="YYYY-MM-DD hh:mm" value="YYYY-MM-DD hh:mm"></el-option>
            <el-option label="YYYY-MM-DD hh" value="YYYY-MM-DD hh"></el-option>
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
            <el-option label="YYYY-MM" value="YYYY-MM"></el-option>
            <el-option label="YYYY" value="YYYY"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="handleGetCurrentDate" type="primary">获取当前日期</el-button>
        </el-form-item>
        <el-form-item label="当前日期结果" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            v-model="currentDateResult"
            readonly
          ></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 8. 时间戳获取 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">8. 时间戳获取 (getTime)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="类型" label-width="100px">
          <el-select v-model="timeType" placeholder="选择类型" style="width: 100%">
            <el-option label="当前时间戳" value="current"></el-option>
            <el-option label="90天前时间戳" value="start"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="getTimeStamp" type="primary">获取时间戳</el-button>
        </el-form-item>
        <el-form-item label="时间戳结果" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            v-model="timeStampResult"
            readonly
          ></el-input>
        </el-form-item>
      </div>
    </el-card>

    <!-- 9. 时间段计算 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">9. 时间段计算 (getDuration)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="开始时间" label-width="100px">
            <el-date-picker
              v-model="startTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="结束时间" label-width="100px">
            <el-date-picker
              v-model="endTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="计算类型" label-width="100px">
            <el-select v-model="durationType" placeholder="选择类型" style="width: 100%">
              <el-option label="小时" value="hour"></el-option>
              <el-option label="天" value="date"></el-option>
              <el-option label="分钟" value="min"></el-option>
              <el-option label="小时(含小数)" value="hourMin"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label-width="100px">
            <el-button @click="calculateDuration" type="primary">计算时长</el-button>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="计算结果" label-width="100px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="durationResult"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 10. 添加日期范围参数 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-purple-600">10. 添加日期范围参数 (addDateRange)</h2>
      </template>
      <div class="space-y-4 mt-4">
        <el-form-item label="原始参数" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6 }"
            v-model="originalParams"
            readonly
            placeholder="例如: {page: 1, size: 10, keyword: '测试'}"
          ></el-input>
        </el-form-item>
        <el-form-item label="日期范围" label-width="100px">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="属性名前缀" label-width="100px">
          <el-input v-model="propName" placeholder="例如: 'create'" clearable></el-input>
        </el-form-item>
        <el-form-item label-width="100px">
          <el-button @click="addDateRangeDemo" type="primary">添加日期范围参数</el-button>
        </el-form-item>
        <el-form-item label="添加后参数" label-width="100px">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6 }"
            v-model="paramsWithDateRange"
            readonly
          ></el-input>
        </el-form-item>
      </div>
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
  ElTag,
  ElDatePicker,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import {
  formatDate,
  formatRelativeTime,
  addDate,
  dateDiff,
  getWeekStart,
  getWeekEnd,
  getDaysBeforeAfter,
  getCurrentDate,
  getTime,
  getDuration,
  addDateRange
} from '@/utils/common/day.js'

// 获取组件实例
const instance = getCurrentInstance()

// 1. 基本日期格式化
const dateInput = ref(new Date())
const format = ref('L LTS')
const formattedDateResult = ref('')

const formatDateDemo = () => {
  formattedDateResult.value = formatDate(dateInput.value, format.value)
}

// 2. 相对时间计算
const relativeDateInput = ref(new Date())
const relativeTimeResult = ref('')

const calculateRelativeTime = () => {
  relativeTimeResult.value = formatRelativeTime(relativeDateInput.value)
}

// 3. 日期加减
const baseDate = ref(new Date())
const amount = ref(1)
const unit = ref('day')
const addDateFormat = ref('YYYY-MM-DD HH:mm:ss')
const dateAdditionResult = ref('')

const calculateDateAddition = () => {
  dateAdditionResult.value = addDate(baseDate.value, amount.value, unit.value, addDateFormat.value)
}

// 4. 日期差计算
const startDate = ref(new Date())
const endDate = ref(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
const diffUnit = ref('day')
const dateDiffResult = ref('')

const calculateDateDiff = () => {
  dateDiffResult.value = dateDiff(startDate.value, endDate.value, diffUnit.value)
}

// 5. 周期获取
const weekDate = ref(new Date())
const weekStartResult = ref('')
const weekEndResult = ref('')

const getWeekInfo = () => {
  weekStartResult.value = getWeekStart(weekDate.value)
  weekEndResult.value = getWeekEnd(weekDate.value)
}

// 6. 当前时间前后N天
const direction = ref('before')
const days = ref(7)
const beforeAfterFormat = ref('YYYY-MM-DD')
const beforeAfterResult = ref('')

const getBeforeAfterDate = () => {
  beforeAfterResult.value = getDaysBeforeAfter(direction.value, days.value, beforeAfterFormat.value)
}

// 7. 当前日期获取
const currentDateFormat = ref('YYYY-MM-DD HH:mm:ss')
const currentDateResult = ref('')


const handleGetCurrentDate = () => {
  currentDateResult.value = getCurrentDate(currentDateFormat.value)
}
// 8. 时间戳获取
const timeType = ref('current')
const timeStampResult = ref('')

const getTimeStamp = () => {
  timeStampResult.value = getTime(timeType.value)
}

// 9. 时间段计算
const startTime = ref(new Date(new Date().getTime() - 24 * 60 * 60 * 1000))
const endTime = ref(new Date())
const durationType = ref('hour')
const durationResult = ref('')

const calculateDuration = () => {
  durationResult.value = getDuration(durationType.value, [startTime.value, endTime.value])
}

// 10. 添加日期范围参数
const originalParams = ref(JSON.stringify({ page: 1, size: 10, keyword: '测试' }, null, 2))
const dateRange = ref([new Date(), new Date(new Date().getTime() + 24 * 60 * 60 * 1000)])
const propName = ref('')
const paramsWithDateRange = ref('')

const addDateRangeDemo = () => {
  const params = JSON.parse(originalParams.value)
  const result = addDateRange(params, dateRange.value, propName.value)
  paramsWithDateRange.value = JSON.stringify(result, null, 2)
}

// 初始化数据
const init = () => {
  formatDateDemo()
  calculateRelativeTime()
  calculateDateAddition()
  calculateDateDiff()
  getWeekInfo()
  getBeforeAfterDate()
  getCurrentDate()
  getTimeStamp()
  calculateDuration()
  addDateRangeDemo()
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