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
        :cellDBLClickEvent="cellDBLClickEvent"
				:total="total"
			/>
		</div>
		<el-drawer v-model="detailVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<el-dialog v-model="cancelVisible" title="作废" width="30%">
			<el-form :model="cancelData" ref="cancelForm">
				<el-form-item
					label="作废原因"
					prop="delRemark"
					:rules="[
						{
							required: true,
							message: '请输入',
							trigger: 'blur',
						},
					]"
				>
					<el-input type="textarea" v-model="cancelData.delRemark"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancelVisible = false">取消</el-button>
					<el-button type="primary" @click="saveCancel">保存</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog v-model="rejectionVisible" title="拒收" width="30%">
			<el-form :model="rejectionData" ref="rejectionForm">
				<el-form-item
					label="拒收原因"
					prop="rejectionRemark"
					:rules="[
						{
							required: true,
							message: '请输入',
							trigger: 'blur',
						},
					]"
				>
					<el-input type="textarea" v-model="rejectionData.rejectionRemark"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="rejectionVisible = false">取消</el-button>
					<el-button type="primary" @click="saveRejection">保存</el-button>
				</span>
			</template>
		</el-dialog>
    <el-dialog v-model="jieShouVisible" title="接收" width="30%">
      <el-form :model="jieShouData" ref="cancelForm">
        <el-form-item
          label="接收原因"
          prop="remark"
          :rules="[
						{
							required: true,
							message: '请输入',
							trigger: 'blur',
						},
					]"
        >
          <el-input type="textarea" v-model="jieShouData.remark"></el-input>
        </el-form-item>
        <span style="color: red">{{textFocusShip}}</span>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="jieShouVisible = false">取消</el-button>
					<el-button type="primary" @click="saveJieShou">保存</el-button>
				</span>
      </template>
    </el-dialog>

    <!--  单船综合查询  -->
    <el-dialog title="单船综合查询"  v-model="dialogTableVisible" size="100%" width="80%" height="10%" >
      <ShipInfoDetail ref="shipInfoRef"/>
    </el-dialog>

  </div>
</template>

<script setup name="shipForecast">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/dispatch/shipForecast/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import Math from "../../../utils/math";

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref
const abc = ref([{ label: '123', value: '235' }])

import { ElMessage, ElMessageBox } from 'element-plus'


import ShipInfoDetail from '@/views/common/shipInfo/index.vue'
var dialogTableVisible = ref(false)
const shipInfoRef = ref(null) // 明细组件ref
/**
 * 单船综合查询
 */
const searchShipInfo = (row) => {
  dialogTableVisible.value = true;
  nextTick(()=>{
    shipInfoRef.value.getSteps(row.id)
    shipInfoRef.value.getShipVoyageInfo(row.id)
    shipInfoRef.value.getShipDynamicInfo(row.id)
    shipInfoRef.value.getPortTrendsInfo(row.id)
    shipInfoRef.value.getShipDoorInfo(row.id,'')
    if(row.loadUnload == '装'){
      shipInfoRef.value.isActive = '装'
    }else if (row.loadUnload == '卸'){
      shipInfoRef.value.isActive = '卸'
    }else{
      shipInfoRef.value.isActive = '卸'
    }
    shipInfoRef.value.getCostInfo(row.id)
    shipInfoRef.value.getPoundInfo(row.id)
    shipInfoRef.value.activeName = 'third'
  })

}


