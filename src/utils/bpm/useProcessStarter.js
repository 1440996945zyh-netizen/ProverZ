/**
 * 流程启动器
 * 提供流程启动相关的功能，包括获取流程定义、表单数据映射、流程校验等
 * @param {*} options 流程启动参数
 * @param {*} rowData 行数据
 * @param {*} businessId 业务ID 业务菜单id
 * @param {*} businessTypeCode 业务类型编码 按钮权限标识
 * @param {*} activityId 活动ID
 * @param {*} startUserSelectAssignees 启动用户选择的审批人
 * @param {*} businessSubmit 业务提交
 * @param {*} onSuccess 成功回调
 * @param {*} onError 错误回调
 *
 */

import { ref } from 'vue'
import commonApi from '@/api/system/bpm/common/index.js'

export function useProcessStarter() {
    const loading = ref(false)

  /**
   * 表单字段 ↔ 行数据 映射
   * @param {*} formFields 表单字段配置
   * @param {*} rowData 行数据
   * @returns 流程变量
   */
  function mapFormValues(formFields = [], rowData = {}) {
    const variables = {}

    // 定义递归处理函数
    const extractFields = (config) => {
      if (!config) return

      // 1. 如果当前节点有 field 属性，则进行映射
      if (config.field) {
        const field = config.field
        if (rowData[field] !== undefined && rowData[field] !== null) {
          variables[field] = rowData[field]
        }
      }

      // 2. 如果当前节点有子节点，递归遍历子节点
      if (config.children && Array.isArray(config.children)) {
        config.children.forEach(child => extractFields(child))
      }
    }

    formFields.forEach(item => {
      try {
        // 解析单条配置（可能是 elTabs 这种大包裹）
        const fieldConfig = JSON.parse(item)
        // 开始递归提取
        extractFields(fieldConfig)
      } catch (e) {
        console.warn('表单字段解析失败', item)
      }
    })

    return variables
  }

    /**
     * 流程启动主方法
     * @param {*} options 流程启动参数
     * @returns 流程实例ID
     * @throws {Error} 流程启动参数缺失或获取流程定义失败
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
            if (typeof businessSubmit == 'function') {
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
