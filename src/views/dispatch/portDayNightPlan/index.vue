<template>
	<div class="app-container">
		<el-form :inline="true" :model="searchForm" class="demo-form-inline" style="margin: 8px 0 0 5px">
      <el-row>
        <el-col :span="6">
          <el-form-item>
            <input
              v-model="searchForm.planDate"
              class="newDateStyle"
              type="Date"
              onfocus="(this.type='Date')"
              onblur="(this.type='Date')"
              max="2200-12-30"
              placeholder="计划日期"
            />
            <span
              style="
                position: absolute;
                right: 1px;
                top: 1px;
                bottom: 1px;
                background-color: var(--el-fill-color-light);
                border-radius: 0px 4px 4px 0px;
                color: var(--el-color-info);
                padding: 0px 10px;
              "
            >
              {{ searchForm.endDate }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="3">
<!--          <el-form-item >
              <RemoteSelect
                style="width: 160px"
                type="VOYAGE"
                v-model:value="searchForm.shipvoyageItemId"
                placeholder="选择船名航次"
              />x
          </el-form-item>-->
            <el-form-item>
              <el-input placeholder="请输入船名" v-model="searchForm.shipName"  style="width: 160px" clearable/>
            </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item >
            <Select
              style="width: 160px"
              :dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
              v-model:value="searchForm.classCode"
              v-model:label="searchForm.className"
              placeholder="选择班次"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <div>
              <el-button type="primary" @click="getList" icon="Search">查询</el-button>
<!--              <el-button v-hasPermi="['dispatch:portDayNightPlan:approve']" type="primary" @click="changeCheck" icon="View">
                {{ approved == true ? '销审' : '审核' }}
              </el-button>-->
              <el-button v-hasPermi="['dispatch:portDayNightPlan:approve']" type="primary" @click="checkList" icon="View">
                {{ auditApprove == true ? '销审' : '审核' }}
              </el-button>
              <el-button v-hasPermi="['dispatch:portDayNightPlan:save']" type="primary" @click="saveAll" icon="Select">
                保存
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <div style="float: right">
            <el-button v-hasPermi="['dispatch:portDayNightPlan:exportPlan']" type="primary" @click="exportPlan" icon="Select">
              导出
            </el-button>
            <el-button v-hasPermi="['dispatch:portDayNightPlan:importTrust']" type="primary" @click="importTrust" icon="plus">
              导入指令
            </el-button>
            <el-button v-hasPermi="['dispatch:portDayNightPlan:importTodayPlan']" type="primary" @click="importTodayPlan" icon="plus">
              导入昨日计划
            </el-button>
          </div>
        </el-col>
      </el-row>
        <el-row>
        <el-col :span="3">
          <el-form-item >
            <el-input placeholder="请输入计划号" v-model="searchForm.businessNo"  style="width: 160px" clearable/>
          </el-form-item>
        </el-col>
          <el-col :span="3">
            <el-form-item >
              <Select
                style="width: 160px"
                :selectData="[
										{ label: '散', value: '1' },
									  { label: '件', value: '2' },
								]"
                v-model:value="searchForm.packingCode"
                placeholder="请选择包装"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item >
                <RemoteSelect
                  style="width: 160px"
                  type="CUSTOMER_CARGO_OWNER"
                  v-model:value="searchForm.cargoOwnerId"
                  placeholder="请选择货主"
                />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item >
              <Select
                style="width: 160px"
                :selectData="[
										{ label: '东作业区', value: '01' },
                    { label: '中作业区', value: '02' },
                    { label: '西作业区', value: '03' },
								]"
                v-model:value="searchForm.portCode"
                placeholder="请选择作业区"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item >
              <el-input placeholder="请输入航次" v-model="searchForm.voyage"  style="width: 160px" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
		</el-form>

		<EditTable
			ref="editTableRef"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:rowConfig="rowConfig"
			:exportConfig="exportConfig"
			:editRules="editRules"
			:loading="false"
			:showFooter="true"
			:tableHeight="'pageTableHeight'"
			@change="tableChange"
      @input="editInputChange"
      @chang_date="tableChangeDate"
      :cellClickEvent="cellClickEvent"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="checkboxChangeEvent"
      @checkbox-change="checkboxChange"
      disabledKey="rowDisabled"
		/>
    <el-drawer v-model="trustCargoDrawer" :title="'指令票货'" size="70%">
      <trustCargo ref="trustCargoRef" />
      <template #footer>
        <div>
          <el-button @click="trustCargoDrawer = false">取消</el-button>
          <el-button type="primary" @click="importConfim">确定</el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer v-model="yesterdayPlanDrawer" :title="'昨日计划'" size="70%">
      <yesterdayPlan ref="yesterdayPlanRef" />
      <template #footer>
        <div>
          <el-button @click="yesterdayPlanDrawer = false">取消</el-button>
          <el-button type="primary" @click="yesterdayPlanSave">确定</el-button>
        </div>
      </template>
    </el-drawer>
	</div>
