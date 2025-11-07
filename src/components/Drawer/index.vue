<!-- components/CustomDrawer.vue -->
<template>
	<el-drawer
		v-model="visible"
		:title="title"
		:direction="direction"
		:size="size"
		:with-header="withHeader"
		:show-close="showClose"
		:close-on-click-modal="closeOnClickModal"
		:close-on-press-escape="closeOnPressEscape"
		:lock-scroll="lockScroll"
		:modal="modal"
		:modal-penetrable="modalPenetrable"
		:destroy-on-close="destroyOnClose"
		:resizable="resizable"
		:before-close="handleBeforeClose"
		:append-to-body="appendToBody"
		:z-index="zIndex"
		:class="customClass"
		@open="onOpen"
		@opened="onOpened"
		@close="onClose"
		@closed="onClosed"
	>
		<!-- 自定义头部插槽 -->
		<template v-if="$slots.header" #header="headerProps">
			<slot name="header" :close="headerProps.close" :title-id="headerProps.titleId" :title-class="headerProps.titleClass" />
		</template>

		<!-- 主要内容 -->
		<div class="custom-drawer-body">
			<slot></slot>
		</div>

		<!-- 底部操作区 -->
		<template v-if="showFooter" #footer>
			<div class="custom-drawer-footer">
				<slot name="footer">
					<div class="footer-buttons">
						<el-button @click="handleCancel">
							{{ cancelText }}
						</el-button>
						<el-button type="primary" :loading="confirmLoading" @click="handleConfirm">
							{{ confirmText }}
						</el-button>
					</div>
				</slot>
			</div>
		</template>
	</el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElDrawer, ElMessageBox, ElButton } from 'element-plus'

// Props 定义
const props = defineProps({
	modelValue: Boolean,
	title: String,
	direction: {
		type: String,
		default: 'rtl',
	},
	size: {
		type: [String, Number],
		default: '30%',
	},
	withHeader: {
		type: Boolean,
		default: true,
	},
	showClose: {
		type: Boolean,
		default: true,
	},
	closeOnClickModal: {
		type: Boolean,
		default: true,
	},
	closeOnPressEscape: {
		type: Boolean,
		default: true,
	},
	lockScroll: {
		type: Boolean,
		default: true,
	},
	destroyOnClose: {
		type: Boolean,
		default: false,
	},
	resizable: {
		type: Boolean,
		default: false,
	},
	appendToBody: {
		type: Boolean,
		default: false,
	},
	modal: {
		type: Boolean,
		default: true,
	},
	modalPenetrable: {
		type: Boolean,
		default: false,
	},
	zIndex: {
		type: Number,
		default: 2000,
	},
	customClass: String,
	showFooter: {
		type: Boolean,
		default: true,
	},
	cancelText: {
		type: String,
		default: '取消',
	},
	confirmText: {
		type: String,
		default: '确定',
	},
	confirmLoading: {
		type: Boolean,
		default: false,
	},
	showCloseConfirm: {
		type: Boolean,
		default: false,
	},
	closeConfirmMessage: {
		type: String,
		default: '确定要关闭吗？',
	},
	beforeClose: Function,
})
// Emits 定义
const emit = defineEmits(['update:modelValue', 'open', 'opened', 'close', 'closed', 'cancel', 'confirm'])

// 内部状态
const visible = ref(props.modelValue)

// 监听外部值变化
watch(
	() => props.modelValue,
	newVal => {
		visible.value = newVal
	}
)

// 同步内部状态到外部
watch(visible, newVal => {
		emit('update:modelValue', newVal)
})

// 事件处理
const onOpen = () => emit('open')
const onOpened = () => emit('opened')
const onClose = () => emit('close')
const onClosed = () => emit('closed')

// 关闭前处理
const handleBeforeClose = done => {
	if (props.beforeClose) {
		props.beforeClose(done)
		return
	}

	if (props.showCloseConfirm) {
		ElMessageBox.confirm(props.closeConfirmMessage, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		})
			.then(() => done())
			.catch(() => {})
	} else {
		done()
	}
}

// 操作处理
const handleCancel = () => {
	visible.value = false
	emit('cancel')
}

const handleConfirm = () => emit('confirm')
</script>

<style lang="scss" scoped>
.custom-drawer-body {
	height: 100%;
	overflow: auto;
}

.footer-buttons {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}
</style>

