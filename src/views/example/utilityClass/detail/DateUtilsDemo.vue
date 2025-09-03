<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 14:54:52
 * @LastEditTime: 2025-09-03 14:59:12
 * @LastEditors: zhangsd
 * @Description: 使用日期时间处理工具类 (day.js) 
 * @FilePath: \view\src\views\example\utilityClass\detail\DateUtilsDemo.vue
-->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-8 text-center text-green-600">日期时间处理工具类演示</h1>

    <!-- 基础日期选择器 - 统一用ElCard包裹 -->
    <el-card class="mb-8 shadow-md" border>
      <div class="p-4">
        <el-form-item label="基础日期选择" label-width="120px">
          <el-date-picker
            v-model="selectedDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full md:w-1/2"
          ></el-date-picker>
        </el-form-item>
        <el-tag type="info" size="small" class="mt-2">
          提示：选择一个日期时间后，下方所有演示将基于此日期计算（部分功能需要额外参数）
        </el-tag>
      </div>
    </el-card>

    <!-- 1. 格式化日期演示 - ElCard包裹 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">1. 格式化日期 (formatDayjs)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择的日期" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="selectedDate"
              readonly
              placeholder="未选择日期"
            ></el-input>
          </el-form-item>
          <el-form-item label="格式化字符串" label-width="120px">
            <el-select 
              v-model="formatStr" 
              placeholder="选择格式"
              class="w-full"
            >
              <el-option label="L LTS (默认)" value="L LTS"></el-option>
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
              <el-option label="HH:mm:ss" value="HH:mm:ss"></el-option>
              <el-option label="YYYY年MM月DD日" value="YYYY年MM月DD日"></el-option>
              <el-option label="dddd" value="dddd"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="formattedDate"
              readonly
              placeholder="请选择日期并执行格式化"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleFormatDate" 
            type="primary"
            class="mt-2"
            :disabled="!selectedDate"
          >
            执行格式化
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 2. 相对时间计算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">2. 相对时间计算 (fromNowDayjs)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择的日期" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="selectedDate"
              readonly
              placeholder="未选择日期"
            ></el-input>
          </el-form-item>
          <el-form-item label="当前时间" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="currentTime"
              readonly
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="相对时间结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="relativeTimeResult"
              readonly
              placeholder="请选择日期并计算"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleRelativeTime" 
            type="primary"
            class="mt-2"
            :disabled="!selectedDate"
          >
            计算相对时间
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 日期加减演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">3. 日期加减 (addDayjs)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择的日期" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="selectedDate"
              readonly
              placeholder="未选择日期"
            ></el-input>
          </el-form-item>
          <el-row :gutter="16" class="mt-2">
            <el-col :span="12">
              <el-form-item label="数量" label-width="60px">
                <el-input 
                  v-model.number="addAmount" 
                  type="number"
                  min="1"
                  placeholder="输入数量"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位" label-width="60px">
                <el-select 
                  v-model="addUnit" 
                  placeholder="选择单位"
                >
                  <el-option label="年" value="year"></el-option>
                  <el-option label="月" value="month"></el-option>
                  <el-option label="日" value="day"></el-option>
                  <el-option label="小时" value="hour"></el-option>
                  <el-option label="分钟" value="minute"></el-option>
                  <el-option label="秒" value="second"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="计算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="addResult"
              readonly
              placeholder="请选择日期并设置参数"
            ></el-input>
          </el-form-item>
          <el-space size="small" class="mt-2">
            <el-button 
              @click="handleAddDate('add')" 
              type="primary"
              :disabled="!selectedDate || !addAmount || !addUnit"
            >
              增加日期
            </el-button>
            <el-button 
              @click="handleAddDate('subtract')" 
              type="warning"
              :disabled="!selectedDate || !addAmount || !addUnit"
            >
              减少日期
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <!-- 4. 日期差值计算演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">4. 日期差值计算 (diffDayjs)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="第一个日期" label-width="120px">
            <el-date-picker
              v-model="diffDate1"
              type="datetime"
              placeholder="选择第一个日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="第二个日期" label-width="120px" class="mt-2">
            <el-date-picker
              v-model="diffDate2"
              type="datetime"
              placeholder="选择第二个日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="差值单位" label-width="120px" class="mt-2">
            <el-select 
              v-model="diffUnit" 
              placeholder="选择单位"
            >
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
          <el-form-item label="差值结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="diffResultStr"
              readonly
              placeholder="请选择两个日期并设置单位"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleDiffDate" 
            type="primary"
            class="mt-2"
            :disabled="!diffDate1 || !diffDate2 || !diffUnit"
          >
            计算日期差值
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 5. 周起始和结束日期演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">5. 周起始和结束日期 (getWeekStart / getWeekEnd)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择的日期" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="selectedDate"
              readonly
              placeholder="未选择日期"
            ></el-input>
          </el-form-item>
          <el-tag type="info" size="small" class="mt-2">
            提示：每周从周一开始，到周日结束
          </el-tag>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="所在周第一天（周一）" label-width="160px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="weekStart"
              readonly
              placeholder="请选择日期并计算"
            ></el-input>
          </el-form-item>
          <el-form-item label="所在周最后一天（周日）" label-width="160px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              v-model="weekEnd"
              readonly
              placeholder="请选择日期并计算"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleWeekRange" 
            type="primary"
            class="mt-2"
            :disabled="!selectedDate"
          >
            计算周范围
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 6. 时间戳格式化演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">6. 时间戳格式化 (parseTime)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="时间戳（10/13位）" label-width="140px">
            <el-input 
              v-model="timestamp" 
              placeholder="输入时间戳"
            ></el-input>
          </el-form-item>
          <el-form-item label="格式模板" label-width="140px" class="mt-2">
            <el-select 
              v-model="timeFormat" 
              placeholder="选择格式"
            >
              <el-option label="{y}-{m}-{d} {h}:{i}:{s} (默认)" value="{y}-{m}-{d} {h}:{i}:{s}"></el-option>
              <el-option label="{y}年{m}月{d}日 {h}时{i}分{s}秒" value="{y}年{m}月{d}日 {h}时{i}分{s}秒"></el-option>
              <el-option label="星期{a}" value="星期{a}"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化结果" label-width="140px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="parsedTimeResult"
              readonly
              placeholder="请输入时间戳并执行格式化"
            ></el-input>
          </el-form-item>
          <el-space size="small" class="mt-2">
            <el-button 
              @click="handleParseTime" 
              type="primary"
              class="mt-2"
              :disabled="!timestamp"
            >
              执行格式化
            </el-button>
            <el-button 
              @click="generateTimestamp" 
              type="success"
              class="mt-2"
            >
              生成当前时间戳
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <!-- 7. 相对时间格式化演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">7. 相对时间格式化 (formatTime)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="时间戳（10/13位）" label-width="140px">
            <el-input 
              v-model="relativeTimestamp" 
              placeholder="输入时间戳"
            ></el-input>
          </el-form-item>
          <el-form-item label-width="140px" class="mt-2">
            <el-checkbox v-model="useFormatOption" label="使用自定义格式（否则使用默认格式）"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="useFormatOption" label="自定义格式" label-width="140px">
            <el-input 
              v-model="relativeTimeFormat" 
              placeholder="自定义格式，如：{y}-{m}-{d}"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化结果" label-width="140px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="formattedTimeResult"
              readonly
              placeholder="请输入时间戳并执行格式化"
            ></el-input>
          </el-form-item>
          <el-space size="small" class="mt-2">
            <el-button 
              @click="handleFormatTime" 
              type="primary"
              :disabled="!relativeTimestamp"
            >
              执行格式化
            </el-button>
            <el-button 
              @click="generateRelativeTimestamp" 
              type="success"
            >
              生成示例时间戳
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </el-card>

    <!-- 8. 日期格式化（自定义）演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">8. 日期格式化（自定义） (parseDate)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择日期时间" label-width="140px">
            <el-date-picker
              v-model="customDate"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="格式模板" label-width="140px" class="mt-2">
            <el-select 
              v-model="customDateFormat" 
              placeholder="选择格式"
            >
              <el-option label="{yyyy}-{mm}-{dd} {hh}:{ii}:{ss} (默认)" value="{yyyy}-{mm}-{dd} {hh}:{ii}:{ss}"></el-option>
              <el-option label="{yyyy}年{mm}月{dd}日 星期{a}" value="{yyyy}年{mm}月{dd}日 星期{a}"></el-option>
              <el-option label="{hh}:{ii}:{ss}" value="{hh}:{ii}:{ss}"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="格式化结果" label-width="140px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="parsedDateResult"
              readonly
              placeholder="请选择日期并执行格式化"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleParseDate" 
            type="primary"
            class="mt-2"
            :disabled="!customDate"
          >
            执行格式化
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 9. 时间段计算时长演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">9. 时间段计算时长 (getDuration)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="开始时间" label-width="120px">
            <el-date-picker
              v-model="durationStart"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" label-width="120px" class="mt-2">
            <el-date-picker
              v-model="durationEnd"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="计算单位" label-width="120px" class="mt-2">
            <el-select 
              v-model="durationType" 
              placeholder="选择单位"
            >
              <el-option label="小时 (hour)" value="hour"></el-option>
              <el-option label="天 (date)" value="date"></el-option>
              <el-option label="分钟 (min)" value="min"></el-option>
              <el-option label="小时(带小数) (hourMin)" value="hourMin"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="时长结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 8 }"
              v-model="durationResultStr"
              readonly
              placeholder="请选择开始和结束时间"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleGetDuration" 
            type="primary"
            class="mt-2"
            :disabled="!durationStart || !durationEnd || !durationType"
          >
            计算时长
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 10. 获取当前日期时间演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">10. 获取当前日期时间 (getNowDate)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-form-item label="选择日期格式" label-width="120px">
            <el-select 
              v-model="nowDateFormat" 
              placeholder="选择格式"
              class="w-full"
            >
              <el-option label="YYYY-MM-DD hh:mm:ss" value="YYYY-MM-DD hh:mm:ss"></el-option>
              <el-option label="YYYY-MM-DD hh:mm" value="YYYY-MM-DD hh:mm"></el-option>
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
              <el-option label="YYYY-MM" value="YYYY-MM"></el-option>
              <el-option label="YYYY" value="YYYY"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="当前日期时间" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="nowDateResult"
              readonly
              placeholder="请选择格式并获取"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleGetNowDate" 
            type="primary"
            class="mt-2"
            :disabled="!nowDateFormat"
          >
            获取当前日期时间
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 11. 获取前后N天日期演示 -->
    <el-card class="mb-8 shadow-md" border>
      <template #header>
        <h2 class="text-xl font-semibold text-green-600">11. 获取前后N天日期 (getBeforeAfter)</h2>
      </template>
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :md="12">
          <el-row :gutter="16" class="mt-2">
            <el-col :span="12">
              <el-form-item label="方向" label-width="60px">
                <el-radio-group v-model="beforeAfterType">
                  <el-radio label="before">之前</el-radio>
                  <el-radio label="after">之后</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="天数" label-width="60px">
                <el-input 
                  v-model.number="beforeAfterNum" 
                  type="number"
                  min="1"
                  placeholder="输入天数"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="日期格式" label-width="120px" class="mt-2">
            <el-select 
              v-model="beforeAfterFormat" 
              placeholder="选择格式"
            >
              <el-option label="YYYY-MM-DD hh:mm:ss" value="YYYY-MM-DD hh:mm:ss"></el-option>
              <el-option label="YYYY-MM-DD hh:mm" value="YYYY-MM-DD hh:mm"></el-option>
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="计算结果" label-width="120px">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              v-model="beforeAfterResult"
              readonly
              placeholder="请设置参数并计算"
            ></el-input>
          </el-form-item>
          <el-button 
            @click="handleGetBeforeAfter" 
            type="primary"
            class="mt-2"
            :disabled="!beforeAfterType || !beforeAfterNum || !beforeAfterFormat"
          >
            计算日期
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 导入Element Plus组件（对齐其他演示组件）
import {
  ElCard, ElRow, ElCol, ElFormItem, ElInput, ElButton,
  ElSpace, ElTag, ElSelect, ElOption, ElDatePicker, ElCheckbox, ElRadioGroup, ElRadio
} from 'element-plus'
// 导入日期时间处理工具类
import { 
  formatDayjs, 
  fromNowDayjs, 
  addDayjs, 
  diffDayjs, 
  getWeekStart, 
  getWeekEnd, 
  parseTime, 
  formatTime, 
  parseDate, 
  getDuration, 
  getNowDate, 
  getBeforeAfter 
} from '@/utils/common/day.js'  // 请根据实际路径调整

