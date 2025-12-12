<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 17:07:41
 * @LastEditors: zhangsd
 * @Description: 多实例组件
 * @FilePath: \view\src\plugins\package\penal\multi-instance\ElementMultiInstance.vue
-->

<template>
  <div class="panel-tab__content">
    <el-form  label-width="90px" @submit.prevent size="default">
      <el-form-item label="回路特性">
        <el-select v-model="loopCharacteristics"  @change="changeLoopCharacteristicsType" style="width: 200px;">
          <!-- bpmn:MultiInstanceLoopCharacteristics -->
          <el-option label="并行多重事件" value="ParallelMultiInstance" />
          <el-option label="时序多重事件" value="SequentialMultiInstance" />
          <!-- bpmn:StandardLoopCharacteristics -->
          <!--<el-option label="循环事件" value="StandardLoop" />-->
          <el-option label="无" value="Null" />
        </el-select>
      </el-form-item>

      <template v-if="loopCharacteristics === 'ParallelMultiInstance' || loopCharacteristics === 'SequentialMultiInstance'">
        <el-form-item label="集合" key="collection">
          <el-input v-model="loopInstanceForm.collection" clearable  @change="updateLoopBase"   />
        </el-form-item>

        <el-form-item label="元素变量" key="elementVariable">
          <el-input v-model="loopInstanceForm.elementVariable" clearable  @change="updateLoopBase"   />
        </el-form-item>

        <el-form-item label="完成条件" key="completionCondition">
          <el-input v-model="loopInstanceForm.completionCondition" clearable  @change="updateLoopCondition"   />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount, inject } from 'vue';

// 定义组件属性和事件
const props = defineProps({
  businessObject: Object,
  type: String
});

const emit = defineEmits(['multiInsEvent']);

// 注入全局配置
const prefix = inject('prefix');

// 全局引用（非响应式）
let bpmnElement = null;
let multiLoopInstance = null;

// 响应式数据
const loopCharacteristics = ref('');

// 默认表单配置（用于初始化）
const defaultLoopInstanceForm = {
  collection: '',
  elementVariable: '',
  completionCondition: '',
  loopCardinality: '',
  extensionElements: [],
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false
};

const loopInstanceForm = reactive({ ...defaultLoopInstanceForm });



// 从 BPMN 对象读取多实例配置
const getElementLoop = (businessObject) => {
  if (!businessObject?.loopCharacteristics) {
    loopCharacteristics.value = 'Null';
    Object.assign(loopInstanceForm, {
      collection: '',
      elementVariable: '',
      completionCondition: ''
    });
    return;
  }

  if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
    loopCharacteristics.value = 'StandardLoop';
    Object.assign(loopInstanceForm, {
      collection: '',
      elementVariable: '',
      completionCondition: ''
    });
    return;
  }

  // 判断是并行还是时序
  if (businessObject.loopCharacteristics.isSequential) {
    loopCharacteristics.value = 'SequentialMultiInstance';
  } else {
    loopCharacteristics.value = 'ParallelMultiInstance';
  }

  // 合并配置
  const lc = businessObject.loopCharacteristics;
  Object.assign(loopInstanceForm, {
    ...defaultLoopInstanceForm,
    ...lc,
    completionCondition: lc?.completionCondition?.body ?? '',
    loopCardinality: lc?.loopCardinality?.body ?? ''
  });

  // 保存对 MultiInstance 实例的引用
  multiLoopInstance = businessObject.loopCharacteristics;

  // 处理重试周期（来自扩展元素）
  if (
    lc.extensionElements &&
    lc.extensionElements.values &&
    lc.extensionElements.values.length > 0
  ) {
    loopInstanceForm.timeCycle = lc.extensionElements.values[0].body;
  }
};

// 切换回路特性类型
const changeLoopCharacteristicsType = (type) => {
  // 清除多实例配置
  if (type === 'Null') {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, { loopCharacteristics: null });
    window.bpmnInstances.modeling.updateProperties(bpmnElement, { assignee: null });
    emit('multiInsEvent', true);
    return;
  }

  // 标准循环（暂不启用）
  if (type === 'StandardLoop') {
    const loopCharacteristicsObject = window.bpmnInstances.moddle.create('bpmn:StandardLoopCharacteristics');
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      loopCharacteristics: loopCharacteristicsObject
    });
    multiLoopInstance = null;
    return;
  }

  // 创建 MultiInstanceLoopCharacteristics
  if (type === 'SequentialMultiInstance') {
    multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
      isSequential: true
    });
  } else {
    multiLoopInstance = window.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics');
  }

  // 应用到 BPMN 元素
  window.bpmnInstances.modeling.updateProperties(bpmnElement, {
    loopCharacteristics: multiLoopInstance
  });

  // 固定 assignee 为 ${assignee}
  window.bpmnInstances.modeling.updateProperties(bpmnElement, {
    assignee: '${assignee}'
  });

  // 设置默认值
  const collection = '${multiInstanceHandler.getUserName(execution)}';
  const elementVariable = 'assignee';
  const completionConditionBody = '${nrOfCompletedInstances>=nrOfInstances}';

  // 更新模型属性
  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    collection,
    elementVariable
  });

  const completionCondition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', {
    body: completionConditionBody
  });

  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    completionCondition
  });

  // 同步表单
  Object.assign(loopInstanceForm, {
    collection,
    elementVariable,
    completionCondition: completionConditionBody
  });

  emit('multiInsEvent', false); // 隐藏父组件的指定用户
};

// 更新集合或元素变量
const updateLoopBase = () => {
  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    collection: loopInstanceForm.collection || null,
    elementVariable: loopInstanceForm.elementVariable || null
  });
};

// 更新完成条件
const updateLoopCondition = (condition) => {
  let completionCondition = null;
  if (condition && condition.trim()) {
    completionCondition = window.bpmnInstances.moddle.create('bpmn:FormalExpression', {
      body: condition
    });
  }
  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    completionCondition
  });
};

// （保留原方法，虽未在模板中使用，但可能被外部调用）
const updateLoopCardinality = (cardinality) => {
  let loopCardinality = null;
  if (cardinality && cardinality.trim()) {
    loopCardinality = window.bpmnInstances.moddle.create('bpmn:FormalExpression', {
      body: cardinality
    });
  }
  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    loopCardinality
  });
};

const updateLoopTimeCycle = (timeCycle) => {
  const extensionElements = window.bpmnInstances.moddle.create('bpmn:ExtensionElements', {
    values: [
      window.bpmnInstances.moddle.create(`${prefix.value}:FailedJobRetryTimeCycle`, {
        body: timeCycle
      })
    ]
  });
  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    extensionElements
  });
};

const updateLoopAsync = (key) => {
  const { asyncBefore, asyncAfter } = loopInstanceForm;
  let asyncAttr = {};

  if (!asyncBefore && !asyncAfter) {
    loopInstanceForm.exclusive = false;
    asyncAttr = { asyncBefore: false, asyncAfter: false, exclusive: false, extensionElements: null };
  } else {
    asyncAttr[key] = loopInstanceForm[key];
  }

  window.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, asyncAttr);
};
// 初始化 BPMN 元素（在 watch 中由 businessObject 触发）
watch(
  () => props.businessObject,
  (val) => {
    if (val) {
      bpmnElement = window.bpmnInstances?.bpmnElement;
      getElementLoop(val);
    }
  },
  { immediate: true }
);
// 组件销毁前清理
onBeforeUnmount(() => {
  multiLoopInstance = null;
  bpmnElement = null;
});
</script>

<style scoped>
/* 保持原有样式 */
</style>