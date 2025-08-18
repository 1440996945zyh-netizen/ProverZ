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
      :total="total"
    />
  </div>
  <el-dialog v-model="cancelVisible" title="不通过原因" width="30%">
    <el-form :model="cancelData" ref="cancelForm">
      <el-form-item
        label="不通过原因"
        prop="failReason"
        :rules="[
						{
							required: true,
							message: '请输入',
							trigger: 'blur',
						},
					]"
      >
        <el-input type="textarea" v-model="cancelData.failReason"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
				<span class="dialog-footer">
					<el-button @click="cancelVisible = false">取消</el-button>
					<el-button type="primary" @click="saveCancel">保存</el-button>
				</span>
    </template>
  </el-dialog>

  <el-dialog v-model="anchorVisible" title="起锚" width="30%">
    <el-form :model="anchorData" ref="anchorForm">
      <el-form-item
        label="起锚时间"
        prop="leaveAnchTime"
        :rules="[
						{
							required: true,
							message: '请输入',
							trigger: 'blur',
						},
					]"
      >
        <el-date-picker v-model="anchorData.leaveAnchTime" type="datetime" placeholder="选择起锚时间"
                        value-format="YYYY-MM-DD HH:mm:ss" :clearable="false"/>

      </el-form-item>
    </el-form>
    <template #footer>
				<span class="dialog-footer">
					<el-button @click="anchorVisible = false">取消</el-button>
					<el-button type="primary" @click="saveAnchor">保存</el-button>
				</span>
    </template>
  </el-dialog>
</template>

<script setup name="anchorAduit">
import BaseTable from '@/components/BaseTable/index.vue'

import api from '@/api/dispatch/anchorAduit/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { getNowDate } from '@/utils'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const total = ref('') // 数据总数
const title = ref('') // 数据总数
const queryParams = ref({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  {
    label: '在锚状态',
    prop: 'status',
    align: 'center',
    width: 120,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == 1 ? 'success' : (row.status === 0 && row.anchTime === null) ? 'info' : '',
          },
          {
            default: () => (row.status === 1?'已离': (row.status === 0 && row.anchTime === null) ? '未抵':'在锚'),
          }
        ),
      ]
    },
  },
  { label: '船名', prop: 'shipName',align: "center" ,width: 120},
  { label: 'mmsi', prop: 'mmsi' ,align: "center",width: 90},
  { label: '锚地名称', prop: 'anchName' ,align: "center",width: 100},
  { label: '锚位', prop: 'position', align: 'right' ,width:90},
  { label: '船舶吃水', prop: 'draft',align: "center",width: 100},
  // {
  //   label: '本港船',
  //   prop: 'thisPort',
  //   align: 'center',
  //   width: 'status',
  //   render: row => {
  //     return [
  //       h(
  //         ElTag,
  //         {
  //           type: row.status == '1' ? '' : 'info',
  //         },
  //         {
  //           default: () => (row.thisPort === 0 ? '本港船' : '过境船'),
  //         }
  //       ),
  //     ]
  //   },
  // },
  {
    label: '空重载',
    prop: 'isEmpty',
    align: 'center',
    width: 'status',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? '' : 'info',
          },
          {
            default: () => (row.isEmpty === 0 ? '重载' : '空载'),
          }
        ),
      ]
    },
  },
  { label: '联系人', prop: 'contacts',align: "center",width: 100},
  { label: '联系电话', prop: 'contactNum',align: "center",width: 120},
  { label: '预计抵锚', prop: 'preAnchTime',align: "center",width: 160},
  { label: '预计起锚', prop: 'preLeaveAnchTime',align: "center",width: 160},
  { label: '实际抵锚', prop: 'anchTime',align: "center",width: 160},
  { label: '实际起锚', prop: 'leaveAnchTime',align: "center",width: 160},
  {
    label: '危险品船',
    prop: 'isDanger',
    align: 'center',
    width: 120,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? '' : 'info',
          },
          {
            default: () => (row.isDanger === 0 ? '否' : '是'),
          }
        ),
      ]
    },
  },
  // { label: '锚泊原因', prop: 'anchReason',align: "center",width: 100},
  {
    label: '审核状态',
    prop: 'auditStatus',
    align: 'center',
    width: 120,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.auditStatus == 1 ? 'success' : row.auditStatus == 0 ? 'info' : 'danger',
          },
          {
            default: () => (row.auditStatus === 0 || row.auditStatus ===null ? '待审' : row.auditStatus === 1 ? '通过' : '不通过'),
          }
        ),
      ]
    },
  },
  { label: '不通过原因', prop: 'failReason',align: "center",width: 150},
  { label: '备注', prop: 'remark',align: "center",width: 100},
  {
    prop: '',
    label: '操作',
    fixed: 'right',
    width: 150,
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handlePass(row)
            },
            type: 'primary',
            style: { display: row.auditStatus === 0 || row.auditStatus ===null ? 'inline-block' : 'none'},
            link: true,
            icon: 'Check',
            permission:'dispatch:anchorAduit:verify',
          },
          {
            default: () => '通过',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              handleUnPass(row)
            },
            type: 'danger',
            style: { display: row.auditStatus === 0 || row.auditStatus ===null ? 'inline-block' : 'none'},
            link: true,
            icon: 'Close',
            permission:'dispatch:anchorAduit:verify',
          },
          {
            default: () => '不通过',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '中文船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: 'mmsi', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'mmsi', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '审核状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'auditStatus', // 绑定字段
    span: 8, // 占位，共24
    selectData: [
      {
        value: '0',
        label: '待审',
      },
      {
        value: '1',
        label: '通过',
      },
      {
        value: '2',
        label: '不通过',
      },
    ],
  },
])

