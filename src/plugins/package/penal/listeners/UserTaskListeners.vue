<template>
  <div class="panel-tab__content">
    <el-table :data="elementListenersList" size="mini" border>
      <el-table-column label="序号" width="50px" type="index" />
      <el-table-column label="事件类型" min-width="80px" show-overflow-tooltip>
        <template #default="{ row }">
          {{ listenerEventTypeObject[row.event] }}
        </template>
      </el-table-column>
      <el-table-column label="监听器类型" min-width="80px" show-overflow-tooltip>
        <template #default="{ row }">
          {{ listenerTypeObject[row.listenerType] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90px">
        <template #default="{ row, $index }">
          <el-button size="mini" type="text" @click="openListenerForm(row, $index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeListener(row, $index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="element-drawer__button">
      <el-button size="mini" type="primary" icon="CirclePlus" @click="openListenerForm(null)">添加监听器</el-button>
    </div>

    <!-- 监听器 编辑/创建 部分 -->
    <el-drawer
      v-model="listenerFormModelVisible"
      title="任务监听器"
      :size="`${width}px`"
      append-to-body
      destroy-on-close
    >
      <el-form
        size="mini"
        :model="listenerForm"
        label-width="96px"
        ref="listenerFormRef"
        @submit.prevent
      >
        <el-form-item label="事件类型" prop="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <el-select v-model="listenerForm.event">
            <el-option
              v-for="(label, key) in listenerEventTypeObject"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="监听器类型" prop="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <el-select v-model="listenerForm.listenerType">
            <el-option
              v-for="(label, key) in listenerTypeObject"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="listenerForm.listenerType === 'classListener'"
          label="Java类"
          prop="class"
          key="listener-class"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.class" clearable />
        </el-form-item>

        <el-form-item
          v-if="listenerForm.listenerType === 'expressionListener'"
          label="表达式"
          prop="expression"
          key="listener-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.expression" clearable />
        </el-form-item>

        <el-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          prop="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.delegateExpression" clearable />
        </el-form-item>

        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <el-form-item
            label="脚本格式"
            prop="scriptFormat"
            key="listener-script-format"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <el-input v-model="listenerForm.scriptFormat" clearable />
          </el-form-item>

          <el-form-item
            label="脚本类型"
            prop="scriptType"
            key="listener-script-type"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <el-select v-model="listenerForm.scriptType">
              <el-option label="内联脚本" value="inlineScript" />
              <el-option label="外部脚本" value="externalScript" />
            </el-select>
          </el-form-item>

          <el-form-item
            v-if="listenerForm.scriptType === 'inlineScript'"
            label="脚本内容"
            prop="value"
            key="listener-script"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <el-input v-model="listenerForm.value" clearable />
          </el-form-item>

          <el-form-item
            v-if="listenerForm.scriptType === 'externalScript'"
            label="资源地址"
            prop="resource"
            key="listener-resource"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <el-input v-model="listenerForm.resource" clearable />
          </el-form-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <el-form-item label="定时器类型" prop="eventDefinitionType" key="eventDefinitionType">
            <el-select v-model="listenerForm.eventDefinitionType">
              <el-option label="日期" value="date" />
              <el-option label="持续时长" value="duration" />
              <el-option label="循环" value="cycle" />
              <el-option label="无" value="null" />
            </el-select>
          </el-form-item>

          <el-form-item
            v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
            label="定时器"
            prop="eventTimeDefinitions"
            key="eventTimeDefinitions"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <el-input v-model="listenerForm.eventTimeDefinitions" clearable />
          </el-form-item>
        </template>
      </el-form>

      <el-divider />

      <p class="listener-filed__title">
        <span><el-icon><Menu /></el-icon>注入字段：</span>
        <el-button size="mini" type="primary" @click="openListenerFieldForm(null)">添加字段</el-button>
      </p>

      <el-table
        :data="fieldsListOfListener"
        size="mini"
        max-height="240"
        border
        fit
        style="flex: none"
      >
        <el-table-column label="序号" width="50px" type="index" />
        <el-table-column label="字段名称" min-width="100px" prop="name" />
        <el-table-column label="字段类型" min-width="80px" show-overflow-tooltip>
          <template #default="{ row }">
            {{ fieldTypeObject[row.fieldType] }}
          </template>
        </el-table-column>
        <el-table-column label="字段值/表达式" min-width="100px" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.string || row.expression }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openListenerFieldForm(row, $index)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeListenerField(row, $index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="element-drawer__button">
        <el-button size="mini" @click="listenerFormModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveListenerConfig">保 存</el-button>
      </div>
    </el-drawer>

    <!-- 注入字段 编辑/创建 部分 -->
    <el-dialog
      v-model="listenerFieldFormModelVisible"
      title="字段配置"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="listenerFieldForm"
        size="mini"
        label-width="96px"
        ref="listenerFieldFormRef"
        @submit.prevent
      >
        <el-form-item label="字段名称：" prop="name" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <el-input v-model="listenerFieldForm.name" clearable />
        </el-form-item>

        <el-form-item label="字段类型：" prop="fieldType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <el-select v-model="listenerFieldForm.fieldType">
            <el-option
              v-for="(label, key) in fieldTypeObject"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          prop="string"
          key="field-string"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.string" clearable />
        </el-form-item>

        <el-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.expression" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button size="mini" @click="listenerFieldFormModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveListenerFiled">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject, nextTick, onBeforeUnmount } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { createListenerObject, updateElementExtensions } from '../../utils';
import { initListenerForm, initListenerType, eventType, listenerType, fieldType } from './utilSelf';
import { Menu } from '@element-plus/icons-vue';

// 1. 首先定义Props，解决引用顺序问题
const props = defineProps({
  id: String,
  type: String
});

// 注入全局变量
const prefix = inject('prefix');
const width = inject('width');

// 响应式数据
const elementListenersList = ref([]);
const listenerForm = reactive({});
const listenerFormModelVisible = ref(false);
const fieldsListOfListener = ref([]);
const listenerFieldForm = reactive({});
const listenerFieldFormModelVisible = ref(false);
const editingListenerIndex = ref(-1);
const editingListenerFieldIndex = ref(-1);
const isDestroyed = ref(false); // 组件销毁状态标记

// 映射对象（计算属性优化性能）
const listenerEventTypeObject = computed(() => eventType);
const listenerTypeObject = computed(() => listenerType);
const fieldTypeObject = computed(() => fieldType);

// 引用
const listenerFormRef = ref(null);
const listenerFieldFormRef = ref(null);

// BPMN 元素引用
let bpmnElement = null;
let otherExtensionList = [];
let bpmnElementListeners = [];

// 检查BPMN实例是否可用
const checkBpmnInstances = () => {
  if (isDestroyed.value) return false;
  
  if (!window.bpmnInstances) {
    ElMessage.error('未找到BPMN实例，请确保BPMN模型已正确加载');
    return false;
  }
  if (!window.bpmnInstances.modeler) {
    ElMessage.error('BPMN模型器未初始化');
    return false;
  }
  return true;
};

// 重置监听器列表
const resetListenersList = () => {
  if (isDestroyed.value || !checkBpmnInstances()) return;

  otherExtensionList = [];
  bpmnElementListeners =
    bpmnElement?.businessObject?.extensionElements?.values?.filter(
      ex => ex.$type === `${prefix.value}:TaskListener`
    ) ?? [];

  elementListenersList.value = bpmnElementListeners.map(listener => initListenerType(listener));
};

// 打开监听器编辑侧边栏
const openListenerForm = (listener, index) => {
  if (isDestroyed.value) return;

  if (listener) {
    Object.assign(listenerForm, initListenerForm(listener));
    editingListenerIndex.value = index;
  } else {
    Object.assign(listenerForm, {});
    editingListenerIndex.value = -1;
  }

  if (listener && listener.fields) {
    fieldsListOfListener.value = listener.fields.map(field => ({
      ...field,
      fieldType: field.string ? 'string' : 'expression'
    }));
  } else {
    fieldsListOfListener.value = [];
    listenerForm.fields = []; // 确保字段数组存在
  }

  listenerFormModelVisible.value = true;
  nextTick(() => {
    if (listenerFormRef.value) listenerFormRef.value.clearValidate();
  });
};

// 删除监听器
const removeListener = (listener, index) => {
  if (isDestroyed.value) return;

  ElMessageBox.confirm('确认移除该监听器吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (isDestroyed.value) return;
      
      bpmnElementListeners.splice(index, 1);
      elementListenersList.value.splice(index, 1);
      updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners));
    })
    .catch(() => {});
};

