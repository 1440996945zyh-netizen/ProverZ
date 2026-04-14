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

    <Drawer v-model="dialogVisible" :title="title" size="40%">
      <detail ref="detailRef" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </Drawer>

    <Drawer v-model="batchDialogVisible" title="批量新增物资预警配置" size="45%">
      <batchDetail ref="batchDetailRef" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelBatch">取消</el-button>
          <el-button type="primary" @click="submitBatchForm">确定</el-button>
        </span>
      </template>
    </Drawer>
  </div>
</template>

<script setup name="materialWarningConfig">
import { ref, reactive, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import batchDetail from './batchDetail/index.vue'
import api from '@/api/equipment/materialWarningConfig/index'
import materialCategoryApi from '@/api/equipment/materialCategory/index'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)
const batchDetailRef = ref(null)
const selectedRows = ref([])

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    materialName: undefined,
    categoryId: undefined,
    status: undefined,
  },
})
const { queryParams } = toRefs(data)

// 三级类别下拉
const categoryOptions = ref([])

// 列表勾选
const checkboxConfig = reactive({
  trigger: 'row',
  checkField: 'checked',
})

// 同步勾选结果
const checkboxChange = records => {
  selectedRows.value = Array.isArray(records) ? records : []
}

const tableColumns = ref([
  {
    type: 'checkbox',
    width: 50,
    align: 'center',
    fixed: 'left',
  },
  {
    label: '序号',
    type: 'seq',
    width: 60,
    align: 'center',
    fixed: 'left',
  },
  {
    label: '物资名称',
    prop: 'materialName',
    align: 'left',
    minWidth: 180,
    showOverFlow: true,
  },
  {
    label: '物资类型',
    prop: 'materialType',
    align: 'left',
    minWidth: 160,
    showOverFlow: true,
  },
  {
    label: '规格型号',
    prop: 'specificationModel',
    align: 'left',
    minWidth: 150,
    showOverFlow: true,
  },
  {
    label: '品牌',
    prop: 'brand',
    align: 'left',
    minWidth: 150,
    showOverFlow: true,
  },
  {
    label: '计量单位',
    prop: 'unitName',
    align: 'center',
    width: 100,
  },
  {
    label: '预警阈值',
    prop: 'warningThreshold',
    align: 'center',
    width: 100,
  },
  {
    label: '预警接收人',
    prop: 'receiverNames',
    align: 'left',
    minWidth: 200,
    showOverFlow: true,
  },
  {
    prop: 'status',
    label: '状态',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status === '1' ? 'success' : 'danger',
            size: 'default',
          },
          {
            default: () => {
              return row.status === '1' ? '启用' : '禁用'
            },
          },
        ),
      ]
    },
  },
  {
    label: '创建时间',
    prop: 'createTime',
    align: 'center',
    width: 180,
  },
  {
    label: '创建人',
    prop: 'createByName',
    align: 'center',
    width: 180,
  },
  {
    prop: 'operate',
    label: '操作',
    align: 'center',
    width: 150,
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
            permission: 'equipment:eMaterialWarningConfig:save',
          },
          {
            default: () => '编辑',
          },
        ),
        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: 'equipment:eMaterialWarningConfig:delete',
          },
          {
            default: () => '删除',
          },
        ),
      ]
    },
  },
])

const selectData = reactive([
  {
    name: '物资名称',
    type: 'input',
    modelValue: 'materialName',
    span: 8,
  },
  {
    name: '物资类别',
    type: 'select',
    modelValue: 'categoryId',
    span: 8,
    selectData: [],
    selectValue: 'id',
    selectLabel: 'categoryName',
  },
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 8,
    selectData: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  },
])

const buttonList = reactive([
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:eMaterialWarningConfig:save',
  },
  {
    label: '批量新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleBatchAdd,
    permission: 'equipment:eMaterialWarningConfig:save',
  },
  {
    label: '批量删除',
    type: 'danger',
    icon: 'Delete',
    click: () => handleBatchDelete,
    permission: 'equipment:eMaterialWarningConfig:delete',
  },
])