// header检索参数
const selectData = reactive([
	{
		name: '船名',
		type: 'input',
		modelValue: 'shipName',
		span: 8,
	},
	{
		name: '航次',
		type: 'input',
		modelValue: 'voyage',
		span: 8,
	},
  {
    name: '船舶类型',
    type: 'select', //远程下拉框
    modelValue: 'shipKindCode', //对应字段
    modelLabel: 'shipKindName', //对应字段
    span: 8,
    dataConfig:{ url: '/api/internal/public/getDictListByType/SHIP_KIND' }
  },
	{
		name: '状态',
		type: 'select',
		modelValue: 'shipStatusCode',
		span: 8,
		selectData: [
			{ label: '预报', value: '10' },
			{ label: '接收', value: '20' },
			{ label: '抵锚', value: '30' },
			{ label: '靠泊', value: '50' },
			{ label: '移泊', value: '60' },
			{ label: '开工', value: '70' },
			{ label: '停工', value: '80' },
			{ label: '复工', value: '90' },
			{ label: '完工', value: '100' },
			{ label: '离泊', value: '110' },
			{ label: '离港', value: '120' },
			{ label: '作废', value: '00' },
			{ label: '拒接', value: '11' },
		],
	},
])
const queryParams = ref({
	// 检索参数
	startPage: 1,
	pageSize: 10,
})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.listDisShipVoyage(e).then(res => {
		buttonList[1].disabled = true
		buttonList[2].disabled = true
		// buttonList[3].disabled = true
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'dispatch:shipForecast:add', // 权限
	},
	// {
	// 	label: '接收', // 按钮名称
	// 	type: 'primary', // 按钮类型
	// 	icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
	// 	click: () => receive, // 回调函数
	// 	permission: 'dispatch:shipForecast:receive', // 权限
	// },
	{
		label: '作废', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
		click: () => cancel, // 回调函数
		permission: 'dispatch:shipForecast:cancel', // 权限
	},
	{
		label: '拒收', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Close', // 按钮图标，支持element-Plus中所有图标
		click: () => rejection, // 回调函数
		permission: 'dispatch:shipForecast:rejection', // 权限
	},
])
const title = ref('')
// 新增事件
const add = () => {
	title.value = '新增'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm('add') // 清空事件
		detailRef.value.formData.id = '' // 新建清空id
	})
}
// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
  detailRef.row = row
	if ((row.shipStatusName === '预报' ||  row.shipStatusName != '作废')) {
		buttonList[1].disabled = false
	} else {
		buttonList[1].disabled = true
	}
	if (row.shipStatusName === '预报') {
		buttonList[2].disabled = false
	} else {
		buttonList[2].disabled = true
	}
}
// 接收事件
const receive = () => {
	proxy.$modal.confirm('确定接收？').then(() => {
		api.receiveDisShipvoyage({ ids: clickRow.value.id }).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getList(queryParams.value)
		})
	})
}
// 作废事件
const cancelVisible = ref(false)
const cancelData = reactive({
	delRemark: '',
})
// 接收事件
const jieShouVisible = ref(false)
const jieShouData = reactive({
	remark: '',
})
// 接收事件
const saveJieShou = () => {
  detailRef.value.formData.jieShouRemark = jieShouData.remark;
  jieShouVisible.value = false
  save("1")
}
// 打开作废dialog
const cancel = () => {
	cancelVisible.value = true
	cancelData.delRemark = ''
	cancelForm.value.clearValidate()
}
const cancelForm = ref()
// 作废事件
const saveCancel = () => {
	cancelForm.value.validate((valid, fields) => {
		if (valid) {
			proxy.$modal.confirm('确定作废？').then(() => {
				api.voidDisShipvoyage({ ids: clickRow.value.id, delRemark: cancelData.delRemark }).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					getList(queryParams.value)
					cancelVisible.value = false
				})
			})
		} else {
		}
	})
}
const rejectionData = ref({
	rejectionRemark: '',
})
const rejectionForm = ref()
// 拒收显示
const rejectionVisible = ref(false)
// 拒收按钮
const rejection = () => {
	rejectionVisible.value = true
	rejectionData.value.rejectionRemark = ''
	rejectionForm.value.clearValidate()
}
// 拒收保存
const saveRejection = () => {
	rejectionForm.value.validate((valid, fields) => {
		if (valid) {
			proxy.$modal.confirm('确定拒收？').then(() => {
				api.rejectionShipvoyage({ ids: clickRow.value.id, rejectionRemark: rejectionData.value.rejectionRemark }).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					getList(queryParams.value)
					rejectionVisible.value = false
				})
			})
		} else {
		}
	})
}
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'shipName', label: '船名' ,align: 'left' ,width: 100},
	{ prop: 'voyage', label: '航次',align: 'left' ,width: 100 },
	{ prop: 'shipKindName', label: '船舶类型',align: 'left' ,width: 110},
	{ prop: 'scn', label: 'SCN',align: 'left',width: 100 },
	{
		prop: 'impExp',
		label: '进出口',
    align: 'left',
    width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.impExp == 'OUT' ? '' : 'info',
					},
					{
						default: () => {
							if (row.impExp === 'IN') {
								return '进口'
							} else if (row.impExp === 'OUT') {
								return '出口'
							} else if (row.impExp === 'INOUT') {
								return '进出口'
							}
						},
					}
				),
			]
		},
	},
	{
		prop: 'tradeType',
		label: '贸别',
    align: 'left',
    width: 80,
		// render: row => {
		// 	return [h('div', {}, row.tradeType === 'IN' ? '内贸' : '外贸')]
		// },
	},
	{ prop: 'loadUnload', label: '装卸',  align: 'left', width: 80 },
	{ prop: 'startPortName', label: '起运港' ,  align: 'left', width: 120},
	{ prop: 'endPortName', label: '目的港' ,  align: 'left', width: 120},
	{ prop: 'arrivalTimePlan', label: '预抵日期',  align: 'left', width: 160 },
	{ prop: 'confirmTime', label: '24小时确报时间',  align: 'left', width: 160 },
	{ prop: 'leavePortTimePlan', label: '预计离港时间', align: 'left', width: 160 },
	{ prop: 'receiveByName', label: '接收人', align: 'left', width: 160 },
	{ prop: 'receiveTime', label: '接收时间', align: 'left', width: 160 },
	{
		prop: 'shipStatusName',
		label: '状态',
    align: 'left',
    width: 90,
		fixed: 'right',
		render: row => {
			let type = 'info'
			if (row.shipStatusName === '预报') {
				type = ''
			} else if (row.shipStatusName === '作废') {
				type = 'danger'
			}
			return [
				h(
					ElTag,
					{
						type,
					},
					{
						default: () => row.shipStatusName,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
    width: 260,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
        h(
          ElButton,
          {
            onClick: () => {
              searchShipInfo(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'dispatch:shipForecast:shipInfo', //权限
          },
          {
            default: () => '综合查询',
          }
        ),
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'dispatch:shipForecast:update', //权限
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
						permission: 'dispatch:shipForecast:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

const textFocusShip = ref('')
// 编辑事件
const edit = row => {
	if (row.shipStatusName === '作废') {
		proxy.$modal.msgWarning('已作废，无法编辑！')
		return
	}
  textFocusShip.value = ''
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据

  const tempImo = []
  api.getDataById(editRow.shipId).then(res => {
    tempImo.push(res.data.imo)
    api.getBlackShipData(tempImo).then(res => {
      if (res.data != null && res.data != '') {
        textFocusShip.value = '该船舶为黑名单船舶，请确认是否接收后保存 '
      }
    })
  })
 /* if(editRow.isFocusShip == '1'){
    textFocusShip.value = '该船舶为重点船舶，请确认是否接收后保存 '
  }*/
	detailVisible.value = true
	nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    if(editRow){
      proxy.setFormData(detailRef.value.formData, editRow)
    }
    if(editRow.in){
      if(editRow.in.firCargoCate == '01'){
        editRow.in.firCargoCateName = '集装箱'
      }else if(editRow.in.firCargoCate == '02'){
        editRow.in.firCargoCateName = '干散货'
      }else if(editRow.in.firCargoCate == '03'){
        editRow.in.firCargoCateName = '油品'
      }else if(editRow.in.firCargoCate == '04'){
        editRow.in.firCargoCateName = '件杂货'
      }else if(editRow.in.firCargoCate == '05'){
        editRow.in.firCargoCateName = '车辆'
      }
      proxy.setFormData(detailRef.value.inFormData, editRow.in)
    }
    if(editRow.out){
      if(editRow.out.firCargoCate == '01'){
        editRow.out.firCargoCateName = '集装箱'
      }else if(editRow.out.firCargoCate == '02'){
        editRow.out.firCargoCateName = '干散货'
      }else if(editRow.out.firCargoCate == '03'){
        editRow.out.firCargoCateName = '油品'
      }else if(editRow.out.firCargoCate == '04'){
        editRow.out.firCargoCateName = '件杂货'
      }else if(editRow.out.firCargoCate == '05'){
        editRow.out.firCargoCateName = '车辆'
      }
      proxy.setFormData(detailRef.value.outFormData, editRow.out)
    }
    detailRef.value.initData()
    if(
      detailRef.value.inFormData.customerId!=null
      &&detailRef.value.inFormData.customerId!=undefined
      &&detailRef.value.inFormData.customerId!=''
      &&detailRef.value.inFormData.companyId!=null
      &&detailRef.value.inFormData.companyId!=undefined
      &&detailRef.value.inFormData.companyId!=''
    ){
      detailRef.value.inCustomerChange(editRow.in.customerId,editRow.in.companyId)
    }
    if(
      detailRef.value.outFormData.customerId!=null
      &&detailRef.value.outFormData.customerId!=undefined
      &&detailRef.value.outFormData.customerId!=''
      &&detailRef.value.outFormData.companyId!=null
      &&detailRef.value.outFormData.companyId!=undefined
      &&detailRef.value.outFormData.companyId!=''
    ){
      detailRef.value.outCustomerChange(editRow.out.customerId,editRow.out.companyId)
    }
    detailRef.value.initData()
    jieShouData.remark = ''
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	const params = {
		ids: deleteRow.id,
	}
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deleteDisShipvoyage(params)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
}
// 保存事件
const save = async flag => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		const inFormData = JSON.parse(JSON.stringify(detailRef.value.inFormData)) // 取到子组件的formData
		const outFormData = JSON.parse(JSON.stringify(detailRef.value.outFormData)) // 取到子组件的formData
    if(detailRef.value.formData.impExp == 'OUT' && !detailRef.value.formData.nextPortId ){
      proxy.$modal.msgWarning('请填写下一港信息！')
    }else{
      if (params.impExp === 'IN') {
        params.in = inFormData
      } else if (params.impExp === 'OUT') {
        params.out = outFormData
      } else if (params.impExp === 'INOUT') {
        params.in = inFormData
        params.out = outFormData
      }
      if( (detailRef.value.formData.shipStatusCode == '10' || detailRef.value.formData.shipStatusCode == '11')
        && (detailRef.value.formData.isPayment == '1')
      && (Math.numAdd(detailRef.value.inResidualAmount,detailRef.value.outResidualAmount).toFixed(2)<Number(detailRef.value.formData.paymentAmount))
      && (detailRef.value.formData.jieShouRemark == null || detailRef.value.formData.jieShouRemark == '')){
        jieShouVisible.value = true
      }
      else if(flag == "1"){
        if (params.id) {
          api.updateDisShipVoyage(params).then(res => {
            detailVisible.value = false
            if (clickRow.value.shipStatusName == '预报'||clickRow.value.shipStatusName == '拒接') {
              api.receiveDisShipvoyage({ ids: clickRow.value.id }).then(res => {
                proxy.$modal.msgSuccess(res.msg)
                getList(queryParams.value)
              })
            }else{
              proxy.$modal.msgSuccess(res.msg)
              getList(queryParams.value)
            }
          })
        } else {
          api.insertDisShipVoyage(params).then(res => {
            proxy.$modal.msgSuccess(res.msg)
            detailVisible.value = false
            getList(queryParams.value)
          })
        }
      }
      else{
        let message = '';
        let useHTML = false;
        const tempImo = []
        api.getDataById(params.shipId).then(res =>{
          tempImo.push(res.data.imo)
        api.getBlackShipData(tempImo).then(res=>{
          if (res.data != null && res.data != '') {
            //  当需要红色时：拼接带样式的HTML内容
            message = `<span style="color: red;">${res.data}为黑名单船舶，请确认是否接收</span>`;
            useHTML = true;
          } else {
            message = '确定接收吗？';
          }
          ElMessageBox.confirm(message, {
            dangerouslyUseHTMLString: useHTML,
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }).then(()=>{
            if (params.id) {
              api.updateDisShipVoyage(params).then(res => {
                detailVisible.value = false
                if (clickRow.value.shipStatusName == '预报') {
                  api.receiveDisShipvoyage({ ids: clickRow.value.id }).then(res => {
                    proxy.$modal.msgSuccess(res.msg)
                    getList(queryParams.value)
                  })
                }else{
                  proxy.$modal.msgSuccess(res.msg)
                  getList(queryParams.value)
                }
              })
            } else {
              api.insertDisShipVoyage(params).then(res => {
                proxy.$modal.msgSuccess(res.msg)
                detailVisible.value = false
                getList(queryParams.value)
              })
            }
        })
        // proxy.$modal.confirm(text,dangerouslyUseHTMLString:true).then(() => {
        //   if (params.id) {
        //     api.updateDisShipVoyage(params).then(res => {
        //       detailVisible.value = false
        //       if (clickRow.value.shipStatusName == '预报') {
        //         api.receiveDisShipvoyage({ ids: clickRow.value.id }).then(res => {
        //           proxy.$modal.msgSuccess(res.msg)
        //           getList(queryParams.value)
        //         })
        //       }else{
        //         proxy.$modal.msgSuccess(res.msg)
        //         getList(queryParams.value)
        //       }
        //     })
        //   } else {
        //     api.insertDisShipVoyage(params).then(res => {
        //       proxy.$modal.msgSuccess(res.msg)
        //       detailVisible.value = false
        //       getList(queryParams.value)
        //     })
        //   }
        // })
        })
        })
      }

    }
	}
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  edit(row)
}
// 默认查询
getList(queryParams.value)
</script>
