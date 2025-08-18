<template>
	<el-descriptions :column="3" border>
		<el-descriptions-item label="PC/APP" label-align="right" align="center" :width="columnWidth">
			{{ form.operType }}
		</el-descriptions-item>
		<el-descriptions-item
			label="模块标题"
			label-align="right"
			align="center"
			label-class-name="my-label"
			class-name="my-content"
			:width="columnWidth"
		>
			{{ form.title }}
		</el-descriptions-item>
		<el-descriptions-item label="业务类型" label-align="right" align="center" :width="columnWidth">
			{{ form.businessType }}
		</el-descriptions-item>

		<el-descriptions-item label="请求方式" label-align="right" align="center" :width="columnWidth">
			{{ form.requestMethod }}
		</el-descriptions-item>
		<el-descriptions-item label="请求URL" label-align="right" align="center" :width="columnWidth">
			{{ form.operUrl }}
		</el-descriptions-item>
		<el-descriptions-item label="方法名称" label-align="right" align="center" :width="columnWidth">
			{{ form.method }}
		</el-descriptions-item>

		<el-descriptions-item label="请求参数" label-align="right" align="left" :width="columnWidth" span="3">
			{{ form.operParam }}
		</el-descriptions-item>

		<el-descriptions-item label="操作人员姓名" label-align="right" align="center" :width="columnWidth">
			{{ form.operUserName }}
		</el-descriptions-item>
		<el-descriptions-item label="操作时间" label-align="right" align="center" :width="columnWidth">
			{{ form.operTime }}
		</el-descriptions-item>
		<el-descriptions-item label="操作状态" label-align="right" align="center" :width="columnWidth">
			{{ form.status }}
		</el-descriptions-item>

		<el-descriptions-item label="主机地址" label-align="right" align="center" :width="columnWidth">
			{{ form.operIp }}
		</el-descriptions-item>
		<el-descriptions-item label="操作地点" label-align="right" align="center" :width="columnWidth">
			{{ form.operLocation }}
		</el-descriptions-item>
		<el-descriptions-item label="耗时" label-align="right" align="center" :width="columnWidth">
			{{ form.costTime }}ms
		</el-descriptions-item>

		<el-descriptions-item label="错误消息" label-align="right" align="left" :width="columnWidth">
			{{ form.errorMsg }}
		</el-descriptions-item>
	</el-descriptions>
</template>

<script setup>
import { ref } from 'vue'
import { getById } from '@/api/system/operLog'

const columnWidth = '100px'
const form = ref({})

// 日志查询
const getoperLog = id => {
	// console.log('日志详情', id)
	getById(id).then(response => {
		form.value = response.data
	})
}

defineExpose({
	getoperLog,
})
</script>

<style scoped></style>
