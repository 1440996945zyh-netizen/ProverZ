<template>
  <div>
    <el-row>
      <h4><b>设置用户类型</b></h4>
      <el-radio-group v-model="defaultTaskForm.dataType" @change="changeDataType">
        <div v-if="bDisplayUser">
          <el-radio label="ASSIGNEE">指定用户</el-radio>
          <el-radio label="INITIATOR">发起人</el-radio>
	      </div>
        <el-radio label="MANAGER">部门经理</el-radio>
        <el-radio label="USERS">候选用户</el-radio>
        <el-radio label="ROLES">候选角色</el-radio>
      </el-radio-group>
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'ASSIGNEE'">
        <el-select 
          v-model="userTaskForm.assignee" 
          filterable 
          allow-create 
          clearable 
          @change="updateElementTask('assignee')"
        >
          <el-option 
            v-for="ak in users" 
            :key="ak.id" 
            :label="ak.name" 
            :value="ak.id" 
          />
        </el-select>
      </div>   
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'USERS'">
        <el-select 
          v-model="userTaskForm.candidateUsers" 
          filterable 
          allow-create 
          multiple 
          collapse-tags 
          @change="updateElementTask('candidateUsers')"
        >
          <el-option 
            v-for="uk in users" 
            :key="uk.id" 
            :label="uk.name" 
            :value="uk.id" 
          />
        </el-select>
      </div>   
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'ROLES'">
        <el-select 
          v-model="userTaskForm.candidateGroups" 
          filterable 
          allow-create 
          multiple 
          collapse-tags 
          @change="updateElementTask('candidateGroups')"
        >
          <el-option 
            v-for="gk in groups" 
            :key="gk.id" 
            :label="gk.name" 
            :value="gk.id" 
          />
        </el-select>
      </div>  
    </el-row>
    <el-row v-if="['USERS', 'ROLES', 'MANAGER'].includes(defaultTaskForm.dataType)">
      <h4><b>多实例</b></h4>
      <div>
        <element-multi-instance 
          :business-object="bpmnElement?.businessObject" 
          @multiInsEvent="multiIns"
        />
      </div>  
    </el-row>
  </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import ElementMultiInstance from "../../multi-instance/ElementMultiInstance";

