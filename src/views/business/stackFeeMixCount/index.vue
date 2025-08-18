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
			:autoResize="true"
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
			  <el-button type="primary" @click.stop="revokeCost" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <Refresh />
				  </el-icon>
				  撤销结算
			  </el-button>
			  <el-button type="primary" @click.stop="review" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <View />
				  </el-icon>
				  审核
			  </el-button>
			  <el-button type="primary" @click.stop="revokeReview" :disabled='costDetailButton'>
				  <el-icon :size="15" style="margin: 2px">
					  <Refresh />
				  </el-icon>
				  销审
			  </el-button>
            <el-button type="primary" @click.stop="export1" :disabled='costDetailButton'>
              <el-icon :size="15" style="margin: 2px">
                <Download />
              </el-icon>
              导出
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
					<el-button v-if="!isDisabled" type="primary" @click="save">保存</el-button>
					<el-button type="primary" @click.stop="export1"  v-if="isDisabled">
						<el-icon :size="15" style="margin: 2px"><Download /></el-icon>导出
					</el-button>
					<el-button type="primary" @click.stop="export2"  v-if="isAppear">
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

<script setup name="stackFeeCount">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/stackFeeMixCount/index.js'
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

const queryParams = ref({
	startPage: 1,
	pageSize: 15,
})
const selectData = ref([
  {
    name: '船名航次', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'shipvoyageItemId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '货主', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoOwnerId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '船舶状态',
    type: 'select',
    modelValue: 'shipStatusCode', //对应字段
    span: 3,
    dataConfig: {
      url: '/api/internal/public/getDictListByType/SHIPSTATUS',
    },
  },
  {
    name: '货名',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span:3,
  },
  {
		name: '离泊时间起始', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'beginLeaveBerthTime', //绑定字段
		span: 3, //占位多少，总共24
	},
	{
		name: '离泊时间截止', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'endLeaveBerthTime', //绑定字段
		span: 3, //占位多少，总共24
	},
  {
    name: '是否超期',
    type: 'select',
    modelValue: 'isOverdue',
    span: 3,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    name: '是否完货',
    type: 'select',
    modelValue: 'isClear',
    span: 3,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    name: '进出口',
    type: 'select',
    modelValue: 'impExp',
    span: 3,
    selectData: [{value:'IN',label:'进口'},{value:'OUT',label:'出口'}],
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
		permission:"statement:stackFeeMixCount:cost" , // 权限
	},
])