</template>

<script setup name="portDayNightPlan">
import api from '@/api/dispatch/portDayNightPlan/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'

import EditTable from '@/components/EditTable/index.vue'
import { getNowDate, uniqueArr, getBeforeAfter } from '@/utils/index.js'
import {ElButton, ElTag} from 'element-plus'
import publicApi from '../../../api/public'
import math from '@/utils/math'
import trustCargo from '@/views/dispatch/portDayNightPlan/trustCargo/index'
import yesterdayPlan from '@/views/dispatch/portDayNightPlan/yesterdayPlan/index'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import Select from "@/components/Select/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref('')
const approved = ref(false)

const auditApprove = ref(false)
// 表格数据
const tableData = ref([])
const editTableRef = ref() // editTable的ref
const exportConfig = {}
// 指令票货
const trustCargoDrawer = ref(false)
const trustCargoRef = ref(null)
// 昨日计划
const yesterdayPlanDrawer = ref(false)
const yesterdayPlanRef = ref(null)
//表单校验
const editRules = reactive({
	classCode: proxy.getRules({
		required: true,
	}),
	planTon: proxy.getRules({
		required: true,
	}),
	beginTime: proxy.getRules({
		required: true,
	}),
	endTime: proxy.getRules({
		required: true,
	}),
  planType: proxy.getRules({
		required: true,
	}),
})
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
//edit表格数据
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '', type: 'checkbox', width: 40,fixed: 'left',},
  { prop: 'classCode',
    label: '班次',
    width: 100,
    editType: 'select',
    align: 'center',
    editRender: {},
    selectData: [
      /*{ label: '白班', value: '01' },
      { label: '夜班', value: '02' },*/
      { label: '全天', value: '03'},
    ],
  sortable:true},
  { prop: 'businessNo', label: '计划号', width: 150, align: 'center' ,sortable:true},
  { prop: 'shipvoyageName', label: '船名航次', width: 120, align: 'center',sortable:true },
  { prop: 'scn', label: 'SCN', width: 80, align: 'center',sortable:true },
  { prop: 'noticeType', label: '类型', width: 100, align: 'center' ,sortable:true},
  { prop: 'portName', label: '港区', width: 80, align: 'center',sortable:true },
  { prop: 'cargoOwnerName', label: '货主', width: 200, align: 'center',sortable:true },
  { prop: 'cargoName', label: '货名', width: 130, align: 'center' ,sortable:true},
  { prop: 'packingName', label: '包装', width: 80, align: 'center' ,sortable:true},
  { prop: 'tradeType', label: '内外贸', width: 80, align: 'center',sortable:true },
  {
    label: '计划类型',
    prop: 'planType',
    editType: 'select',
    width: 130,
    align: 'center',
    editRender: {},
    selectData: [
      { label: '出入库', value: '1' },
      { label: '直取', value: '2' },
    ],
  sortable:true
  },
  {
    prop: 'planTon',
    label: '昼夜计划量',
    width: 140,
    editType: 'input',
    editRender: {},
    align: 'center',
    sortable:true
  },
