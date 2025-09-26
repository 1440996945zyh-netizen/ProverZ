<!--
 * @Author: zhangsd
 * @Date: 2025-09-04 14:56:55
 * @LastEditTime: 2025-09-05 11:02:41
 * @LastEditors: zhangsd
 * @Description: 打印设计器（整合优化版：支持编辑优先加载+新增输入模板名）
 * @FilePath: \view\src\views\example\hiprint\detail\PrintDesigner.vue
-->
<template>
	<div class="app-container">
		<div class="print-designer card-container">
			<!-- 头部控制区：保留原分区，补充参考代码功能按钮 -->
			<div class="print-paper-header">
				<!-- 1. 纸张类型选择区 -->
				<div class="control-group paper-type-group">
					<span class="control-label">纸张类型：</span>
					<el-button-group class="paper-btn-group">
						<el-button
							v-for="(value, type) in paperTypes"
							:key="type"
							:class="['paper-btn', { 'paper-btn--active': curPaper.type === type }]"
							@click="setPaper(type, value)"
						>
							{{ type }}
						</el-button>
					</el-button-group>
				</div>

				<!-- 2. 模板选择区 -->
				<div class="control-group template-select-group">
					<span class="control-label">模板选择：</span>
					<Select
						v-model:value="formData.modelName"
						v-model:label="formData.modelName"
						placeholder="请选择打印模板"
						class="template-select"
						:selectData="modelTypeList"
						@change="handleTemplateChange"
					/>
					<!-- 	:disabled="!formData.id"  -->
				</div>

				<!-- 3. 自定义纸张尺寸区-->
				<div class="control-group custom-paper-group">
					<span class="control-label">自定义尺寸：</span>
					<div class="custom-paper-controls">
						<el-input
							type="number"
							v-model.number="paperWidth"
							placeholder="宽(mm)"
							min="10"
							max="2000"
							class="custom-paper-input"
							@input="handlePaperInput"
						/>
						<span class="input-separator">×</span>
						<el-input
							type="number"
							v-model.number="paperHeight"
							placeholder="高(mm)"
							min="10"
							max="2000"
							class="custom-paper-input"
							@input="handlePaperInput"
						/>
						<el-button type="primary" class="custom-paper-btn apply-btn" @click="setCustomPaper">应用</el-button>
					</div>
				</div>
				<!-- 5. 缩放控制区 -->
				<div class="control-group scale-control-group">
					<span class="control-label">缩放：</span>
					<div class="scale-controls">
						<el-button plain icon="ZoomOut" @click="changeScale(false)" :disabled="scaleValue <= scaleMin" class="scale-btn" />
						<el-input
							v-model.number="scaleValue"
							:min="scaleMin"
							:max="scaleMax"
							:step="0.1"
							class="scale-input"
							:formatter="value => `${(value * 100).toFixed(0)}%`"
							:parser="value => Number(value.replace('%', '')) / 100"
							readonly
						/>
						<el-button plain icon="ZoomIn" @click="changeScale(true)" :disabled="scaleValue >= scaleMax" class="scale-btn" />
					</div>
				</div>
				<!-- 4. 核心功能按钮区 -->
				<div class="control-group function-btn-group">
					<!-- 浏览器打印 -->
					<el-button icon="Printer" class="action-btn" @click.stop="print">打印</el-button>
					<!-- 纸张旋转 -->
					<el-button icon="RefreshRight" class="action-btn" @click.stop="rotatePaper">旋转</el-button>
					<!-- 清空设计区 -->
					<el-popconfirm
						title="确定清空当前设计？所有元素将被删除"
						@confirm="clearDesign"
						confirm-button-text="确认"
						cancel-button-text="取消"
					>
						<template #reference>
							<el-button type="danger" class="action-btn">
								<template #icon>
									<el-icon><Close /></el-icon>
								</template>
								清空
							</el-button>
						</template>
					</el-popconfirm>
					<!-- 保存模板：显示新增/编辑状态 -->
					<el-button type="primary" class="action-btn save-btn" @click.stop="saveTemplate">
						{{ formData.id ? '更新模板' : '新增模板' }}
					</el-button>
				</div>
			</div>

			<!-- 三栏设计区 -->
			<div class="print-design-area">
				<!-- 左侧：卡片式拖拽元素区 -->
				<div class="flex-2 flex-wrap design-drag-panel">
					<div class="title">{{ formData.id ? '编辑模板' : '新增模板' }} - 可拖拽元素</div>
					<div id="provider-container" class="container hiprintEpContainer rect-printElement-types"></div>
				</div>
				<!-- 中间：纸张设计区（承载hiprint打印元素） -->
				<div class="flex-5 center">
					<div v-if="isLoading" style="text-align: center; padding: 20px">
						{{ formData.id ? '加载已有模板中...' : '加载默认模板中...' }}
					</div>
					<!-- 设计器的 容器 -->
					<div id="hiprint-printTemplate"></div>
				</div>
				<!-- 右侧：属性配置区 -->
				<div class="flex-2 right">
					<div class="title">元素属性配置</div>
					<!-- 元素参数的 容器 -->
					<div id="PrintElementOptionSetting"></div>
				</div>
			</div>
		</div>
	</div>
	<!-- 在模板部分添加 Dialog -->
	<el-dialog
		v-model="templateDialogVisible"
		title="新增模板"
		width="500px"
		:close-on-click-modal="false"
		@close="handleTemplateDialogClose"
	>
		<el-form ref="templateFormRef" :model="templateForm" :rules="templateFormRules" label-width="100px">
			<el-form-item label="模板名称" prop="modelName">
				<el-input v-model="templateForm.modelName" placeholder="请输入模板名称，例如：个人信息报表模板" />
			</el-form-item>
			<el-form-item label="模板类型" prop="modelTypeCode">
				<Select
					v-model:value="templateForm.modelTypeCode"
					v-model:label="templateForm.modelTypeName"
					placeholder="请选择模板类型"
					:dataConfig="{ params: { type: 'DICT', dictType: 'MODEL_TYPE' } }"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="templateDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmTemplateForm">确认</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElIcon, ElPopconfirm, ElMessageBox, ElSegmented } from 'element-plus'
