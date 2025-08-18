<!--  -->
<template>
  <div class="app-container">
    <BaseTable
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :cellClickEvent="cellClickEvent"
      :tableData="tableData"
      :total="total"
    />

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="cargoTransferDrawer" :title="title" size="70%">
      <editDetail ref="detailRef" @editEmit="editOpen" @deleteEmit="deleteEmit"/>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cargoTransferDrawer = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate" v-if="transferFormDisabled">保存</el-button>
          <el-button type="primary" @click="handleApprove" v-if="approveDisabled">确定</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="storageTransferDrawer" :title="title" size="70%">
      <storageDetail ref="storageDetailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="storageTransferDrawer = false">取消</el-button>
          <el-button type="primary" @click="handleYardApprove">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="cargoTransfer">
  import BaseTable from '@/components/BaseTable/index.vue'
  import { ref, reactive,nextTick,onMounted } from 'vue'
  import editDetail from './detail/index.vue'
  import storageDetail from './storageDetail/index.vue'
  import { ElButton, ElTag } from 'element-plus'
  import api from '@/api/business/cargoTransfer/index'

  const emit = defineEmits(['editEmit', 'deleteEmit'])
  const route = useRoute()
  const routeType = JSON.parse(route.meta.query).type
  const transferFormDisabled = ref(true)
  const approveDisabled = ref(false)
  // const emit = defineEmits(['editEmit', 'deleteEmit'])
  const { proxy } = getCurrentInstance()
  const queryParams = ref({
    startPage: 1,
    pageSize: 10,
  })
  const detailRef = ref(null);
  const storageDetailRef = ref(null);
  const clickRow = ref({}) //点击当前行
  //控制作业指令编辑抽屉
  const cargoTransferDrawer = ref(false);
  const storageTransferDrawer = ref(false);
  const title = ref("新增作业指令");
  //顶部 搜索表单
  const selectData = reactive([
    {
      name: '货转日期',
      type: 'date',//远程下拉框
      modelValue: 'transferDate',//对应字段
      span: 8,
    },
    {
      name: '原货主',
      type: 'remoteSelect', //远程下拉框
      modelValue: 'oldCargoOwnerId', //对应字段
      span: 8,
      dataType: 'CUSTOMER_CARGO_OWNER',
    },
    {
      name: '目标货主',
      type: 'remoteSelect', //远程下拉框
      modelValue: 'cargoOwnerId', //对应字段
      span: 8,
      dataType: 'CUSTOMER_CARGO_OWNER',
    },
    {
      name: '货名',
      type: 'remoteSelect', //远程下拉框
      modelValue: 'cargoCode', //对应字段
      span: 3,
      dataType: 'CARGO_INFO',
    },
    {
      name: '贸别',
      type: 'select', //下拉框
      modelValue: 'tradeType', //对应字段
      span: 2,
      selectData: [
        { label: '内贸', value: '内贸' },
        { label: '外贸', value: '外贸' },
      ],
    },
    /*{
      name: '船名航次',
      type: 'remoteSelect', //远程下拉框
      modelValue: 'shipvoyageItemId', //对应字段
      span: 3,
      dataType: 'VOYAGE',
    },*/
    {
      name: '船名', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'shipName', // 绑定字段
      span: 3, // 占位，共24
    }, {
      name: '航次', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'voyage', // 绑定字段
      span: 3, // 占位，共24
    },
    {
      name: '票货号', // 搜索框name
      type: 'input', // 搜索框类型
      modelValue: 'cargoInfoNo', // 绑定字段
      span: 3, // 占位，共24
    },
    {
      name: '状态',
      type: 'select',
      modelValue: 'status',
      span: 3,
      dataConfig:{ url: '/api/internal/public/getDictListByType/TRANSFER_STATUS' },
    },
  ]);
  //数据总条数
  const total = ref(0);
  //顶部 右侧按钮
  const buttonList = reactive([
    {
      label: '商务审批', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Upload', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => approve, // 回调函数
      permission: (routeType == '1') ? "business:cargoTransfer:approve" : " ", // 权限
    },
    {
      label: '商务撤销审批', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Upload', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => cancelApprove, // 回调函数
      permission: (routeType == '1') ? "business:cargoTransfer:cancelApprove" : " ", // 权限
    },
    {
      label: '库场审批', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Check', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => yardApprove, // 回调函数
      permission: (routeType == '2') ? "business:cargoTransfer:yardApprove" : " ", // 权限
    },
    {
      label: '库场撤销审批', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Check', // 按钮图标，支持element-Plus中所有图标
      disabled: true,
      click: () => yardCancelApprove, // 回调函数
      permission: (routeType == '2') ? "business:cargoTransfer:yardCancelApprove" : " ", // 权限
    },
  ]);
  // 表格数据
  const tableData = ref([])
  const tableColumns = ref([
    { label: '原票货号', prop: 'sourceCargoInfoNo' ,align: 'center', width: 160 },
    { label: '目标票货号', prop: 'targetCargoInfoNo' ,align: 'center', width: 170 },
    { label: '货转日期', prop: 'transferDate' ,align: 'center', width: 130 },
    { label: '船名', prop: 'shipName' ,align: 'left', width: 150 },
    { label: '货物名称', prop: 'cargoName' ,align: 'left', width: 180 },
    { label: '贸别', prop: 'tradeType',align: 'center' , width: 80 },
    { label: '包装名称', prop: 'packingName' ,align: 'left', width: 110 },
    { label: '原货主', prop: 'cargoOwnerNameSource',align: 'left' , width: 200 },
    /*{ label: '原货代', prop: 'cargoAgentNameSource' ,align: 'left', width: 120 },*/
    { label: '目标货主', prop: 'cargoOwnerName' ,align: 'left', width: 200 },
    /*{ label: '目标货代', prop: 'cargoAgentNameTarget' ,align: 'left', width: 120 },*/
    { label: '垛位', prop: 'massName',align: 'center' , width: 170 },
    { label: '货转件数', prop: 'quantity',align: 'right', width: 120 },
    { label: '货转重量', prop: 'ton',align: 'right', width: 120 },
    {
      label: '状态',
      prop: 'status',
      align: 'center',
      fixed:'right',
      width: 'status',
      render: row => {
        return [
          h(
            ElTag,
            {
              type: row.status == '1' ? 'info' : row.status == '10' ? 'success'
                : row.status == '20' ? 'primary' : '',
            },
            {
              default: () => (row.status == '1' ? '待审核' : row.status == '10' ? '商务审核'
                : row.status == '20' ? '库场审核' : ''),
            }
          ),
        ]
      },
    },
    {
      prop: '',
      label: '操作',
      width: 'operate',
      align: 'center',
      fixed: 'right',
      render: row => {
        return [
          h(
            ElButton,
            {
              onClick: () => {
                console.log(row)
                // handleUpdate(row)
                editOpen(row)
              },
              type: 'primary',
              link: true,
              icon: 'Edit',
              permission: "business:cargoTransfer:update", // 权限
            },
            {
              default: () => '编辑',
            }
          ),
          h(
            ElButton,
            {
              onClick: () => {
                console.log(row)
                handleDelete(row)
              },
              type: 'danger',
              link: true,
              icon: 'Delete',
              permission: (routeType == '1') ? "business:cargoTransfer:delete" : " ", // 权限
              disabled: row.status == '10'
            },
            {
              default: () => '删除',
            }
          )

        ]
      },
    },
  ])
  //查询
  const getList = e =>{
    queryParams.value = e
    buttonList[0].disabled = true
    buttonList[1].disabled = true
    buttonList[2].disabled = true
    buttonList[3].disabled = true
    if (routeType == '2') {
      queryParams.value.isYard = '1'
    } else {
      queryParams.value.isYard = '0'
    }
    api.getList(e).then(res => {
      tableData.value = res.data.pages;
      total.value = res.data.totalNum
    });
  };

  const approve = () => {
    let row = clickRow.value;
    title.value='商务审批'
    if (row.status != '1') {
      proxy.$modal.msgWarning('该货转已审批，无法重复审批~')
      return
    } else {
      approveDisabled.value = true;
    }
    cargoTransferDrawer.value = true;
    transferFormDisabled.value = false;
    nextTick(()=>{
      detailRef.value.resetForm();
      detailRef.value.customerList = []
      proxy.setFormData(detailRef.value.formData, row)
      detailRef.value.customerList.push({value:row.cargoOwnerIdSource,label:row.cargoOwnerNameSource})
      detailRef.value.customerList.push({value:row.cargoOwnerId,label:row.cargoOwnerName})
      detailRef.value.isDisabled = true;
      detailRef.value.isShow = false;
    });

    /*proxy.$modal.confirm('确定审批？').then(() => {
      api.approve(clickRow.value.id).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('审批成功')
          getList(queryParams.value);
        }
      })
    })*/
  }
  const yardCancelApprove = () => {
    proxy.$modal.confirm('确定撤销审批？').then(() => {
      api.yardCancelApprove({id:clickRow.value.id}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('撤销成功')
          getList(queryParams.value);
        }
      })
    })
  }
  const cancelApprove = () => {
    proxy.$modal.confirm('确定撤销审批？').then(() => {
      api.cancelApprove({id:clickRow.value.id}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('撤销成功')
          getList(queryParams.value);
        }
      })
    })
  }
  const yardApprove = async () => {
    let row = clickRow.value;
    title.value='库场审批'
    if (row.status == '1') {
      proxy.$modal.msgWarning('商务未审批，无法操作~')
      return
    } else if (row.status == '20') {
      proxy.$modal.msgWarning('已审批，请勿重复操作~')
      return
    }
    storageTransferDrawer.value = true;
    const {data: storageList} = await api.getStorageList({cargoInfoIdSource: row.cargoInfoIdSource})
    nextTick(()=>{
      storageDetailRef.value.resetForm();
      storageDetailRef.value.formData.storageList = []
      proxy.setFormData(storageDetailRef.value.formData, row)
      storageDetailRef.value.formData.storageList = storageList
    });

  }


  const handleDelete = row => {
    proxy.$modal.confirm('确定删除？').then(() => {
      api.delete(row.id).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('删除成功')
          getList(queryParams.value);
        }
      });
    });
  }

  const handleUpdate = async () => {
    console.log(detailRef)
    if ( await detailRef.value.validate()) {
      console.log('保存', detailRef.value.formData)
      if (detailRef.value.formData.isBilling!= null && detailRef.value.formData.isBilling == '1') {
        if (detailRef.value.formData.paymentCustomerId == undefined
          || detailRef.value.formData.paymentCustomerId == null
          || detailRef.value.formData.paymentCustomerId == '') {
          proxy.$modal.msgWarning('请填写付款人')
          return
        }
      }
      let transferDate = detailRef.value.formData.transferDate;
      detailRef.value.formData.transferDate = new Date(detailRef.value.formData.transferDate).toLocaleDateString().replaceAll('/', '-') //货转日期
      //detailRef.value.formData.storageDate = new Date(detailRef.value.formData.storageDate).toLocaleDateString().replaceAll('/', '-') //堆货日期
      // console.log('日期',new Date(detailRef.value.formData.storageDate).toLocaleDateString().replaceAll('/','-'));
      const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
      proxy.$modal.confirm('确定保存？').then(() => {
        console.log('点击保存', params)
        if (params.id) {
          api.update(params).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('修改成功')
              cargoTransferDrawer.value = false
              getList(queryParams.value)
            } else {
              detailRef.value.formData.transferDate = transferDate;
            }
          })
        }
      })
    }
  }
  const handleApprove = async () => {
    console.log(detailRef)
    if ( await detailRef.value.validate()) {
      console.log('审批', detailRef.value.formData)
      let transferDate = detailRef.value.formData.transferDate;
      detailRef.value.formData.transferDate = new Date(detailRef.value.formData.transferDate).toLocaleDateString().replaceAll('/', '-') //货转日期
      //detailRef.value.formData.storageDate = new Date(detailRef.value.formData.storageDate).toLocaleDateString().replaceAll('/', '-') //堆货日期
      // console.log('日期',new Date(detailRef.value.formData.storageDate).toLocaleDateString().replaceAll('/','-'));
      const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
      proxy.$modal.confirm('确定审批？').then(() => {
        console.log('点击审批', params)
        if (params.id) {
          api.approve(params).then(res => {
            if (res.code === '0000') {
              if (res.msg === 'success') {
                proxy.$modal .msgSuccess('审批成功')
                cargoTransferDrawer.value = false
                getList(queryParams.value)
              } else {
                proxy.$modal.msgWarning('无法计算免堆存期，请选择票货来源和免堆存期起算日期后重新提交~')
                detailRef.value.formData.transferDate = transferDate;
                detailRef.value.isShow = true
              }
            } else {
              detailRef.value.formData.transferDate = transferDate;
            }
          })
        }
      })
    }
  }

  // const editEmit = e => {
  //   transferTitle.value = '货权转移'
  //   transferVisible.value = true
  //   console.log('货转编辑', e)
  //   nextTick(() => {
  //     transferRef.value.resetForm() // 清空事件
  //     proxy.setFormData(transferRef.value.formData, e)
  //   })
  // }
  const handleYardApprove = async () => {
    let breaked = false
    if (storageDetailRef.value.formData.storageList != null
      && storageDetailRef.value.formData.storageList != undefined) {
      storageDetailRef.value.formData.storageList.forEach(item => {
        item.processDetailCode = '10280001'
        item.processDetailName = '货权转移'
        if (item.transferQuantity != null && item.transferQuantity != undefined) {
          let currQuantity = item.quantity == null || item.quantity == undefined ? 0 : item.quantity;
          if (Number(item.transferQuantity) > Number(currQuantity)) {
            proxy.$modal.msgWarning('转移件数不能大于当前场存件数~')
            breaked = true
          }
        }
        if (item.transferTon != null && item.transferTon != undefined) {
          let currTon = item.ton == null || item.ton == undefined ? 0 : item.ton;
          if (Number(item.transferTon) > Number(currTon)) {
            proxy.$modal.msgWarning('转移吨数不能大于当前场存吨数~')
            breaked = true
          }
        }
      })
    }
    if (!breaked) {
      let transferDate = storageDetailRef.value.formData.transferDate;
      storageDetailRef.value.formData.transferDate = new Date(storageDetailRef.value.formData.transferDate).toLocaleDateString().replaceAll('/', '-') //货转日期
      const params = JSON.parse(JSON.stringify(storageDetailRef.value.formData)) // 取到子组件的formData
      proxy.$modal.confirm('确定审批？').then(() => {
        console.log('点击审批', params)
        if (params.id) {
          api.yardApprove(params).then(res => {
            if (res.code === '0000') {
              proxy.$modal .msgSuccess('审批成功')
              storageTransferDrawer.value = false
              getList(queryParams.value)
            } else {
              storageDetailRef.value.formData.transferDate = transferDate;
            }
          })
        }
      })
    }
  }
  const deleteEmit = () => {
    getList(queryParams.value)
    transferQuery(transferRow.value)
  }


  // const edit = row => {
  //   const editRow = row || clickRow.value // 拿到所编辑行的数据
  //   emit('editEmit', editRow)
  // }
  const editOpen = row =>{
    title.value='编辑货权转移'
    cargoTransferDrawer.value = true;
    approveDisabled.value = false;
    if (row.status != '1' || routeType != '1') {
      transferFormDisabled.value = false;
    } else {
      transferFormDisabled.value = true;
    }
    nextTick(()=>{
      detailRef.value.resetForm();
      detailRef.value.customerList = []
      proxy.setFormData(detailRef.value.formData, row)
      detailRef.value.customerList.push({value:row.cargoOwnerIdSource,label:row.cargoOwnerNameSource})
      detailRef.value.customerList.push({value:row.cargoOwnerId,label:row.cargoOwnerName})
      detailRef.value.isDisabled = false;
      detailRef.value.isShow = false;

    });
  }
  // 获取点击行数据
  const cellClickEvent = ({ row }) => {
    clickRow.value = row
    buttonList[0].disabled = false
    buttonList[1].disabled = false
    buttonList[2].disabled = false
    buttonList[3].disabled = false
  }
  getList(queryParams.value);
</script>

<style scoped>

</style>
