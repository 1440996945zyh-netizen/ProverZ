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
        :cellClickEvent="cellClickEvent"
        :total="total"
      />
    </div>
    <el-drawer v-model="customerVisible" :title="title" size="60%">
      <detail ref="detailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="customerVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-drawer>
</template>

<script setup name="tug">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/master/entryNotice/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import {ElButton, ElTag} from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
//查询条件
const queryParams = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '公告标题', prop: 'title',width: 180 },
  { label: '内容', prop: 'content' },
  { label: '生效开始时间', prop: 'startTime',width: 140 },
  { label: '生效截至时间', prop: 'endTime',width: 140 },
  { label: '通知对象', prop: 'roleName',width: 140 },
  { label: '创建者', prop: 'createByName',width: 100 },
  { label: '创建时间', prop: 'createTime',width: 150 },
  { label: '状态',
    prop: 'status',
    width: 100,
    render: row => {
      let type
      if (row.status === '0') {
        type = 'info'
      } else if (row.status === '1') {
        type = 'success'
      } else {
        type = 'info'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.status =='1'?'在用':'停用',
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    width: 200,
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              edit(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'master:tug:update', // 权限
          },
          {
            default: () => '编辑',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: 'master:tug:delete', // 权限
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '公告标题', // 搜索框code
    type: 'input', // 搜索框类型
    modelValue: 'title', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '内容', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'content', // 绑定字段
    span: 12, // 占位，共24
  },
])
const buttonList = reactive([
  {
    label: '新增', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'master:tug:add', // 权限
  },
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
  queryParams.value = e
  api.getList(e).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
// 新增事件
const add = () => {
  customerVisible.value = true
  title.value = '新增'
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.noticeRoleCodes = []
    detailRef.value.formData.noticeRoleNames = []
  })
}
// 编辑事件
const edit = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  customerVisible.value = true
  title.value = '编辑'
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.typeList = []
    console.log(editRow.id)
    detailRef.value.formData.id = editRow.id
    detailRef.value.formData.title = editRow.title
    detailRef.value.formData.status = editRow.status
    detailRef.value.formData.content = editRow.content
    detailRef.value.formData.startTime = editRow.startTime
    detailRef.value.formData.endTime = editRow.endTime
    detailRef.value.formData.noticeRoleCodes = editRow.noticeRoleCodes
    detailRef.value.formData.noticeRoleNames = editRow.noticeRoleNames
  })
}
// 删除事件
const handleDelete = row => {
  const deleteRow = row || clickRow.value // 拿到所删除行的数据
  proxy.$modal
    .confirm('确定删除?')
    .then(res => {
      api.delete({id:deleteRow.id}).then(res => {
        if (res.code == '0000') {
          proxy.$modal.msgSuccess(res.msg)
          getList(queryParams.value)
        } else {
          proxy.$modal.msgError(res.msg)
        }
      })
    })
    .catch(err => {})
}
// 保存事件
const save = async () => {
  if (await detailRef.value.validate()) {
    proxy.$modal.confirm('确定保存?').then(res => {
      if (title.value == '编辑') {
        api.add(detailRef.value.formData).then(res => {
          if (res.code == '0000') {
            proxy.$modal.msgSuccess(res.msg)
            getList(queryParams.value)
            customerVisible.value = false
          } else {
            proxy.$modal.msgError(res.msg)
          }
        })
      } else {
        delete detailRef.value.formData.id
        api.add(detailRef.value.formData).then(res => {
          if (res.code == '0000') {
            proxy.$modal.msgSuccess(res.msg)
            getList(queryParams.value)
            customerVisible.value = false
          } else {
            proxy.$modal.msgError(res.msg)
          }
        })
      }
    })
  }
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
getList(queryParams.value)
</script>
