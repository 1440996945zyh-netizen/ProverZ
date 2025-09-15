<!--
 * @Author: zhangsd
 * @Date: 2025-09-03 14:02:23
 * @LastEditTime: 2025-09-15 15:48:13
 * @LastEditors: zhangsd
 * @Description: 工具类代码使用示例（修复子组件滚动问题）
 * @FilePath: \view\src\views\example\utilityClass\index.vue
-->
<template>
	<div class="app-container">
		<!-- Tabs 头部切换栏 -->
		<div class="tabs-header">
			<div class="tab-item" :class="{ 'tab-active': activeTab === 'common' }" @click="activeTab = 'common'">common.js</div>
			<div class="tab-item" :class="{ 'tab-active': activeTab === 'data' }" @click="activeTab = 'data'">data.js</div>
			<div class="tab-item" :class="{ 'tab-active': activeTab === 'day' }" @click="activeTab = 'day'">day.js</div>
			<div class="tab-item" :class="{ 'tab-active': activeTab === 'validation' }" @click="activeTab = 'validation'">validation.js</div>

		</div>
		<!-- 关键修复：给内容区加固定高度和滚动 -->
		<div class="tabs-content">

			<CommonUtilsDemo v-if="activeTab === 'common'" class="tab-panel" />
			<DataUtilsDemo v-if="activeTab === 'data'" class="tab-panel" />
			<DayUtilsDemo v-if="activeTab === 'day'" class="tab-panel" />
			<ValidationUtilsDemo v-if="activeTab === 'validation'" class="tab-panel" />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
// 导入子组件（路径请确保与项目实际一致）

import CommonUtilsDemo from './detail/CommonUtilsDemo.vue'
import DataUtilsDemo from './detail/DataUtilsDemo.vue'
import DayUtilsDemo from './detail/DayUtilsDemo.vue'
import ValidationUtilsDemo from './detail/ValidationUtilsDemo.vue'




// 激活的标签页（默认显示 data）
const activeTab = ref('common')
</script>

<style scoped>
/* 根容器：占满视口高度，避免内容撑开页面 */
.app-container {
	margin: 0 auto;
	width: 75vw;
	/*padding: 20px 24px;  微调内边距，适配滚动 */
	font-family: 'Microsoft YaHei', Arial, sans-serif;
	color: #333;
	/* min-height: 100vh; 确保页面占满视口 */
	box-sizing: border-box; /* 避免padding导致页面溢出 */
}

/* Tabs 头部样式：保持原有逻辑 */
.tabs-header {
	display: flex;
	background-color: #f5f7fa;
	border-bottom: 1px solid #eee;
	border-radius: 8px 8px 0 0; /* 顶部圆角，与内容区衔接 */
	overflow: hidden; /* 避免内容溢出 */
}

.tab-item {
	padding: 14px 24px;
	font-size: 15px;
	color: #666;
	cursor: pointer;
	transition: all 0.3s ease;
}

.tab-active {
	color: #409eff;
	background-color: #fff;
	border-bottom: 2px solid #409eff;
	font-weight: 500;
}

/* 关键修复：内容区设置固定高度 + 垂直滚动 */
.tabs-content {
	/* 高度计算：视口高度 - 头部高度 - 根容器上下padding（20*2）- 额外间距（10px） */
	height: calc(100vh - 56px - 40px - 10px); 
	overflow-y: auto; /* 垂直内容溢出时显示滚动条 */
	overflow-x: hidden; /* 禁止横向滚动（避免内容错位） */
	padding: 24px;
	background-color: #fff;
	border: 1px solid #eee;
	border-top: none; /* 与头部边框重叠，避免双重边框 */
	border-radius: 0 0 8px 8px; /* 底部圆角，优化样式 */
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	box-sizing: border-box; /* 确保padding不影响高度计算 */
}

/* 滚动条美化（可选，提升体验） */
.tabs-content::-webkit-scrollbar {
	width: 6px; /* 滚动条宽度 */
}
.tabs-content::-webkit-scrollbar-track {
	background: #f5f5f5; /* 滚动条轨道背景 */
	border-radius: 3px;
}
.tabs-content::-webkit-scrollbar-thumb {
	background: #ccc; /* 滚动条滑块颜色 */
	border-radius: 3px;
}
.tabs-content::-webkit-scrollbar-thumb:hover {
	background: #999; /* 滑块hover颜色 */
}

/* 面板切换动画：保持原有逻辑 */
.tab-panel {
	animation: fadeIn 0.3s ease;
}

/* 淡入动画：保持原有逻辑 */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 响应式适配：小屏幕（如平板/手机）调整高度 */
@media (max-width: 768px) {
	.app-container {
		padding: 10px 12px; /* 小屏幕减少内边距 */
	}
	/* 重新计算小屏幕高度：减少间距 */
	.tabs-content {
		height: calc(100vh - 56px - 20px - 5px);
		padding: 16px; /* 小屏幕减少内容区padding */
	}
	.tab-item {
		padding: 12px 16px; /* 小屏幕减少标签内边距 */
		font-size: 14px;
	}
}
</style>