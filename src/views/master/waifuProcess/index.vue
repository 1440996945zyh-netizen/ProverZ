<template>
  <div class="app-container">
    <div class="selectBox">
      <div>
        <el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="4">
              <el-select clearable="true" v-model="formData.deptId" placeholder="部门">
                <el-option
                  v-for="item in deptOutList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select clearable="true" v-model="formData.waifuPackageCode" placeholder="外付包装类型">
                <el-option
                  v-for="item in waifuPackageCodeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select clearable="true" v-model="formData.allotType" placeholder="分配类型">
                <el-option
                  v-for="item in allotTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select clearable="true" v-model="formData.processCode" placeholder="作业过程">
                <el-option
                  v-for="item in processNameListMain"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                clearable="true"
                v-model="formData.positionCode" placeholder="位置">
                <el-option
                  v-for="item in positionList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button v-hasPermi="['biaozhunhua:waifuProcess:query']" type="primary" icon="Search" @click="handleQuery" style="float: left">查询 </el-button>
            </el-col>
          </el-row>

        </el-form>
      </div>
      <div style="width: 30%;float: right">
        <el-button v-hasPermi="['biaozhunhua:waifuProcess:save']" type="primary" icon="CircleCheck" @click="downShipWorkReport" style="float: right">导出 </el-button>
        <el-button v-hasPermi="['biaozhunhua:waifuProcess:save']" type="primary" icon="CircleCheck" @click="doSave" style="float: right;margin-right: 10px">保存 </el-button>
        <el-button v-hasPermi="['biaozhunhua:waifuProcess:add']" type="primary" icon="CircleCheck" @click="add" style="float: right">添加 </el-button>
      </div>
    </div>
    <EditTable
      ref="editTableRef"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :border="true"
      :rowClassName="rowClassName"
      @input="editInputChange"
      @focus="focusChange"
      :rowConfig="rowConfig"
      :radioConfig="radioConfig"
      :exportConfig="exportConfig"
      :editRules="editRules"
      :showFooter="true"
      :tableHeight="'normalTableHeight'"
      :checkbox-config="checkboxConfig"
      @checkbox-change="checkboxChangeEvent"
      :selectAllChangeEvent="selectAllChangeEvent"
      :hasAdd="false"
    />
  </div>
</template>

<script setup name="waifuProcess">
import EditTable from '@/components/EditTable/index.vue'
import {ref, reactive, nextTick, h, onMounted, computed, getCurrentInstance, inject} from 'vue'
import {ElButton} from 'element-plus'
import api from '@/api/master/waifuProcess/index.js'
import parameterLogDetail from '@/views/system/parameter/parameterLogDetail/index'
import FileSaver from 'file-saver'
import * as XLSX from "xlsx";

