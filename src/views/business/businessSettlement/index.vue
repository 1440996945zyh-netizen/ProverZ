<template>
	<!-- 商务结费管理    20231115在用 -->
	<!-- 包干费计费      20231115在用 -->
	<!-- 商务包干费计费   20231115在用 -->
  <!--  回执确认 20231115在用-->
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
      :rowStyle="rowStyle"
			:tableHeight="'drawerHeaderPageTableHeight'"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
			:total="total"
      :cellDBLClickEvent = "dbClickEvent"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="selectAllChange"
      :showNum = '4'
      @checkbox-change="checkboxChange"
		/>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="结算明细" name="1">
				<BaseTable
					ref="countTableRef"
					:showSearchHeader="false"
					:tableColumns="countTableColumns"
					:tableData="countTable"
					:tableHeight="300"
					:cellClickEvent="countTableEvent"
					:autoResize="true"
				/>
			</el-collapse-item>
		</el-collapse>

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="结算详情" size="80%">
			<drawer ref="drawerRef" @listContract="listContract" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click=";(drawerVisible = false), (isDisabled = false)">
						{{ isDisabled ? '关闭' : '取消' }}
					</el-button>
					<el-button v-if="!isDisabled" type="primary" @click="save">保存</el-button>
					<el-button type="primary" @click.stop="printCostBill">打印清单</el-button>
				</div>
			</template>
		</el-drawer>

    <!-- 商务上传回执单弹窗 -->
    <el-dialog title="上传回执单" v-model="dialogUploadVisible" width="40%">
<!--
      <el-upload
        ref="upload"
        action="#"
        :show-file-list="true"
        :on-change="handleUpload"
        :limit="5"
        :multiple="false"
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :auto-upload="false"
        :headers="headers"
      >
        &lt;!&ndash;accept 只接受某种格式的文件&ndash;&gt;
        <el-button type="primary" style="margin-bottom: 20px">上传附件</el-button>
      </el-upload>
-->
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
        <el-carousel-item v-for="item in imgurl" :key="item" style="height:  500px">
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

    <!--  商务回执驳回弹窗  -->
    <el-dialog title="回执驳回" v-model="hzbhDialogVisible" width="40%">
      <el-form :model="hzbhFormData" ref="hzbhFormRef" label-width="80px" :rules="bhRules">
      <el-form-item
        label="驳回原因"
        prop="rejectReason"
      >
        <el-input type="textarea" v-model="hzbhFormData.rejectReason"></el-input>
      </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="hzbhDialogVisible = false">关 闭</el-button>
          <el-button @click="submitHzbhForm" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="businessSettlement">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/businessSettlement/index.js'
import publicApi from '@/api/public/index'
import drawer from './drawer/index.vue'
import { ref, reactive, toRefs, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import Upload from '@/components/upload'
import Select from '@/components/Select/index.vue'

const { proxy } = getCurrentInstance()

const drawerVisible = ref(false) //新增修改抽屉
const isDisabled = ref(false)
const collapseOpen = ['1'] // 打开的面板
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const type = ref('')
const hzbhFormRef = ref()
// 获取路由参数
const route = useRoute()
const routeType = JSON.parse(route.meta.query).id
const isHidden = routeType == '4' || routeType == '5' ? ref(false) : ref(true)
const isHiddenLJLS = routeType == '2' || routeType == '5' || routeType == '6' ? ref(true) : ref(false) // 陆集路疏隐藏项
const isHiddenOther = routeType == '1' || routeType == '3' || routeType == '4' ? ref(true) : ref(false) // 其他隐藏项
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	type: routeType == '1' || routeType == '3' ||  routeType == '4' ? 10 : 20,
  routeType: routeType,
	shipStatusCode: 110,
})