// 点击查询的事件
const getList = e => {
  buttonList.forEach(item => (item.disabled = true))
  clickRow.value = {}
  countTable.value = []
  api.listCargoInfo( Object.assign(queryParams.value,e )).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

//打印账单
const printCostBill = () => {
  if(clickRow.value.status == '10'){
    proxy.$message.error('请先计费之后再打印')
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
	{ label: '票货号', prop: 'cargoInfoNo', width: 184 , },
	{ label: 'SCN', prop: 'scn', width: 90 , },
	{ label: '船名航次', prop: 'shipNameVoyage', width: 170 },
	{ label: '通知单编号', prop: 'trustNos', width: 121 },
	{ label: '货主', prop: 'cargoOwnerName', width: 220 },
	{ label: '结算人', prop: 'createByName', width: 100 },
	{ label: '作业模式', prop: 'workTypeLabel', isTime: true, width: 101 },
	{ label: '货名', prop: 'cargoName', minWidth: 150 },
	{ label: '贸别', prop: 'tradeType', width: 74 },
	{ label: '靠泊时间', prop: 'berthTime', isTime: true, width: 168 },
	{ label: '离泊时间', prop: 'leaveBerthTime', isTime: true, width: 171 },
	{ label: '离港时间', prop: 'leavePortTimes', isTime: true,  width: 150 },
	{ label: '指令发布时间', prop: 'releaseTimes', isTime: true,  width: 150 },
	{ label: '装卸', prop: 'loadUnload', width: 79 },
  { label: '进出口', prop: 'impExpLabel', width: 90 },
  { label: '完工时间', prop: 'workEndTime', width: 150 },
  { label: '作业公司', prop: 'companyName', width: 200 },
  { label: '完货人', prop: 'clearByName', width: 90 },
  { label: '完货时间', prop: 'clearDate', width: 150 },
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
    prop: 'isClear',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isClear == '1' ? 'success' : 'info',
          },
          {
            default: () => row.isClear == '1' ? '是' : '否',
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
  countTableClickRow.value = null
  costDetailButton.value=true
  buttonList.forEach(item => (item.disabled = false))
  api.listStorageSettle(row.id).then(res => {
    countTable.value = []
    for (let i = 0; i < res.data.length; i++) {
      let details = res.data[i];
      countTable.value.push(details);
    }
  })
}
// 交接单end ----------------------

const costDetails =ref([])
const costDetail =  () => {
  drawerVisible.value = true
  costDetails.value =countTableClickRow.value.details
  nextTick(() => {
    isDisabled.value = true
	  isAppear.value = false
    drawerRef.value.resetForm()
    drawerRef.value.disableContract=true
    proxy.setFormData(drawerRef.value.formData, countTableClickRow.value)
    proxy.setFormData(drawerRef.value.formData, clickRow.value)
    drawerRef.value.formData.allPrice = countTableClickRow.value.amount
    const detailData = JSON.parse(JSON.stringify(costDetails.value))
    drawerRef.value.setTableData2(detailData)
    console.log(countTableClickRow.value,"countTableClickRow.value");
    console.log(countTableClickRow.value.isUseReduce,"countTableClickRow.value.isUseReducecountTableClickRow.value.isUseReducecountTableClickRow.value.isUseReduce");
    drawerRef.value.setReduceInfo(countTableClickRow.value.isUseReduce,countTableClickRow.value.cargoInfoId)
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
const countTableEvent = ({ row }) => {
  // 取消上层表格选中状态
  handoverTableRef.value.clearCurrentColumn()
	// 禁用结算按钮 启用撤销结算按钮
	countTableClickRow.value = row
  costDetailButton.value = false
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
  dialogUploadVisible.value = true
  nextTick(()=>{
    businessId.value =  clickRow.value.id
  })
}
// 上传文件
const fileIds=ref([]) // 文件列表
const changeFile = files => {
  fileIds.value = files
}
//文件保存
const saveFile = () => {
  proxy.$modal.confirm('是否保存文件到系统？').then(() => {
    api.saveFile( fileIds.value,businessId.value).then(res=>{
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
const contractRateId =ref(null)
// 结算
const cost =  async () => {
	drawerVisible.value = true
    nextTick(() => {
      isDisabled.value = false
      drawerRef.value.resetForm()
      drawerRef.value.disableContract=false
      api.listDetail(clickRow.value.id).then(res => {
        drawerRef.value.setTableData(res.data)
      })
      proxy.setFormData(drawerRef.value.formData, clickRow.value)
      drawerRef.value.formData.cargoInfoId = clickRow.value.id
      let tmpList = []
      api.listContract(clickRow.value.id).then(res => {
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

            let params = {
              cargoInfoId:clickRow.value.id,
              contractRateId:tmpList[0].rate.contractRateId,
              isUseReduce:'1'
            }
            api.listDetailWithContract(params).then(res => {
              drawerRef.value.setTableData(res.data)
            })
          }
        }else if (tmpList != null && tmpList.length > 1) {
					isAppear.value = true
				}
      })
      drawerRef.value.setReduceInfo('1',clickRow.value.id)
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
	startExport(data)
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

// 商务确认
const hzDialogVisible = ref(false)

//回执确认保存事件
const submitHzForm = ()=>{
  if(hzFormData.id==null||hzFormData.id == ''){
    proxy.$message.error('请先选中一条数据！')
    return
  }
  if(hzFormData.taxInvoiceCode===undefined||hzFormData.taxInvoiceCode==null||hzFormData.taxInvoiceCode == ''){
    proxy.$message.error('请选择发票开具类型！')
    return
  }
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

/** 初始化数据 */
//初始化函数
const init = async () => {
	// await nextTick(() => {
	// 	proxy.$bus.emit('setInitSearchData', { shipStatusCode: '110' })
	// 	 queryParams.value.shipStatusCode = '110'
	// })
  //刷新表单数据
	getList(queryParams.value)
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
