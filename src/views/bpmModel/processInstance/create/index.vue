<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 15:30:30
 * @LastEditTime: 2025-12-23 16:44:49
 * @LastEditors: zhangsd
 * @Description: 发起流程实例
 * @FilePath: \view\src\views\bpmModel\processInstance\create\index.vue
-->

<template>
	<div class="app-container">
		<!-- 第一步，通过流程定义的列表，选择对应的流程 -->
		<template v-if="!selectProcessDefinition">
			<!-- 搜索栏 - 增加间距，优化布局 -->
			<div class="search-wrapper">
				<SearchHeader ref="SearchHeaderRef" :selectData="selectData" @searchClick="handleQuery" :buttonList="buttonList" />
			</div>

			<!-- 流程列表卡片 - 优化容器样式，增加内边距 -->
			<div
				:class="{ 'process-definition-container': filteredProcessDefinitionList && filteredProcessDefinitionList.length }"
				class="content-wrap"
				:style="{ height: tableHeight + 'px' }"
			>
				<!-- 流程列表内容 - 优化响应式布局 -->
				<div class="process-content">
					<el-row v-if="filteredProcessDefinitionList && filteredProcessDefinitionList.length" :gutter="24" class="el-row-wrap">
						<!-- 左侧分类栏 - 增加最小宽度，避免挤压 -->
						<el-col :span="5" :xs="24" :sm="6" :md="5" class="category-col">
							<div class="category-list">
								<div
									v-for="category in availableCategories"
									:key="category.code"
									class="category-item"
									:class="categoryActive.code === category.code ? 'category-item-active' : ''"
									@click="handleCategoryClick(category)"
								>
									{{ category.name }}
								</div>
							</div>
						</el-col>
						<!-- 右侧流程卡片区域 - 优化滚动高度，响应式适配 -->
						<el-col :span="19" :xs="24" :sm="18" :md="19" class="definition-col">
							<el-scrollbar ref="scrollWrapper" class="definition-scroll" @scroll="handleScroll">
								<div
									class="definition-group"
									v-for="(definitions, categoryCode) in processDefinitionGroup"
									:key="categoryCode"
									:ref="`category-${categoryCode}`"
								>
									<!-- 分组标题 - 优化样式，增加间距 -->
									<h3 class="group-title">
										{{ getCategoryName(categoryCode) }}
									</h3>
									<!-- 流程卡片网格 - 响应式布局，优化间距 -->
									<div class="definition-card-grid">
										<el-tooltip
											v-for="definition in definitions"
											:key="definition.id"
											:content="definition.description"
											:disabled="!definition.description || definition.description.trim().length === 0"
											placement="top"
										>
											<el-card
												shadow="hover"
												class="definition-item-card"
												@click="handleSelect(definition)"
												:class="{ 'definition-card-active': selectProcessDefinition?.id === definition.id }"
											>
												<template #default>
													<div class="card-content">
														<el-image
															v-if="definition.icon"
															:src="definition.icon"
															class="card-icon-img"
															fit="cover"
														/>
														<div v-else class="flow-icon">
															<span class="flow-icon-text">
																{{ definition.name.substring(0, 2) }}
															</span>
														</div>
														<el-text class="card-name" size="large">{{ definition.name }}</el-text>
													</div>
												</template>
											</el-card>
										</el-tooltip>
									</div>
								</div>
							</el-scrollbar>
						</el-col>
					</el-row>
					<!-- 空状态 - 优化居中显示，增加间距 -->
					<el-empty class="empty-wrap" :image-size="200" description="没有找到搜索结果" v-else />
				</div>
			</div>
		</template>

		<!-- 第二步，填写表单，进行流程的提交 -->
		<ProcessDefinitionDetail
			v-else
			ref="processDefinitionDetailRef"
			:selectProcessDefinition="selectProcessDefinition"
			@cancel="selectProcessDefinition = undefined"
		/>
	</div>
</template>

