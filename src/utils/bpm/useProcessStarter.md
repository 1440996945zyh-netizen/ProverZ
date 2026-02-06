# 流程发起器

## 1、设计步骤

1. **初始化/获取配置**：根据业务标识获取流程定义（`getProcDefInfo`）。
2. **数据映射**：将“行数据”与“流程表单字段”进行匹配。
3. **前置校验**：调用后端校验接口（`getApprovalDetail`）。
4. **业务提交**：执行真正的业务逻辑（如修改单据状态、发起流程）。

## 2、设计方案

### **「流程启动器 + 业务回调函数」**

1、按钮点击时传入的不只是参数，而是一个“配置对象”

```js
startProcess({
  rowData,              // 行数据
  businessId,           // 当前业务菜单id
  businessTypeCode,     // 按钮权限标识
  activityId: 'StartUserNode',
  businessSubmit: (params) => api.submitPayment(params)
})
```

## 3、完整流程设计图

```js
[按钮点击]
     ↓
startProcess(config)
     ↓
getProcDefInfo <->获取流程定义
     ↓
表单字段 ↔ 行数据映射
     ↓
getApprovalDetail 校验
     ↓
✅ 校验通过
     ↓
调用 config.businessSubmit()
     ↓
业务接口成功
     ↓
发起流程（或业务接口内部发起）
```

## 4、代码实现

### 1、表单字段与行数据源映射

```js
 /**
   * 表单字段 ↔ 行数据 映射
   */
  function mapFormValues(formFields = [], rowData = {}) {
    const variables = {}

    formFields.forEach(item => {
      try {
        const fieldConfig = JSON.parse(item)
        const field = fieldConfig.field

        if (rowData[field] !== undefined && rowData[field] !== null) {
          variables[field] = rowData[field]
        }
      } catch (e) {
        console.warn('表单字段解析失败', item)
      }
    })

    return variables
  }
```

### 2、流程启动的主方法

```js
/**
   * 流程启动主方法
   */
  async function startProcess(options = {}) {
    const {
      rowData,
      businessId,
      businessTypeCode,
      activityId = 'StartUserNode',
      startUserSelectAssignees,
      businessSubmit,
      onSuccess,
      onError
    } = options

    if (!rowData || !businessId || !businessTypeCode) {
      throw new Error('流程启动参数缺失')
    }

    loading.value = true

    try {
      /* ================== 1. 获取流程定义 ================== */
      const procRes = await commonApi.getProcDefInfo({
        businessId,
        businessTypeCode
      })

      if (!procRes?.success) {
        throw new Error(procRes?.msg || '获取流程定义失败')
      }

      const {
        processDefinitionId,
        formFields
      } = procRes.data

      /* ================== 2. 表单数据映射 ================== */
      const variables = mapFormValues(formFields, rowData)

      /* ================== 3. 流程校验 ================== */
      const approvalRes = await commonApi.getApprovalDetail({
        processDefinitionId,
        activityId,
        processVariablesStr: JSON.stringify(variables)
      })

      if (!approvalRes?.success) {
        throw new Error(approvalRes?.msg || '流程校验未通过')
      }

      /* ================== 4. 调用业务接口 ================== */
      if (typeof businessSubmit === 'function') {
        await businessSubmit({
          rowData,
          businessId,
          processDefinitionId,
          variables,
          startUserSelectAssignees
        })
      }

      onSuccess && onSuccess()
      return true
    } catch (err) {
      onError && onError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    startProcess
  }
}
```

### 3、完整的**`useProcessStarter`**.js代码

```js

import { ref } from 'vue'
import commonApi from '@/api/system/bpm/common/index.js'

export function useProcessStarter() {
  const loading = ref(false)

  /**
   * 表单字段 ↔ 行数据 映射
   */
  function mapFormValues(formFields = [], rowData = {}) {
    const variables = {}

    formFields.forEach(item => {
      try {
        const fieldConfig = JSON.parse(item)
        const field = fieldConfig.field

        if (rowData[field] !== undefined && rowData[field] !== null) {
          variables[field] = rowData[field]
        }
      } catch (e) {
        console.warn('表单字段解析失败', item)
      }
    })

    return variables
  }

  /**
   * 流程启动主方法
   */
  async function startProcess(options = {}) {
    const {
      rowData,
      businessId,
      businessTypeCode,
      activityId = 'StartUserNode',
      startUserSelectAssignees,
      businessSubmit,
      onSuccess,
      onError
    } = options

    if (!rowData || !businessId || !businessTypeCode) {
      throw new Error('流程启动参数缺失')
    }

    loading.value = true

    try {
      /* ================== 1. 获取流程定义 ================== */
      const procRes = await commonApi.getProcDefInfo({
        businessId,
        businessTypeCode
      })

      if (!procRes?.success) {
        throw new Error(procRes?.msg || '获取流程定义失败')
      }

      const {
        processDefinitionId,
        formFields
      } = procRes.data

      /* ================== 2. 表单数据映射 ================== */
      const variables = mapFormValues(formFields, rowData)

      /* ================== 3. 流程校验 ================== */
      const approvalRes = await commonApi.getApprovalDetail({
        processDefinitionId,
        activityId,
        processVariablesStr: JSON.stringify(variables)
      })

      if (!approvalRes?.success) {
        throw new Error(approvalRes?.msg || '流程校验未通过')
      }

      /* ================== 4. 调用业务接口 ================== */
      if (typeof businessSubmit === 'function') {
        await businessSubmit({
          rowData,
          businessId,
          processDefinitionId,
          variables,
          startUserSelectAssignees
        })
      }

      onSuccess && onSuccess()
      return true
    } catch (err) {
      onError && onError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    startProcess
  }
}
```

## 5、业务页面标准使用示例

```vue
<script setup>
// 引入流程启动器
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'
// 引入流程启动器
const { startProcess, loading } = useProcessStarter()

/**
 * 提交付款流程
 * @param param0.processDefinitionId 流程定义ID
 * @param param0.variables 流程变量
 */
const submitPayment = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
    let params = {
		businessDataId:rowData.id,
		variables:JSON.stringify(variables),
    businessId:businessId,
		startUserSelectAssignees:startUserSelectAssignees,
		processDefinitionId:processDefinitionId
	}
	return ProcessInstanceApi.createProcessInstance(params)
}
/**
 * 处理付款提交
 * @param row 点击行数据
 * @param paymentType 付款类型
 */
const handleSubmitPayment = (row, paymentType) => {
	startProcess({
		rowData: row, // 点击行数据
		businessId: route.meta?.menuId, // 业务ID 业务菜单id
		businessTypeCode: paymentType, // 业务类型编码 按钮权限标识
		businessSubmit: submitPayment, // 业务提交函数
		onSuccess() {
			ElMessage.success('提交成功')
		},
		onError(err) {
			ElMessage.error(err.message)
		},
	})
}
</script>

<template>
  <el-button
    type="primary"
    :loading="loading"
    @click="handleSubmitPayment(row,'bpm:application:example:commercialpayment')"
  >
    商用付款
  </el-button>
	<el-button
    type="primary"
    :loading="loading"
    @click="handleSubmitPayment(row,'bpm:application:example:consumablespayment')"
  >
    耗材付款
  </el-button>
</template>
```