import { ZoomOut, ZoomIn, RefreshRight, Printer, Close } from '@element-plus/icons-vue'
import { hiprint, defaultElementTypeProvider } from 'vue-plugin-hiprint'
import Select from '@/components/Select'
import api from '@/api/master/template' // 参考代码：模板接口
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
// 引入打印数据
import printData from './print-data'
const isLoading = ref(true)
// 是否显示
const visible = ref(false)

// 1. 核心实例与基础配置
const instance = getCurrentInstance()
const proxy = instance?.proxy
const hiprintTemplate = ref(null)
const panel = ref(null)

// 2. 纸张配置
const curPaper = ref({
	type: 'A4',
	width: 210,
	height: 296.6,
})
const paperTypes = ref({
	A3: { width: 420, height: 296.6 },
	A4: { width: 210, height: 296.6 },
	A5: { width: 210, height: 147.6 },
	B3: { width: 500, height: 352.6 },
	B4: { width: 250, height: 352.6 },
	B5: { width: 250, height: 175.6 },
})
const paperWidth = ref(210)
const paperHeight = ref(296.6)
const scaleValue = ref(1)
const scaleMax = ref(5)
const scaleMin = ref(0.5)

// 3. 模板与打印数据：新增id字段区分新增/编辑（id为空=新增，有值=编辑）
const formData = ref({
	id: '', // 模板ID（编辑时从接口获取，新增时为空）
	modelTypeCode: '', // 模板类型编码（字典选择）
	modelTypeName: '', // 模板类型名称（字典选择）
	modelName: '', // 模板名称（新增时手动输入，编辑时从接口获取）
	modelContent: null, // 模板JSON字符串（核心数据）
})
// 打印模拟数据
const printDataInfo = ref()

// ---------------------- 核心功能：整合参考代码逻辑 ----------------------
/**
 * 1. 设计器初始化：优先加载编辑模板，无则加载默认模板
 */
onMounted(async () => {
	await nextTick()
	// 判断是否为编辑状态
	const templateId = route.query.id
	getModelTypeList()
	if (templateId) {
		console.log('编辑模板', templateId)
		// 编辑状态：加载模板数据
		await initHiprintDesigner()
	} else {
		console.log('新增模板')
		await initHiprintDesigner() // 等待初始化完成（含模板加载）
	}
})

/**
 * 2. 初始化hiprint设计器（核心优化：模板加载优先级）
 */