<script setup>
import BpmProcessDefinitionApi from '@/api/system/bpm/definition'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import { CategoryApi } from '@/api/system/bpm/category'
import ProcessDefinitionDetail from './ProcessDefinitionDetail.vue'
import { groupBy } from 'lodash-es'
import SearchHeader from '@/components/SearchHeader'
import { getCurrentInstance, onMounted, computed, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from '@/plugins/useMessage'
import tableParamsStore from '@/store/modules/tableParams'
import { roleTypes } from 'element-plus'
defineOptions({ name: 'BpmProcessInstanceCreate' })

const { proxy } = getCurrentInstance()
const route = useRoute()
const message = useMessage()
const storeHight = computed(() => tableParamsStore().normalTableHeight)

const tableHeight = computed(() => storeHight.value - 15)
const selectData = ref([
	{
		name: '流程名称', // 搜索框名称
		type: 'input', // 搜索框类型
		modelValue: 'searchName', // 绑定字段
		span: 24, // 栅格占位（共24）
	},
])
const buttonList = ref([])
// 响应式数据
const searchName = ref('') // 当前搜索关键字
const processInstanceId = route.query.processInstanceId // 流程实例编号。场景：重新发起时
const loading = ref(true) // 加载中
const categoryList = ref([]) // 分类的列表
const categoryActive = ref({}) // 选中的分类
const processDefinitionList = ref([]) // 流程定义的列表
const filteredProcessDefinitionList = ref([]) // 用于存储搜索过滤后的流程定义
const selectProcessDefinition = ref() // 选中的流程定义
const processDefinitionDetailRef = ref() // 流程详情组件ref

/** 查询列表 */
const getList = async () => {
	loading.value = true
	try {
		// 所有流程分类数据
		await getCategoryList()
		// 所有流程定义数据
		await getProcessDefinitionList()

		// 如果 processInstanceId 非空，说明是重新发起
		if (processInstanceId && processInstanceId.length > 0) {
			const processInstance = await ProcessInstanceApi.getProcessInstance(processInstanceId)
			if (!processInstance) {
				message.error('重新发起流程失败，原因：流程实例不存在')
				return
			}
			const processDefinition = processDefinitionList.value.find(item => item.key == processInstance.processDefinition?.key)
			if (!processDefinition) {
				message.error('重新发起流程失败，原因：流程定义不存在')
				return
			}
			await handleSelect(processDefinition, processInstance.formVariables)
		}
	} finally {
		loading.value = false
	}
}

/** 获取所有流程分类数据 */
const getCategoryList = async () => {
	try {
		// 流程分类
		const res = await CategoryApi.getCategoryPage()
		categoryList.value = res.data.pages || []

		// categoryList.value = [
		// 	{
		// 		id: 120,
		// 		name: 'OA',
		// 		code: 'OA',
		// 		description: null,
		// 		status: null,
		// 		sort: null,
		// 		createTime: null,
		// 	},
		// 	{
		// 		id: 121,
		// 		name: '其他',
		// 		code: 'QT',
		// 		description: null,
		// 		status: null,
		// 		sort: null,
		// 		createTime: null,
		// 	},
		// ]
	} catch (e) {
		console.error('获取流程分类失败：', e)
	}
}

/** 获取所有流程定义数据 */
const getProcessDefinitionList = async () => {
	try {
		// 流程定义
		const res = await BpmProcessDefinitionApi.getProcessDefinitionList({
			suspensionState: 1,
		})
		processDefinitionList.value = res.data || []
		// processDefinitionList.value = [
		// 	{
		// 		icon: null,
		// 		description: '',
		// 		type: null,
		// 		formType: 10,
		// 		formId: 39,
		// 		formCustomCreatePath: '',
		// 		formCustomViewPath: '',
		// 		visible: true,
		// 		startUserIds: [],
		// 		startDeptIds: [],
		// 		managerUserIds: [1],
		// 		sort: 1765791301903,
		// 		allowCancelRunningProcess: true,
		// 		allowWithdrawTask: false,
		// 		processIdRule: {
		// 			enable: false,
		// 			prefix: '',
		// 			infix: '',
		// 			postfix: '',
		// 			length: 5,
		// 		},
		// 		autoApprovalType: 0,
		// 		titleSetting: {
		// 			enable: false,
		// 			title: '',
		// 		},
		// 		summarySetting: {
		// 			enable: false,
		// 			summary: [],
		// 		},
		// 		processBeforeTriggerSetting: null,
		// 		processAfterTriggerSetting: null,
		// 		taskBeforeTriggerSetting: null,
		// 		taskAfterTriggerSetting: null,
		// 		printTemplateSetting: {
		// 			enable: false,
		// 			template: null,
		// 		},
		// 		id: 'test:3:7a40d609-dca1-11f0-b9e4-00ff3e31cab8',
		// 		version: 3,
		// 		name: 'test',
		// 		key: 'test',
		// 		category: 'OA',
		// 		categoryName: null,
		// 		modelType: 10,
		// 		modelId: '547e6ae8-d999-11f0-85ac-00ff3e31cab8',
		// 		formConf:
		// 			'{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
		// 		formFields: [
		// 			'{"type":"input","field":"Fgyomj6yl6fnabc","title":"输入框","info":"","$required":false,"_fc_id":"id_F403mj6yl6fnacc","name":"ref_Ff23mj6yl6fnadc","display":true,"hidden":false,"_fc_drag_tag":"input"}',
		// 			'{"type":"input","field":"Fpvwmj6yl7giaec","title":"多行输入框","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_Fovymj6yl7giafc","name":"ref_Fw2smj6yl7giagc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
		// 			'{"type":"checkbox","field":"Ft94mj6yl8amahc","title":"多选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项01","value":"1"},{"label":"选项02","value":"2"},{"label":"选项03","value":"3"}],"_fc_id":"id_Fuapmj6yl8amaic","name":"ref_F0iamj6yl8amajc","display":true,"hidden":false,"_fc_drag_tag":"checkbox"}',
		// 		],
		// 		formName: null,
		// 		suspensionState: 1,
		// 		deploymentTime: null,
		// 		bpmnXml: null,
		// 		simpleModel: null,
		// 	},
		// 	{
		// 		icon: null,
		// 		description: '',
		// 		type: null,
		// 		formType: 10,
		// 		formId: 40,
		// 		formCustomCreatePath: '',
		// 		formCustomViewPath: '',
		// 		visible: true,
		// 		startUserIds: [],
		// 		startDeptIds: [],
		// 		managerUserIds: [1],
		// 		sort: 1766128949437,
		// 		allowCancelRunningProcess: true,
		// 		allowWithdrawTask: false,
		// 		processIdRule: {
		// 			enable: false,
		// 			prefix: '',
		// 			infix: '',
		// 			postfix: '',
		// 			length: 5,
		// 		},
		// 		autoApprovalType: 0,
		// 		titleSetting: {
		// 			enable: false,
		// 			title: '',
		// 		},
		// 		summarySetting: {
		// 			enable: false,
		// 			summary: [],
		// 		},
		// 		processBeforeTriggerSetting: null,
		// 		processAfterTriggerSetting: null,
		// 		taskBeforeTriggerSetting: null,
		// 		taskAfterTriggerSetting: null,
		// 		printTemplateSetting: {
		// 			enable: false,
		// 			template: null,
		// 		},
		// 		id: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
		// 		version: 4,
		// 		name: '通用表单',
		// 		key: 'common-form',
		// 		category: 'OA',
		// 		categoryName: null,
		// 		modelType: 10,
		// 		modelId: '7a191d73-dcab-11f0-b9e4-00ff3e31cab8',
		// 		formConf:
		// 			'{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
		// 		formFields: [
		// 			'{"type":"datePicker","field":"Fb8fmjcjnevtb1c","title":"开始时间","info":"","$required":"请输入开始时间","_fc_id":"id_Fdnwmjcjnevtb2c","name":"ref_Fkr1mjcjnevtb3c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
		// 			'{"type":"datePicker","field":"F8nhmjcjnzk1b4c","title":"结束时间","info":"","$required":"请输入结束时间","_fc_id":"id_F7pimjcjnzk1b5c","name":"ref_F8epmjcjnzk1b6c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
		// 			'{"type":"select","field":"Fjtmmjcjcm5fakc","title":"请假类型","info":"","effect":{"fetch":""},"$required":"强选择请假类型","props":{"clearable":true,"filterable":false},"options":[{"label":"事假","value":"10"},{"label":"病假","value":"20"},{"label":"其他","value":"30"}],"_fc_id":"id_Fuelmjcjcm5falc","name":"ref_Fhnhmjcjcm5famc","display":true,"hidden":false,"_fc_drag_tag":"select"}',
		// 			'{"type":"input","field":"F58dmjcjg2vfanc","title":"请假原因","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_Fl48mjcjg2vfaoc","name":"ref_Fghfmjcjg2vfapc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
		// 		],
		// 		formName: null,
		// 		suspensionState: 1,
		// 		deploymentTime: null,
		// 		bpmnXml: null,
		// 		simpleModel: null,
		// 	},
		// 	{
		// 		icon: null,
		// 		description: '',
		// 		type: null,
		// 		formType: 10,
		// 		formId: 40,
		// 		formCustomCreatePath: '',
		// 		formCustomViewPath: '',
		// 		visible: true,
		// 		startUserIds: [],
		// 		startDeptIds: [],
		// 		managerUserIds: [1],
		// 		sort: 1766478892614,
		// 		allowCancelRunningProcess: true,
		// 		allowWithdrawTask: false,
		// 		processIdRule: {
		// 			enable: false,
		// 			prefix: '',
		// 			infix: '',
		// 			postfix: '',
		// 			length: 5,
		// 		},
		// 		autoApprovalType: 0,
		// 		titleSetting: {
		// 			enable: false,
		// 			title: '',
		// 		},
		// 		summarySetting: {
		// 			enable: false,
		// 			summary: [],
		// 		},
		// 		processBeforeTriggerSetting: null,
		// 		processAfterTriggerSetting: null,
		// 		taskBeforeTriggerSetting: null,
		// 		taskAfterTriggerSetting: null,
		// 		printTemplateSetting: {
		// 			enable: false,
		// 			template: null,
		// 		},
		// 		id: 'custom-other:1:436eba1c-dfda-11f0-bc4a-00ff3e31cab8',
		// 		version: 1,
		// 		name: '其他模板',
		// 		key: 'custom-other',
		// 		category: 'QT',
		// 		categoryName: null,
		// 		modelType: 10,
		// 		modelId: '407db4a7-dfda-11f0-bc4a-00ff3e31cab8',
		// 		formConf:
		// 			'{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
		// 		formFields: [
		// 			'{"type":"datePicker","field":"Fb8fmjcjnevtb1c","title":"开始时间","info":"","$required":"请输入开始时间","_fc_id":"id_Fdnwmjcjnevtb2c","name":"ref_Fkr1mjcjnevtb3c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
		// 			'{"type":"datePicker","field":"F8nhmjcjnzk1b4c","title":"结束时间","info":"","$required":"请输入结束时间","_fc_id":"id_F7pimjcjnzk1b5c","name":"ref_F8epmjcjnzk1b6c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
		// 			'{"type":"select","field":"Fjtmmjcjcm5fakc","title":"请假类型","info":"","effect":{"fetch":""},"$required":"强选择请假类型","props":{"clearable":true,"filterable":false},"options":[{"label":"事假","value":"10"},{"label":"病假","value":"20"},{"label":"其他","value":"30"}],"_fc_id":"id_Fuelmjcjcm5falc","name":"ref_Fhnhmjcjcm5famc","display":true,"hidden":false,"_fc_drag_tag":"select"}',
		// 			'{"type":"input","field":"F58dmjcjg2vfanc","title":"请假原因","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_Fl48mjcjg2vfaoc","name":"ref_Fghfmjcjg2vfapc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
		// 		],
		// 		formName: null,
		// 		suspensionState: 1,
		// 		deploymentTime: null,
		// 		bpmnXml: null,
		// 		simpleModel: null,
		// 	},
		// ]
		// 初始化过滤列表为全部流程定义
		filteredProcessDefinitionList.value = processDefinitionList.value

		// 在获取完所有数据后，设置第一个有效分类为激活状态
		if (availableCategories.value.length > 0 && !categoryActive.value?.code) {
			categoryActive.value = availableCategories.value[0]
		}
	} catch (e) {
		console.error('获取流程定义失败：', e)
	}
}

/** 搜索流程 */
const handleQuery = () => {
	if (searchName.value.trim()) {
		// 如果有搜索关键字，进行过滤
		filteredProcessDefinitionList.value = processDefinitionList.value.filter(definition =>
			definition.name.toLowerCase().includes(searchName.value.toLowerCase()),
		)
	} else {
		// 如果没有搜索关键字，恢复所有数据
		filteredProcessDefinitionList.value = processDefinitionList.value
	}
}

/** 流程定义的分组（按分类） */
const processDefinitionGroup = computed(() => {
	if (!processDefinitionList.value || !processDefinitionList.value.length) {
		return {}
	}

	const grouped = groupBy(filteredProcessDefinitionList.value, 'category')
	// 按照 categoryList 的顺序重新组织数据
	const orderedGroup = {}
	categoryList.value.forEach(category => {
		if (grouped[category.code]) {
			orderedGroup[category.code] = grouped[category.code]
		}
	})
	return orderedGroup
})

/** 左侧分类切换 */
const handleCategoryClick = category => {
	categoryActive.value = category
	const categoryRef = proxy.$refs[`category-${category.code}`] // 获取点击分类对应的 DOM 元素
	if (categoryRef && categoryRef.length) {
		const scrollWrapper = proxy.$refs.scrollWrapper // 获取右侧滚动容器
		const categoryOffsetTop = categoryRef[0].offsetTop

		// 滚动到对应位置
		scrollWrapper.scrollTo({ top: categoryOffsetTop, behavior: 'smooth' })
	}
}

/** 通过分类 code 获取对应的名称 */
const getCategoryName = categoryCode => {
	return categoryList.value?.find(ctg => ctg.code === categoryCode)?.name
}

/** 处理选择流程的按钮操作 **/
const handleSelect = async (row, formVariables) => {
	// 设置选择的流程
	selectProcessDefinition.value = row
	// 初始化流程定义详情
	await nextTick()
	const data = {
		icon: null,
		description: null,
		type: null,
		formType: 10,
		formId: '2013539872417124352',
		formCustomCreatePath: null,
		formCustomViewPath: null,
		visible: true,
		startUserIds: null,
		startDeptIds: null,
		managerUserIds: null,
		sort: '1768901057708',
		allowCancelRunningProcess: true,
		allowWithdrawTask: false,
		processIdRule: null,
		autoApprovalType: 0,
		titleSetting: null,
		summarySetting: null,
		processBeforeTriggerSetting: null,
		processAfterTriggerSetting: null,
		taskBeforeTriggerSetting: null,
		taskAfterTriggerSetting: null,
		printTemplateSetting: null,
		id: 'Ask_For_Leave:6:47eb8152-f761-11f0-a3e4-00ff23e3c771',
		version: 6,
		name: '请假流程test',
		key: 'Ask_For_Leave',
		category: 'OA',
		categoryName: null,
		modelType: 10,
		modelId: 'cb6361af-f5e1-11f0-b736-00ff23e3c771',
		formConf:
			'{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
		formFields: [
			'{"type":"input","field":"F469mkmdi7emabc","title":"姓名","info":"","$required":false,"_fc_id":"id_Fiormkmdi7emacc","name":"ref_F9hzmkmdi7emadc","display":true,"hidden":false,"_fc_drag_tag":"input"}',
			'{"type":"timePicker","field":"Fr2nmkmdiruiahc","title":"时间","info":"","$required":false,"_fc_id":"id_Fezhmkmdiruiaic","name":"ref_F8g6mkmdiruiajc","display":true,"hidden":false,"_fc_drag_tag":"timePicker"}',
			'{"type":"input","field":"Fabcmkmdjd48akc","title":"请假原因","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_F1jkmkmdjd48alc","name":"ref_Fyxamkmdjd48amc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
		],
		formName: null,
		suspensionState: 1,
		deploymentTime: null,
		bpmnXml: null,
		simpleModel: null,
	}

	console.log('formVariables', formVariables, row)
	processDefinitionDetailRef.value?.initProcessInfo(data, formVariables)
}

/** 处理滚动事件，和左侧分类联动 */
const handleScroll = e => {
	// 直接使用事件对象获取滚动位置
	const scrollTop = e.scrollTop

	// 获取所有分类区域的位置信息
	const categoryPositions = categoryList.value
		.map(category => {
			const categoryRef = proxy.$refs[`category-${category.code}`]
			if (categoryRef && categoryRef[0]) {
				return {
					code: category.code,
					offsetTop: categoryRef[0].offsetTop,
					height: categoryRef[0].offsetHeight,
				}
			}
			return null
		})
		.filter(Boolean)

	// 查找当前滚动位置对应的分类
	let currentCategory = categoryPositions[0]
	for (const position of categoryPositions) {
		// 为了更好的用户体验，可以添加一个缓冲区域（比如 50px）
		if (scrollTop >= position.offsetTop - 50) {
			currentCategory = position
		} else {
			break
		}
	}

	// 更新当前 active 的分类
	if (currentCategory && categoryActive.value.code !== currentCategory.code) {
		categoryActive.value = categoryList.value.find(c => c.code === currentCategory.code)
	}
}

/** 过滤出有流程的分类列表。目的：只展示有流程的分类 */
const availableCategories = computed(() => {
	console.log('processDefinitionGroup', processDefinitionGroup.value)
	if (!categoryList.value || !categoryList.value.length || !processDefinitionGroup.value) {
		return []
	}

	// 获取所有有流程的分类代码
	const availableCategoryCodes = Object.keys(processDefinitionGroup.value)

	// 过滤出有流程的分类
	return categoryList.value.filter(category => availableCategoryCodes.includes(category.code))
})

/** 初始化 */
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
// 全局容器样式

// 搜索栏容器
.search-wrapper {
	width: 100%;
}

// 内容容器
.content-wrap {
	position: relative;
	padding: 15px;
	border-radius: 8px;
	background-color: #fff;
	max-height: calc(100vh - 150px); // 自适应视口高度，避免溢出
	border: 1px solid #eff0f1;
}

// 流程内容容器
.process-content {
	width: 100%;
	height: 100%;
}

// 流程定义容器（左侧分类右侧边框）
.process-definition-container::before {
	position: absolute;
	left: calc(5 / 24 * 100%); // 动态计算边框位置，适配栅格
	top: 24px;
	bottom: 24px;
	height: auto;
	border-left: 1px solid #e5e6eb;
	content: '';
	// 小屏幕下隐藏边框
	@media (max-width: 768px) {
		display: none;
	}
}

// 弹性行不换行（大屏），小屏换行
.el-row-wrap {
	display: flex;
	@media (min-width: 768px) {
		flex-wrap: nowrap;
	}
	@media (max-width: 768px) {
		flex-wrap: wrap;
	}
}

// 左侧分类列
.category-col {
	@media (min-width: 768px) {
		min-width: 160px; // 最小宽度，避免分类被挤压
		padding-right: 12px;
	}
	@media (max-width: 768px) {
		margin-bottom: 16px;
	}
}

// 左侧分类列表
.category-list {
	display: flex;
	flex-direction: column;
	gap: 4px; // 分类项间距
}

// 分类项
.category-item {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	cursor: pointer;
	font-size: 14px;
	border-radius: 6px;
	transition: all 0.2s ease; // 过渡动画
	&:hover {
		background-color: #f2f3f5; // hover 效果
		color: #333;
	}
}

// 分类项激活状态
.category-item-active {
	color: #3e7bff !important;
	background-color: #e8eeff !important;
	font-weight: 500;
	&:hover {
		background-color: #e8eeff !important;
	}
}

// 右侧流程列
.definition-col {
	@media (min-width: 768px) {
		padding-left: 12px;
	}
}

// 流程滚动容器
.definition-scroll {
	height: calc(100vh - 200px); // 自适应滚动高度
	max-height: 700px;
}

// 流程定义分组
.definition-group {
	margin-bottom: 32px; // 分组间距加大
	padding-left: 4px;
}

// 分组标题
.group-title {
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	margin-bottom: 16px;
	margin-top: 0;
	padding-bottom: 8px;
	border-bottom: 1px solid #f0f0f0; // 标题下边框，提升层次
}

// 卡片网格布局 - 响应式适配
.definition-card-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); // 自适应列数
	gap: 16px; // 卡片间距
}

