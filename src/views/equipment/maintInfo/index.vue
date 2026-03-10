<template>
	<div class="app-container">
	<BaseTable
		ref="baseTable"
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:buttonList="buttonList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:loading="loading"
		:cellClickEvent="cellClickEvent"
		:total="total"
		:checkbox-config="checkboxConfig"
		@checkbox-change="checkboxChange"
	/>
	</div>
	<el-drawer v-model="open" :title="title" size="70%">
		<detail ref="detailRef" :readonly="isReadonly" :mode="detailMode" :onlyDispatch="onlyDispatch" @saved="handleDetailSaved" />
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="cancel">取消</el-button>
				<el-button v-if="!isReadonly && detailMode === 'add'" type="primary" @click="save" v-hasPermi="['equipment:maintInfo:add']">
					确定
				</el-button>
				<el-button v-if="!isReadonly && detailMode === 'edit'" type="primary" @click="save" v-hasPermi="['equipment:maintInfo:update']">
					保存
				</el-button>
			</div>
		</template>
	</el-drawer>
	<!-- 查看抽屉 -->
	<el-drawer v-model="viewOpen" title="查看设备维修派工信息" size="70%">
		<ViewComponent ref="viewRef" :maintInfoId="currentViewId" />
	</el-drawer>
	<!-- 派工抽屉 -->
	<el-drawer v-model="dispatchOpen" title="派工" size="70%">
		<DispatchForm ref="dispatchRef" :maintInfoId="currentDispatchId" />
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="dispatchCancel">取消</el-button>
				<el-button type="primary" @click="saveDispatch">
					保存
				</el-button>
			</div>
		</template>
	</el-drawer>

	<!-- 开始维修弹窗 -->
	<el-dialog v-model="startMaintVisible" title="开始维修" width="500px" :close-on-click-modal="false">
		<el-form :model="startMaintForm" label-width="120px">
			<el-form-item label="开始维修时间" required>
				<el-date-picker
					v-model="startMaintForm.maintStartTime"
					type="datetime"
					placeholder="请选择开始维修时间"
					style="width: 100%"
					value-format="YYYY-MM-DD HH:mm:ss"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="startMaintVisible = false">取消</el-button>
				<el-button type="primary" @click="saveStartMaintenance">保存</el-button>
			</div>
		</template>
	</el-dialog>

	<!-- 结束维修抽屉 -->
	<el-drawer v-model="endMaintVisible" title="结束维修" size="80%" >
		<el-form :model="endMaintForm" ref="endMaintFormRef" :rules="endMaintRules" :inline="true" label-position="top">
			<el-collapse v-model="endMaintActiveNames">
				<el-collapse-item title="基本信息" name="baseData">
					<el-row :gutter="24">
						<el-col :span="8">
							<el-form-item label="结束维修时间" prop="maintEndTime" required>
								<el-date-picker
									v-model="endMaintForm.maintEndTime"
									type="datetime"
									placeholder="请选择结束维修时间"
									style="width: 100%"
									value-format="YYYY-MM-DD HH:mm:ss"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="维修反馈说明" prop="maintRemark">
								<el-input
									v-model="endMaintForm.maintRemark"
									type="textarea"
									:autosize="{ minRows: 2, maxRows: 4 }"
									placeholder="请输入维修反馈说明"
									maxlength="2000"
									show-word-limit
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<!-- 维修完成图片 -->
				<el-collapse-item title="维修完成图片" name="images">
					<el-form-item label="维修完成图片">
						<el-upload
							ref="endMaintUploadRef"
							:http-request="handleEndMaintImageUpload"
							list-type="picture-card"
							:file-list="endMaintImageList"
							:on-preview="handlePicturePreview"
							:on-remove="handleEndMaintImageRemove"
							:before-upload="beforeUpload"
							accept="image/*"
						>
							<el-icon><Plus /></el-icon>
						</el-upload>
					</el-form-item>
				</el-collapse-item>


				<!-- 配件更换列表 -->
				<el-collapse-item title="配件更换列表" name="partReplaceList" style='margin-bottom: 10px'>
					<EditTable
						ref="partReplaceTableRef"
						:hasAdd="false"
						:name="'配件更换列表'"
						:tableData="availablePartDetails"
						:tableColumns="partReplaceColumns"
						:tableHeight="400"
						:cellClickEvent="partReplaceCellClickEvent"
						:headerCellClickEvent="partReplaceHeaderCellClickEvent"
						:editRules="partReplaceEditRules"
						:rowConfig="partReplaceRowConfig"
						:checkbox-config="partReplaceCheckboxConfig"
						@checkbox-change="handlePartReplaceCheckboxChange"
						@selectAllChangeEvent="handlePartReplaceSelectAll"
						:disabledKey="'rowDisabled'"
					/>
				</el-collapse-item>

				<el-collapse-item title="作业工时反馈" name="hourFeedbackList" style='margin-bottom: 10px'>
					<div class="hour-feedback-header">
						<el-button type="primary" plain @click="addHourFeedbackRow">新增</el-button>
					</div>
					<EditTable
						ref="hourFeedbackTableRef"
						:hasAdd="false"
						:name="'作业工时反馈'"
						:tableData="hourFeedbackList"
						:tableColumns="hourFeedbackColumns"
						:tableHeight="260"
						:editRules="hourFeedbackEditRules"
						:rowConfig="hourFeedbackRowConfig"
						@chang_date="handleHourFeedbackDateChange"
					/>
				</el-collapse-item>


			</el-collapse>
		</el-form>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="handleEndMaintCancel">取消</el-button>
				<el-button type="primary" @click="saveEndMaintenance">保存</el-button>
			</div>
		</template>
	</el-drawer>

	<!-- 图片预览 -->
	<el-dialog v-model="previewVisible" title="图片预览" width="800px">
		<img :src="previewImageUrl" style="width: 100%" alt="预览图片" />
	</el-dialog>

	<!-- 验收弹窗 -->
	<el-dialog v-model="acceptMaintVisible" title="验收处理" width="600px" :close-on-click-modal="false" @closed="resetAcceptForm">
		<el-form ref="acceptMaintFormRef" :model="acceptMaintForm" :rules="acceptMaintRules" label-width="120px">
			<el-form-item label="验收结果" prop="acceptanceStatus">
				<el-radio-group v-model="acceptMaintForm.acceptanceStatus" @change="handleAcceptStatusChange">
					<el-radio :label="1">通过</el-radio>
					<el-radio :label="2">不通过</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-if="acceptMaintForm.acceptanceStatus === 2" label="退回状态" prop="returnStatus">
				<el-select
					v-model="acceptMaintForm.returnStatus"
					placeholder="请选择退回状态"
					style="width: 100%;"
					clearable
				>
					<el-option
						v-for="item in acceptReturnStatusOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="验收原因" prop="acceptanceRemark">
				<el-input
					v-model="acceptMaintForm.acceptanceRemark"
					type="textarea"
					:rows="4"
					placeholder="请输入验收原因"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="handleAcceptDialogCancel">取消</el-button>
				<el-button type="primary" @click="saveAcceptMaintenance">确定</el-button>
			</div>
		</template>
	</el-dialog>

	<!-- 作废弹窗 -->
	<el-dialog v-model="cancelMaintVisible" title="作废工单" width="600px" :close-on-click-modal="false">
		<el-form :model="cancelMaintForm" label-width="120px">
			<el-form-item label="作废备注">
				<el-input
					v-model="cancelMaintForm.cancelRemark"
					type="textarea"
					:rows="4"
					placeholder="请输入作废备注（可选）"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="cancelMaintVisible = false">取消</el-button>
				<el-button type="primary" @click="saveCancelWorkOrder">确定</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup name="maintInfo">