const selectData = ref([
  {
    name: '结算状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 6, // 占位，共24
    dataConfig: {
      url: '/api/internal/public/getDictListByType/STATEMENT_STATUS',
    },
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 6, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 6, // 占位，共24
  },
  {
    name: '货名',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span:6,
  },
  {
    name: '客户', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'customerId', // 绑定字段
    span: 3, // 占位，共24
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '件杂', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'workType', // 绑定字段
    span: 2, // 占位，共24
    selectData: [
      {
        value: '1',
        label: '件杂',
      },
      {
        value: '2',
        label: '散杂',
      }
    ]
  },
  {
		name: '作业公司', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'companyId', // 绑定字段
		span: 3, // 占位，共24
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{
		name: '结算单号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'statementNo', // 绑定字段
		span: 3, // 占位，共24
	},
	{
		name: '是否最终结算', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'isFinal', // 绑定字段
    selectData:[{label:'是',value:'1'},{label:'否',value: '0'}],
		span: 2, // 占位，共24
	},
  {
		name: '离港时间起始', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'beginLeavePortTime', //绑定字段
		span: 3, //占位多少，总共24
	},
	{
		name: '离港时间截止', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'endLeavePortTime', //绑定字段
		span: 3, //占位多少，总共24
	},
  {
    name: '金额是否为0',
    type: 'select',
    modelValue: 'isAmountZero',
    isHidden: routeType=='3'||routeType=='6',
    span: 2,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    name: '票货号',
    type: 'input',
    modelValue: 'cargoInfoNo',
    isHidden: routeType=='6',
    span: 3,
  },

])
const buttonList = reactive([
	{
		label: '计费', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Money', // 按钮图标，支持element-Plus中所有图标
		click: () => cost, // 回调函数
		permission: (routeType == '1'||routeType=='2') ? "business:costStatement:cost" : "", // 权限
	},
	{
		label: '撤销计费', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeCost, // 回调函数
		permission:  (routeType == '1'||routeType=='2') ? 'business:costStatement:revokeCost' : "", // 权限
	},
	{
		label: '计费审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => review, // 回调函数
		permission:  (routeType == '3'||routeType=='6') ? "" :'business:costStatement:auditCost', // 权限
	},
	{
		label: '销审', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeReview, // 回调函数
		permission:  (routeType == '3'||routeType=='6') ? "" :'business:costStatement:revokeReview', // 权限
	},{
    label: "上传回执单", // 按钮名称
    type: 'primary', // 按钮类型
    disabled: true,
    icon: 'UploadFilled', // 按钮图标，支持element-Plus中所有图标
    click: () => uploadBusinessFile, // 回调函数
    permission:(routeType == '3'||routeType=='6') ?  'business:costStatement:uploadBusinessFile':'', // 权限
  },
	{
		label: (routeType == '3'||routeType=='6')?"回执确认":'商务确认', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => businessAffirm, // 回调函数
		permission:(routeType == '3'||routeType=='6') ?  'business:costStatement:businessAffirm':'', // 权限
	},
  {
    label: '回执驳回', // 按钮名称
    type: 'primary', // 按钮类型
    disabled: true,
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => businessReject, // 回调函数
    permission:(routeType == '3'||routeType=='6') ?  'business:costStatement:businessReject':'', // 权限
  },
	{
		label: (routeType == '3'||routeType=='6')?"取消回执确认":'取消商务确认', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelBusinessAffirm, // 回调函数
		permission: (routeType == '3'||routeType=='6') ?  'business:costStatement:cancelBusiness':'', // 权限
	},
	{
		label: '账单打印', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Printer', // 按钮图标，支持element-Plus中所有图标
		click: () => printBillBatch, // 回调函数
		permission: (routeType == '3'||routeType=='4'||routeType=='5'||routeType=='6') ?  'business:costStatement:printBillBatch':'', // 权限
	},
  {
		label: '导出', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Download', // 按钮图标，支持element-Plus中所有图标
		click: () => pageExport, // 回调函数
		permission:  'business:costStatement:pageExport', // 权限
	},
])
const  showSave = ref(true)
//双击事件
const dbClickEvent = async () =>{
    if(clickRow.value.tbhId ==null || clickRow.value.tbhId == ''){
    proxy.$message.error("请先填写交接清单")
    drawerVisible.value = false
    return
  }
  if(clickRow.value.id==null || clickRow.value.id == ''){
    proxy.$message.error("交接清单尚未进行预结算或者最终结算")
    drawerVisible.value = false
    return
  }
  drawerVisible.value = true
  const { data } = await api.getDetail(clickRow.value.id)
  const { data: weighObj } = await api.getWeighCapacity(clickRow.value.handoverlistId)
  let tmpPreData = {}
  await api.getPreNumberCount(clickRow.value.id).then(res=>{
    tmpPreData = res.data
  })
  const forMastData = data.map(item => {
    const obj = {
      ...item,
      taxAmount: '',
      tax: '',
      rate: '',
      amount: '',
      rateItemName: '',
      rateItemCode: '',
      unitCode: '',
      unitName: '',
      contractId: '',
      contractRateId: '',
    }
    return obj
  })

  nextTick(() => {
    isDisabled.value = true
    drawerRef.value.resetForm()
    if(data[0].contractId==null && contracts.length ==0){
      drawerRef.value.resetFileTmp()
    }
    drawerRef.value.formData = {
      ...clickRow.value,
      contractId: clickRow.value.status == 10 ? '' : data[0].contractId,
      nextPortName:clickRow.value.nextPortName,
      prePortName:clickRow.value.prePortName,
      details:
        clickRow.value.status == 10
          ? (clickRow.value.type == 1?forMastData.filter(item => {
            if (item.serviceContentName !== '陆集陆疏') {
              return item
            }
          }):clickRow.value.type == 2? forMastData.filter(item => {
            if (item.serviceContentName == '陆集陆疏') {
              return item
            }
          }):forMastData)
          : data,
      statementId: clickRow.value.id,
      customerId: clickRow.value.cargoAgentId,
      customerName: clickRow.value.cargoAgentName,
      settlementFlag : routeType ,
      //设置结算方式
      settlementBasisName: clickRow.value.settlementBasisName,
      settlementBasisCode: clickRow.value.settlementBasisCode,
      preNumberCount: tmpPreData==null?'': tmpPreData.number,
      ton2: routeType == '2' || routeType == '5' || routeType == '6' ? weighObj.lxWeigh : weighObj.flxWeigh
    }
    //设置结算方式
    publicApi.getDictList({ types: 'SETTLEMENT_BASIS' }).then(res => {
      drawerRef.value.settlementList = res.data.SETTLEMENT_BASIS
    })

    listContract()

    drawerRef.value.init(clickRow.value)
    drawerRef.value.getOtherFee(clickRow.value.id)
  })
}

let contracts = []

const listContract = async date => {
  if (date === undefined || date === null) date = ''
  if (routeType == '2' || routeType == '5' || routeType == '6') {
    //陆集陆疏查询合同
    await api.getContractListLULS(clickRow.value.id ? clickRow.value.id : 0, date).then(res => {
      contracts = res.data
    })
  } else {
    await api.getContractList(clickRow.value.id ? clickRow.value.id : 0, date).then(res => {
      contracts = res.data
    })
  }

  drawerRef.value.contractList = contracts
  if(contracts.length>0){
    if (contracts != null && contracts.length == 1) {
      if(drawerRef.value.formData.contractId == ''){
        drawerRef.value.formData.contractId =  contracts[0].id
        drawerRef.value.contactChange(contracts[0])
      }
      // console.log(clickRow.value,"clickRow.valueclickRow.valueclickRow.valueclickRow.valueclickRow.valueclickRow.value");
      if(routeType ==  '1' &&  clickRow.value.status == '10'){
        if( drawerRef.value.formData.settlementBasisName ===undefined || drawerRef.value.formData.settlementBasisName == null || drawerRef.value.formData.settlementBasisName == ''){
          if(clickRow.value.tradeTypeLabel === '内贸'){
            if(clickRow.value.impExpLabel=='进口'){
              drawerRef.value.formData.settlementBasisName = contracts[0].settlementBasisName
              drawerRef.value.formData.settlementBasisCode = contracts[0].settlementBasisCode
            }else if(clickRow.value.impExpLabel=='出口'){
              drawerRef.value.formData.settlementBasisCode = contracts[0].expSettlementBasisCode
              drawerRef.value.formData.settlementBasisName = contracts[0].expSettlementBasisName
            }
          }else if(clickRow.value.tradeTypeLabel === '外贸'){
            drawerRef.value.formData.settlementBasisName = contracts[0].outerSettlementBasisName
            drawerRef.value.formData.settlementBasisCode = contracts[0].outerSettlementBasisCode
          }
        }
      }
      if(routeType ==  '2' &&  clickRow.value.status == '10'){
        if( drawerRef.value.formData.settlementBasisName ===undefined || drawerRef.value.formData.settlementBasisName == null || drawerRef.value.formData.settlementBasisName == ''){
          drawerRef.value.formData.settlementBasisName = contracts[0].settlementBasisName
          drawerRef.value.formData.settlementBasisCode = contracts[0].settlementBasisCode
        }
      }
    }
  }
}

// 点击查询的事件
const getList = e => {

  buttonList.forEach(item => (item.disabled = true))
  buttonList[buttonList.length-1].disabled  = false
  clickRow.value = {}
  countTable.value = []

  api.listCostStatement( Object.assign(queryParams.value,e )).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	// console.log('路由', JSON.parse(route.meta.query).id)
	// queryParams.value = {
	// 	startPage: 1,
	// 	pageSize: 10,
	// 	type: type.value, //routeType==1为商务结算，2为商务结算（陆集陆疏）
	// 	...e,
	// }
	// getHandoverList(queryParams.value)
}
// 点击查询的事件
const pageExport = e => {
  api.pageExport( Object.assign(queryParams.value,e )).then(res => {
    downLoadBlob(res, '包干费')

  })
}
// 点击查询的事件
const getHandoverList = e => {
	queryParams.value = e
	queryParams.value.type = type.value
	// buttonList[0].disabled = true
	// buttonList[1].disabled = true
	// buttonList[2].disabled = true
	// buttonList[3].disabled = true
	// buttonList[4].disabled = true
	buttonList.forEach(item => (item.disabled = true))
	clickRow.value = {}
	countTable.value = []
	api.listCostStatement(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
//打印账单
const printCostBill = () => {
    if(clickRow.value.status<30){
      proxy.$message.error('还没有进行计费审核,没有要打印的账单')
      return
    }
	proxy.$modal.confirm('确定下载？').then(() => {
		api.printCostBill({id:clickRow.value.id,routeType:routeType}).then(res => {
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
  { prop: ' ', label: '', type: 'checkbox', width: 40,fixed: 'left' },
	{ label: '作业公司', prop: 'companyName', width: 160 },
	{ label: '通知单编号', prop: 'trustNo',isHidden: isHidden, width: 120 },
	{ label: '票货号', prop: 'cargoInfoNo', width: 120 },
	{ label: 'SCN', prop: 'scn', width: 160 ,isHidden: isHiddenLJLS},
	{ label: '船舶航次', prop: 'shipNameVoyage', width: 160 ,isHidden: isHiddenLJLS},
	{ label: '泊位', prop: 'berthName', width: 90 ,isHidden: isHiddenLJLS},
	{ label: '结算单号', prop: 'statementNo', width: 160 },
	{ label: '客户名称', prop: 'customerName', width: 160 },
	{ label: '结算日期', prop: 'settlementDate', isTime: true, width: 120 },
	{ label: '件杂', prop: 'workType', minWidth: 100 },
	{ label: '货物名称', prop: 'cargoName', minWidth: 100 },
	{ label: '贸别', prop: 'tradeTypeLabel', width: 100 },
	{ label: '靠泊时间', prop: 'berthTime', isTime: true, width: 150 ,isHidden: isHiddenLJLS},
	{ label: '离港时间', prop: 'leavePortTime', isTime: true,  width: 150 ,isHidden: isHiddenLJLS},
	{ label: '交接清单数', prop: 'ton', width: 130,align:'right' },
	{ label: '是否最终结算', prop: 'isFinalLabel', width: 150,align:'center' },
	{ label: '结算量', prop: 'number', width: 100, fixed: 'right',align:'right' },
	{ label: '结算人', prop: 'createByName', width: 120 },
	{ label: '计费人', prop: 'statementByName', minWidth: 100 },
	{ label: '计费时间', prop: 'statementTime', minWidth: 100 },
	{ label: '审核人', prop: 'reviewByName', minWidth: 100 },
	{ label: '审核时间', prop: 'reviewTime', minWidth: 100 },
	{ label: '商务确认人', prop: 'confirmByName', minWidth: 130 },
	{ label: '确认时间', prop: 'confirmTime', minWidth: 100 },
	{ label: '驳回人',
    prop: 'rejectByName',
    minWidth: 100,
    isHidden:isHidden
  },
	{ label: '驳回时间', prop: 'rejectTime', minWidth: 100,isHidden:isHidden },
	{ label: '驳回原因', prop: 'rejectReason', minWidth: 150,isHidden:isHidden },
  {
    prop: '',
    label: '附件查看',
    width: 'operate',
    align: 'center',
    isHidden: !(routeType=='3'||routeType=='5'),
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              //查看照片
              report(row)
            },
            type: 'primary',
            link: true,
            icon: 'Picture',
            permission: 'dispatch:businessSettlement:showImage', // 权限
          },
          {
            default: () => '图片详情',
          }
        )]
    }
  },
  {label: '开票方式',prop: 'taxInvoiceName',width: 130},
  {
    label: '是否完货',
    prop: 'isClear',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isClear == '是' ? 'primary' : 'success',
          },
          {
            default: () => row.isClear,
          }
        ),
      ]
    },
  },
	{
		label: '是否填写交接清单',
		prop: 'statusLabel',
		align: 'center',
    isHidden: isHiddenOther,
		width: 160,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: (row.tbhId == null||row.tbhId == '') ? 'primary' : 'success',
					},
					{
						default: () => (row.tbhId == null||row.tbhId == '') ?'否':'是',
					}
				),
			]
		},
	},
  {
		label: '结算状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? 'primary' : 'success',
					},
					{
						default: () => row.statusLabel,
					}
				),
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
//单击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = row
  if(row.tbhId == null || row.tbhId ==''){
    return
  }
  if(row.id==null || row.id == ''){
    return
  }
  setTimeout(()=>{
    buttonList.forEach(item => (item.disabled = false))
    api.getDetail(row.id).then(res => {
      countTable.value = res.data
    })
  },500 )
}
// 交接单end ----------------------

