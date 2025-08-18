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
    modelLabel: 'portCodeLabel',
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
    prop: 'cargoName',
    label: '货名',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    prop: 'ton',
    label: '计划量',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    label: '货物类型',
    prop: 'cargoType',
    modelLabel: 'cargoTypeName',
    editType: 'select',
    align: "center",
    editRender: {},
    selectData: [
      {
        label:"件",
        value:"1"
      },
      {
        label:"散",
        value:"2"
      }
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
  cargoName: proxy.getRules({required: true}),
  ton: proxy.getRules({required: true, type: 'number', message: '请填写1~3位整数', numberCheck: {int: 20, dec: 0}}),
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