const initHiprintDesigner = async () => {
	isLoading.value = true // 开始加载
	const templateId = route.query.id
	try {
		printDataInfo.value = printData
		// 初始化hiprint基础配置
		hiprint.init({
			providers: [new defaultElementTypeProvider()],
			lang: 'cn',
			host: 'http://localhost:17521',
		})

		// 构建左侧拖拽元素
		buildLeftElement()

		// 清空设计区容器，创建设计器实例
		const $designContainer = document.querySelector('#hiprint-printTemplate')
		if ($designContainer) $designContainer.innerHTML = ''

		// 创建hiprint设计器实例
		hiprintTemplate.value = new hiprint.PrintTemplate({
			template: {},
			settingContainer: '#PrintElementOptionSetting',
			paginationContainer: '.hiprint-printPagination',
			history: true,
			paperWidth: curPaper.value.width,
			paperHeight: curPaper.value.height,
			// 图片选择回调
			onImageChooseClick: target => {
				setTimeout(() => {
					target.refresh(
						'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAAIIAQMAAAB99EudAAAABlBMVEUmf8vG2O41LStnAAABD0lEQVR42u3XQQqCQBSAYcWFS4/QUTpaHa2jdISWLUJjjMpclJoPGvq+1WsYfiJCZ4oCAAAAAAAAAAAAAAAAAHin6pL9c6H/fOzHbRrP0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0u/SY9LS0tLS0tLS0tLS0n+edm+UlpaWlpaWlpaWlpaW/tl0Ndyzbno7/+tPTJdd1wal69dNa6abx+Lq6TSeYtK7BX/Diek0XULSZZrakPRtV0i6Hu/KIt30q4fM0pvBqvR9mvsQkZaW9gyJT+f5lsnzjR54xAk8mAUeJyMPwYFH98ALx5Jr0kRLLndT7b64UX9QR/0eAAAAAAAAAAAAAAAAAAD/4gpryzr/bja4QgAAAABJRU5ErkJggg==',
						{ real: true }
					)
				}, 1000)
			},
		})

		// 渲染设计器基础结构
		hiprintTemplate.value.design('#hiprint-printTemplate', { grid: true })
		hiprintTemplate.value.zoom(scaleValue.value)

		// 模板加载优先级：编辑模板（formData.model）> 默认模板（panel.js）
		if (templateId) {
			// 1. 编辑状态：加载已有模板
			await getDetail(templateId)
		} else {
			// 2. 新增状态：加载默认模板（panel.js）
			await getPanel()
		}

		isLoading.value = false // 加载成功
	} catch (error) {
		isLoading.value = false // 加载失败
		ElMessage.error(`设计器初始化失败：${error.message}`)
		console.error('初始化错误：', error)
	}
}

/**
 * 3. 构建左侧拖拽元素（补充标题样式）
 */
const buildLeftElement = () => {
	const $container = document.querySelector('#provider-container')
	if (!$container) return
	$container.innerHTML = ''
	// 构建默认元素（文本、二维码、表格等）
	hiprint.PrintElementTypeManager.build($container, 'defaultModule')
}

/**
 * 4. 模板选择切换（仅编辑时可用）
 */
const handleTemplateChange = async option => {
	console.log('模板选择切换', option)
	if (!option) return // 新增时禁用切换

	try {
		// 从接口获取选中的模板数据
		const res = await api.getDetail(option.value)
		if (res.code !== '0000') {
			ElMessage.error(`加载模板失败：${res.msg}`)
			return
		}

		// 更新表单数据（保持编辑状态）
		formData.value = {
			...formData.value,
			modelTypeCode: res.data.modelTypeCode,
			modelTypeName: res.data.modelTypeName,
			modelContent: res.data.modelContent,
		}

		// 应用选中的模板
		if (res.data.modelContent) {
			mergeTemplate(JSON.parse(res.data.modelContent))
		}
		ElMessage.success(`已切换至模板：${res.data.modelName}`)
	} catch (error) {
		ElMessage.error(`模板加载接口异常：${error.message}`)
	}
}
//编辑调用接口
const getDetail = async id => {
	const res = await api.getDetail(id)
	if (res.code !== '0000') {
		ElMessage.error(`加载模板失败：${res.msg}`)
		return
	}

	// 更新表单数据（保持编辑状态）
	formData.value = res.data
	console.log('formData.value', formData.value)
	templateForm.value = res.data
	mergeTemplate(JSON.parse(res.data.modelContent))
	ElMessage.success(`已加载【${formData.value.modelName || '编辑模板'}】`)
}
/**
 * 5. 加载默认模板（panel.js）- 新增时使用
 */
