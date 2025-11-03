<!--
 * @Author: zhangsd
 * @Date: 2025-09-22 20:29:45
 * @LastEditTime: 2025-11-03 17:17:37
 * @LastEditors: zhangsd
 * @Description: 积木报表设计 
 * @FilePath: \view\src\views\system\IframePageView\index.vue
-->
<template>
	<div class="iframe-container" v-if="showIframe">
		<iframe 
			:id="id" 
			:src="iframeUrl" 
			frameborder="0" 
			width="100%" 
			height="800px" 
			scrolling="auto"
		></iframe>
	</div>
</template>

<script setup>
import publicApi from '@/api/public'
import { ref, watch, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken } from '@/utils/auth/token'

// 注入关闭当前页方法
const closeCurrent = inject('closeCurrent')
const basePath = import.meta.env.VITE_JIMU_BASE_URL

// 响应式数据
const iframeUrl = ref('')
const id = ref('')
const showIframe = ref(false) // 控制是否显示iframe
let openingMethod = '' // 存储打开方式参数值

// 获取报表打开方式参数
const getOpeningMethod = async () => {
	try {
		const res = await publicApi.getSystemParams({ key: 'REPORT_OPENING_METHOD' })
		
		if (res.code === '0000') {
			openingMethod = res.data.paramVal
			console.log('获取到报表打开方式参数:', openingMethod)
			
			// 根据参数值执行相应操作
			if (openingMethod === 'Y') {
				// Y：外部打开 - 新窗口打开
				console.log('执行外部打开方式')
				openInNewWindow()
			} else if (openingMethod === 'N') {
				// N：内部打开 - 显示iframe
				console.log('执行内部iframe打开方式')
				showIframe.value = true
				buildIframeUrl()
			} else {
				// 无效值或未设置，使用默认内部打开
				console.warn('报表打开方式参数无效或未设置，使用默认内部打开方式')
				showIframe.value = true
				buildIframeUrl()
			}
		} else {
			console.error('获取报表打开方式参数失败:', res)
			// 获取失败时默认内部打开
			showIframe.value = true
			buildIframeUrl()
		}
	} catch (error) {
		console.error('获取报表打开方式参数出错:', error)
		ElMessage.error('获取报表配置失败，使用默认打开方式')
		// 错误时默认内部打开
		showIframe.value = true
		buildIframeUrl()
	}
}

// 新窗口打开报表
const openInNewWindow = () => {
	const token = getToken()
	const tenantId = 'dev-api'
	const newUrl = basePath + '/jmreport/list?token=' + encodeURIComponent(token) + '&tenantId=' + tenantId
	
	console.log('外部打开报表URL:', newUrl)
	
	// 新窗口打开
	const newWindow = window.open(newUrl, '_blank', 'noopener,noreferrer')
	
	if (!newWindow) {
		// 如果被浏览器阻止弹窗，提示用户
		// ElMessage.warning('新窗口打开被浏览器阻止，请检查浏览器弹窗设置')
	} else {
		console.log('报表已在新窗口打开')
		
		// // 如果需要，可以询问用户是否关闭当前页面
		// if (closeCurrent) {
		// 	ElMessageBox.confirm(
		// 		'报表已在新窗口打开，是否关闭当前页面？', 
		// 		'提示', 
		// 		{
		// 			confirmButtonText: '关闭',
		// 			cancelButtonText: '保留',
		// 			type: 'info'
		// 		}
		// 	).then(() => {
		// 		closeCurrent()
		// 	}).catch(() => {
		// 		// 用户选择保留当前页面
		// 		console.log('用户选择保留当前页面')
		// 	})
		// }
	}
}

// 构建iframe URL
const buildIframeUrl = () => {
	const path = route.path
	id.value = path
	const token = getToken()
	const tenantId = 'dev-api'
	
	iframeUrl.value = basePath + '/jmreport/list?token=' + encodeURIComponent(token) + '&tenantId=' + tenantId
	
	console.log('构建iframe URL =>', iframeUrl.value)
	console.log('------token------', encodeURIComponent(token))
}

const route = useRoute()

// 初始化：先获取参数再决定打开方式
onMounted(() => {
	console.log('开始获取报表打开方式参数')
	getOpeningMethod()
})

// 监听路由变化
watch(
	() => route.fullPath,
	() => {
		console.log('路由变化，重新获取报表打开方式参数')
		// 路由变化时重新获取参数并执行相应操作
		getOpeningMethod()
	}
)
</script>

<style scoped>
.iframe-container {
	width: 100%;
	height: 100%;
	background-color: #fff;
}

.iframe-container iframe {
	width: 100%;
	height: 800px;
	border: none;
	box-sizing: border-box;
}
</style>