<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'pageTableHeight'"
      :loading="loading"
      :total="total"
    />
  </div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/business/dayNightVehicles/index'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from '../../../../utils/math'
const trustId = ref(null)
const total = ref(0)
const trustCargoId = ref(null)
const loading = ref(false) // 是否加载中
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '计划号', prop: 'planNo' },
  { label: '车号', prop: 'vehicleNo' },
  { label: '司机姓名', prop: 'driverNameOne', },
  { label: '身份证号', prop: 'driverNoOne' },
  { label: '电话', prop: 'driverPhoneOne', },
  { label: '排放标准', prop: 'emissionStandard',},
  { label: '重量', prop: 'weight', },
  { label: '规格', prop: 'specs',  },
  { label: '件数', prop: 'quantity',  },
  {
    label: '车辆状态',
    prop: 'status',
    align: 'center',
    width: 'status',
    config: 'status',
    render: row => {
      return [
        h(
          ElSwitch,
          {
            onClick: () => {
                handleChlidStatusChange(row)
            },
            modelValue: row.status,
            'active-value': '0',
            'inactive-value': '1',
          },
          {
            // default: () => row.status,
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    width: 120,
    fixed: 'right',
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: 'business:dayNightVehicles:delete', // 权限
          },
          {
            default: () => '删除',
          }
        ),
      ]
    }
  }
])


// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  visibleMethod: ({}) => {
    // 返回显示的单选框
    return true
  },
  checkMethod: ({}) => {
    // 返回可选的单选框
    return true
  },
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}

const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
  checkboxList.value = data
}

const setTableData = data => {
  tableData.value = data
}
const getCheckboxList = () => {
  return checkboxList.value
}
const handleChlidStatusChange = (row) => {
  console.log(row)
    row.assignType = row.status == '1' ? '0' : '1'
    const collection = [row];
    let text = row.status == '0' ? '停用' : '启用'
    console.log(collection)
    proxy.$modal.confirm('确定"' + text + '"车辆计划?').then(() => {
        api.updateStatus(collection).then(res => {
          proxy.$modal.msgSuccess(text + '成功')
          api.getCarList({subPlanNo:row.subPlanNo}).then(res => {
            tableData.value = res.data
          })
        })
    })

}

const handleDelete = row => {
  const deleteRow = row  // 拿到所删除行的数据
  if(row.status == 0){
    proxy.$modal.msgWarning('请先停止派车计划')
    return
  }
  proxy.$modal
    .confirm('确定删除？')
    .then(function () {
      return api.delete(deleteRow.taskNo)
    })
    .then(res => {
      proxy.$modal.msgSuccess(res.msg)
      api.getCarList({subPlanNo:deleteRow.subPlanNo}).then(res => {
        tableData.value = res.data
      })
    })
    .catch(() => {})
}

defineExpose({
  setTableData,
  getCheckboxList,
  tableData,
  trustId,
  trustCargoId,
  tableColumns
})

</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
  width: 100%;
  padding: 0 10px 0 0;
  justify-content: space-between;
  align-items: center;
}
</style>
