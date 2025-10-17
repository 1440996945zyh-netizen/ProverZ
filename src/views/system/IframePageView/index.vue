<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:24:30
 * @LastEditTime: 2025-10-11 10:26:22
 * @LastEditors: zhangsd
 * @Description: 积木报表设计 
 * @FilePath: \view\src\views\system\IframePageView\index.vue
-->
<template>
	<iframe :id="id" :src="url" frameborder="0" width="100%" height="800px" scrolling="auto"></iframe>
</template>

<script setup>
import { ref, watch, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

// 假设你封装了获取 token 的方法，比如在 utils/auth.js
import { getToken } from '@/utils/auth/token' // 请根据你的项目结构调整路径

// 注入关闭当前页方法（来自父组件 provide）
const closeCurrent = inject('closeCurrent')
const basePath = import.meta.env.VITE_JIMU_BASE_URL
// 响应式数据
const url = ref('')
const id = ref('')

const route = useRoute()

// 处理 URL 逻辑
function goUrl() {
	const metaUrl = route.meta.url
	const path = route.path
	id.value = path
	const token = getToken()
	const tenantId = 'dev-api'
	// url.value = metaUrl
			url.value = basePath + '/jmreport/list?token=' + encodeURIComponent(token) + '&tenantId=' + tenantId
	//    url.value = basePath + '/jmreport/list?token=' + encodeURIComponent(token)
	console.log('------token------', encodeURIComponent(token))

	console.log('url =>', url.value)
}

// 初始化
onMounted(() => {
	goUrl()
})

// 监听路由变化
watch(
	() => route.fullPath,
	() => {
		goUrl()
	}
)
</script>

<style scoped>
/* 如需局部样式，可加 scoped；若全局样式已定义，可留空 */
</style>