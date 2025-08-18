<template>
  <div class="app-container">
    <BaseTable
			ref="BaseTableRef"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:buttonList="buttonList"
      :tableHeight="400"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
			:total="total"
      :cellDBLClickEvent = "dbClickEvent"
      :checkbox-config="checkboxConfig"
	    @selectAllChangeEvent="selectAllChange"
	    @checkbox-change="checkboxChange"
      :html-content="collectHtml"
    />
    <BaseTable
			ref="countTableRef"
			:showSearchHeader="false"
			:tableColumns="countTableColumns"
			:tableData="countTable"
			:tableHeight="200"
			:autoResize="true"
		/>
  </div>
  <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="isShow" title="采销订单" size="80%">
      <detail ref="billingRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="isShow = false">取消</el-button>
          <el-button type="primary" @click="insertClick" v-if="isAudit">保存</el-button>
        </div>
      </template>
    </el-drawer>
    <el-dialog title="附件查看" v-model="dialogUploadVisible" width="40%">
      <Upload
        :businessType="businessType"
        :businessId="businessId"
        @changeFile="changeFile"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogUploadVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
    <!--  图片展示  -->
    <el-dialog v-model="dialogVisible" title="图片查看" width="50%">
      <el-image v-for="(item, index) in imgurl" :src="item" :key="index" loading="lazy" fit :preview-src-list="imgurl" style="width:auto;height:500px"  />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  <el-dialog title="红冲" v-model="hcDialogVisible" width="40%">
    <el-form :model="hcFormData" ref="hcFormRef" label-width="80px" :rules="rules">
      <el-form-item label="统计日期">
        <el-date-picker
          v-model="hcFormData.settlementDate"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          placeholder="选择结算日期"></el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="hcDialogVisible = false">关 闭</el-button>
        <el-button @click="redRushClick" type="primary" >保 存</el-button>
      </div>
    </template>
  </el-dialog>
    <!--  加水接电  -->
    <el-dialog title="加水接电记录" v-model="waterAndElectricityDialog" width="50%">
      <BaseTable
				ref="tableRef"
				:show-footer="false"
				:tableHeight="200"
				:autoResize="true"
				:tableColumns="waterAndElectricityColumns"
				:tableData="waterElectricityData"
			/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="waterAndElectricityDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 修改 -->
    <el-drawer v-model="isShowEdit" title="修改" size="30%">
      <el-form :model="editForm" class="formData" ref="editFormRef" :rules="rules" :inline="true" label-position="top">
        <el-row>
          <el-col :span="24">
            <el-form-item label="金额" prop="amount">
				    	<el-input v-model="editForm.amount" @input="amountChange"/>
				    </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="税额">
				    	<el-input v-model="editForm.taxAmount" disabled/>
				    </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="editForm.remark"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="isShowEdit = false">取消</el-button>
          <el-button type="primary" @click="updateItemClick">保存</el-button>
        </div>
      </template>
    </el-drawer>
  <el-drawer v-model="isShowDiscount" title="折扣" size="30%">
    <el-form :model="discountForm" class="formData" ref="discountFormRef" :rules="rulesD" :inline="true" label-position="top">
      <el-row>
        <el-col :span="24">
          <el-form-item label="计费金额" prop="amountjf">
            <el-input v-model="discountForm.amountjf" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="折扣金额" prop="amountzk">
            <el-input v-model="discountForm.amountzk" @input="amountChangeD"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="结算单金额" prop="amount">
            <el-input v-model="discountForm.amount" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="税额">
            <el-input v-model="discountForm.taxAmount" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="discountForm.remark"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="isShowDiscount = false">取消</el-button>
        <el-button type="primary" @click="updateItemClickD">保存</el-button>
      </div>
    </template>
  </el-drawer>
<!--  结算单打印-->
<!--    <templateDesign ref="printref"></templateDesign>-->
</template>
<script setup name="costStatement">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted,h,getCurrentInstance, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/statement/costStatement/index'
import publicapi from '@/api/public/index'
import { ElButton, ElTag,ElMessage, ElMessageBox,ElLink } from 'element-plus'
import detail from './detail/index.vue'
import Upload from '@/components/upload/index.vue'
// import templateDesign from '@/views/master/templateDesign/templateDesign.vue'
import useUserStore from '@/store/modules/user'
import math from '@/utils/math.js'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const userName = computed(() => userStore.name)
const total = ref(0)
const clickRow = ref(null)
const isAudit = ref(true)
const hzDialogVisible = ref(false)
const hcDialogVisible = ref(false)
const rotation = ref(0)

