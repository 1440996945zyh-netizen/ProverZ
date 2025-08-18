<template>
  <el-form  ref='ruleForm' label-width='120px'   >
    <el-collapse v-model="collapseOpen">
      <el-collapse-item name="1" title="派车信息">
<!--        <template v-slot:title>
          <div style='display: flex; justify-content: space-between; width: 95%'>
            <div>车辆安排</div>
            <div>
              <el-button type='primary' @click.stop='importCarClick'>车辆导入</el-button>
            </div>
          </div>
        </template>-->
        <EditTable
          ref="baseTable"
          :showSearchHeader="false"
          :showPagination="false"
          :showToolBarEditTable="true"
          :tableColumns="tableColumns"
          :tableData="tableData"
          :editRules="editRules"
          :hasAdd="true"
          disabledKey='dis'
        />
      </el-collapse-item>
    </el-collapse>
  </el-form>

</template>

<script setup name="dayNightVehiclesList">
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElSwitch } from 'element-plus'
import api from '@/api/produce/sundryPlan/index'
import tableParamsStore from '@/store/modules/tableParams'


const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const collapseOpen = ref(['1'])
const dis =ref(false)

// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '车牌号', prop: 'vehicleNo', editType: 'input', editRender: {} },
  { label: '司机姓名', prop: 'driverNameOne', editType: 'input', editRender: {} },
  { label: '身份证号', prop: 'driverNoOne', editType: 'input', editRender: {} },
  { label: '电话', prop: 'driverPhoneOne', editType: 'input', editRender: {} },
  {
    label: '排放标准',
    prop: 'emissionStandard',
    editType: 'select',
    editRender: {},
    selectData:[
      // {value:'国IV' ,label:'国IV'},
      {value:'国V' ,label:'国V'},
      {value:'国VI' ,label:'国VI'}
    ]
  },
  {
    label: '是否新能源车辆',
    prop: 'energyType',
    editType: 'select',
    modelValue: 'energyType',
    modelLabel:'energyTypeLabel',
    editRender: {},
    selectData: [
      { label: '否', value: '0' },
      { label: '是', value: '1' },
    ],
  },
  { label: '重量', prop: 'weight', editType: 'input', editRender: {} },
  {
    label: '规格',
    prop: 'specs',
    editType: 'select',
    modelValue: 'specs',
    editRender: {},
    selectData: [
      { label: '*', value: '*' },
    ], },
  { label: '件数', prop: 'quantity', editType: 'input', editRender: {} },
  {
		prop: '',
		label: '添加',
		width: 100,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
            disabled: row.dis,
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const editRules = ref({
  vehicleNo: proxy.getRules({
		required: true,
	}),
  driverNameOne: proxy.getRules({
		required: true,
	}),
  driverNoOne: proxy.getRules({
		required: true,
    length: '2-20',
	}),
  driverPhoneOne: proxy.getRules({
		required: true,
    handset: {},
	}),
  emissionStandard: proxy.getRules({
    required: true,
  }),
  energyType: proxy.getRules({
    required: true,
  }),
})
const tableEditConfig = reactive({ trigger: 'click', mode: 'cell' })

// 删除事件
const handleDelete = row => {
	console.log(tableData)
	let rowIndex = ''
	tableData.value.forEach((item, index) => {
		if (item._X_ROW_KEY == row._X_ROW_KEY) {
			rowIndex = index
		}
	})
	tableData.value.splice(rowIndex, 1)
}

/*const headerCellClassName = even => {
  if (even.column.field == '') {
    return 'add'
  }
}*/
//处理禁止
const  getDetailList = (list) =>{
    const resData = JSON.parse(JSON.stringify(list))
    resData.forEach(item=>{
      if(item.isPounds == 2){
        item.dis = true
      }
    })
  tableData.value = resData
}


/*const rateLadderHeaderCellClickEvent = even => {
  if (even.column.field == '' ) {
    let data = tableData.value
    tableData.value.push({
      //车牌号
      vehicleNo: null,
      // 司机名称
      driverNameOne: null,
      // 身份证号
      driverNoOne: null,
      //电话号
      driverPhoneOne:null,
      //国标
      emissionStandard:null,
    })
  }
}*/

const validate = async () => {
	const flag = await baseTable.value.validAllEvent()
	return flag
}

defineExpose({
	validate,
	tableData,
  getDetailList,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px;
	justify-content: space-between;
	align-items: center;
}
</style>
