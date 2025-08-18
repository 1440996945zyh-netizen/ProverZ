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
		<el-drawer v-model="ticketVisibleJK" :title="title" size="60%">
			<drawerJK ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="ticketVisibleJK = false">取消</el-button>
					<el-button type="primary" v-if="saveShow" @click="saveJK">保存</el-button>
          <el-button type="primary" v-if="updateShow" @click="doUpdateJK">修改</el-button>
				</div>
			</template>
		</el-drawer>

    <el-drawer v-model="ticketVisibleCK" :title="title" size="60%">
      <drawerCK ref="drawerRefCK" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="ticketVisibleCK = false">取消</el-button>
          <el-button type="primary" v-if="saveShow" @click="saveCK">保存</el-button>
          <el-button type="primary" v-if="updateShow" @click="doUpdateCK">修改</el-button>
        </div>
      </template>
    </el-drawer>



	</div>
</template>

<script setup name="hgPermit">
import BaseTable from '@/components/BaseTable/index.vue'
import {
  parseDate
} from '@/utils'
import drawerJK from './drawer/indexJK.vue'
import drawerCK from './drawer/indexCK.vue'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const ticketVisibleJK = ref(false) //新增修改抽屉（进口）
const ticketVisibleCK = ref(false) //新增修改抽屉（出口）
const transferVisible = ref(false) //货权转移抽屉
const transferListVisible = ref(false) //货转查询列表
const ids = ref([])
const total = ref(0)
const title = ref('新增海关放行单—进口')
const transferTitle = ref('货权转移')
const transferListTitle = ref('货转查询')
const drawerRef = ref(null) // 明细组件ref
const drawerRefCK = ref(null) // 明细组件ref
const transferRef = ref(null) //票货转移组件ref
const transferListRef = ref(null) //货转查询列表组件ref
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
  startTm:'',
  endTm:''
})
const updataId = ref(null)
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '序号', prop: 'xh', width: 80 },
	{ label: '类别', prop: 'lb', width: 80,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.lb == '进口' ? '' : 'info',
          },
          {
            default: () => (row.lb == '进口' ? '进口' : '出口'),
          }
        ),
      ]
    },},
	// { label: '作业公司', prop: 'zygsmch', width: 110, },
	{ label: '中文船名', prop: 'zhwchm', width: 100 },
  // { label: '英文船名', prop: 'ywchm', width: 100 },
  { label: '海关放行人', prop: 'hqcyr', width: 250 },
  { label: '货物名称', prop: 'hwmchXl', width: 110 },
  { label: '重量', prop: 'zhl', width: 110 },
  { label: '放行数量', prop: 'fxshl', width: 110 },
  { label: '控货件数', prop: 'khjsh', width: 110 },
  { label: '控货方式', prop: 'khfs', width: 110 },
  { label: '到港日期', prop: 'dgrq', width: 150 },
  { label: '放行日期', prop: 'fxrq', width: 150 },
  { label: '备注', prop: 'note', width: 100 },
  { label: '报关单号', prop: 'bgdh', width: 110 },
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							//console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
					//	permission: 'business:cargoInfo:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              deleteRow(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
            // permission: 'business:contract:delete', // 权限
          },
          { default: () => '删除' }
        ),
			]
		},
	},
])
const selectData = reactive([
  {
    name: '集港开始日期',
    type: 'date', //远程下拉框
    modelValue: 'startTm', //对应字段
    span: 4,//占位24

  },
  {
    name: '集港结束日期',
    type: 'date', //远程下拉框
    modelValue: 'endTm', //对应字段
    span: 4,
  },
  // {
  //   name: '作业公司',
  //   type: 'select', //下拉框，字典
  //   modelValue: 'zygsdm', //对应字段
  //   span: 4,
  //   dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  // },
  {
    name: '中文船名',
    type: 'input', //远程下拉框
    modelValue: 'zhwchm', //对应字段
    span: 4
  },
  {
    name: '货物名称',
    type: 'input', //远程下拉框
    modelValue: 'hwmchXl', //对应字段
    span: 4
  },
  {
    name: '报关单号',
    type: 'input', //远程下拉框
    modelValue: 'bgdh', //对应字段
    span: 4,
  },
  {
    name: '序号',
    type: 'input', //远程下拉框
    modelValue: 'xh', //对应字段
    span: 4,
  },
  {
    name: '类别',
    type: 'select', //下拉框
    modelValue: 'lb', //对应字段
    span: 4,
    selectData: [
      { label: '进口', value: '进口' },
      { label: '出口', value: '出口' },
    ],
  },
])
const buttonList = reactive([
	{
		label: '进口', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addJK, // 回调函数
		permission: 'business:hgPermit:add', // 权限
	},
  {
    label: '出口', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => addCK, // 回调函数
    permission: 'business:hgPermit:add', // 权限
  },
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
    url: '/hgfx/getHgfxListPage',
    method: 'post',
    data: queryParams.value
  }).then(res => {
    if (res.code === '0000') {
      tableData.value = res.data.pages
      total.value = res.data.totalNum
    }
  })
}