import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable'
import detail from './detail/index.vue'
import DispatchForm from './dispatch.vue'
import ViewComponent from './view.vue'
import api from '@/api/equipment/maintInfo/index'
import publicApi from '@/api/public/index'
import { ref, reactive, nextTick, h, getCurrentInstance, computed, watch } from 'vue'
import { ElButton, ElTag, ElMessage, ElInputNumber } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const detailRef = ref(null)
const dispatchRef = ref(null)
const viewRef = ref(null)
const total = ref('')
const title = ref('')
const open = ref(false)
const dispatchOpen = ref(false)
const viewOpen = ref(false)
const currentDispatchId = ref(null) // 当前派工的记录ID
const currentViewId = ref(null) // 当前查看的记录ID
const isReadonly = ref(false)
const onlyDispatch = ref(false) // 是否只显示派工信息
const detailMode = ref('add') // 'add' 或 'edit'
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const loading = ref(false)
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50, fixed: 'left' },
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '工单号', prop: 'workOrderNo', align: 'left', width: 200 },
	{ label: '设备小类', prop: 'equipSmallCategoryName', align: 'left', width: 200 },
	{ label: '设备名称', prop: 'equipName', align: 'left', width: 150 },
	{ label: '设备编码', prop: 'equipCode', align: 'left', width: 170 },
	{ label: '使用部门', prop: 'useOrgName', align: 'left', width: 170 },

	{ label: '故障发现时间', prop: 'faultFindTime', align: 'center', width: 180 },
	{
		label: '紧急程度',
		prop: 'emergencyLevel',
		align: 'center',
		width: 100,
		render: row => {
			const levelMap = {
				'0': '常规',
				'1': '紧急',
				'2': '特急'
			}
			const levelText = levelMap[row.emergencyLevel] || row.emergencyLevel
			let tagType = 'info'
			if (row.emergencyLevel === '2') {
				tagType = 'danger'
			} else if (row.emergencyLevel === '1') {
				tagType = 'warning'
			} else {
				tagType = 'info'
			}
			return [
				h(
					ElTag,
					{
						type: tagType,
					},
					{
						default: () => levelText,
					}
				),
			]
		},
	},
	{
		label: '维修类型',
		prop: 'maintTypeName',
		align: 'left',
		width: 120,

	},
	{
		label: '是否停机',
		prop: 'isStopped',
		align: 'center',
		width: 100,
		render: row => {
			const stoppedText = row.isStopped === 1 ? '是' : '否'
			const tagType = row.isStopped === 1 ? 'danger' : 'success'
			return [
				h(
					ElTag,
					{
						type: tagType,
					},
					{
						default: () => stoppedText,
					}
				),
			]
		},
	},
	{ label: '故障描述', prop: 'faultDesc', align: 'left', width: 200 },
	{ label: '报修类型', prop: 'reportTypeName', align: 'left', width: 120 },
  	{ label: '报修时间', prop: 'createTime', align: 'center', width: 180 },
 	{ label: '报修人', prop: 'createByName', align: 'left', width: 120 },
	{ label: '派工类型', prop: 'dispatchTypeName', align: 'left', width: 120 },
	{ label: '派工人', prop: 'dispatcherName', align: 'left', width: 120 },
	{ label: '派工时间', prop: 'dispatchTime', align: 'center', width: 180 },
	{ label: '承修单位', prop: 'maintOrgName', align: 'left', width: 150 },
	{ label: '维修负责人', prop: 'maintLeaderName', align: 'left', width: 120 },
	{ label: '维修开始时间', prop: 'maintStartTime', align: 'center', width: 180 },
	{ label: '维修结束时间', prop: 'maintEndTime', align: 'center', width: 180 },
	{
		label: '维修时长(小时)',
		prop: 'maintDuration',
		align: 'right',
		width: 150,
	},
	{
		label: '故障时长(小时)',
		prop: 'faultDuration',
		align: 'right',
		width: 150,
	},
	{ label: '验收人', prop: 'accepterName', align: 'left', width: 120 },
	{ label: '验收时间', prop: 'acceptanceTime', align: 'center', width: 180 },
	{ label: '验收备注', prop: 'acceptanceRemark', align: 'left', width: 200 },
  { label: '作废人', prop: 'cancelByName', align: 'left', width: 120 },
  { label: '作废时间', prop: 'cancelTime', align: 'center', width: 180 },
  { label: '作废备注', prop: 'cancelRemark', align: 'left', width: 200 },
	{
		label: '状态',
		prop: 'status',
		width: 120,
		fixed: 'right',
		align: 'center',
		render: row => {
			const statusMap = {
				0: '提报',
				1: '已派工',
				2: '维修中',
				4: '维修完成',
				5: '验收通过',
				6: '验收不通过',
				7: '作废'
			}
			const statusText = statusMap[row.status] || '未知'
			let tagType = 'info'
			// 根据状态设置标签颜色
			if (row.status === 0) {
				tagType = 'info' // 提报 - 灰色
			} else if (row.status === 1) {
				tagType = 'warning' // 已派工 - 橙色
			} else if (row.status === 2) {
				tagType = 'primary' // 维修中 - 蓝色
			} else if (row.status === 4) {
				tagType = 'primary' // 维修完成 - 绿色
			} else if (row.status === 5) {
				tagType = 'success' // 验收通过 - 绿色
			} else if (row.status === 6) {
				tagType = 'danger' // 验收不通过 - 红色
			} else if (row.status === 7) {
				tagType = 'danger' // 作废 - 灰色
			}
			return [
				h(
					ElTag,
					{
						type: tagType,
					},
					{
						default: () => statusText,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 270,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = []
			// 派工按钮（只在状态为0-提报时显示）
			if (row.status === 0) {
				buttons.push(
					h(
						ElButton,
						{
							onClick: () => {
								dispatchWork(row)
							},
							type: 'success',
							link: true,
							icon: 'Edit',
							permission: 'equipment:maintInfo:addDis',
						},
						{
							default: () => '派工',
						}
					)
				)
			}
			// 修改按钮（只在提报和已派工状态下显示）
			if (row.status === 0 || row.status === 1) {
				buttons.push(
					h(
						ElButton,
						{
							onClick: () => {
								edit(row)
							},
							type: 'primary',
							link: true,
							icon: 'Edit',
							permission: 'equipment:maintInfo:update',
						},
						{
							default: () => '修改',
						}
					)
				)
			}
			// 查看按钮
			buttons.push(
				h(
					ElButton,
					{
						onClick: () => {
							view(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
						permission: 'equipment:maintInfo:view',
					},
					{
						default: () => '查看',
					}
				)
			)
			// 删除按钮
			buttons.push(
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:maintInfo:delete',
					},
					{
						default: () => '删除',
					}
				)
			)
			return buttons
		},
	},
])

// 搜索条件
const selectData = reactive([
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 8,
	},
	{
		name: '工单号',
		type: 'input',
		modelValue: 'workOrderNo',
		span: 8,
	},
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 8,
    selectData: [
      { label: '提报', value: '0' },
      { label: '已派工', value: 1 },
      { label: '维修中', value: 2 },
      { label: '维修完成', value: 4 },
      { label: '验收通过', value: 5 },
      // { label: '验收不通过', value: 6 },
      { label: '作废', value: 7 },
    ],
  },
	{
		name: '紧急程度',
		type: 'select',
		modelValue: 'emergencyLevel',
		span: 2,
		selectData: [
			{ label: '常规', value: '0' },
			{ label: '紧急', value: '1' },
			{ label: '特急', value: '2' },
		],
	},
	{
		name: '维修类型',
		type: 'select',
		modelValue: 'maintTypeCode',
		span: 2,
		selectData: [
			{ label: '计划维修', value: '1' },
			{ label: '应急维修', value: '2' },
		],
	},
	{
		name: '是否停机',
		type: 'select',
		modelValue: 'isStopped',
		span: 2,
		selectData: [
			{ label: '否', value: 0 },
			{ label: '是', value: 1 },
		],
	},

])