// 查询三级类别，给筛选条件用
const loadCategoryOptions = () => {
  materialCategoryApi.getByLevelAndParent(3).then(res => {
    if (res.code === '0000') {
      categoryOptions.value = res.data || []
      selectData[1].selectData = categoryOptions.value
    } else {
      categoryOptions.value = []
      selectData[1].selectData = []
      proxy.$message.error(res.msg || '加载物资类别失败')
    }
  })
}

// 列表查询
const getList = e => {
  loading.value = true
  queryParams.value = e || queryParams.value

  api
    .getList(queryParams.value)
    .then(res => {
      if (res.code == '0000') {
        tableData.value = res.data?.pages || []
        total.value = res.data?.totalNum || 0
        selectedRows.value = []
        baseTable.value?.clearCheckboxRow?.()
      } else {
        proxy.$message.error(res.msg)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const cancel = () => {
  dialogVisible.value = false
  reset()
}

const reset = () => {
  detailRef.value?.resetForm()
}

const cancelBatch = () => {
  batchDialogVisible.value = false
  batchDetailRef.value?.resetForm()
}

const handleAdd = () => {
  reset()
  title.value = '新增物资预警配置'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
  })
}

const handleBatchAdd = () => {
  batchDialogVisible.value = true
  nextTick(() => {
    batchDetailRef.value?.resetForm()
  })
}

const handleUpdate = row => {
  title.value = '编辑物资预警配置'
  dialogVisible.value = true

  nextTick(() => {
    detailRef.value?.resetForm()

    api.getById(row.id).then(response => {
      if (response.code !== '0000') {
        proxy.$message.error(response.msg || '获取详情失败')
        return
      }

      const resData = JSON.parse(JSON.stringify(response.data || {}))

      detailRef.value.formData.id = resData.id
      detailRef.value.formData.materialId = resData.materialId
      detailRef.value.formData.materialName = resData.materialName
      detailRef.value.formData.materialType = resData.materialType || ''
      detailRef.value.formData.brand = resData.brand
      detailRef.value.formData.specificationModel = resData.specificationModel
      detailRef.value.formData.unitName = resData.unitName
      detailRef.value.formData.warningThreshold = resData.warningThreshold
      detailRef.value.formData.receivers = resData.receivers || ''
      detailRef.value.formData.receiverNames = resData.receiverNames || ''
      detailRef.value.formData.status = resData.status || '1'

      if (resData.receivers) {
        detailRef.value.selectedUsers = resData.receivers.split(',').map((id, index) => {
          const names = resData.receiverNames ? resData.receiverNames.split(',') : []
          return {
            value: id,
            label: names[index] || '',
          }
        })
      } else {
        detailRef.value.selectedUsers = []
      }
    })
  })
}

const submitForm = async () => {
  if (await detailRef.value.validate()) {
    const params = detailRef.value.formData

    api.save(params).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess(res.msg || '保存成功')
        dialogVisible.value = false
        getList(queryParams.value)
      } else {
        proxy.$message.error(res.msg || '保存失败')
      }
    })
  }
}

const submitBatchForm = async () => {
  if (await batchDetailRef.value.validate()) {
    const params = batchDetailRef.value.formData

    api.saveBatch(params).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess(res.msg || '保存成功')
        batchDialogVisible.value = false
        getList(queryParams.value)
      } else {
        proxy.$message.error(res.msg || '保存失败')
      }
    })
  }
}

const handleDelete = row => {
  proxy.$modal
    .confirm('确定删除？')
    .then(function () {
      return api.delete(row.id)
    })
    .then(() => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

const handleBatchDelete = () => {
  const rows = baseTable.value?.getSelectEvent?.() || selectedRows.value || []

  if (!rows.length) {
    proxy.$modal.msgWarning('请先选择要删除的数据')
    return
  }

  const ids = rows.map(item => item.id)

  proxy.$modal
    .confirm(`确认删除选中的 ${ids.length} 条数据吗？`)
    .then(() => {
      return api.deleteBatch(ids)
    })
    .then(res => {
      proxy.$modal.msgSuccess(res.msg || '删除成功')
      getList(queryParams.value)
    })
    .catch(() => {})
}

loadCategoryOptions()
getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