// 新增票货(进口)
const addJK = () => {
  ticketVisibleJK.value = true
  saveShow.value = true
  updateShow.value = false
  title.value = '新增海关放行单—进口'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
    drawerRef.value.getKhxxByZygsdm('') // 船舶查询
	})
}
const addCK = () => {
  ticketVisibleCK.value = true
  saveShow.value = true
  updateShow.value = false
  title.value = '新增海关放行单—出口'
  nextTick(() => {
    drawerRefCK.value.resetForm() // 清空事件
    drawerRefCK.value.getKhxxByZygsdmCK('') // 船舶查询
  })
}
// 进口保存
const saveJK = async () => {
	if (await drawerRef.value.validate()) {
		console.log('保存', drawerRef.value.formData)
    const  params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
    params.lb ='进口'
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('点击保存', params)
      proxy.$request({
        url: '/hgfx/insertHgfx',
        method: 'POST',
        data: params
      }).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('新增成功')
          ticketVisibleJK.value = false
          getList(queryParams.value)
        }
      })
		})
	}
}
// 出口保存
const saveCK = async () => {
  if (await drawerRefCK.value.validate()) {
    console.log('保存', drawerRefCK.value.formData)
    const  params = JSON.parse(JSON.stringify(drawerRefCK.value.formData)) // 取到子组件的formData
    params.lb ='出口'
    proxy.$modal.confirm('确定保存？').then(() => {
      console.log('点击保存', params)
      proxy.$request({
        url: '/hgfx/insertHgfx',
        method: 'POST',
        data: params
      }).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('新增成功')
          ticketVisibleCK.value = false
          getList(queryParams.value)
        }
      })
    })
  }
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
  // 海关放行人list
  proxy.$request({
    url: `/hgfx/getHqcyrInfo?hqcyrid=${editRow.hqcyrid}`,
    method: 'POST'
  }).then(res => {
    if (res.code === '0000') {
        if(editRow.lb==='进口'){
          title.value = '新增海关放行单—进口'
          ticketVisibleJK.value = true
          saveShow.value = false
          updateShow.value = true
           nextTick(() => {
            drawerRef.value.resetForm() // 清空事件
             drawerRef.value.showUpdate() // 修改字段的展示show
             proxy.setFormData(drawerRef.value.hqcyrList, res.data)
             proxy.setFormData(drawerRef.value.formData, editRow)

           })
        }else if(editRow.lb==='出口'){
          title.value = '新增海关放行单—出口'
          ticketVisibleCK.value = true
          saveShow.value = false
          updateShow.value = true
          nextTick(() => {
            drawerRefCK.value.resetForm() // 清空事件
            drawerRefCK.value.showUpdate() // 修改字段的展示show
            proxy.setFormData(drawerRefCK.value.hqcyrList, res.data)
            proxy.setFormData(drawerRefCK.value.formData, editRow)

           })
        }
    }
  })
}

//进口修改保存
const doUpdateJK = async() => {
  if (await drawerRef.value.validate()) {
    console.log('保存', drawerRef.value.formData)
    const  params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
    params.lb ='进口'
    proxy.$modal.confirm('确定修改？').then(() => {
      console.log('点击保存', params)
      proxy.$request({
        url: '/hgfx/updateHgfx',
        method: 'POST',
        data: params
      }).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('修改成功')
          ticketVisibleJK.value = false
          getList(queryParams.value)
        }
      })
    })
  }
}

 // 出口修改保存
  const doUpdateCK = async() => {
    if (await drawerRefCK.value.validate()) {
      const  params = JSON.parse(JSON.stringify(drawerRefCK.value.formData)) // 取到子组件的formData
      params.lb ='出口'
      proxy.$modal.confirm('确定修改？').then(() => {
        console.log('点击修改', params)
        proxy.$request({
          url: '/hgfx/updateHgfx',
          method: 'POST',
          data: params
        }).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('修改成功')
            ticketVisibleCK.value = false
            getList(queryParams.value)
          }
        })
      })
    }


}
// 删除
const deleteRow = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
    proxy.$modal.confirm('确定删除海关放行单？').then(() => {
      proxy.$request({
      url: `/hgfx/deleteHgfx?id=${editRow.id}`,
      method: 'post'
    }).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('删除成功')
        getList(queryParams.value)
      }
    })
  });
}
// 获取默认当前时间班次
const getCurrentShiftClassInfo = async () => {
  var date1 = new Date();
  date1.setDate(1);
  date1.setMonth(0);
  nextTick(() => {
    proxy.$bus.emit('setInitSearchData', {
      startTm:parseDate(date1, '{yyyy}-{mm}-{dd}'),
      endTm: parseDate(new Date(), '{yyyy}-{mm}-{dd}')
    })
  })
  queryParams.value.startTm = parseDate(date1, '{yyyy}-{mm}-{dd}');
  queryParams.value.endTm = parseDate(new Date(), '{yyyy}-{mm}-{dd}');
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
