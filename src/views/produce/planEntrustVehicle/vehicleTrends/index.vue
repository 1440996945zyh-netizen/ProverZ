<!--车辆动态detail-->
<template>
  <div>
    <div class="app-container">
      <BaseTable
        ref="baseTable"
        :showSearchHeader="true"
        :selectData="selectData"
        :searchClick="getVehicleTrendsDrawer"
        :buttonList="buttonList"
        :tableColumns="tableColumns"
        :tableData="tableData"
        :checkbox-config="checkboxconfig"
        @checkbox-all="selectAllChangeEvent"
        :selectAllChangeEvent="selectAllChangeEvent"
        @checkbox-change="selectChangeEvent"
        :total="total"
      />

      <el-dialog v-model="updateBatchDialog" title="批量修改" width="50%" >
        <el-form  ref="updateBatchRef" :model="updateBatchData" :rules="rules">
          <el-form-item label="结束日期:" prop="planEndTime">
            <el-date-picker
              v-model="updateBatchData.planEndTime"
              type="datetime"
              placeholder="请选择时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
            />
          </el-form-item>
          <el-form-item label="进港次数:" prop="arrivalNum">
            <el-input-number v-model="updateBatchData.arrivalNum" :min="1" :max="100" @change="handleChange" />
          </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
              <el-button @click="saveUpdateBatch ">保存</el-button>
              <el-button @click="updateBatchDialog = false">返回</el-button>
            </span>
        </template>
      </el-dialog>

      <!-- 车辆跟踪 -->
      <el-dialog
        v-model="vehicleTrackDialog"
        title="提示"
        width="50%"
      >
        <div class="vehicle-track-dialog-content">
          {{ vehicleTrackText  }}
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="vehicleTrackDialog = false">取消</el-button>
            <el-button type="primary" @click="vehicleTrackDialog = false">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup name="ship">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/planEntrustVehicle'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const updateBatchRef = ref()
const total = ref('') // 数据总数
const clickRow = ref({})
const planNo = ref('')
const updateBatchDialog = ref(false)
const baseTable = ref()
const updateBatchData = ref({
  //结束日期
  planEndTime: '',
  //进港次数
  arrivalNum: 1,
})
// 校验
const rules = reactive({
  planEndTime: proxy.getRules({ required: true}),
  arrivalNum: proxy.getRules({ required: true }),
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  {
    prop: 'vehicleNo',
    label: '车牌号',
    width: 100,
    align: 'center'
  },
  {
    prop: 'driverNameOne',
    label: '司机姓名',
    width: 100,
    align: 'left'
  },
  {
    prop: 'driverNoOne',
    label: '司机身份证号',
    width: 200,
    align: 'center',
  },
  {
    prop: 'driverPhoneOne',
    label: '司机手机号',
    width: 120,
    align: 'center',
  },
  {
    prop: 'arrivalNum',
    label: '进港次数',
    width: 100,
    align: 'right',
  },
  /*{
    prop: 'yardCode',
    label: '作业位置',
    minWidth: 180,
    align: 'left',
  },
  {
    prop: 'planNo',
    label: '计划号',
    minWidth: 150,
    align: 'left'
  },
  {
    prop: 'shipNameVoyage',
    label: '船名航次',
    minWidth: 150,
  },*/
    // {
    //   prop: 'consigneeName',
    //   label: '物流公司名称',
    //   width: 200,
    //   align: 'left'
    // },
    // {
    //   prop: 'consignorName',
    //   label: '货主公司名称',
    //   width: 200,
    //   align: 'left'
    // },
/*  {
    prop: 'planTime',
    label: '计划时间',
    width: 250,
    align: 'center'
  },*/
  {
    prop: 'createTime',
    label: '派车时间',
    width: 'time',
    align: 'center'
  },
  {
    prop: 'actInPortNum',
    label: '实际进港次数',
    width: 130,
    align: 'right'
  },
  {
    prop: 'trendStatus',
    label: '最新动态',
    width: 110,
    align: 'center',
    render: row => {
      let textFlag = ''
      textFlag = row.trendStatus == 1 ? '不在港' : '在港'
      return [
        h(
          'div',
          {},
          {
            default: () => textFlag,
          }
        ),
      ]
    },
  },
  {
    label: '计划状态',
    prop: 'status',
    width: 110,
    fixed: 'right',
    render: row => {
      let typeFlag = ''
      typeFlag = row.status == 1 ? 'info' : 'success'
      let textFlag = ''
      textFlag = row.status == 1 ? '停止' : '启动'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => textFlag,
          }
        ),
      ]
    },
  },
  /*{
    prop: '',
    label: '操作',
    width: 120,
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              openVehicleTrack(row)
            },
            type: 'primary',
            link: true,
            icon: 'Notification',
            disabled:row.status == 1 ? true : false
            // permission: 'vehicleReservation:planEntrust:update', // 权限
          },
          {
            default: () => '车辆跟踪',
          }
        ),
      ]
    },
  },*/
])
const selectData = reactive([
  {
    name: '车号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'vehicleNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '司机', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'driverNameOne', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '计划状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 8, // 占位，共24
    selectData: [
      {
        value: '1',
        label: '停止',
      },
      {
        value: '0',
        label: '启动',
      },
    ],
  },
  /*{
    name: '进港状态',
    type: 'select',
    modelValue: 'trendStatus',
    span: 8,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      url: '/api/internal/public/getDictListByType/VEHICLE_STATUS',
      method: 'get',
    },
  },*/
])
const buttonList = reactive([
  // {
  // 	label: '批量修改', // 按钮名称
  // 	type: 'primary', // 按钮类型
  // 	icon: 'edit', // 按钮图标，支持element-Plus中所有图标
  // 	click: () => updateBatch, // 回调函数
  // 	permission: 'ship:shipInfo:query', // 权限
  // },
  // {
  // 	label: '批量删除', // 按钮名称
  // 	type: 'danger', // 按钮类型
  // 	icon: 'delete', // 按钮图标，支持element-Plus中所有图标
  // 	click: () => deleteBatch, // 回调函数
  // 	permission: 'ship:shipInfo:query', // 权限
  // },
  // {
  //   label: '批量开启', // 按钮名称
  //   type: 'primary', // 按钮类型
  //   icon: 'VideoPlay', // 按钮图标，支持element-Plus中所有图标
  //   click: () => startBatch, // 回调函数
  //   permission: 'ship:shipInfo:query', // 权限
  // },
  // {
  //   label: '批量停止', // 按钮名称
  //   type: 'primary', // 按钮类型
  //   icon: 'VideoPause', // 按钮图标，支持element-Plus中所有图标
  //   click: () => stopBatch, // 回调函数
  //   permission: 'ship:shipInfo:query', // 权限
  // }
])
const checkboxconfig = ref({
  strict: false, // 可以取消
  reserve:false, // 是否保留选中状态
  showHeader:true, // 是否显示全选
  checkAll:false, // 是否全选
  range:true, // 	开启复选框范围选择功能
})
const handleChange = (value) => {
}

