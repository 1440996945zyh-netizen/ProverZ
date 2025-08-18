<!-- 商务指令 -->
<template>
	<div class="app-container">
		<BaseTable
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
		/>

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="trustOrderDrawer" :title="title" size="70%">
			<editTrustOrder ref="trustOrderRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="trustOrderDrawer = false">取消</el-button>
					<el-button type="primary" @click="saveTrustOrder">保存</el-button>
				</div>
			</template>
		</el-drawer>

		<el-drawer v-model="massDrawer" :title="'场地安排'" size="50%">
			<massDetail ref="massDetailRef" />
			<template #footer>
				<div>
					<el-button @click="massDrawer = false">取消</el-button>
					<el-button type="primary" @click="saveMass">保存</el-button>
				</div>
			</template>
		</el-drawer>

    <el-drawer v-model="cargoPlanDrawer" :title="'计划开关'" size="50%">
			<cargoPlanDetail ref="cargoPlanDetailRef" />
			<template #footer>
				<div>
					<el-button @click="cargoPlanDrawer = false">取消</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="warehousePlan">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/trustOrder/index'
import massDetail from '@/views/produce/warehousePlan/massDetail/index'
import cargoPlanDetail from '@/views/produce/warehousePlan/cargoDetail/index'
const { proxy } = getCurrentInstance()
const tempId = ref()
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const massDrawer = ref(false)
const cargoPlanDrawer = ref(false)
const cargoPlanDetailRef = ref(false)
const trustOrderRef = ref(null)
//控制作业指令编辑抽屉
const trustOrderDrawer = ref(false)
const title = ref('新增作业指令')
//顶部 搜索表单
const selectData = reactive([
	{
		name: '通知单编号',
		type: 'input', //远程下拉框
		modelValue: 'trustNo', //对应字段
		span: 8,
	},
	{
		name: '作业公司',
		type: 'select', //远程下拉框
		modelValue: 'companyId', //对应字段
		span: 8,
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 8,
		dataType: 'VOYAGE',
	},
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 2,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '指令状态',
		type: 'select', //远程下拉框
		modelValue: 'status', //对应字段
		span: 2,
		dataConfig: {
			params: {
				type: 'CONSTANT',
				types: 'BUS_TRUST_STATUS',
			},
		},
	},
  {
    name: '货名',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoCode', //对应字段
    span: 2,
    dataType: 'CARGO_INFO',
  },
  {
    name: '审核状态',
    type: 'select', //远程下拉框
    modelValue: 'statusLabel', //对应字段
    span: 2,
    selectData: [
      { label: '已审核', value: '1' },
      { label: '未审核', value: '2' }
    ],
  },
])
const massDetailRef = ref(null) // 场地组件ref
//数据总条数
const total = ref(0)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '场地安排', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => updateMass, // 回调函数
		permission: 'produce:warehousePlan:arrange', // 权限
	},
  {
		label: '销审', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelAudit, // 回调函数
		permission: 'produce:warehousePlan:cancelAudit', // 权限
	},
  {
    label: '计划开关', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'video-play', // 按钮图标，支持element-Plus中所有图标
    click: () => updateCargoPlan, // 回调函数
    permission: 'produce:warehousePlan:isStop', // 权限
  },
])
//单行点击事件
const tmpRowValue = ref(null)
const cellClickEvent = ({ row }) => {
	nextTick(() => {
		tempId.value = row.id
    tmpRowValue.value = row
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '通知单编号', prop: 'trustNo',width:110 },
	{ label: '作业公司', prop: 'companyName',width:200,align: "center" },
	{ label: '船名航次', prop: 'shipNameVoyage',width:120 },
	// { prop: 'cargoInfoNo', label: '票货号', width:130, },
	// { label: '作业过程', prop: 'processName' },
	{ label: '通知单类型', prop: 'type',width:115 },
	{ label: '已安排货区', prop: 'massNamesTarget',width:160 },
	{ label: '货主', prop: 'cargoOwnerName' ,width:240,align: "center"},
	// { label: '货代', prop: 'cargoAgentName', },
	{ label: '货名', prop: 'cargoName' ,width:130},
	{ label: '内外贸', prop: 'tradeType',width:100 },
	{ label: '计划件数', prop: 'planQuantity',width:100 },
	{ label: '计划重量', prop: 'planTon',width:100 },
	{ prop: 'remark', label: '作业要求',width:130 },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'left',
    width:130,
    fixed:'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.statusLabel == '已审核' ? 'success' : 'danger',
					},
					{
						default: () => (row.statusLabel == '已审核' ? '已审核' : '未审核 '),
					}
				),
			]
		},
	},
])
//查询
const getList = e => {
	queryParams.value = e
	api.getStorageYardList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
//新增作业指令抽屉
const addTrustOrder = () => {
	trustOrderDrawer.value = true
	title.value = '新增作业指令'
	nextTick(() => {
		trustOrderRef.value.resetForm()
	})
}
//提交作业指令信息
const saveTrustOrder = async () => {
	if (trustOrderRef.value.id && trustOrderRef.value.status !== '10') {
		proxy.$modal.msgSuccess('已发布的指令不允许修改')
		return
	}
	if (await trustOrderRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			const params = {
				...trustOrderRef.value.trustOrderForm,
			}
			if (
				trustOrderRef.value.trustOrderForm.id === undefined ||
				trustOrderRef.value.trustOrderForm.id === null ||
				trustOrderRef.value.trustOrderForm.id === ''
			) {
				api.addTrustOrder(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						trustOrderDrawer.value = false
						getList(queryParams.value)
					}
				})
			} else {
				api.update(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('修改成功')
						trustOrderDrawer.value = false
						getList(queryParams.value)
					}
				})
			}
		})
	}
}

