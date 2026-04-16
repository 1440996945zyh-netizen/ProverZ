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
      :tableHeight="tableHeight"
    />

    <Drawer v-model="dialogVisible" :title="title" size="70%">
      <detail ref="detailRef" />
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">
						{{ pageMode === 'view' ? '关闭' : '取消' }}
					</el-button>
					<el-button v-if="pageMode !== 'view'" type="primary" @click="submitForm">
						确定
					</el-button>
				</span>
      </template>
    </Drawer>
  </div>
</template>

<script setup name="materialSupplier">
import { ref, reactive, computed, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/materialSupplier/index'
import tableParamsStore from '@/store/modules/tableParams'

const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHeight.value - 40)
const { proxy } = getCurrentInstance()

const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

// add: 新增
// edit: 编辑
// view: 详情
const pageMode = ref('add')

const statusMap = {
  '2': '启用',
  '1': '禁用',
}

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    supplierCode: undefined,
    supplierName: undefined,
    uniformSocialCreditCode: undefined,
    businessType: undefined,
    status: undefined,
  },
})
const { queryParams } = toRefs(data)

const tableColumns = ref([
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
  { label: '供应商编码', prop: 'supplierCode', align: 'center', width: 170 },
  { label: '供应商名称', prop: 'supplierName', align: 'left', minWidth: 180, showOverFlow: true },
  { label: '企业名称', prop: 'companyName', align: 'left', minWidth: 220, showOverFlow: true },
  { label: '统一社会信用代码', prop: 'uniformSocialCreditCode', align: 'left', width: 200, showOverFlow: true },
  { label: '企业类型', prop: 'businessType', align: 'center', width: 140, showOverFlow: true },
  { label: '法定代表人', prop: 'legalPerson', align: 'center', width: 120, showOverFlow: true },
  { label: '联系人', prop: 'supplierPerson', align: 'center', width: 120, showOverFlow: true },
  { label: '联系电话', prop: 'supplierPhone', align: 'center', width: 140, showOverFlow: true },
  { label: '公司电话', prop: 'companyTel', align: 'center', width: 140, showOverFlow: true },
  { label: '经营状态', prop: 'businessState', align: 'center', width: 120, showOverFlow: true },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 100,
    render: row => {
      return h(
        ElTag,
        {
          type: row.status === '2' ? 'success' : 'danger',
        },
        {
          default: () => statusMap[row.status] || '',
        },
      )
    },
  },
  { label: '备注', prop: 'companyInfoRemark', align: 'left', minWidth: 180, showOverFlow: true },
  {
    prop: 'operate',
    label: '操作',
    align: 'center',
    // 三个按钮要留够空间，不然最后一个容易被挤没
    width: 230,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleView(row)
            },
            type: 'primary',
            link: true,
            icon: 'View',
            permission: 'equipment:materialSupplier:query',
          },
          { default: () => '详情' },
        ),
        h(
          ElButton,
          {
            onClick: () => {
              handleUpdate(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'equipment:materialSupplier:update',
          },
          { default: () => '编辑' },
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
            permission: 'equipment:materialSupplier:delete',
          },
          { default: () => '删除' },
        ),
      ]
    },
  },
])

const selectData = reactive([
  { name: '供应商编码', type: 'input', modelValue: 'supplierCode', span: 6 },
  { name: '供应商名称', type: 'input', modelValue: 'supplierName', span: 6 },
  { name: '统一社会信用代码', type: 'input', modelValue: 'uniformSocialCreditCode', span: 10 },
  { name: '企业类型', type: 'input', modelValue: 'businessType', span: 4, isShowMore: true },
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 4,
    isShowMore: true,
    selectData: [
      { label: '启用', value: '2' },
      { label: '禁用', value: '1' },
    ],
  },
])

const buttonList = reactive([
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:materialSupplier:add',
  },
])

