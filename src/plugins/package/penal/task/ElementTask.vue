<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.prevent>
      <component 
        :is="witchTaskComponent" 
        v-bind="$props" 
        :users="users" 
        :groups="groups" 
      />
    </el-form>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import UserTask from "./task-components/UserTask";
import ScriptTask from "./task-components/ScriptTask";
import ReceiveTask from "./task-components/ReceiveTask";
import ServiceTask from "./task-components/ServiceTask";

export default defineComponent({
  name: "ElementTaskConfig",
  components: { UserTask, ScriptTask, ReceiveTask, ServiceTask },
  props: {
    users: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      required: true
    },
    id: String,
    type: String
  },
  setup(props) {
    // 响应式数据
    const taskConfigForm = ref({
      asyncAfter: false,
      asyncBefore: false,
      exclusive: false
    });
    const witchTaskComponent = ref("");
    const installedComponent = {
      UserTask: "UserTask",
      ScriptTask: "ScriptTask",
      ReceiveTask: "ReceiveTask",
      ServiceTask: "ServiceTask"
    };
    let bpmnElement = null;

    // 监听id变化
    watch(
      () => props.id,
      () => {
        bpmnElement = window.bpmnInstances.bpmnElement;
        taskConfigForm.value.asyncBefore = bpmnElement?.businessObject?.asyncBefore;
        taskConfigForm.value.asyncAfter = bpmnElement?.businessObject?.asyncAfter;
        taskConfigForm.value.exclusive = bpmnElement?.businessObject?.exclusive;
      },
      { immediate: true }
    );

    // 监听type变化
    watch(
      () => props.type,
      () => {
        witchTaskComponent.value = installedComponent[props.type];
      },
      { immediate: true }
    );

    // 更改任务异步配置
    const changeTaskAsync = () => {
      if (!taskConfigForm.value.asyncBefore && !taskConfigForm.value.asyncAfter) {
        taskConfigForm.value.exclusive = false;
      }
      window.bpmnInstances.modeling.updateProperties(
        window.bpmnInstances.bpmnElement,
        { ...taskConfigForm.value }
      );
    };

    return {
      taskConfigForm,
      witchTaskComponent,
      changeTaskAsync
    };
  }
});
</script>