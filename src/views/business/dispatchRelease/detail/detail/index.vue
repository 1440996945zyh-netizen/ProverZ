<template>
  <div>
    <EditTable
      ref="editRef"
      key="1"
      :tableColumns="columns"
      :tableData="tableData"
      :editRules="rules"
      :rowConfig="rowConfig"
      :border="true"
      :loading="false"
      :showFooter="true"
      :tableHeight="'pageTableHeight'"
      :hasAdd="true"
      :autoResize="true"
    />
  </div>
  <el-drawer v-model="detailVisible" :title="title" size="80%">
    <detail ref="detailRef" />
    <template #footer>
      <div style="flex: auto">
        <el-button @click="detailVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup name="ship">
import {ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance} from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import {ElButton} from "element-plus";
import api from '@/api/standardization/basicdata/personnelMac/index.js'
const {proxy} = getCurrentInstance() // 相当于vue2里的this
const rowConfig = {isCurrent: true, isHover: true, height: 50, keyField: 'row_id'}
const tableData = reactive([])

/** tab标志 */
const activeName = ref('first')
/** 人员列配置 */
const columns = [
  {
    prop: 'deliveryNumbers',
    label: '票货号',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    prop: 'cargoOwnerId',
    label: '货主',
    modelLabel: 'cargoOwnerName',
    selectLabel: 'label',
    selectValue: 'value',
    editRender: {},
    editType: 'remoteSelect',
    type: 'CUSTOMER_CARGO_OWNER',
    disabled: false,
  },
  {
    prop: 'cargoCode',
    label: '货名',
    modelLabel: 'cargoName',
    selectLabel: 'label',
    selectValue: 'value',
    editRender: {},
    editType: 'remoteSelect',
    type: 'CARGO_INFO_SIGN',
    disabled: false,
  },
  {
    prop: 'quantity',
    label: '件数',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    prop: 'ton',
    label: '重量',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    prop: 'specs',
    label: '规格',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    label: '包装类型',
    prop: 'packingCode',
    modelLabel: 'packingName',
    editType: 'select',
    align: "center",
    editRender: {},
    selectData: [
      {
        label:"件",
        value: 1
      },
      {
        label:"散",
        value: 2
      },
    ]
  },
  {
    prop: 'delete',
    label: '添加',
    fixed: 'right',
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              deliveryNumbersDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
]
/** 流程多选框数据 */
const processList = ref([])
const ruleForm = ref()
const editRef = ref()

/** 表单校验规则 */
const rules = reactive({
  carNum: proxy.getRules({required: true}),
  shipName: proxy.getRules({required: true}),
  portCode: proxy.getRules({required: true}),
  cargoName: proxy.getRules({required: true}),
  planTon: proxy.getRules({required: true}),
  cargoOwner: proxy.getRules({required: true}),
  inPortDate: proxy.getRules({required: true}),
  inPortTime: proxy.getRules({required: true, type: 'number', message: '请填写1~3位整数', numberCheck: {int: 3, dec: 0}}),
})
/** 规则校验 */
const validate = async () => {
  let flag = false;
  if (await editRef.value.validAllEvent()) {
    flag = true;
  } else {
    flag = false;
  }
  return flag;
}
/** 删除按钮操作 */
const deliveryNumbersDelete = row => {
  tableData.forEach((item, index) => {
    // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
    if (item.row_id == row.row_id) {
      tableData.splice(index, 1)
      return
    }
  })
}
/** 字段重置 */
const resetForm = () => {
  tableData.length = 0;
}
/** 初始化函数 */
const init = () => {
  activeName.value = "first";
}
init();
defineExpose({
  validate,
  resetForm,
  tableData,
  editRef,
  init
})
</script>
<style lang="scss" scoped>

</style>