// 保存监听器配置
const saveListenerConfig = async () => {
  if (isDestroyed.value) return;

  const validateStatus = await listenerFormRef.value.validate().catch(() => false);
  if (!validateStatus) return;

  const listenerObject = createListenerObject(listenerForm, true, prefix.value);

  if (editingListenerIndex.value === -1) {
    bpmnElementListeners.push(listenerObject);
    elementListenersList.value.push({ ...listenerForm });
  } else {
    bpmnElementListeners.splice(editingListenerIndex.value, 1, listenerObject);
    elementListenersList.value.splice(editingListenerIndex.value, 1, { ...listenerForm });
  }

  // 保留其他扩展元素
  otherExtensionList = bpmnElement.businessObject?.extensionElements?.values?.filter(
    ex => ex.$type !== `${prefix.value}:TaskListener`
  ) ?? [];

  updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners));

  listenerFormModelVisible.value = false;
  Object.assign(listenerForm, {}); // 清空表单
};

// 打开字段编辑弹窗
const openListenerFieldForm = (field, index) => {
  if (isDestroyed.value) return;

  if (field) {
    Object.assign(listenerFieldForm, JSON.parse(JSON.stringify(field)));
    editingListenerFieldIndex.value = index;
  } else {
    Object.assign(listenerFieldForm, {});
    editingListenerFieldIndex.value = -1;
  }
  listenerFieldFormModelVisible.value = true;
  nextTick(() => {
    if (listenerFieldFormRef.value) listenerFieldFormRef.value.clearValidate();
  });
};

