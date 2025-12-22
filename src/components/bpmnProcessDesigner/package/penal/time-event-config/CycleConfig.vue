<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-19 11:30:30
 * @LastEditors: zhangsd
 * @Description: 循环配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\time-event-config\CycleConfig.vue
-->

<template>
  <el-tabs v-model="tab">
    <el-tab-pane label="CRON表达式" name="cron">
      <div style="margin-bottom: 10px">
        <el-input
          v-model="cronStr"
          readonly
          style="width: 400px; font-weight: bold"
        />
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 8px">
        <el-input v-model="fields.second" placeholder="秒" style="width: 80px" />
        <el-input v-model="fields.minute" placeholder="分" style="width: 80px" />
        <el-input v-model="fields.hour" placeholder="时" style="width: 80px" />
        <el-input v-model="fields.day" placeholder="天" style="width: 80px" />
        <el-input v-model="fields.month" placeholder="月" style="width: 80px" />
        <el-input v-model="fields.week" placeholder="周" style="width: 80px" />
        <el-input v-model="fields.year" placeholder="年" style="width: 80px" />
      </div>
      <el-tabs v-model="activeField" type="card" style="margin-bottom: 8px">
        <el-tab-pane v-for="f in cronFieldList" :label="f.label" :name="f.key" :key="f.key">
          <div style="margin-bottom: 8px">
            <el-radio-group v-model="cronMode[f.key]">
              <el-radio label="every">每{{ f.label }}</el-radio>
              <el-radio label="range">
                从
                <el-input-number
                  v-model="cronRange[f.key][0]"
                  :min="f.min"
                  :max="f.max"
                  size="small"
                  style="width: 100px"
                />
                到
                <el-input-number
                  v-model="cronRange[f.key][1]"
                  :min="f.min"
                  :max="f.max"
                  size="small"
                  style="width: 100px"
                />
                之间每{{ f.label }}
              </el-radio>
              <el-radio label="step">
                从第
                <el-input-number
                  v-model="cronStep[f.key][0]"
                  :min="f.min"
                  :max="f.max"
                  size="small"
                  style="width: 100px"
                />
                开始每
                <el-input-number
                  v-model="cronStep[f.key][1]"
                  :min="1"
                  :max="f.max"
                  size="small"
                  style="width: 100px"
                />
                {{ f.label }}
              </el-radio>
              <el-radio label="appoint">指定</el-radio>
            </el-radio-group>
          </div>
          <div v-if="cronMode[f.key] === 'appoint'">
            <el-checkbox-group v-model="cronAppoint[f.key]">
              <el-checkbox
                v-for="n in f.max + 1"
                :label="pad(n - 1)"
                :key="`cb-${f.key}-${n - 1}`"
              >
                {{ pad(n - 1) }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-tab-pane>
    <el-tab-pane label="标准格式" name="iso">
      <div style="margin-bottom: 10px">
        <el-input
          v-model="isoStr"
          placeholder="如R1/2025-05-21T21:59:54/P3DT30M30S"
          style="width: 400px; font-weight: bold"
        />
      </div>
      <div style="margin-bottom: 10px">
        循环次数：
        <el-input-number v-model="repeat" :min="1" style="width: 100px" />
      </div>
      <div style="margin-bottom: 10px">
        日期时间：
        <el-date-picker
          v-model="isoDate"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 200px"
        />
      </div>
      <div style="margin-bottom: 10px">
        当前时长：
        <el-input
          v-model="isoDuration"
          placeholder="如P3DT30M30S"
          style="width: 200px"
        />
      </div>
      <div>
        <div style="margin-bottom: 5px">
          秒：
          <el-button
            v-for="s in [5, 10, 30, 50]"
            @click="setDuration('S', s)"
            :key="`sec-${s}`"
          >
            {{ s }}
          </el-button>
          自定义
        </div>
        <div style="margin-bottom: 5px">
          分：
          <el-button
            v-for="m in [5, 10, 30, 50]"
            @click="setDuration('M', m)"
            :key="`min-${m}`"
          >
            {{ m }}
          </el-button>
          自定义
        </div>
        <div style="margin-bottom: 5px">
          小时：
          <el-button
            v-for="h in [4, 8, 12, 24]"
            @click="setDuration('H', h)"
            :key="`hour-${h}`"
          >
            {{ h }}
          </el-button>
          自定义
        </div>
        <div style="margin-bottom: 5px">
          天：
          <el-button
            v-for="d in [1, 2, 3, 4]"
            @click="setDuration('D', d)"
            :key="`day-${d}`"
          >
            {{ d }}
          </el-button>
          自定义
        </div>
        <div style="margin-bottom: 5px">
          月：
          <el-button
            v-for="mo in [1, 2, 3, 4]"
            @click="setDuration('M', mo)"
            :key="`mon-${mo}`"
          >
            {{ mo }}
          </el-button>
          自定义
        </div>
        <div>
          年：
          <el-button
            v-for="y in [1, 2, 3, 4]"
            @click="setDuration('Y', y)"
            :key="`year-${y}`"
          >
            {{ y }}
          </el-button>
          自定义
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({ 
  value: String 
})

const emit = defineEmits(['change'])

// 响应式数据
const tab = ref('cron')
const cronStr = ref(props.value || '* * * * * ?')
const fields = ref({
  second: '*',
  minute: '*',
  hour: '*',
  day: '*',
  month: '*',
  week: '?',
  year: ''
})

const cronFieldList = [
  { key: 'second', label: '秒', min: 0, max: 59 },
  { key: 'minute', label: '分', min: 0, max: 59 },
  { key: 'hour', label: '时', min: 0, max: 23 },
  { key: 'day', label: '天', min: 1, max: 31 },
  { key: 'month', label: '月', min: 1, max: 12 },
  { key: 'week', label: '周', min: 1, max: 7 },
  { key: 'year', label: '年', min: 1970, max: 2099 }
]

const activeField = ref('second')
const cronMode = ref({
  second: 'appoint',
  minute: 'every',
  hour: 'every',
  day: 'every',
  month: 'every',
  week: 'every',
  year: 'every'
})

const cronAppoint = ref({
  second: ['00', '01'],
  minute: [],
  hour: [],
  day: [],
  month: [],
  week: [],
  year: []
})

const cronRange = ref({
  second: [0, 1],
  minute: [0, 1],
  hour: [0, 1],
  day: [1, 2],
  month: [1, 2],
  week: [1, 2],
  year: [1970, 1971]
})

const cronStep = ref({
  second: [1, 1],
  minute: [1, 1],
  hour: [1, 1],
  day: [1, 1],
  month: [1, 1],
  week: [1, 1],
  year: [1970, 1]
})

/**
 * @description 补零函数
 * @param {number} n 数字
 * @returns {string} 补零后的字符串
 */
function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

// 监听 cron 相关数据变化
watch(
  [fields, cronMode, cronAppoint, cronRange, cronStep],
  () => {
    // 组装cron表达式
    let arr = cronFieldList.map((f) => {
      if (cronMode.value[f.key] === 'every') return '*'
      if (cronMode.value[f.key] === 'appoint') return cronAppoint.value[f.key].join(',') || '*'
      if (cronMode.value[f.key] === 'range')
        return `${cronRange.value[f.key][0]}-${cronRange.value[f.key][1]}`
      if (cronMode.value[f.key] === 'step')
        return `${cronStep.value[f.key][0]}/${cronStep.value[f.key][1]}`
      return fields.value[f.key] || '*'
    })
    // week和year特殊处理
    arr[5] = arr[5] || '?'
    cronStr.value = arr.join(' ')
    if (tab.value === 'cron') emit('change', cronStr.value)
  },
  { deep: true }
)

// 标准格式
const isoStr = ref('')
const repeat = ref(1)
const isoDate = ref('')
const isoDuration = ref('')

/**
 * @description 设置时长
 * @param {string} type 类型
 * @param {number} val 值
 */
function setDuration(type, val) {
  // 组装ISO 8601字符串
  let d = isoDuration.value
  if (!d.includes(type)) d += val + type
  else d = d.replace(new RegExp(`\\d+${type}`), val + type)
  isoDuration.value = d
  updateIsoStr()
}

/**
 * @description 更新 ISO 字符串
 */
function updateIsoStr() {
  let str = `R${repeat.value}`
  if (isoDate.value)
    str += '/' + (typeof isoDate.value === 'string' ? isoDate.value : new Date(isoDate.value).toISOString())
  if (isoDuration.value) str += '/' + isoDuration.value
  isoStr.value = str
  if (tab.value === 'iso') emit('change', isoStr.value)
}

// 监听 ISO 相关数据变化
watch([repeat, isoDate, isoDuration], updateIsoStr)

// 监听 props.value 变化
watch(
  () => props.value,
  (val) => {
    if (!val) return
    if (tab.value === 'cron') cronStr.value = val
    if (tab.value === 'iso') isoStr.value = val
  },
  { immediate: true }
)
</script>
