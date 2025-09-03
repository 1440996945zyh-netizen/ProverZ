<template>
	<router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/common/theme'
import tableParamsStore from '@/store/modules/tableParams'

onMounted(() => {
	nextTick(() => {
		// 初始化主题样式
		handleThemeStyle(useSettingsStore().theme)
	})
	const tableParams = tableParamsStore()
	window.addEventListener(
		'resize',
		() => {
			tableParams.setTableHeight(0)
		},
		false
	)
})
</script>
<style lang="scss" scoped>
*::-webkit-scrollbar {
	/*滚动条整体样式*/
	width: 10px !important; /*高宽分别对应横竖滚动条的尺寸*/
	height: 10px !important;
}
*::-webkit-scrollbar-thumb {
	/*滚动条里面小方块*/
	border-radius: 10px !important;
	background-color: #ddd;
	/* background-image: -webkit-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent
  ); */
}
*::-webkit-scrollbar-track {
	/*滚动条里面轨道*/
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #fff;
	border-radius: 10px;
	border-top: 1px solid #e1e4eb;
}
.el-overlay-dialog {
	top: 48px;
	left: 55px;
}
.el-overlay {
	top: 50px;
	left: 55px;
}
.is-fullscreen {
	.el-dialog__body {
		height: calc(100vh - 166px);
	}
}
.el-dialog__body {
	max-height: calc(100vh - 166px);
	overflow: auto;
}
.el-dialog:not(.is-fullscreen) {
	top: 6vh;
	margin-top: 0 !important;
}
.el-dialog.is-fullscreen {
	left: 0 !important;
	top: 0 !important;
}
.is-fullscreen .el-dialog__header {
	cursor: auto !important;
}
// 修改抽屉高度
.el-drawer.rtl {
	height: calc(100% - 50px);
}
.el-message {
	top: 55px !important;
}
.el-notification.right {
	right: 22px;
}
.el-dialog {
	--el-dialog-padding-primary: 0px;
}
</style>
