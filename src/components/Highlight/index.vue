<template>
  <pre ref="preRef" class="hljs-container" style="padding: 16px; margin: 0; background: #f5f5f5; max-height: 70vh; overflow-y: auto;">
    <code ref="codeRef" :class="`language-${language}`"></code>
  </pre>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
// 引入 hljs（ES 模块方式，适配 Vue3）
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'

// 注册语言
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)

// 定义 props（和 Vue2 保持一致）
const props = defineProps({
  language: {
    type: String,
    required: true,
    validator: (val) => ['xml', 'json'].includes(val)
  },
  code: {
    type: String,
    required: true,
    default: ''
  }
})

// 响应式引用
const preRef = ref(null)
const codeRef = ref(null)

// 核心：执行高亮
const highlightCode = () => {
  if (!codeRef.value || !props.code) return
  // 清空原有内容（避免叠加）
  codeRef.value.textContent = props.code
  // 原生高亮（和 Vue2 逻辑一致）
  hljs.highlightElement(codeRef.value)
}

// 监听 code/language 变化，重新高亮
watch([() => props.code, () => props.language], () => {
  highlightCode()
}, { immediate: true })

// 挂载时执行高亮
onMounted(() => {
  highlightCode()
})
</script>

<style scoped>
/* 引入高亮样式（必须，和 Vue2 保持一致） */
@import 'highlight.js/styles/default.css';
.hljs-container {
  font-size: 14px;
  line-height: 1.5;
}
</style>