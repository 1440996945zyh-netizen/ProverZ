<template>
	<div class="statistics-container">
		<div :key="item.name" class="statistics-card" v-for="(item, index) in totalItem" :style="getDynamicStyles(item, index)">
			<div class="card-content">
				<div class="card-title">{{ item.name }}</div>
				<div class="card-value">{{ item.total }}</div>
			</div>
		</div>
	</div>
</template>

<script setup name="maintenanceUnit">
import { ref, reactive, computed, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/equipment/maintenanceUnit/index'

const { proxy } = getCurrentInstance()

const props = defineProps({
	totalItem: {
		type: Array,
		default: [],
		// 类型校验
		validator: value => {
			return value.every(item => {
				const hasBasicProps = item.hasOwnProperty('total') && item.hasOwnProperty('name')
				const hasColorProps = (item.startColor && item.endColor) || (!item.startColor && !item.endColor)
				return hasBasicProps && hasColorProps
			})
		},
	},
})

// 辅助函数：将十六进制颜色转换为带透明度的rgba格式
const hexToRgba = (hex, alpha) => {
	// 移除#号并标准化
	const cleanHex = hex.replace(/^#/, '').padEnd(6, '0')
	// 解析RGB值
	const r = parseInt(cleanHex.substring(0, 2), 16)
	const g = parseInt(cleanHex.substring(2, 4), 16)
	const b = parseInt(cleanHex.substring(4, 6), 16)

	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 辅助函数：将十六进制颜色转换为HSLA格式（备用）
const hexToHsl = hex => {
	const cleanHex = hex.replace(/^#/, '').padEnd(6, '0')
	const r = parseInt(cleanHex.substring(0, 2), 16) / 255
	const g = parseInt(cleanHex.substring(2, 4), 16) / 255
	const b = parseInt(cleanHex.substring(4, 6), 16) / 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0,
		s = 0,
		l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	}
}

// 动态生成渐变样式的核心函数（支持手动传入颜色）
const getDynamicStyles = (item, index) => {
	// 判断是否传入了自定义颜色
	const hasCustomColor = item.startColor && item.endColor

	if (hasCustomColor) {
		// 处理自定义颜色的情况
		const startColor = item.startColor
		const endColor = item.endColor

		return {
			// 自定义颜色变量（基础色）
			'--custom-start-color': startColor,
			'--custom-end-color': endColor,
			// 常态背景色（带透明度）
			'--normal-start-rgba': hexToRgba(startColor, 0.25),
			'--normal-end-rgba': hexToRgba(endColor, 0.2),
			'--normal-border-rgba': hexToRgba(startColor, 0.35),
			// Hover背景色（更高透明度，保持颜色一致）
			'--hover-start-rgba': hexToRgba(startColor, 0.4),
			'--hover-end-rgba': hexToRgba(startColor, 0.35),
			'--hover-border-rgba': hexToRgba(startColor, 0.5),
			// 文字颜色
			'--text-color-1': startColor,
			'--text-color-2': endColor,
		}
	} else {
		// 动态生成颜色的情况（原有逻辑）
		const hueStep = 360 / Math.max(8, props.totalItem.length || 8)
		const baseHue = (index * hueStep) % 360
		const primaryHue = baseHue
		const secondaryHue = (baseHue + 30) % 360
		const saturation = 70
		const lightness = 60

		return {
			'--primary-hue': primaryHue,
			'--secondary-hue': secondaryHue,
			'--saturation': `${saturation}%`,
			'--lightness': `${lightness}%`,
			// 透明度变量
			'--normal-bg-alpha-1': 0.25,
			'--normal-bg-alpha-2': 0.2,
			'--normal-border-alpha': 0.35,
			'--hover-bg-alpha-1': 0.4,
			'--hover-bg-alpha-2': 0.35,
			'--hover-border-alpha': 0.5,
			// 动态文字颜色
			'--text-color-1': `hsl(${primaryHue}, ${saturation}%, ${lightness}%)`,
			'--text-color-2': `hsl(${secondaryHue}, ${saturation}%, ${lightness - 5}%)`,
		}
	}
}
</script>

<style lang="scss" scoped>
.app-container {
	padding: 24px;
	display: flex;
	flex-direction: column;
	height: calc(100vh - 48px);
	overflow: hidden;
}

.statistics-container {
	padding: 10px 0 0 10px;
	margin-bottom: 16px;
	display: flex;
	gap: 12px;
	width: 100%;
	flex-shrink: 0;
	flex-wrap: wrap;
}

.table-wrapper {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.statistics-card {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px 28px;
	border-radius: 8px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	min-width: 200px;
	flex: 1;
	max-width: 220px;

	// 常态背景：优先使用自定义的RGBA颜色，否则使用动态生成的颜色
	background: linear-gradient(
		135deg,
		var(--normal-start-rgba, hsla(var(--primary-hue), var(--saturation), var(--lightness), var(--normal-bg-alpha-1))),
		var(--normal-end-rgba, hsla(var(--secondary-hue), var(--saturation), var(--lightness), var(--normal-bg-alpha-2)))
	) !important;

	// 常态边框：优先使用自定义颜色的RGBA，否则使用动态颜色
	border: 1px solid var(--normal-border-rgba, hsla(var(--primary-hue), var(--saturation), var(--lightness), var(--normal-border-alpha))) !important;

	// 轻微的白色遮罩（不影响背景色）
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
		pointer-events: none;
		z-index: 0;
		border-radius: 8px;
	}

	// Hover效果 - 关键修复：自定义颜色时使用原startColor的高透明度版本
	&:hover {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

		// Hover背景：自定义颜色用startColor的高透明度版本，动态颜色用原有逻辑
		background: linear-gradient(
			135deg,
			var(--hover-start-rgba, hsla(var(--primary-hue), var(--saturation), var(--lightness), var(--hover-bg-alpha-1))),
			var(--hover-end-rgba, hsla(var(--primary-hue), var(--saturation), var(--lightness), var(--hover-bg-alpha-2)))
		) !important;

		// Hover边框：对应调整
		border-color: var(
			--hover-border-rgba,
			hsla(var(--primary-hue), var(--saturation), var(--lightness), var(--hover-border-alpha))
		) !important;
	}
}

.card-content {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 1;
	min-width: 0;
	gap: 24px;
	width: 100%;
}

.card-title {
	font-size: 16px;
	color: #404246;
	margin: 0;
	font-weight: 600;
	letter-spacing: 0.1px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-value {
	font-size: 32px;
	font-weight: 700;
	line-height: 1;
	letter-spacing: -0.5px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	// 文字渐变（优先使用自定义颜色）
	background: linear-gradient(135deg, var(--text-color-1), var(--text-color-2));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	transition: all 0.25s ease;
}

.statistics-card:hover .card-value {
	filter: brightness(1.05);
}
</style>
