<template>
  <div>
    <el-form :model="formData" ref="ruleForm" label-position="top" :rules="rules" :disabled='lookFlag'>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="源票货" name="sourceCargo">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="货主" prop="cargoOwnerId">
                <div style="width: 100%">
                  <RemoteSelect
                    type="CUSTOMER_CARGO_OWNER"
                    v-model:value="formData.cargoOwnerId"
                    v-model:label="formData.cargoOwnerName"
                    @change="cargoOwnerChang"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="是否生成混配作业费" prop="isBilling">
                <div style="width: 100%">
                  <el-radio-group v-model="formData.isBilling" @change="isBillChange(e)" :disabled="lookFlag">
                    <el-radio label="1" value="1">是</el-radio>
                    <el-radio label="0" value="0">否</el-radio>
                  </el-radio-group>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <EditTable
            ref="portStorageLogs"
            :showSearchHeader="false"
            :tableColumns="tableLogColumns"
            :tableData="tableLogData"
            :tableHeight="tableHeight"
            :checkbox-config="checkboxConfig"
            :selectAllChangeEvent="checkboxChangeEvent"

            @checkbox-change="checkboxChange"
            @blur = 'countMixWeight'
          />
        </el-collapse-item>
        <el-collapse-item title="新票货" name="workInfo">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="货名" prop="cargoName">
                <div style="width: 100%">
                  <RemoteSelect
                    type="CARGO_INFO_SIGN"
                    v-model:value="formData.cargoCode"
                    v-model:label="formData.cargoName"
                    @change="cargoInfoChange"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港" prop="shipVoyageItem">
                <div style="width: 100%">
                  <RemoteSelect
                    type="SHIPVOYAGE_ITEM"
                    v-model:value="formData.shipvoyageItemId"
                    v-model:label="formData.shipNameVoyage"
                    placeholder="船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港"
                    @change="shipNameVoyageChange"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="垛位" prop="massId">
                <div >
                  <RemoteSelect
                    type="ALL_STORAGE_MASS"
                    v-model:value="formData.massId"
                    v-model:label="formData.label"
                    @change="massChange"
                  />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="混配总重量" prop="remark">
                <div style="width: 100%">
                  <el-input readonly v-model="formData.mixWeightCount" />
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item
                label="混配时间"
                prop="mixTime"
              >
                <el-date-picker
                  v-model="formData.mixTime"
                  value-format="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  type="datetime"
                  placeholder="混配时间"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup name="sourceCargo">
import {ref, reactive, getCurrentInstance, nextTick, h} from 'vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index'
import api from '@/api/business/cargoTrustMix/index'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
import { getDuration } from '@/utils/index.js'
import MyMath from '../../../../utils/math'
import {ElButton} from "element-plus";
import tableParamsStore from '@/store/modules/tableParams'
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const portStorageLogs = ref()
const ruleForm = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const workPlanId = ref(null)
const equipmentNoList = ref([]) //机械编号
const workDeptMacList = ref([]) //申请机械部门
const editOrAudit = ref(false) //禁止按钮
const isHidden = ref(false) //禁止按钮
const isHourMeterHidden = ref(true) //禁止按钮
const rowConfig = {isCurrent: true, isHover: true, height: 50, keyField: 'row_id'}
//表格ref
const tableRef = ref();
const tableLogRef = ref();
const lookFlag = ref(false);
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
  id: ''
})
const tableLogData = ref([])
const total = ref(0)
// 校验规则
const rules = ref({
  cargoOwnerId: proxy.getRules({ required: true }),
  cargoName: proxy.getRules({ required: true }),
  massId: proxy.getRules({required: true  }),
  mixTime: proxy.getRules({    required: true  }),
})

const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const tablePageHeight = tableParams.pageTableHeight
const activeNames = reactive(['sourceCargo', 'mechanicalType','workInfo','workTime','changeLog']) //控制默认展开
const contractList = ref([])
const tableLogColumns = ref([
  { label: '', type: 'checkbox', width: 40,fixed: 'left',},
  { label: '票货号', prop: 'cargoInfoNo' ,align: 'center', width: 160 },
  { label: '库场', prop: 'storehouseName' ,align: 'center', width: 170 },
  { label: '区域', prop: 'regionName' ,align: 'center', width: 130 },
  { label: '垛位', prop: 'massName' ,align: 'left', width: 150 },
  { label: '重量', prop: 'ton' ,align: 'left', width: 180 },
  {
    prop: 'mixWeight',
    label: '混配重量',
    fixed:'right',
    width: 150,
    editRender: {},
    editType: 'input',
    disabled: lookFlag,
  },
  {
    prop: 'contractId',
    label: '选择合同',
    fixed:'right',
    width: 150,
    editRender: {},
    editType: 'select',
    modelValue: 'contractId',
    modelLabel: 'contractNo',
    selectLabel:'contractNo',
    selectValue:'contractId',
    selectData: contractList,
    disabled: lookFlag,
    change: (e, row) => {
      // console.log('e', e)
      // console.log('row', row)
      // 根据选择费率进行处理
      row.contractId = ''
      row.contractNo = ''
      row.freeStorageDays = 0

      row.contractId = e.contractId
      row.contractNo = e.contractNo
      row.freeStorageDays = e.freeStorageDays

    },
  },
  {
    prop: 'freeStorageDays',
    label: '免堆存天数',
    fixed:'right',
    width: 150,
  },

])

