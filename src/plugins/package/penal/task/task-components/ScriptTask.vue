<template>
  <div style="margin-top: 16px">
    <el-form-item label="脚本格式">
      <el-input 
        v-model="scriptTaskForm.scriptFormat" 
        clearable 
        @input="updateElementTask()" 
        @change="updateElementTask()" 
      />
    </el-form-item>
    <el-form-item label="脚本类型">
      <el-select v-model="scriptTaskForm.scriptType">
        <el-option label="内联脚本" value="inline" />
        <el-option label="外部资源" value="external" />
      </el-select>
    </el-form-item>
    <el-form-item label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <el-input
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autosize="{ minRows: 2, maxRows: 4 }"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <el-input 
        v-model="scriptTaskForm.resource" 
        clearable 
        @input="updateElementTask()" 
        @change="updateElementTask()" 
      />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input 
        v-model="scriptTaskForm.resultVariable" 
        clearable 
        @input="updateElementTask()" 
        @change="updateElementTask()" 
      />
    </el-form-item>
  </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: "ScriptTask",
  props: {
    id: String,
    type: String
  },
  setup(props) {
    // 响应式数据
    const defaultTaskForm = {
      scriptFormat: "",
      script: "",
      resource: "",
      resultVariable: "",
      scriptType: "inline"
    };
    const scriptTaskForm = ref({ ...defaultTaskForm });
    let bpmnElement = null;

    // 监听id变化
    watch(
      () => props.id,
      () => {
        bpmnElement = window.bpmnInstances.bpmnElement;
        nextTick(() => resetTaskForm());
      },
      { immediate: true }
    );

    // 重置表单
    const resetTaskForm = () => {
      for (let key in defaultTaskForm) {
        scriptTaskForm.value[key] = bpmnElement?.businessObject[key] || defaultTaskForm[key];
      }
      scriptTaskForm.value.scriptType = scriptTaskForm.value.script ? "inline" : "external";
    };

    // 更新元素任务
    const updateElementTask = () => {
      let taskAttr = Object.create(null);
      taskAttr.scriptFormat = scriptTaskForm.value.scriptFormat || null;
      taskAttr.resultVariable = scriptTaskForm.value.resultVariable || null;
      
      if (scriptTaskForm.value.scriptType === "inline") {
        taskAttr.script = scriptTaskForm.value.script || null;
        taskAttr.resource = null;
      } else {
        taskAttr.resource = scriptTaskForm.value.resource || null;
        taskAttr.script = null;
      }
      
      window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
    };

    // 组件卸载前清理
    onBeforeUnmount(() => {
      bpmnElement = null;
    });

    return {
      scriptTaskForm,
      updateElementTask
    };
  }
});
</script>