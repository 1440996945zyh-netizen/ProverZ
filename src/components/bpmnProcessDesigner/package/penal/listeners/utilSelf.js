
/**
 * @description 将监听器对象转换为表单数据格式
 * @param {Object} listener 监听器对象
 * @returns {Object} 转换后的表单数据
 */
export function initListenerForm(listener) {
  let self = {
    ...listener
  }
  
  // 如果存在脚本配置，则合并到表单数据中
  if (listener.script) {
    self = {
      ...listener,
      ...listener.script,
      scriptType: listener.script.resource ? 'externalScript' : 'inlineScript'
    }
  }
  
  // 处理超时事件定义
  if (listener.event === 'timeout' && listener.eventDefinitions) {
    if (listener.eventDefinitions.length) {
      let timeKey = ''
      for (const key in listener.eventDefinitions[0]) {
        if (key.includes('time')) {
          timeKey = key
          self.eventDefinitionType = key.replace('time', '').toLowerCase()
          break
        }
      }
      if (timeKey) {
        self.eventTimeDefinitions = listener.eventDefinitions[0][timeKey]?.body || ''
      }
    }
  }
  
  return self
}

/**
 * @description 获取监听器类型
 * @param {Object} listener 监听器对象
 * @returns {Object} 包含监听器类型的对象
 */
export function initListenerType(listener) {
  let listenerType
  
  if (listener.class) {
    listenerType = 'classListener'
  } else if (listener.expression) {
    listenerType = 'expressionListener'
  } else if (listener.delegateExpression) {
    listenerType = 'delegateExpressionListener'
  } else if (listener.script) {
    listenerType = 'scriptListener'
  }
  
  return {
    ...JSON.parse(JSON.stringify(listener)),
    ...(listener.script ?? {}),
    listenerType
  }
}

/**
 * @description 将 ProcessListenerDO 转换为表单对象
 * @param {Object} processListener 流程监听器对象
 * @returns {Object} 表单数据对象
 */
export function initListenerForm2(processListener) {
  switch (processListener.valueType) {
    case 'class':
      return {
        listenerType: 'classListener',
        class: processListener.value,
        event: processListener.event,
        fields: []
      }
      
    case 'expression':
      return {
        listenerType: 'expressionListener',
        expression: processListener.value,
        event: processListener.event,
        fields: []
      }
      
    case 'delegateExpression':
      return {
        listenerType: 'delegateExpressionListener',
        delegateExpression: processListener.value,
        event: processListener.event,
        fields: []
      }
      
    default:
      throw new Error('未知的监听器类型')
  }
}

/**
 * @description 监听器类型映射
 */
export const listenerType = Object.freeze({
  classListener: 'Java 类',
  expressionListener: '表达式',
  delegateExpressionListener: '代理表达式',
  scriptListener: '脚本'
})

/**
 * @description 事件类型映射
 */
export const eventType = Object.freeze({
  create: '创建',
  assignment: '指派',
  complete: '完成',
  delete: '删除',
  update: '更新',
  timeout: '超时'
})

/**
 * @description 字段类型映射
 */
export const fieldType = Object.freeze({
  string: '字符串',
  expression: '表达式'
})