/*  { prop: 'weighCount', label: '过磅量', width: 100, align: 'center' ,sortable:true},
  { prop: 'remainCount', label: '剩余量', width: 100, align: 'center' ,sortable:true},*/
  { prop: 'remainCount', label: '昼夜计划剩余量', width: 120, align: 'center' },
  { prop: 'allPlanCount', label: '计划总量', width: 100, align: 'center' },
  { prop: 'weighCount', label: '过磅量', width: 100, align: 'center' },
  { prop: 'remainPlanCount', label: '计划剩余量', width: 100, align: 'center' },
  { prop: 'massNamesTargetLabel', label: '位置', width: 200, align: 'center',sortable:true },
  { prop: 'beginTime', label: '计划开始时间', width: 160, align: 'center', editType: 'nativedatetime', editRender: {},sortable:true},
  { prop: 'endTime', label: '计划结束时间', width: 160, align: 'center', editType: 'nativedatetime', editRender: {},sortable:true},
  { prop: 'createByName', label: '创建人', width: 90, align: 'center',sortable:true },
  { prop: 'createTime', label: '创建时间', width: 140, align: 'center',sortable:true },
  { prop: 'examineByName', label: '审核人', width: 80, align: 'center',sortable:true },
  { prop: 'examineTime', label: '审核时间', width: 140, align: 'center' ,sortable:true},
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    fixed: 'right',
    width: 100,
    sortable:true,
    render: row => {
      return [
        h(
          ElTag,
          {
            type:
              row.status == '20'
                ? 'success'
                : row.status == '10'
                ? ''
                : row.status == '30'
                  ? 'danger '
                  : row.status == '40'
                    ? 'info'
                    : '',
          },
          {
            default: () =>
              row.status == '20'
                ? '已审核'
                : row.status == '10'
                ? '待审核'
                : row.status == '30'
                  ? '驳回 '
                  : row.status == '40'
                    ? '停用'
                    : '',
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    width: 100,
    fixed: 'right',
    align: 'center',
    render: row => {
      return [
        /*h(
          ElButton,
          {
            onClick: () => {
              tosToBoHaiTong(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'dispatch:portDayNightPlan:tosToBoHaiTong', // 权限
          },
          {
            default: () => '数据同步',
          }
        ),*/
        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            disabled: row.status != null && row.status !== '10',
            permission: 'dispatch:portDayNightPlan:delete', // 权限
          },
          {
            default: () => '删除',
          }
        )
      ]
    },
  },
])
//查询条件
const searchForm = ref({
	planDate: '',
	endDate: '',
})
// 同步
const tosToBoHaiTong = row => {
  if (!row.id) {
    proxy.$modal.msgWarning('数据未保存，请先保存后再同步！');
    return ;
  } else {
    proxy.$modal.confirm('确定同步？').then(() => {
      api.tosToBoHaiTongDayNightPlan(row.id).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('同步成功！')
          getList()
        }
      })
    })
  }
}
const checkboxList = ref([])
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
  checkboxList.value.forEach(item => {
    if(item.status == '20'){
      approved.value = true;
      auditApprove.value = true;
    }
    if(item.status == '10'){
      approved.value = false;
      auditApprove.value = false;
    }
  })
}
const checkboxChange = data => {
  checkboxList.value = data
  checkboxList.value.forEach(item => {
    if(item.status == '20'){
      approved.value = true;
      auditApprove.value = true;
    }
    if(item.status == '10'){
      approved.value = false;
      auditApprove.value = false;
    }
  })
}
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 删除
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
    proxy.$modal.confirm('确定删除计划号为' + row.businessNo + (row.shipvoyageName ? '船名航次为' + row.shipvoyageName : '') + '的数据吗？').then(() => {
      if (row.status !== '10') {
        proxy.$modal.msgSuccess('已审核的计划不允许删除')
        return
      }
      api.delete(row.id).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('删除成功')
          getList()
        }
      })
    })
  }
}