export default defineComponent({
  name: "UserTask",
  components: {
    ElementMultiInstance,
  },  
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
    const defaultTaskForm = ref({
      assignee: "",
      candidateUsers: [],
      candidateGroups: [],
      dueDate: "",
      followUpDate: "",
      priority: "",
      dataType: "",
    });
    const userTaskForm = ref({});
    const bDisplayUser = ref(true);
    let bpmnElement = null;

    // 检查对象是否包含指定键
    const containsKey = (obj, key) => {
      return Object.keys(obj).includes(key);
    };

    // 监听id变化
    watch(
      () => props.id,
      () => {
        bpmnElement = window.bpmnInstances.bpmnElement;
        
        if (containsKey(bpmnElement.businessObject, 'loopCharacteristics') &&
            bpmnElement.businessObject.loopCharacteristics != null) {
          bDisplayUser.value = false;
          if (containsKey(bpmnElement.businessObject, 'candidateUsers') &&
              bpmnElement.businessObject.candidateUsers != null) {
            defaultTaskForm.value.dataType = "USERS";
          }
          if (containsKey(bpmnElement.businessObject, 'candidateGroups') &&
              bpmnElement.businessObject.candidateGroups != null) {
            defaultTaskForm.value.dataType = "ROLES";
          }
          if (containsKey(bpmnElement.businessObject, 'candidateGroups') &&
              bpmnElement.businessObject.candidateGroups === '${DepManagerHandler.getUsers(execution)}') {
            defaultTaskForm.value.dataType = "MANAGER";
          }
        } else {
          bDisplayUser.value = true;
          if (containsKey(bpmnElement.businessObject, 'assignee') &&
              bpmnElement.businessObject.assignee != null) {
            defaultTaskForm.value.dataType = "ASSIGNEE";
          } 
          if (containsKey(bpmnElement.businessObject, 'candidateUsers') &&
              bpmnElement.businessObject.candidateUsers != null) {
            defaultTaskForm.value.dataType = "USERS";
          }
          if (containsKey(bpmnElement.businessObject, 'candidateGroups') &&
              bpmnElement.businessObject.candidateGroups != null) {
            defaultTaskForm.value.dataType = "ROLES";
          }
          if (containsKey(bpmnElement.businessObject, 'candidateGroups') &&
              bpmnElement.businessObject.candidateGroups === '${DepManagerHandler.getUsers(execution)}') {
            defaultTaskForm.value.dataType = "MANAGER";
          }
          if (containsKey(bpmnElement.businessObject, 'assignee') &&
              bpmnElement.businessObject.assignee === '${INITIATOR}') {
            defaultTaskForm.value.dataType = "INITIATOR";
          }
        }
        
        nextTick(() => resetTaskForm());
      },
      { immediate: true }
    );

    // 重置任务表单
    const resetTaskForm = () => {
      for (let key in defaultTaskForm.value) {
        let value;
        if (key === "candidateUsers" || key === "candidateGroups") {
          value = bpmnElement?.businessObject[key] 
            ? bpmnElement.businessObject[key].split(",") 
            : [];
        } else {
          value = bpmnElement?.businessObject[key] || defaultTaskForm.value[key];
        }
        userTaskForm.value[key] = value;
      }
    };

    // 处理多实例事件
    const multiIns = (val) => {
      bDisplayUser.value = val;
    };

    // 更改数据类型
    const changeDataType = (val) => {
      userTaskForm.value.dataType = val;
      
      if (val === 'INITIATOR') {
        userTaskForm.value.assignee = "${INITIATOR}";
        userTaskForm.value.text = "流程发起人";
        const taskAttr = Object.create(null);
        taskAttr['candidateUsers'] = null;
        taskAttr['candidateGroups'] = null;
        userTaskForm.value['candidateUsers'] = null;
        userTaskForm.value['candidateGroups'] = null;
        taskAttr['assignee'] = userTaskForm.value['assignee'] || null;
        window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
      }
      
      if (val === 'MANAGER') {
        userTaskForm.value.candidateGroups = "${DepManagerHandler.getUsers(execution)}";
        userTaskForm.value.assignee = "${assignee}";
        userTaskForm.value.text = "部门经理";
        const taskAttr = Object.create(null);
        taskAttr['candidateUsers'] = null;
        userTaskForm.value['candidateUsers'] = null;
        taskAttr['candidateGroups'] = userTaskForm.value['candidateGroups'] || null;
        taskAttr['assignee'] = userTaskForm.value['assignee'] || null;
        window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
      }   
    };

    // 更新元素任务
    const updateElementTask = (key) => {
      const taskAttr = Object.create(null);
      
      if (key === "candidateUsers") {
        taskAttr[key] = userTaskForm.value[key] && userTaskForm.value[key].length 
          ? userTaskForm.value[key].join() 
          : null;
        if (taskAttr[key] != null) {
          taskAttr['candidateGroups'] = null;
          taskAttr['assignee'] = null;
          userTaskForm.value['candidateGroups'] = null;
          userTaskForm.value['assignee'] = null;
        }  
      } else if (key === "candidateGroups") {
        taskAttr[key] = userTaskForm.value[key] && userTaskForm.value[key].length 
          ? userTaskForm.value[key].join() 
          : null;
        if (taskAttr[key] != null) {
          taskAttr['candidateUsers'] = null;
          taskAttr['assignee'] = null;
          userTaskForm.value['candidateUsers'] = null;
          userTaskForm.value['assignee'] = null;
        }  
      } else if (key === "assignee") {
        taskAttr[key] = userTaskForm.value[key] && userTaskForm.value[key].length 
          ? userTaskForm.value[key] 
          : null;
        if (taskAttr[key] != null) {
          taskAttr['candidateUsers'] = null;
          taskAttr['candidateGroups'] = null;
          userTaskForm.value['candidateUsers'] = null;
          userTaskForm.value['candidateGroups'] = null;
        }
      } else {
        taskAttr[key] = userTaskForm.value[key] || null;
      }
      
      window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
    };

    // 组件卸载前清理
    onBeforeUnmount(() => {
      bpmnElement = null;
    });

    return {
      defaultTaskForm,
      userTaskForm,
      bDisplayUser,
      bpmnElement,
      multiIns,
      changeDataType,
      updateElementTask
    };
  }
});
</script>