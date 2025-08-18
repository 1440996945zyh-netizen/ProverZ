<template>
  <!-- 海关放行单管理 -->
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
    <!-- 新增抽屉组件 -->
    <el-drawer v-model="ticketVisibleFHKS" :title="title" size="60%">
      <drawerFHKS ref="drawerRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="ticketVisibleFHKS = false">取消</el-button>
          <el-button type="primary" v-if="saveShow" @click="doSaveFhks">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer v-model="ticketVisibleJKSH" :title="title" size="60%">
      <drawerJKSH ref="drawerRefJKSH" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="ticketVisibleJKSH = false">取消</el-button>
          <el-button type="primary" v-if="saveShow" @click="doSave">保存</el-button>
        </div>
      </template>
    </el-drawer>



  </div>
</template>

<script setup name="khglInfo">
  import BaseTable from '@/components/BaseTable/index.vue'
  import {
    parseDate
  } from '@/utils'
  import drawerFHKS from  './drawer/fhks.vue'
  import drawerJKSH from  './drawer/jksh.vue'
  import { ref, reactive, toRefs } from 'vue'
  import { ElButton, ElTag } from 'element-plus'
  const { proxy } = getCurrentInstance()
  const ticketVisibleFHKS = ref(false) //分货控数
  const ticketVisibleJKSH = ref(false) //新增修改抽屉（出口）
  const total = ref(0)
  const title = ref('')
  const drawerRef = ref(null) // 明细组件ref
  const drawerRefJKSH = ref(null) // 明细组件ref
  const saveShow = ref(true) //票货保存按钮显示隐藏
  const updateShow = ref(true) //票货修改按钮显示隐藏
  const data = reactive({
    transferRow: {},
  })
  const clickRow = ref({}) //点击当前行
  const { transferRow } = toRefs(data)
  // const dialogShow=ref(false)//弹出框组件显示隐藏
  const queryParams = ref({
    startPage: 1,
    pageSize: 10,
  })
  // 表格数据
  const tableData = ref([])
  const tableColumns = ref([
    // {prop: 'hth', label: '合同号', width: 150, fixed: 'left'},
    // {prop: 'zygs', label: '作业公司', width: 100, fixed: 'left'},
    {prop: 'zhwchm', label: '船名', width: 80, fixed: 'left'},
    {prop: 'zywtr', label: '作业委托人', width: 150, fixed: 'left'},
    {prop: 'hqcyr', label: '海关放行人', width: 150, fixed: 'left'},
    {prop: 'cargokeyshl', label: '数量', width: 100},
    {prop: 'tgs', label: '通关数', width: 100},
    {prop: 'kfs', label: '可发数', width: 100},
    {prop: 'xds', label: '下达数', width: 100},
    {prop: 'sys', label: '剩余数', width: 100},
    {prop: 'hwmch', label: '货名', width: 100},
    {prop: 'flag', label: '是否归档', width: 110, fixed: 'right',
      render: row => {
        return [
          h(
            ElTag,
            {
              type: row.flag == '是' ? '' : 'info',
            },
            {
              default: () => (row.flag == '是' ? '是' : '否'),
            }
          ),
        ]
      },},
    // {prop: 'hz', label: '业务联系单位', width: 150},
    // {prop: 'gjfkh', label: '控货（港建费）', width: 150},
    {prop: 'cargokeyType', label: '货物来源', width: 100},
    {prop: 'dgrqS', label: '最初集港时间', width: 130},
    {prop: 'dgrqE', label: '最终集港时间', width: 130},
    {prop: 'cargoOri', label: '集港方式', width: 100},
    {
      prop: '',
      label: '操作',
      width: 240,
      align: 'center',
      fixed: 'right',
      render: row => {
        return [
          h(
            ElButton,
            {
              onClick: () => {
                gd(row)
              },
              type: 'success',
              link: true,
              icon: 'CircleCheck',
              //	permission: 'business:cargoInfo:update', // 权限
            },
            {
              default: () =>(row.flag == '是' ? '取消归档' : '归档'),
            }
          ),
          h(
            ElButton,
            {
              onClick: () => {
                if(row.flag == '是' ){
                  proxy.$modal.msgError('已归档不允许加扣数')
                }else{
                  openJiaKou(row)
                }

              },
              type: 'primary',
              link: true,
              icon: 'Edit',
              // permission: 'business:contract:delete', // 权限
            },
            { default: () => '加扣数' }
          ),
          h(
            ElButton,
            {
              onClick: () => {
                if(row.flag == '是' ){
                  proxy.$modal.msgError('已归档不允许分货控数')
                }else{
                  fhks(row)
                }

              },
              type: 'primary',
              link: true,
              icon: 'Edit',
              // permission: 'business:contract:delete', // 权限
            },
            { default: () => '分货控数' }
          ),
        ]
      },
    },
  ])
  const selectData = reactive([
    {
      name: '集港开始日期',
      type: 'date', //远程下拉框
      modelValue: 'dgrqEStartTime', //对应字段
      span: 3,//占位24

    },
    {
      name: '集港结束日期',
      type: 'date', //远程下拉框
      modelValue: 'dgrqEEndTime', //对应字段
      span: 3,
    },
    // {
    //   name: '作业公司',
    //   type: 'select', //下拉框，字典
    //   modelValue: 'zygsdm', //对应字段
    //   span: 3,
    //   dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
    // },
    {
      name: '作业委托人',
      type: 'input', //远程下拉框
      modelValue: 'zywtr', //对应字段
      span: 3
    },
    {
      name: '合同号',
      type: 'input', //远程下拉框
      modelValue: 'hth', //对应字段
      span: 3
    },
    {
      name: '中文船名',
      type: 'input', //远程下拉框
      modelValue: 'zhwchm', //对应字段
      span: 3
    },
    {
      name: '海关放行人',
      type: 'input', //远程下拉框
      modelValue: 'hqcyr', //对应字段
      span: 3
    },
    {
      name: '货主',
      type: 'input', //远程下拉框
      modelValue: 'hz', //对应字段
      span: 3
    },
    {
      name: '货名',
      type: 'input', //远程下拉框
      modelValue: 'hwmch', //对应字段
      span: 3
    },
    {
      name: '状态',
      type: 'select', //下拉框
      modelValue: 'flag', //对应字段
      span: 3,
      selectData: [
        { label: '未归档', value: '未归档' },
        { label: '已归档', value: '已归档' },
        { label: '全部', value: '' },
      ],
    },
  ])
  const buttonList = reactive([
  ])

  // 获取点击行数据
  const cellClickEvent = ({ row }) => {
    clickRow.value = row
  }
  // 点击查询的事件
  const getList = e => {
    // queryParams.value = Object.assign(e, queryParams.value)//把queryParams.value复制给e,queryParams.value==e
    queryParams.value = e
    proxy.$request({
      url: '/khgl/getCargoInfoListPage',
      method: 'post',
      data: queryParams.value
    }).then(res => {
      if (res.code === '0000') {
        tableData.value = res.data.pages
        total.value = res.data.totalNum
      }
    })
  }
  // 归档
    const gd = (rowData) => {
    if (rowData.flag === '是') {
        proxy.$modal.confirm('确定取消归档？').then(() => {
          proxy.$request({
          url: `/khgl/gd?cargokey=${rowData.cargokey}`,
          method: 'post'
        }).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('取消归档成功')
            getList(queryParams.value)
          }
        })
      });
    } else {
      if (rowData.sys != '0') {
          proxy.$modal.confirm('剩余量不为0，确定归档?').then(() => {
            proxy.$request({
            url: `/khgl/gd?cargokey=${rowData.cargokey}`,
            method: 'post'
          }).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('归档成功')
              getList(queryParams.value);
            }
          })
        });
      } else {
        proxy.$modal.confirm('确定归档?').then(() => {
          proxy.$request({
            url: `/khgl/gd?cargokey=${rowData.cargokey}`,
            method: 'post'
          }).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('归档成功')
              getList(queryParams.value);
            }
          })
        });
      }
    }
  }
  // 编辑事件
  const fhks = row => {
    const editRow = row || clickRow.value // 拿到所编辑行的数据
    proxy.$request({
      url:`/khgl/qryFHKS?cargokey=${editRow.cargokey}`,
      method: 'get'
    }).then(res => {
      if (res.code === '0000') {
        title.value = '分货控数页面'
        ticketVisibleFHKS.value = true
        saveShow.value = true
        nextTick(() => {
          console.log(drawerRef)
          drawerRef.value.resetForm() // 清空事件
          proxy.setFormData(drawerRef.value.formData, res.data)
        })
      }
    })
  }
  //分货控数保存
  const doSaveFhks = async() => {
    if (await drawerRef.value.validate()) {
      console.log('保存', drawerRef.value.formData)
      const  params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
      proxy.$modal.confirm('确定保存吗？').then(() => {
        console.log('点击保存', params)
        proxy.$request({
          url: '/khgl/saveOrUpdateFhks',
          method: 'POST',
          data: params
        }).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess("保存成功")
            ticketVisibleFHKS.value = false
            getList(queryParams.value)
          }
        })
      })
    }
  }
  // 加扣数
  const openJiaKou = row => {
    const editRow = row || clickRow.value // 拿到所编辑行的数据
    title.value = '加扣数信息'
    ticketVisibleJKSH.value = true
    saveShow.value = true
    nextTick(() => {
     drawerRefJKSH.value.resetForm() // 清空事件
      proxy.setFormData(drawerRefJKSH.value.formData, editRow)
      drawerRefJKSH.value.init() // 调用查询
    })
  }
  // 加扣数保存
  const doSave = async() => {
    if (await drawerRefJKSH.value.validate()) {
      const  params = JSON.parse(JSON.stringify(drawerRefJKSH.value.jiaKouForm)) // 取到子组件的formData
      params.cargokey = clickRow.value.cargokey
      proxy.$modal.confirm('确定保存？').then(() => {
        console.log('点击保存', params)
        proxy.$request({
          url: '/khgl/updateJKS',
          method: 'POST',
          data: params
        }).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('保存成功')
            ticketVisibleJKSH.value = false
            getList(queryParams.value)
          }
        })
      })
    }
  }
  // 获取默认当前时间班次
  const getCurrentShiftClassInfo = async () => {
    var date = new Date();
    var datenex = date.getTime() + 1000 * 60 * 60 * 24;
    const end = new Date(datenex);
    // 获取今年第一天
    var date1 = new Date();
    date1.setDate(1);
    date1.setMonth(0);
    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        dgrqEStartTime:parseDate(date1, '{yyyy}-{mm}-{dd}'),
        dgrqEEndTime: parseDate(end, '{yyyy}-{mm}-{dd}')
      })
    })
    queryParams.value.dgrqEStartTime = parseDate(date1, '{yyyy}-{mm}-{dd}');
    queryParams.value.dgrqEEndTime = parseDate(end, '{yyyy}-{mm}-{dd}');
  }

  const getListFirst = async () => {
    await getCurrentShiftClassInfo().then(
      getList(queryParams.value)
    )
  }

  /** 初始化数据 */
  getListFirst()
</script>
<style lang="less" scoped>
  // @import "../../../assets/styles/searchform.scss";
</style>

