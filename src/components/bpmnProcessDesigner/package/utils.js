import { toRaw } from 'vue'

/**
 * @description 获取 Bpmn 实例对象
 * @returns {Object} Bpmn 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 创建监听器对象
 * @param {Object} options 监听器配置选项
 * @param {boolean} isTask 是否为任务监听器
 * @param {string} prefix 命名空间前缀
 * @returns {Object} 创建的监听器对象
 */
export function createListenerObject(options, isTask, prefix) {
  const listenerObj = Object.create(null)
  listenerObj.event = options.event
  
  // 任务监听器特有 id 字段
  if (isTask) {
    listenerObj.id = options.id
  }

  switch (options.listenerType) {
    case 'scriptListener':
      listenerObj.script = createScriptObject(options, prefix)
      break
    case 'expressionListener':
      listenerObj.expression = options.expression
      break
    case 'delegateExpressionListener':
      listenerObj.delegateExpression = options.delegateExpression
      break
    default:
      listenerObj.class = options.class
  }

  // 添加字段配置
  if (options.fields?.length) {
    listenerObj.fields = options.fields.map((field) => createFieldObject(field, prefix))
  }

  // 任务监听器的定时器设置
  if (isTask && options.event === 'timeout' && options.eventDefinitionType) {
    const timeDefinition = bpmnInstances().moddle.create('bpmn:FormalExpression', {
      body: options.eventTimeDefinitions
    })

    const timerEventDefinition = bpmnInstances().moddle.create('bpmn:TimerEventDefinition', {
      id: `TimerEventDefinition_${uuid(8)}`,
      [`time${options.eventDefinitionType.replace(/^\S/, (s) => s.toUpperCase())}`]: timeDefinition
    })

    listenerObj.eventDefinitions = [timerEventDefinition]
  }

  return bpmnInstances().moddle.create(
    `${prefix}:${isTask ? 'TaskListener' : 'ExecutionListener'}`,
    listenerObj
  )
}

/**
 * @description 创建监听器注入字段对象
 * @param {Object} option 字段配置选项
 * @param {string} prefix 命名空间前缀
 * @returns {Object} 创建的字段对象
 */
export function createFieldObject(option, prefix) {
  const { name, fieldType, string, expression } = option
  const fieldConfig = fieldType === 'string' 
    ? { name, string } 
    : { name, expression }
    
  return bpmnInstances().moddle.create(`${prefix}:Field`, fieldConfig)
}

/**
 * @description 创建脚本对象
 * @param {Object} options 脚本配置选项
 * @param {string} prefix 命名空间前缀
 * @returns {Object} 创建的脚本对象
 */
export function createScriptObject(options, prefix) {
  const { scriptType, scriptFormat, value, resource } = options
  const scriptConfig = scriptType === 'inlineScript' 
    ? { scriptFormat, value } 
    : { scriptFormat, resource }
    
  return bpmnInstances().moddle.create(`${prefix}:Script`, scriptConfig)
}

/**
 * @description 更新元素扩展属性
 * @param {Object} element 元素对象
 * @param {Array} extensionList 扩展列表
 */
export function updateElementExtensions(element, extensionList) {
  const extensions = bpmnInstances().moddle.create('bpmn:ExtensionElements', {
    values: extensionList
  })
  
  bpmnInstances().modeling.updateProperties(element, {
    extensionElements: extensions
  })
}

/**
 * @description 生成唯一标识符
 * @param {number} length ID 长度，默认为 8
 * @param {string} chars 自定义字符集
 * @returns {string} 生成的 ID
 */
export function uuid(length = 8, chars) {
  const charsString = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  
  for (let i = length; i > 0; i--) {
    result += charsString[Math.floor(Math.random() * charsString.length)]
  }
  
  return result
}