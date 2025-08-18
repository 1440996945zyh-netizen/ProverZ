<template>
	<div class="app-container">
		<BaseTable
			ref="handoverTableRef"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			@handleChange="handleChange"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
      :tableHeight="'drawerHeaderPageTableHeight'"
      :showNum = '4'
			:total="total"
      :cellDBLClickEvent = "dbClickEvent"
		/>
    <el-collapse v-model="collapseOpen">
      <el-collapse-item title="结算明细" name="1">
      <template v-slot:title>
        <div style="display: flex; justify-content: space-between; width: 95%">
          <div>结算历史</div>
          <div>
            <el-button type="primary" @click.stop="costDetail" :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <Edit />
              </el-icon>
              结算明细
            </el-button>
			  <el-button v-if="routeType == '1'" type="primary" @click.stop="revokeCost" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <Refresh />
				  </el-icon>
				  撤销结算
			  </el-button>
			  <el-button v-if="routeType == '3'" type="primary" @click.stop="review" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <View />
				  </el-icon>
				  审核
			  </el-button>
			  <el-button v-if="routeType == '3'" type="primary" @click.stop="revokeReview" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <Refresh />
				  </el-icon>
				  销审
			  </el-button>
            <el-button  v-if="routeType!='2'" type="primary" @click.stop="export1" :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <Download />
              </el-icon>
              导出
            </el-button>
            <el-button v-if="routeType=='2'" type="primary" @click.stop="uploadBusinessFile"  :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <Download />
              </el-icon>
              上传回执单
            </el-button>
            <el-button  v-if="routeType=='2'" type="primary" @click.stop="businessAffirm" :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <Refresh />
              </el-icon>
              回执确认
            </el-button>
            <el-button  v-if="routeType=='2'" type="primary" @click.stop="cancelBusinessAffirm" :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <View />
              </el-icon>
              取消回执确认
            </el-button>
          </div>
        </div>
      </template>
        <BaseTable
          ref="countTableRef"
          :showSearchHeader="false"
          :tableColumns="countTableColumns"
          :tableData="countTable"
          :tableHeight="300"
          :cellClickEvent="countTableEvent"
          :autoResize="true"
          :cellDBLClickEvent = "dbDetailClickEvent"
        />
      </el-collapse-item>
    </el-collapse>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="结算详情" size="80%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click=";(drawerVisible = false), (isDisabled = false)">
						{{ isDisabled ? '关闭' : '取消' }}
					</el-button>
<!--
					<el-button v-if="isDisabled" type="primary" @click="save">保存</el-button>
-->
          <el-button type="primary" v-if="routeType=='0'"  @click.stop="recudeInfoSave" >减免信息保存</el-button>
          <el-button type="primary"  @click.stop="costEvent" v-if="routeType == '1'" >保存</el-button>
          <el-button type="primary" @click.stop="export1"  v-if="isDisabled">
						<el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出(已计费)
					</el-button>
					<el-button type="primary" @click.stop="export2"  v-if="isAppear">
						<el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出(计算)
					</el-button>
				</div>
			</template>
		</el-drawer>

    <!-- 商务上传回执单弹窗 -->
    <el-dialog title="上传回执单" v-model="dialogUploadVisible" width="40%">
      <Upload
        businessType="BUSINESS_RECEIPT"
        :businessId="businessId"
        @changeFile="changeFile"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogUploadVisible = false">关 闭</el-button>
          <el-button @click="saveFile" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
    <!--  图片展示  -->
    <el-dialog    v-model="dialogVisible" title="回执单信息查看" width="1000" height="800px" >
      <el-carousel  indicator-position="outside" :interval="5000" style="height: 500px">
        <span v-show="imgurl.length==0">图片正在加载中,请耐心等待...</span>
        <el-carousel-item v-for="item in imgurl" :key="item" style="height: auto">
          <img  :src="item" class="image"  >
        </el-carousel-item>
      </el-carousel>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false ,flagCommon = false ">关闭</el-button>
      </span>
      </template>
    </el-dialog>
    <!--  商务回执确认弹窗  -->
    <el-dialog title="回执确认" v-model="hzDialogVisible" width="40%">
      <el-form :model="hzFormData" ref="hzFormRef" label-width="80px" :rules="rules">
        <el-form-item label="发票类型" prop="voidReason">
          <el-radio-group v-model="hzFormData.taxInvoiceCode">
            <el-radio v-for="item in taxInvoiceTypeList" :key="item.id" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

          <el-form-item
            label="回执备注"
            prop="receiptRemark"
          >
            <el-input type="textarea" v-model="hzFormData.receiptRemark"></el-input>
          </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="hzDialogVisible = false">关 闭</el-button>
          <el-button @click="submitHzForm" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="stackFeeCountNew">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/statement/stackFeeCountNew/index.js'