const clickRow = ref({})

// 获取当前选中的行（单选）
const getSelectedRow = () => {
	// 如果复选框选中了多条，不返回任何行
	if (checkboxSelection.value && checkboxSelection.value.length > 1) {
		return null
	}
	// 优先从复选框获取（使用响应式变量）
	// 必须只有一条数据才返回
	if (checkboxSelection.value && checkboxSelection.value.length === 1) {
		const row = checkboxSelection.value[0]
		if (row && row.id) {
			return row
		}
	}
	// 如果复选框没有选中，使用点击的行（但需要确保复选框没有选中多条）
	if (!checkboxSelection.value || checkboxSelection.value.length === 0) {
		if (clickRow.value && clickRow.value.id) {
			return clickRow.value
		}
	}
	return null
}

// 处理开始维修（从按钮点击）
const handleStartMaintenance = () => {
	const selectedRow = getSelectedRow()
	if (!selectedRow) {
		ElMessage.warning('请先选择一条记录')
		return
	}
	if (selectedRow.status !== 1) {
		ElMessage.warning('只有已派工状态的记录才能开始维修')
		return
	}
	startMaintenance(selectedRow)
}

// 结束维修事件（先定义，供 handleEndMaintenance 调用）
const endMaintenance = async row => {
	currentEndMaintRow.value = row
	// 默认当前时间
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	const currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
	let detailData = { ...row }

	try {
		const detailRes = await api.getById(row.id)
		if (detailRes.code === '0000' && detailRes.data) {
			detailData = detailRes.data
		} else {
			ElMessage.warning(detailRes.msg || '未获取到结束维修所需的详情数据')
		}
	} catch (error) {
		console.error('查询结束维修详情失败:', error)
		ElMessage.warning('查询结束维修详情失败，已使用列表数据初始化')
	}

	endMaintForm.value = {
		id: detailData.id || row.id,
		maintStartTime: detailData.maintStartTime || '',
		maintOrgId: detailData.maintOrgId || null,
		maintEndTime: detailData.maintEndTime || currentTime,
		maintRemark: detailData.maintRemark || '',
		faultImageIds: Array.isArray(detailData.faultImageIds) ? [...detailData.faultImageIds] : [],
		partReplaceList: Array.isArray(detailData.partReplaceList) ? [...detailData.partReplaceList] : [],
		hourFeedbackList: Array.isArray(detailData.hourFeedbackList) ? [...detailData.hourFeedbackList] : [],
	}
	partReplaceList.value = Array.isArray(detailData.partReplaceList) ? [...detailData.partReplaceList] : []
	hourFeedbackList.value = (detailData.hourFeedbackList || []).map(item => ({
		...item,
		tempId: item.tempId || `hour-feedback-${Date.now()}-${hourFeedbackRowSeed++}`,
		autoStartTime: false,
		autoEndTime: false,
	}))
	repairUserOptions.value = []
	availablePartDetails.value = []
	await loadEndMaintImages(endMaintForm.value.id)

	await loadRepairUserOptions(endMaintForm.value.maintOrgId)

	// 加载可用的配件明细
	if (detailData.equipId) {
		try {
			const res = await api.getAvailableDetailsByEquipId(detailData.equipId)
			if (res.code === '0000' && res.data) {
				// 直接绑定到可用配件列表，并初始化currentUsedQuantity字段
				const selectedPartMap = new Map(
					(partReplaceList.value || [])
						.filter(item => item && item.warehouseOutDetailId != null)
						.map(item => [item.warehouseOutDetailId, item])
				)
				const checkedRows = []
				availablePartDetails.value = (res.data || []).map(item => ({
					...item,
					currentUsedQuantity: selectedPartMap.has(item.warehouseOutDetailId)
						? Number(selectedPartMap.get(item.warehouseOutDetailId).usedQuantity)
						: null,
				}))
				availablePartDetails.value.forEach(item => {
					if (selectedPartMap.has(item.warehouseOutDetailId)) {
						checkedRows.push(item)
					}
				})
				// 初始化缓存
				currentUsedQuantityCache.value.clear()
				availablePartDetails.value.forEach(item => {
					if (item.warehouseOutDetailId) {
						currentUsedQuantityCache.value.set(item.warehouseOutDetailId, item.currentUsedQuantity)
					}
				})
				nextTick(() => {
					if (partReplaceTableRef.value && typeof partReplaceTableRef.value.setCheckboxRow === 'function') {
						partReplaceTableRef.value.setCheckboxRow(checkedRows, true)
					}
				})
				updatePartReplaceListFromSelected(checkedRows)
			} else {
				availablePartDetails.value = []
				currentUsedQuantityCache.value.clear()
			}
		} catch (error) {
			console.error('加载可用配件明细失败:', error)
			ElMessage.error('加载可用配件明细失败')
			availablePartDetails.value = []
		}
	} else {
		availablePartDetails.value = []
	}

	endMaintVisible.value = true
}

const loadEndMaintImages = async (maintInfoId) => {
	endMaintImageList.value = []
	if (!maintInfoId) {
		return
	}
	try {
		const endRes = await publicApi.getBusFiles({
			businessId: maintInfoId,
			businessType: 'MAINT_INFO_IMAGE_END',
		})
		if (endRes.code !== '0000' || !Array.isArray(endRes.data) || endRes.data.length === 0) {
			return
		}
		const list = await Promise.all(
			endRes.data.map(async item => {
				try {
					const downRes = await publicApi.down(item.id, 'arraybuffer')
					const blob = new Blob([downRes.data], { type: 'image/jpeg' })
					return {
						id: item.id,
						name: item.fileName || `image-${item.id}.jpg`,
						url: window.URL.createObjectURL(blob),
					}
				} catch (error) {
					console.error('加载结束维修图片失败:', error)
					return null
				}
			})
		)
		endMaintImageList.value = list.filter(item => item != null)
		if (!endMaintForm.value.faultImageIds || endMaintForm.value.faultImageIds.length === 0) {
			endMaintForm.value.faultImageIds = endMaintImageList.value.map(item => item.id)
		}
	} catch (error) {
		console.error('查询结束维修图片失败:', error)
	}
}

// 处理结束维修（从按钮点击）
const handleEndMaintenance = () => {
	const selectedRow = getSelectedRow()
	if (!selectedRow) {
		ElMessage.warning('请先选择一条记录')
		return
	}
	if (selectedRow.status !== 2) {
		ElMessage.warning('只有维修中状态的记录才能结束维修')
		return
	}
	endMaintenance(selectedRow)
}

