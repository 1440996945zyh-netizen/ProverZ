<template>
  <!-- 分配角色数据权限对话框 -->
  <el-row justify='space-between' style='margin-bottom: 10px'>
    <el-col :span='11'>
      <el-row justify='space-between'>
        <el-input v-model='allocationParams.leftName' placeholder='请输入账号或姓名' clearable style='width: 240px'>
          <template #append>
            <el-button icon='Search' @click="getUserList(allocationParams.leftName, 'unallocated')" />
          </template>
        </el-input>
        <el-button type='primary' plain @click="handleAllocated('insert')">授权</el-button>
      </el-row>
    </el-col>
    <el-col :span='11'>
      <el-row justify='space-between'>
        <el-input v-model='allocationParams.rightName' placeholder='请输入账号或姓名' clearable style='width: 240px'>
          <template #append>
            <el-button icon='Search' @click="getUserList(allocationParams.rightName, 'allocated')" />
          </template>
        </el-input>
        <el-button type='danger' plain @click="handleAllocated('del')">取消授权</el-button>
      </el-row>
    </el-col>
  </el-row>
  <el-row justify='space-between'>
    <el-col :span='11'>
      <el-table :data='unallocatedList' max-height='300' @selection-change='handleSelectionUnallocatedList'>
        <el-table-column type='selection' width='55' align='center' />
        <el-table-column label='账号' prop='userAccount' />
        <el-table-column label='姓名' prop='userName' />
      </el-table>
    </el-col>
    <el-col :span='11'>
      <el-table :data='allocatedList' max-height='300' @selection-change='handleSelectionAllocatedList'>
        <el-table-column type='selection' width='55' align='center' />
        <el-table-column label='账号' prop='userAccount' />
        <el-table-column label='姓名' prop='userName' />
      </el-table>
    </el-col>
  </el-row>
</template>

<script setup>
import { reactive, toRefs } from 'vue'
import { allocatedOrUnallocatedList, authUserInsertDelete } from '@/api/system/role'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['dialogShowEmit'])
const unallocatedList = ref([]) // 未授权用户
const selectUnallocatedList = ref([]) // 选中的未授权用户
const allocatedList = ref([]) // 已授权用户
const selectAllocatedList = ref([]) // 选中的已授权用户
const data = reactive({
  userAllocatedRoleId: null,
  allocationParams: {
    leftName: '',
    rightName: ''
  }
})
const { allocationParams, userAllocatedRoleId } = toRefs(data)

/** 清空搜索数据 */
function clearSearchData() {
  allocationParams.value.leftName = '',
  allocationParams.value.rightName = ''
}

/**
 * 获取授权或未授权用户列表
 */
function getUserList(nameOrAccount, flag) {
  allocatedOrUnallocatedList({
    roleId: userAllocatedRoleId.value,
    nameOrAccount: nameOrAccount,
    flag: flag
  }).then(res => {
    if ('allocated' === flag) {
      allocatedList.value = res.data
    } else {
      unallocatedList.value = res.data
    }
  })
}

/**
 * 选择未授权用户
 */
function handleSelectionUnallocatedList(val) {
  selectUnallocatedList.value = []
  for (let item of val) {
    selectUnallocatedList.value.push(item.id)
  }
}

/**
 * 选择已授权的账号
 */
function handleSelectionAllocatedList(val) {
  selectAllocatedList.value = []
  for (let item of val) {
    selectAllocatedList.value.push(item.id)
  }
}

/**
 * 授权/取消授权
 */
function handleAllocated(type) {
  let param = {
    userIds: 'del' === type ? selectAllocatedList.value : selectUnallocatedList.value,
    roleId: userAllocatedRoleId.value,
    insertOrDel: type
  }
  let info = 'del' === type ? '取消授权' : '授权'
  if (null == param.userIds || param.userIds.length === 0) {
    ElMessage({
      message: '请先勾选用户',
      type: 'warning'
    })
    return
  }
  proxy.$modal
    .confirm('确定' + info + '吗?')
    .then(function() {
      authUserInsertDelete(param).then(res => {
        // 刷新列表
        getUserList(allocationParams.value.leftName, 'allocated')
        getUserList(allocationParams.value.rightName, 'unallocated')
      }) //
    })
    .then(() => {
      roxy.$modal.msgSuccess(info + '成功')
    })
    .catch(function() {
      // row.status = row.status === "1" ? "0" : "1";
    })
}

const getCatedList = id => {
  userAllocatedRoleId.value = id
  getUserList(allocationParams.value.leftName, 'allocated')
  // 已授权
  getUserList(allocationParams.value.rightName, 'unallocated')
}
defineExpose({
  getCatedList,
  clearSearchData
})
</script>

<style lang='scss' scoped></style>
