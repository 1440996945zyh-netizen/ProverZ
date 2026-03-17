<!--
 * @Author: zhangsd
 * @Date: 2026-02-28 11:37:48
 * @LastEditTime: 2026-03-13 16:07:05
 * @Description: 常用审批语 悬浮气泡组件（后端字符串版）
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\CommonApprovalPhrases.vue
-->

<template>
	<div class="common-phrases-container" v-show="visible" ref="containerRef" :style="containerStyle">
		<div class="phrases-header">
			<span class="header-title">常用审批语</span>
			<!-- <el-tag size="small" type="info" effect="plain">{{ filteredPhrases.length }}条</el-tag> -->
				<el-button type="primary" size="small" @click="handleGoToSettings">添加</el-button>

		</div>

		<div class="phrases-content" ref="contentRef">
			<!-- 统一列表：所有常用语平铺显示 -->
			<div class="phrase-list">
				<div
					v-for="(phrase, index) in filteredPhrases"
					:key="phrase.id"
					class="phrase-item"
					:class="{
						'show-more': showMore || index < defaultShowCount,
						'is-selected': selectedPhraseId === phrase.id,
					}"
					@click="handleSelectPhrase(phrase)"
				>
					<!-- 类型标签 -->
					<el-tag :type="getPhraseTagType(phrase.expressionType)" size="small" effect="plain" class="phrase-type-tag">
						{{ getPhraseTypeLabel(phrase.expressionType) }}
					</el-tag>

					<!-- 常用语内容 -->
					<span class="phrase-content">{{ phrase.content }}</span>

					<!-- 选中图标 -->
					<el-icon v-if="selectedPhraseId === phrase.id" class="selected-icon">
						<Select />
					</el-icon>
				</div>

				<!-- 展开更多按钮 -->
				<div v-if="filteredPhrases.length > defaultShowCount" class="show-more-btn" @click="toggleShowMore">
					{{ showMore ? '收起' : `展开更多（${filteredPhrases.length - defaultShowCount}）` }}
				</div>
			</div>

			<!-- 空状态 -->
			<el-empty v-if="filteredPhrases.length === 0" description="暂无常用审批语" :image-size="80">
			</el-empty>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch,getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Select } from '@element-plus/icons-vue'
import { ProcessLanguageApi } from '@/api/system/bpm/processLanguage'
import { ElMessage, ElTag } from 'element-plus'

//  类型标签配置：key 直接使用后端返回的字符串
const TYPE_CONFIG = {
	APPROVE: { label: '通过', type: 'success' },
	REJECT: { label: '驳回', type: 'danger' },
	COMMON: { label: '通用', type: 'info' },
	TRANSFER: { label: '转办', type: 'primary' },
	DELEGATE: { label: '委派', type: 'primary' },
	ADD_SIGN: { label: '加签', type: 'primary' },
	RETURN: { label: '退回', type: 'primary' },
	COPY: { label: '抄送', type: 'primary' },
	CANCEL: { label: '取消', type: 'danger' },
}

//  支持的类型枚举（用于 validator）

// Props
const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
	position: {
		type: Object,
		default: () => ({ top: 0, left: 0 }),
		validator: value => {
			return typeof value?.top === 'number' && typeof value?.left === 'number'
		},
	},
	//  字符串枚举类型：控制显示哪些常用语（与后端一致）
	expressionType: {
		type: String,
		default: 'COMMON',
		validator: value => {
			return (
				value === null ||
				['APPROVE', 'COMMON', 'REJECT', 'TRANSFER', 'DELEGATE', 'ADD_SIGN', 'RETURN', 'COPY', 'CANCEL'].includes(value)
			)
		},
	},
})
const { proxy } = getCurrentInstance()

// Emits
const emit = defineEmits(['select', 'close', 'update:visible'])

// Router
const router = useRouter()
//  记录上次显示时间，用于判断是否需要延迟关闭
let lastVisibleTime = ref(0)
// Refs
const containerRef = ref(null)
const contentRef = ref(null)

// State
const phrases = ref([])
const loading = ref(false)
const showMore = ref(false)
const defaultShowCount = 9
const selectedPhraseId = ref(null)
const hasLoaded = ref(false)

//  过滤逻辑：直接比较字符串
// 规则：始终显示 COMMON + 传入 expressionType 对应的类型
const filteredPhrases = computed(() => {
	const targetType = props.expressionType

	return phrases.value.filter(phrase => {
		const phraseType = phrase.expressionType // 后端返回的字符串，如 'APPROVE'

		// 始终显示通用类
		if (phraseType === 'COMMON') return true

		// 如果传了特定类型，显示对应类型
		if (targetType && phraseType === targetType) return true

		// 其他情况不显示
		return false
	})
})

//  计算样式：动态定位（修复写死问题）
const containerStyle = computed(() => ({
	top: `${props.position.top}px`,
	left: `${props.position.left}px`,
}))

// Methods

/**
 *  获取类型标签样式
 * @param {string} type - 'APPROVE' | 'REJECT' | 'COMMON' | ...
 */
const getPhraseTagType = type => {
	return TYPE_CONFIG[type]?.type || 'info'
}

/**
 *  获取类型标签文字
 * @param {string} type - 'APPROVE' | 'REJECT' | 'COMMON' | ...
 */
const getPhraseTypeLabel = type => {
	return TYPE_CONFIG[type]?.label || '通用'
}

/**
 *  加载常用语（避免重复请求）
 */
