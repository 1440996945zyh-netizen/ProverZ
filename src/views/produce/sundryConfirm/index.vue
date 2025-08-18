<template>
  <div class="app-container">
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :cellClickEvent="cellClickEvent"
      :loading="loading"
      :total="total"
    />
  </div>
</template>

<script setup name="sundryConfirm">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/sundryConfirm/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const mainProess = ref([]) //主过程
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const searchForm = reactive({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '计划号', prop: 'planNo',width:130 },
  { label: '服务类型', prop: 'workTypeName',width:100 },
  { label: '客户名称', prop: 'customerName',width:200 },
  { label: '船名', prop: 'shipName',width:70},
  { label: '货物名称', prop: 'cargoName',width:110 },
  { label: '司机', prop: 'driver',width:90 },
  { label: '车牌号', prop: 'truckPlate',width:90 },
  { label: '身份证号', prop: 'idNumber',width:160 },
  { label: '手机号', prop: 'tel',width:130 },
  { label: '确认人', prop: 'createByName',width:110 },
  { label: '确认时间', prop: 'createTime',width:140 },
  {
    label: '确认状态',
    prop: 'isTally',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isTally == '已确认' ? '' : 'info',
          },
          {
            default: () => (row.isTally == '已确认' ? '已确认' : '未确认'),
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    width: 200,
    fixed: 'right',
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              confirm(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'produce:sundryConfirm:confirm', // 权限
          },
          {
            default: () => '确认',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              revokeConfirm(row)
            },
            type: 'danger',
            link: true,
            icon: 'Refresh',
            permission: 'produce:sundryConfirm:revokeConfirm', // 权限
          },
          {
            default: () => '撤销确认',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '车牌号',
    type: 'input',
    modelValue: 'truckPlate',
    span: 24,
  },
])
const buttonList = reactive([

])
const drawerVisible = ref(false)

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
  // queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value = e
  loading.value = true
  api.getList(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
    loading.value = false
  })
}
const confirm = row => {
  proxy.$modal.confirm('是否确认？').then(() => {
    api.confirm({
      id: row.noteId,
    }).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      getList(queryParams.value)
    })
  })
}
const revokeConfirm = row => {
  proxy.$modal.confirm('是否撤销确认？').then(() => {
    api.revokeConfirm({
      id: row.noteId,
    }).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      getList(queryParams.value)
    })
  })
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}

getList(queryParams.value)
</script>
<style lang="scss" scoped>
.box {
  display: flex;
  justify-content: space-between;

  .left {
    width: 254px;
    height: calc(100vh - 85px);
    display: inline-block;
    white-space: nowrap;
    position: relative;
    transition: all 0.3s;

    &.close {
      width: 0px;

      .content {
        display: none;
      }
    }

    .content {
      overflow-x: hidden;
      height: 100%;

      .left-top {
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        font-size: 14px;
      }

      .shipData {
        width: 100%;
        height: 150px;
        margin-top: 10px;
      }

      .panel {
        width: 100%;
        height: 200px;
      }

      .step {
        height: calc(100vh - 557px);
        padding: 20px;
        box-sizing: border-box;
        margin-top: 14px;

        :deep(.el-timeline-item) {
          left: 50px;

          :deep(.el-timeline-item__wrapper) {
            height: 43px;
          }
        }

        :deep(.el-timeline-item__content) {
          position: relative;
          top: -1px;
          left: -160px;
          text-align: center;
        }

        :deep(.el-timeline-item__timestamp) {
          position: relative;
          top: -25px;
          left: 0px;
        }
      }
    }

    .fold-wrap {
      position: absolute;
      top: 0;
      right: -16px;
      width: 16px;
      height: 100%;
      display: inline-block;
    }

    .btn-fold {
      font-size: 12px;
      background-color: #f5f7fa;
      width: 16px;
      padding: 15px 0;
      position: absolute;
      top: 50%;
      right: 0px;
      transform: translateY(-50%);
      cursor: pointer;
      overflow: hidden;
      opacity: 0.8;
    }

    .btn-fold:hover {
      opacity: 1;
      // transform:scale(1.2);//设置缩放比例
      // transform: translateX(10%);
    }
  }

  .right {
    width: calc(100% - 270px);
    height: 100%;
  }

  .close + .right {
    width: calc(100% - 20px);
  }
}

:deep(.el-tabs__header) {
  margin: 0 0 0;
}
</style>