// 按钮列表
const buttonList = reactive([
	{
		label: '故障提报',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:maintInfo:add',
	},
	{
		label: '派工',
		type: 'success',
		icon: 'Edit',
		click: () => dispatch,
		permission: 'equipment:maintInfo:addDis',
	},
	{
		label: '开始维修',
		type: 'warning',
		icon: 'VideoPlay',
		click: () => handleStartMaintenance,
		permission: 'equipment:maintInfo:startMaint',
		vif: computed(() => {
			// 首先检查选中数量，必须只有一条数据
			const selectionCount = checkboxSelection.value ? checkboxSelection.value.length : 0
			if (selectionCount === 0 || selectionCount > 1) {
				return false
			}
			// 只有一条数据时，检查状态
			if (selectionCount === 1) {
				const selectedRow = checkboxSelection.value[0]
				if (selectedRow && selectedRow.id && selectedRow.status === 1) {
					return true
				}
			}
			// 如果没有复选框选中，检查点击的行
			if (selectionCount === 0) {
				const selectedRow = clickRow.value
				if (selectedRow && selectedRow.id && selectedRow.status === 1) {
					return true
				}
			}
			return false
		}),
	},
	{
		label: '结束维修',
		type: 'warning',
		icon: 'VideoPause',
		click: () => handleEndMaintenance,
		permission: 'equipment:maintInfo:endMaint',
		vif: computed(() => {
			// 首先检查选中数量，必须只有一条数据
			const selectionCount = checkboxSelection.value ? checkboxSelection.value.length : 0
			if (selectionCount === 0 || selectionCount > 1) {
				return false
			}
			// 只有一条数据时，检查状态
			if (selectionCount === 1) {
				const selectedRow = checkboxSelection.value[0]
				if (selectedRow && selectedRow.id && selectedRow.status === 2) {
					return true
				}
			}
			// 如果没有复选框选中，检查点击的行
			if (selectionCount === 0) {
				const selectedRow = clickRow.value
				if (selectedRow && selectedRow.id && selectedRow.status === 2) {
					return true
				}
			}
			return false
		}),
	},
	{
		label: '验收',
		type: 'warning',
		icon: 'Check',
		click: () => handleAcceptMaintenance,
		permission: 'equipment:maintInfo:accept',
		vif: computed(() => {
			// 确保只选中一条数据
			const selectionCount = checkboxSelection.value ? checkboxSelection.value.length : 0
			if (selectionCount === 0 || selectionCount > 1) {
				return false
			}
			// 只有一条数据时，检查状态
			if (selectionCount === 1) {
				const selectedRow = checkboxSelection.value[0]
				if (selectedRow && selectedRow.id && selectedRow.status === 4) {
					return true
				}
			}
			// 如果没有复选框选中，检查点击的行
			if (selectionCount === 0) {
				const selectedRow = clickRow.value
				if (selectedRow && selectedRow.id && selectedRow.status === 4) {
					return true
				}
			}
			return false
		}),
	},
	{
		label: '作废',
		type: 'danger',
		icon: 'Delete',
		click: () => cancelWorkOrder,
		permission: 'equipment:maintInfo:cancel',
	},
	// {
	// 	label: '批量删除',
	// 	type: 'danger',
	// 	icon: 'Delete',
	// 	click: () => handleBatchDelete,
	// 	permission: 'equipment:maintInfo:delete',
	// },
])

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: false, // 开启复选框范围选择功能
}

// 复选框选中状态（用于触发computed更新）
const checkboxSelection = ref([])

// 复选框改变事件
const checkboxChange = data => {
	// 确保 data 是数组格式
	const selectedRows = Array.isArray(data) ? data : (data ? [data] : [])

	// 立即更新选中状态，触发computed重新计算
	checkboxSelection.value = selectedRows
	// 注意：允许用户勾选多条数据（用于批量作废等操作），维修按钮会根据选中数量自动显示/隐藏
}

// 点击查询的事件
const getList = e => {
	loading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
		checkboxSelection.value = []
	})
}

// 新增事件（只录入基本信息，状态为0-提报）
const add = () => {
	open.value = true
	title.value = '新增设备维修派工信息'
	detailMode.value = 'add'
	isReadonly.value = false
	nextTick(() => {
		detailRef.value.resetForm()
		// 设置报修类型为提报
		detailRef.value.formData.reportTypeCode = '1'
		detailRef.value.formData.reportTypeName = '提报'
		// 设置模式为新增（只显示基本信息）
		detailRef.value.setMode('add')
	})
}

// 派工事件（录入全部信息，状态为1-已派工）
const dispatch = () => {
	open.value = true
	title.value = '派工设备维修派工信息'
	detailMode.value = 'add'
	isReadonly.value = false
	nextTick(() => {
		detailRef.value.resetForm()
		// 设置报修类型为派工
		detailRef.value.formData.reportTypeCode = '2'
		detailRef.value.formData.reportTypeName = '派工'
		// 设置模式为派工（显示全部信息）
		detailRef.value.setMode('dispatch')
	})
}

// 作废相关
const cancelMaintVisible = ref(false)
const cancelMaintForm = ref({
	ids: [],
	cancelRemark: '',
})

// 作废事件
const cancelWorkOrder = () => {
	// 先检查是否有选中的记录
	const selectedRows = baseTable.value?.getSelectionRows() || []
	if (!selectedRows || selectedRows.length === 0) {
		proxy.$message.warning('请先选择要作废的记录')
		return
	}

	// 打开作废弹窗
	cancelMaintForm.value = {
		ids: selectedRows.map(row => row.id),
		cancelRemark: '',
	}
	cancelMaintVisible.value = true
}