// 基础日期选择
const selectedDate = ref('')

// -------------------------- 1. 格式化日期相关数据 --------------------------
const formatStr = ref('L LTS')
const formattedDate = ref('')

// 执行日期格式化
const handleFormatDate = () => {
  formattedDate.value = formatDayjs(selectedDate.value, formatStr.value)
}

// -------------------------- 2. 相对时间计算相关数据 --------------------------
const currentTime = ref('')
const relativeTimeResult = ref('')

// 计算相对时间
const handleRelativeTime = () => {
  currentTime.value = new Date().toLocaleString()
  relativeTimeResult.value = fromNowDayjs(selectedDate.value)
}

// -------------------------- 3. 日期加减相关数据 --------------------------
const addAmount = ref(1)
const addUnit = ref('day')
const addResult = ref('')

// 执行日期加减
const handleAddDate = (type) => {
  const amount = type === 'add' ? addAmount.value : -addAmount.value
  addResult.value = addDayjs(selectedDate.value, amount, addUnit.value)
}

// -------------------------- 4. 日期差值计算相关数据 --------------------------
const diffDate1 = ref('')
const diffDate2 = ref('')
const diffUnit = ref('day')
const diffResult = ref(null)
const diffResultStr = ref('') // 用于文本域展示的字符串格式

