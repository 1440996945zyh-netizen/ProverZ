<template>
	<el-descriptions :column="3" border>
		<el-descriptions-item label="登录人账号" label-align="right" align="center" :width="columnWidth">
			{{ form.accNo }}
		</el-descriptions-item>
		<el-descriptions-item
			label="登录人"
			label-align="right"
			align="center"
			label-class-name="my-label"
			class-name="my-content"
			:width="columnWidth"
		>
			{{ form.userName }}
		</el-descriptions-item>
		<el-descriptions-item label="岗位" label-align="right" align="center" :width="columnWidth">
			{{ form.post }}
		</el-descriptions-item>
		<el-descriptions-item label="部门" label-align="right" align="center" :width="columnWidth">
			{{ form.dept }}
		</el-descriptions-item>
		<el-descriptions-item label="所属公司" label-align="right" align="center" :width="columnWidth">
			{{ form.companyName }}
		</el-descriptions-item>
		<el-descriptions-item label="登录时间" label-align="right" align="center" :width="columnWidth">
			{{ form.登录时间 }}
		</el-descriptions-item>

		<el-descriptions-item label="登录渠道" label-align="right" align="left" :width="columnWidth" span="3">
			{{ form.channelType }}
		</el-descriptions-item>

		<el-descriptions-item label="登录用户唯一标记" label-align="right" align="center" :width="columnWidth">
			{{ form.uqMark }}
		</el-descriptions-item>
		<el-descriptions-item label="操作系统" label-align="right" align="center" :width="columnWidth">
			{{ form.os }}
		</el-descriptions-item>
		<el-descriptions-item label="浏览器" label-align="right" align="center" :width="columnWidth">
			{{ form.browser }}
		</el-descriptions-item>
		<el-descriptions-item label="登录地点" label-align="right" align="center" :width="columnWidth">
			{{ form.location }}
		</el-descriptions-item>
		<el-descriptions-item label="状态" label-align="right" align="center" :width="columnWidth">
			{{ form.status }}
		</el-descriptions-item>
		<el-descriptions-item label="错误信息" label-align="right" align="center" :width="columnWidth">
			{{ form.errorMsg }}ms
		</el-descriptions-item>
	</el-descriptions>
</template>

<script setup>
import { ref } from 'vue'
import { getById } from '@/api/system/LoginLog'

const columnWidth = '100px'
const emit = defineEmits(['drawerShowEmit'])
const form = ref({})

// 登录日志查询
const getLoginLog = id => {
	getById(id).then(response => {
		form.value = response.data
	})
}

defineExpose({
	getLoginLog,
})
</script>

<style scoped></style>
