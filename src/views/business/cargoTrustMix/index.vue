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
    <el-drawer v-model="detailRefDrawer" :title="title" size="70%">
      <detailIndex ref="detailRef" @editEmit="editOpen" @deleteEmit="deleteEmit"/>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="detailRefDrawer = false">取消</el-button>
          <el-button type="primary" @click="mixAdd" v-if="mixAddFlag">保存</el-button>
        </div>
      </template>
    </el-drawer>

  </div>
</template>

<script setup name="cargoTransfer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive,nextTick,onMounted } from 'vue'
import detailIndex from './detail/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/cargoTrustMix/index'

const emit = defineEmits(['editEmit', 'deleteEmit'])

const mixAddFlag = ref(true)
const approveDisabled = ref(false)
// const emit = defineEmits(['editEmit', 'deleteEmit'])
const { proxy } = getCurrentInstance()
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const detailRef = ref(null);

const clickRow = ref({}) //点击当前行
//控制作业指令编辑抽屉
const detailRefDrawer = ref(false);
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
/*  {
    name: '货主',
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
  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 3,
    dataType: 'VOYAGE',
  },

  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 3,
    dataConfig:{ url: '/api/internal/public/getDictListByType/TRANSFER_STATUS' },
  },*/
]);
//数据总条数
const total = ref(0);
//顶部 右侧按钮
const buttonList = reactive([
  {
    label: '新增', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => addEvent, // 回调函数
    permission:  "business:cargoTransfer:approve" // 权限
  },
]);
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '新票货号', prop: 'cargoInfoNo' ,align: 'center', width: 160 },
  { label: '库场', prop: 'storehouseName' ,align: 'center', width: 170 },
  { label: '区域', prop: 'regionName' ,align: 'center', width: 130 },
  { label: '垛位', prop: 'massName' ,align: 'left', width: 150 },
  { label: '混配重量', prop: 'mixWeight' ,align: 'left', width: 100 },
  { label: '混配时间', prop: 'mixTime',align: 'center' , width: 180 },
  { label: '创建人', prop: 'createByName',align: 'left' , width: 200 },
  { label: '创建时间', prop: 'createTime' ,align: 'left', width: 200 },
  {
    label: '状态',
    prop: 'statusLabel',
    align: 'center',
    fixed:'right',
    width: 'status',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '10' ? 'info' : row.status == '20' ? 'success'
              : row.status == '30' ? 'primary' : '',
          },
          {
            default: () => row.statusLabel,
          }
        ),
      ]
    },
  },
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
              lookEvent(row)
            },
            type: 'primary',
            link: true,
            icon: 'View',
            permission: "business:cargoTrustMix:look", // 权限
          },
          {
            default: () => '查看',
          }
        ),        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: "business:cargoTrustMix:delete", // 权限
          },
          {
            default: () => '删除',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              shenheEvent(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: "business:cargoTrustMix:shenhe", // 权限
          },
          {
            default: () => '审核',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              xiaoshenEvent(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: "business:cargoTrustMix:xiaoshen", // 权限
          },
          {
            default: () => '销审',
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
const lookEvent = async row =>{
  detailRefDrawer.value = true
  nextTick(async () => {
    detailRef.value.resetForm();
    detailRef.value.lookFlag = true;
    title.value = '查看'
    mixAddFlag.value = false


    await api.backShow(row.id).then(res => {
        detailRef.value.formData.cargoCode = res.data.cargoCode,
        detailRef.value.formData.shipvoyageItemId = res.data.shipvoyageItemId,
        detailRef.value.formData.cargoOwnerId = res.data.cargoOwnerId,
        detailRef.value.formData.mixTime = res.data.mixTime,
        detailRef.value.formData.massId = res.data.massId,
        detailRef.value.formData.regionId = res.data.regionId,
        detailRef.value.formData.storehouseId = res.data.storehouseId,
        detailRef.value.formData.mixWeightCount = res.data.mixWeight,
        detailRef.value.formData.isBilling = res.data.isBilling,
        detailRef.value.formData.details =  []
        detailRef.value.formData.details = res.data.details

    })
    let tmpParams = {
      cargoOwnerId: detailRef.value.formData.cargoOwnerId,
      cargoCode: detailRef.value.formData.cargoCode,
      mixRecordId : row.id
    }
    let tmpDetailMap = new Map();
    detailRef.value.formData.details.forEach(o => {
      tmpDetailMap.set(o.cargoInfoId + '/' + o.massId, o)
    })
    let tmpRowarray = []
    await api.listPortStorage(tmpParams).then(async res => {

      res.data.forEach(o => {
        if (tmpDetailMap.get(o.cargoInfoId + '/' + o.massId) != null) {
          let tmpRow = tmpDetailMap.get(o.cargoInfoId + '/' + o.massId);
          o.mixWeight = tmpRow.mixWeight
          o.freeStorageDays = tmpRow.freeStorageDays
          o.contractId = tmpRow.contractId
          tmpRowarray.push(o)
        }
      })
      let cargoInfoList = res.data.map(o => {
        return o.cargoInfoId
      })
      let resultIds = cargoInfoList.filter((item, index) => {
        return cargoInfoList.indexOf(item) === index
      }).join(',')

      let tmpContractList = []
      await api.getContractList(resultIds).then(res => {
        tmpContractList = res.data

      })


      await res.data.forEach(o => {

        tmpContractList.forEach(item => {
          if (o.contractId == item.contractId) {
            o.contractNo = item.contractNo
          }
        })
      })
      detailRef.value.tableLogData = res.data
      detailRef.value.contractList = tmpContractList
    })
    detailRef.value.portStorageLogs.setCheckboxRow(tmpRowarray,true)


  });
}
const addEvent = () => {
  detailRefDrawer.value = true
  nextTick(()=>{
    detailRef.value.resetForm();
    detailRef.value.lookFlag = false;
    title.value = '新增'

    mixAddFlag.value = true

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
const shenheEvent = row => {
  proxy.$modal.confirm('确认进行审核操作？').then(() => {
    api.shenheByid(row.id).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('操作成功')
        getList(queryParams.value);
      }else{
        proxy.$modal.msgSuccess(res.data.msg)

      }
    });
  });
}
const xiaoshenEvent = row => {
  proxy.$modal.confirm('确认销审？').then(() => {
    api.xiaoshen(row.id).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('销审成功')
        getList(queryParams.value);
      }else{
        proxy.$modal.msgSuccess(res.data.msg)

      }
    });
  });
}

const mixAdd = async () => {
  console.log(detailRef)
  if ( await detailRef.value.validate()) {
    let tmpDetails = JSON.parse(JSON.stringify(detailRef.value.formData.details))
    console.log(tmpDetails,"tmpdetailtmpdetailtmpdetailtmpdetailtmpdetailtmpdetailtmpdetailtmpdetailtmpdetailtmpdetail")
    let addData = JSON.parse(JSON.stringify(detailRef.value.formData))
    addData.details = []
    addData.details = tmpDetails
    proxy.$modal.confirm('确认保存吗？').then(() => {
      api.mixAdd(addData).then(res => {
        if(res.code='0000'){
          proxy.$message.success(res.msg)
          detailRefDrawer.value = false
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
