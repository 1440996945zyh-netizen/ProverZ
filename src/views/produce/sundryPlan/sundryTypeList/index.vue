<template>
  <el-form  ref='ruleForm' label-width='120px' :disabled="editChange"  >
    <el-collapse v-model="collapseOpen">
      <el-collapse-item name="1">
        <template v-slot:title>
          <div style='display: flex; justify-content: space-between; width: 95%'>
            <div>车辆安排</div>
            <div>
              <el-button type='primary' @click.stop='importCarClick'>车辆导入</el-button>
            </div>
          </div>
        </template>
        <EditTable
          ref="baseTable"
          :showSearchHeader="false"
          :showPagination="false"
          :showToolBarEditTable="true"
          :tableColumns="tableColumns"
          :tableData="tableData"
          :tableHeight="'null'"
          :edit-config="tableEditConfig"
          :editRules="editRules"
          :headerCellClickEvent="rateLadderHeaderCellClickEvent"
          :headerCellClassName="headerCellClassName"
          disabledKey='dis'
          @blur='inputChange'
        />
      </el-collapse-item>
    </el-collapse>
  </el-form>


  <el-dialog v-model="dialogVisible" title="车辆导入" width="30%" :before-close="handleClose">
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
      <el-button size="small" type="primary">导入</el-button>
      <el-button size="small" type="primary" @click.stop="downLoadModel">下载模板</el-button>

    </el-upload>
    <template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
				</span>
    </template>
  </el-dialog>
</template>

<script setup name="sundryTypeList">
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElSwitch } from 'element-plus'
import api from '@/api/produce/sundryPlan/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const editChange = ref(false) // 是否禁止编辑
const baseTable = ref() // table的ref
const collapseOpen = ref(['1'])
const dis =ref(false)
// 导入
const upload = ref()
const importCarClick  = () =>{
  dialogVisible.value = true
}
const downLoadModel = () => {
  api.downloadFile().then(res => {
    let data = res
    let blod = new Blob([data], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = window.URL.createObjectURL(blod)
    if (window.navigator.msSaveOrOpenBlod) {
      try {
        window.navigator.msSaveBlob(blod, '车辆导入模板.xlsx')
      } catch (e) {
        console.log(e)
      }
    } else {
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', '车辆导入模板.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  })
}
const dialogVisible = ref(false)
const headers = reactive({ 'Content-Type': 'multipart/form-data;chatset=UTF-8' })
const fileTemp = ref({})
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
      console.log(tableData.value,"tableData")
      if(tableData.value.length<1){
        tableData.value = [];
      }
      api.uploadFile(file).then(res => {
        if (res.data.length > 0) {
          res.data.forEach(o=>{
            tableData.value.push(o)
          })
        }
        dialogVisible.value = false
        proxy.$message.success('上传成功')
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
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '车牌号', prop: 'truckNo', editType: 'input', editRender: {} },
  { label: '司机姓名', prop: 'driver', editType: 'input', editRender: {} },
  { label: '身份证号', prop: 'idNumber', editType: 'input', editRender: {} },
  { label: '电话', prop: 'tel', editType: 'input', editRender: {} },
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
              if(editChange.value == true){
                console.log(editChange.value)
              }else{
                console.log(editChange.value)
                handleChlidStatusChange(row)
              }
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
		label: '添加',
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
            disabled: row.dis,
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
])
const editRules = ref({
  truckNo: proxy.getRules({
		required: true,
    length: '7-8',
	}),
  idNumber: proxy.getRules({
		required: true,
    idCard: {},
  }),
  driver: proxy.getRules({
		required: true,
    length: '2-10',
	}),
  tel: proxy.getRules({
		required: true,
    handset: {},
	}),
})
const tableEditConfig = reactive({ trigger: 'click', mode: 'cell' })


const inputChange = (e, row, table) =>{
  if(table=='车牌号'){
    row.truckNo = row.truckNo.trim();
    console.log(row)
  }if(table=='身份证号'){
    row.idNumber = row.idNumber.trim();
    console.log(row)
  }if(table=='司机姓名'){
    row.driver = row.driver.trim();
    console.log(row)
  }if(table=='电话'){
    row.tel = row.tel.trim();
    console.log(row)
  }
}

// 删除事件
const handleDelete = row => {
	console.log(tableData)
	let rowIndex = ''
	tableData.value.forEach((item, index) => {
		if (item._X_ROW_KEY == row._X_ROW_KEY) {
			rowIndex = index
		}
	})
	tableData.value.splice(rowIndex, 1)
}
const handleChlidStatusChange = (row) => {
  if(row.id != null) {
    let text = row.status == '0' ? '停用' : '启用'
    proxy.$modal.confirm('确定"' + text + '"车号为:'+row.truckNo+'的车辆？').then(() => {
      api.changeChildStatus({ id: row.id, status: row.status == '1' ? '0' : '1', truckNo: row.truckNo,idNumber:row.idNumber }).then(res => {
        proxy.$modal.msgSuccess(text + '成功')
        api.getDetailById(row.parentId).then(res => {
          res.data.list.forEach(x=>{
            if(x.isPounds == "2"){
              x.dis=true
            }
          })
          tableData.value = res.data.list
        })
      })
    })
  }else{
    proxy.$modal.msgError('请先保存再改变状态')
  }
}

const headerCellClassName = even => {
  if (even.column.field == '') {
    return 'add'
  }
}
//处理禁止
const  getDetailList = (list) =>{
    const resData = JSON.parse(JSON.stringify(list))
    resData.forEach(item=>{
      if(item.isPounds == 2){
        item.dis = true
      }
    })
  tableData.value = resData
}


const rateLadderHeaderCellClickEvent = even => {
  if (even.column.field == '' && editChange.value == false) {
    let data = tableData.value
    tableData.value.push({
      //车牌号
      truckNo: null,
      // 司机名称
      driver: null,
      // 身份证号
      idNumber: null,
      //电话号
      tel:null,
      //状态
      status:'0'

    })
  }
}

const validate = async () => {
	const flag = await baseTable.value.validAllEvent()
	return flag
}

defineExpose({
	validate,
	tableData,
  editChange,
  getDetailList
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px;
	justify-content: space-between;
	align-items: center;
}
</style>