const getPanel = async () => {
	try {
		// 动态导入panel.js（确保路径正确）
		const panelModule = await import('./panel.js')
		const panelData = panelModule.default

		// 校验模板格式
		if (!panelData || !panelData.template) {
			throw new Error('panel.js 导出格式错误，缺少 template 字段')
		}

		panel.value = panelData
		// 应用默认模板
		mergeTemplate(panelData.template)

		// 同步默认模板的纸张尺寸
		const defaultPanel = panelData.template.panels[0]
		if (defaultPanel && defaultPanel.width && defaultPanel.height) {
			curPaper.value = {
				type: defaultPanel.paperType || 'custom',
				width: defaultPanel.width,
				height: defaultPanel.height,
			}
			paperWidth.value = defaultPanel.width
			paperHeight.value = defaultPanel.height
			hiprintTemplate.value.setPaper(defaultPanel.width, defaultPanel.height)
		}

		console.log('默认模板（panel.js）已加载')
		ElMessage.success('已加载默认模板，可开始编辑')
	} catch (error) {
		ElMessage.error(`默认模板加载失败：${error.message}`)
		console.error('getPanel 错误：', error)
	}
}

// 在 script setup 中添加相关数据和方法
const templateDialogVisible = ref(false)
const templateFormRef = ref(null)
const templateForm = ref({
	modelName: '',
	modelTypeCode: '',
	modelTypeName: '',
})

const templateFormRules = {
	modelName: [
		{ required: true, message: '请输入模板名称', trigger: 'blur' },
		{ pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/, message: '模板名需为2-20位中英文、数字或下划线', trigger: 'blur' },
	],
	modelTypeCode: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
}
/**
 * 6. 模板保存：新增需输入名称，编辑直接保存
 */
const saveTemplate = async () => {
	if (!hiprintTemplate.value) {
		ElMessage.warning('设计器未初始化，无法保存')
		return
	}

	// 步骤1：获取当前模板JSON数据
	const templateJson = hiprintTemplate.value.getJson()
	formData.value.modelContent = JSON.stringify(templateJson)
	// 步骤2：新增状态 - 弹出对话框输入模板名和选择模板类型
	if (!formData.value.id) {
		// 重置表单数据
		templateForm.value = {
			modelName: '',
			modelTypeCode: '',
			modelTypeName: '',
		}
	}
	console.log('11111.value')
	// 显示对话框
	templateDialogVisible.value = true

	// 等待用户确认或取消
	return
}
// 添加确认模板表单的方法
const confirmTemplateForm = async () => {
	await templateFormRef.value.validate()

	// 将表单数据赋值给 formData
	formData.value.modelName = templateForm.value.modelName
	formData.value.modelTypeCode = templateForm.value.modelTypeCode
	formData.value.modelTypeName = templateForm.value.modelTypeName

	// 关闭对话框
	templateDialogVisible.value = false
	// 根据id判断是新增还是编辑
	if (formData.value.id) {
		// 编辑状态 - 二次确认
		await ElMessageBox.confirm('确定更新此模板？', '更新确认', {
			confirmButtonText: '确认',
			cancelButtonText: '取消',
			type: 'warning',
		})

		// 调用接口更新
		const res = await api.update(formData.value)
		if (res.code === '0000') {
			ElMessage.success('模板更新成功')
		} else {
			ElMessage.error(`更新失败：${res.msg || '未知错误'}`)
		}
		//跳转
		router.push({
			name: 'hiprintIndex',
		})
	} else {
		// 继续保存操作 - 二次确认
		await ElMessageBox.confirm('确定新增此模板？', '新增确认', {
			confirmButtonText: '确认',
			cancelButtonText: '取消',
			type: 'warning',
		})

		// 调用接口保存
		const res = await api.insert(formData.value)
		if (res.code === '0000') {
			ElMessage.success('模板新增成功')
			//跳转
			router.push({
				name: 'hiprintIndex',
			})
		} else {
			ElMessage.error(`保存失败：${res.msg || '未知错误'}`)
		}
		//跳转
		router.push({
			name: 'hiprintIndex',
		})
	}
}
/**
 * 7. 清空设计区（保留纸张尺寸）
 */
const clearDesign = () => {
	if (!hiprintTemplate.value) return

	try {
		const emptyTemplate = {
			panels: [
				{
					index: 0,
					name: 1,
					height: curPaper.value.height,
					width: curPaper.value.width,
					paperHeader: 0,
					paperFooter: curPaper.value.height - 10,
					paperNumberContinue: true,
					watermarkOptions: {},
					panelLayoutOptions: {},
					printElements: [], // 清空所有元素
				},
			],
		}
		mergeTemplate(emptyTemplate)
		ElMessage.success('已清空当前设计')
	} catch (error) {
		ElMessage.error(`清空失败：${error.message}`)
	}
}

