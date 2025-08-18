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
			:showNum="4"
      :rowStyle="rowStyle"
			:total="total"
      :checkbox-config="checkboxConfig"
      @checkbox-change="checkboxChange"
      :selectAllChangeEvent="selectAllChangeEvent"
      :cellDBLClickEvent = "dbClickEvent"
    />
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="结算详情" size="80%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click=";(drawerVisible = false), (isDisabled = false)">
						{{ isDisabled ? '关闭' : '取消' }}
					</el-button>
          <el-button type="primary" v-if="routeType=='0'"  @click.stop="recudeInfoSave" >减免信息保存</el-button>
          <el-button type="primary"  @click.stop="costEvent" v-if="routeType == '1'" >保存</el-button>
          <!--<el-button type="primary" @click.stop="export1"  v-if="isDisabled">
						<el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出
					</el-button>
					<el-button type="primary" @click.stop="export2"  v-if="isAppear">
						<el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出
					</el-button>-->
          <el-button type="primary" @click.stop="export2">
            <el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出
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

<script setup name="stackFeeSHHZQR">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/statement/stackFeeCountNew/index.js'   //和stackFeeNew共用一套api
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
  routeId:routeType,
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
    isHidden:routeType != '2',
    modelValue: 'contractCode', // 绑定字段
    span:2,
  },
  {
    name: '金额是否为零',
    type: 'select', // 搜索框类型
    isHidden:routeType != '3',
    modelValue: 'isZero', // 绑定字段
    span:2,
    selectData: [
      {value:'1',label:'是'},
      {value:'0',label:'否'}
      ],

  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'statementStatus',
    span: 2,
    selectData: [
      {value:'20',label:'已计费'},
      {value:'30',label:'计费审核'},
      {value:'31',label:'商务确认'},
      {value:'40',label:'部分开票'},
      {value:'50',label:'已开票'}
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
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Money', // 按钮图标，支持element-Plus中所有图标
		click: () => review, // 回调函数
		permission: "business:stackFee:shenHe", // 权限
	},
  {
		label: '销审', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeReview, // 回调函数
		permission:"business:stackFee:xiaoShen" , // 权限
	},
  {
		label: '结算明细', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Expand', // 按钮图标，支持element-Plus中所有图标
		click: () => costDetail, // 回调函数
		permission:"business:stackFee:costDetail" , // 权限
	},
  {
		label: '上传回执单', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Upload', // 按钮图标，支持element-Plus中所有图标
		click: () => uploadBusinessFile, // 回调函数
		permission:"business:stackFee:uploadHzFile" , // 权限
	},
  {
		label: '回执确认', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => businessAffirm, // 回调函数
		permission:"business:stackFee:hzqr" , // 权限
	},
  {
		label: '取消回执确认', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelBusinessAffirm, // 回调函数
		permission:"business:stackFee:rehzqr" , // 权限
	},
  {
		label: '查看账单', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Download', // 按钮图标，支持element-Plus中所有图标
		click: () => printCostBill, // 回调函数
		permission:"business:stackFee:xiazai" , // 权限
	},
])
// 结算单end -------------
const settlementList = ref([])
const rowStyle = i => {
  if (i.row.rejectReason && i.row.rejectReason != '') {
    return 'color:red'
  }
  return null
}
const checkDataList = ref([])
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
const selectAllChangeEvent = ({ checked })  =>{
  //解禁按钮
  buttonList.forEach(item => (item.disabled = false))
  checkDataList.value = checked ? tableData.value : []
  if(checkDataList.value.length>0){
    buttonList.forEach(item => (item.disabled = false))
  }else{
    buttonList.forEach(item => (item.disabled = true))
  }
}
//复选框改变事件
const checkboxChange = data =>{
  //console.log(data,"复选框改变事件");
  checkDataList.value = JSON.parse(JSON.stringify(data))
  //解禁按钮
  if(checkDataList.value.length>0){
    buttonList.forEach(item => (item.disabled = false))
  }else{
    buttonList.forEach(item => (item.disabled = true))

  }


}
// 点击查询的事件
const getList = e => {
  buttonList.forEach(item => (item.disabled = true))
  clickRow.value = {}
  countTable.value = []
  queryParams.value.isCalculate = stackFeeType
  api.listStatementStackFeeForSHSWQR( Object.assign(queryParams.value,e )).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}

