<template>
	<div class="app-container equipment-change-apply">
		<el-card shadow="never" class="search-card">
			<el-form :model="searchForm" :inline="true">
				<!-- 申请单号 -->
				<el-form-item>
					<el-input
						v-model="searchForm.code"
						:placeholder="activeTab === 'allocate' ? '申请单号' : '申请单号'"
						clearable
						style="width: 150px"
					/>
				</el-form-item>
				<!-- 标题 -->
				<el-form-item>
					<el-input v-model="searchForm.title" placeholder="标题" clearable style="width: 150px" />
				</el-form-item>
				<!-- 单位 -->
				<el-form-item>
					<el-select
						v-model="searchForm.companyId"
						:placeholder="activeTab === 'allocate' ? '调入单位' : '所属单位'"
						clearable
						filterable
						style="width: 150px"
						@change="handleCompanyChange"
					>
						<el-option
							v-for="item in companyList"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<!-- 部门 -->
				<el-form-item>
					<el-select
						v-model="searchForm.orgId"
						:placeholder="activeTab === 'allocate' ? '调入部门' : '所属部门'"
						clearable
						filterable
						style="width: 150px"
						:disabled="!searchForm.companyId"
					>
						<el-option
							v-for="item in deptList"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<!-- 审批状态 -->
				<el-form-item>
					<el-select v-model="searchForm.status" placeholder="审批状态" clearable style="width: 120px">
						<el-option label="审批中" :value="1" />
						<el-option label="审批成功" :value="2" />
						<el-option label="审批未通过" :value="3" />
					</el-select>
				</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
				<el-button icon="Refresh" @click="handleReset">重置</el-button>
				<el-divider direction="vertical" style="height: 24px; margin: 0 8px" />
			</el-form-item>
			<el-form-item style="margin-left: auto;">
				<template v-if="activeTab === 'scrap'">
					<el-button type="warning" icon="Download" @click="handleExportScrap" v-hasPermi="['equipment:equipScrap:export']" style="margin-right: 8px;">
						设备报废导出
					</el-button>
					<el-button type="primary" icon="Plus" @click="handleAddScrap" v-hasPermi="['equipment:equipScrap:add']">
						设备报废新增
					</el-button>
				</template>
				<template v-else-if="activeTab === 'allocate'">
					<el-button type="warning" icon="Download" @click="handleExportAllocate" v-hasPermi="['equipment:equipAllocate:export']" style="margin-right: 8px;">
						设备调拨导出
					</el-button>
					<el-button type="primary" icon="Plus" @click="handleAddAllocate" v-hasPermi="['equipment:equipAllocate:add']">
						设备调拨新增
					</el-button>
				</template>
				<template v-else-if="activeTab === 'idle'">
					<el-button type="primary" icon="Plus" disabled>
						设备闲置新增
					</el-button>
				</template>
			</el-form-item>
		</el-form>
		</el-card>

		<el-tabs v-model="activeTab" @tab-click="handleTabClick" class="main-tabs">
			<el-tab-pane label="设备报废" name="scrap">
				<ScrapIndex
					ref="scrapRef"
					:search-params="searchParams"
					@show-drawer="handleShowScrapDrawer"
				/>
			</el-tab-pane>
			<el-tab-pane label="设备调拨" name="allocate">
				<AllocateIndex
					ref="allocateRef"
					:search-params="searchParams"
					@show-drawer="handleShowAllocateDrawer"
				/>
			</el-tab-pane>
			<el-tab-pane label="设备闲置" name="idle" disabled>
				<template #label>
					设备闲置
					<el-tag size="small" type="info" style="margin-left: 5px">待实现</el-tag>
				</template>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup name="equipmentChangeApply">
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import ScrapIndex from './scrap/index.vue'
import AllocateIndex from './allocate/index.vue'
import { getListByLevel, getListByParentId } from '@/api/system/dept'
import equipmentScrapApi from '@/api/equipment/equipmentChangeApply/equipmentScrap'
import equipmentAllocateApi from '@/api/equipment/equipmentChangeApply/equipmentAllocate'

const { proxy } = getCurrentInstance()

const activeTab = ref('scrap')
const scrapRef = ref()
const allocateRef = ref()

const searchForm = reactive({
	code: '',
	title: '',
	companyId: null,
	orgId: null,
	status: null
})

const companyList = ref([])
const deptList = ref([])

