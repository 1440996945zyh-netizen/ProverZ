<template>
  <div class='formData'>
    <BaseTable
      ref="baseTable"
      :tableColumns="tableColumns"
      :tableData="tableData"
    />
  </div>
</template>

<script setup name='parameterLogDetail'>
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import BaseTable from "@/components/BaseTable/index.vue";
import {ElTag} from "element-plus";

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const tableData = ref([])
const tableColumns = reactive([
  {prop: 'paramCdOld', label: '修改前参数编号', width:150,},
  {prop: 'paramNmOld', label: '修改前参数名称', width:150,},
  {prop: 'paramValOld', label: '修改前参数值', width:150,},
  {prop: 'remarkOld', label: '修改前备注', width:150,},
  {prop: 'paramCdNew', label: '修改后参数编号', width:150,},
  {prop: 'paramNmNew', label: '修改后参数名称', width:150,},
  {prop: 'paramValNew', label: '修改后参数值', width:150,},
  {prop: 'remarkNew', label: '修改后备注', width:150,},
  {
    prop: 'operationType',
    label: '操作类型',
    width:  100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.operationType == '0' ? 'info' : row.operationType == '1' ? 'error' : row.operationType == '2' ? 'primary' : '',
          },
          {
            default: () =>
              row.operationType == '0' ? '删除' : row.operationType == '1' ? '新增' : row.operationType == '2' ? '修改' : row.operationType,
          }
        ),
      ]
    },
  },
  {prop: 'createByName', label: '创建人', width:110,fixed: 'right',},
])

const clickRow = ref({})

defineExpose({
  tableData
})
</script>
<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
