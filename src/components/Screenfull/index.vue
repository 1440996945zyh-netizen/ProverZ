<template>
	<div>
		<svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" @click="toggle" />
	</div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'
import tableParamsStore from '@/store/modules/tableParams'

const { isFullscreen, enter, exit, toggle } = useFullscreen()

const tableParams = tableParamsStore()

watch(isFullscreen, (newVal, oldVal) => {
	if (newVal) {
		tableParams.setTableHeight(164)
	}
})
</script>

<style lang="scss" scoped>
.screenfull-svg {
	display: inline-block;
	cursor: pointer;
	fill: #5a5e66;
	width: 20px;
	height: 20px;
	vertical-align: 10px;
}
</style>
