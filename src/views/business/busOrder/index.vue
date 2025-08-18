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
		</el-drawer>
</template>
<script setup name="order">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/order/index.js'
import { ref, reactive, nextTick, h,onMounted,computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import SearchHeader from "@/components/SearchHeader/index.vue";
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const total = ref(0) // 数据总数
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const loading = ref(false) // 是否加载中
const title = ref('')
const queryParams = ref({ startPage: 1, pageSize: 10}) // 检索参数
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '船名', prop: 'shipName',width: 120 ,align: 'left'},
  { label: '航次', prop: 'voyage',width: 120 ,align: 'left'},
  { label: '类型', prop: 'orderTypeName',width: 80 ,align: 'left'},
  { label: '客户名称', prop: 'customerName' ,width: 230 ,align: 'left'},
	{ label: '创建人', prop: 'createByName' ,width: 100},
	{ label: '创建时间', prop: 'createTime' ,width: 160 },
	{ label: '审核人', prop: 'approvedByName' ,width: 100},
	{ label: '审核时间', prop: 'approvedTime' ,width: 160 },
	{ label: '更新人', prop: 'updateByName' ,width: 100},
	{ label: '更新时间', prop: 'updateTime' ,width: 160 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    fixed: 'right',
    align: 'center',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? 'success' : 'error',
          },
          {
            default: () => {
              if (row.status === '0') {
                return '待审核'
              } else if (row.status === '1') {
                return '已审核'
              }
            },
          }
        ),
      ]
    },
  },
	{
		prop: '',
		label: '操作',
		width: 180,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: row.status =='0'?'success':'warning',
						link: true,
						icon: 'Edit',
						hasPermi: 'view:business:busOrder',
					},
					{
						default: () => row.status =='0'?'审核':'撤销',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							getDetail(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						hasPermi: 'view:business:detail',
					},
					{
						default: () => '详情',
					}
				),
			]
		},
	},
])
const selectData = reactive([
  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 12,
    dataType: 'VOYAGE',
  },
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 6,
    selectData: [
      { label: '待审核', value: '0' },
      { label: '已审核', value: '1' },
    ],
  },
  {
    name: '类型',
    type: 'select',
    modelValue: 'orderType',
    span: 6,
    selectData: [
      { label: '疏港', value: '1' },
      { label: '装船', value: '3' },
    ],
  },
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		// permission: 'standardization:basicdata:process:insert', // 权限
	},
])
const customerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	loading.value = true
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		loading.value = false
	})
}
// 新增事件
const add = () => {
	customerVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = ''
	})
}
// 编辑事件
const edit = row => {
  if(row.status == '0'){
    proxy.$modal.confirm('是否确定审核？').then(() => {
      row.status = '1'
      api.update(row).then(res=>{
        if(res.code=='0000'){
          proxy.$modal.msgSuccess('审核成功')
        }else{
          proxy.$modal.msgError('审核失败')
        }
        getList(queryParams.value)
      })
    })
  }else if(row.status == '1'){
    proxy.$modal.confirm('是否确定撤销审核？').then(() => {
      row.status = '0'
      api.update(row).then(res=>{
        if(res.code=='0000'){
          proxy.$modal.msgSuccess('撤销成功')
        }else{
          proxy.$modal.msgError('撤销失败')
        }
        getList(queryParams.value)
      })
    })
  }
}

/**
 * 获取详情
 */
const getDetail=()=>{
  customerVisible.value = true
  title.value = '详情'
  nextTick(() => {
    // detailRef.value.resetForm() // 清空事件
    // detailRef.value.formData.id = ''
    api.getDetailById({id : clickRow.value.id}).then(res=>{
      if(res.code === '0000'){
        detailRef.value.tableData.value = []
        detailRef.value.tableData = res.data.itemDTO
      }
    })
  })
}


// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
</script>