const formData = ref({
  id :'',
  cargoCode:'',
  mixTime:'',
  details:'',
  regionId:'',
  storehouseId:'',
  mixWeightCount:0,
  shipvoyageItemId:'',
  shipNameVoyage:'',
  isBilling:'1'
})

const cargoOwnerChang = (e)=>{
  console.log("货主改变事件")
  if(formData.value.cargoOwnerId!=''){
    let tmpParams={
      cargoOwnerId :formData.value.cargoOwnerId,
    }
    if(lookFlag.value==false){
      api.listPortStorage(tmpParams).then(res=>{
        let cargoInfoList = res.data.map(o => {
          return o.cargoInfoId
        })
        let resultIds = cargoInfoList.filter((item, index) => {
          return cargoInfoList.indexOf(item) === index
        }).join(',')
        if(resultIds.length>0){
          api.getContractList(resultIds).then(res=>{
            console.log(res,"合同查询返回接口")
            nextTick(()=>{
              if(res.code === '0000'){
                contractList.value = res.data
              }else {
                contractList.value = []
              }
            })
          })
        }

        tableLogData.value = res.data
      })
    }

  }
}
const cargoInfoChange = async ()=>{/*
  console.log("货名事件")

  if(formData.value.cargoCode!=''&&(formData.value.cargoOwnerId!=undefined&&formData.value.cargoOwnerId!=null&&formData.value.cargoOwnerId!='')){
    let tmpParams={
      cargoOwnerId :formData.value.cargoOwnerId,
      cargoCode:formData.value.cargoCode
    }
    if(lookFlag.value==false){
      api.listPortStorage(tmpParams).then(res => {
        if (res.code === '0000') {
          let cargoInfoList = res.data.map(o => {
            return o.cargoInfoId
          })
          let resultIds = cargoInfoList.filter((item, index) => {
            return cargoInfoList.indexOf(item) === index
          }).join(',')
          if(resultIds.length>0){
            api.getContractList(resultIds).then(res=>{
              console.log(res,"合同查询返回接口")
              nextTick(()=>{
                if(res.code === '0000'){
                  contractList.value = res.data
                }else {
                  contractList.value = []
                }
              })
            })
          }

        }
        tableLogData.value = res.data

      })
    }
  }*/
}
const massChange = (e) =>{
  formData.value.regionId = e.regionId
  formData.value.storehouseId= e.storehouseId
}


const getContractList=(cargoInfoIds)=>{
  console.log(cargoInfoIds,"cargoInfoIds")
  api.getContractList(cargoInfoIds).then(res=>{
    nextTick(()=>{
      if(res.code === '0000'){
        contractList.value = res.data
      }else {
        contractList.value = []
      }
    })
  })
}




const countMixWeight=()=>{
  let tmpCountTime = 0

  formData.value.details.forEach(item => {
    tmpCountTime += parseFloat(item.mixWeight)
  })
  formData.value.mixWeightCount = tmpCountTime
}
const checkboxChangeEvent = data => {
  console.log("全选事件")
  formData.value.details = []
  formData.value.details = data

  let tmpCountTime = 0
  formData.value.details.forEach(item => {
    tmpCountTime += parseFloat(item.mixWeight)
  })
  formData.value.mixWeightCount = tmpCountTime
}

const checkboxChange = data => {

  formData.value.details = []
  formData.value.details = data
  let tmpCountTime = 0
  formData.value.details.forEach(item => {
    tmpCountTime += parseFloat(item.mixWeight?item.mixWeight:0)
  })
  formData.value.mixWeightCount = tmpCountTime
}



const validate = async () => {
  let flags = false
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      flags = true
      console.log('succ')
    } else {
      flags = false
      proxy.$modal.msgWarning('请完善表单信息！')
      console.log('err')
    }
  })
  return flags
}


const handleDelete = row => {
}

const macNoChange = val =>{
}
const times = ref([])


const resetForm = () => {
    formData.value.id ='',
    formData.value.cargoCode='',
    formData.value.cargoName='',
    formData.value.cargoOwnerId = '',
    formData.value.cargoOwnerName = '',
    formData.value.mixTime='',
    formData.value.details='',
    formData.value.massId='',
    formData.value.regionId='',
    formData.value.storehouseId='',
    formData.value.mixWeightCount=0
    formData.value.shipvoyageItemId = ''
    formData.value.shipNameVoyage = ''
    formData.value.isBilling = '1'
    formData.value.details = []
    tableLogData.value = []

}


const init = () => {

}
const inits = () => {
  publicApi.getLocalSelect({ type: 'MAC', macTypeCode: formData.value.macTypeCode }).then(res => {
    equipmentNoList.value = res.data
  })
}




defineExpose({
  validate,
  resetForm,
  formData,
  editOrAudit,
  isHidden,
  init,
  inits,
  lookFlag,
  tableLogData,
  portStorageLogs,
  contractList,
  queryParams,

  isHourMeterHidden
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
