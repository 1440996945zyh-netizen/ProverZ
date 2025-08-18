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
				:total="total"
			/>
		</div>
		<el-drawer v-model="drawerVisible" :title="title" size="60%">
			<detail ref="detailRef" />
			<machineTypeList ref="machineTypeRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save" v-hasPermi="['master:machineType:add', 'master:machineType:update']" >
						保存
					</el-button>
				</div>
			</template>
		</el-drawer>

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="weighDetailVisible" title="过磅数据" size="70%">
      <DrawerDetail ref="drawerDetailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="weighDetailVisible = false">取 消</el-button>
        </div>
      </template>
    </el-drawer>
	</div>
</template>

<script setup name="sundryPlan">
import BaseTable from '@/components/BaseTable/index.vue'
import machineTypeList from './sundryTypeList/index.vue'
import detail from './detail/index.vue'
import api from '@/api/produce/sundryPlan/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import DrawerDetail from '../sundryPlan/drawer/index.vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const machineTypeRef = ref() //机械类型表格ref
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const drawerDetailRef = ref(null)
const weighDetailVisible = ref(false) //弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '计划号', prop: 'planNo',width:130 },
	{ label: '服务类型', prop: 'workTypeName',width:110 },
	{ label: '客户名称', prop: 'customerName',width:110 },
	{ label: '船名', prop: 'shipName',width:90},
  { label: '泊位', prop: 'berth',width:90 },
  { label: '作业区', prop: 'portName',width:110 },
  { label: '货物名称', prop: 'cargoName',width:110 },
  { label: '下发人', prop: 'createByName',width:90 },
  { label: '下发时间', prop: 'createTime',width:160 },
  { prop: 'loadUnload',label: '装/卸', width:60,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.loadUnload == '1' ? 'info' : 'info',
          },
          {
            default: () => (row.loadUnload == '1' ? '装' : row.loadUnload == '2' ? '卸':''),
          }
        ),
      ]
    },
  },
  {
    label: '状态',
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
              handleMainStatusChange(row)
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
    label: '审核状态',
    prop: 'examineStatus',
    fixed: 'right',
    width: 'status',
    render: row => {
      let typeFlag = ''
      typeFlag = row.examineStatus == 1 ? 'success' : 'info'
      let textFlag = ''
      textFlag = row.examineStatus == 1 ? '已审核' : '待审核'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => textFlag,
          }
        ),
      ]
    },
  },
  { label: '开始时间', prop: 'startTime',width:160 },
  { label: '结束时间', prop: 'endTime',width:160 },
  { label: '备注', prop: 'remark',width:100 },
	{
		prop: '',
		label: '操作',
		width: 295,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'produce:sundryPlan:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						// hasPermi: 'master:machine:delete'
						permission: 'produce:sundryPlan:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              getSundryList(row)
            },
            type: 'primary',
            link: true,
            icon: 'Document',
            permission: 'produce:sundryPlan:weightQuery', // 权限
          },
          {
            default: () => '过磅数据',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              examine(row)
            },
            type: 'primary',
            link: true,
            icon: 'View',
            permission: 'produce:sundryPlan:examine', // 权限
          },
          {
            default: () => '审核',
          }
        )
			]
		},
	},
])
const examineFlag = ref()
const examineVisible = ref(false)//审核页面
const examineDetailRef = ref()
const selectData = reactive([
  {
    name: '服务类型',
    type: 'select',
    modelValue: 'workTypeCode',
    span: 8,
    dataConfig: { params: { type: 'PRODUCE_WORK_TYPE' } },
  },
  {
    name: '客户名称',
    type: 'input', //输入框
    modelValue: 'customerName', //对应字段
    span: 8
  },
  {
    name: '船名',
    type: 'input', //输入框
    modelValue: 'shipName', //对应字段
    span: 8
  },
  {
    name: '计划号',
    type: 'input', //输入框
    modelValue: 'planNo', //对应字段
    span: 3
  },
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'produce:sundryPlan:add', // 权限
	},
])
const drawerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
	// queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value = e
  queryParams.value.weightType = '1'
  api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	// console.log('查询拉查询拉', e)
}
// 新增事件
const add = () => {
	title.value = '新增'
	drawerVisible.value = true
  examineFlag.value ='0'
	nextTick(() => {
    detailRef.value.formData.id = ''
		detailRef.value.resetForm() // 清空事件
		machineTypeRef.value.tableData = []
    detailRef.value.editChange = false
    machineTypeRef.value.editChange = false
	})
}
//审核事件
const examine = (tmpRow) =>{
  if(tmpRow.examineStatus=='1'){
    proxy.$message.warning("已经审核无需重复审核");
    return;
  }
  examineFlag.value = '1'
  if(tmpRow==null || tmpRow.id ==null || tmpRow.id == ''){
    proxy.$message.warning("请先点击选中一条数据");
    return;
  }

  //审核打开编辑
  drawerVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    machineTypeRef.value.tableData = []
    api.getDetailById(tmpRow.id).then(res => {
      const resData = JSON.parse(JSON.stringify(res.data))
      detailRef.value.formData.id = resData.id
      detailRef.value.formData.workTypeCode = resData.workTypeCode
      detailRef.value.formData.workTypeName = resData.workTypeName
      detailRef.value.formData.customerName = resData.customerName
      detailRef.value.formData.shipName = resData.shipName
      detailRef.value.formData.berth = resData.berth
      detailRef.value.formData.portCode = resData.portCode
      detailRef.value.formData.portName = resData.portName
      detailRef.value.formData.remark = resData.remark
      detailRef.value.formData.startTime = resData.startTime
      detailRef.value.formData.endTime = resData.endTime
      detailRef.value.formData.cargoName = resData.cargoName
      detailRef.value.formData.loadUnload = resData.loadUnload
      detailRef.value.formData.examineStatus = resData.examineStatus
      detailRef.value.formData.workAreaName = resData.workAreaName
      detailRef.value.formData.planNo = resData.planNo
      detailRef.value.formData.status = resData.status
      machineTypeRef.value.getDetailList(resData.list)
      //machineTypeRef.value.tableData = resData.list
      detailRef.value.editChange=false
      machineTypeRef.value.editChange=false
      if(resData.isPound == 1){
        detailRef.value.editChange = true

      }
    })
    nextTick(()=>{
      detailRef.value.formData.examineFlag = '1'
    })

  })

