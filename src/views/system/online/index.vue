<template>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:tableColumns="tableColumns"
				:tableData="tableData"
        :tableHeight="'normalTableHeight'"
				:cellClickEvent="cellClickEvent"
				:total="total"
			/>
		</div>
</template>

<script setup name="online">
import api from '@/api/system/online/index.js'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ref } from 'vue';
const baseTable = ref() // table的ref
const { proxy } = getCurrentInstance()
const tableData = ref([]);
const total = ref(0) // 数据总数

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const queryParams = ref({
  // 检索参数
});

const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'id' }

// header检索参数
const selectData = reactive([
	{
		name: '用户名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'userName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '用户账号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'userAccount', // 绑定字段
		span: 12, // 占位，共24
	},
])
// 表格表头参数
const tableColumns = reactive([
  { prop: 'userName', label: '用户名称', min_width: 250,align: 'left',},
  { prop: 'userAccount', label: '用户账号', min_width: 220,align: 'left',},
  { prop: 'deptName', label: '部门名称', min_width: 220,align: 'left', },
  { prop: 'mobile', label: '手机号码', width: 'phoneNumber',align: 'center', },
  { prop: 'lastRequestTime', label: '最后操作时间',min_width: 220,align: 'center',},
  {
    prop: '',
    label: '操作',
		align: 'center',
		width: 100,
    fixed: 'right',
    render: row => {
      return [h(
        ElButton,
        {
          onClick: () => {
            handleOffline(row)
          },
          type: 'danger',
					link: true,
					icon: 'Delete',
          permission: 'system:online:offline', // 权限
        },
        {
          default: () => '强退'
        }
      )]
    },
  },
])

/*** 查询列表 */
const getList = e => {
	queryParams.value = e
  api.getOnLineList(queryParams.value).then(response => {
		tableData.value = response.data
  });
};

/** 下线*/
const handleOffline = row => {
  proxy.$modal
    .confirm('确定强退？')
    .then(function() {
      let userAccount = row.userAccount
      let id = row.id
      api.offLine({
        userAccount: userAccount,
        id: id
      })
    })
    .then(() => {
        getList(queryParams.value)
        proxy.$modal.msgSuccess(res.msg)
    })
    .catch(() => {})
}

/**
 * 初始化
 */
getList(queryParams.value);
</script>
