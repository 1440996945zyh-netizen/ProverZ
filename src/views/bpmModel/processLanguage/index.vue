<!--
 * @Author: zhangsd
 * @Date: 2026-02-24 10:29:17
 * @LastEditTime: 2026-02-25 09:42:51
 * @LastEditors: zhangsd
 * @Description: 常用审批语配置
 * @FilePath: \view\src\views\bpmModel\processLanguage\index.vue
-->

<template>
	<div class="app-container">
		<div class="app-header">
			<div class="app-header-left">
				<span class="app-header-left-title">常用审批语配置</span>
				<el-button type="primary" @click="visible = true">新增</el-button>
			</div>
		</div>
		<Dialog title="常用审批语配置" v-model:visible="visible" width="500px">
			<div>
				<TipMessage >请输入常用审批语</TipMessage>
			</div>
			<template #footer>
				<el-button type="primary" @click="visible = false">取消</el-button>
				<el-button type="primary" @click="visible = false">确定</el-button>
			</template>
		</Dialog>
	</div>
</template>
<script setup>

const visible = ref(false)
</script>

<style>
</style>