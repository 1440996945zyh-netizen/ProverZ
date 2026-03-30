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
    <Drawer v-model="dialogVisible" :title="title" size="70%">
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

<script setup name="patrolStandard">
import { ref, reactive, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/patrolStandard/index'

const { proxy } = getCurrentInstance()

const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    standardCode: undefined,
    standardName: undefined,
  },
})
const { queryParams } = toRefs(data)

const selectData = reactive([
  {
    name: '标准编号',
    type: 'input',
    modelValue: 'standardCode',
    span: 12,
  },
  {
    name: '标准名称',
    type: 'input',
    modelValue: 'standardName',
    span: 12,
  },
])

const tableColumns = ref([
  { label: '序号', type: 'seq', width: 80, align: 'center', fixed: 'left' },
  {
    label: '标准编号',
    prop: 'standardCode',
    align: 'left',
    width: 260,
    render: row => {
      return h(
        'span',
        {
          style: {
            display: 'block',
            textAlign: 'left',
            paddingLeft: '8px',
          },
        },
        row.standardCode || '',
      )
    },
  },
  { label: '标准名称', prop: 'standardName', align: 'left', minWidth: 500, showOverFlow: true },
  {
    prop: 'operate',
    label: '操作',
    align: 'center',
    width: 160,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => handleUpdate(row),
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'equipment:patrolStandard:update',
          },
          { default: () => '编辑' },
        ),
        h(
          ElButton,
          {
            onClick: () => handleDelete(row),
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: 'equipment:patrolStandard:delete',
          },
          { default: () => '删除' },
        ),
      ]
    },
  },
])

const buttonList = reactive([
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:patrolStandard:add',
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
        proxy.$message.error(res.msg || '查询失败')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const cancel = () => {
  dialogVisible.value = false
  detailRef.value?.resetForm()
}

const handleAdd = () => {
  title.value = '新增巡检标准'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
  })
}

const handleUpdate = row => {
  title.value = '编辑巡检标准'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
    api.getById(row.id).then(res => {
      if (res.code === '0000') {
        detailRef.value?.setFormData(res.data || {})
      }
    })
  })
}

const submitForm = async () => {
  if (!(await detailRef.value.validate())) {
    return
  }
  const params = JSON.parse(JSON.stringify(detailRef.value.formData))
  const requestApi = params.id ? api.update : api.add
  requestApi(params).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    dialogVisible.value = false
    getList(queryParams.value)
  })
}

const handleDelete = row => {
  proxy.$modal
    .confirm('确定删除？')
    .then(() => api.delete(row.id))
    .then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList(queryParams.value)
    })
    .catch(() => {})
}

getList(queryParams.value)
</script>