//打印账单
const printCostBill = () => {
  if(routeType!='2'){
    if(clickRow.value.statementStatus == '10'||clickRow.value.statementStatus == '20'){
      proxy.$message.error('请先进进行计费审核再进行查看账单')
      return
    }
  }else{
    if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
    var tmpMap = new Map()
    checkDataList.value.forEach(item=>{
      tmpMap.set(item.cargoOwnerId,item);
    })
    if(tmpMap.size>1){
      proxy.$message.error("必须选择相同的客户");
      return;
    }

    let tmpflag = false
    checkDataList.value.forEach(item=>{
      if(item.statementStatus == '20'){
        tmpflag = true
        return
      }
    })
    if(tmpflag){
      proxy.$message.error('选择的数据中存在状态不是计费审核的账单！')
      return;
    }

  }


  proxy.$modal.confirm('确定下载？').then(() => {
	  let tmpList = []


    if(routeType!='2'){
      tmpList.push(clickRow.value.id)
    }else{
      tmpList = checkDataList.value.map(item=>{
        return item.id
      })
    }
    let data = {
      ids:tmpList,
      routeId:routeType
    }

    api.printFeeList(data).then(res => {
			downLoadBlob(res, '堆存费计费')
		})
	})
}

// 交接单 -------------------
const handoverTableRef = ref()
const total = ref(0)

// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', type: 'checkbox', width: 50 ,    fixed: 'left', isHidden:(routeType =='3')?true:false  },
  { label: '票货来源', prop: 'source', width:100,},

  { label: '票货号', prop: 'cargoInfoNo', width: 184 , },
  { label: '结算单号', prop: 'statementNo', width: 184 , },
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
  { label: '计费人', prop: 'createByName', width: 100 },
  { label: '计费时间', prop: 'createTime', width: 120 },
  { label: '驳回人', prop: 'rejectByName', width: 100 },
  { label: '驳回时间', prop: 'rejectTime', width: 120 },
  { label: '驳回原因', prop: 'rejectReason', width: 280 },
  { label: '金额', prop: 'amount',  fixed: 'right', width: 100 },
  { label: '回执备注', prop: 'receiptRemark',   width: 200 ,isHidden:(routeType =='3')?true:false },
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
            type: row.statementStatus == '50' ? 'success' : (row.statementStatus == '40' ? 'success' : (row.statementStatus == '31' ? 'success' : (row.statementStatus == '30' ? 'success' : (row.statementStatus == '20' ? 'primary' : 'info')))),
          },
          {
            default: () => row.statementStatus == '20'?'已计费':row.statementStatus == '30'?'计费审核':row.statementStatus == '31'?'回执确认':row.statementStatus == '40'?'部分开票':row.statementStatus == '50'?'已开票':'' ,
          }
        ),
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


}
//双击事件
const dbClickEvent = (node,e)=>{
  costDetail()
}
// 交接单end ----------------------