/*  //
 api.examine(tmpRow.id).then(res=>{
   if(res.data){
     proxy.$message.success("审核成功");
     return;
   }else if(!res.data){
     proxy.$message.success("审核失败");
     return;
   }
 })*/
}

// 编辑事件
const edit = row => {
  examineFlag.value = '0'
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineTypeRef.value.tableData = []
		api.getDetailById(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.workTypeCode = resData.workTypeCode
			detailRef.value.formData.workTypeName = resData.workTypeName
      detailRef.value.formData.customerName = resData.customerName
      detailRef.value.formData.shipName = resData.shipName
      detailRef.value.formData.berth = resData.berth
      detailRef.value.formData.portCode = resData.portCode
      detailRef.value.formData.portName = resData.portName
      detailRef.value.formData.remark = resData.remark
      detailRef.value.formData.startTime = resData.startTime
      detailRef.value.formData.endTime = resData.endTime
      detailRef.value.formData.cargoName = resData.cargoName
      detailRef.value.formData.loadUnload = resData.loadUnload
      detailRef.value.formData.planNo = resData.planNo
      detailRef.value.formData.status = resData.status
      detailRef.value.formData.examineStatus = resData.examineStatus
      detailRef.value.formData.workAreaName = resData.workAreaName
      machineTypeRef.value.getDetailList(resData.list)
			// machineTypeRef.value.tableData = resData.list
      detailRef.value.editChange=false
      machineTypeRef.value.editChange=false
      if(resData.isPound == 1){
        detailRef.value.editChange = true
      }

		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	// console.log('点击删除',deleteRow.id);
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
}
// 保存事件
const save = async () => {
  if(detailRef.value.formData.workTypeCode=='6'||detailRef.value.formData.workTypeName == '货底清理'){
    if(detailRef.value.formData.fileIds===undefined||detailRef.value.formData.fileIds==null||detailRef.value.formData.fileIds.length<=0){
      proxy.$message.warning("请上传附件");
      return;
    }
    if(examineFlag.value == '1') {
      if (detailRef.value.formData.workTypeCode == '6' || detailRef.value.formData.workTypeName == '货底清理') {
        if (detailRef.value.formData.workAreaName === undefined || detailRef.value.formData.workAreaName == null || detailRef.value.formData.workAreaName == '') {
          proxy.$message.warning("作业位置必填");
          return;
        }
      }
    }
  }
	if ((await detailRef.value.validate()) && (await machineTypeRef.value.validate())) {
		const params = {
			...detailRef.value.formData,
			list: JSON.parse(JSON.stringify(machineTypeRef.value.tableData)),
      weightType:'1'
		}

		proxy.$modal.confirm('确定保存？').then(() => {

			if (params.id) {
        if(examineFlag.value == '1'){
          api.examine(params).then(res=>{
            drawerVisible.value = false
            getList(queryParams.value)
            if(res.data){
              proxy.$message.success("审核成功");
              return;
            }else if(!res.data){
              proxy.$message.success("审核失败");
              return;
            }
          })
        }else {
          api.update(params).then(res => {
            proxy.$modal.msgSuccess(res.msg)
            drawerVisible.value = false
            getList(queryParams.value)
          })
        }
			} else {
        api.insert(params).then(res => {
          proxy.$modal.msgSuccess(res.msg)
          drawerVisible.value = false
          getList(queryParams.value)
        })
      }
		})
	}
}
const handleMainStatusChange = (row) => {
  let text = row.status == '0' ? '停用' : '启用'
  proxy.$modal.confirm('确定"' + text + '"杂货计划?').then(() => {
    api.changeMainStatus({ id:row.id, status:row.status == '1' ? '0' : '1'}).then(res => {
      proxy.$modal.msgSuccess(text + '成功')
      getList(queryParams.value)
    })
  })
}

const getSundryList = row => {
  weighDetailVisible.value = true
  api.getSundryList({
    planNo: row.planNo,
  }).then(res => {
    nextTick(() => {
      drawerDetailRef.value.setTableData(res.data)
    })
  })

}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const init=()=>{
  //1:杂货过磅计划 2:商务杂货过磅计划
  queryParams.value.weightType = '1'
  getList(queryParams.value)
}
init()
</script>
