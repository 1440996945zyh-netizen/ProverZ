<template>
	<div class="custom-tip-card" :style="{ 'border-left-color': borderColor }">
		<div class="tip-header">
			<el-icon class="tip-icon" :style="{ color: iconColor }">
				<component :is="iconComponent" />
			</el-icon>
			<span :style="{ color: iconColor }">{{ title }}</span>
		</div>
		<div class="tip-content">
			<slot></slot>
			<!-- 插槽，用于传入自定义提示内容 -->
		</div>
	</div>
</template>

<script setup>
import { InfoFilled, WarningFilled, WarnTriangleFilled, SuccessFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'

// 定义支持的状态类型
const props = defineProps({
	// 状态：默认、警告、报错、成功
	type: {
		type: String,
		default: 'Primary',
		validator: value => {
			return ['Primary', 'Warning', 'Error', 'Success'].includes(value)
		},
	},
	// 自定义标题
	title: {
		type: String,
		default: 'Tip', // 改为空，让computed处理默认标题
	},
})

// 根据类型计算对应的图标
const iconComponent = computed(() => {
	const icons = {
		Primary: InfoFilled, // 修正键名与type匹配
		Warning: WarningFilled,
		Error: WarnTriangleFilled, // 修复：使用正确的错误图标
		Success: SuccessFilled,
	}
	return icons[props.type]
})

// 根据类型计算对应的颜色
const iconColor = computed(() => {
	const colors = {
		Primary: '#409eff', // 蓝色 - 默认/信息
		Warning: '#e6a23c', // 橙色 - 警告
		Error: '#f56c6c', // 红色 - 错误
		Success: '#67c23a', // 绿色 - 成功
	}
	return colors[props.type]
})

// 边框颜色与图标颜色一致
const borderColor = computed(() => {
	return iconColor.value
})

// 计算标题文本，如果未自定义则使用默认值
const title = computed(() => {
	if (props.title) return props.title

	const titles = {
		Primary: 'INFO', // 修正默认标题
		Warning: 'WARNING',
		Error: 'ERROR',
		Success: 'SUCCESS',
	}
	return titles[props.type]
})
</script>

<style scoped>
.custom-tip-card {
	background-color: #ffffff;
	color: #333333;
	padding: 8px;
	border-radius: 4px;
	font-size: 14px;
	line-height: 1.6;
	border-left: 3px solid;
	border-left-color: borderColor;

	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
	transition: box-shadow 0.3s ease;
}

.custom-tip-card:hover {
	box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.tip-header {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	font-size: 15px;
	margin-bottom: 6px;
}

.tip-icon {
	font-size: 16px;
}

.tip-content {
	color: #606266;
	padding-left: 24px; /* 与图标对齐，形成缩进效果 */
}

/* 处理内容中的链接样式 */
.tip-content a {
	color: #409eff;
	text-decoration: none;
}

.tip-content a:hover {
	text-decoration: underline;
}
</style>
    