// 获取单位文本
const getUnitText = (unit) => {
  const unitMap = {
    'year': '年',
    'month': '月',
    'day': '天',
    'hour': '小时',
    'minute': '分钟',
    'second': '秒'
  }
  return unitMap[unit] || unit
}

// 计算日期差值（适配文本域展示）
const handleDiffDate = () => {
  diffResult.value = diffDayjs(diffDate1.value, diffDate2.value, diffUnit.value)
  diffResultStr.value = diffResult.value ? `${diffResult.value} ${getUnitText(diffUnit.value)}` : '请选择两个日期并设置单位'
}

// -------------------------- 5. 周起始和结束日期相关数据 --------------------------
const weekStart = ref('')
const weekEnd = ref('')

// 计算周范围
const handleWeekRange = () => {
  weekStart.value = getWeekStart(selectedDate.value)
  weekEnd.value = getWeekEnd(selectedDate.value)
}

// -------------------------- 6. 时间戳格式化相关数据 --------------------------
const timestamp = ref('')
const timeFormat = ref('{y}-{m}-{d} {h}:{i}:{s}')
const parsedTimeResult = ref('')

// 执行时间戳格式化
const handleParseTime = () => {
  parsedTimeResult.value = parseTime(timestamp.value, timeFormat.value)
}