const clickRow = ref({})
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  /*if (row.status == '20') {
    approved.value = true;
    auditApprove.value = true;
  }
  if(row.status == '10'){
    approved.value = false;
    auditApprove.value = false;
  }*/
}
// 点击查询的事件
const getList = async () => {
  clickRow.value = null
	loading.value = true
  await api.getList(searchForm.value).then(res => {
		tableData.value = res.data.map(item => {
      if (item.status == '20') {
        item.rowDisabled = true
      }
      return item
    })
	})
}
// 单元格输入框事件
const editInputChange = (e, row, title) => {
  console.log('可编辑列表输入框事件', title)
  if (row.status == '20') {
    proxy.$modal.msgError('计划已审核，无法修改')
    return
  }
}
// 侧边栏选择票据确定事件
const importConfim = async () => {
  /*trustCargoRef.value.formData.checkboxList.value.forEach(item => {*/

 /*for(let index in trustCargoRef.value.formData.checkboxList.value){
  let item = trustCargoRef.value.formData.checkboxList.value[index]
    // 添加事件
    let newObj = {}
    newObj['trustId'] = item.trustId;
    newObj['trustCargoId'] = item.trustCargoId;
    newObj['businessNo'] = item.businessNo;
    newObj['shipvoyageId'] = item.shipvoyageId;
    newObj['shipvoyageItemId'] = item.shipvoyageItemId;
    newObj['shipvoyageName'] = item.shipvoyageName;
    newObj['scn'] = item.scn;
    newObj['cargoOwnerId'] = item.cargoOwnerId;
    newObj['cargoOwnerName'] = item.cargoOwnerName;
    newObj['portCode'] = item.portCode;
    newObj['portName'] = item.portName;
    newObj['cargoCode'] = item.cargoCode;
    newObj['cargoName'] = item.cargoName;
    newObj['packingCode'] = item.packingCode;
    newObj['packingName'] = item.packingName;
    newObj['tradeType'] = item.tradeType;
    newObj['noticeType'] = item.noticeType;
    newObj['massNamesTargetLabel'] = item.massNamesTargetLabel;
    newObj['massNamesTarget'] = item.massNamesTarget;
    newObj['status'] = '10'
    // newObj['beginTime'] = getNowDate('YYYY-MM-DD') + ' 18:00'
    // newObj['endTime'] = getBeforeAfter('after', 1, 'YYYY-MM-DD') + ' 18:00'
    newObj['beginTime'] = ''
    newObj['endTime'] = ''
     api.getCount(item.businessNo).then(res => {
      newObj['allPlanCount'] = res.data.allPlanCount
      newObj['weighCount'] = res.data.weighCount
      newObj['remainPlanCount'] = res.data.remainPlanCount
    })
    tableData.value.unshift(newObj)
  })*/

  for (const item of trustCargoRef.value.formData.checkboxList.value) {
    try {
      const res = await api.getCount(item.businessNo);
      let newObj = {
        trustId: item.trustId,
        trustCargoId: item.trustCargoId,
        businessNo: item.businessNo,
        shipvoyageId: item.shipvoyageId,
        shipvoyageItemId: item.shipvoyageItemId,
        shipvoyageName: item.shipvoyageName,
        scn: item.scn,
        cargoOwnerId: item.cargoOwnerId,
        cargoOwnerName: item.cargoOwnerName,
        portCode: item.portCode,
        portName: item.portName,
        cargoCode: item.cargoCode,
        cargoName: item.cargoName,
        packingCode: item.packingCode,
        packingName: item.packingName,
        tradeType: item.tradeType,
        noticeType: item.noticeType,
        massNamesTargetLabel: item.massNamesTargetLabel,
        massNamesTarget: item.massNamesTarget,
        status: '10',
        beginTime: '',
        endTime: '',
        allPlanCount: res.data.allPlanCount,
        weighCount: res.data.weighCount,
        remainPlanCount: res.data.remainPlanCount
      };
      tableData.value.unshift(newObj);
    } catch (error) {

    }
  }
  trustCargoDrawer.value = false
}
// 保存事件
const saveAll = async () => {
	if (await editTableRef.value.validAllEvent()) {
		let flag = false
		tableData.value.forEach(item => {
			//分段计划量不能大于总计划量
			if (math.numSub(math.numAdd(math.numAdd(item.segPlanTon1, item.segPlanTon2)
            ,math.numAdd(item.segPlanTon3, item.segPlanTon4)), item.planTon) > 0) {
				flag = true
				return
			}
		})
		if (flag) {
      proxy.$modal.msgError('分段计划量不能大于总计划量')
      return
		}
		proxy.$modal.confirm('确定保存？').then(function () {
			const list = tableData.value
			let flag = true
			list.forEach((item, index) => {
				// 计划量必填
				let rowIndex = index + 1
				if (item.planTon != null && item.planTon == null) {
					proxy.$modal.msgWarning('第' + rowIndex + '行计划重量暂未填写')
					flag = false
					return
				}
			})
			if (flag == false) {
				return
			}
			api.listSave(list, searchForm.value.planDate).then(response => {
				getList()
				loading.value = false
				proxy.$modal.msgSuccess(response.msg)
			})
		})
	}
}
// 导入指令
const importTrust = row => {
  trustCargoDrawer.value = true
  nextTick(() => {
    console.log(searchForm.value.planDate)
    api.getTrustCargoDetail(searchForm.value.planDate).then(res =>{
        trustCargoRef.value.tableData = res.data;
        trustCargoRef.value.formData.planDate = searchForm.value.planDate
    })
  })
}
// 审核与撤销审核
const changeCheck = ()=>{
  let data = JSON.parse(JSON.stringify(clickRow.value))
  console.log(checkboxList.value)
    if (checkboxList.value.length == 0) {
      proxy.$modal.msgError('请选择要操作的数据')
      return;
    }
    let tmpId = checkboxList.value.map(item=>{
      return item.id;
    })
    let tempStatus = checkboxList.value.map(item=>{
      return item.status;
    })
    if(tmpId == null || tmpId == ''){
      proxy.$modal.msgError('请先保存数据')
      return;
    }

    if(tempStatus == '20'){
      proxy.$modal
        .confirm('是否撤销审核？')
        .then(() => {
          api.approveRevoke(tmpId).then(res => {
            proxy.$modal.msgSuccess("审核撤销")
            checkboxList.value=[]
            getList();
          })
        })
        .catch(() => {
        })
    }else {
      proxy.$modal
        .confirm('是否审核？')
        .then(() => {
          api.approve(tmpId).then(res => {
            proxy.$modal.msgSuccess("审核成功")
            checkboxList.value=[]
            getList();
          })
        })
        .catch(() => {
        })
    }

}
//批量审核
const checkList = () =>{
  let data = JSON.parse(JSON.stringify(clickRow.value))
  if (checkboxList.value.length == 0) {
    proxy.$modal.msgError('请在左侧选择要操作的数据')
    return;
  }
  /*let tmpList = checkboxList.value.map(item=>{
    return item.id;
  })*/
  let tmpList = checkboxList.value
  let tmpFlag = false
  tmpList.forEach(item=>{
    if(item.id== undefined){
      tmpFlag = true
    }
  })
  if(tmpFlag){
    proxy.$modal.msgError('请先保存数据')
    return
  }

  let statusFlag = false
  let tmpStatus = checkboxList.value[0].status

  checkboxList.value.forEach(o=>{
    if(tmpStatus != o.status){
      statusFlag = true
    }
  })

  if(statusFlag){
    proxy.$modal.msgError('状态不一致')
    return
  }
  if(tmpStatus == '20'){
    proxy.$modal
      .confirm('是否批量撤销审核？')
      .then(() => {
        api.approveListRevoke(tmpList).then(res => {
          proxy.$modal.msgSuccess("审核撤销")
          checkboxList.value=[]
          getList();
        })
      })
      .catch(() => {
      })
  }else {
    proxy.$modal
      .confirm('是否批量审核？')
      .then(() => {
        api.approveList(tmpList).then(res => {
          proxy.$modal.msgSuccess("审核成功")
          checkboxList.value=[]
          getList();
        })
      })
      .catch(() => {
      })
  }

}
// 导入昨日计划
const importTodayPlan = async () => {
  yesterdayPlanDrawer.value = true
  nextTick(() => {
    api.importYesterdayPlan(searchForm.value.planDate).then(res => {
       yesterdayPlanRef.value.tableData = res.data
       yesterdayPlanRef.value.formData.planDate = searchForm.value.planDate
    })
  })
}

