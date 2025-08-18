<template>
	<div>
		<el-row>
			<el-col :span="22">
				<SearchHeader
					ref="SearchHeaderRef"
					:showReset="false"
					:selectData="selectData"
					@searchClick="selectMachineList"
					style="margin-left: 5px; width: 90%"
				/>
			</el-col>
		</el-row>
		<el-row>
			<el-col :span="10">
				<BaseTable
					ref="baseTableRef"
					:tableColumns="tableColumns"
					:tableData="machineTableData"
					:checkbox-config="checkboxConfig"
					:tableHeight="'drawerHeaderPageTableHeight'"
				/>
			</el-col>
			<el-col :span="3" style="text-align: center; display: flex; align-items: center; justify-content: center">
				<el-button type="primary" :icon="ArrowRight" style="margin-right: 5px" @click="joinRight">
					<el-icon><ArrowRight /></el-icon>
				</el-button>

				<el-button type="primary" :icon="ArrowLeft" @click="joinLeft">
					<el-icon><ArrowLeft /></el-icon>
				</el-button>

				<!-- <el-button type="primary" @click="joinRight">添加到右边</el-button>
				<el-button style="margin-top: 20px; margin-left: 0px" type="primary" @click="joinLeft">添加到左边</el-button> -->
			</el-col>
			<el-col :span="10">
				<EditTable
					ref="editTableRef"
					:selectData="selectData"
					:showSearchHeader="true"
					:tableColumns="dispatchedTableColumns"
					:tableData="dispatchedTableData"
					@change="dispatchedTableDataChange"
					:checkbox-config="checkboxConfig"
					:editRules="editRules"
					:tableHeight="'drawerHeaderPageTableHeight'"
				/>
			</el-col>
		</el-row>
	</div>
</template>

<script setup name="machineDetail">
import { ref, reactive, getCurrentInstance } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/produce/dispatchSecondary/index.js'
import publicApi from '@/api/public/index'
import config from '@/config/index.js'
import SearchHeader from '@/components/SearchHeader/index.vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const editTableRef = ref()
const baseTableRef = ref()
const SearchHeaderRef = ref()
//表格数据
const machineTableData = ref([])
const dispatchedTableData = ref([])
const processCode = ref()
watch(() => processCode.value, (newVal, oldVal) => {
    let newProcessFlag = false;
    publicApi.getSystemParams({key:"NEW_PROCESS"}).then(res=>{
      let data = res.data;
      newProcessFlag = data.paramVal=="Y"?true:false;
      publicApi.getLocalSelect({ type: 'SUB_WORK_PROCESS', parent: processCode.value }).then(res => {
        let data = []
        if(newProcessFlag){
          for(let index in res.data){
            let item = res.data[index]
            if(item.newProcess == '1'){
              data.push(item)
            }
          }
        }else{
          for(let index in res.data){
            let item = res.data[index]
            data.push(item)
          }
        }
        proxy.setEditTableOptions(dispatchedTableColumns, { subProcessCode: data })
      })
    })
	}
)

//机械列
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50 },
	{
		prop: 'equipmentTypeName',
		label: '机械类型',
	},
	{
		prop: 'equipmentNo',
		label: '机械编号',
	},
	{
		prop: 'deptName',
		label: '部门名称',
	},
])

//已配工机械
const dispatchedTableColumns = reactive([
	{ label: '', type: 'checkbox', width: 60 },
	{
		prop: 'equipmentTypeName',
		label: '机械类型',
    sortable: "true"
	},
	{
		prop: 'equipmentNo',
		label: '机械编号',
	},
	{
		prop: 'workPositionCode',
		label: '机械位置',
		editType: 'select',
		editRender: {},
    	modelLabel: 'workPositionName',
    	modelvalue: 'workPositionCode',
		align: 'center',
		selectData: [],
	},
	{
		prop: 'subProcessCode',
		label: '子过程',
		editType: 'select',
		modelLabel: 'subProcessName',
    	modelvalue: 'subProcessCode',
		editRender: {},
		align: 'center',
		selectData: [],
	},
	{
		prop: 'operatorsId',
		label: '司机',
		editType: 'select',
		modelLabel: 'operatorsName',
		editRender: {},
		align: 'center',
		selectData: [],
	},
])
//表单校验
const editRules = reactive({
	workPositionCode: proxy.getRules({
		required: true,
	}),
	subProcessCode: proxy.getRules({
		required: true,
	}),
})

//机械搜索框
const selectData = reactive([
	{
		prop: 'equipmentTypeCode',
		name: '机械类型', // 搜索框code
		type: 'select', // 搜索框类型
		modelValue: 'equipmentTypeCode', // 绑定字段
		span: 7, // 占位，共24
		dataConfig: { params: { type: 'MAC_TYPE' } },
	},
	{
		prop: 'deptId',
		name: '所属部门', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'deptId', // 绑定字段
		span: 7, // 占位，共24
		dataConfig: { params: { type: 'DEPT_MACHINE' } },
	},
])

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
}