/**
 * 8. 打印功能
 */
const print = () => {
	if (!hiprintTemplate.value) {
		ElMessage.warning('设计器未初始化，无法打印')
		return
	}

	try {
		const printOptions = { leftOffset: -1, topOffset: -1 }
		const printExt = {
			callback: () => console.log('打印窗口已打开'),
			styleHandler: () => `
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vue-plugin-hiprint@latest/dist/print-lock.css" media="print">
				<style>
				body { margin: 0; padding: 0; }
				.hiprint-printElement { box-sizing: border-box; font-family: "Microsoft YaHei", sans-serif; }
				</style>
			`,
		}

		// 传入打印数据并执行打印
		hiprintTemplate.value.print(printDataInfo.value, printOptions, printExt)
	} catch (error) {
		ElMessage.error(`打印失败：${error.message}（请确保打印客户端已启动）`)
	}
}

/**
 * 9. 模板更新（通用方法：加载/切换/清空模板）
 */
const mergeTemplate = templateJson => {
	if (!hiprintTemplate.value) return

	try {
		hiprintTemplate.value.update(templateJson)
		// 同步纸张尺寸（从模板中提取）
		const templatePanel = templateJson.panels?.[0]
		if (templatePanel && templatePanel.width && templatePanel.height) {
			curPaper.value.width = templatePanel.width
			curPaper.value.height = templatePanel.height
			paperWidth.value = templatePanel.width
			paperHeight.value = templatePanel.height
		}
	} catch (error) {
		ElMessage.error(`模板更新失败：${error.message}`)
	}
}

// ---------------------- 原有功能：优化异常处理 ----------------------
/**
 * 纸张切换
 */
const setPaper = (type, value) => {
	try {
		curPaper.value = { type, ...value }
		paperWidth.value = value.width
		paperHeight.value = value.height
		hiprintTemplate.value?.setPaper(value.width, value.height)
		ElMessage.success(`已切换为${type}纸（${value.width}×${value.height}mm）`)
	} catch (error) {
		ElMessage.error(`纸张切换失败：${error.message}`)
	}
}

/**
 * 自定义纸张应用
 */
const setCustomPaper = () => {
	try {
		const width = Math.max(10, Math.min(2000, paperWidth.value || 210))
		const height = Math.max(10, Math.min(2000, paperHeight.value || 296.6))

		curPaper.value = { type: 'custom', width, height }
		hiprintTemplate.value?.setPaper(width, height)
		ElMessage.success(`自定义纸张（${width}×${height}mm）已应用`)
	} catch (error) {
		ElMessage.error(`自定义纸张设置失败：${error.message}`)
	}
}

/**
 * 纸张输入校验
 */
const handlePaperInput = () => {
	paperWidth.value = paperWidth.value < 10 ? 10 : paperWidth.value
	paperHeight.value = paperHeight.value < 10 ? 10 : paperHeight.value
}

/**
 * 纸张旋转
 */
const rotatePaper = () => {
	try {
		hiprintTemplate.value?.rotatePaper()
		const { width, height } = curPaper.value
		curPaper.value.width = height
		curPaper.value.height = width
		paperWidth.value = height
		paperHeight.value = width
	} catch (error) {
		ElMessage.error(`纸张旋转失败：${error.message}`)
	}
}

/**
 * 缩放控制
 */
const changeScale = isEnlarge => {
	let newScale = scaleValue.value
	newScale = isEnlarge ? newScale + 0.1 : newScale - 0.1
	newScale = Math.max(scaleMin.value, Math.min(scaleMax.value, newScale))
	scaleValue.value = Number(newScale.toFixed(1))
	hiprintTemplate.value?.zoom(scaleValue.value)
}

