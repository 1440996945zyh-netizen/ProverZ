<!--  -->
<template>
  <div class="app-container">
    <BaseTable
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableHeight="pageTableHeight"
      :tableColumns="tableColumns"
      :cellClickEvent="cellClickEvent"
      :tableData="tableData"
      :total="total"
    />

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="drawerRefDrawer" :title="title" size="70%">
      <drawerIndex ref="drawerRef" @editEmit="editOpen" @deleteEmit="deleteEmit"/>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawerRefDrawer = false">取消</el-button>
          <el-button type="primary" @click="entrustSave" v-if="isEntrust == '1'" >保存</el-button>
          <el-button type="primary" @click="addJGTrust"  v-if="isEntrust == '2' ">保存</el-button>
        </div>
      </template>
    </el-drawer>

  </div>
</template>

<script setup name="customerMandate">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive,nextTick,onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import drawerIndex from './drawer/index.vue'
import api from '@/api/business/customerMandate/index'

const emit = defineEmits(['editEmit', 'deleteEmit'])

const isEntrust = ref(0)

const approveDisabled = ref(false)
// const emit = defineEmits(['editEmit', 'deleteEmit'])
const { proxy } = getCurrentInstance()
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const drawerRef = ref(null);

const clickRow = ref({}) //点击当前行
//控制作业指令编辑抽屉
const drawerRefDrawer = ref(false);
const storageTransferDrawer = ref(false);
const title = ref("新增");
//顶部 搜索表单
const selectData = reactive([
  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 24, // 占位，共24
  },

]);
//数据总条数
const total = ref('0');
//顶部 右侧按钮
const buttonList = reactive([
  {
    label: '新增', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => addEvent, // 回调函数
    permission:  "business:customerEntrust:approve" // 权限
  },
]);
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '委托单号', prop: 'entrustNo' ,align: 'center', width: 160 },
  { label: '通知单号', prop: 'trustNo' ,align: 'center', width: 170 },
  { label: '客户信息', prop: 'customerName' ,align: 'center', width: 130 },
  { label: '创建人', prop: 'createByName',align: 'left' , width: 200 },
  { label: '创建时间', prop: 'createTime' ,align: 'left', width: 200 },
  {
    prop: '',
    label: '操作',
    width: 318,
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              editEvent(row)
            },
            type: 'primary',
            link: true,
            icon: 'View',
            permission: "business:customerEntrust:edit", // 权限
          },
          {
            default: () => '编辑',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              jgEvent(row)
            },
            type: 'primary',
            link: true,
            icon: 'Plus',
            permission: "business:customerEntrust:jigang", // 权限
          },
          {
            default: () => '集港',
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
            permission: "business:customerEntrust:delete", // 权限
          },
          {
            default: () => '删除',
          }
        ),


      ]
    },
  },
])
//查询
const getList = e =>{
  queryParams.value = e


  api.getList(e).then(res => {
    tableData.value = res.data.pages;
    total.value = res.data.totalNum
  });
};
const editEvent = async row =>{
  drawerRefDrawer.value = true
  isEntrust.value = '1'
  drawerRefDrawer.value = true
  const {data:trustTypeList} = await api.getListTrustType()

  const {data:customerEntrust} = await api.getcustomerEntrustById(row.id)
  nextTick(async () => {
    drawerRef.value.resetForm();
    drawerRef.value.lookFlag = false;
    drawerRef.value.isShowTrustType = '0'
    drawerRef.value.isAddJg = '0';
    let tmpTrustTypeList = trustTypeList.filter(item=> item.trustType == '集港')
    tmpTrustTypeList.forEach(item=>{
      drawerRef.value.changenotrustType(item)
    })
    drawerRef.value.hiddenTableColumns()
    drawerRef.value.trustOrderForm = customerEntrust
    title.value = '编辑客户委托单'


  });
}
//新增客户委托单
const addEvent = async () => {
  drawerRefDrawer.value = true
  isEntrust.value = '1'
  const {data:trustTypeList} = await api.getListTrustType()

  nextTick(()=>{
    drawerRef.value.resetForm();
    drawerRef.value.lookFlag = false;
    drawerRef.value.isShowTrustType = '0'
    drawerRef.value.isAddJg = '0';
    let tmpTrustTypeList = trustTypeList.filter(item=> item.trustType == '集港')
    tmpTrustTypeList.forEach(item=>{
      drawerRef.value.changenotrustType(item)
    })
    drawerRef.value.hiddenTableColumns()
    title.value = '新增客户委托单'

  });
}
const jgEvent = async (row) =>{
  isEntrust.value = '2'
  drawerRefDrawer.value = true
  const {data:trustTypeList} = await api.getListTrustType()

  const {data:customerEntrust} = await api.getCustomerEntrustForAddTrust(row.id)
  nextTick(()=>{
    drawerRef.value.resetForm();
    drawerRef.value.lookFlag = false;
    drawerRef.value.isAddJg = '1';
    drawerRef.value.isShowTrustType = '1';
    drawerRef.value.JSGWeiQiao = true;

    let tmpTrustTypeList = trustTypeList.filter(item=> item.trustType == '集港')
    tmpTrustTypeList.forEach(item=>{
      drawerRef.value.changenotrustType(item)
    })
    console.log("customerEntrust",customerEntrust);
    drawerRef.value.trustOrderForm = customerEntrust

    title.value = '下发集港通知单'
  })
}
const addJGTrust = async () => {

  // console.log('状态是什么', trustOrderRef.value.trustOrderForm.status)
  // console.log('111', trustOrderRef.value.Data)
  if (drawerRef.value.Data > 0 && drawerRef.value.trustOrderForm.cargoList.length <= 0) {
    proxy.$modal.msgSuccess('存在货物信息，请填写货物信息')
    return
  }
  if (await drawerRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(() => {
      const params = JSON.parse(JSON.stringify(drawerRef.value.trustOrderForm))
      if (
        drawerRef.value.trustOrderForm.trustId === undefined ||
        drawerRef.value.trustOrderForm.trustId === null ||
        drawerRef.value.trustOrderForm.trustId === ''
      ) {
        // delete params.processName
        // delete params.processCode
        // console.log('作业通知单数据保存', params)
        api.addTrustOrder(params).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('新增成功')
            drawerRefDrawer.value = false
            getList(queryParams.value)
          }
        })
      } else {
        console.log(params.status,"通知单状态");
        if (params.status == '30' || params.status == '40') {
          console.log('作业通知单已发布、发布中数据修改', params)
          let arr = []
          if ((params.status == '30' && params.type == '装船') || (params.status == '40' && params.type == '装船'))
            arr = params.cargoList.filter(item => {
              if (item.id == null) {
                return item
              }
            })
          // console.log('新增数据', arr)
          let data = {
            id: params.id,
            planQuantity: params.planQuantity, //计划件数
            planTon: params.planTon, //计划重量
            startTime: params.startTime, //计划开始时间
            endTime: params.endTime, //计划结束时间
            isWeiqiaoPoundRemark: params.isWeiqiaoPoundRemark, //是否魏桥磅单备注
            poundRemark: params.poundRemark, //磅单备注
            fileIds: params.fileIds, //附件
            preChangeShipName:params.preChangeShipName,
            preChangeShipNo:params.preChangeShipNo,
            updates: params.cargoList.filter(item => {
              if (item.id) {
                return {
                  id: item.id,
                  quantity: item.quantity,
                  ton: item.ton,
                }
              }
            }),
            inserts: JSON.parse(JSON.stringify(arr)),
          }
          // console.log('已发布保存数据', data)
          api.updateAfterRelease(data).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('修改成功')
              drawerRefDrawer.value = false
              getList(queryParams.value)
            }
          })
        } else {
          // console.log('作业通知单数据修改', params)
          api.updateTrust(params).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('修改成功')
              drawerRefDrawer.value = false
              getList(queryParams.value)
            }
          })
        }
      }
    })
  }
}





//删除客户委托单
const handleDelete = row => {
  proxy.$modal.confirm('确定删除？').then(() => {
    api.delCustomerEntrust(row.id).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('删除成功')
        getList(queryParams.value);
      }
    });
  });
}

const entrustSave = async () => {
  console.log(drawerRef)
  if ( await drawerRef.value.validate()) {
    console.log("drawerRef.value.trustOrderForm",drawerRef.value.trustOrderForm);
    console.log("drawerRef.value.trustOrderForm",drawerRef.value.trustOrderForm);

    let addData = JSON.parse(JSON.stringify(drawerRef.value.trustOrderForm))

    proxy.$modal.confirm('确认保存吗？').then(() => {
      api.entrustSave(addData).then(res => {
        if(res.code='0000'){
          proxy.$message.success(res.msg)
          drawerRefDrawer.value = false
          getList(queryParams.value)
        }else {
          proxy.$message.error(res.data.msg)
        }
      })
    })
  }
}

const deleteEmit = () => {
  getList(queryParams.value)
  transferQuery(transferRow.value)
}


// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row

}
getList(queryParams.value);
</script>

<style scoped>

</style>
