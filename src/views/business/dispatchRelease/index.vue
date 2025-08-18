<template>
	<div>
    <div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
        :buttonList="buttonList"
				:searchClick="getList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellDBLClick"
        :cellDBLClickEvent="cellDBLClick"
				:total="total"
			/>
		</div>
		<el-drawer v-model="detailVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
  </div>
</template>

<script setup name="shipForecast">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/dispatchRelease/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import Math from "../../../utils/math";
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
const title = ref("新增")
const total = ref(0) // 数据总数
const tableData = ref([])// 表格数据
const tableColumns = reactive([// 表格表头参数
  { prop: 'shipVoyage', label: '船名航次' ,align: 'left' ,width: 160},
  { prop: 'scn', label: 'SCN' ,align: 'left' ,width: 90},
  { prop: 'tradeType', label: '内外贸',align: 'left' ,width: 90 },
  {
    prop: 'impExp',
    label: '进出口',
    align: 'left',
    width: 90,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.impExp == 'OUT' ? '' : 'info',
          },
          {
            default: () => {
              if (row.impExp === 'IN') {
                return '进口'
              } else if (row.impExp === 'OUT') {
                return '出口'
              } else if (row.impExp === 'INOUT') {
                return '进出口'
              }
            },
          }
        ),
      ]
    },
  },
  { prop: 'loadUnload', label: '装卸',align: 'left',width: 80 },
  { prop: 'cargoName', label: '货名',align: 'left',width: 100 },
  { prop: 'customerName', label: '客户',align: 'left' },
  { prop: 'companyName', label: '作业公司',align: 'left'},
  {
    prop: 'shipStatusName',
    label: '船舶状态',
    align: 'left',
    width: 110,
    fixed: 'right',
    render: row => {
      let type = 'info'
      if (row.shipStatusName === '预报') {
        type = ''
      } else if (row.shipStatusName === '作废') {
        type = 'danger'
      }
      return [
        h(
          ElTag,
          {
            type,
          },
          {
            default: () => row.shipStatusName,
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    align: 'center',
    fixed: 'right',
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
            permission: 'dispatch:shipForecast:update', //权限
          },
          {
            default: () => '放行单',
          }
        ),
      ]
    },
  },
])
// header检索参数
const selectData = reactive([
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '内外贸',
    type: 'select',
    modelValue: 'tradeType',
    span: 8,
    selectData: [
      { label: '内贸', value: '内贸' },
      { label: '外贸', value: '外贸' },
    ],
  },
  {
    name: '船代',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 3,
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '状态',
    type: 'select',
    modelValue: 'shipStatusCode',
    span: 3,
    selectData: [
      { label: '预报', value: '10' },
      { label: '接收', value: '20' },
      { label: '抵锚', value: '30' },
      { label: '靠泊', value: '50' },
      { label: '移泊', value: '60' },
      { label: '开工', value: '70' },
      { label: '停工', value: '80' },
      { label: '复工', value: '90' },
      { label: '完工', value: '100' },
      { label: '离泊', value: '110' },
      { label: '离港', value: '120' },
    ],
  },
])
// header按钮参数
const buttonList = reactive([
  {
    label: '新建', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'dispatch:shipForecast:add', // 权限
  },
])
const queryParams = ref({
  // 检索参数
  startPage: 1,
  pageSize: 10,
})
const clickRow = ref(null)
const cellDBLClick = ({ row }) => {
  clickRow.value = row
}
// 点击查询的事件
const getList = e => {
  queryParams.value = e
  api.getList(e).then(res => {
    // buttonList[1].disabled = true
    // buttonList[2].disabled = true
    // buttonList[3].disabled = true
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
const add = () => {
  title.value = '新增'
  detailVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    let data = [];
    api.detailListByCondition({shipvoyageItemId:clickRow.value.shipvoyageItemId}).then(res=>{
      data = res.data;
      nextTick(() => {
        detailRef.value.resetForm() // 清空事件
        detailRef.value.tableData = data
      })
    })
  })
}
const edit = async row => {
  let data = [];
  await api.detailListByCondition({shipvoyageItemId:row.shipvoyageItemId}).then(res=>{
    data = res.data;
    title.value = '编辑'
    detailVisible.value = true
    nextTick(() => {
      detailRef.value.resetForm() // 清空事件
      detailRef.value.tableData = data
    })
  })
}

const save = async value =>{

  if (await detailRef.value.validate()) {
    // 校验通过才可以保存
    proxy.$modal.confirm('确定保存？').then(() => {
        let data = [];
        let saveData = detailRef.value.tableData
        for (let i = 0; i < saveData.length; i++) {
          saveData[i].status = 2 //代表更新
          saveData[i].shipvoyageId = clickRow.value.shipvoyageId //shipvoyageId
          saveData[i].shipvoyageItemId = clickRow.value.shipvoyageItemId //shipvoyageItemId
          if (saveData[i].id == null || saveData[i].id == '') {
            saveData[i].status = 1 //代表保存
          }
        }
        for(let index in saveData){
          data.push(saveData[index])
        }
        for(let index in detailRef.value.deleteTable){
          data.push(detailRef.value.deleteTable[index])
        }
        api.addList(data).then(res=>{
          detailVisible.value = false
          proxy.$modal.msgSuccess(res.msg)
        })
      })
  }
}


const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  edit(row)
}
// 默认查询
getList(queryParams.value)
</script>
