<template>
  <div class="app-container">
    <BaseTable
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :total="total"/>

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="trustOrderDrawer" :title="title" size="35%">
      <editTrustOrder ref="trustOrderRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="trustOrderDrawer = false">取消</el-button>
          <el-button type="primary" @click="saveTrustOrder">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="affiliatedBank">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive,nextTick,onMounted } from 'vue'
import editTrustOrder from './detail/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/finance/affiliatedBank/index'
const { proxy } = getCurrentInstance()
//银行选择下拉框
const bankSelectList = ref([])

const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const trustOrderRef = ref(null);
const trustOrderDrawer = ref(false);
const title = ref("新增作业指令");
//顶部 搜索表单
const selectData = reactive([
  {
    name: '公司名称',
    type: 'select',
    modelValue: 'companyId',
    span: 8,
    dataConfig: { params: {type: 'DEPT_WORK_COMPANY'} },
  },
  {
    name: '付款方式',
    type: 'select',
    modelValue: 'paymentMethodCode',
    span: 8,
    dataConfig: { params: { type: 'DICT', dictType: 'BANK_PAY_METHOD' } },
  },
  {
    name: '银行',
    type: 'select',//远程下拉框
    modelValue: 'bankId',//对应字段
    span: 8,
    selectData:  bankSelectList,
  }
]);
//数据总条数
const total = ref(0);
//顶部 右侧按钮
const buttonList = reactive([
  {
    label: '新增', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => addTrustOrder, // 回调函数
    permission: 'finance:affiliatedBank:add', // 权限
  },
]);
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '公司名称', prop: 'companyName',align: "center",width: 200 },
  { label: '付款类型', prop: 'paymentTypeName' },
  { label: '付款方式', prop: 'paymentMethodName' },
  { label: '银行名称', prop: 'bankName' },
  { label: '银行代码', prop: 'bankCode' },
  { label: '是否默认', prop: 'isDefaultCN',align: "center"  },
  {
    prop: '',
    label: '操作',
    width: 200,
    align: 'center',
    fixed:'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              handleUpdate(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'finance:affiliatedBank:update', // 权限
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
            permission: 'finance:affiliatedBank:delete', // 权限
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
    tableData.value = res.data.pages
    tableData.value.forEach(item=>{
      if(item.isDefault == 1){
        item.isDefaultCN = "是"
      }
      if (item.isDefault == 2){
        item.isDefaultCN = "否"
      }
    });
    total.value = res.data.totalNum
  });
};
//
const addTrustOrder = ()=>{
  trustOrderDrawer.value = true;
  title.value='新增'
  nextTick(()=>{
    trustOrderRef.value.resetForm();
  });
}
//提交作业指令信息
const saveTrustOrder = async ()=>{
  if (await trustOrderRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(() => {
      api.addBankAffiliate(trustOrderRef.value.formData).then(res => {
        proxy.$modal.msgSuccess(res.msg);
        trustOrderDrawer.value = false;

        getList(queryParams.value);

      });
    });
  }
}
//
const handleDelete = row => {
  proxy.$modal.confirm('确定删除？').then(() => {
    api.deleteById(row.id).then(res => {
      console.log("删除部分")
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('删除成功')
        getList(queryParams.value);
      }
    });
  });
}
//发布作业指令
const handlePublish = row =>{
  api.release(row.id).then(res => {
    if (res.code === '0000') {
      proxy.$modal.msgSuccess('发布成功')
      getList(queryParams.value);
    }
  });
}

const handleUpdate = row =>{
  title.value='编辑'
  trustOrderDrawer.value = true;
  nextTick(()=>{
    trustOrderRef.value.resetForm();
/*    trustOrderRef.value.formData = row;*/
    proxy.setFormData(trustOrderRef.value.formData, row)
    /*
    api.getDetail(row.id).then(res => {s
      if (res.code === '0000') {
        trustOrderRef.value.trustOrderForm = res.data;
      }
    });*/
  });
}

const getBankSelectList = ()=>{
  api.getBankSelectList().then(res=>{
    bankSelectList.value = res.data;
  })
}

const init=()=>{
  getList(queryParams.value);

  getBankSelectList();
}

init()
</script>

<style scoped>

</style>
