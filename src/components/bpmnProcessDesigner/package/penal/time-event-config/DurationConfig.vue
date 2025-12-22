<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:24:33
 * @LastEditors: zhangsd
 * @Description: 持续时间配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\time-event-config\DurationConfig.vue
-->

<template>
  <div>
    <div style="margin-bottom: 10px">
      当前选择：
      <el-input v-model="isoString" readonly style="width: 300px" />
    </div>
    <div v-for="unit in units" :key="unit.key" style="margin-bottom: 8px">
      <span>{{ unit.label }}：</span>
      <el-button-group>
        <el-button
          v-for="val in unit.presets"
          :key="val"
          size="small"
          @click="setUnit(unit.key, val)"
        >
          {{ val }}
        </el-button>
        <el-input
          v-model.number="custom[unit.key]"
          size="small"
          style="width: 60px; margin-left: 8px"
          placeholder="自定义"
          @change="setUnit(unit.key, custom[unit.key])"
        />
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ 
  value: String 
})

const emit = defineEmits(['change'])

const units = [
  { key: 'Y', label: '年', presets: [1, 2, 3, 4] },
  { key: 'M', label: '月', presets: [1, 2, 3, 4] },
  { key: 'D', label: '天', presets: [1, 2, 3, 4] },
  { key: 'H', label: '时', presets: [4, 8, 12, 24] },
  { key: 'm', label: '分', presets: [5, 10, 30, 50] },
  { key: 'S', label: '秒', presets: [5, 10, 30, 50] }
]

const custom = ref({ Y: '', M: '', D: '', H: '', m: '', S: '' })
const isoString = ref('')

/**
 * @description 设置单位值
 * @param {string} key 单位键
 * @param {number} val 值
 */
function setUnit(key, val) {
  if (!val || isNaN(val)) {
    custom.value[key] = ''
    return
  }
  custom.value[key] = val
  updateIsoString()
}

/**
 * @description 更新 ISO 字符串
 */
function updateIsoString() {
  let str = 'P'
  if (custom.value.Y) str += custom.value.Y + 'Y'
  if (custom.value.M) str += custom.value.M + 'M'
  if (custom.value.D) str += custom.value.D + 'D'
  if (custom.value.H || custom.value.m || custom.value.S) str += 'T'
  if (custom.value.H) str += custom.value.H + 'H'
  if (custom.value.m) str += custom.value.m + 'M'
  if (custom.value.S) str += custom.value.S + 'S'
  isoString.value = str === 'P' ? '' : str
  emit('change', isoString.value)
}

// 监听 props.value 变化
watch(
  () => props.value,
  (val) => {
    if (!val) return
    // 解析ISO 8601字符串到custom
    const match = val.match(
      /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
    )
    if (match) {
      custom.value.Y = match[1] || ''
      custom.value.M = match[2] || ''
      custom.value.D = match[3] || ''
      custom.value.H = match[4] || ''
      custom.value.m = match[5] || ''
      custom.value.S = match[6] || ''
      updateIsoString()
    }
  },
  { immediate: true }
)
</script>
