<template>
  <div>
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
    <el-drawer v-model="cargoCategoryVisible" :title=title size="80%">
      <detail ref="detailRef"/>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-drawer>
    <el-dialog type="primary" v-model="dialogVisible" title="船舶动态导入" width="35%" :before-close="handleClose">
      <el-upload
        ref="upload"
        action="#"
        :show-file-list="false"
        :on-change="handleExcel"
        :limit="1"
        :multiple="false"
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :auto-upload="false"
        :headers="headers"
      >
        <!--accept 只接受某种格式的文件-->
        <el-button type="primary" style="margin-bottom: 20px">导入船舶动态</el-button>
        <el-button type="primary" style="margin-left: 20px; margin-bottom: 20px" @click.stop="downTemplate">模板下载</el-button>
      </el-upload>
      <template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
			</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Demo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'

import api from '@/api/largescreen/sShipTrends/index.js'
import {ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance} from 'vue'
import {ElButton} from 'element-plus'
// import publicApi from "@/api/public";

const {proxy} = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoCategoryVisible = ref(false) // 新建货种抽屉
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref(0) // 数据总数
const title = ref()
const personnelType = ref()
const macType = ref()
const dialogVisible = ref(false)
const headers = reactive({ 'Content-Type': 'multipart/form-data;chatset=UTF-8' })
const fileTemp = ref({})
const upload = ref()
const rowId = ref('')
// 检索参数
const queryParams = ref({startPage: 1, pageSize: 10})
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = ref([
  {label: '港区', prop: 'portLabel',width: 100},
  {label: '船名', prop: 'shipName'},
  {label: '货名', prop: 'cargoName'},
  {label: '装/卸', prop: 'loadOrUnload'},
  {label: '载货吨', prop: 'ton'},
  {label: '船舶状态', prop: 'shipStatusLabel',width: 110},
  {label: '时间', prop: 'berthTime',width: 110},
  {label: '离港时间', prop: 'leaveTime',width: 110},
  {label: '泊位', prop: 'berthName'},
  {label: '进度', prop: 'schedule'},
  {label: '创建时间', prop: 'createTime',width: 160},
  {
    prop: '',
    label: '操作',
    width: 200,
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
            permission: 'basicdata:personnelMac:delete', // 权限
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
])
// header检索参数
const selectData = reactive([
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '港区',
    type: 'select', //下拉框
    modelValue: 'portCode', //对应字段
    span: 12,
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
    ],
  },
])

/**
 * 点击查询的事件
 * @param e
 */
const getList = e => {
  queryParams.value = e
  loading.value = true
  api.getList(e).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
    loading.value = false
  })
}
const buttonList = reactive([
  {
    label: '新建', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'basicdata:personnelMac:insert', // 权限
  },
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'finance:customerBalance:export', // 权限
  },
  {
    label: '导入', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => importList, // 回调函数
    permission: 'business:cargoTransfer:import', // 权限
  },
])
//导出
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '船舶动态')
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
// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({row}) => {
  clickRow.value = row
}

// 新增事件
const add = () => {
  title.value = '新增';
  cargoCategoryVisible.value = true;
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
  })
}
// 编辑事件
const edit = async row => {
  title.value = '编辑'
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  cargoCategoryVisible.value = true;
  await nextTick(() => {
    detailRef.value.resetForm() // 清空事件
  })
  await api.detailByStandardSystemIdAndProcessId({
    standardSystemId: editRow.standardSystemId,
    processId: editRow.processId
  }).then(res => {
    //赋值操作
      detailRef.value.formData.standardSystemId = res.data.standardSystemId,//生产标准id
      detailRef.value.formData.standardSystemName = res.data.standardSystemName,//生产标准
      detailRef.value.formData.processId = res.data.processId,//工艺流程id
      detailRef.value.formData.processName = res.data.processName,//工艺流程
      detailRef.value.formData.peopleTableData = res.data.peopleTableData,
      detailRef.value.formData.macTableData = res.data.macTableData;
      detailRef.value.getProcessListBySystemId(res.data.standardSystemId)
  })

}
// 删除事件
const handleDelete = row => {
  const deleteRow = row || clickRow.value // 拿到所删除行的数据
  proxy.$modal
    .confirm('是否确认删除选中项?').then(function () {
    return api.deleteById(deleteRow.id)
  }).then(() => {
    getList(queryParams.value)
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {
  })
}
const cancel = () => {
  cargoCategoryVisible.value = false
  detailRef.value.resetForm() // 清空事件
}

// 保存事件
const save = async () => {
  if (await detailRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(res => {
      for(let index in detailRef.value.tableData){
        let item = detailRef.value.tableData[index];
        item["status"] = 1;
      }
      api.insert(detailRef.value.tableData).then(res => {
        proxy.$message.success(res.msg)
        getList(queryParams.value)
        cargoCategoryVisible.value = false;
      })
    })
  }
}
const importList = () => {
  dialogVisible.value = true
}
//模板下载事件
const downTemplate = () => {
  proxy.$modal.confirm('确认下载模板吗？').then(() => {
    api.downTemplate().then(res => {
      downLoadBlob2(res, '船舶动态导入模板')
    })
  })
}
const downLoadBlob2 = (file, filename) => {
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
const handleExcel = files => {
  upload.value.clearFiles() //清空已上传文件列表
  fileTemp.value = files.raw
  if (fileTemp.value) {
    if (
      fileTemp.value.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileTemp.value.type == 'application/vnd.ms-excel'
    ) {
      let file = new FormData()
      file.append('file', fileTemp.value)
      console.log(file)
      proxy.$modal.confirm('确定保存？').then(() => {
        api.uploadFile(file).then(res => {
          if (res.data) {
            proxy.$message.success('导入成功')
            dialogVisible.value = false
          } else {
            proxy.$message.error('导入失败！')
          }
        })
      })
    } else {
      proxy.$message({
        type: 'warning',
        message: '文件格式不正确，请参考模板文件填写！',
      })
    }
  } else {
    proxy.$message({
      type: 'warning',
      message: '请上传附件！',
    })
  }
}
// 默认查询
getList(queryParams.value);

</script>
