<template>
	<div>
		<el-dialog
			:fullscreen="fullscreen"
			:close-on-click-modal="false"
			v-model="visible"
			:width="width"
			:destroy-on-close="destroyOnClose"
			:before-close="handleClose"
			:append-to-body="appendToBody"
			class="custom-dialog"
			:draggable="draggable"
			:show-close="false" 
		>
			<template #title>
				<div class="dialog-header">
					<div class="dialog-header-title">
						<template v-if="$slots.title">
							<slot name="title"></slot>
						</template>
						<template v-else>
							{{ title }}
						</template>
					</div>
					<div class="dialog-header-actions">
						<!-- 全屏切换按钮 -->
						<svg-icon
							id="fullscreen-icon"
							:icon-class="fullscreen ? 'exit-fullscreen' : 'fullscreen'"
							@click="changeFullScreen"
							class="fullscreen-icon"
						/>
						<!-- 自定义关闭按钮 -->
						<svg-icon
							id="close-icon"
							icon-class="close"  
							@click="handleCustomClose"
							class="close-icon"
						/>
						
					</div>
				</div>
			</template>
			<div v-dialogDrag class="dialog-body">
				<slot />
			</div>
			<template #footer v-if="showFooter">
				<div class="dialog-footer">
					<slot name="footer" />
				</div>
			</template>
		</el-dialog>
	</div>
</template>
<script setup name="Dialog">
import { nextTick, computed, ref } from 'vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
	showFooter: {
		type: Boolean,
		default: true,
	},
	title: {
		type: String,
		default: '标题',
	},
	width: {
		type: Number,
		default: 500,
	},
	isFullscreen: {
		type: Boolean,
		default: false,
	},
	destroyOnClose: {
		type: Boolean,
		default: true,
	},
	appendToBody: {
		type: Boolean,
		default: false,
	},
	//是否允许拖拽
	draggable: {
		type: Boolean,
		default: true,
	},
})
const emit = defineEmits(['update:visible', 'close'])  // 添加close事件

const visible = computed({
	get() {
		return props.visible
	},
	set(val) {
		emit('update:visible', val)
	},
})

const fullscreen = ref(props.isFullscreen)
const changeFullScreen = () => {
	setTimeout(() => {
		fullscreen.value = !fullscreen.value
	}, 100)
}

// 处理默认关闭逻辑
const handleClose = done => {
	emit('close')  // 触发close事件
	done()
	setTimeout(() => {
		fullscreen.value = props.isFullscreen
	}, 500)
}

// 自定义关闭按钮逻辑
const handleCustomClose = () => {
	emit('update:visible', false)  // 更新visible状态
	emit('close')  // 触发close事件
	setTimeout(() => {
		fullscreen.value = props.isFullscreen
	}, 500)
}
</script>
<style lang="scss" scoped>
.custom-dialog {
	--el-dialog-border-radius: 12px;
	--el-dialog-bg-color: #fff;
	--el-dialog-header-color: #1d2129;
	--el-dialog-body-color: #4e5969;
	--el-dialog-footer-bg-color: #f2f3f5;

	/* 动画效果 */
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}


.dialog-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 24px;
	height: auto;
	
	.dialog-header-title {
		font-size: 18px;
		font-weight: 500;
		color: var(--el-dialog-header-color);
		line-height: 1.5;
	}
	
	.dialog-header-actions {
		display: flex;
		align-items: center;
		gap: 16px;  /* 按钮之间的间距 */
	}
}

/* 关闭按钮样式 */
.close-icon {
	color: #909399;
	width: 18px;
	height: 18px;
	cursor: pointer;
	transition: color 0.2s;
	
	&:hover {
		color: #ff4d4f;  /* 关闭按钮 hover 用红色更直观 */
	}
}

/* 全屏按钮样式 */
.fullscreen-icon {
	color: #909399;
	width: 18px;
	height: 18px;
	cursor: pointer;
	transition: color 0.2s;
	
	&:hover {
		color: #409eff;
	}
}

.dialog-body {
	height: 100%;
	max-height: calc(100vh - 180px);
	overflow: auto;
	padding: 20px 24px;
	font-size: 14px;
	color: var(--el-dialog-body-color);
	line-height: 1.5;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 16px 24px;
	background-color: var(--el-dialog-footer-bg-color);
	border-top: 1px solid #eee;
	border-radius: 0 0 var(--el-dialog-border-radius) var(--el-dialog-border-radius);
}

/* 深度样式穿透 */
:deep(.el-dialog) {
	border-radius: var(--el-dialog-border-radius);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

:deep(.el-dialog__header) {
	padding: 0 !important;
	border-bottom: 1px solid #eee;
}

:deep(.el-dialog__footer) {
	padding: 0 !important;
}

/* 隐藏默认关闭按钮（双重保险） */
:deep(.el-dialog__headerbtn) {
	display: none !important;
}

:deep(.el-dialog__body) {
	padding: 0;
}

:deep(.el-dialog__wrapper) {
	background-color: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(2px);
}

/* 全屏状态样式 - 修改部分 */
:deep(.el-dialog--fullscreen) {
	--el-dialog-border-radius: 0;
}

/* 关键修改：全屏时不覆盖顶部和侧边栏 */
:deep(.is-fullscreen) {
	// 距离顶部50px（避开顶部导航），距离左侧55px（避开侧边栏）
	top: 50px !important;
	left: 55px !important;
	
	// 宽度 = 窗口宽度 - 左侧边栏宽度
	width: calc(100vw - 55px) !important;
	
	// 高度 = 窗口高度 - 顶部导航高度
	height: calc(100vh - 50px) !important;
	
	// 清除margin，确保计算准确
	margin: 0 !important;
	.dialog-body {
		height: 100%;
	}

}

:deep(.el-dialog--fullscreen .el-dialog__header) {
	position: sticky;
	top: 0;
	background-color: var(--el-dialog-bg-color);
	z-index: 1;
}

:deep(.el-dialog) {
	--el-dialog-padding-primary: 0px;
	--el-dialog-padding-secondary: 0px;
}
:deep .el-dialog .el-dialog__header {
	padding: 0px !important;
}
:deep .el-dialog .el-dialog__footer {
	padding: 0px !important;
}
</style>