const buttonList = reactive([
  {
    label: '起锚', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => anchor, // 回调函数
    permission: 'dispatch:anchorAduit:add', // 权限
  },
])
const berthVisible = ref(false)
const drawerVisible = ref(false)

const clickRow = ref(null)
// 点击查询的事件
const getList = e => {
  queryParams.value = e
  api.getAnchApplyList(e).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}

// 起锚事件
const anchorVisible = ref(false)
const anchorForm = ref()
const anchorData = reactive({
  leaveAnchTime: '',
})

// 打开起锚dialog
const anchor = () => {
  if(clickRow.value != null){
    console.log(clickRow.value)
    anchorVisible.value = true
    anchorData.leaveAnchTime = getNowDate('YYYY-MM-DD hh:mm:ss')
  }else{
    proxy.$modal.msgWarning('请选择一条信息！')
  }

}

// 起锚保存事件
const saveAnchor = () => {
  const anchorRow =  clickRow.value
  anchorForm.value.validate((valid, fields) => {
    if(valid) {
      proxy.$modal
        .confirm('确定保存？')
        .then(res => {
          api.updateLeaveAnchTime({"id": anchorRow.id, "leaveAnchTime":anchorData.leaveAnchTime}).then(res => {
            if (res.code == '0000') {
              proxy.$modal.msgSuccess(res.msg)
              getList(queryParams.value)
              anchorVisible.value = false
            } else {
              proxy.$modal.msgError(res.msg)
              anchorVisible.value = false
            }
          })
        })
        .catch(err => {
        })
    }
  })

}


// 不通过事件
const cancelVisible = ref(false)
const cancelForm = ref()
const cancelData = reactive({
  failReason: '',
})

// 打开不通过dialog
const handleUnPass = () => {
  cancelVisible.value = true
  cancelData.failReason = ''
}
// 审核不通过事件
const saveCancel = () => {
  const unpassRow =  clickRow.value
  cancelForm.value.validate((valid, fields) => {
    if(valid) {
      proxy.$modal
        .confirm('确定审核不通过？')
        .then(res => {
          api.verifyAnchApply({"id": unpassRow.id, "auditStatus": 2,"failReason":cancelData.failReason}).then(res => {
            if (res.code == '0000') {
              proxy.$modal.msgSuccess(res.msg)
              getList(queryParams.value)
              cancelVisible.value = false
            } else {
              proxy.$modal.msgError(res.msg)
              cancelVisible.value = false
            }
          })
        })
        .catch(err => {
        })
    }
  })

}

// 审核通过事件
const handlePass = row => {
  const passRow = row || clickRow.value
  proxy.$modal
    .confirm('确定审核通过？')
    .then(res => {
      api.verifyAnchApply({"id":passRow.id,"auditStatus":1}).then(res => {
        if (res.code == '0000') {
          proxy.$modal.msgSuccess(res.msg)
          getList(queryParams.value)
        } else {
          proxy.$modal.msgError(res.msg)
        }
      })
    })
    .catch(err => {})
}
/*// 审核不通过事件
const handleUnPass = row => {
  const unpassRow = row || clickRow.value
  proxy.$modal
    .confirm('确定审核不通过？')
    .then(res => {
      api.verifyAnchApply({"id":unpassRow.id,"auditStatus":2}).then(res => {
        if (res.code == '0000') {
          proxy.$modal.msgSuccess(res.msg)
          getList(queryParams.value)
        } else {
          proxy.$modal.msgError(res.msg)
        }
      })
    })
    .catch(err => {})
}*/
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
getList(queryParams.value)
</script>