const searchParams = computed(() => {
	if (activeTab.value === 'allocate') {
		return {
			allocateCode: searchForm.code,
			title: searchForm.title,
			toCompanyId: searchForm.companyId,
			toOrgId: searchForm.orgId,
			status: searchForm.status
		}
	} else {
		return {
			scrapCode: searchForm.code,
			title: searchForm.title,
			useCompanyId: searchForm.companyId,
			useOrgId: searchForm.orgId,
			status: searchForm.status
		}
	}
})

// 加载公司列表（DEPT_LEVEL=1）
const loadCompanyList = () => {
	getListByLevel(1).then(res => {
		if (res.code == '0000') {
			companyList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id
			}))
		}
	})
}

// 加载部门列表（根据公司ID）
const loadDeptList = (companyId) => {
	if (!companyId) {
		deptList.value = []
		return
	}
	getListByParentId(companyId).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id
			}))
		}
	})
}

// 处理公司选择变化
const handleCompanyChange = (value) => {
	// 清空部门
	searchForm.orgId = null
	if (value) {
		loadDeptList(value)
	} else {
		deptList.value = []
	}
	// 不自动搜索，等待用户点击查询按钮
}

const handleSearch = () => {
	if (activeTab.value === 'scrap' && scrapRef.value) {
		scrapRef.value.getList(searchParams.value)
	} else if (activeTab.value === 'allocate' && allocateRef.value) {
		allocateRef.value.getList(searchParams.value)
	}
}

const handleReset = () => {
	searchForm.code = ''
	searchForm.title = ''
	searchForm.companyId = null
	searchForm.orgId = null
	searchForm.status = null
	deptList.value = []
	handleSearch()
}

const handleTabClick = (tab) => {
	console.log('切换到标签页:', tab.paneName)
	nextTick(() => {
		handleSearch()
	})
}

const handleAddScrap = () => {
	if (scrapRef.value) {
		scrapRef.value.openDrawer('add')
	}
}

const handleShowScrapDrawer = (mode, data) => {
	if (scrapRef.value) {
		scrapRef.value.openDrawer(mode, data)
	}
}

const handleAddAllocate = () => {
	if (allocateRef.value) {
		allocateRef.value.openDrawer('add')
	}
}

const handleShowAllocateDrawer = (mode, data) => {
	if (allocateRef.value) {
		allocateRef.value.openDrawer(mode, data)
	}
}

// 下载Excel文件
const downloadBlob = (file, filename) => {
	let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	let url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename + '.xlsx'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

// 导出设备报废申请
const handleExportScrap = () => {
	const exportParams = {
		...searchParams.value,
		startPage: 1,
		pageSize: 99999
	}
	equipmentScrapApi.exportExcel(exportParams).then(res => {
		downloadBlob(res, '设备报废申请_' + new Date().toISOString().slice(0, 10))
	}).catch(err => {
		proxy.$message.error(err.msg || '导出失败')
	})
}

// 导出设备调拨申请
const handleExportAllocate = () => {
	const exportParams = {
		...searchParams.value,
		startPage: 1,
		pageSize: 99999
	}
	equipmentAllocateApi.exportExcel(exportParams).then(res => {
		downloadBlob(res, '设备调拨申请_' + new Date().toISOString().slice(0, 10))
	}).catch(err => {
		proxy.$message.error(err.msg || '导出失败')
	})
}

import { onMounted, nextTick } from 'vue'
onMounted(() => {
	loadCompanyList()
	nextTick(() => {
		handleSearch()
	})
})
</script>

<style scoped lang="scss">
.equipment-change-apply {
	// 使用 flex 布局让内容自适应
	display: flex;
	flex-direction: column;
	height: calc(100vh - 84px); // 减去顶部导航和面包屑高度
	overflow: hidden;

	.search-card {
		margin-bottom: 10px;
		flex-shrink: 0; // 搜索区域不压缩

		:deep(.el-card__body) {
			padding: 10px 15px;
		}

		:deep(.el-form) {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 5px;
		}

		:deep(.el-form-item) {
			margin-right: 0;
			margin-bottom: 0;
		}

		:deep(.el-form-item__label) {
			padding-right: 2px;
		}
	}

	.main-tabs {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:deep(.el-tabs__header) {
			margin-bottom: 10px;
			flex-shrink: 0;
		}

		:deep(.el-tabs__content) {
			flex: 1;
			overflow: hidden;
		}

		:deep(.el-tab-pane) {
			height: 100%;
			padding: 0;
		}
	}
}
</style>
