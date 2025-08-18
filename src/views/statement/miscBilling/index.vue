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
      :rowStyle="rowStyle"
      :tableHeight="'pageTableHeight'"
      :cellClickEvent="cellClickEvent"
      :cellDBLClickEvent = "dbClickEvent"
    />

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="billingDrawer" :title="title" size="40%">
      <editMiscBilling ref="billingRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="billingDrawer = false">取消</el-button>
          <el-button type="primary" @click="saveBilling" :disabled="formDisabled">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="miscBilling">
  import BaseTable from '@/components/BaseTable/index.vue'
  import { ref, reactive, nextTick, onMounted,toRefs, } from 'vue'
  import { ElButton, ElTag } from 'element-plus'
  import editMiscBilling from './editMiscBilling/index'
  import { useRoute } from 'vue-router'
  import api from '@/api/statement/miscBilling/index'
  import {getNowDate} from "@/utils";
  const { proxy } = getCurrentInstance()
  const baseTableRef = ref()
  const billingRef = ref(null);
  const billingDrawer = ref(false);
  const title = ref("编辑杂项计费");
  const total = ref(0);
  const formDisabled = ref(false)
  const route = useRoute()
  const routeType = JSON.parse(route.meta.query).id
  //顶部 右侧按钮
  const buttonList = reactive([
    {
      label: '新增', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
      click: () => addMiscBilling, // 回调函数
      permission: routeType!='3'?'statement:miscbilling:add':'', // 权限
    },
    {
      label: '计费', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Check', // 按钮图标，支持element-Plus中所有图标
      click: () => charging, // 回调函数
      permission: routeType!='3'?'statement:miscbilling:charging':'', // 权限
    },{
      label: '撤销计费', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
      click: () => cancleCharging, // 回调函数
      permission: routeType!='3'?'statement:miscbilling:cancleCharging':'', // 权限
    },{
      label: '审核', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
      click: () => handlePublish, // 回调函数
      permission: routeType=='3'?'statement:miscbilling:aduit':''    },
    {
      label: '撤销审核', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
      click: () => revokeMiscBilling, // 回调函数
      permission: routeType=='3'?'statement:miscbilling:revoke':'', // 权限
    },
    {
      label: '查看账单', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Download', // 按钮图标，支持element-Plus中所有图标
      click: () => printFeeList, // 回调函数
      permission: 'statement:miscbilling:printFeeList'// 权限
    },
    {
      label: '导出', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Download', // 按钮图标，支持element-Plus中所有图标
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
    },
    {
      name: '航次', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'voyage', // 绑定字段
      span: 3, // 占位，共24
    },
  ]);
  const rowStyle = i => {
    if (i.row.rejectReason && i.row.rejectReason != '') {
      return 'color:red'
    }
    return null
  }
  const tableColumns = ref([
    { label: '序号', type: 'seq', width: 50,align: 'center' },
    { label: '费目', prop: 'rateName' ,width: 150, align: 'center'},
    { label: '结算单号', prop: 'statementNo' ,width: 120, align: 'center'},
    { label: '作业过程', prop: 'processName' ,width: 120, align: 'left'},
    { label: '客户', prop: 'customerName' ,width: 280, align: 'center '},
    { label: '船名航次', prop: 'shipVoyage' ,width: 120, align: 'center'},
    { label: '泊位', prop: 'berthName' ,width: 90, align: 'center'},
    { label: '货名', prop: 'cargoName' ,width: 120, align: 'center'},
    { label: '费率', prop: 'rate' ,width: 100, align: 'right',isThousandth:'true'},
    { label: '数量1', prop: 'billQuantity' ,width: 100, align: 'right'},
    { label: '数量2', prop: 'billQuantity2' ,width: 100, align: 'right'},
    { label: '总额', prop: 'amountMoney' ,width: 130, align: 'right',isThousandth:'true'},
    { label: '创建人', prop: 'createByName' ,width: 130, align: 'center'},
    { label: '计费人', prop: 'statementByName' ,width: 130, align: 'center'},
    { label: '驳回人', prop: 'rejectByName', width: 100 },
    { label: '驳回时间', prop: 'rejectTime', width: 120 },
    { label: '驳回原因', prop: 'rejectReason', width: 280 },
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
              permission: 'statement:miscbilling:update', // 权限
            },
            {
              default: () => row.status == 20||row.status ==10?'编辑':'查看',
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
              permission: 'bstatement:miscbilling:delete', // 权限
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

  const clickRow = ref({})
  const cellClickEvent = ({ row }) => {
    clickRow.value = row
  }

  const queryParams = ref({
    startPage: 1,
    pageSize: 10,
  })

  const tableData = ref([]);
  //查询
  const getList = e => {
    e.routeType = routeType
    Object.assign(queryParams.value,e)
    api.getList(queryParams.value).then(res=>{
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

  const charging =()=>{
    let tmpRow = clickRow.value
    if(tmpRow==null||tmpRow.id==null||tmpRow.id==''){
      proxy.$message.error("请先选中一条数据")
      return;
    }
    proxy.$modal
      .confirm('确认计费吗？')
      .then(() => {
        api.charging(tmpRow.id).then(res=>{
          proxy.$modal.msgSuccess(res.msg)
          getList(queryParams.value)
        })
      })
  }
 const cancleCharging =()=>{
    let tmpRow = clickRow.value
    if(tmpRow==null||tmpRow.id==null||tmpRow.id==''){
      proxy.$message.error("请先选中一条数据")
      return;
    }
    proxy.$modal
      .confirm('确定要撤销计费么？')
      .then(() => {
        api.cancleCharging(tmpRow.id).then(res=>{
          proxy.$modal.msgSuccess(res.msg)
          getList(queryParams.value)

        })
      })
  }

  const addMiscBilling = ()=>{
    billingDrawer.value = true;
	  formDisabled.value = false;
    if(routeType == 1){
      title.value='新增杂项计费'
    }else{
      title.value='详情'
    }
    nextTick(()=>{
      billingRef.value.resetForm();
    })
  }

  const revokeMiscBilling = ()=>{
    if(clickRow.value.status=='0'){
      proxy.$modal.msgWarning("该杂项计费已撤销审核")
      return;
    }
    proxy.$modal
      .confirm('确认撤销审核吗？')
      .then(() => {
        api.revokeMisc({id:clickRow.value.id} ).then(res => {
          proxy.$modal.msgSuccess("撤销审核成功")
          getList(queryParams.value);
        })
      })
      .catch(() => {})
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

  //更新
const handleUpdate = row=>{
    billingDrawer.value = true;
    nextTick(()=>{
      if(row.status == '10' || row.status == '20'){
        formDisabled.value = false;
        billingRef.value.lookFlag = false;
        title.value='编辑杂项计费'

      }else{
        formDisabled.value = true;
        billingRef.value.lookFlag = true;
        title.value='详情'


      }
    })

    // if(routeType == 1){
    //   title.value='编辑杂项计费'
    // }else{
    //   title.value='详情'
    // }
    nextTick(()=>{
      billingRef.value.resetForm();

      if(row.status == '10' || row.status == '20'){
        formDisabled.value = false;
        billingRef.value.lookFlag = false;
        title.value='编辑杂项计费'

      }else{
        formDisabled.value = true;
        billingRef.value.lookFlag = true;
        title.value='详情'

      }

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

const dbClickEvent = () =>{
  if(routeType=='3'){
    handleUpdate(clickRow.value)
  }
}

  //审核事件
  const handlePublish = ()=>{
    if(clickRow.value.status=='1'){
      proxy.$modal.msgSuccess("该杂项计费已审核")
      return;
    }

    proxy.$modal
      .confirm('是否审核？')
      .then(() => {
        api.publishMisc({id:clickRow.value.id} ).then(res => {
          proxy.$modal.msgSuccess("审核成功")
          getList(queryParams.value);
        })
      })
      .catch(() => {})
  }
  //账单打印
  const printFeeList = () =>{
    if(clickRow.value==null){
      proxy.$message.error("请先选中一条数据");
      return;
    }
    console.log("clickRow.value.status",clickRow.value.status)
    if(clickRow.value.status<30){
      proxy.$message.error("杂项计费未审核，没有账单可供打印");
      return;
    }

    let tmpList = []
    tmpList.push(clickRow.value.id)
    proxy.$modal
      .confirm('确认导出？')
      .then(() => {
        api.printFeeList(tmpList).then(res=>{
          downLoadBlob(res, '杂项计费账单')
          tmpList = []
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
  const init=async ()=>{
    console.log(routeType,"initrouteType");

    await nextTick(()=>{
        if(routeType=='3'){
          baseTableRef.value.SearchHeaderRef.searchData.status = '20'
          queryParams.value.status = '20'
        }
        if(routeType=='1'){
          baseTableRef.value.SearchHeaderRef.searchData.status = '10'
          queryParams.value.status = '10'
        }
      })
    getList(queryParams.value);
  }
  init()
</script>

<style scoped>

</style>