const editConfig = reactive({trigger: 'click', mode: 'cell'})
const radioConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  checkMethod: ({row}) => {
    // 返回可选的单选框
    return row.age > 26
  },
  checkRowKey: 10003, // 默认选项，需要在row.config中设置keyField
}
const rowConfig = {isCurrent: true, isHover: true, height: 50, keyField: 'row_id'}
const rowClassName = i => {
  if ([2, 3, 5].includes(i.rowIndex)) {
    return 'row-green'
  }
  return null
}
const checkboxList = ref([])
const checkboxChangeEvent = data => {
  // console.log('选中数据：', data)
  checkboxList.value = data
  // console.log('选中数据：', checkboxList.value)
}
const selectAllChangeEvent = ({checked}) => {
  // if(checked){
  //   checkboxList.value = tableData.value
  // }else{

  // }
  checkboxList.value = checked ? tableData.value : []
}
const exportConfig = {}
const {proxy} = getCurrentInstance()
const parameterLogVis = ref(false)
const parameterLogDetailRef = ref(null)
const processNameListMain = ref([])
const processNameListNoMain = ref([])
const deptOutList = ref([])
const machinTypeList = ref([])
const waifuPackageCodeList = ref([])
const allotTypeList = ref([{
  label: '机械分配', value: '2'
}, {
  label: '人员分配', value: '3'
}])
const add = () => {
  tableData.value.push({
    id: 0,
  })
}
const positionList = ref([])
const tableColumns = ref([

  {
    prop: 'deptId', label: '公司名称', width: 150,
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'deptName',
    modelValue: 'deptId',
    editRender: {},
    editType: 'select',
    selectData: deptOutList
  },
  {
    prop: 'waifuPackageCode', label: '外付包装类型', width: 150,
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'waifuPackageName',
    modelValue: 'waifuPackageCode',
    editRender: {},
    editType: 'select',
    selectData: waifuPackageCodeList
  },
  {
    prop: 'allotType', label: '分配类型', width: 150,
    selectValue: 'value',
    selectLabel: 'label',
    modelValue: 'allotType',
    editRender: {},
    editType: 'select',
    selectData: [{
      label: '机械分配', value: '2'
    }, {
      label: '人员分配', value: '3'
    }]
  },
  {
    prop: 'processCode', label: '作业过程', width: 150,
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'processName',
    modelValue: 'processCode',
    editRender: {},
    editType: 'select',
    selectData: processNameListMain
  },
  {
    prop: 'positionCode', label: '位置', width: 150, selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'positionName',
    modelValue: 'positionCode',
    editRender: {},
    editType: 'select',
    selectData: positionList
  },
  {
    prop: 'processDetailCode', width: 150, label: '二级作业过程',
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'processDetailName',
    modelValue: 'processDetailCode',
    editRender: {},
    editType: 'select',
    selectData: processNameListNoMain
  },
  {
    prop: 'machineTypeCode', width: 150, label: '机械类型',
    selectValue: 'value',
    selectLabel: 'label',
    modelLabel: 'machineTypeName',
    modelValue: 'machineTypeCode',
    editRender: {},
    editType: 'select',
    selectData: machinTypeList
  },
  {prop: 'rate', label: '单价', width: 150, editType: 'input', editRender: {}, align: 'left'},
  {
    prop: '',
    label: '操作',
    width: 250,
    align: 'center',
    fixed: 'right',
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
            permission: "biaozhunhua:waifuProcess:del", // 权限
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
])
const tableData = ref([])
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
/** 查询参数列表 */
const getList = e => {
  api.getList(formData.value).then(res => {
    tableData.value = res.data
  })
}
/** 刷新操作 */
const handleQuery = e => {
  getList()
}

const editInputChange = (e, row, title) => {
  console.log(e, row, title)
}
const formData = ref({})
const focusChange = (e, r, t) => {
  console.log(e.processDetailCode)
  if (t == '二级作业过程') {
    let tmpParam = {
      processCode: e.processCode
    }
    api.getProcessListNoMain(tmpParam).then(res => {
      processNameListNoMain.value = res.data
    })
  }
  console.log(e, r, t)
}
const editRules = reactive({
  paramCd: proxy.getRules({
    required: true,
    length: '1-50',
  }),
  paramNm: proxy.getRules({
    required: true,
    length: '1-50',
  }),
  paramVal: proxy.getRules({
    required: true,
    length: '1-50',
  }),
  remark: proxy.getRules({
    length: '1-200',
  }),
})
const editTableRef = ref()
/** 保存按钮 */
const doSave = async () => {
  proxy.$modal.confirm('确定保存？').then(function () {
    api.doSave(tableData.value).then(response => {
      getList()
      proxy.$modal.msgSuccess(response.msg)
    })
  })
}

const checkLog = () => {
  parameterLogVis.value = true
  api.checkParLog({flag: 2}).then(res => {
    parameterLogDetailRef.value.tableData = res.data
  })
}
/** 删除按钮操作 */
/*const handleDelete = row => {
	tableData.value.forEach((item, index) => {
		// 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
		if (item.row_id == row.row_id) {
			tableData.value.splice(index, 1)
			return
		}
	})
}*/
const handleDelete = row => {
  if (row.id == null) {
    tableData.value.forEach((item, index) => {
      // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
      if (item.row_id == row.row_id) {
        tableData.value.splice(index, 1)
        return
      }
    })
  } else {
    if (row.id === null || row.id == '0') {
      console.log(row.row_id, 'row.index');
      tableData.value = tableData.value.filter(item => item.row_id != row.row_id)
    } else {
      proxy.$modal.confirm('确定删除？').then(() => {
        api.delete(row.id).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('删除成功')
            getList()
          }
        })
      })
    }

  }
}
const exportExcel = (excelName) => {
  try {
    // exportFlag.value = true;
    inject('reload')
    const wb = XLSX.utils.book_new();
    const $e1 = proxy.$refs['editTableRef'].$el;
    // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
    let $table1 = $e1.querySelector('.el-table__fixed');
    if (!$table1) {
      $table1 = $e1;
    }
    const sheet1 = XLSX.utils.table_to_sheet($table1, {raw: true});
    XLSX.utils.book_append_sheet(wb, sheet1, '外付规则');
    const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'});
    FileSaver.saveAs(
      new Blob([wbout], {type: 'application/octet-stream'}),
      `${excelName}.xlsx`,
    );
  } catch (e) {
    if (typeof console !== 'undefined') console.error(e);
  } finally {
    // exportFlag.value = false;
  }
}

const exportEvent = () => {
  const $table = editTableRef.value
  if ($table) {
    console.log($table)
    $table.exportData()
  }
}

const downShipWorkReport = row =>{
  api.downReport(formData.value).then(res => {
    downLoadBlob(res, '外付费率规则')
  })
}
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}

const init = () => {
  api.getMainProcessList().then(res => {
    processNameListMain.value = res.data
  })
  api.getPositionList().then(res => {
    positionList.value = res.data
  })
  api.getDeptOut().then(res => {
    deptOutList.value = res.data
  })
  api.machinTypeList().then(res => {
    machinTypeList.value = res.data
  })
  api.waifuPackageCodeList().then(res => {
    waifuPackageCodeList.value = res.data
  })
  getList()
}
init()
</script>
<style lang="less" scoped>
@import '../../../assets/styles/searchform.scss';

.selectBox {
  display: flex;
  justify-content: space-between;
  align-content: center;
  height: 40px;
  margin: 8px 0;
  padding-right: 5px;

  .left {
    width: 0%;
  }

  .right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