// 流程图标（无图片时）
.flow-icon {
	display: flex;
	width: 36px;
	height: 36px;
	margin-right: 12px;
	background-color: var(--el-color-primary);
	border-radius: 8px; // 圆角优化
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.flow-icon-text {
	font-size: 14px;
	color: #fff;
	font-weight: 500;
}

// 卡片内容
.card-content {
	display: flex;
	align-items: center;
	padding: 4px 0;
}

// 卡片图标图片
.card-icon-img {
	width: 36px;
	height: 36px;
	border-radius: 8px;
	margin-right: 12px;
}

// 流程名称
.card-name {
	margin-left: 0 !important;
	font-weight: 500;
	color: #1d2129;
}

// 空状态
.empty-wrap {
	padding: 100px 0 !important;
	text-align: center;
	width: 100%;
}

// 流程卡片激活状态
.definition-card-active {
	border: 2px solid var(--el-color-primary);
	box-shadow: 0 0 0 2px rgba(62, 123, 255, 0.2) !important;
}

// 深度样式修改（Element UI 卡片）
:deep(.definition-item-card) {
	.el-card__body {
		padding: 16px;
		cursor: pointer;
		border-radius: 8px;
	}
	&:hover {
		.flow-icon {
			background-color: var(--el-color-primary-light-3); //  hover 时图标变色
		}
	}
}
</style>
