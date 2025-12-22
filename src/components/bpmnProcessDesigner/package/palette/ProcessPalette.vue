<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:44:19
 * @LastEditTime: 2025-12-16 15:44:34
 * @LastEditors: zhangsd
 * @Description: 流程调色板
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\palette\ProcessPalette.vue
-->
 <template>
  <div class="my-process-palette">
    <div class="test-button" @click="addTask" @mousedown="addTask">测试任务</div>
    <div class="test-container" id="palette-container">1</div>
  </div>
</template>

<script setup>
import { assign } from 'min-dash'

// 组件名称定义
defineOptions({ name: 'MyProcessPalette' })

// 获取bpmn实例（移除TS类型断言）
const bpmnInstances = () => window.bpmnInstances

/**
 * 添加任务节点
 * @param {Event} event 鼠标事件
 * @param {Object} options 节点配置项
 */
const addTask = (event, options = {}) => {
  const ElementFactory = bpmnInstances().elementFactory
  const create = bpmnInstances().modeler.get('create')

  console.log(ElementFactory, create)

  // 创建任务节点形状
  const shape = ElementFactory.createShape(assign({ type: 'bpmn:UserTask' }, options))

  if (options) {
    shape.businessObject.di.isExpanded = options.isExpanded
  }

  console.log(event, 'event')
  console.log(shape, 'shape')
  create.start(event, shape)
}
</script>

<style scoped lang="scss">
.my-process-palette {
  padding: 80px 20px 20px;
  box-sizing: border-box;

  .test-button {
    padding: 8px 16px;
    cursor: pointer;
    border: 1px solid rgb(24 144 255 / 80%);
    border-radius: 4px;
    box-sizing: border-box;
  }
}
</style>