const yesterdayPlanSave = async () => {
  if(yesterdayPlanRef.value.formData.checkboxList.value == undefined){
    proxy.$modal.msgError('请选择数据')
    return
  }
  for (const item of yesterdayPlanRef.value.formData.checkboxList.value) {
    let flag = false;
    try {
      const list = tableData.value.map(x=>x.businessNo)
      for(let y of list) {
        if(item.businessNo == y){
          flag = true;
          break
        }
      }
    } catch (error) {

    }
    if(flag == false){
      const res = await api.getCount(item.businessNo);
      let newObj = {
        trustId: item.trustId,
        trustCargoId: item.trustCargoId,
        businessNo: item.businessNo,
        shipvoyageId: item.shipvoyageId,
        shipvoyageItemId: item.shipvoyageItemId,
        shipvoyageName: item.shipvoyageName,
        scn: item.scn,
        cargoOwnerId: item.cargoOwnerId,
        cargoOwnerName: item.cargoOwnerName,
        portCode: item.portCode,
        portName: item.portName,
        cargoCode: item.cargoCode,
        cargoName: item.cargoName,
        packingCode: item.packingCode,
        packingName: item.packingName,
        tradeType: item.tradeType,
        noticeType: item.noticeType,
        massNamesTargetLabel: item.massNamesTargetLabel,
        massNamesTarget: item.massNamesTarget,
        status: '10',
        beginTime: '',
        endTime: '',
        allPlanCount: res.data.allPlanCount,
        weighCount: res.data.weighCount,
        remainPlanCount: res.data.remainPlanCount
      };
      tableData.value.unshift(newObj);
    }
  }
  yesterdayPlanDrawer.value = false
  yesterdayPlanRef.value.formData.checkboxList.value = undefined
}

