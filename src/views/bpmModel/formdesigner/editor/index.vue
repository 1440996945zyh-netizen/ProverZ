<!--
 * @Author: zhangsd
 * @Date: 2025-12-17 11:44:57
 * @LastEditTime: 2026-02-04 10:04:47
 * @LastEditors: zhangsd
 * @Description: 表单设计器
 * @FilePath: \view\src\views\bpmModel\formdesigner\editor\index.vue
-->
<template>
	<div class="app-container">
		<div style="height: auto">
			<!-- 表单设计器 -->
			<div style="height: calc(100vh - 60px)">
				<fc-designer class="my-designer" ref="designer" :config="designerConfig">
					<template #handle>
						<el-button size="small" type="success" plain @click="handleSave">
							<el-icon class="mr-5px"><Plus /></el-icon>
							保存
						</el-button>
					</template>
				</fc-designer>
			</div>
		</div>

		<!-- 表单保存的弹窗 -->
		<Dialog v-model:visible="dialogVisible" title="保存表单" width="600">
			<el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
				<el-form-item label="表单名" prop="name">
					<el-input v-model="formData.name" placeholder="请输入表单名" />
				</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="formData.status">
						<el-radio v-for="dict in CommonStatusEnumLabel" :key="dict.value" :value="dict.value">
							{{ dict.label }}
						</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
				<el-button @click="dialogVisible = false">取 消</el-button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
defineOptions({ name: 'BpmFormEditor' })
import Dialog from '@/components/Dialog'
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CommonStatusEnum, CommonStatusEnumLabel } from '@/utils/bpm/constantEnumeration.js'
import FcDesigner from '@form-create/designer'
import { encodeConf, encodeFields, setConfAndFields } from '@/utils/bpm/formCreate'
import { useFormCreateDesigner } from '@/components/FormCreate'
import { useMessage } from '@/plugins/useMessage'
import { getDetail, updateForm, insertForm, getModelIdsByForm } from '@/api/system/bpm/form'
import { deployModel } from '@/api/system/bpm/model'
const message = useMessage()
const route = useRoute()
const router = useRouter()

const { query } = route

// 表单设计器配置
const designerConfig = ref({
	switchType: [], // 是否可以切换组件类型,或者可以相互切换的字段
	autoActive: true, // 是否自动选中拖入的组件
	useTemplate: false, // 是否生成vue2语法的模板组件
	formOptions: {
		form: {
			size: 'default',

			labelWidth: '100px', // 设置默认的 label 宽度为 100px
		},
	}, // 定义表单配置默认值
	fieldReadonly: false, // 配置field是否可以编辑
	hiddenDragMenu: false, // 隐藏拖拽操作按钮
	hiddenDragBtn: false, // 隐藏拖拽按钮
	hiddenMenu: ['aide'], // 隐藏部分菜单
	hiddenItem: [], // 隐藏部分组件
	hiddenItemConfig: {}, // 隐藏组件的部分配置项
	disabledItemConfig: {}, // 禁用组件的部分配置项
	showSaveBtn: false, // 是否显示保存按钮
	showConfig: true, // 是否显示右侧的配置界面
	showBaseForm: true, // 是否显示组件的基础配置表单
	showControl: true, // 是否显示组件联动
	showPropsForm: true, // 是否显示组件的属性配置表单
	showEventForm: true, // 是否显示组件的事件配置表单
	showValidateForm: true, // 是否显示组件的验证配置表单
	showFormConfig: true, // 是否显示表单配置
	showInputData: true, // 是否显示录入按钮
	showDevice: true, // 是否显示多端适配选项
	appendConfigData: [], // 定义渲染规则所需的formData
	showAi: false, // 是否显示智能助手
	showLanguage: false, // 是否显示语言选项
	rightWidth: '400px', // 某些版本支持直接设置右侧宽度
})

const designer = ref() // 表单设计器实例
useFormCreateDesigner(designer) // 表单设计器增强

// 弹窗及表单相关
const dialogVisible = ref(false) // 保存弹窗显示状态
const formLoading = ref(false) // 表单提交加载状态
const formData = ref({
	name: '',
	status: CommonStatusEnum.ENABLE,
	remark: '',
})

// 表单校验规则
const formRules = reactive({
	name: [{ required: true, message: '表单名不能为空', trigger: 'blur' }],
	status: [{ required: true, message: '开启状态不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单实例

/** 处理保存按钮点击 */
const handleSave = () => {
	console.log(designer.value, 'designer.value点击了流程表单的保存按钮')
	dialogVisible.value = true
}

/** 提交表单 */
const submitForm = async () => {
	// 校验表单
	if (!formRef.value) return
	const valid = await formRef.value.validate()
	if (!valid) return

	// 提交请求
	formLoading.value = true
	try {
		const data = { ...formData.value }
		data.conf = encodeConf(designer) // 表单配置
		data.fields = encodeFields(designer) // 表单字段
		if (!data.id) {
			await insertForm(data)
			message.success('提交成功')
		} else {
			await updateForm(data)
			message.success('更新成功')
      // 校验该表单有没有绑定流程模型
      const { data: modelIds } = await getModelIdsByForm(data.id)

      if (modelIds.length > 0) {
        message.confirm(
          '检测到该表单已绑定流程模型，修改后的表单需重新发布模型才能生效。是否立即发布？',
          '同步更新提示'
        ).then(async () => {
          try {
            for (const modelId of modelIds) {
              await deployModel(modelId)
            }
            message.success('关联模型已全部重新发布')
          } catch (e) {
            message.error('部分模型发布失败，请手动检查')
          }
        }).catch(() => {
          message.info('操作已取消，请记得稍后手动发布关联模型')
        })
      }

    }

		dialogVisible.value = false
		close()
	} finally {
		formLoading.value = false
	}
}

/** 关闭当前标签页并返回列表 */
const close = () => {
	router.push({ path: '/bpmModel/FormDesigner' })
}

/** 初始化逻辑 */
onMounted(async () => {
	// 场景一：新增表单（无ID）
	const id = query.id
	if (!id) {
		return
	}

	// 场景二：编辑表单（有ID）
	const { data } = await getDetail(id)

	formData.value = data
	setConfAndFields(designer, data.conf, data.fields)

	// 场景三：复制表单
	if (route.query.type === 'copy') {
		const { id: _, ...copied } = data
		formData.value = copied
		formData.value.name += '_copy'
	}
})
</script>

<style lang="scss" scoped>
:deep(.my-designer) {
	._fc-l, /* 左侧菜单 */
	._fc-m, /* 中间画布 */
	._fc-r {
		/* 右侧配置 */
		border-top: none;
	}
}
/* 确保容器高度 */
.my-designer {
  height: 100% !important;
}

:deep(.my-designer) {
  /* ._fc-r 是右侧配置栏的类名 */
  ._fc-r {
    width: 400px !important; // 在这里设置你想要的宽度
    flex: 0 0 400px !important; // 强制固定宽度，不让 flex 压缩
    border-left: 1px solid #e0e0e0;
  }

  /* 如果中间部分被挤压，确保中间部分自动填充 */
  ._fc-m {
    flex: 1;
    overflow: auto;
  }

  /* 调整右侧内部表单的 label 宽度，防止挤压 */
//   .el-form-item__label {
//     width: 90px !important;
//   }
}
</style>
