<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.prevent>
      <el-form-item label="服务类型">
        <el-select v-model="serviceType">
          <el-option 
            v-for="i in Object.keys(typeObject)" 
            :key="i" 
            :label="typeObject[i]" 
            :value="i" 
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="serviceType === 'class'" label="Java类">
        <el-input v-model="serviceValue" clearable @change="updateInfo('class')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('expression')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'delegateExpression'" label="代理表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('delegateExpression')" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="结果变量">
        <el-input v-model="resultVariable" clearable @change="updateInfo('resultVariable')" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { defineComponent, ref, watch, nextTick, onBeforeUnmount, inject } from 'vue';

export default defineComponent({
  name: "ServiceTask",
  props: {
    id: String,
    type: String
  },
  setup(props) {
    // 注入属性
    const prefix = inject('prefix');
    const width = inject('width');
    
    // 响应式数据
    const typeObject = {
      class: "Java 类",
      expression: "表达式",
      delegateExpression: "代理表达式"
    };
    const serviceType = ref("");
    const serviceValue = ref("");
    const resultVariable = ref("");
    let bpmnElement = null;

    // 监听id变化
    watch(
      () => props.id,
      (val) => {
        nextTick(() => resetBaseInfo());
      },
      { immediate: true }
    );

    // 重置基础信息
    const resetBaseInfo = () => {
      bpmnElement = window?.bpmnInstances?.bpmnElement;
      let val = "";
      if ((val = bpmnElement.businessObject.class)) {
        serviceType.value = "class";
      } else if ((val = bpmnElement.businessObject.expression)) {
        serviceType.value = "expression";
        if (bpmnElement.businessObject.hasOwnProperty('resultVariable')) {
          resultVariable.value = bpmnElement.businessObject.resultVariable;
        }
      } else if ((val = bpmnElement.businessObject.delegateExpression)) {
        serviceType.value = "delegateExpression";
      }
      serviceValue.value = val;
    };

    // 更新信息
    const updateInfo = (key) => {
      const attrObj = Object.create(null);
      attrObj.class = undefined;
      attrObj.expression = undefined;
      attrObj.delegateExpression = undefined;
      attrObj.resultVariable = undefined;
      
      if (key === "class") {
        attrObj.class = serviceValue.value;
      } else if (key === "expression") {
        attrObj.expression = serviceValue.value;
        if (resultVariable.value !== "") {
          attrObj.resultVariable = resultVariable.value;
        }
      } else if (key === "delegateExpression") {
        attrObj.delegateExpression = serviceValue.value;
      }
      
      window.bpmnInstances.modeling.updateProperties(bpmnElement, attrObj);
    };

    // 组件卸载前清理
    onBeforeUnmount(() => {
      bpmnElement = null;
    });

    return {
      typeObject,
      serviceType,
      serviceValue,
      resultVariable,
      updateInfo
    };
  }
});
</script>