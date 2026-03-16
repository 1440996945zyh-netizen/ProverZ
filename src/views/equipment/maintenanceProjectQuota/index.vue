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
      :total="total"
      :checkbox-config="checkboxConfig"
      @checkbox-change="checkboxChange"
    />
    <Drawer v-model="dialogVisible" :title="title" size="30%">
      <detail ref="detailRef" />
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
      </template>
    </Drawer>
    <!-- 批量修改状态弹窗 -->
    <!-- 批量修改状态弹窗 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="批量修改状态"
      width="440px"
      :close-on-click-modal="false"
    >
      <div class="batch-status-dialog-body">
        <el-form :model="statusForm" label-width="70px">
          <el-form-item label="状态" required class="batch-status-form-item">
            <el-select
              v-model="statusForm.status"
              placeholder="请选择状态"
              class="batch-status-select"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
		<span class="dialog-footer">
			<el-button @click="statusDialogVisible = false">取消</el-button>
			<el-button type="primary" @click="handleConfirmBatchStatus">确定</el-button>
		</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="maintenanceProjectQuota">
import { ref, reactive, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceProjectQuota/index'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

/**
 * 批量修改状态弹窗控制
 */
const statusDialogVisible = ref(false)

/**
 * 复选框当前选中的数据
 * 用于批量状态修改
 */
const checkboxSelection = ref([])

/**
 * 状态弹窗表单
 */
const statusForm = reactive({
  status: '',
})

/**
 * 状态下拉选项
 */
const statusOptions = [
  { label: '生效', value: '1' },
  { label: '失效', value: '0' },
]

const STATUS_MAP = {
	1: { label: '生效', type: 'success' },
	0: { label: '失效', type: 'danger' },
}

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		projectName: undefined,
		quotaCode: undefined,
	},
})
const { queryParams } = toRefs(data)

/**
 * 复选框配置
 */
const checkboxConfig = {
  highlight: true,
  strict: false,
  reserve: false,
  showHeader: true,
  checkAll: false,
  range: false,
}

const tableColumns = ref([
  { type: 'checkbox', width: 50, align: 'center', fixed: 'left' },
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
  { label: '定额编号', prop: 'quotaCode', align: 'center', width: 180 },
  { label: '维修项目名称', prop: 'projectName', align: 'left', width: 200, showOverFlow: true },
  { label: '维修项目内容', prop: 'projectContent', align: 'left', minWidth: 300, showOverFlow: true },
  { label: '计量单位', prop: 'unit', align: 'center', width: 100 },
  {
    label: '不含税金额',
    prop: 'amountExcludingTax',
    align: 'right',
    width: 120,
    render: row => {
      const val = parseFloat(row.amountExcludingTax)
      if (isNaN(val)) {
        return h('span', '0.00')
      }
      return h('span', val.toFixed(2))
    },
  },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 100,
    render: row => {
      const statusMeta = STATUS_MAP[String(row.status)] || { label: '未知', type: 'info' }
      return h(
        ElTag,
        { type: statusMeta.type },
        {
          default: () => statusMeta.label,
        },
      )
    },
  },
  {
    prop: 'operate',
    label: '操作',
    align: 'center',
    width: 90,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleUpdate(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'equipment:emmaintenanceprojectquota:update',
          },
          {
            default: () => '编辑',
          },
        ),
      ]
    },
  },
])

const selectData = reactive([
  {
    name: '维修项目名称',
    type: 'input',
    modelValue: 'projectName',
    span: 12,
  },
  {
    name: '定额编号',
    type: 'input',
    modelValue: 'quotaCode',
    span: 12,
  },
])

const buttonList = reactive([
  {
    label: '修改状态',
    type: 'primary',
    icon: 'EditPen',
    click: () => openBatchStatusDialog,
    permission: 'equipment:emmaintenanceprojectquota:update',
  },
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:emmaintenanceprojectquota:add',
  },
])

const getList = (e = queryParams.value) => {
  loading.value = true
  queryParams.value = { ...queryParams.value, ...e }
  api.getList(queryParams.value)
    .then(res => {
      if (res.code === '0000') {
        tableData.value = res.data?.pages || []
        total.value = Number(res.data?.totalNum || 0)
      } else {
        proxy.$message.error(res.msg)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 复选框选中变化事件
 * data 为当前所有选中的记录数组。
 */
const checkboxChange = data => {
  checkboxSelection.value = Array.isArray(data) ? data : []
}

/**
 * 打开批量修改状态弹窗
 * 进入弹窗前先校验是否已勾选数据。
 */
const openBatchStatusDialog = () => {
  if (!checkboxSelection.value.length) {
    proxy.$modal.msgWarning('请先勾选需要修改状态的数据')
    return
  }
  statusForm.status = ''
  statusDialogVisible.value = true
}

/**
 * 确认执行批量修改状态
 * 1. 校验是否选择目标状态
 * 2. 二次确认
 * 3. 调后端接口批量更新
 */
const handleConfirmBatchStatus = () => {
  if (!statusForm.status) {
    proxy.$modal.msgWarning('请选择状态')
    return
  }

  const selectedIds = checkboxSelection.value.map(item => item.id)
  const targetStatusText = statusForm.status === '1' ? '生效' : '失效'

  proxy.$modal
    .confirm(`是否确认将选中的 ${selectedIds.length} 条数据修改为【${targetStatusText}】状态？`)
    .then(() => {
      return api.updateStatusBatch({
        ids: selectedIds,
        status: statusForm.status,
      })
    })
    .then(res => {
      proxy.$modal.msgSuccess(res.msg || '状态修改成功')
      statusDialogVisible.value = false
      checkboxSelection.value = []
      baseTable.value?.clearCheckboxRow?.()
      getList(queryParams.value)
    })
    .catch(() => {})
}

const cancel = () => {
  dialogVisible.value = false
  reset()
}

const reset = () => {
  detailRef.value?.resetForm()
}

const handleAdd = () => {
  reset()
  title.value = '新增维修项目定额'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
  })
}

const handleUpdate = row => {
  title.value = '编辑维修项目定额'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
    api.getById(row.id).then(response => {
      const resData = JSON.parse(JSON.stringify(response.data || {}))
      detailRef.value.formData.id = resData.id
      detailRef.value.formData.quotaCode = resData.quotaCode
      detailRef.value.formData.projectName = resData.projectName
      detailRef.value.formData.projectContent = resData.projectContent
      detailRef.value.formData.unit = resData.unit
      detailRef.value.formData.amountExcludingTax = resData.amountExcludingTax
      detailRef.value.formData.status = resData.status ?? '1'
    })
  })
}

const submitForm = async () => {
  if (await detailRef.value.validate()) {
    const params = detailRef.value.formData
    if (params.id) {
      api.update(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        dialogVisible.value = false
        getList(queryParams.value)
      })
    } else {
      api.add(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        dialogVisible.value = false
        getList(queryParams.value)
      })
    }
  }
}

getList(queryParams.value)
</script>

<style lang="scss" scoped>
.batch-status-dialog-body {
  padding: 8px 12px 0 12px;
}

.batch-status-form-item {
  margin-bottom: 0;
}

.batch-status-select {
  width: 220px;
}

:deep(.el-dialog__body) {
  padding: 10px 24px 15px 24px;
}

:deep(.vxe-table--render-default) {
  /* 勾选行背景色 */
  --vxe-ui-table-row-checkbox-checked-background-color: #e6f7ff;

  /* 勾选行悬浮时背景色 */
  --vxe-ui-table-row-hover-checkbox-checked-background-color: #d7effb;
}
</style>