const loadPhrases = async () => {
	if (loading.value || hasLoaded.value) return

	loading.value = true
	try {
		const res = await ProcessLanguageApi.getProcessLanguageExpression({
			expressionType: props.expressionType,
		})
		phrases.value = res.data || res.list || []

		hasLoaded.value = true
	} catch (error) {
		console.error('加载常用审批语失败:', error)
		ElMessage.warning('加载常用语失败')
	} finally {
		loading.value = false
	}
}

/**
 *  处理常用语选择
 */
const handleSelectPhrase = async phrase => {
	const phraseId = phrase?.id
	const content = phrase?.content || (typeof phrase === 'string' ? phrase : '')

	if (!phraseId || !content) {
		console.warn('  无效的短语数据:', phrase)
		return
	}

	// 1. 设置选中状态（视觉反馈）
	selectedPhraseId.value = phraseId

	// 2. emit 数据给父组件
	emit('select', content)

	// 3. 延迟关闭面板
	await Promise.resolve()

	// 4. 关闭面板
	emit('update:visible', false)

	// 5. 延迟清空选中状态
	setTimeout(() => {
		selectedPhraseId.value = null
		showMore.value = false
	}, 150)
}

const toggleShowMore = () => {
	showMore.value = !showMore.value
	nextTick(() => {
		const btn = document.querySelector('.show-more-btn')
		if (btn && contentRef.value) {
			btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		}
	})
}

const handleGoToSettings = () => {
	const routeName = 'BpmProcessLanguage'

// 跳转到该路径
	router.push({
		path: '/bpmModel/processLanguage',
	})

	emit('update:visible', false)
}
const lastFocusTime = ref(0)
// 点击外部关闭
const handleClickOutside = e => {
	// 1. 点击在容器内
	if (containerRef.value?.contains(e.target)) {
		return
	}

	//   2. 检查是否在面板刚显示 150ms 内（防止 focus 时的冲突）
	if (Date.now() - lastVisibleTime.value < 150) {
		console.log(' 面板刚显示，跳过关闭')
		return
	}

	// 3. 关闭面板
	emit('update:visible', false)
	showMore.value = false
}

// 键盘事件处理（Esc 关闭）
const handleKeydown = e => {
	if (!props.visible) return

	if (e.key === 'Escape') {
		e.preventDefault()
		emit('update:visible', false)
		showMore.value = false
	}
}

//  监听 visible 变化：面板显示时加载数据（只加载一次）
watch(
	() => props.visible,
	newVal => {
		if (newVal && !hasLoaded.value) {
			lastVisibleTime.value = Date.now() //  记录显示时间

			//   显示时加载数据（只加载一次）
			if (!hasLoaded.value) {
				loadPhrases()
			}
		}
		if (!newVal) {
			setTimeout(() => {
				selectedPhraseId.value = null
			}, 100)
		}
	}
)

// Lifecycle
onMounted(() => {
	// 不在 mounted 时自动加载，改为 visible 变化时加载
	nextTick(() => {
		document.addEventListener('click', handleClickOutside)
		document.addEventListener('keydown', handleKeydown)
	})
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	document.removeEventListener('keydown', handleKeydown)
	selectedPhraseId.value = null
	showMore.value = false
})

// Expose
defineExpose({
	loadPhrases,
})
</script>

<style lang="scss" scoped>
.common-phrases-container {
	position: fixed;
	width: 380px;
	max-height: 400px;
	background: #ffffff;
	border: 1px solid #e4e7ed;
	border-radius: 10px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	z-index: 9999;
	overflow: hidden;
	animation: slideInRight 0.2s ease-out;
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(10px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.phrases-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ebef 100%);
	border-bottom: 1px solid #e4e7ed;

	.header-title {
		font-size: 14px;
		font-weight: 600;
		color: #303133;
	}
}

.phrases-content {
	max-height: 340px;
	overflow-y: auto;
	padding: 8px 0;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: #f5f7fa;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb {
		background: #c0c4cc;
		border-radius: 3px;

		&:hover {
			background: #909399;
		}
	}
}

.phrase-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 0 8px;
}

.phrase-item {
	padding: 10px 12px;
	background: #f5f7fa;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	border: 1px solid transparent;
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background: #ecf5ff;
		border-color: #409eff;
		transform: translateX(4px);

		.phrase-content {
			color: #409eff;
		}
	}

	&:not(.show-more) {
		display: none;
	}

	&.is-selected {
		background: #ecf5ff !important;
		border-color: #409eff !important;
		transform: translateX(4px);

		.phrase-content {
			color: #409eff !important;
			font-weight: 500;
		}

		.selected-icon {
			opacity: 1;
			transform: scale(1);
		}
	}

	.phrase-type-tag {
		flex-shrink: 0;
		font-size: 12px;
		padding: 0 8px;
		height: 20px;
		line-height: 18px;
	}

	.phrase-content {
		font-size: 13px;
		color: #606266;
		line-height: 1.5;
		word-break: break-all;
		transition: color 0.2s;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.selected-icon {
		color: #409eff;
		font-size: 16px;
		flex-shrink: 0;
		opacity: 0;
		transform: scale(0.8);
		transition: all 0.15s ease;
	}
}

.show-more-btn {
	padding: 8px 12px;
	text-align: center;
	font-size: 12px;
	color: #409eff;
	cursor: pointer;
	background: #ecf5ff;
	margin: 4px 8px 8px;
	border-radius: 4px;
	transition: all 0.2s;

	&:hover {
		background: #d9ecff;
		color: #66b1ff;
	}
}

:deep(.el-empty__description) {
	font-size: 13px;
	color: #909399;
}
</style>