// ---------------------- 暴露方法（支持父组件传参，如编辑时传入模板ID） ----------------------
defineExpose({
	formData,
	printDataInfo,
	// 父组件调用：设置编辑模板数据（如从列表页跳转时传入）
	setEditTemplate: templateData => {
		formData.value = {
			id: templateData.id,
			modelTypeCode: templateData.modelTypeCode,
			modelTypeName: templateData.modelTypeName,
			modelName: templateData.modelName,
			modelContent: templateData.modelContent,
		}
		// 重新初始化设计器（加载编辑模板）
		initHiprintDesigner()
	},
	// 重置为新增状态
	reset: () => {
		formData.value = { id: '', modelTypeCode: '', modelTypeName: '', modelName: '', modelContent: null }
		paperWidth.value = 210
		paperHeight.value = 296.6
		curPaper.value = { type: 'A4', width: 210, height: 296.6 }
		// 重置后加载默认模板
		initHiprintDesigner()
	},
})
const modelTypeList = ref([])
const getModelTypeList = () => {
	api.getModelTypeList().then(res => {
		if (res.code === '0000') {
			// 转换数据结构以匹配 Select 组件的要求
			modelTypeList.value = res.data.map(item => ({
				value: item.id,
				label: item.modelName,
			}))
			console.log('modelTypeList', modelTypeList.value)
		}
	})
}
</script>

<style scoped>
/* 主容器：补充卡片容器样式 */
.app-container {
	padding: 16px;
	background-color: #f5f7fa;
	min-height: 100vh;
	box-sizing: border-box;
}

.card-container {
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

/* 头部控制区：补充功能按钮区样式 */
.print-paper-header {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
	padding: 12px 20px;
	background-color: #fafbfc;
	border-bottom: 1px solid #ebeef5;
}

.control-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

.control-label {
	font-size: 13px;
	color: #606266;
	white-space: nowrap;
}

/* 左侧/右侧设计区标题样式 */
.design-drag-panel .title,
.right .title {
	font-size: 14px;
	font-weight: 500;
	color: #333;
	margin: 10px 0;
	padding-left: 5px;
	border-left: 3px solid #409eff;
}

/* 功能按钮区（整合参考代码按钮样式） */
.function-btn-group {
	margin-left: auto;
	gap: 8px;
}

.action-btn {
	min-width: 90px;
}

.save-btn {
	background-color: #409eff !important;
	border-color: #409eff !important;
}

.save-btn:hover {
	background-color: #3399ff !important;
}

/* 纸张类型选择区 */
.paper-btn-group {
	display: flex;
	gap: 4px;
}

.paper-btn {
	color: #606266 !important;
	background-color: #fff !important;
	border-color: #dcdfe6 !important;
	transition: all 0.2s;
}

.paper-btn--active {
	color: #409eff !important;
	background-color: #ecf5ff !important;
	border-color: #409eff !important;
	font-weight: 500;
}

/* 自定义纸张区 */
.custom-paper-controls {
	display: flex;
	align-items: center;
	gap: 8px;
}

.custom-paper-input {
	width: 80px !important;
}

.input-separator {
	font-size: 14px;
	color: #909399;
}

/* 缩放控制区 */
.scale-controls {
	display: flex;
	align-items: center;
	gap: 4px;
}

.scale-btn {
	width: 32px !important;
	height: 32px !important;
	padding: 0 !important;
	display: flex;
	align-items: center;
	justify-content: center;
}

.scale-input {
	width: 80px !important;
}

/* 三栏设计区：优化间距和高度 */
.print-design-area {
	display: flex;
	height: 85vh;
	gap: 10px;
	padding: 10px;
}

.design-drag-panel {
	padding-left: 15px;
	overflow-y: auto; /* 元素过多时滚动 */
}

.right {
	padding-right: 15px;
	overflow-y: auto; /* 属性配置区滚动 */
}

/* 响应式适配（原代码基础上补充功能按钮区适配） */
@media (max-width: 1440px) {
	.scale-control-group {
		margin-left: 0;
		width: 100%;
		justify-content: flex-start;
	}
}

@media (max-width: 1200px) {
	.template-select-group,
	.function-btn-group {
		width: 100%;
		justify-content: flex-start;
	}
}

@media (max-width: 768px) {
	.print-paper-header {
		padding: 12px;
		gap: 12px;
	}

	.paper-type-group,
	.custom-paper-group {
		width: 100%;
		justify-content: flex-start;
	}

	.print-design-area {
		flex-direction: column;
		padding: 12px;
		height: auto;
	}

	.template-select {
		width: 120px !important;
	}
}
</style>
<style lang="less" scoped>
@import '@/assets/styles/print-iconfont/print-icon.scss';
@import '@/assets/styles/print-iconfont/iconfont.css';
@import '@/assets/styles/print-lock.css';
@import '@/assets/styles/hiprint.css';

/* 优化hiprint元素样式 */
.hiprint-printElement {
	box-sizing: border-box;
}
.hiprint-table-header {
	background-color: #f3f4f6 !important;
}
.hiprint-table-row:nth-child(even) {
	background-color: #f9fafb !important;
}
</style>
