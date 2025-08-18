<!--客户预缴 23/12/08在用-->
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
      :loading="loading"
      :total="total"
    />
    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="drawerVisible" :title="title" size="40%">
      <detail ref="detailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button v-if='editOrAdd' type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <!--交易流水组件 -->
    <el-drawer v-model="tradeDetailVisible" title="账户流水" size="85%">
      <DrawerDetail ref="drawerDetailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="tradeDetailVisible = false">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title=dialogTitle
    width="30%"
  >
    <el-form :model="formDataDo" ref="ruleForm" label-width="80px" :rules="rules">
      <el-form-item label="作废原因" prop="voidRemark">
        <el-input  maxlength="200"
                   show-word-limit
                   type="textarea"
                   rows="5"
                   v-model="formDataDo.voidRemark"  placeholder="请输入作废原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="voidClose">关闭</el-button>
        <el-button type="primary" @click="handelDel"> 处理 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="customerPrepayment">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/finance/customerPrepayment/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import DrawerDetail from '@/views/finance/customerPrepayment/drawer/index.vue'
import { getNowDate } from '@/utils'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const drawerDetailRef = ref(null)
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const tradeDetailVisible = ref(false) //弹出框组件显示隐藏
const editOrAdd =ref(false) // 是否显示保存按钮ss
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
})
const formDataDo = reactive({
  id:'',
  voidRemark:'',//作废说明
  status:'',
  prepaymentCode:''
})
const voidClose = () => {
  dialogVisible.value = false
  formDataDo.voidRemark=''
}
const rules = reactive({
  voidRemark: [{ required: true, message: '请输入作废原因', trigger: 'blur' }],
})
const ruleForm = ref()
const dialogVisible = ref(false)
const searchForm = reactive({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'prepaymentCode', label: '预缴编号',width:110,},
  { prop: 'trustNo', label: '作业通知单编号',width:150},
  { prop: 'prepayModeName', label: '预缴方式',width:150},
  { label: '船名航次', prop: 'shipVoyageName', width: 150, },
  { prop: 'companyName', label: '公司名称',width:220,},
  { prop: 'customerName', label: '客户名称',width:220,},
  { prop: 'prepaymentTypeName', label: '预缴类型',width:100,},
  { prop: 'prepaymentTime', label: '预缴日期',width: 110},
  { prop: 'prepaymentAmount', label: '预缴金额',width: 120,isThousandth:'true',align: 'right'},
  { prop: 'utilizedAmount', label: '已用金额',width: 120,isThousandth:'true'},
  { prop: 'residualAmount', label: '可用金额',width: 120,isThousandth:'true'},
  // { prop: 'residualAmount', label: '预缴金额',width: 120,isThousandth:'true',align: 'right'},
  { prop: 'paymentMethodName', label: '付款方式',width:100 },
  { prop: 'createByName', label: '创建人',width: 100 },
  { prop: 'createTime', label: '创建时间' ,width: 155},
  { prop: 'updateByName', label: '上次更新人' ,width: 155},
  { prop: 'updateTime', label: '上次更新时间' ,width: 155},
  { prop: 'voidByName', label: '作废人',width: 100 },
  { prop: 'voidTime', label: '作废时间',width: 155 },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? '' : 'info',
          },
          {
            default: () => (row.status == '1' ? '正常' : '作废'),
          }
        ),
      ]
    },
  },

  {
    prop: '',
    label: '操作',
    width: 150,
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
            permission: 'finance:customerPrepayment:check', // 权限
          },
          {
            default: () => '查看',
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              handel(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            permission: 'finance:customerPrepayment:handle', // 权限
          },
          {
            default: () => '作废',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '公司名称',
    type: 'select',
    modelValue: 'companyId',
    span: 8,
    dataConfig: { params: {type: 'DEPT_WORK_COMPANY'} },
  },
  {
    name: '客户名称',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_PASS',
  },
  {
    name: '预缴类型',
    type: 'select',
    modelValue: 'prepaymentTypeCode',
    span: 8,
    dataConfig: { params: { type: 'DICT', dictType: 'PREPAYMENT_TYPE' } },
  },
  {
    name: '预缴编码', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'prepaymentCode', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 3, // 占位，共24
    selectData: [
      { label: '正常', value: '1' },
      { label: '作废', value: '2' },
    ],
  },
  {
    name: '起始时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'startTime', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '截止时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'endTime', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '通知单号',
    type: 'input',
    modelValue: 'trustNo',
    span: 3,
  },
  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 3,
    dataType: 'VOYAGE',
  },
])
const buttonList = reactive([
  {
    label: '新增', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => add, // 回调函数
    permission: 'finance:customerPrepayment:add', // 权限
  }
])
const drawerVisible = ref(false)


const clickRow = ref({})

// 点击查询的事件
const getList = e => {
  // queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value =e
  loading.value = true
  api.getList(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
    loading.value = false
  })
}

// 新增事件
const add = () => {
  title.value = '新增'
  drawerVisible.value = true
  editOrAdd.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.id = ''  // 新建清空id
    detailRef.value.formData.editOrAdd = false  // 新建清空id
    proxy.$bus.emit('resetFileList')
  })
}