//下拉框改变事件
const tableChange = (val, rowData, title) => {
  if(title == '班次'){
    rowData.beginTime = ''
    rowData.endTime = ''
    // 18:00-7:00夜班   8:00-18:00白班
    if(val.value == '01'){
     /* rowData.beginTime = getNowDate('YYYY-MM-DD') + ' 08:00'
      rowData.endTime = getNowDate('YYYY-MM-DD') + ' 18:00'
*/
      rowData.beginTime = getBeforeAfter('after', 1, 'YYYY-MM-DD') + ' 08:00'
      rowData.endTime = getBeforeAfter('after', 1, 'YYYY-MM-DD') + ' 18:00'

    } else if(val.value == '02'){
      rowData.beginTime = getNowDate('YYYY-MM-DD') + ' 18:00'
      rowData.endTime = getBeforeAfter('after', 1, 'YYYY-MM-DD') + ' 08:00'
    }
    else if(val.value == '03'){
      rowData.beginTime = getNowDate('YYYY-MM-DD') + ' 18:00'
      rowData.endTime = getBeforeAfter('after', 1, 'YYYY-MM-DD') + ' 18:00'
    }
  }
}

const tableChangeDate = (row, title) => {
  console.log(1111)
  if(!row.classCode){
      proxy.$modal.msgWarning('请先选择班次！');
      return ;
  } else {
    if(row.classCode == '01'){
      // var planDate_ = new Date(searchForm.planDate + ' 8:00');
      var planDate_ = new Date(searchForm.value.planDate + ' 8:00');
      planDate_.setDate(planDate_.getDate() + 1);
      var startTime = Date.parse(planDate_)
      var endTime = startTime + 10 * 60 * 60 * 1000

      if(row.beginTime){
        if(new Date(row.beginTime) > endTime || startTime > new Date(row.beginTime)){
          row.beginTime = ''
          var nextDate = new Date(planDate_);
          var nextDay = nextDate.getFullYear() + '-' + (nextDate.getMonth() + 1) + '-' + nextDate.getDate(); // 格式化下一天的日期
          proxy.$modal.msgWarning('日期范围在' + nextDay + ' 8点 ~ 18点');
        }
      }
      if(row.endTime){
        if(new Date(row.endTime) > endTime || startTime > new Date(row.endTime)){
          row.endTime = ''
          var nextDate = new Date(planDate_);
          var nextDay = nextDate.getFullYear() + '-' + (nextDate.getMonth() + 1) + '-' + nextDate.getDate(); // 格式化下一天的日期
          proxy.$modal.msgWarning('日期范围在' + nextDay + ' 8点 ~ 18点');
        }
      }
    } else if(row.classCode == '02'){
      var planDate_ = new Date(searchForm.value.planDate + ' 18:00');
      var startTime = Date.parse(planDate_)
      var endTime = startTime + 14 * 60 * 60 * 1000

      if(row.beginTime){
        if(new Date(row.beginTime) > endTime || startTime > new Date(row.beginTime)){
          row.beginTime = ''
          proxy.$modal.msgWarning('日期范围在' + searchForm.value.planDate + ' 18点 ~ 第二天 8点');
        }
      }
      if(row.endTime){
        if(new Date(row.endTime) > endTime || startTime > new Date(row.endTime)){
          row.endTime = ''
          proxy.$modal.msgWarning('日期范围在' + searchForm.value.planDate + ' 18点 ~ 第二天 8点');
        }
      }
    } else if(row.classCode == '03'){
      var planDate_ = new Date(searchForm.value.planDate + ' 18:00');
      var startTime = Date.parse(planDate_)
      var endTime = startTime + 24 * 60 * 60 * 1000

      if(row.beginTime){
        if(new Date(row.beginTime) > endTime || startTime > new Date(row.beginTime)){
          row.beginTime = ''
          proxy.$modal.msgWarning('日期范围在' + searchForm.value.planDate + ' 18点 ~ 第二天 18点');
        }
      }
      if(row.endTime){
        if(new Date(row.endTime) > endTime || startTime > new Date(row.endTime)){
          row.endTime = ''
          proxy.$modal.msgWarning('日期范围在' + searchForm.value.planDate + ' 18点 ~ 第二天 18点');
        }
      }
      if(row.beginTime!=null && row.endTime!=null){
        var beginDateTime = new Date(row.beginTime);
        var endDateTime = new Date(row.endTime);
        if (beginDateTime >= endDateTime) {
          row.beginTime = ''
          row.endTime = ''
          proxy.$modal.msgWarning('计划结束时间应大于计划开始时间');
        }
      }
    }
  }
}
const exportPlan = () => {
  proxy.$modal.confirm('是否确定导出？').then(() => {
    api.exportPlan(searchForm.value.planDate).then(res => {
      downLoadBlob(res,searchForm.value.planDate+'件散货计划')
    })
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
//初始化函数
const init = () => {
	searchForm.value.planDate = getNowDate('YYYY-MM-DD')
	getList()
  searchForm.value.endDate = '今天 1800 ~ 明天 1800';
}
init()
</script>
<style lang="scss" scoped>
:deep(.el-form--inline .el-form-item) {
	margin-right: 12px;
	width: 320px !important;
}
.newDateStyle {
	width: 100%;
	height: 32px;
	line-height: 28px;
	padding-left: 10px;
	border-radius: 4px;
	border: 1px solid #dcdfe6;
	box-shadow: none;
	font-size: 13px;
	color: #606266;
	font-family: Arial;
	display: inline-block;
	padding-right: 52%;
}
.newDateStyle:focus {
	outline: none;
	border: 1px solid #1890ff;
}
</style>