const getList = e => {
  loading.value = true
  queryParams.value = e || queryParams.value

  api
    .getList(queryParams.value)
    .then(res => {
      if (res.code === '0000') {
        tableData.value = res.data?.pages || []
        total.value = res.data?.totalNum || 0
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
  reset()
}

const reset = () => {
  pageMode.value = 'add'
  detailRef.value?.setViewMode(false)
  detailRef.value?.resetForm()
}

// 详情和编辑共用一套回填，省得两边字段不一致
const fillDetailData = resData => {
  detailRef.value.formData.id = resData.id
  detailRef.value.formData.supplierCode = resData.supplierCode || ''
  detailRef.value.formData.supplierName = resData.supplierName || ''
  detailRef.value.formData.companyName = resData.companyName || ''
  detailRef.value.formData.companyShort = resData.companyShort || ''
  detailRef.value.formData.formerName = resData.formerName || ''
  detailRef.value.formData.eCompanyName = resData.eCompanyName || ''
  detailRef.value.formData.industryType = resData.industryType || ''
  detailRef.value.formData.country = resData.country || ''
  detailRef.value.formData.province = resData.province || ''
  detailRef.value.formData.city = resData.city || ''
  detailRef.value.formData.registeredCurrency = resData.registeredCurrency || ''
  detailRef.value.formData.address = resData.address || ''
  detailRef.value.formData.uniformSocialCreditCode = resData.uniformSocialCreditCode || ''
  detailRef.value.formData.organizationCode = resData.organizationCode || ''
  detailRef.value.formData.businessType = resData.businessType || ''
  detailRef.value.formData.duns = resData.duns || ''
  detailRef.value.formData.mnemonicCode = resData.mnemonicCode || ''
  detailRef.value.formData.estiblishTime = resData.estiblishTime || ''
  detailRef.value.formData.registeredCapital = resData.registeredCapital || ''
  detailRef.value.formData.legalPerson = resData.legalPerson || ''
  detailRef.value.formData.legalPersonCardNo = resData.legalPersonCardNo || ''
  detailRef.value.formData.businessState = resData.businessState || ''
  detailRef.value.formData.businessScope = resData.businessScope || ''
  detailRef.value.formData.companyTel = resData.companyTel || ''
  detailRef.value.formData.businessAddress = resData.businessAddress || ''
  detailRef.value.formData.supplierPerson = resData.supplierPerson || ''
  detailRef.value.formData.supplierPhone = resData.supplierPhone || ''
  detailRef.value.formData.companyInfoRemark = resData.companyInfoRemark || ''
  detailRef.value.formData.status = resData.status || '2'
}

const loadDetail = row => {
  api.getById(row.id).then(response => {
    if (response.code !== '0000') {
      proxy.$message.error(response.msg || '获取详情失败')
      return
    }

    const resData = JSON.parse(JSON.stringify(response.data || {}))
    fillDetailData(resData)
  })
}

const handleAdd = () => {
  reset()
  title.value = '新增供应商'
  dialogVisible.value = true
  pageMode.value = 'add'

  nextTick(() => {
    detailRef.value?.setViewMode(false)
    detailRef.value?.resetForm()
  })
}

const handleUpdate = row => {
  title.value = '编辑供应商'
  dialogVisible.value = true
  pageMode.value = 'edit'

  nextTick(() => {
    detailRef.value?.resetForm()
    detailRef.value?.setViewMode(false)
    loadDetail(row)
  })
}

const handleView = row => {
  title.value = '详情'
  dialogVisible.value = true
  pageMode.value = 'view'

  nextTick(() => {
    detailRef.value?.resetForm()
    detailRef.value?.setViewMode(true)
    loadDetail(row)
  })
}

const submitForm = async () => {
  // 详情模式不提交
  if (pageMode.value === 'view') {
    dialogVisible.value = false
    return
  }

  if (!(await detailRef.value.validate())) {
    return
  }

  const params = detailRef.value.formData
  const request = params.id ? api.update(params) : api.add(params)

  request.then(res => {
    if (res.code === '0000') {
      proxy.$modal.msgSuccess(res.msg || '保存成功')
      dialogVisible.value = false
      getList(queryParams.value)
    } else {
      proxy.$message.error(res.msg || '保存失败')
    }
  })
}

const handleDelete = row => {
  proxy.$modal
    .confirm('确定删除？')
    .then(function () {
      return api.delete(row.id)
    })
    .then(res => {
      if (res.code === '0000') {
        getList(queryParams.value)
        proxy.$modal.msgSuccess(res.msg || '删除成功')
      } else {
        proxy.$message.error(res.msg || '删除失败')
      }
    })
    .catch(() => {})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
