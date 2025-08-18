<template>
  <div>
    <el-tabs type="border-card" class="container" v-model="activeName" @tab-click="handleClick" style="padding: 0px !important">
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
    </el-tabs>
  </div>
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
    label: '港区代码',
    prop: 'portCode',
    modelLabel: 'stdName',
    editType: 'select',
    align: "center",
    editRender: {},
    selectData: [
      {
        label:"潍坊港",
        value:10
      },
      {
        label:"寿光港",
        value:20
      },
      {
        label:"东营港",
        value:30
      },
      {
        label:"滨州港",
        value:40
      }
    ]
  },
  {
    prop: 'dateTime',
    label: '时间',
    editType: 'date',
    align: "center",
    editRender: {},
  },
  // {
  //   label: '时间类型',
  //   prop: 'dateType',
  //   modelLabel: 'dateTypeName',
  //   editType: 'select',
  //   align: "center",
  //   editRender: {},
  //   selectData: [
  //     {
  //       label:"年",
  //       value:"1"
  //     },
  //     {
  //       label:"月",
  //       value:"2"
  //     },
  //     {
  //       label:"日",
  //       value:"3"
  //     }
  //   ]
  // },
  {
    label: '货物类型',
    prop: 'cargoType',
    modelLabel: 'cargoTypeName',
    editType: 'select',
    align: "center",
    editRender: {},
    selectData: [

      {
        label:"散杂货",
        value:"1"
      },
      {
        label:"集装箱",
        value:"2"
      },
      {
        label:"液化品",
        value:"3"
      },
      {
        label:"木片",
        value:"4"
      },
    ]
  },
  {
    prop: 'ton',
    label: '吨数',
    editType: 'input',
    align: "center",
    editRender: {},
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
              peopleDelete(row)
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
  portCode: proxy.getRules({required: true}),
  cargoType: proxy.getRules({required: true}),
  dateTime: proxy.getRules({required: true}),
  ton: proxy.getRules({required: true, type: 'number', message: '请填写1~3位整数', numberCheck: {int: 20, dec: 0}}),
})
/** 人员表格校验规则 */
// const peopleRules = reactive({
//   stdCode: proxy.getRules({required: true, message: '必须填写'}),
//   stdNumber: proxy.getRules({required: true, type: 'number', message: '请填写1~6位整数', numberCheck: {int: 6, dec: 0}}),
//   stdPrice: proxy.getRules({required: false, type: 'number', message: '请填写1~6位整数，0~2位小数', numberCheck: {int: 6, dec: 2}})
// })
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
const peopleDelete = row => {
  // if (row.id != null && row.id != "") {
  //   row.status = 0;
  //   peopleDeleteTable.value.push(row)
  // }
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
