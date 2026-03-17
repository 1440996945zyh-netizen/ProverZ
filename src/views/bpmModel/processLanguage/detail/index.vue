<!--
 * @Author: zhangsd
 * @Date: 2026-02-24 10:29:58
 * @LastEditTime: 2026-03-16 14:27:30
 * @LastEditors: zhangsd
 * @Description:    审批语详情 新增 
 * @FilePath: \view\src\views\bpmModel\processLanguage\detail\index.vue
-->

<template>
	<div class="container">
		<Dialog
			:title="form.id ? '编辑审批语' : '新增审批语'"
			v-model:visible="languageDialogVisible"
			width="40%"
			:confirm-loading="submitting"
			@confirm="handleSubmit"
			@close="handleClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-position="right" label-width="100px" class="expression-form">
				<!-- 快捷语内容 -->
				<el-form-item label="快捷语内容" prop="content">
					<el-input
						v-model="form.content"
						type="textarea"
						:rows="3"
						placeholder="请输入审批语内容，如：同意，请按流程执行"
						maxlength="200"
						show-word-limit
					/>
				</el-form-item>

				<!-- 类型 -->
				<el-form-item label="类型" prop="expressionType">
					<!-- <el-select v-model="form.expressionType" placeholder="请选择审批语类型" style="width: 100%">
						<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select> -->
					<Select
						:dataConfig="{ params: { type: 'DICT', dictType: 'COMMON_PHRASES_TYPE' } }" 
						v-model:value="form.expressionType"
						v-model:label="form.expressionTypeName"
						placeholder="请选择类型"
					/>
				</el-form-item>

				<!-- 状态 -->
				<el-form-item label="状态" prop="status">
					<el-switch v-model="form.status" :active-value="0" :inactive-value="1" active-text="启用" inactive-text="禁用" />
				</el-form-item>

				<!-- 排序号 -->
				<el-form-item label="排序号" prop="sort">
					<el-input-number
						v-model="form.sort"
						:min="0"
						:max="999"
						controls-position="right"
						style="width: 120px"
						placeholder="默认0"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="handleClose">取 消</el-button>
				<el-button type="primary" @click="handleSubmit">保 存</el-button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
defineOptions({ name: 'ProcessLanguageDetail' })
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Dialog from '@/components/Dialog/index.vue'
import { ProcessLanguageApi } from '@/api/system/bpm/processLanguage'
import Select from '@/components/Select/index.vue'
// ============ 常量定义 ============
/** 类型选项映射 */
const TYPE_OPTIONS = [
	{ label: '通过', value: 1 },
	{ label: '拒绝', value: 2 },
	{ label: '通用', value: 3 },
]

/**
 * 审批语详情弹窗可见性 - 支持 v-model:visible 双向绑定
 */
const languageDialogVisible = ref(false)

/** 表单引用 */
const formRef = ref(null)

/** 提交状态 */
const submitting = ref(false)

/** 表单数据 */
const form = reactive({
	id: undefined, // 编辑时传入
	content: '', // 快捷语内容
	expressionType: undefined, // 类型 快捷语类型（通过-APPROVE  通用-COMMON  拒绝-REJECT  转办-TRANSFER  委派-DELEGATE  加签-ADD_SIGN   退回-RETURN   抄送-COPY）
	expressionTypeName: '', // 类型名称（只读）
	status: 0, // 状态 0-启用 1-禁用
	sort: 0, // 排序号
	userId: undefined, // 用户ID（只读）
	// 审计字段（只读，编辑时回填）
	createTime: '',
	updateTime: '',
	createByName: '',
	updateByName: '',
})

