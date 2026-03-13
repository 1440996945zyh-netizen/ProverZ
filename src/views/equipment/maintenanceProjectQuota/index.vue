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

const STATUS_MAP = {
  '1': { label: '生效', type: 'success' },
  '0': { label: '失效', type: 'danger' },
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

const tableColumns = ref([
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
        }
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
          }
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
.app-container {
  padding: 24px;
}
</style>