// 保存作废
const saveCancelWorkOrder = () => {
	api.cancelWorkOrder(cancelMaintForm.value).then(res => {
		if (res.code == '0000') {
			proxy.$message.success(res.msg || '作废成功')
			cancelMaintVisible.value = false
			// 重置表单
			cancelMaintForm.value = {
				ids: [],
				cancelRemark: '',
			}
			// 刷新列表
			getList(queryParams.value)
		} else {
			proxy.$message.error(res.msg)
		}
	}).catch(err => {
		proxy.$message.error('作废失败：' + (err.message || '未知错误'))
	})
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value
	open.value = true
	title.value = '修改设备维修派工信息'
	detailMode.value = 'edit'
	isReadonly.value = false
	nextTick(() => {
		// 先重置表单
		detailRef.value.resetForm()
		// 然后加载数据
		api.getById(editRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 逐个赋值，确保响应式更新
				Object.keys(msg).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = msg[key]
					}
				})
				// 如果 maintTypeName 为空，根据 maintTypeCode 设置
				if (!detailRef.value.formData.maintTypeName && detailRef.value.formData.maintTypeCode) {
					const typeMap = {
						'1': '计划维修',
						'2': '应急维修'
					}
					detailRef.value.formData.maintTypeName = typeMap[detailRef.value.formData.maintTypeCode] || ''
				}
				// 如果 reportTypeName 为空，根据 reportTypeCode 设置
				if (!detailRef.value.formData.reportTypeName && detailRef.value.formData.reportTypeCode) {
					const typeMap = {
						'1': '提报',
						'2': '派工',
						'3': '点检',
						'4': '润滑'
					}
					detailRef.value.formData.reportTypeName = typeMap[detailRef.value.formData.reportTypeCode] || ''
				}
				// 如果有承修单位，加载对应的用户列表
				if (detailRef.value.formData.maintOrgId) {
					nextTick(() => {
						detailRef.value.loadUserList(detailRef.value.formData.maintOrgId)
					})
				}
				// 根据status设置模式（如果有status且为1，则显示派工信息）
				if (detailRef.value.formData.status === 1) {
					detailRef.value.setMode('dispatch')
				} else {
					detailRef.value.setMode('add')
				}
				// 加载图片（延迟一下，确保数据已赋值）
				nextTick(() => {
					detailRef.value.loadImages()
				})
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 查看事件
const view = row => {
	const viewRow = row || clickRow.value
	currentViewId.value = viewRow.id
	viewOpen.value = true
	nextTick(() => {
		// 先重置表单
		viewRef.value.resetForm()
		// 然后加载数据
		api.getById(viewRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 如果 maintTypeName 为空，根据 maintTypeCode 设置
				if (!msg.maintTypeName && msg.maintTypeCode) {
					const typeMap = {
						'1': '计划维修',
						'2': '应急维修'
					}
					msg.maintTypeName = typeMap[msg.maintTypeCode] || ''
				}
				// 如果 reportTypeName 为空，根据 reportTypeCode 设置
				if (!msg.reportTypeName && msg.reportTypeCode) {
					const typeMap = {
						'1': '提报',
						'2': '派工',
						'3': '点检',
						'4': '润滑'
					}
					msg.reportTypeName = typeMap[msg.reportTypeCode] || ''
				}
				// 加载数据到查看组件
				viewRef.value.loadData(msg)
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 派工事件（只显示派工信息）
const dispatchWork = row => {
	const dispatchRow = row || clickRow.value
	currentDispatchId.value = dispatchRow.id
	dispatchOpen.value = true
	nextTick(() => {
		// 加载数据
		api.getById(dispatchRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 加载派工数据
				dispatchRef.value.loadData(msg)
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 派工取消
const dispatchCancel = () => {
	dispatchOpen.value = false
	currentDispatchId.value = null
	if (dispatchRef.value) {
		dispatchRef.value.resetForm()
	}
}

// 保存派工
const saveDispatch = async () => {
	if (await dispatchRef.value.validate()) {
		proxy.$modal.confirm('确定保存派工信息?').then(() => {
			// 深拷贝表单数据
			const submitData = JSON.parse(JSON.stringify(dispatchRef.value.formData))
			// 只传递派工相关字段和ID
			const dispatchData = {
				id: submitData.id,
				dispatchTypeCode: submitData.dispatchTypeCode,
				dispatchTypeName: submitData.dispatchTypeName,
				mantAppNumber: submitData.mantAppNumber,
				maintOrgId: submitData.maintOrgId,
				maintOrgName: submitData.maintOrgName,
				maintLeaderId: submitData.maintLeaderId,
				maintLeaderName: submitData.maintLeaderName,
				maintLeaderMobile: submitData.maintLeaderMobile,
				isSpecialJob: submitData.isSpecialJob,
				specialJobCode: submitData.specialJobCode,
				specialJobName: submitData.specialJobName,
				itemList: (submitData.itemList || []).map(item => ({
					equipSmallCategoryId: item.equipSmallCategoryId,
					equipSmallCategoryName: item.equipSmallCategoryName,
					equipInstitutionId: item.equipInstitutionId,
					equipInstitutionName: item.equipInstitutionName,
					equipUnitId: item.equipUnitId,
					equipUnitName: item.equipUnitName,
					sortOrder: item.sortOrder,
				})),
				status: 1, // 派工后状态改为1-已派工
			}
			api.updateDispatch(dispatchData).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					dispatchOpen.value = false
					currentDispatchId.value = null
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
	}
}

// 派工保存成功回调
const handleDispatchSaved = () => {
	getList(queryParams.value)
	dispatchOpen.value = false
}

// 开始维修相关
const startMaintVisible = ref(false)
const startMaintForm = ref({
	id: null,
	maintStartTime: '',
})
const currentStartMaintRow = ref(null)

// 开始维修事件
const startMaintenance = row => {
	currentStartMaintRow.value = row
	// 默认当前时间
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	const currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

	startMaintForm.value = {
		id: row.id,
		maintStartTime: currentTime,
	}
	startMaintVisible.value = true
}

// 保存开始维修
const saveStartMaintenance = () => {
	if (!startMaintForm.value.maintStartTime) {
		ElMessage.warning('请选择开始维修时间')
		return
	}
	api.startMaintenance(startMaintForm.value).then(res => {
		if (res.code == '0000') {
			ElMessage.success(res.msg || '开始维修成功')
			startMaintVisible.value = false
			// 重置表单
			startMaintForm.value = {
				id: null,
				maintStartTime: '',
			}
			currentStartMaintRow.value = null
			// 刷新列表
			getList(queryParams.value)
		} else {
			ElMessage.error(res.msg)
		}
	}).catch(err => {
		ElMessage.error('开始维修失败：' + (err.message || '未知错误'))
	})
}

// 结束维修相关
const endMaintVisible = ref(false)
const endMaintFormRef = ref(null)
const endMaintActiveNames = ref(['baseData', 'partReplaceList', 'hourFeedbackList', 'images'])
const endMaintForm = ref({
	id: null,
	maintStartTime: '',
	maintOrgId: null,
	maintEndTime: '',
	maintRemark: '',
	faultImageIds: [],
	partReplaceList: [],
	hourFeedbackList: [],
})
const endMaintImageList = ref([])
const endMaintUploadRef = ref(null)
const currentEndMaintRow = ref(null)

// 结束维修表单验证规则
const endMaintRules = reactive({
	maintEndTime: proxy.getRules({ required: true }),
})
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 配件更换相关
const partReplaceTableRef = ref(null)
const partReplaceList = ref([]) // 用于提交的配件更换列表（勾选后存入）
const availablePartDetails = ref([]) // 可用的配件明细列表（显示在表格中）
const partReplaceRowConfig = { isCurrent: true, isHover: true, keyField: 'warehouseOutDetailId' }
const hourFeedbackTableRef = ref(null)
const hourFeedbackList = ref([])
const repairUserOptions = ref([])
const hourFeedbackRowConfig = { isCurrent: true, isHover: true, keyField: 'tempId' }
let hourFeedbackRowSeed = 0

// 用于跟踪 currentUsedQuantity 的旧值
const currentUsedQuantityCache = ref(new Map())

// 监听 availablePartDetails 中 currentUsedQuantity 的变化
watch(
	() => availablePartDetails.value.map(item => ({
		id: item.warehouseOutDetailId,
		value: item.currentUsedQuantity
	})),
	(newValues) => {
		newValues.forEach(({ id, value }) => {
			if (id) {
				const oldValue = currentUsedQuantityCache.value.get(id)
				if (oldValue !== undefined && oldValue !== value) {
					// 找到对应的行数据
					const row = availablePartDetails.value.find(item => item.warehouseOutDetailId === id)
					if (row) {
						handleCurrentUsedQuantityChange(value, row)
					}
				}
				// 更新缓存
				currentUsedQuantityCache.value.set(id, value)
			}
		})
	},
	{ deep: true }
)

watch(
	() => endMaintForm.value.maintEndTime,
	(newVal, oldVal) => {
		const newTime = normalizeDateTimeToMinute(newVal)
		const oldTime = normalizeDateTimeToMinute(oldVal)
		hourFeedbackList.value.forEach(row => {
			if (row.autoEndTime || !row.endTime || row.endTime === oldTime) {
				row.endTime = newTime
				row.autoEndTime = true
			}
			updateHourFeedbackRowWorkHour(row)
		})
	},
)

watch(
	() => endMaintForm.value.maintStartTime,
	(newVal, oldVal) => {
		const newTime = normalizeDateTimeToMinute(newVal)
		const oldTime = normalizeDateTimeToMinute(oldVal)
		hourFeedbackList.value.forEach(row => {
			if (row.autoStartTime || !row.startTime || row.startTime === oldTime) {
				row.startTime = newTime
				row.autoStartTime = true
			}
			updateHourFeedbackRowWorkHour(row)
		})
	},
)

watch(
	() => hourFeedbackList.value.map(item => `${item.tempId}|${item.startTime}|${item.endTime}`),
	() => {
		hourFeedbackList.value.forEach(row => {
			updateHourFeedbackRowWorkHour(row)
		})
	},
	{ deep: true }
)

// 配件更换复选框配置
const partReplaceCheckboxConfig = {
	highlight: true,
	strict: false,
	reserve: false,
	showHeader: true,
	checkAll: false,
	range: true,
	visibleMethod: ({}) => {
		return true
	},
	checkMethod: ({ row }) => {
		// 只允许选择未使用数量大于0的记录
		return row.unusedQuantity != null && Number(row.unusedQuantity) > 0
	},
}

// 配件更换表格列（可编辑，带复选框）
const partReplaceColumns = reactive([
	{ label: '', type: 'checkbox', width: 50 },
	{
		label: '出库单号',
		prop: 'warehouseOutNo',
    width: 170,
	},
	{
		label: '物资名称',
		prop: 'materialName',
		width: 270,
	},
	{
		label: '规格型号',
		prop: 'specificationModel',
		width: 200,
	},
	{
		label: '计量单位',
		prop: 'unitName',
		width: 115,
	},
	{
		label: '出库数量',
		prop: 'applicationQuantity',
	  minWidth: 120,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '已使用数量',
		prop: 'usedQuantity',
	  minWidth: 120,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '未使用数量',
		prop: 'unusedQuantity',
	  minWidth: 120,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '本次使用数量',
		prop: 'currentUsedQuantity',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		minWidth: 120,
		align: 'right',
		change: (value, row) => {
			handleCurrentUsedQuantityChange(value, row)
		},
	},
])

// 配件更换编辑验证规则
const partReplaceEditRules = ref({
	currentUsedQuantity: proxy.getRules({
		required: false,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
})

const normalizeDateTimeToMinute = (value) => {
	if (!value) return ''
	const normalized = String(value).replace('T', ' ')
	return normalized.length >= 16 ? normalized.slice(0, 16) : normalized
}

const parseDateTimeValue = (value) => {
	if (!value) return null
	const normalized = String(value).replace('T', ' ').trim()
	const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/)
	if (!match) {
		const parsed = new Date(normalized.replace(' ', 'T'))
		return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
	}
	const [, year, month, day, hour, minute, second = '00'] = match
	return new Date(
		Number(year),
		Number(month) - 1,
		Number(day),
		Number(hour),
		Number(minute),
		Number(second)
	).getTime()
}

const calculateWorkHour = (startTime, endTime) => {
	if (!startTime || !endTime) return null
	const start = parseDateTimeValue(startTime)
	const end = parseDateTimeValue(endTime)
	if (start == null || end == null || end < start) {
		return null
	}
	return Number(((end - start) / 3600000).toFixed(1))
}

const updateHourFeedbackRowWorkHour = (row) => {
	row.workHour = calculateWorkHour(row.startTime, row.endTime)
}

const loadRepairUserOptions = async (maintOrgId) => {
	repairUserOptions.value = []
	if (!maintOrgId) {
		return
	}

	try {
		const res = await api.getRepairUserListByMaintOrgId(maintOrgId)
		if (res.code === '0000') {
			repairUserOptions.value = (res.data || []).map(item => ({
				value: item.repairId,
				label: item.repairName,
			}))
			return
		}
		ElMessage.error(res.msg || '加载维修人员失败')
	} catch (error) {
		console.error('加载维修人员失败:', error)
		ElMessage.error('加载维修人员失败')
	}
}

const createHourFeedbackRow = () => {
	const startTime = normalizeDateTimeToMinute(endMaintForm.value.maintStartTime)
	const endTime = normalizeDateTimeToMinute(endMaintForm.value.maintEndTime)
	const row = {
		tempId: `hour-feedback-${Date.now()}-${hourFeedbackRowSeed++}`,
		maintUserId: null,
		maintUserName: '',
		startTime,
		endTime,
		workHour: calculateWorkHour(startTime, endTime),
		workContent: '',
		remark: '',
		autoStartTime: true,
		autoEndTime: true,
	}
	return row
}

const addHourFeedbackRow = () => {
	hourFeedbackList.value.push(createHourFeedbackRow())
}

const removeHourFeedbackRow = (row) => {
	hourFeedbackList.value = hourFeedbackList.value.filter(item => item.tempId !== row.tempId)
}

const hourFeedbackColumns = reactive([
	{
		label: '维修人员',
		prop: 'maintUserId',
		modelLabel: 'maintUserName',
		editType: 'select',
		editRender: {},
		selectData: repairUserOptions,
		selectLabel: 'label',
		selectValue: 'value',
		width: 150,
	},
	{
		label: '开始时间',
		prop: 'startTime',
		editType: 'datetime',
		editRender: {},
		width: 180,
	},
	{
		label: '结束时间',
		prop: 'endTime',
		editType: 'datetime',
		editRender: {},
		width: 180,
	},
	{
		label: '工时(小时)',
		prop: 'workHour',
		width: 110,
		align: 'right',
		render: row => [
			h('span', {}, row.workHour == null ? '' : Number(row.workHour).toFixed(1)),
		],
	},
	{
		label: '工作内容',
		prop: 'workContent',
		editType: 'textarea',
		editRender: {},
		minWidth: 220,
	},
	{
		label: '备注',
		prop: 'remark',
		editType: 'textarea',
		editRender: {},
		minWidth: 180,
	},
	{
		prop: 'operate',
		label: '操作',
		width: 90,
		align: 'center',
		fixed: 'right',
		render: row => [
			h(
				ElButton,
				{
					type: 'danger',
					link: true,
					onClick: () => removeHourFeedbackRow(row),
				},
				{
					default: () => '删除',
				}
			),
		],
	},
])

const hourFeedbackEditRules = ref({
	maintUserId: proxy.getRules({ required: true }),
	startTime: proxy.getRules({ required: true }),
	endTime: proxy.getRules({ required: true }),
})

const handleHourFeedbackDateChange = (row) => {
	row.autoStartTime = false
	row.autoEndTime = false
	updateHourFeedbackRowWorkHour(row)
}

// 配件更换单元格点击事件
const partReplaceCellClickEvent = (event) => {
	// 当编辑完成时（点击其他单元格或失去焦点），检查是否是 currentUsedQuantity 字段
	if (event.column && event.column.field === 'currentUsedQuantity' && event.row) {
		const row = event.row
		const value = row.currentUsedQuantity
		// 使用 nextTick 确保值已经更新
		nextTick(() => {
			if (value != null && value !== undefined) {
				handleCurrentUsedQuantityChange(value, row)
			}
		})
	}
}

// 配件更换表头点击事件
const partReplaceHeaderCellClickEvent = even => {}

// 配件更换复选框变化处理
const handlePartReplaceCheckboxChange = (selectedRows) => {
	if (Array.isArray(selectedRows)) {
		// selectedRows就是本行数据，直接使用
		updatePartReplaceListFromSelected(selectedRows)
	}
}

// 配件更换全选变化处理
const handlePartReplaceSelectAll = (selectedRows) => {
	if (Array.isArray(selectedRows)) {
		// selectedRows就是本行数据，直接使用
		updatePartReplaceListFromSelected(selectedRows)
	}
}

// 根据选中的配件更新partReplaceList（用于提交）
const updatePartReplaceListFromSelected = (selectedRows) => {
	// 直接将selectedRows转换为partReplaceList格式并存入
	// 取消勾选时会自动从selectedRows中移除，所以这里直接替换整个列表即可
	partReplaceList.value = (selectedRows || []).map(selectedPart => {
		const currentUsedQty = selectedPart.currentUsedQuantity != null ? Number(selectedPart.currentUsedQuantity) : null
		return {
			id: null,
			warehouseOutNo: selectedPart.warehouseOutNo,
			warehouseOutDetailId: selectedPart.warehouseOutDetailId,
			materialId: selectedPart.materialId,
			materialName: selectedPart.materialName,
			specificationModel: selectedPart.specificationModel,
			unitCode: selectedPart.unitCode,
			unitName: selectedPart.unitName,
			applicationQuantity: selectedPart.applicationQuantity,
			// 使用currentUsedQuantity字段的值
			usedQuantity: currentUsedQty,
		}
	}).filter(item => item.warehouseOutDetailId != null)
}

// 本次使用数量变化处理
const handleCurrentUsedQuantityChange = (value, row) => {
	// 更新行数据中的currentUsedQuantity（确保数据源中的数据被更新）
	row.currentUsedQuantity = value != null ? (typeof value === 'number' ? value : Number(value)) : null

	if (value != null && row.unusedQuantity != null) {
		const currentUsedQty = Number(value)
		const unusedQty = Number(row.unusedQuantity || 0)
		if (!isNaN(currentUsedQty) && !isNaN(unusedQty) && currentUsedQty > unusedQty) {
			ElMessage.warning(`本次使用数量不能大于未使用数量（未使用数量：${unusedQty}）`)
			row.currentUsedQuantity = unusedQty
			return
		}
	}

	// 更新partReplaceList中对应记录的usedQuantity
	if (row.warehouseOutDetailId) {
		const existingItem = partReplaceList.value.find(item => item.warehouseOutDetailId === row.warehouseOutDetailId)
		if (existingItem) {
			existingItem.usedQuantity = value != null ? Number(value) : null
		}
	}
}

// 图片上传前验证
const beforeUpload = file => {
	const isImage = file.type.startsWith('image/')
	const isLt10M = file.size / 1024 / 1024 < 10

	if (!isImage) {
		ElMessage.error('只能上传图片文件!')
		return false
	}
	if (!isLt10M) {
		ElMessage.error('图片大小不能超过 10MB!')
		return false
	}
	return true
}

// 自定义图片上传
const handleEndMaintImageUpload = file => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'MAINT_INFO_IMAGE_END')

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage.success('图片上传成功')
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 添加到ID列表
				if (!endMaintForm.value.faultImageIds) {
					endMaintForm.value.faultImageIds = []
				}
				endMaintForm.value.faultImageIds.push(uploadedFile.id)
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				endMaintImageList.value.push({
					id: uploadedFile.id,
					name: uploadedFile.fileName,
					url: previewUrl,
					raw: file.file,
					response: {
						code: '0000',
						data: uploadedFile.id,
					},
				})
			}
		} else {
			ElMessage.error(response.msg || '图片上传失败')
		}
	}).catch(error => {
		ElMessage.error('图片上传失败')
	})
}

// 移除图片
const handleEndMaintImageRemove = (file, fileList) => {
	if (file.id) {
		// 从ID列表中移除
		if (endMaintForm.value.faultImageIds) {
			const index = endMaintForm.value.faultImageIds.indexOf(file.id)
			if (index > -1) {
				endMaintForm.value.faultImageIds.splice(index, 1)
			}
		}
		// 从文件列表中移除
		const fileIndex = endMaintImageList.value.findIndex(item => item.id === file.id)
		if (fileIndex > -1) {
			endMaintImageList.value.splice(fileIndex, 1)
		}
	}
}

// 图片预览
const handlePicturePreview = file => {
	if (file.url) {
		previewImageUrl.value = file.url
		previewVisible.value = true
	} else if (file.id) {
		// 如果只有文件ID，需要下载后预览
		publicApi.down(file.id, 'arraybuffer').then(res => {
			const blob = new Blob([res.data], {
				type: 'image/jpeg',
			})
			const url = window.URL.createObjectURL(blob)
			previewImageUrl.value = url
			previewVisible.value = true
		})
	}
}

// 取消结束维修
const handleEndMaintCancel = () => {
	endMaintVisible.value = false
	// 清空数据
	endMaintForm.value = {
		id: null,
		maintStartTime: '',
		maintOrgId: null,
		maintEndTime: '',
		maintRemark: '',
		faultImageIds: [],
		partReplaceList: [],
		hourFeedbackList: [],
	}
	endMaintImageList.value = []
	partReplaceList.value = []
	hourFeedbackList.value = []
	repairUserOptions.value = []
	availablePartDetails.value = []
	currentEndMaintRow.value = null
	// 清空表格的选中状态
	if (partReplaceTableRef.value) {
		partReplaceTableRef.value.clearCheckboxRow()
	}
}

// 保存结束维修
const saveEndMaintenance = async () => {
	if (!endMaintForm.value.maintEndTime) {
		ElMessage.warning('请选择结束维修时间')
		return
	}

	if (hourFeedbackList.value.length > 0 && hourFeedbackTableRef.value) {
		const validHourFeedback = await hourFeedbackTableRef.value.validAllEvent()
		if (!validHourFeedback) {
			return
		}
	}

	// 如果有勾选的配件，校验本次使用数量
	if (partReplaceList.value && partReplaceList.value.length > 0) {
		// 校验：勾选的配件必须都填写了本次使用数量
		const invalidRows = []
		partReplaceList.value.forEach(row => {
			const usedQty = row.usedQuantity
			// 检查是否为空、null、undefined、空字符串
			if (usedQty == null || usedQty === '' || usedQty === undefined) {
				invalidRows.push({
					...row,
					errorType: 'missing'
				})
				return
			}
			// 转换为数字并检查
			const numValue = Number(usedQty)
			if (isNaN(numValue) || numValue <= 0) {
				invalidRows.push({
					...row,
					errorType: 'invalid'
				})
				return
			}
		})

		if (invalidRows.length > 0) {
			const missingRows = invalidRows.filter(row => row.errorType === 'missing')
			const invalidValueRows = invalidRows.filter(row => row.errorType === 'invalid')

			if (missingRows.length > 0) {
				ElMessage.warning('勾选的配件必须填写本次使用数量')
				missingRows.forEach(row => {
					if (row.warehouseOutNo) {
						console.warn(`配件 ${row.warehouseOutNo} - ${row.materialName} 未填写本次使用数量`)
					}
				})
			} else if (invalidValueRows.length > 0) {
				ElMessage.warning('本次使用数量必须大于0')
			}
			return
		}
	}

	// 验证配件更换列表（只验证勾选的）
	const validPartReplaceList = partReplaceList.value.filter(item =>
		item.warehouseOutNo && item.warehouseOutDetailId && item.usedQuantity != null && item.usedQuantity > 0
	)

	const validHourFeedbackList = hourFeedbackList.value.map(item => {
		const workHour = calculateWorkHour(item.startTime, item.endTime)
		return {
			...item,
			workHour,
		}
	})
	hourFeedbackList.value = validHourFeedbackList

	const invalidHourFeedbackRow = validHourFeedbackList.find(item =>
		!item.maintUserId || !item.maintUserName || !item.startTime || !item.endTime || item.workHour == null || item.workHour < 0
	)

	if (invalidHourFeedbackRow) {
		ElMessage.warning('请完善作业工时反馈信息')
		return
	}

	// 准备提交数据
	const submitData = {
		...endMaintForm.value,
		partReplaceList: validPartReplaceList.map(item => ({
			warehouseOutNo: item.warehouseOutNo,
			warehouseOutDetailId: item.warehouseOutDetailId,
			materialId: item.materialId,
			materialName: item.materialName,
			specificationModel: item.specificationModel,
			unitCode: item.unitCode,
			unitName: item.unitName,
			applicationQuantity: item.applicationQuantity,
			usedQuantity: item.usedQuantity,
		})),
		hourFeedbackList: validHourFeedbackList.map(item => ({
			id: item.id || null,
			maintInfoId: endMaintForm.value.id,
			maintUserId: item.maintUserId,
			maintUserName: item.maintUserName,
			startTime: item.startTime,
			endTime: item.endTime,
			workHour: item.workHour,
			workContent: item.workContent,
			remark: item.remark,
		})),
	}

	api.endMaintenance(submitData).then(res => {
		if (res.code == '0000') {
			ElMessage.success(res.msg || '结束维修成功')
			endMaintVisible.value = false
			// 重置表单
			endMaintForm.value = {
				id: null,
				maintStartTime: '',
				maintOrgId: null,
				maintEndTime: '',
				maintRemark: '',
				faultImageIds: [],
				partReplaceList: [],
				hourFeedbackList: [],
			}
			endMaintImageList.value = []
			partReplaceList.value = []
			hourFeedbackList.value = []
			repairUserOptions.value = []
			availablePartDetails.value = []
			currentEndMaintRow.value = null
			// 清空表格的选中状态
			if (partReplaceTableRef.value) {
				partReplaceTableRef.value.clearCheckboxRow()
			}
			// 刷新列表
			getList(queryParams.value)
		} else {
			ElMessage.error(res.msg)
		}
	}).catch(err => {
		ElMessage.error('结束维修失败：' + (err.message || '未知错误'))
	})
}

// 验收相关
const acceptMaintVisible = ref(false)
const acceptMaintFormRef = ref(null)
const acceptMaintForm = ref({
	id: null,
	acceptanceStatus: 1,
	returnStatus: null,
	acceptanceRemark: '',
})
const acceptReturnStatusOptions = [
	{ label: '提报', value: 0 },
	{ label: '已派工', value: 1 },
	{ label: '维修中', value: 2 },
]
const acceptMaintRules = {
	acceptanceStatus: [{ required: true, message: '请选择验收结果', trigger: 'change' }],
	returnStatus: [{
		validator: (_rule, value, callback) => {
			if (acceptMaintForm.value.acceptanceStatus === 2 && (value == null || value === '')) {
				callback(new Error('请选择退回状态'))
				return
			}
			callback()
		},
		trigger: 'change'
	}],
	acceptanceRemark: [{ required: true, message: '请输入验收原因', trigger: 'blur' }],
}

const resetAcceptForm = () => {
	acceptMaintForm.value = {
		id: null,
		acceptanceStatus: 1,
		returnStatus: null,
		acceptanceRemark: '',
	}
	if (acceptMaintFormRef.value) {
		acceptMaintFormRef.value.clearValidate()
	}
}

const handleAcceptDialogCancel = () => {
	acceptMaintVisible.value = false
}

const handleAcceptStatusChange = value => {
	if (value === 1) {
		acceptMaintForm.value.returnStatus = null
	}
	if (acceptMaintFormRef.value) {
		acceptMaintFormRef.value.clearValidate(['returnStatus'])
	}
}

// 处理验收（从按钮点击）
const handleAcceptMaintenance = () => {
	const selectedRow = getSelectedRow()
	if (!selectedRow) {
		ElMessage.warning('请先选择一条记录')
		return
	}
	if (selectedRow.status !== 4) {
		ElMessage.warning('只有维修完成状态的记录才能验收')
		return
	}

	// 打开验收弹窗
	acceptMaintForm.value = {
		id: selectedRow.id,
		acceptanceStatus: 1,
		returnStatus: null,
		acceptanceRemark: '',
	}
	acceptMaintVisible.value = true
	nextTick(() => {
		if (acceptMaintFormRef.value) {
			acceptMaintFormRef.value.clearValidate()
		}
	})
}

// 保存验收
const saveAcceptMaintenance = async () => {
	if (!acceptMaintFormRef.value) {
		return
	}
	try {
		await acceptMaintFormRef.value.validate()
	} catch (error) {
		return
	}

	const submitData = {
		id: acceptMaintForm.value.id,
		status: acceptMaintForm.value.acceptanceStatus === 1 ? 5 : acceptMaintForm.value.returnStatus,
		isAccepted: acceptMaintForm.value.acceptanceStatus === 1 ? 1 : 0,
		acceptanceRemark: acceptMaintForm.value.acceptanceRemark,
		returnStatus: acceptMaintForm.value.acceptanceStatus === 2 ? acceptMaintForm.value.returnStatus : null,
	}

	api.acceptMaintenance(submitData).then(res => {
		if (res.code == '0000') {
			ElMessage.success(res.msg || '验收成功')
			acceptMaintVisible.value = false
			resetAcceptForm()
			// 刷新列表
			getList(queryParams.value)
		} else {
			ElMessage.error(res.msg)
		}
	}).catch(err => {
		ElMessage.error('验收失败：' + (err.message || '未知错误'))
	})
}

// 批量删除
const handleBatchDelete = () => {
	// 获取选中的行
	const selectedRows = baseTable.value?.getSelectionRows() || []
	if (!selectedRows || selectedRows.length === 0) {
		ElMessage.warning('请先选择要删除的记录')
		return
	}

	proxy.$modal.confirm('确定要删除选中的 ' + selectedRows.length + ' 条记录吗？').then(() => {
		// 批量删除
		const ids = selectedRows.map(row => row.id)
		api.deleteBatch(ids).then(res => {
			if (res.code == '0000') {
				ElMessage.success(res.msg || '批量删除成功')
				// 刷新列表
				getList(queryParams.value)
			} else {
				ElMessage.error(res.msg)
			}
		}).catch(err => {
			ElMessage.error('批量删除失败：' + (err.message || '未知错误'))
		})
	}).catch(() => {})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(() => {})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(() => {
			// 深拷贝表单数据
			const submitData = JSON.parse(JSON.stringify(detailRef.value.formData))

			if (title.value == '修改设备维修派工信息') {
				api.update(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			} else {
				delete submitData.id
				// 根据表单数据中的status判断模式（status已经在setMode中设置）
				if (submitData.status === 1) {
					// 派工模式：状态为1（已派工），派工人和派工时间由后端自动填充
					delete submitData.dispatcherId
					delete submitData.dispatcherName
					delete submitData.dispatchTime
				} else {
					// 新增模式：状态为0（提报），不传派工相关字段
					submitData.status = 0
					delete submitData.dispatcherId
					delete submitData.dispatcherName
					delete submitData.dispatchTime
					delete submitData.dispatchTypeCode
					delete submitData.dispatchTypeName
					delete submitData.maintOrgId
					delete submitData.maintOrgName
					delete submitData.maintLeaderId
					delete submitData.maintLeaderName
				}
				api.add(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			}
		})
	}
}

// 取消事件
const cancel = () => {
	open.value = false
}

// 处理详情页保存成功事件
const handleDetailSaved = () => {
	// 刷新列表
	getList(queryParams.value)
	// 关闭抽屉
	open.value = false
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	// 更新复选框选中状态
	checkboxSelection.value = [row]
	// 点击行时，清除复选框选中，只选中当前行
	baseTable.value?.clearCheckboxRow()
	nextTick(() => {
		baseTable.value?.setCheckboxRow([row], true)
	})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.hour-feedback-header {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 12px;
}
</style>