const costDetails =ref([])
const costDetail = async () => {
  drawerVisible.value = true
  // costDetails.value =countTableClickRow.value.details
  let tmpTable = []
  let tmpRow = null
  let tmpParams = {
    storageSettleId :clickRow.value.tcssId
  }
  await api.listStorageSettleById(tmpParams).then(res => {
    tmpRow = res.data[0]
    for (let i = 0; i < res.data.length; i++) {
      let details = res.data[i];
      tmpTable.push(details);
    }
  })
  let tmpReduceForm = {
    reduceId :'',
    reduceType :'',
    reduceDays :'',
    reduceEndDate:'',
    reduceRemark :''
  }
  console.log(clickRow.value,"票货id");
  await api.getReduceList(clickRow.value.id).then(res=>{
    let tmpList = []
    tmpList = res.data
    if(tmpList.length>0){
      tmpReduceForm.reduceId      = tmpList[0].id
      tmpReduceForm.reduceType    = tmpList[0].reduceType
      tmpReduceForm.reduceDays    = tmpList[0].reduceDays
      tmpReduceForm.reduceEndDate = tmpList[0].reduceEndDate
      tmpReduceForm.reduceRemark  = tmpList[0].remark
    }
  })
  nextTick(async () => {
    isDisabled.value = false
	  isAppear.value = true
    drawerRef.value.resetForm()
    drawerRef.value.disableContract=true
    proxy.setFormData(drawerRef.value.formData, tmpRow)
    proxy.setFormData(drawerRef.value.formData, clickRow.value)
    drawerRef.value.formData.allPrice = tmpRow.amount
    drawerRef.value.formData.reduceAmount = tmpRow.reduceAmount
    drawerRef.value.formData.reduceBeforeAmount = math.numAdd(tmpRow.amount , tmpRow.reduceAmount?tmpRow.reduceAmount:0)
    drawerRef.value.formData.stackFeeType = stackFeeType
    drawerRef.value.formData.reduceId =       tmpReduceForm.id
    drawerRef.value.formData.reduceType =     tmpReduceForm.reduceType
    drawerRef.value.formData.reduceDays =     tmpReduceForm.reduceDays
    drawerRef.value.formData.reduceEndDate =  tmpReduceForm.reduceEndDate
    drawerRef.value.formData.reduceRemark =   tmpReduceForm.remark
    drawerRef.value.setTableData2(tmpTable[0].details)
    //交接清单量
    let tmpHannoverListTonParam = {
      cargoInfoId:clickRow.value.id
    }
    await api.getHandoverlistTon(tmpHannoverListTonParam).then(res=>{
      drawerRef.value.formData.handoverlistTon = res.data
    })

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
const countTableColumns = ref([
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
            type: row.statementStatus == '50' ? 'success' : (row.statementStatus == '40' ? 'success' : (row.statementStatus == '31' ? 'success' : (row.statementStatus == '30' ? 'success' : (row.statementStatus == '1' ? 'primary' : 'info')))),
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
const costEvent = ()=>{
  let tmpForm = {
    ...drawerRef.value.formData
  }

  console.log(tmpForm,"tmpFormtmpFormtmpFormtmpFormtmpFormtmpForm");
  // proxy.$message.error("别提交了吧")
  // return

  api.costEvent(tmpForm).then(res=>{

    if(res.code=='0000'){
      proxy.$message.success("结算成功")
      drawerVisible.value = false
    }else{
      proxy.$message.error(res.data.msg)
    }
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
      drawerRef.value.resetForm()
      drawerRef.value.disableContract=false

      console.log(clickRow.value.isClear,"clickRow.value.isClear");
      proxy.setFormData(drawerRef.value.formData, clickRow.value)
      if(clickRow.value.isClearLabel=='是'){
        drawerRef.value.formData.isFinal = '1'
      }
      drawerRef.value.formData.cargoInfoId = clickRow.value.id
      drawerRef.value.formData.handoverlistId = clickRow.value.id
      drawerRef.value.formData.stackFeeType = stackFeeType
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
      //获取堆存费减免的信息

     await api.getReduceList(drawerRef.value.formData.cargoInfoId).then(res=>{
        let tmpList = []
        tmpList = res.data
        if(tmpList!==undefined&&tmpList!=null&&tmpList.length>0){
          drawerRef.value.formData.reduceId = tmpList[0].id
          drawerRef.value.formData.reduceType = tmpList[0].reduceType
          drawerRef.value.formData.reduceDays = tmpList[0].reduceDays
          drawerRef.value.formData.reduceEndDate = tmpList[0].reduceEndDate
          drawerRef.value.formData.reduceRemark = tmpList[0].remark
          publicApi.getBusFiles({businessId:drawerRef.value.formData.cargoInfoId,businessType:"CARGO_REDUCE_PROOF"}).then(res=>{
            drawerRef.value.formData.reduceFileList = res.data.map(o=>{
              return o.id;
            })
          })
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
          isFinal:drawerRef.value.formData.isFinal,
          isCalculate:stackFeeType,
          isXC:clickRow.value.source=='卸船'?'1':''
        }
        let tmpAmount = 0
        await api.listDetailWithContract(withContractParam).then(res => {
          res.data.forEach(x=>{
            drawerRef.value.formData.allPrice = math.numAdd(drawerRef.value.formData.allPrice,x.amount).toFixed(2)
            tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
          })
          drawerRef.value.formData.reduceBeforeAmount  = tmpAmount
          drawerRef.value.formData.reduceAMount  = (tmpAmount - drawerRef.value.formData.allPrice ).toFixed(2)
          drawerRef.value.setTableData(res.data)
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
  console.log(clickRow.value,"clickRow.valueclickRow.valueclickRow.valueclickRow.value");
  proxy.$modal.confirm('是否确定审核？').then(() => {
		api.review(clickRow.value.tcssId).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('审核成功')
		})
	})
}
// 撤销审核
const revokeReview = () => {
	proxy.$modal.confirm('是否确定撤销审核？').then(() => {
		api.cancelReview(clickRow.value.tcssId).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
const recudeInfoSave = async () =>{



  if (await drawerRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(res => {
      let tmpForm = {
        id:drawerRef.value.formData.reduceId?drawerRef.value.formData.reduceId:'',
        reduceType:drawerRef.value.formData.reduceType?drawerRef.value.formData.reduceType:'',
        cargoInfoId:drawerRef.value.formData.cargoInfoId?drawerRef.value.formData.cargoInfoId:'',
        reduceDays:drawerRef.value.formData.reduceDays?drawerRef.value.formData.reduceDays:0,
        reduceEndDate:drawerRef.value.formData.reduceEndDate?drawerRef.value.formData.reduceEndDate:null,
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
		countTable.value[0].details.forEach(item=>{
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
	startExport(data)
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
// 导出
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
  if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
  var tmpMap = new Map()
  checkDataList.value.forEach(item=>{
    tmpMap.set(item.cargoOwnerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }

  dialogUploadVisible.value = true
  let tmpStatementIdList = []
  tmpStatementIdList = checkDataList.value.map(item=>{
    return item.statementId
  })
  nextTick(()=>{
    businessId.value = 1
    if(tmpStatementIdList.length==1){
      businessId.value =  tmpStatementIdList[0]
    }else {

      businessId.value = 1
    }
  })
}
//文件保存
const saveFile = () => {
  if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
  let tmpflag = false
  checkDataList.value.forEach(item=>{
    if(item.statementStatus != '30'){
      tmpflag = true
      return
    }
  })
  if(tmpflag){
  proxy.$message.error('选择的数据中存在状态不是计费审核的账单！')
  return;
  }
  var tmpMap = new Map()
  checkDataList.value.forEach(item=>{
    tmpMap.set(item.cargoOwnerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }

  dialogUploadVisible.value = true
  let tmpList = []
  tmpList = checkDataList.value.map(item=>{
    return item.statementId
  })
  proxy.$modal.confirm('是否保存文件到系统？').then(() => {
    api.saveFile( {fileIds:fileIds.value,ids:tmpList}).then(res=>{
      proxy.$modal.msgSuccess(res.msg)
    })
    dialogUploadVisible.value = false
  })

}

// 商务确认
const hzDialogVisible = ref(false)
//回执确认点击事件
const businessAffirm =  async () => {
  if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
  let tmpflag = false
  checkDataList.value.forEach(item=>{
    if(item.statementStatus != '30'){
      tmpflag = true
      return
    }
  })
  if(tmpflag){
    proxy.$message.error('选择的数据中存在状态不是计费审核的账单！')
    return;
  }
  var tmpMap = new Map()
  checkDataList.value.forEach(item=>{
    tmpMap.set(item.cargoOwnerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }

  hzDialogVisible.value = true
  //清除回执单数据

  hzFormData.id = ''
  hzFormData.receiptRemark=''
  hzFormData.taxInvoiceCode=''
  hzFormData.taxInvoiceName=''
  let tmpList = []
  tmpList = checkDataList.value
  //重新赋值；
  await api.getTaxInvoiceTypeList().then(res=>{
    taxInvoiceTypeList.value = res.data
  })
    if(tmpList.length==1){
      hzFormData.id = tmpList[0].statementId

      const data = await api.getTaxInvoiceCode(tmpList[0].cargoOwnerId)
      console.log("data:",data);
      hzFormData.taxInvoiceCode =data.data.taxationInvoiceCode?data.data.taxationInvoiceCode:''


    }else {
      hzFormData.id = ''
      hzFormData.taxInvoiceCode = ''
    }

}
//回执确认保存事件
const submitHzForm = ()=>{
  if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
  let tmpflag = false
  checkDataList.value.forEach(item=>{
    if(item.statementStatus != '30'){
      tmpflag = true
      return
    }
  })
  if(tmpflag){
    proxy.$message.error('选择的数据中存在状态不是计费审核的账单！')
    return;
  }
  var tmpMap = new Map()
  checkDataList.value.forEach(item=>{
    tmpMap.set(item.cargoOwnerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }

  if(hzFormData.taxInvoiceCode===undefined||hzFormData.taxInvoiceCode==null||hzFormData.taxInvoiceCode == ''){
    proxy.$message.error('请选择发票开具类型！')
    return
  }
  let tmpList = []
  tmpList = checkDataList.value.map(item=>{
    return item.statementId
  })
  hzFormData.ids  = tmpList
  //类型赋值
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
  if(checkDataList.value.length<=0){
    proxy.$message.error('请先选中一条账单！')
    return
  }
  let tmpflag = false
  checkDataList.value.forEach(item=>{
    if(item.statementStatus != '31'){
      tmpflag = true
      return
    }
  })
  if(tmpflag){
    proxy.$message.error('选择的数据中存在状态不是回执确认的账单！')
    return;
  }
  var tmpMap = new Map()
  checkDataList.value.forEach(item=>{
    tmpMap.set(item.cargoOwnerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }

  let tmpList = []
  tmpList = checkDataList.value.map(item=>{
    return item.statementId
  })
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
		})
	}
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
/** 初始化数据 */
//初始化函数
const init = async () => {
	// await nextTick(() => {
	// 	proxy.$bus.emit('setInitSearchData', { shipStatusCode: '110' })
	// 	 queryParams.value.shipStatusCode = '110'
	// })
  //刷新表单数据
  nextTick(()=>{
    if(routeType=='3'){
      handoverTableRef.value.SearchHeaderRef.searchData.statementStatus = '20'
      queryParams.value.statementStatus = '20'
    }else if(routeType=='2'){
      handoverTableRef.value.SearchHeaderRef.searchData.statementStatus = '30'
      queryParams.value.statementStatus = '30'
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
.image{
  object-fit: contain;  width: 100%;  height: 100%;
}
</style>