const queryParams = ref({
  vehicleNo:'',
  driverNameOne:'',
  status:'',
  trendStatus:'',
  planNo: '',
  startPage: 1,
  pageSize : 10
})
// 查询车辆动态
const getVehicleTrendsDrawer = e => {
  queryParams.value.planNo = planNo.value
  queryParams.value ={
    ...queryParams.value,
    ...e
  }
  api.getVehicleTrendsDrawerList(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}

// 停止/开启(单条数据)
const updateStatus = e =>{
  const message = e.status == '1'?'确定开启?' :'确定停止?'
  proxy.$modal
    .confirm(message)
    .then(res => {
      const statusNow =  e.status == '1' ? '0' : '1'
      const params = {
        id:e.id, // 主键
        status:statusNow, // 状态
      }
      api.updateStatus(params).then(res=>{
        if (res.code == '0000') {
          getVehicleTrendsDrawer()
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    })
}

// 删除(单条数据)
const deleteOne = e =>{
  proxy.$modal
    .confirm('确定删除?')
    .then(res => {
      api.deleteVehicleReservation(e.id).then(res=>{
        if (res.code == '0000') {
          getVehicleTrendsDrawer()
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    })
}


const checkedBatch = ref([])
const Ids = ref([])

// 批量修改
const updateBatch = e => {
  if (checkedBatch.value.length == 0){
    proxy.$message.warning('请选择至少一条数据')
    return
  }
  updateBatchDialog.value = true
  Ids.value = []
  for (let i = 0; i < checkedBatch.value.length; i++){
    Ids.value[i] = checkedBatch.value[i].id
  }
}


// 批量开启
const startBatch= e => {
  if (checkedBatch.value.length == 0){
    proxy.$message.warning('请选择至少一条数据')
    return
  }
  // 判断多选的数据的状态
  let flag = false
  for (let i = 0;i<checkedBatch.value.length;i++){
    if(checkedBatch.value[i].status=='0'){
      // 该数据为开启状态
      continue
    }else {
      flag = true
    }
  }
  // 没有一条数据是停止状态,都是开启状态
  if (flag == false){
    proxy.$message.warning('您所选择的数据都为开启状态')
    return
  }
  proxy.$modal
    .confirm('确定开启？')
    .then(res => {
      Ids.value = []
      // 把选中的数据id导入到一个数组里
      for (let i = 0; i < checkedBatch.value.length; i++){
        Ids.value[i] = checkedBatch.value[i].id
      }
      const params = {
        idList : Ids.value,
        status : '0'
      }
      api.updateBatchStatus(params).then(res=>{
        if (res.code == '0000') {
          getVehicleTrendsDrawer()
          checkedBatch.value = []
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    })
    .catch(err => {})
}


// 批量停止
const stopBatch= e => {
  if (checkedBatch.value.length == 0){
    proxy.$message.warning('请选择至少一条数据')
    return
  }
  // 判断多选的数据的状态
  let flag = false
  for (let i = 0;i<checkedBatch.value.length;i++){
    if(checkedBatch.value[i].status=='1'){
      // 该数据为停止状态
      continue
    }else {
      flag = true
    }
  }
  // 没有一条数据是停止状态,都是开启状态
  if (flag == false){
    proxy.$message.warning('您所选择的数据都为停止状态')
    return
  }
  proxy.$modal
    .confirm('确定停止？')
    .then(res => {
      Ids.value = []
      // 把选中的数据id导入到一个数组里
      for (let i = 0; i < checkedBatch.value.length; i++){
        Ids.value[i] = checkedBatch.value[i].id
      }
      const params = {
        idList : Ids.value,
        status : '1'
      }
      api.updateBatchStatus(params).then(res=>{
        if(res.code == '0000'){
          getVehicleTrendsDrawer()
          checkedBatch.value = []
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    })
    .catch(err => {})
}


// 批量删除
const deleteBatch= e => {
  if (checkedBatch.value.length == 0){
    proxy.$message.warning('请选择至少一条数据')
    return
  }
  proxy.$modal
    .confirm('确定删除？')
    .then(res => {
      Ids.value = []
      // 把选中的数据id导入到一个数组里
      for (let i = 0; i < checkedBatch.value.length; i++){
        Ids.value[i] = checkedBatch.value[i].id
      }
      const params = {
        idList : Ids.value
      }
      api.deleteBatch(params).then(res=>{
        if(res.code == '0000'){
          getVehicleTrendsDrawer()
          checkedBatch.value = []
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    })
    .catch(err => {})
}

// 批量修改 - 保存
const saveUpdateBatch =e =>{
  if (Ids.value.length<=0){
    proxy.$message.warning('请选择至少一条数据')
    return
  }
  updateBatchRef.value.validate((valid, fields) => {
    if (!valid) {
      proxy.$message.warning('请完善表单信息！')
      return
    } else {
      const params = {
        idList : Ids.value,
        planEndTime : updateBatchData.value.planEndTime,
        arrivalNum : updateBatchData.value.arrivalNum
      }
      api.updateBatch(params).then(res=>{
        if(res.code == '0000'){
          updateBatchDialog.value = false
          getVehicleTrendsDrawer()
          checkedBatch.value = []
          proxy.$message.success(res.msg)
        }else proxy.$message.error(res.msg)
      })
    }
  })
}

// 全选事件
const selectAllChangeEvent = ({ checked }) =>{
  // checked - 是否全选
  checkedBatch.value = checked ? tableData.value : []
}
// 选中事件
const selectChangeEvent = e =>{
  checkedBatch.value = []
  checkedBatch.value = e
}

// 初始化 清空搜索框数据
const init = () =>{
  queryParams.value.vehicleNo=''
  queryParams.value.driverNameOne=''
  queryParams.value.status=''
  queryParams.value.trendStatus=''
  proxy.$bus.emit('setInitSearchData',{
    vehicleNo:'',
    driverNameOne:'',
    status:'',
    trendStatus:''
  })
}

// 车辆跟踪相关
const vehicleTrackDialog = ref(false);
const vehicleTrackText = ref(null);
const openVehicleTrack = (row) => {
  vehicleTrackDialog.value = true;
  api.getCarMsgAnchApply({
    anId:row.id
  }).then( d => {
    if(d.code === '0000'){
      vehicleTrackText.value = d.data;
    }
  })
}

defineExpose({
  planNo,
  queryParams,
  init,
  getVehicleTrendsDrawer,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
.vehicle-track-dialog-content{
  padding: 10px;
  font-size: .95rem;
}
</style>