// 生成当前时间戳
const generateTimestamp = () => {
  timestamp.value = Date.now().toString()
  handleParseTime()
}

// -------------------------- 7. 相对时间格式化相关数据 --------------------------
const relativeTimestamp = ref('')
const useFormatOption = ref(false)
const relativeTimeFormat = ref('{y}-{m}-{d}')
const formattedTimeResult = ref('')

// 执行相对时间格式化
const handleFormatTime = () => {
  formattedTimeResult.value = useFormatOption.value 
    ? formatTime(relativeTimestamp.value, relativeTimeFormat.value)
    : formatTime(relativeTimestamp.value)
}

// 生成示例时间戳（30分钟前）
const generateRelativeTimestamp = () => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  relativeTimestamp.value = thirtyMinutesAgo.toString()
  handleFormatTime()
}

// -------------------------- 8. 日期格式化（自定义）相关数据 --------------------------
const customDate = ref('')
const customDateFormat = ref('{yyyy}-{mm}-{dd} {hh}:{ii}:{ss}')
const parsedDateResult = ref('')

// 执行自定义日期格式化
const handleParseDate = () => {
  parsedDateResult.value = parseDate(customDate.value, customDateFormat.value)
}

// -------------------------- 9. 时间段计算时长相关数据 --------------------------
const durationStart = ref('')
const durationEnd = ref('')
const durationType = ref('hour')
const durationResult = ref(null)
const durationResultStr = ref('') // 用于文本域展示的字符串格式

// 获取时长单位文本
const getDurationUnitText = (type) => {
  const unitMap = {
    'hour': '小时',
    'date': '天',
    'min': '分钟',
    'hourMin': '小时'
  }
  return unitMap[type] || type
}

// 计算时间段时长（适配文本域展示）
const handleGetDuration = () => {
  durationResult.value = getDuration(durationType.value, [durationStart.value, durationEnd.value])
  durationResultStr.value = durationResult.value ? `${durationResult.value} ${getDurationUnitText(durationType.value)}` : '请选择开始和结束时间'
}

// -------------------------- 10. 获取当前日期时间相关数据 --------------------------
const nowDateFormat = ref('YYYY-MM-DD hh:mm:ss')
const nowDateResult = ref('')

// 获取当前日期时间
const handleGetNowDate = () => {
  nowDateResult.value = getNowDate(nowDateFormat.value)
}

// -------------------------- 11. 获取前后N天日期相关数据 --------------------------
const beforeAfterType = ref('before')
const beforeAfterNum = ref(7)
const beforeAfterFormat = ref('YYYY-MM-DD')
const beforeAfterResult = ref('')

// 获取前后N天日期
const handleGetBeforeAfter = () => {
  beforeAfterResult.value = getBeforeAfter(beforeAfterType.value, beforeAfterNum.value, beforeAfterFormat.value)
}

// -------------------------- 初始化数据 --------------------------
const init = () => {
  // 设置当前时间
  currentTime.value = new Date().toLocaleString()
  // 生成当前时间戳示例
  generateTimestamp()
  // 生成相对时间戳示例
  generateRelativeTimestamp()
  // 获取当前日期
  handleGetNowDate()
  // 获取7天前的日期
  handleGetBeforeAfter()
}

// 组件挂载时初始化 + 每秒更新当前时间
onMounted(() => {
  init()
  setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})
</script>

<style scoped>
/* 统一Element组件样式，完全对齐其他演示组件 */
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
/* 统一标签间距 */
.el-form-item {
  margin-bottom: 16px;
}
</style>