import publicApi from '@/api/public/index'
import drawer from './drawer/index.vue'
import {ref, reactive, toRefs, onMounted} from 'vue'
import { ElButton, ElTag } from 'element-plus'
import Upload from '@/components/upload'
import Select from '@/components/Select/index.vue'
import * as XLSX from 'xlsx'
import ReportTemplate from '@/assets/exceltemplates/堆存费结算导出模板.xlsx'

const { proxy } = getCurrentInstance()

const drawerVisible = ref(false) //新增修改抽屉
const costDetailButton = ref(true) //新增修改抽屉
const isDisabled = ref(false)
const isAppear = ref(false)
const collapseOpen = ['1'] // 打开的面板
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
// 获取路由参数
import { useRoute } from 'vue-router'
import math from "../../../utils/math";
const route = useRoute()
const routeType = JSON.parse(route.meta.query).id   //0堆存费计算   1 堆存费结算
const stackFeeType = JSON.parse(route.meta.query).stackFeeType   //0结算   1 计算
const queryParams = ref({
	startPage: 1,
	pageSize: 15,
})
const selectData = ref([
  {
    name: '船名航次', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'shipvoyageItemId', // 绑定字段
    span: 6, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '货主', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoOwnerId', // 绑定字段
    span: 6, // 占位，共24
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 6, // 占位，共24
  },
  {
    name: '船舶状态',
    type: 'select',
    modelValue: 'shipStatusCode', //对应字段
    span: 6,
    dataConfig: {
      url: '/api/internal/public/getDictListByType/SHIPSTATUS',
    },
  },
  {
    name: '货名',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span:2,
  },
  {
		name: '离泊时间起始', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'beginLeaveBerthTime', //绑定字段
		span: 2, //占位多少，总共24
	},
	{
		name: '离泊时间截止', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'endLeaveBerthTime', //绑定字段
		span: 2, //占位多少，总共24
	},
  {
    name: '是否超期',
    type: 'select',
    modelValue: 'isOverdue',
    span: 2,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    name: '是否完货',
    type: 'select',
    modelValue: 'isClear',
    span: 2,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    name: '进出口',
    type: 'select',
    modelValue: 'impExp',
    span: 2,
    selectData: [{value:'IN',label:'进口'},{value:'OUT',label:'出口'}],
  },
  {
    name: '到港编号',
    type: 'input', // 搜索框类型
    modelValue: 'scn', // 绑定字段
    span:2,
  },
  {
    name: '合同号',
    type: 'input', // 搜索框类型
    modelValue: 'contractCode', // 绑定字段
    span:2,
  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'statementStatus',
    span: 2,
    selectData: [
      {value:'10',label:'未结算'},
      {value:'20',label:'已预结'},
      {value:'30',label:'最终结算'}
      ],
  },
  {
    name: '件散',
    type: 'select',
    modelValue: 'workType',
    span: 2,
    selectData: [
      {value:'1',label:'件杂'},
      {value:'2',label:'散杂'}
      ],
  },
  {
    name: '作业公司',
    type: 'select', //下拉框，字典
    modelValue: 'companyId', //对应字段
    span: 2,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
  {
    name: '是否截止计费',
    type: 'select',
    modelValue: 'isReduceTypeThree',
    span: 2,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
])
const buttonList = reactive([
	{
		label: '堆存费结算', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Money', // 按钮图标，支持element-Plus中所有图标
		click: () => cost, // 回调函数
		// permission: (routeType == '1') ? "business:costStatement:cost" : "", // 权限
		permission:"statement:stackFee:cost" , // 权限
	},
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => exportPage, // 回调函数
    permission: 'statement:stackFee:exportPage', // 权限
  },
])
// 结算单end -------------
const settlementList = ref([])
//多选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
//全选事件
const selectAllChange = ({ checked })  =>{
  //解禁按钮
  buttonList.forEach(item => (item.disabled = false))
  settlementList.value = checked ? tableData.value : []
  if( settlementList.value.length>0){
    costDetailButton.value=false
  }else{
    costDetailButton.value=true
  }
}
//复选框改变事件
const checkboxChange = data =>{
  //console.log(data,"复选框改变事件");
  settlementList.value = JSON.parse(JSON.stringify(data))
  //解禁按钮
  if( settlementList.value.length>0){
    costDetailButton.value=false
  }else{
    costDetailButton.value=true
  }
}
// 点击查询的事件
const getList = e => {
  buttonList.forEach(item =>{

      if(item.label!='导出') {
        item.disabled = true
      }

  }
    )
  clickRow.value = {}
  countTable.value = []
  queryParams.value.isCalculate = stackFeeType
  api.listCargoInfo( Object.assign(queryParams.value,e )).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
const exportPage = e => {
  buttonList.forEach(item =>{

    if(item.label!='导出') {
      item.disabled = true
    }

  })
  clickRow.value = {}
  countTable.value = []
  queryParams.value.isCalculate = stackFeeType
  api.pageExport( Object.assign(queryParams.value,e )).then(res => {
    downLoadBlob(res, '堆存费')

  })
}

//打印账单
const printCostBill = () => {
  if(clickRow.value.status == '10'){
    proxy.$message.error('请先计费审核之后再打印')
    return
  }
	proxy.$modal.confirm('确定下载？').then(() => {
		api.printCostBill(clickRow.value.id).then(res => {
			downLoadBlob(res, '包干费计费')
		})
	})
}
//下载excel事件
const downLoadBlob = (file, filename) => {
	let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	let url = URL.createObjectURL(blob)
	let a = document.createElement('a')
	a.href = url
	a.style.display = 'none'
	document.body.appendChild(a)
	a.setAttribute('download', filename)
	a.click()
	document.body.removeChild(a)
}
// 交接单 -------------------
const handoverTableRef = ref()
const total = ref(0)

// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '票货来源', prop: 'source', width:100,},

  { label: '票货号', prop: 'cargoInfoNo', width: 184 , },
  { label: '货主', prop: 'cargoOwnerName', width: 220 },
  { label: '货名', prop: 'cargoName', minWidth: 150 },
  { label: '作业模式', prop: 'workTypeLabel', isTime: true, width: 101 },
  { label: '船名航次', prop: 'shipNameVoyage', width: 170 },
  { label: '泊位', prop: 'berthName' ,width: 90, align: 'center'},

  { label: 'SCN', prop: 'scn', width: 90 , },
  { label: '靠泊时间', prop: 'berthTime', isTime: true, width: 168 },
  { label: '开工时间', prop: 'workStartTime', width: 150 },
  { label: '完工时间', prop: 'workEndTime', width: 150 },
  { label: '离泊时间', prop: 'leaveBerthTime', isTime: true, width: 171 },
  { label: '装卸', prop: 'loadUnload', width: 79 },
  { label: '进出口', prop: 'impExpLabel', width: 90 },
  { label: '贸别', prop: 'tradeType', width: 74 },
  { label: '首次集港时间', prop: 'minWeighOutDt', width: 170 },
  { label: '货转时间', prop: 'transferDate', width: 170 },
  { label: '混配时间', prop: 'mixTime', width: 170 },
  { label: '完货人', prop: 'clearByName', width: 90 },
  { label: '完货时间', prop: 'realClearDate', width: 100 },

  { label: '通知单编号', prop: 'trustNo', width: 121 },
  { label: '指令发布时间', prop: 'releaseTime', isTime: true,  width: 170 },

  { label: '作业公司', prop: 'companyName', width: 200 },
  { label: '截止计费', prop: 'isReduceTypeThree', width: 100,align: "center" ,fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isReduceTypeThree == '是' ? 'error' : 'info',
          },
          {
            default: () => row.isReduceTypeThree,
          }
        )
      ]
    },},

  {
    label: '结算状态',
    prop: 'statementStatus',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.statementStatus == '10' ? 'success' : 'info',
          },
          {
            default: () => row.statementStatus == '10'?'未结算':(row.statementStatus == '20'?'已预结':(row.statementStatus == '30'?'最终结算':'')),
          }
        )
      ]
    },
  },
  {
    label: '是否超期',
    prop: 'isOverdue',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      if (row.overdueDays || row.overdueDays === 0) {
        return [
          h(
              ElTag,
              {
                type: row.overdueDays > 0 ? 'warning' : 'success',
              },
              {
                default: () => row.overdueDays > 0 ? '是' : '否',
              }
          )
        ]
      } else {
        return [h('div', {}, '')]
      }
    },
  },
  {
    label: '超期天数',
    prop: 'overdueDays',
    align: 'center',
    width: 100,
    fixed: 'right',
  },
  {
    label: '是否完货',
    prop: 'isClearLabel',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isClearLabel == '是' ? 'success' : 'info',
          },
          {
            default: () => row.isClearLabel,
          }
        )
      ]
    },
  },
])
// 获取点击行数据
const businessId = ref('')  //文件上传用
const fileList = ref([]) //文件列表
//图片地址
const imgurl = reactive([])
const uploadRef = ref(null)
// 结算单 -------------
const countTableRef = ref()
const countTable = ref([])
const countList = ref([])
//单击事件
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  costDetailButton.value=true
  buttonList.forEach(item => (item.disabled = false))
  let tmpParams = {
    cargoInfoId :row.id
  }
  api.listStorageSettle(tmpParams).then(res => {
    countTable.value = []
    for (let i = 0; i < res.data.length; i++) {
      let details = res.data[i];
      countTable.value.push(details);
    }
  })
}
// 交接单end ----------------------