// 保存字段
const saveListenerFiled = async () => {
  if (isDestroyed.value) return;

  const validateStatus = await listenerFieldFormRef.value.validate().catch(() => false);
  if (!validateStatus) return;

  if (editingListenerFieldIndex.value === -1) {
    fieldsListOfListener.value.push({ ...listenerFieldForm });
    listenerForm.fields.push({ ...listenerFieldForm });
  } else {
    fieldsListOfListener.value.splice(editingListenerFieldIndex.value, 1, { ...listenerFieldForm });
    listenerForm.fields.splice(editingListenerFieldIndex.value, 1, { ...listenerFieldForm });
  }

  listenerFieldFormModelVisible.value = false;
  Object.assign(listenerFieldForm, {}); // 清空表单
};

// 删除字段
const removeListenerField = (field, index) => {
  if (isDestroyed.value) return;

  ElMessageBox.confirm('确认移除该字段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (isDestroyed.value) return;
      
      fieldsListOfListener.value.splice(index, 1);
      listenerForm.fields.splice(index, 1);
    })
    .catch(() => {});
};

// 监听 id 变化以重置列表
watch(
  () => props.id,
  (val) => {
    if (val && val.length && !isDestroyed.value) {
      nextTick(() => resetListenersList());
    }
  },
  { immediate: true }
);

// 组件挂载时初始化 BPMN 元素
onMounted(() => {
  if (!isDestroyed.value) {
    bpmnElement = window.bpmnInstances?.bpmnElement;
  }
});

// 组件销毁前清理
onBeforeUnmount(() => {
  isDestroyed.value = true;
  bpmnElement = null;
  otherExtensionList = null;
  bpmnElementListeners = null;
});
</script>

<style scoped>
.element-drawer__button {
  text-align: right;
  margin-top: 16px;
}
.listener-filed__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 8px;
  font-weight: bold;
}
</style>