//表单校验
const validate = async () => {
	let flag = await editTableRef.value.validAllEvent()
	if (flag) {
		return flag
	} else {
		proxy.$modal.warning('请完善表单信息！')
	}
	return flag
}
const checkedList = ref([])
//添加到右边
const joinRight = () => {
	checkedList.value = baseTableRef.value.getSelectEvent()
	if (checkedList.value == null || checkedList.value.length == 0) {
		proxy.$modal.msgWarning('请左边选择一条数据!')
		return
	}
	// console.log('已选中数据', checkedList.value)
	checkedList.value.forEach(item => {
		dispatchedTableData.value.push({
			equipmentTypeName: item.equipmentTypeName, //设备类型名称
			equipmentTypeId: item.equipmentTypeId, //设备类型id
			equipmentNo: item.equipmentNo, //设备编号
			equipmentId: item.equipmentId, //设备ID
			deptId: item.deptId, //部门id
			deptName: item.deptName, //部门名称
		})
	})
	// 从左侧列表中删除已选中的数据
	machineTableData.value = machineTableData.value.filter(item => !checkedList.value.some(i => i.equipmentId === item.equipmentId))
	checkedList.value = []
}
//添加到左边
const joinLeft = () => {
	// const
	checkedList.value = editTableRef.value.getSelectEvent()
	if (checkedList.value == null || checkedList.value.length == 0) {
		proxy.$modal.msgWarning('请从右边选择一条数据!')
		return
	}
	checkedList.value.forEach((tempItem, tempIndex) => {
		// if (checkedList.value.length == dispatchedTableData.value.length) {
		// 	dispatchedTableData.value = []
		// 	return
		// }
		dispatchedTableData.value.forEach((dispatchedItem, dispatchedIndex) => {
			if (dispatchedItem.index == tempItem.index) {
				dispatchedTableData.value.splice(dispatchedIndex, 1)
			}
		})
		// 将右侧列表中选中的数据添加至左侧列表数据中
		if (machineTableData.value.map(item => item.equipmentId).indexOf(tempItem.equipmentId) == -1) {
			machineTableData.value.push({
				equipmentTypeName: tempItem.equipmentTypeName, //设备类型名称
				equipmentTypeId: tempItem.equipmentTypeId, //设备类型id
				equipmentNo: tempItem.equipmentNo, //设备编号
				equipmentId: tempItem.equipmentId, //设备ID
				deptId: tempItem.deptId, //部门id
				deptName: tempItem.deptName, //部门名称
			})
		}
	})
	checkedList.value = []
}

// 配工数据修改
const dispatchedTableDataChange = (e, row, title) => {
	if('机械位置' == title){
		for (let index = 0; index < dispatchedTableData.value.length; index++) {
			if(index > row.index && !dispatchedTableData.value[index].workPositionCode
				&& row.equipmentTypeId == dispatchedTableData.value[index].equipmentTypeId){
				dispatchedTableData.value[index].workPositionCode = e.value
				dispatchedTableData.value[index].workPositionName = e.label
			}
		}
	}

	if ('子过程' == title){
		for (let index = 0; index < dispatchedTableData.value.length; index++) {
			if(index > row.index && !dispatchedTableData.value[index].subProcessCode
				&& row.equipmentTypeId == dispatchedTableData.value[index].equipmentTypeId){
				dispatchedTableData.value[index].subProcessCode = e.value
				dispatchedTableData.value[index].subProcessName = e.label
			}
		}
	}
}

//初始化机械列表
const init = (dispatchedQueryParams,batchFlag) => {
	// 全部机械查询
	selectMachineList()
	resetSelectData()
	//已派机械查询
  if(!batchFlag){
    api.getDispatchList(dispatchedQueryParams).then(res => {
      console.log('派好的机械数据', res.data)
      dispatchedTableData.value = res.data
    })
  }else {
    dispatchedTableData.value = [];
  }
}

//按条件全部机械查询
const selectMachineList = e => {
	api.getMachineList(e).then(res => {
    let tmpList = []
    tmpList = res.data.map(item => {
      item.disabled = true
			return item
		})
    machineTableData.value = tmpList.filter(item => item.status=='1')
  })
}

//重置表格
const resetSelectData = () => {
	SearchHeaderRef.value.resetSearch()
}

//下拉框初始化
const selectInit = () => {
	// 给编辑table下拉框设置数据源
	publicApi.getDictList({ types: 'MACHINE_LOCATION' }).then(res => {
		// console.log('测试机械位置下拉框数据', res.data)
		proxy.setEditTableOptions(dispatchedTableColumns, { workPositionCode: res.data.MACHINE_LOCATION })
	})
	publicApi.getLocalSelect({ type: 'USER', post: config.post.jxsj }).then(res => {
		// console.log('测试司机下拉框数据', res.data)
		proxy.setEditTableOptions(dispatchedTableColumns, { operatorsId: res.data })
	})
}

//初始化
selectInit()

defineExpose({
	validate,
	resetSelectData,
	init,
	machineTableData,
	dispatchedTableData,
	processCode,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