/** 表单校验规则 */
const rules = {
	content: [
		{ required: true, message: '请输入快捷语内容', trigger: 'blur' },
		{ min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' },
	],
	expressionType: [{ required: true, message: '请选择审批语类型', trigger: 'change' }],
	sort: [{ type: 'number', message: '排序号必须为数字', trigger: 'blur' }],
}

/** 类型下拉选项（计算属性，便于扩展） */
const typeOptions = computed(() => TYPE_OPTIONS)

// ============ 方法定义 ============

/**
 * 打开弹窗（父组件调用）
 * @param {Object} params - { id?: number, type?: 'add'|'edit' }
 */
const open = async (params = {}) => {
	console.log('是否进入新增弹窗')
	console.log('params =>', params)
	// 重置表单
	resetForm()

	// 显示弹窗
	languageDialogVisible.value = true

	// 等待 DOM 渲染后聚焦第一个输入框
	await nextTick()
	formRef.value?.clearValidate()

	// 如果是编辑模式，加载详情
	if (params.id) {
		await loadDetail(params.id)
	}
}

/**
 * 加载审批语详情
 * @param {Number} id
 */
const loadDetail = async id => {
	try {
		const res = await ProcessLanguageApi.getProcessLanguage({ id: id })

		const data = res.data || res
		if (data) {
			Object.assign(form, {
				id: data.id,
				content: data.content,
				expressionType: data.expressionType,
                expressionTypeName: data.expressionTypeName,
				status: data.status ?? 0,
				sort: data.sort ?? 0,
				userId: data.userId,
				createTime: data.createTime,
				updateTime: data.updateTime,
				createByName: data.createByName,
				updateByName: data.updateByName,
			})
		}
	} catch (error) {
		console.error('加载审批语详情失败:', error)
		ElMessage.error('加载详情失败，请重试')
		languageDialogVisible.value = false
	}
}

/**
 * 提交表单（新增/编辑）
 */
const handleSubmit = async () => {
	if (!formRef.value) return

	try {
		// 1. 表单校验
		await formRef.value.validate()

		// 2. 提交状态
		submitting.value = true

		// 3. 构建请求参数
		const submitData = {
			id: form.id || undefined, // 新增时不传 id
			content: form.content?.trim(),
			expressionType: form.expressionType,
            expressionTypeName: form.expressionTypeName,
			status: Number(form.status),
			sort: Number(form.sort) || 0,
		}

		// 4. 调用接口
		const isEdit = !!form.id
		let res
		if (isEdit) {
			res = await ProcessLanguageApi.updateProcessLanguage(submitData)
		} else {
			res = await ProcessLanguageApi.insertProcessLanguage(submitData)
		}

		const success = res?.code === '0000'

		if (success) {
			// ElMessage.success(isEdit ? '修改成功' : '创建成功')
			emit('success', { action: isEdit ? 'edit' : 'add', data: submitData })
			languageDialogVisible.value = false
		} else {
			ElMessage.error(res?.msg || res?.message || (isEdit ? '修改失败' : '创建失败'))
		}
	} catch (error) {
		if (error?.message && !error?.field) {
			ElMessage.error(error.message || '操作失败，请检查网络')
		}
		console.error('提交表单异常:', error)
	} finally {
		submitting.value = false
	}
}

/**
 * 关闭弹窗回调
 */
const handleClose = () => {
	languageDialogVisible.value = false
	resetForm()
	emit('close')
}

/**
 * 重置表单
 */
const resetForm = () => {
	// 重置响应式数据
	Object.assign(form, {
		id: undefined,
		content: '',
		expressionType: undefined,
		status: 0,
		sort: 0,
		userId: undefined,
		createTime: '',
		updateTime: '',
		createByName: '',
		updateByName: '',
	})
	// 清除校验状态
	formRef.value?.clearValidate?.()
}

// ============ 事件定义 ============
const emit = defineEmits(['update:visible', 'success', 'close'])

watch(
	() => languageDialogVisible.value,
	newVal => {
		emit('update:visible', newVal)
		if (!newVal) {
			handleClose()
		}
	}
)

/**
 * 暴露方法给父组件
 */
defineExpose({
	open,
	resetForm,
})
</script>

<style lang="scss" scoped>
.expression-form {
	padding: 20px 10px 10px;

	.form-tip {
		margin-left: 8px;
		font-size: 12px;
		color: #909399;
		line-height: 32px;
	}

	:deep(.el-form-item__content) {
		align-items: flex-start;
	}

	:deep(.el-input-number) {
		.el-input__inner {
			text-align: left;
		}
	}
}

/* 响应式优化：小屏幕适配 */
@media (max-width: 768px) {
	.expression-form {
		padding: 10px 5px;

		:deep(.el-form-item) {
			margin-bottom: 16px;

			.el-form-item__label {
				width: 90px !important;
			}
		}
	}
}
</style>