const costDetails =ref([])
const costDetail = async  () => {
  drawerVisible.value = true
  costDetails.value =countTableClickRow.value.details

  let tmpReduceForm = {
    reduceId :'',
    reduceType :'',
    reduceDays :'',
    reduceEndDate:'',
    reduceRemark :'',
    calEndDate:''
  }
  console.log(countTableClickRow.value.cargoInfoId,"票货id");
  await api.getReduceList(countTableClickRow.value.cargoInfoId).then(res=>{
    let tmpList = []
    tmpList = res.data
    if(tmpList.length==1){
      tmpReduceForm.reduceId      = tmpList[0].id
      tmpReduceForm.reduceType    = tmpList[0].reduceType
      tmpReduceForm.reduceDays    = tmpList[0].reduceDays
      tmpReduceForm.reduceEndDate = tmpList[0].reduceEndDate
      tmpReduceForm.reduceRemark  = tmpList[0].remark
      tmpReduceForm.calEndDate  = tmpList[0].calEndDate

    }
    // console.log('tmpReduceForm.calEndDate',tmpList[0].calEndDate)
  })

  nextTick(async () => {
    // console.log('tmpReduceForm.calEndDate',tmpReduceForm.calEndDate);
    isDisabled.value = true
	  isAppear.value = false
    drawerRef.value.resetForm()
    drawerRef.value.disableContract=true
    proxy.setFormData(drawerRef.value.formData, countTableClickRow.value)
    proxy.setFormData(drawerRef.value.formData, clickRow.value)
    drawerRef.value.formData.allPrice = countTableClickRow.value.amount
    drawerRef.value.formData.reduceAmount = countTableClickRow.value.reduceAmount
    drawerRef.value.formData.reduceBeforeAmount = math.numAdd(countTableClickRow.value.amount , countTableClickRow.value.reduceAmount?countTableClickRow.value.reduceAmount:0)
    drawerRef.value.formData.stackFeeType = stackFeeType
    drawerRef.value.formData.reduceId =       tmpReduceForm.id
    drawerRef.value.formData.reduceType =     tmpReduceForm.reduceType
    drawerRef.value.formData.reduceDays =     tmpReduceForm.reduceDays
    drawerRef.value.formData.reduceEndDate =  tmpReduceForm.reduceEndDate
    drawerRef.value.formData.reduceRemark =   tmpReduceForm.remark
    drawerRef.value.formData.calEndDate =   tmpReduceForm.calEndDate

    const detailData = JSON.parse(JSON.stringify(costDetails.value))
    drawerRef.value.setTableData2(detailData)
    //交接清单量
    let tmpHannoverListTonParam = {
      cargoInfoId:countTableClickRow.value.cargoInfoId
    }
    await api.getHandoverlistTon(tmpHannoverListTonParam).then(res=>{
      drawerRef.value.formData.handoverlistTon = res.data
    })
  })
}
const countTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    prop: 'contractNo',
    label: '合同编号',
    minWidth: 200,
  },
  {
    prop: 'rate',
    label: '费率',
    width: 150,
  },
  {
    prop: 'freeStorageDays',
    label: '免堆存期',
    width: 150,
  },
  {
    prop: 'amount',
    label: '金额',
    minWidth: 120,
  },
  {
    prop: 'startDate',
    label: '开始结算日期',
    minWidth: 200,
  },
  {
    label: '结束结算日期',
    prop: 'endDate',
    width: 150,
  },
  {
    label: '结算状态',
    prop: 'statementStatus',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.statementStatus == '50' ? 'success' :
              (row.statementStatus == '40' ? 'success' :
                (row.statementStatus == '31' ? 'success' :
                  (row.statementStatus == '30' ? 'success' :
                    (row.statementStatus == '1' ? 'primary' : 'info')))),
          },
          {
            default: () => row.statementStatusLabel,
          }
        ),
      ]
    },
  },
  {
    prop: 'createByName',
    label: '结算人',
    width: 150,
  },
  {
    prop: 'createTime',
    label: '结算时间',
    width: 150,
  },
  {
    prop: 'reviewByName',
    label: '审核人',
    width: 150,
  },
  {
    prop: 'reviewByTime',
    label: '审核时间',
    width: 150,
  },
])
//获取结算单点击行数据
const countTableClickRow = ref()
//结算历史 单击事件
const countTableEvent = ({ row }) => {
  // 取消上层表格选中状态
  handoverTableRef.value.clearCurrentColumn()
	// 禁用结算按钮 启用撤销结算按钮
	countTableClickRow.value = row
  costDetailButton.value = false
}
const costEvent = async ()=>{
  let tmpForm = {
    ...drawerRef.value.formData
  }

  proxy.$modal.confirm('是否结算？').then(async () => {
    await api.costEvent(tmpForm).then(res=>{
      if(res.code=='0000'){
        proxy.$message.success("结算成功")
        drawerVisible.value = false
      }else{
        proxy.$message.error(res.data.msg)
      }
    })
    getList(queryParams.value)
  })

}