const collectHtml = ref(`<p style="line-height:25px;margin-top:10px;"> 合计金额：0 元</p>`)
//发票开具方式
const taxInvoiceTypeList =ref([])
//回执确认表单
const hzFormData = reactive({
  id:'',
  receiptRemark:'',
  taxInvoiceName:'',
  taxInvoiceCode:'',
})
const hcFormData = reactive({
    settlementDate:''
})
// 搜索框
const selectData = reactive([
  {
		name: '结算单号',
		type: 'input', //远程下拉框
		modelValue: 'statementNo', //对应字段
		span: 8,
	},
  {
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
	},
  {
    name: '客户',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  /*{
    name: '结算月份',
    type: 'month',
    modelValue: 'month',
    span: 2
  },*/
  {
    name: '结算单类型',
    type: 'select', //远程下拉框
    modelValue: 'type', //对应字段
    span: 2,
    dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/HANDOVERLIST_TYPE',
			method: 'get',
		},
  },
  {
    name: '状态',
    type: 'select', //远程下拉框
    modelValue: 'status', //对应字段
    span: 2,
    dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/STATEMENT_STATUS',
			method: 'get',
		},
  },
  {
    name: '财务状态',
    type: 'select', //远程下拉框
    modelValue: 'financeStatus', //对应字段
    span: 2,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      url: '/api/internal/public/getDictListByType/STATEMENT_CW_STATUS',
      method: 'get',
    },
  },
  {
    name: '票货号',
    type: 'input', //远程下拉框
    modelValue: 'cargoInfoNo', //对应字段
    span: 3,
  },
  {
    name: '作业公司',
    type: 'select', //远程下拉框
    modelValue: 'companyId', //对应字段
    span: 3,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
  {
    name: '开始月份',
    type: 'month',
    modelValue: 'months',
    span: 2
  },
  {
    name: '结束月份',
    type: 'month',
    modelValue: 'monthe',
    span: 2
  },
])
// 按钮组
const buttonList = reactive([
  {
		label: '商务审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => businessReview, // 回调函数
		permission: 'statement:costStatement:audit', // 权限
	},
  {
		label: '财务审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => financeReview, // 回调函数
		permission: 'statement:costStatement:financeaudit', // 权限
	},
  {
		label: '订单录入', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: false,
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => pickSellClick, // 回调函数
		permission: 'statement:costStatement:pickSell', // 权限
	},
  {
		label: '订单编辑', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: false,
		icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
		click: () => pickSellEditClick, // 回调函数
		permission: 'statement:costStatement:pickSellEdit', // 权限
	},
  {
		label: '订单删除', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: false,
		icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
		click: () => pickSelldeleteClick, // 回调函数
		permission: 'statement:costStatement:pickSellDel', // 权限
	},
  {
		label: '红冲', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'TurnOff', // 按钮图标，支持element-Plus中所有图标
		click: () => redRush, // 回调函数
		permission: 'statement:costStatement:redRush', // 权限
	},
])
const billingRef = ref()
// 列表
const tableData = ref([])
const sumObj = ref({})
const tableColumns = reactive([
  { prop: ' ', label: '', type: 'checkbox', width: 40,fixed: 'left' },
  {
    prop: 'statementNo',
    label: '结算单号',
    width: 120
  },
  {
    prop: 'companyName',
    label: '作业公司',
    width: 170
  },
  {
    prop: 'customerName',
    label: '客户',
    width: 160
  },
  {
    prop: 'type',
    label: '结算单类型',
    width: 140
  },
  {
    prop: 'shipNameVoyage',
    label: '船名航次',
    width: 140
  },
  {
    prop: 'cargoInfoNo',
    label: '票货号',
    width: 140
  },
  {
    prop: 'tradeType',
    label: '贸别',
    width: 140
  },
  {
    prop: 'settlementDate',
    label: '统计日期',
    width: 140
  },
  {
    prop: 'amountjf',
    label: '计费金额',
    width: 140
  },
  {
    prop: 'amountzk',
    label: '折扣金额',
    width: 140
  },
  {
    prop: 'amount',
    label: '结算单金额',
    width: 140
  },
  {
    prop: 'invoiceAmount',
    label: '开票金额',
    width: 140
  },
  {
    prop: 'utilizedAmountSum',
    label: '收款金额',
    width: 140
  },
  {
		  prop: '',
		  label: '附件查看',
		  width: 100,
		  align: 'center',
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
					  },
					  {
						  default: () => '附件查看',
					  }
				  )]
		  }
	  },
  {
    prop: 'statusLabel',
    label: '状态',
    width: 100,
    fixed: 'right',
    render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '30' ? '' :
            row.status == '31' ? 'success' :
            row.status == '40' ? 'primary' :
            row.status == '50' ? 'warning' : 'info',
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
  },
  {
    prop: 'financeStatusLabel',
    label: '财务审核状态',
    width: 120,
    fixed: 'right',
    render: row => {
			return [
				h(
					ElTag,
					{
						type: row.financeStatus == '10' ? '' : 'success',
					},
					{
						default: () => row.financeStatusLabel,
					}
				),
			]
		},
  },
  {
    prop: 'statementByName',
    label: '计费人',
    width: 140
  },
  {
    prop: 'statementTime',
    label: '计费日期',
    width: 140
  },
  {
    prop: 'confirmByName',
    label: '商务审核人',
    width: 140
  },
  {
    prop: 'confirmTime',
    label: '商务审核日期',
    width: 140
  },
  {
    prop: 'financeByName',
    label: '财务确认人',
    width: 140
  },
  {
    prop: 'financeTime',
    label: '财务确认日期',
    width: 140
  },

  {
    prop: '',
		label: '打印',
		width: 150,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							printClick(row)
						},
						type: 'primary',
						link: true,
            disabled: row.type!='船方计费'&&row.type!='杂项计费'&&row.type!='拖轮计费'&&row.type!='陆集陆疏货方计费'
            &&row.type!='船舶货方计费'&&row.type!='应收运输费'&&row.type!='应付运输费'&&row.type!='堆存费',
						permission: 'statement:costStatement:print', // 权限
					},
					{
						default: () => '结算单',
					}
				),
			]
		},
  }
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
	clickRow.value = {}
	api.queryAll(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
    if(res.data.extraData){
      sumObj.value=JSON.parse(res.data.extraData)
     }else{
      sumObj.value = {
        amount:0,
        invoiceAmount:0,
        utilizedAmountSum:0,
      }
    }
    collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmountSum} 元; 勾选金额：0</p>`
    buttonList[0].disabled = true
	  buttonList[1].disabled = true
	  buttonList[3].disabled = true
    buttonList[4].disabled = true
    buttonList[5].disabled = true
    countTable.value = []
	})
}
const countTable = ref([])
const countTableColumns = reactive([
  {
    prop: 'rateItemName',
    label: '费目',
    width: 120
  },
  {
    prop: 'processName',
    label: '作业过程',
    width: 120
  },
  {
    prop: 'serviceContentName',
    label: '服务内容',
    width: 120
  },
  {
    prop: 'number',
    label: '数量1',
    width: 120
  },
  {
    prop: 'number2',
    label: '数量2',
    width: 120
  },
  {
    prop: 'rate',
    label: '费率',
    width: 120
  },
  {
    prop: 'unitName',
    label: '计费单位',
    width: 120
  },
  {
    prop: 'amountjf',
    label: '计费金额',
    width: 120
  },{
    prop: 'amountzk',
    label: '折扣金额',
    width: 120
  },
  {
    prop: 'amount',
    label: '结算单金额',
    width: 120
  },
  {
    prop: 'tax',
    label: '税率%',
    width: 120
  },
  {
    prop: 'taxAmount',
    label: '税额',
    width: 120
  },
  {
    prop: 'remark',
    label: '备注',
    width: 120
  },

  {
    prop: '',
		label: '操作',
		width: 180,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				/*h(
					ElButton,
					{
						onClick: () => {
							searchClickWater(row)
						},
						type: 'primary',
						link: true,
            disabled: row.rateItemCode!='03'&&row.rateItemCode!='05',
					},
					{
						default: () => '水电明细',
					}
				),*/
        /*h(
					ElButton,
					{
						onClick: () => {
							updateStatementItemClick(row)
						},
						type: 'primary',
						link: true,
            disabled: clickRow.value.financeStatus=='20',
            permission: 'statement:costStatement:update', // 权限
					},
					{
						default: () => '修改',
					}
				),*/
        h(
          ElButton,
          {
            onClick: () => {
              discountStatementItemClick(row)
            },
            type: 'primary',
            link: true,
            disabled: clickRow.value.financeStatus=='20',
            permission: 'statement:costStatement:discount', // 权限
          },
          {
            default: () => '折扣',
          }
        ),
			]
		},
  }
])
const settlementList = ref([])
//全选事件
const selectAllChange = (checked)  =>{
  console.log("全选事件")
    settlementList.value = JSON.parse(JSON.stringify(data))
    let statusList = settlementList.value.map(v => v.status)
    let financeStatusList = settlementList.value.map(v => v.financeStatus)

    if(settlementList.value){
        var amount=0
        settlementList.value.forEach(item=>{
            amount = Number(math.numAdd(amount,item.amount)).toFixed(3)
        })
        collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmountSum} 元; 勾选金额：${amount}</p>`
    }else{
        collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmountSum} 元; 勾选金额：0</p>`
    }
    //商务审核
    if (new Set(statusList).size == 1) {
        if (Array.from(new Set(statusList))[0]=='30') {
            buttonList[0].disabled = false
            buttonList[0].label = '商务审核'
        }
        if (Array.from(new Set(statusList))[0]=='31') {
            buttonList[0].disabled = false
            buttonList[0].label = '取消审核'
        }
    } else {
        buttonList[0].disabled = true
    }
    //财务审核
    if (new Set(financeStatusList).size == 1){
        if (Array.from(new Set(financeStatusList))[0]=='10'){
            buttonList[1].disabled = false
            buttonList[1].label = '财务审核'
        }
        if (Array.from(new Set(financeStatusList))[0]=='20'){
            buttonList[1].disabled = false
            buttonList[1].label = '财务撤销'
        }
    } else {
        buttonList[1].disabled = true
    }
    settlementList.value.forEach(item=>{
        if(item.status==50 && item.amount!=0 || item.status==40 && item.amount!=0){
            buttonList[1].disabled = true
        }
    })
    //是否订单录入
    if (settlementList.value.length == 1){
        if (settlementList.value[0].isEnter == '1'){
            buttonList[3].disabled = true
            buttonList[4].disabled = true
            if (settlementList.value[0].status == '30') {
                buttonList[3].disabled = false
                buttonList[4].disabled = false
            }
        }
    } else {
        buttonList[3].disabled = true
        buttonList[4].disabled = true
    }
}
//复选框改变事件
const checkboxChange = data =>{
  console.log(data,"复选框改变事件");
  settlementList.value = JSON.parse(JSON.stringify(data))
  let statusList = settlementList.value.map(v => v.status)
  let financeStatusList = settlementList.value.map(v => v.financeStatus)

  if(settlementList.value){
    var amount=0
    settlementList.value.forEach(item=>{
      amount = Number(math.numAdd(amount,item.amount)).toFixed(3)
    })
    collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmountSum} 元; 勾选金额：${amount}</p>`
  }else{
    collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmountSum} 元; 勾选金额：0</p>`
  }
  //商务审核
  if (new Set(statusList).size == 1) {
    if (Array.from(new Set(statusList))[0]=='30') {
      buttonList[0].disabled = false
      buttonList[0].label = '商务审核'
    }
    if (Array.from(new Set(statusList))[0]=='31') {
      buttonList[0].disabled = false
      buttonList[0].label = '取消审核'
    }
  } else {
    buttonList[0].disabled = true
  }
  //财务审核
  if (new Set(financeStatusList).size == 1){
    if (Array.from(new Set(financeStatusList))[0]=='10'){
      buttonList[1].disabled = false
      buttonList[1].label = '财务审核'
    }
    if (Array.from(new Set(financeStatusList))[0]=='20'){
      buttonList[1].disabled = false
      buttonList[1].label = '财务撤销'
    }
  } else {
    buttonList[1].disabled = true
  }
  settlementList.value.forEach(item=>{
    if(item.status==50 && item.amount!=0 || item.status==40 && item.amount!=0){
      buttonList[1].disabled = true
    }
  })
    //是否订单录入
  if (settlementList.value.length == 1){
    if (settlementList.value[0].isEnter == '1'){
      buttonList[3].disabled = true
      buttonList[4].disabled = true
      if (settlementList.value[0].status == '30') {
        buttonList[3].disabled = false
        buttonList[4].disabled = false
      }
    }
    if (settlementList.value[0].status=="40"||settlementList.value[0].status=="50"){
      buttonList[5].disabled = false
    }
  } else {
    buttonList[3].disabled = true
    buttonList[4].disabled = true
    buttonList[5].disabled = false
  }
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
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
  getDetailList()
}
// 获取结算明细
const getDetailList = () => {
  api.queryById({id:clickRow.value.id}).then(res => {
    countTable.value = res.data.details
  })
}
// 商务审核/撤销
const businessReview = () => {
  if (buttonList[0].label == '商务审核') {
    businessAffirm()
  }
  if (buttonList[0].label == '取消审核') {
    if(settlementList.value.length==0){
	    proxy.$message.error('请点击左侧复选框选中一条数据！')
	    return
	  }
    if(settlementList.value.length>1){
	    proxy.$message.error('只能选中一条数据！')
	    return
	  }
    proxy.$modal
		.confirm('是否商务撤销？')
		.then(res => {
      const params = ref({
        id: settlementList.value[0].id,
        flag: '2'
      })
			api.review(params.value).then(res => {
				proxy.$modal.msgSuccess('撤销成功')
				getList()
			})
		})
		.catch(err => {})
  }
}
// 财务审核/撤销
const financeReview = () => {
  if (buttonList[1].label == '财务审核') {
    for(var i =0;i<settlementList.value.length;i++){
      if(settlementList.value[i].status<'31'){
        proxy.$message.error('结算单'+settlementList.value[i].statementNo+'商务未审核！')
        return
      }
    }
    proxy.$modal
		.confirm('是否财务审核？')
		.then(res => {
      const params = ref({
        ids: settlementList.value.map(v => v.id),
        flag: '1'
      })
			api.financeReview(params.value).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList()
			})
		})
		.catch(err => {})
  }
  if (buttonList[1].label == '财务撤销') {
    if(settlementList.value.length==0){
	    proxy.$message.error('请点击左侧复选框选中一条数据！')
	    return
	  }
    if(settlementList.value.length>1){
	    proxy.$message.error('只能选中一条数据！')
	    return
	  }
    proxy.$modal
		.confirm('是否财务撤销？')
		.then(res => {
      const params = ref({
        id: settlementList.value[0].id,
        flag: '2'
      })
			api.financeReview(params.value).then(res => {
				proxy.$modal.msgSuccess('撤销成功')
				getList()
			})
		})
		.catch(err => {})
  }
}
const init = () => {
  getList(queryParams.value)
}
// 采销窗口
const isShow = ref(false)
// 打开采销抽屉
const pickSellClick = () => {
  isShow.value = true
  nextTick(() => {
		billingRef.value.resetForm()
	})
}
// 采销编辑
const pickSellEditClick = () => {
  isShow.value = true
  isAudit.value = settlementList.value[0].status == '30' ? true:false
  nextTick(() => {
    billingRef.value.queryById(settlementList.value[0].id)
  })
}
// 保存
const insertClick = async () =>{
  console.log("保存")
  if (await billingRef.value.validate()){
    proxy.$modal.confirm('确定保存?').then(res => {
      console.log(billingRef.value.statementForm)
      let form = JSON.parse(JSON.stringify(billingRef.value.statementForm))
      // form.details = JSON.stringify(billingRef.value.statementForm.details)
      if (form.details.length == 0){
        return proxy.$message.warning('请输入明细')
      }
      if (!form.id) {
        form.isEnter='1'
        api.insert(form).then(res => {
          proxy.$message.success(res.msg)
          getList(queryParams.value)
          isShow.value = false
        })
      } else {
        form.isEnter='1'
        api.update(form).then(res => {
          proxy.$message.success(res.msg)
          getList(queryParams.value)
          isShow.value = false
        })
      }
    })
  }
}
// 删除
const pickSelldeleteClick = () => {
  proxy.$modal.confirm('确定删除?').then(res => {
    api.deleteById({id: settlementList.value[0].id}).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    })
  })
}
//上传商务回执单
const dialogUploadVisible = ref(false)
const businessId = ref('')  //文件上传用
const fileList = ref([]) //文件列表
const dialogVisible = ref(false)
//图片地址
const imgurl = ref([])
//商务审核上传文件事件
const fileId = ref(null)
const businessType = ref(null)
// 获取文件
const report = async (row) =>{
  dialogUploadVisible.value = true
  if (row.type == '杂项计费'){
    await api.queryFiles({trustId: row.trustId,type:row.type}).then(res => {
      fileId.value = res.data[0]?res.data[0].id:''
    })
  }
  nextTick(() => {
    if(row.isEnter=="1"){
      businessType.value = 'STATEMENT'
      businessId.value = row.id
    }else{
      if (row.type == '杂项计费'){
        businessType.value = 'BUSINESS_WATER'
        businessId.value = fileId.value
      } else if (row.type == '采购订单'||row.type == '销售订单'){
        businessType.value = 'STATEMENT'
        businessId.value = row.id
      } else {
        businessType.value = 'WATER_GRUGE'
        businessId.value = row.shipvoyageItemId
      }
    }

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
// 打开商务审核弹框
const businessAffirm = async () => {
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

	// hzDialogVisible.value = true
	//清除回执确认表单的数据
	hzFormData.id = ''
	hzFormData.receiptRemark=''
	hzFormData.taxInvoiceCode=''
	hzFormData.taxInvoiceName=''

	// api.getTaxInvoiceTypeList().then(res=>{
	//   taxInvoiceTypeList.value = res.data
	// })
  hzFormData.ids = settlementList.value.map(item=>item.id)
  taxInvoiceTypeList.value.forEach(item=>{
	  if( item.value == hzFormData.taxInvoiceCode ){
		  hzFormData.taxInvoiceName = item.label
	  }
  })
  hzFormData.flag = '1'
  proxy.$modal.confirm('是否确定审核？').then(() => {
	  api.review(hzFormData).then(res => {
		  getList(queryParams.value)
		  proxy.$modal.msgSuccess('商务审核成功')
	  })
  })
}
const printref = ref(null)
// 模板
const printData = ref({
	customerName: '',
  tradeType: '',
  shipName: '',
  leaveBerthTime: '',
  statementNo: '',
  cargoInfoNo: '',
  createName: '',
  createTime: '',
  confirmByName: '',
  recheckByName: '',
	tableData: [],
})
// 结算单打印
const printClick = async(row) => {
  await api.queryByIdzk({id:row.id}).then(res=>{
    printData.value.customerName = res.data.customerName
    printData.value.tradeType = res.data.tradeType
    printData.value.shipName = res.data.shipName
    printData.value.leaveBerthTime = res.data.leaveBerthTime
    printData.value.berthTime = res.data.berthTimeStr
    printData.value.statementNo = res.data.statementNo
    printData.value.createName = res.data.createByName
    printData.value.confirmByName = res.data.confirmByName
    printData.value.recheckByName = res.data.recheckByName
    printData.value.cargoInfoNo = res.data.cargoInfoNo
    let num=0
    let number=0
    res.data.details.forEach((v,index) => {
      v.index = index+1
      num = math.numAdd(num,v.amount)
      number = math.numAdd(number,v.number)
    })
    let table = res.data.details
    if(row.type=='陆集陆疏货方计费' || row.type=='船舶货方计费'|| row.type=='应收运输费'){
      table.push({index: '合计',amount: num ,number: number })
    }else{
      table.push({index: '合计',amount: num })
    }

    printData.value.tableData = table
  })
  nextTick(() => {
    if (row.type == '杂项计费'){
      printData.value.leaveBerthTime = printData.value.cargoInfoNo?"":printData.value.leaveBerthTime

		  printref.value.rateTypeCode = 'CBSDF'
    }
    if (row.type == '船方计费'){
		  printref.value.rateTypeCode = 'TBF'
    }
    if (row.type == '拖轮计费'){
		  printref.value.rateTypeCode = 'TLF'
    }
    if (row.type == '堆存费'){
      printref.value.rateTypeCode = 'DCF'
    }
    if (row.type == '船舶货方计费'||row.type == '陆集陆疏货方计费'){
      printData.value.leaveBerthTime = printData.value.cargoInfoNo?"":printData.value.leaveBerthTime

		  printref.value.rateTypeCode = 'HWZXF'
    }
    if (row.type == '应收运输费'||row.type == '应付运输费'){
		  printref.value.rateTypeCode = 'YSF'
    }
		printref.value.printData = printData.value
		printref.value.printPreview()
	})
}
// 通知单打印
const printNoticeClick = async(row) => {
  await api.queryByIdzk({id:row.id}).then(res=>{
    printData.value.customerName = res.data.customerName
    printData.value.tradeType = res.data.tradeType
    printData.value.shipName = res.data.shipName
    printData.value.leaveBerthTime = res.data.leaveBerthTime
    printData.value.berthTime = res.data.berthTimeStr
    printData.value.statementNo = res.data.statementNo
    let time = res.data.createTime.substring(0,10).split('-')
    printData.value.createTime = time[0]+"年"+time[1]+"月"+time[2]+"日"
    let num=0
    res.data.details.forEach((v,index) => {
      v.index = index+1
      num = math.numAdd(num,v.amount)
    })
    let table = res.data.details
    table.push({index: '合计',amount: num })
    printData.value.tableData = table
  })
  nextTick(() => {
    if (row.type == '杂项计费'){
		  printref.value.rateTypeCode = 'ZXFTZD'
    }
    if (row.type == '船方计费'){
		  printref.value.rateTypeCode = 'TBFTZD'
    }
    if (row.type == '拖轮计费'){
		  printref.value.rateTypeCode = 'TLFTZD'
    }
    if (row.type == '堆存费'){
      printref.value.rateTypeCode = 'DCFTZD'
    }
    if (row.type == '船舶货方计费'||row.type == '陆集陆疏货方计费'){
		  printref.value.rateTypeCode = 'HWZXFTZD'
    }
    if (row.type == '应收运输费'||row.type == '应付运输费'){
		  printref.value.rateTypeCode = 'YSFTZD'
    }
		printref.value.printData = printData.value
		printref.value.printPreview()
	})
}
// 加水接电明细
const waterAndElectricityDialog = ref(false)
const waterElectricityData = ref([])
const waterAndElectricityColumns = ref([
  {
		label: '作业过程',
		prop: 'processName',
    width: 100
	},
	{
		label: '作业量',
		prop: 'quantity',
	},
	{
		label: '开始时间',
		prop: 'startTime',
    width: 150
	},
  {
		label: '结束时间',
		prop: 'endTime',
    width: 150
	},
	{
		label: '图片',
		prop: 'file',
		width: 80,
		render: row => {
			return [
				h(
					ElLink,
					{
						onClick: () => {
							fileShow(row)
						},
						type: 'primary',
					},
					{
						default: () => '查看',
					}
				),
			]
		},
	},
	{
		label: '创建人',
		prop: 'createByName',
	},
])
const searchClickWater = () => {
  waterAndElectricityDialog.value = true
  api.listWaterElectricity(clickRow.value.trustId).then(res => {
    waterElectricityData.value = res.data
  })
}
// 查询照片
const fileShow = row => {
  rotation.value = 0
	dialogVisible.value = true
	const rowData = JSON.parse(JSON.stringify(row))
	const fileIds = rowData.fileIds.split(',')
  imgurl.value = []
	fileIds.forEach(item => {
		publicapi.down(item).then(res => {
			const blob = new Blob([res.data], {
				type: 'application/png;charset=utf-8',
			})
			const url = window.URL.createObjectURL(blob)
			imgurl.value.push(url)
		})
	})
}
const isShowEdit = ref(false)
const isShowDiscount = ref(false)
const editForm = ref({
  id: '',
  amount: '',
  taxAmount: '',
  tax: '',
  remark:'',
})

const discountForm = ref({
  id: '',
  amount: '',
  amountjf: '',
  amountzk: '',
  taxAmount: '',
  tax: '',
  remark:'',
})
//表单验证
const rules = reactive({
	amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }],
	remark: [{ required: true, message: '请说明修改原因', trigger: 'blur' }]
})
const rulesD = reactive({
  amount: [{ required: true, message: '结算单金额不能为空', trigger: 'blur' }],
  amountjf: [{ required: true, message: '计费金额不能为空', trigger: 'blur' }],
  amountzk: [{ required: true, message: '折扣金额不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '请说明折扣原因', trigger: 'blur' }]
})
// 修改子表数据
const updateStatementItemClick = row => {
  isShowEdit.value = true
  editForm.value.id = row.id
  editForm.value.amount = row.amount
  editForm.value.taxAmount = row.taxAmount
  editForm.value.tax = row.tax
  editForm.value.remark = row.remark
}

const discountStatementItemClick = row => {
  isShowDiscount.value = true
  discountForm.value.id = row.id
  discountForm.value.amount = row.amount
  discountForm.value.amountjf = row.amountjf
  discountForm.value.amountzk = row.amountzk
  discountForm.value.taxAmount = row.taxAmount
  discountForm.value.tax = row.tax
  discountForm.value.remark = row.remark
}
// 金额change事件
const amountChange = e => {
  editForm.value.taxAmount = Number(math.numMulti(math.numDiv(e,1+math.numDiv(editForm.value.tax,100)),math.numDiv(editForm.value.tax,100))).toFixed(2)
}

const amountChangeD = e => {
  if(e){
    discountForm.value.amount=Number(math.numSub(discountForm.value.amountjf,discountForm.value.amountzk))
    discountForm.value.taxAmount = Number(math.numMulti(math.numDiv(discountForm.value.amount,1+math.numDiv(discountForm.value.tax,100)),math.numDiv(discountForm.value.tax,100))).toFixed(2)
  }
}
const editFormRef = ref(null)
const discountFormRef = ref(null)
// 保存修改
const updateItemClick = () => {
  editFormRef.value.validate((valid) => {
		if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			return
		}
    proxy.$modal.confirm('确定保存?').then(res => {
      api.updateStatementItem(editForm.value).then(res => {
        proxy.$message.success(res.msg)
        isShowEdit.value = false
        getDetailList()
        getList()
      })
    })
	})
}

const updateItemClickD = () => {
  discountFormRef.value.validate((valid) => {
    if (!valid) {
      proxy.$message.warning('请完善表单信息！')
      return
    }
    proxy.$modal.confirm('确定保存?').then(res => {
      api.updateStatementItemD(discountForm.value).then(res => {
        proxy.$message.success(res.msg)
        isShowDiscount.value = false
        getDetailList()
        getList()
      })
    })
  })
}
// 红冲
const redRushClick = () => {
  if (settlementList.value.length==0||settlementList.value.length>1){
    return proxy.$message.warning('请选择一条结算单进行红冲')
  }
  if(!hcFormData.settlementDate){
      return proxy.$message.warning('请录入统计日期！')
  }
  var param ={...settlementList.value[0]}
  param.settlementDate = hcFormData.settlementDate
  proxy.$modal.confirm('确定保存?').then(res => {
    api.redRush(param).then(res => {
      proxy.$message.success(res.msg)
      getList()
    })
  })
}

const redRush = () => {
  if (settlementList.value.length==0||settlementList.value.length>1){
    return proxy.$message.warning('请选择一条结算单进行红冲')
  }
    hcDialogVisible.value=true;
    const now = new Date()
    const nowMonth = (now.getMonth()+1) < 10 ? ('0'+(now.getMonth()+1)) : now.getMonth()+1
    const nowDay = (now.getDate()) < 10 ? ('0'+(now.getDate())) : now.getDate()
    const nowDate = now.getFullYear() + '-' + nowMonth + '-' + nowDay
    hcFormData.settlementDate = nowDate
}
// 打印标记
const printFlagClick = () => {
  proxy.$modal.confirm('是否操作？').then(res => {
    const params = {
      ids: settlementList.value.map(v => v.id),
      flag: buttonList[8].label == '打印标记'?'1':'2'
    }
    api.printMark(params).then(res => {
      proxy.$message.success('标记成功')
      getList(queryParams.value)
    })
  })
}
// 初始化
init()
</script>
<style  lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.app-container {
	height: auto !important;
}
</style>
