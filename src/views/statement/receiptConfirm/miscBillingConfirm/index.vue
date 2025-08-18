<template>
  <div class="app-container">
    <BaseTable
      ref="baseTableRef"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :total="total"
      :cellClickEvent="cellClickEvent"
	  :checkbox-config="checkboxConfig"
	  :selectAllChangeEvent="selectAllChange"
	  @checkbox-change="checkboxChange"
    />


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
    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="billingDrawer" :title="title" size="40%">
      <editMiscBilling ref="billingRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="billingDrawer = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="miscBillingConfirm">
  import BaseTable from '@/components/BaseTable/index.vue'
  import { ref, reactive, nextTick, onMounted } from 'vue'
  import { ElButton, ElTag } from 'element-plus'
  import editMiscBilling from './editMiscBilling/index'
  import { useRoute } from 'vue-router'
  import api from '@/api/statement/miscBilling/index'
  import Upload from '@/components/upload/index.vue'
  import publicApi from '@/api/public'
  const { proxy } = getCurrentInstance()

  const baseTableRef = ref()

  const dialogVisible = ref(false)
  const hzDialogVisible = ref(false)
  const billingRef = ref(null);
  //开具方式
  const taxInvoiceTypeList =ref([])
  const billingDrawer = ref(false);
  const title = ref("编辑杂项计费");
  const total = ref(0);
  const formDisabled = ref(false)
  //顶部 右侧按钮
  const buttonList = reactive([
    {
      label: "上传回执单", // 按钮名称
      type: 'primary', // 按钮类型
      disabled: true,
      icon: 'UploadFilled', // 按钮图标，支持element-Plus中所有图标
      click: () => uploadBusinessFile, // 回调函数
      permission:'statement:receiptConfirm:miscBillingConfirm:uploadBusinessFile', // 权限
    },
    {
      label: "回执确认", // 按钮名称
      type: 'primary', // 按钮类型
      disabled: true,
      icon: 'View', // 按钮图标，支持element-Plus中所有图标
      click: () => businessAffirm, // 回调函数
      permission:'statement:receiptConfirm:miscBillingConfirm:businessAffirm', // 权限
    },
    {
      label: "取消回执确认", // 按钮名称
      type: 'primary', // 按钮类型
      disabled: true,
      icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
      click: () => cancelBusinessAffirm, // 回调函数
      permission: 'statement:receiptConfirm:miscBillingConfirm:cancelBusiness', // 权限
    },
    {
      label: '查看账单', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Download', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => printFeeList, // 回调函数
      permission: 'statement:miscbilling:printFeeList'// 权限
    },{
      label: '导出', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Download', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => pageExport, // 回调函数
      permission: 'statement:miscbilling:pageExport'// 权限
    },
  ])
  //顶部 搜索表单
  const selectData = reactive([
    {
      name: '状态', // 搜索框name
      type: 'select', // 搜索框类型
      modelValue: 'status', // 绑定字段
      span: 8, // 占位，共24
      selectData: [
        { label: '待计费', value: '10' },
        { label: '待审核', value: '20' },
        { label: '已审核', value: '30' },
        { label: '回执确认', value: '31' },
        { label: '部分开票', value: '40' },
        { label: '已开票', value: '50' },
      ],
    },
    {
      name: '客户',
      type: 'remoteSelect', //远程下拉框
      modelValue: 'customerId', //对应字段
      span: 8,
      dataType: 'CUSTOMER_ALL',
    },
    {
      name: '结算单号', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'statementNo', // 绑定字段
      span: 8, // 占位，共24
    },
    {
      name: '作业过程', // 搜索框name
      type: 'select', // 搜索框类型
      modelValue: 'processCode', // 绑定字段
      span: 3, // 占位，共24
      dataConfig: {
        params: {
          type: 'MAIN_WORK_PROCESS',
        },
      },
    },
    {
      name: '费目名称', // 搜索框name
      type: 'select', // 搜索框类型
      modelValue: 'rateItemCode', // 绑定字段
      span: 3, // 占位，共24
      dataConfig: {
        // 本地需要dataConfig获取数据，包括url、method，method默认get
        url: '/api/internal/public/getLocalSelect?type=FEE_ITEM',
        method: 'get',
      },
    },
    {
      name: '船名', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'shipName', // 绑定字段
      span: 3, // 占位，共24
    },{
      name: '航次', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'voyage', // 绑定字段
      span: 3, // 占位，共24
    },
  ]);
  //回执确认表单
  const hzFormData = reactive({
	  id:'',
	  receiptRemark:'',
	  taxInvoiceName:'',
	  taxInvoiceCode:'',
  })
  const tableColumns = ref([
    { label: '序号', type: 'seq', width: 50,align: 'center' },
    { prop: ' ', label: '', type: 'checkbox', width: 40,fixed: 'left' },
    { label: '费目', prop: 'rateName' ,width: 150, align: 'left'},
    { label: '结算单号', prop: 'statementNo' ,width: 120, align: 'center'},
    { label: '作业过程', prop: 'processName' ,width: 120, align: 'center'},
    { label: '客户', prop: 'customerName' ,width: 280, align: 'left'},
    { label: '船名航次', prop: 'shipVoyage' ,width: 120, align: 'center'},
    { label: '泊位', prop: 'berthName' ,width: 90, align: 'center'},
    { label: '费率', prop: 'rate' ,width: 100, align: 'right'},
    { label: '税率（%）', prop: 'taxRate' ,width: 120, align: 'right'},
    { label: '数量1', prop: 'billQuantity' ,width: 100, align: 'right'},
    { label: '数量2', prop: 'billQuantity2' ,width: 100, align: 'right'},
    { label: '总额', prop: 'amountMoney' ,width: 130, align: 'right'},
    { label: '税额', prop: 'taxAmount' ,width: 130, align: 'right'},
    {
      label: '状态',
      prop: 'status',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: row => {
        return [
          h(
            ElTag,
            {
              type: row.status=='10'?"success":row.status=='20'?"primary":'danger'
            },
            {
              default: () => row.status=='10'? "待计费" : row.status=='20'? "待审核" : row.status=='30'? "已审核" : row.status=='31'? "回执确认" : row.status=='40'? "部分开票" : row.status=='50'? "已开票" : ''
            }
          ),
        ]
      },
    },
	  {
		  prop: '',
		  label: '附件查看',
		  width: 'operate',
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
						  permission: 'statement:receiptConfirm:miscBillingConfirm:showImage', // 权限
					  },
					  {
						  default: () => '图片详情',
					  }
				  )]
		  }
	  },
	  {
		  prop: '',
		  label: '操作',
		  align: 'center',
		  width: 150,
		  fixed: 'right',
		  render: row => {
			  return [
				  h(
					  ElButton,
					  {
						  onClick: () => {
							  handleUpdate(row)
						  },
						  type: 'primary',
						  link: true,
						  icon: 'Edit',
						  permission: 'statement:receiptConfirm:miscBillingConfirm:update', // 权限
					  },
					  {
						  default: () =>'查看',
					  }
				  ),
				  h(
					  ElButton,
					  {
						  onClick: () => {
							  handleDelete(row)
						  },
						  type: 'danger',
						  link: true,
						  icon: 'Delete',
						  permission: 'statement:receiptConfirm:miscBillingConfirm:delete', // 权限
						  disabled: !(row.status == 20||row.status == 10),
					  },
					  {
						  default: () => '删除',
					  }
				  ),

			  ]
		  },
	  },
  ])
  //上传商务回执单
  const dialogUploadVisible = ref(false)
  const businessId = ref('')  //文件上传用
  const fileList = ref([]) //文件列表
  //图片地址
  const imgurl = reactive([])
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
		  businessId.value =  tmpList[0].statementId
	  })
  }
  const report = async (row) =>{
	  imgurl.splice(0,imgurl.length) ;

	  await publicApi.getBusFiles({businessId:row.statementId,businessType:"BUSINESS_RECEIPT"}).then(res=>{
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
  //
  // 上传文件
  const fileIds=ref([]) // 文件列表
  const changeFile = files => {
	  fileIds.value = files
  }
  //文件保存
  const saveFile = () => {
	  let tmpList = settlementList.value.map(item=>{
		  return item.statementId;
	  })
	  proxy.$modal.confirm('是否保存文件到系统？').then(() => {
		  api.saveFile( {fileIds:fileIds.value,ids:tmpList}).then(res=>{
			  proxy.$modal.msgSuccess(res.msg)
		  })
		  dialogUploadVisible.value = false
	  })

  }
  const settlementList = ref([])
  //全选事件
  const selectAllChange = ({ checked })  =>{
	  //解禁按钮
	  buttonList.forEach(item => (item.disabled = false))
	  settlementList.value = checked ? tableData.value : []
	  buttonList.forEach(item => settlementList.value.length>0 ? item.disabled = false : item.disabled = true)

  }
  //复选框改变事件
  const checkboxChange = data =>{
	  //console.log(data,"复选框改变事件");
	  settlementList.value = JSON.parse(JSON.stringify(data))
	  //解禁按钮
	  buttonList.forEach(item => settlementList.value.length>0 ? item.disabled = false : item.disabled = true)
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

  const clickRow = ref({})
  const cellClickEvent = ({ row }) => {
    clickRow.value = row
  }
  const route = useRoute()
  const routeType = JSON.parse(route.meta.query).id
  const queryParams = ref({
    startPage: 1,
    pageSize: 10,
  })

  const tableData = ref([]);
  //查询
  const getList = e => {
    queryParams.value = e
    e.routeType = routeType
    api.getListForCargo(e).then(res=>{
      if (res.code === '0000') {
        tableData.value = res.data.pages;
        total.value = res.data.totalNum
      }
    });
  }

  //导出
  const pageExport = (e)=>{
    api.pageExport(queryParams.value).then(res=>{
      downLoadBlob(res, '杂项计费')
    });
  }
const businessAffirm = async () => {
	  if(settlementList.value.length=='0'){
		  proxy.$message.error('请点击左侧复选框选中一条数据！')
		  return
	  }
	  //判断是否是同一客户
	  var tmpMap = new Map()
    var flag = false;
	  settlementList.value.forEach(item=>{
      if(item.status<30){
        flag = true
      }
		  tmpMap.set(item.customerId,item);
	  })

    if(flag){
      proxy.$message.error("必须选择已审核的数据进行回执确认");
      return;
    }

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
	  //查询客户的开票类型

	  if(settlementList.value.length == 1){
      console.log("开票类型")
      let tmplist = []
      tmpList = settlementList.value
      await api.getCustomerInfo(tmpList[0].id).then(res=>{
        if(res.data !=null){
          hzFormData.taxInvoiceCode = res.data.taxationInvoiceCode
        }
      })
      //赋值
		  hzFormData.id = tmpList[0].statementId
	  }else{
		  hzFormData.taxInvoiceCode = tmpList[0].taxationInvoiceCode
	  }
	  api.getTaxInvoiceTypeList().then(res=>{
		  taxInvoiceTypeList.value = res.data
	  })
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
		  return item.statementId
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

  // 取消商务确认
  const cancelBusinessAffirm = () => {
	  if(settlementList.value.length=='0'){
		  proxy.$message.error('请先在左侧复选框中选中数据！')
		  return
	  }
	  let tmpList = settlementList.value.map(item=>{
		  // console.log(item,"循环中的item");
		  return item.statementId;
	  })
	  proxy.$modal.confirm('是否确定取消回执确认？').then(() => {
		  api.cancelConfirm({ids:tmpList}).then(res => {
			  getList(queryParams.value)
			  proxy.$modal.msgSuccess('取消成功')
		  })
	  })
  }
  const saveBilling = async()=>{
	  if (await billingRef.value.validate()) {
		  const params = JSON.parse(JSON.stringify(billingRef.value.billingForm)) // 取到子组件的formData
		  proxy.$modal.confirm(`确定保存？`).then(() => {
			  api.submitMiscBilling(params).then(res => {
				  if (res.code === '0000') {
					  proxy.$modal.msgSuccess("保存成功")
					  billingDrawer.value = false;
					  getList(queryParams.value);
				  }
			  })
		  })
	  }
  }
  const handleUpdate = row=>{
	  billingDrawer.value = true;

	  if(routeType == 1){
		  title.value='编辑杂项计费'
	  }else{
		  title.value='编辑开票申请'
	  }
	  nextTick(()=>{
		  billingRef.value.resetForm();
		  api.getMiscByid({id:row.id}).then(res=>{
			  billingRef.value.billingForm = res.data;
			  api.getProcessByRateItemCode({rateId:row.rateId}).then(res=>{
				  billingRef.value.processNameList = res.data;
			  });
			  api.getCargoList({customerId:row.customerId,shipvoyageItemId:row.voyageId}).then(res=>{
				  billingRef.value.cargoInfoList = res.data;
			  });
		  })
	  })
  }
  //账单打印
  const printFeeList = () =>{
    if(settlementList.value.length=='0'){
      proxy.$message.error('请先在左侧复选框中选中数据！')
      return
    }
    var tmpMap = new Map()
    settlementList.value.forEach(item=>{
      tmpMap.set(item.customerId,item);
    })
    if(tmpMap.size>1){
      proxy.$message.error("必须选择相同的客户");
      return;
    }
    let tmpList = settlementList.value.map(item=>{
      // console.log(item,"循环中的item");
      return item.id;
    })
    proxy.$modal
      .confirm('确认导出？')
      .then(() => {
        api.printFeeList(tmpList).then(res=>{
          downLoadBlob(res, '杂项计费账单')

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
  //删除
  const handleDelete= deleteRow=>{
	  proxy.$modal
		  .confirm('是否删除？')
		  .then(() => {
			  api.deleteMisc( deleteRow.id).then(res => {
				  proxy.$modal.msgSuccess("删除成功")
				  getList(queryParams.value);
			  })
		  })
		  .catch(() => {})
  }

  const init = async () =>{
    nextTick(()=>{
      baseTableRef.value.SearchHeaderRef.searchData.status = '30'
    })
    queryParams.value.status = '30'
    getList(queryParams.value);
  }
  init()
</script>

<style scoped>

</style>