// 更新场地派工
const updateMass = async row => {
	if (tempId.value == undefined || tempId.value == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	massDrawer.value = true
	nextTick(async () => {
		massDetailRef.value.formData.trustId = tempId.value
		massDetailRef.value.formData.locationListSource = []
		massDetailRef.value.formData.locationListTarget = []
    await api.getDetailMass({ trustId: tempId.value }).then(res => {
			proxy.setFormData(massDetailRef.value.formData, res.data)
			// massDetailRef.value.formData.regionIdsSource = res.data.regionIdsSource
			massDetailRef.value.formData.regionIdsTarget = res.data.regionIdsTarget
			massDetailRef.value.tableData = res.data.cargoList
		})
    if(tmpRowValue.value.statusLabel == '未审核' && (tmpRowValue.value.type=='陆销'||tmpRowValue.value.type=='疏港')){
      let tmpParams = {
        trustId : tmpRowValue.value.id
      }

      await api.getMassIdsWithTrustId(tmpParams).then(res=>{
        massDetailRef.value.formData.regionIdsTarget = massDetailRef.value.formData.regionIdsTarget?
          massDetailRef.value.formData.regionIdsTarget:(res.data.length>0?res.data.map(item =>{
            return item.regionId
          }):[])
        massDetailRef.value.changeMassTarget(res.data)
        })
    }
		/* api.getDetail(row.id).then(res =>
      massDetailRef.value.tableData = res.data.cargoList
    )*/
	})
}

const updateCargoPlan = row => {
  if (tempId.value == undefined || tempId.value == '') {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  cargoPlanDrawer.value = true
  nextTick(() => {
    cargoPlanDetailRef.value.formData.trustId = tempId.value
    api.getDetailMass({ trustId: tempId.value }).then(res => {
      cargoPlanDetailRef.value.tableData = res.data.cargoList
    })
  })
}
const saveMass = async () => {
	console.log(massDetailRef.value.formData.trustId)
	if (massDetailRef.value.formData.trustId == undefined || massDetailRef.value.formData.trustId == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	massDetailRef.value.formData.updateType = '2'
	proxy.$modal.confirm('确定保存？').then(res => {
		const params = {
			trustId: massDetailRef.value.formData.trustId,
			updateType: massDetailRef.value.formData.updateType,
			locationListSource: massDetailRef.value.formData.locationListSource,
			locationListTarget: massDetailRef.value.formData.locationListTarget,
		}
		api.updateMass(params).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
			massDrawer.value = false
			massDetailRef.value.formData.id = ''
			tempId.value = ''
		})
	})
}

//
const handleDelete = row => {
	proxy.$modal.confirm('确定删除？').then(() => {
		if (row.status !== '10') {
			proxy.$modal.msgSuccess('已发布的指令不允许删除')
			return
		}
		api.delete(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('删除成功')
				getList(queryParams.value)
			}
		})
	})
}
const cancelAudit = () =>{
  if(tmpRowValue.value===undefined ||tmpRowValue.value==null|| tmpRowValue.value.id == ''){
    proxy.$message.warning("请先选中一条数据");
    return
  }
  if(tmpRowValue.value.statusLabel== '未审核'){
    proxy.$message.warning("状态是未审核，无需销审");
    return
  }
  nextTick(()=>{
    api.cancelAudit(tmpRowValue.value.id).then(res=>{
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    })
    tmpRowValue.value = null
  })

}
getList(queryParams.value)
</script>

<style scoped></style>