const handleChange = res => {}
const dialogVisible = ref(false)
//图片展示事件
const report = async (row) =>{
  imgurl.splice(0,imgurl.length) ;

   await publicApi.getBusFiles({businessId:row.id,businessType:"BUSINESS_RECEIPT"}).then(res=>{
      fileList.value = res.data
     if(fileList.value.length<=0){
       proxy.$message.error('没有可供展示的图片！')
       return
     }
     dialogVisible.value = true
      fileList.value.forEach(item=>{
        publicApi.down(item.id, 'arraybuffer').then(res => {
          const blob = new Blob([res.data], {
            type: 'application/png;charset=utf-8',
          })
          const url = window.URL.createObjectURL(blob)
          imgurl.push(url)
        })
      })
    })
}
//上传商务回执单
const dialogUploadVisible = ref(false)

// 上传文件
const fileIds=ref([]) // 文件列表
const changeFile = files => {
  fileIds.value = files
}
//开具方式
const taxInvoiceTypeList =ref([])
//回执确认表单
const hzFormData = reactive({
  id:'',
  receiptRemark:'',
  taxInvoiceName:'',
  taxInvoiceCode:'',
})
const contractRateId =ref(null)
// 结算
const cost =  async () => {
	drawerVisible.value = true
    nextTick(async () => {
      isDisabled.value = false
      await drawerRef.value.resetForm()
      drawerRef.value.disableContract=false

      console.log(clickRow.value.isClear,"clickRow.value.isClear");
      proxy.setFormData(drawerRef.value.formData, clickRow.value)
      if(clickRow.value.isClearLabel=='是'){
        drawerRef.value.formData.isFinal = '1'
      }
      drawerRef.value.formData.cargoInfoId = clickRow.value.id
      drawerRef.value.formData.handoverlistId = clickRow.value.id
      drawerRef.value.formData.stackFeeType = stackFeeType
      //交接清单量
      let tmpHannoverListTonParam = {
        cargoInfoId:clickRow.value.id
      }
      await api.getHandoverlistTon(tmpHannoverListTonParam).then(res=>{
        drawerRef.value.formData.handoverlistTon = res.data
      })
      let tmpList = []
      let contractParams={
        cargoInfoId:clickRow.value.id
      }
      await api.listContract(contractParams).then(res => {
        tmpList = res.data
        isAppear.value = false
        if (tmpList != null && tmpList.length == 1) {
          if (drawerRef.value.formData.contractId == '') {
            isAppear.value = true
            drawerRef.value.formData.contractId = tmpList[0].id
            drawerRef.value.formData.contractNo = tmpList[0].contractNo
            drawerRef.value.formData.contractRateId = tmpList[0].rate.contractRateId
            drawerRef.value.formData.freeStorageDays = tmpList[0].rate.freeStorageDays
            drawerRef.value.formData.rate = tmpList[0].rate.rate
            drawerRef.value.formData.tax = tmpList[0].rate.tax
          }
          if (tmpList[0].id != null ) {

            let params= {
              cargoInfoId:clickRow.value.id,
              contractRateId:tmpList[0].rate.contractRateId,
              isCalculate:stackFeeType
            }

          }
        }else if (tmpList != null && tmpList.length > 1) {
          isAppear.value = true
        }
      })
      //获取堆存费减免信息

     await api.getReduceList(drawerRef.value.formData.cargoInfoId).then(res=>{
        let tmpList = []
        tmpList = res.data
        if(tmpList!==undefined&&tmpList!=null&&tmpList.length>0){
          if(tmpList[0].reduceType=='' || tmpList[0].reduceType==null){
            proxy.$message.warning("注意：此票货撤销过减免信息");
            drawerRef.value.formData.isUseReduce = '0'
            drawerRef.value.formData.reduceId = tmpList[0].id
          }else{
            drawerRef.value.formData.reduceId = tmpList[0].id
            drawerRef.value.formData.reduceType = tmpList[0].reduceType
            drawerRef.value.formData.reduceDays = tmpList[0].reduceDays
            drawerRef.value.formData.reduceEndDate = tmpList[0].reduceEndDate
            drawerRef.value.formData.calEndDate = tmpList[0].calEndDate
            drawerRef.value.formData.reduceRemark = tmpList[0].remark
            publicApi.getBusFiles({businessId:drawerRef.value.formData.cargoInfoId,businessType:"CARGO_REDUCE_PROOF"}).then(res=>{
              drawerRef.value.formData.reduceFileList = res.data.map(o=>{
                return o.id;
              })
            })
          }
        }else {
          drawerRef.value.formData.isUseReduce = '0'
        }
      })

      if(drawerRef.value.formData.contractId===undefined
        ||drawerRef.value.formData.contractId==null
        ||drawerRef.value.formData.contractId == ''){
        let detailParams={
          cargoInfoId:clickRow.value.id,
          isCalculate:stackFeeType,
          isUseReduce:drawerRef.value.formData.isUseReduce,
          reduceType:drawerRef.value.formData.reduceType,
          isFinal:drawerRef.value.formData.isFinal,
          isXC:clickRow.value.source=='卸船'?'1':''
        }
        await api.listDetail(detailParams).then(res => {
          let tmpAmount = 0
          res.data.forEach(x=>{
            drawerRef.value.formData.allPrice = math.numAdd(drawerRef.value.formData.allPrice,x.amount).toFixed(2)
            tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
          })
          drawerRef.value.formData.reduceBeforeAmount  = tmpAmount
          drawerRef.value.formData.reduceAMount  = (tmpAmount - drawerRef.value.formData.allPrice ).toFixed(2)
          drawerRef.value.setTableData(res.data)
        })
      }else {
        let withContractParam = {
          cargoInfoId:clickRow.value.id,
          freeStorageDays:drawerRef.value.formData.freeStorageDays,
          rate:drawerRef.value.formData.rate,
          tax:drawerRef.value.formData.tax,
          isUseReduce:drawerRef.value.formData.isUseReduce,
          reduceType:drawerRef.value.formData.reduceType,
          isFinal:drawerRef.value.formData.isFinal,
          isCalculate:stackFeeType,
          isXC:clickRow.value.source=='卸船'?'1':''
        }
        let tmpAmount = 0
        await api.listDetailWithContract(withContractParam).then(res => {
          if(res.data){
            res.data.forEach(x=>{
              drawerRef.value.formData.allPrice = math.numAdd(drawerRef.value.formData.allPrice,x.amount).toFixed(2)
              tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
            })
            drawerRef.value.formData.reduceBeforeAmount  = tmpAmount
            drawerRef.value.formData.reduceAMount  = (tmpAmount - drawerRef.value.formData.allPrice ).toFixed(2)
            drawerRef.value.setTableData(res.data)
          }
        })
      }

      console.log(drawerRef.value.formData.freeStorageDays,'剩余免堆存期');
      if(clickRow.value.source=='混配'){
        api.getMixRecordList(clickRow.value.id).then(res=>{
          drawerRef.value.mixCargoTableData = res.data
          drawerRef.value.mixContent = "("+ res.data.map(item=>{return item.mixWeight+"*"+item.remainFreeStorageDays}).join("+")
            +")/"+res.data[0].allMixWeight+"=" +(drawerRef.value.formData.freeStorageDays==null||drawerRef.value.formData.freeStorageDays===undefined||drawerRef.value.formData.freeStorageDays==''?'0':drawerRef.value.formData.freeStorageDays)   +"天"

        })
      }


    })
}
// 撤销结算
const revokeCost = () => {
	proxy.$modal.confirm('是否确定撤销结算？').then(() => {
		api.cancelSettle(countTableClickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
// 审核
const review = () => {
	proxy.$modal.confirm('是否确定审核？').then(() => {
		api.review(countTableClickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('审核成功')
		})
	})
}
// 撤销审核
const revokeReview = () => {
	proxy.$modal.confirm('是否确定撤销审核？').then(() => {
		api.cancelReview(countTableClickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
const recudeInfoSave = async () =>{
  if (await drawerRef.value.validate()) {
    //判断是否存在结算记录
    let tmpFlag = false
    await api.getCargoInfoSettleList({cargoInfoId:drawerRef.value.formData.cargoInfoId}).then(res=>{
      if(res.data !=null && res.data.length>0){
        tmpFlag =true;
      }
    })
    // 提交之前放开注释 下四行注释
    // if(tmpFlag){
    //   proxy.$message.warning("该票货已经计费，请先撤销计费再进行减免信息录入");
    //   return
    // }
    console.log("减免信息",drawerRef.value.formData.reduceFileList);
    proxy.$modal.confirm('确定保存？').then(res => {
      let tmpForm = {
        id:drawerRef.value.formData.reduceId?drawerRef.value.formData.reduceId:'',
        reduceType:drawerRef.value.formData.reduceType?drawerRef.value.formData.reduceType:'',
        cargoInfoId:drawerRef.value.formData.cargoInfoId?drawerRef.value.formData.cargoInfoId:'',
        reduceDays:drawerRef.value.formData.reduceDays?drawerRef.value.formData.reduceDays:0,
        reduceEndDate:drawerRef.value.formData.reduceEndDate?drawerRef.value.formData.reduceEndDate:null,
        calEndDate:drawerRef.value.formData.calEndDate?drawerRef.value.formData.calEndDate:null,
        fileList:drawerRef.value.formData.reduceFileList?drawerRef.value.formData.reduceFileList:'',
        remark:drawerRef.value.formData.reduceRemark?drawerRef.value.formData.reduceRemark:''
      }

      api.addReduceInfo(tmpForm).then(res=>{
        if(res.code='0000'){
          proxy.$message.success(res.msg)
        }else{
          proxy.$message.error(res.data.msg)
        }
      })
    })
  }
}

const export1 = () =>{
	let tmpList = []
		countTableClickRow.value.details.forEach(item=>{
		let tmpData = {
			date: item.date, //日期
			ton: item.ton, // 本日堆存量
			billableTon: item.billableTon, // 本日应计费量
			inTon: item.inTon, // 本日进场量
			outTon: item.outTon, // 本日出场量
			amount: item.amount, // 本日结算金额
		 };
		tmpList.push(tmpData)
	})
	let data = {
		cargoOwnerName: clickRow.value.cargoOwnerName,
		cargoName: clickRow.value.cargoName,
		shipNameVoyage: clickRow.value.shipNameVoyage,
		freeStorageDays: countTableClickRow.value.freeStorageDays,
		endWorkTime: clickRow.value.workEndTime,
		berthTime: clickRow.value.berthTime,
		details: tmpList,
		amount: countTableClickRow.value.amount,
	};
	// startExport(data)
  api.storageCostDetailExport(data).then(res => {
    downLoadBlob(res,clickRow.value.shipNameVoyage+'' )
  })
}
const export2 = () =>{
  const params = {
    ...drawerRef.value.formData,
  } // 取到子组件的formData
  if(params.details.length == 0){
    proxy.$modal.msgWarning('没有明细无法导出！')
    return
  }
	console.log(params)
	if(params.contractId == ''){
		proxy.$modal.msgWarning('请先选择合同！')
		return
	}
	let tmpList = []
	params.details.forEach(item=>{
		let tmpData = {
			date: item.date, //日期
			ton: item.ton, // 本日堆存量
			billableTon: item.billableTon, // 本日应计费量
			inTon: item.inTon, // 本日进场量
			outTon: item.outTon, // 本日出场量
			amount: item.amount, // 本日结算金额
		};
		tmpList.push(tmpData)
	})
	let data = {
		cargoOwnerName: clickRow.value.cargoOwnerName,
		cargoName: clickRow.value.cargoName,
		shipNameVoyage: clickRow.value.shipNameVoyage,
		freeStorageDays: params.freeStorageDays,
		endWorkTime: clickRow.value.workEndTime,
		berthTime: clickRow.value.berthTime,
		details: tmpList,
		amount: params.allPrice,
	};
	 // startExport(data)
  api.storageCostDetailExport(data).then(res => {
    downLoadBlob(res,clickRow.value.shipNameVoyage+'' )
  })

}
// // 导出
async function startExport(data) {
  const bytes = new Uint8Array(await (await fetch(ReportTemplate)).arrayBuffer())
  const workbook = XLSX.read(bytes, {
    type: 'array',
  })

  const sheetNames = workbook.SheetNames
  const sheet0 = workbook.Sheets[sheetNames[0]]

  XLSX.utils.sheet_add_aoa(sheet0, [
    [, data.cargoOwnerName, , data.cargoName, , data.shipNameVoyage],
    [, data.freeStorageDays, , data.endWorkTime, , data.berthTime],
    ,
    ...data.details.map(v1 => Object.values(v1)),
    ['汇总', , , , , data.amount],
  ], {origin: "A1"})

  XLSX.writeFileXLSX(workbook, data.shipNameVoyage + '.xlsx')
}


//商务审核上传文件事件
const uploadBusinessFile = () =>{
  if(countTableClickRow.value.cargoInfoId ===undefined ||countTableClickRow.value.cargoInfoId==null){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  dialogUploadVisible.value = true
  nextTick(()=>{
    businessId.value =  countTableClickRow.value.statementId
  })
}
//文件保存
const saveFile = () => {
  let tmpList = []
  tmpList.push(countTableClickRow.value.statementId)
  proxy.$modal.confirm('是否保存文件到系统？').then(() => {
    api.saveFile( {fileIds:fileIds.value,ids:tmpList}).then(res=>{
      proxy.$modal.msgSuccess(res.msg)
    })
    dialogUploadVisible.value = false
  })

}

// 商务确认
const hzDialogVisible = ref(false)
//回执确认保存事件
const businessAffirm = () => {
  if(countTableClickRow.value.cargoInfoId ===undefined ||countTableClickRow.value.cargoInfoId==null){
    proxy.$message.error('请先选中一条数据！')
    return
  }


  hzDialogVisible.value = true
  //清除回执单数据

  //清楚回执确认表单的数据
  hzFormData.id = ''
  hzFormData.receiptRemark=''
  hzFormData.taxInvoiceCode=''
  hzFormData.taxInvoiceName=''
  let tmpList = []
  tmpList = settlementList.value
  //重新赋值；

  hzFormData.id = countTableClickRow.value.statementId
  hzFormData.taxInvoiceCode = countTableClickRow.value.taxationInvoiceCode
  api.getTaxInvoiceTypeList().then(res=>{
    taxInvoiceTypeList.value = res.data
  })
}
//回执确认保存事件
const submitHzForm = ()=>{
  if(countTableClickRow.value.cargoInfoId ===undefined ||countTableClickRow.value.cargoInfoId==null){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  if(hzFormData.taxInvoiceCode===undefined||hzFormData.taxInvoiceCode==null||hzFormData.taxInvoiceCode == ''){
    proxy.$message.error('请选择发票开具类型！')
    return
  }
  let tmpList = []
  tmpList.push(countTableClickRow.value.statementId)
  hzFormData.ids  = tmpList
  taxInvoiceTypeList.value.forEach(item=>{
    if( item.value == hzFormData.taxInvoiceCode ){
      hzFormData.taxInvoiceName = item.label
    }
  })
  proxy.$modal.confirm('是否确定回执确认？').then(() => {
    api.confirm(hzFormData).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('商务确认成功')
    })
    hzDialogVisible.value = false;
  })

}
// 取消商务确认
const cancelBusinessAffirm = () => {
  if(countTableClickRow.value.cargoInfoId ===undefined ||countTableClickRow.value.cargoInfoId==null){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  let tmpList = []
  tmpList.push(countTableClickRow.value.statementId)
  proxy.$modal.confirm('是否确定取消回执确认？').then(() => {
    api.cancelConfirm({ids:tmpList}).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('取消成功')
    })
  })
}

// 结算保存
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = {
			...drawerRef.value.formData,
		} // 取到子组件的formData
    console.log(params,"params");
    proxy.$modal.confirm('确定保存？').then(() => {
			api.statement(params).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('结算成功')
					drawerVisible.value = false
					isDisabled.value = false
					getList(queryParams.value)
				}
			})
      getList(queryParams.value)
		})
	}
}

/** 初始化数据 */
//初始化函数
const init = async () => {
	// await nextTick(() => {
	// 	proxy.$bus.emit('setInitSearchData', { shipStatusCode: '110' })
	// 	 queryParams.value.shipStatusCode = '110'
	// })
  //刷新表单数据
  nextTick(()=>{
    if(routeType=='3'||routeType=='2'){
      handoverTableRef.value.SearchHeaderRef.searchData.statementStatus = '20'
      queryParams.value.statementStatus = '20'
    }
    getList(queryParams.value)

  })

}
init()

</script>
<style lang="less" scoped>
.app-container {
	height: auto !important;
}
.el-table thead {
  color: #606266 !important;
}
.image{
  object-fit: contain;  width: 100%;  height: 100%;
}
</style>