// 编辑事件
const edit = row => {
  title.value = '查看'
  editOrAdd.value = false;
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  drawerVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    api.getDetail(editRow.id).then(res => {
      const resData = JSON.parse(JSON.stringify(res.data))
      proxy.setFormData(detailRef.value.formData, resData)
      detailRef.value.formData.prePayId = resData.sourcePrepayCode
      detailRef.value.formData.trustNo = resData.trustLabel
      if(resData.bankName!=null&&resData.bankName!=''){
        detailRef.value.formData.bankType = resData.bankName+"("+resData.bankId+")";
        detailRef.value.formData.bankTypeShow = true;
      }else {
        detailRef.value.formData.bankTypeShow = false;

      }
    })
    detailRef.value.formData.editOrAdd = true  // 新建清空id
  })
}
/*// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.deleteById(deleteRow.id).then(res => {
				getList(queryParams.value)
				proxy.$modal.msgSuccess('删除成功')
			})
		})
		.catch(() => {})
}*/
// 保存事件
const save = async () => {
  if (await detailRef.value.validate()) {
    const params = {
      ...detailRef.value.formData,
    }
    if(params.prepayModeCode == '20' && (params.busTrustId ==''||params.busTrustId ==null||params.busTrustId===undefined)){
      proxy.$message.error("请选择通知单！")
      return;
    }
    if(params.prepayModeCode == '20' && (params.prePayCode ==''||params.prePayCode ==null||params.prePayCode===undefined)){
      proxy.$message.error("请选择预缴编号！")
      return;
    }
    if(params.prepayModeCode == '10' && (params.paymentMethodCode ==''||params.paymentMethodCode ==null||params.paymentMethodCode===undefined)){
      proxy.$message.error("请选择付款方式！")
      return;
    }
    proxy.$modal.confirm('确定保存？').then(() => {
      api.insert(params).then(res => {
        proxy.$modal.msgSuccess('新增成功')
        drawerVisible.value = false
        getList(queryParams.value)
        editOrAdd.value = false;
      })

    })
  }
}

// 处理事件
const handel = row => {

  if(row.status==2){
    proxy.$message.error("已作废！！")
    return
  }
  dialogVisible.value=true
  formDataDo.id=row.id
  formDataDo.prepaymentCode = row.prepaymentCode
}
const handelDel =async  () => {
  if (await ruleForm.value.validate()) {
    //进行保存
    nextTick(() => {
      api.updateStatus(formDataDo)
        .then(res => {
          nextTick(() => {
            dialogVisible.value =false
            getList(queryParams.value)
            proxy.$modal.msgSuccess(res.msg)
            formDataDo.voidRemark=''
          })
        })
        .catch(err => {
        })
    })
  }
}
/*const timeForm = ref({
  beginDate: '',
  endDate: '',
})*/
const checkTrade = () => {
  tradeDetailVisible.value = true
  api.getTradeList({beginDate:getNowDate('YYYY-MM-DD')}).then(res => {
    nextTick(() => {
      drawerDetailRef.value.setTableData(res.Z2)
    })
  })
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
/*const init = () => {
  timeForm.beginDate = getNowDate('YYYY-MM-DD')
  timeForm.endDate = getNowDate('YYYY-MM-DD')
}
init()*/
getList(queryParams.value)
</script>
<style lang="scss" scoped>
.box {
  display: flex;
  justify-content: space-between;

  .left {
    width: 254px;
    height: calc(100vh - 85px);
    display: inline-block;
    white-space: nowrap;
    position: relative;
    transition: all 0.3s;

    &.close {
      width: 0px;

      .content {
        display: none;
      }
    }

    .content {
      overflow-x: hidden;
      height: 100%;

      .left-top {
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        font-size: 14px;
      }

      .shipData {
        width: 100%;
        height: 150px;
        margin-top: 10px;
      }

      .panel {
        width: 100%;
        height: 200px;
      }

      .step {
        height: calc(100vh - 557px);
        padding: 20px;
        box-sizing: border-box;
        margin-top: 14px;

        :deep(.el-timeline-item) {
          left: 50px;

          :deep(.el-timeline-item__wrapper) {
            height: 43px;
          }
        }

        :deep(.el-timeline-item__content) {
          position: relative;
          top: -1px;
          left: -160px;
          text-align: center;
        }

        :deep(.el-timeline-item__timestamp) {
          position: relative;
          top: -25px;
          left: 0px;
        }
      }
    }

    .fold-wrap {
      position: absolute;
      top: 0;
      right: -16px;
      width: 16px;
      height: 100%;
      display: inline-block;
    }

    .btn-fold {
      font-size: 12px;
      background-color: #f5f7fa;
      width: 16px;
      padding: 15px 0;
      position: absolute;
      top: 50%;
      right: 0px;
      transform: translateY(-50%);
      cursor: pointer;
      overflow: hidden;
      opacity: 0.8;
    }

    .btn-fold:hover {
      opacity: 1;
      // transform:scale(1.2);//设置缩放比例
      // transform: translateX(10%);
    }
  }

  .right {
    width: calc(100% - 270px);
    height: 100%;
  }

  .close + .right {
    width: calc(100% - 20px);
  }
}

:deep(.el-tabs__header) {
  margin: 0 0 0;
}
</style>