// 结算单 -------------
const countTable = ref([])
const countTableRef = ref()
const countTableColumns = ref([
	{
		prop: 'serviceContentName',
		label: '服务内容',
		minWidth: 200,
	},
	{
		prop: 'number',
		label: '结算量',
		minWidth: 200,
	},
	{
		prop: 'unitName',
		label: '计费单位',
		minWidth: 120,
	},
	{
		label: '费目',
		prop: 'rateItemName',
		width: 150,
	},
	{
		prop: 'tempRate',
		label: '费率',
		width: 150,
	},
	{
		label: '阶梯优惠',
		prop: 'preferentialRate',
		width: 150,
	},
	{
		prop: 'rate',
		label: '最终费率',
		width: 150,
	},
	{
		prop: 'amount',
		label: '金额',
		width: 150,
	},
	{
		prop: 'tax',
		label: '税率（%）',
		width: 150,
	},
	{
		prop: 'taxAmount',
		label: '税额',
		width: 150,
	},
])
// 获取结算单点击行数据
const countTableClickRow = ref()
const countTableEvent = ({ row }) => {
	// 禁用结算按钮 启用撤销结算按钮
	countTableClickRow.value = row
}
// 结算单end -------------

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
//商务审核上传文件事件
const uploadBusinessFile = () =>{
  if(settlementList.value.length=='0'){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  proxy.$bus.emit('resetFileList')
  dialogUploadVisible.value = true
  nextTick(()=>{
    let tmpList = []
    tmpList = settlementList.value
    businessId.value =  tmpList[0].id
  })
}
// 上传文件
const fileIds=ref([]) // 文件列表
const changeFile = files => {
  fileIds.value = files
}
//文件保存
const saveFile = () => {
  let tmpList = settlementList.value.map(item=>{
    return item.id;
  })
  proxy.$modal.confirm('是否保存文件到系统？').then(() => {
    api.saveFile( {fileIds:fileIds.value,ids:tmpList}).then(res=>{
      proxy.$modal.msgSuccess(res.msg)
    })
    dialogUploadVisible.value = false
  })

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
const hzbhFormData = reactive({
  id:'',
  rejectReason:'',
})
const bhRules = ref({
  rejectReason: [{ required: true, message: '驳回原因不能为空' }],
})
// 结算
const cost = async () => {
  if(clickRow.value.id===undefined || clickRow.value.id == null || clickRow.value.id== ''){
    proxy.$message.error("请先通过点击选中一条数据")
    return
  }
  if(clickRow.value.tbhId == null || clickRow.value.bhtId == ''){
    proxy.$message.error("检测到还没有交接清单数据，请先填写交接清单，再进行操作！")
    return
  }
	drawerVisible.value = true
	const { data } = await api.getDetail(clickRow.value.id)
  const tmpJSWeight = {
    jgWeight:'',
    sgWeight:''
  }
  if (
    isHiddenLJLS
  ){
    const {data:tmpResult } = await api.getJSGWeight(clickRow.value.tbhId)
    tmpJSWeight.jgWeight = tmpResult==null?null:tmpResult.jgweight
    tmpJSWeight.sgWeight = tmpResult==null?null:tmpResult.sgweight
  }

  let tmpPreData = {}
  await api.getPreNumberCount(clickRow.value.id).then(res=>{
    tmpPreData = res.data
  })
  const { data: weighObj } = await api.getWeighCapacity(clickRow.value.handoverlistId)
	const forMastData = data.map(item => {
		const obj = {
			...item,
			taxAmount: '',
			tax: '',
			rate: '',
			amount: '',
			rateItemName: '',
			rateItemCode: '',
			unitCode: '',
			unitName: '',
			contractId: '',
			rateId: '',
		}
		return obj
	})

	await nextTick(() => {
		isDisabled.value = false

		drawerRef.value.resetForm()
    if(data[0].contractId==null && contracts.length ==0){
      drawerRef.value.resetFileTmp()
    }
    drawerRef.value.formData = {
			...clickRow.value,
			contractId: clickRow.value.status == 10 ? '' : data[0].contractId,
      nextPortName:clickRow.value.nextPortName,
      prePortName:clickRow.value.prePortName,
			details:
        clickRow.value.status == 10
          ? (clickRow.value.type == 1?forMastData.filter(item => {
            if (item.serviceContentName !== '陆集陆疏') {
              return item
            }
          }):clickRow.value.type == 2? forMastData.filter(item => {
            if (item.serviceContentName == '陆集陆疏') {
              return item
            }
          }):forMastData)
          : data,
			statementId: clickRow.value.id,
			customerId: clickRow.value.cargoAgentId,
			customerName: clickRow.value.cargoAgentName,
      settlementFlag : routeType ,
      //设置结算方式
      settlementBasisName: clickRow.value.settlementBasisName,
      settlementBasisCode: clickRow.value.settlementBasisCode,
      jgWeight:tmpJSWeight.jgWeight,
      sgWeight:tmpJSWeight.sgWeight,
      preNumberCount: tmpPreData==null?'': tmpPreData.number,
      ton2: routeType == '2' || routeType == '5' || routeType == '6' ? weighObj.lxWeigh : weighObj.flxWeigh
    }
    drawerRef.value.isLJLS = isHiddenLJLS.value
    //设置结算方式
    publicApi.getDictList({ types: 'SETTLEMENT_BASIS' }).then(res => {
      drawerRef.value.settlementList = res.data.SETTLEMENT_BASIS
    })
    // console.log(clickRow.value.id,"clickRow.value.id");

    listContract()

		drawerRef.value.init(clickRow.value)
		drawerRef.value.getOtherFee(clickRow.value.id)
	})
}
// 撤销结算
const revokeCost = () => {
  if(clickRow.value.id===undefined || clickRow.value.id == null || clickRow.value.id== ''){
    proxy.$message.error("请先通过点击选中一条数据")
    return
  }
	proxy.$modal.confirm('是否确定撤销结算？').then(() => {
		api.cancelStatement(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
// 审核
const review = () => {
  if(clickRow.value.id===undefined || clickRow.value.id == null || clickRow.value.id== ''){
    proxy.$message.error("请先通过点击选中一条数据")
    return
  }
	proxy.$modal.confirm('是否确定审核？').then(() => {
		api.review(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('审核成功')
		})
	})
}
// 撤销审核
const revokeReview = () => {
  if(clickRow.value.id===undefined || clickRow.value.id == null || clickRow.value.id== ''){
    proxy.$message.error("请先通过点击选中一条数据")
    return
  }
	proxy.$modal.confirm('是否确定撤销审核？').then(() => {
		api.cancelReview(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
// 商务确认
const hzDialogVisible = ref(false)
const hzbhDialogVisible = ref(false)
const businessAffirm = () => {
  if(settlementList.value.length=='0'){
    proxy.$message.error('请点击左侧复选框选中一条数据！')
    return
  }
  //判断是否是同一客户
  var tmpMap = new Map()
  settlementList.value.forEach(item=>{
    tmpMap.set(item.customerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
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
  if(settlementList.value.length === 1){
    hzFormData.id = tmpList[0].id
    hzFormData.taxInvoiceCode = tmpList[0].taxationInvoiceCode
  }else{
    hzFormData.taxInvoiceCode = tmpList[0].taxationInvoiceCode
  }
  api.getTaxInvoiceTypeList().then(res=>{
    taxInvoiceTypeList.value = res.data
  })
  //获取客户信息的结算放式

/*	proxy.$modal.confirm('是否确定回执确认？').then(() => {
		api.confirm(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('商务确认成功')
		})
	})*/
}

//回执确认保存事件
const submitHzForm = ()=>{
  if(settlementList.value.length=='0' || settlementList.value==null || settlementList===undefined){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  if(hzFormData.taxInvoiceCode===undefined||hzFormData.taxInvoiceCode==null||hzFormData.taxInvoiceCode == ''){
    proxy.$message.error('请选择发票开具类型！')
    return
  }
  hzFormData.ids = settlementList.value.map(item=>{
    return item.id
  })
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

const businessReject = () => {
  if(settlementList.value.length=='0'){
    proxy.$message.error('请点击左侧复选框选中一条数据！')
    return
  }

  hzbhDialogVisible.value = true

  //清除回执驳回表单的数据
  hzbhFormData.id = ''
  hzbhFormData.rejectReason=''
  //重新赋值；
  //hzbhFormData.id = clickRow.value.id
}

//回执驳回保存事件
const submitHzbhForm = ()=>{
  if(settlementList.value.length=='0'){
    proxy.$message.error('请点击左侧复选框选中一条数据！')
    return
  }
  hzbhFormData.ids = settlementList.value.map(item=>{
    return item.id;
  })
  hzbhFormRef.value.validate((valid, fields) => {
    if (!valid) {
      proxy.$modal.msgWarning('请完善表单信息！')
      return
    }
    proxy.$modal.confirm('是否确定驳回？').then(() => {
      api.reject(hzbhFormData).then(res => {
        getList(queryParams.value)
        proxy.$modal.msgSuccess('驳回成功')
      })
      hzbhDialogVisible.value = false;
    })
  })
}


// 取消商务确认
const cancelBusinessAffirm = () => {
  if(settlementList.value.length=='0'){
    proxy.$message.error('请先在左侧复选框中选中数据！')
    return
  }
  let tmpList = settlementList.value.map(item=>{
    // console.log(item,"循环中的item");
    return item.id;
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
const rowStyle = i => {
  if (i.row.rejectReason && i.row.rejectReason != '' && i.row.status == '20' && (routeType == '4'||routeType == '5')) {
    return 'color:red'
  }
  return null
}
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

//
const settlementList = ref([])
//全选事件
const selectAllChange = ({ checked })  =>{
  //解禁按钮
  buttonList.forEach(item => (item.disabled = false))
  settlementList.value = checked ? tableData.value : []
}
//复选框改变事件
const checkboxChange = data =>{
  //console.log(data,"复选框改变事件");
  settlementList.value = JSON.parse(JSON.stringify(data))
  //解禁按钮
  buttonList.forEach(item => (item.disabled = false))
}

//批量打印账单
const printBillBatch = async () =>{

  if(settlementList == null || settlementList.value.length===0){
    proxy.$message.error("请选中要打印的数据");
    return;
  }
  let flag = false;
  settlementList.value.forEach(item=>{
    if(item.status<30){
      flag = true
    }
  })

  if(flag){
    proxy.$message.error("请选择已经计费审核后的数据查看账单");
    return;
  }

  //判断是否是相同的客户
  var tmpMap = new Map()
  settlementList.value.forEach(item=>{
    tmpMap.set(item.customerId,item);
  })
  if(tmpMap.size>1){
    proxy.$message.error("必须选择相同的客户");
    return;
  }
  let settlementIds = []
  settlementIds = settlementList.value.map(item=>{
    return item.id;
  })

  //批量打印账单
  api.printCostBillBatch({statementIds:settlementIds,routeType:routeType}).then(res=>{
    downLoadBlob(res,"包干费账单")
  })
}


/** 初始化数据 */
//初始化函数
const init = async () => {
	await nextTick(() => {
		// proxy.$bus.emit('setInitSearchData', { shipStatusCode: '110' })
    handoverTableRef.value.SearchHeaderRef.searchData.shipStatusCode = '110'
		queryParams.value.shipStatusCode = '110'
	})

  await nextTick(()=> {
    if (routeType == '1' || routeType == '2') {

      // proxy.$bus.emit('setInitSearchData', {status: '10'})
      handoverTableRef.value.SearchHeaderRef.searchData.status = '10'
      queryParams.value.status = '10'

    } else if (routeType == '4' || routeType == '5') {
      //计费审核
      handoverTableRef.value.SearchHeaderRef.searchData.status = '20'
      queryParams.value.status = '20'

    } else if (routeType == '3' || routeType == '6') {
      //回执确认
      handoverTableRef.value.SearchHeaderRef.searchData.status = '30'
      queryParams.value.status = '30'
    }
  })
  //刷新表单数据
	getList(queryParams.value)
}
init()
onMounted(() => {
  let routeTypeTmp = JSON.parse(route.meta.query).id
  if (routeTypeTmp == '2' || routeTypeTmp == '5' || routeTypeTmp == '6') {
    selectData.value = [
      {
        name: '结算状态', // 搜索框name
        type: 'select', // 搜索框类型
        modelValue: 'status', // 绑定字段
        span: 6, // 占位，共24
        dataConfig: {
          url: '/api/internal/public/getDictListByType/STATEMENT_STATUS',
        },
      },
      {
        name: '货名',
        type: 'input', // 搜索框类型
        modelValue: 'cargoName', // 绑定字段
        span:6,
      },
      {
        name: '客户', // 搜索框name
        type: 'remoteSelect', // 搜索框类型
        modelValue: 'customerId', // 绑定字段
        span: 6, // 占位，共24
        dataType: 'CUSTOMER_ALL',
      },
      {
        name: '是否完货', // 搜索框name
        type: 'select', // 搜索框类型
        modelValue: 'isClear', // 绑定字段
        span: 6, // 占位，共24
        selectData: [
          {
            value: '1',
            label: '已完货',
          },
          {
            value: '0',
            label: '未完货',
          }
        ]
      },
      {
        name: '结算单号', // 搜索框name
        type: 'input', // 搜索框类型
        modelValue: 'statementNo', // 绑定字段
        span: 2, // 占位，共24
      },
      {
        name: '件杂', // 搜索框name
        type: 'select', // 搜索框类型
        modelValue: 'workType', // 绑定字段
        span: 2, // 占位，共24
        selectData: [
          {
            value: '1',
            label: '件杂',
          },
          {
            value: '2',
            label: '散杂',
          }
        ]
      },
      {
        name: '作业公司', // 搜索框name
        type: 'select', // 搜索框类型
        modelValue: 'companyId', // 绑定字段
        span: 3, // 占位，共24
        dataConfig: {
          params: {
            type: 'DEPT_WORK_COMPANY',
          },
        },
      },
      {
        name: '票货号',
        type: 'input',
        modelValue: 'cargoInfoNo',
        span: 3,
      },
    ]
  }
})
</script>
<style lang="less" scoped>
.app-container {
	height: auto !important;
}
.image{
  object-fit: contain;  width: 100%;  height: 100%;
}
:deep(ul.el-carousel__indicators.el-carousel__indicators--horizontal.el-carousel__indicators--outside) {
  margin-top: 200px;
}
</style>
