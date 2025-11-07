<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="80px" @submit.prevent>
      <el-form-item label="表单" prop="formKey">
        <el-select 
          v-model="formKey" 
          placeholder="请选择表单" 
          @change="updateElementFormKey" 
          filterable 
          clearable
        >
          <el-option 
            v-for="item in formList" 
            :key="item.id" 
            :label="item.formName" 
            :value="`${item.id}`" 
          />
        </el-select>
      </el-form-item>
      
      <!-- 注释代码保留，与原结构一致 -->
      <!-- <el-form-item label="表单标识">
        <el-input v-model="formKey" clearable @change="updateElementFormKey" />
      </el-form-item>
      <el-form-item label="业务标识">
        <el-select v-model="businessKey" @change="updateElementBusinessKey">
          <el-option v-for="i in fieldList" :key="i.id" :value="i.id" :label="i.label" />
          <el-option label="无" value="" />
        </el-select>
      </el-form-item> -->
    </el-form>

    <!--字段列表（注释代码保留）-->
    <!-- <div class="element-property list-property">
      <el-divider><i class="el-icon-coin"></i> 表单字段</el-divider>
      <el-table :data="fieldList" size="mini" max-height="240" border fit>
        <el-table-column label="序号" type="index" width="50px" />
        <el-table-column label="字段名称" prop="label" min-width="80px" show-overflow-tooltip />
        <el-table-column label="字段类型" prop="type" min-width="80px" :formatter="row => fieldType[row.type] || row.type" show-overflow-tooltip />
        <el-table-column label="默认值" prop="defaultValue" min-width="80px" show-overflow-tooltip />
        <el-table-column label="操作" width="90px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldForm(row, $index)">编辑</el-button>
            <el-divider orientation="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeField(row, $index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div> -->
    <!-- <div class="element-drawer__button">
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openFieldForm(null, -1)">添加字段</el-button>
    </div> -->

    <!--字段配置侧边栏（注释代码保留）-->
    <!-- <el-drawer :visible.sync="fieldModelVisible" title="字段配置" :size="`${width}px`" append-to-body destroy-on-close>
      <el-form :model="formFieldForm" label-width="90px" size="mini" @submit.native.prevent>
        <el-form-item label="字段ID">
          <el-input v-model="formFieldForm.id" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="formFieldForm.typeType" placeholder="请选择字段类型" clearable @change="changeFieldTypeType">
            <el-option v-for="(value, key) of fieldType" :label="value" :value="key" :key="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型名称" v-if="formFieldForm.typeType === 'custom'">
          <el-input v-model="formFieldForm.type" clearable />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="formFieldForm.label" clearable />
        </el-form-item>
        <el-form-item label="时间格式" v-if="formFieldForm.typeType === 'date'">
          <el-input v-model="formFieldForm.datePattern" clearable />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="formFieldForm.defaultValue" clearable />
        </el-form-item>
      </el-form> -->

      <!-- 枚举值设置 -->
      <!-- <template v-if="formFieldForm.type === 'enum'">
        <el-divider key="enum-divider" />
        <p class="listener-filed__title" key="enum-title">
          <span><i class="el-icon-menu"></i>枚举值列表：</span>
          <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'enum')">添加枚举值</el-button>
        </p>
        <el-table :data="fieldEnumList" size="mini" key="enum-table" max-height="240" border fit>
          <el-table-column label="序号" width="50px" type="index" />
          <el-table-column label="枚举值编号" prop="id" min-width="100px" show-overflow-tooltip />
          <el-table-column label="枚举值名称" prop="name" min-width="100px" show-overflow-tooltip />
          <el-table-column label="操作" width="90px">
            <template #default="{ row, $index }">
              <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'enum')">编辑</el-button>
              <el-divider orientation="vertical" />
              <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'enum')">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template> -->

      <!-- 校验规则 -->
      <!-- <el-divider key="validation-divider" />
      <p class="listener-filed__title" key="validation-title">
        <span><i class="el-icon-menu"></i>约束条件列表：</span>
        <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'constraint')">添加约束</el-button>
      </p>
      <el-table :data="fieldConstraintsList" size="mini" key="validation-table" max-height="240" border fit>
        <el-table-column label="序号" width="50px" type="index" />
        <el-table-column label="约束名称" prop="name" min-width="100px" show-overflow-tooltip />
        <el-table-column label="约束配置" prop="config" min-width="100px" show-overflow-tooltip />
        <el-table-column label="操作" width="90px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'constraint')">编辑</el-button>
            <el-divider orientation="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'constraint')">移除</el-button>
          </template>
        </el-table-column>
      </el-table> -->

      <!-- 表单属性 -->
      <!-- <el-divider key="property-divider" />
      <p class="listener-filed__title" key="property-title">
        <span><i class="el-icon-menu"></i>字段属性列表：</span>
        <el-button size="mini" type="primary" @click="openFieldOptionForm(null, -1, 'property')">添加属性</el-button>
      </p>
      <el-table :data="fieldPropertiesList" size="mini" key="property-table" max-height="240" border fit>
        <el-table-column label="序号" width="50px" type="index" />
        <el-table-column label="属性编号" prop="id" min-width="100px" show-overflow-tooltip />
        <el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
        <el-table-column label="操作" width="90px">
          <template #default="{ row, $index }">
            <el-button size="mini" type="text" @click="openFieldOptionForm(row, $index, 'property')">编辑</el-button>
            <el-divider orientation="vertical" />
            <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'property')">移除</el-button>
          </template>
        </el-table-column>
      </el-table> -->

      <!-- 底部按钮 -->
      <!-- <div class="element-drawer__button">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveField">保 存</el-button>
      </div> 
    </el-drawer>-->

    <Dialog 
      v-model:visible="fieldOptionModelVisible" 
      :title="optionModelTitle" 
      width="600px" 
      append-to-body 
      destroy-on-close
    >
      <el-form :model="fieldOptionForm" size="mini" label-width="96px" @submit.prevent>
        <el-form-item label="编号/ID" v-if="fieldOptionType !== 'constraint'" key="option-id">
          <el-input v-model="fieldOptionForm.id" clearable />
        </el-form-item>
        <el-form-item label="名称" v-if="fieldOptionType !== 'property'" key="option-name">
          <el-input v-model="fieldOptionForm.name" clearable />
        </el-form-item>
        <el-form-item label="配置" v-if="fieldOptionType === 'constraint'" key="option-config">
          <el-input v-model="fieldOptionForm.config" clearable />
        </el-form-item>
        <el-form-item label="值" v-if="fieldOptionType === 'property'" key="option-value">
          <el-input v-model="fieldOptionForm.value" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" @click="fieldOptionModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveFieldOption">确 定</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
// 1. 补充 Element Plus 组件按需导入（关键适配点）
import { 
  ElForm, 
  ElFormItem, 
  ElSelect, 
  ElOption, 
  ElInput, 
  ElDialog, 
  ElButton, 
  ElDivider, 
  ElTable, 
  ElTableColumn, 
  ElDrawer 
} from 'element-plus'
import 'element-plus/theme-chalk/el-form.css'
import 'element-plus/theme-chalk/el-form-item.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-input.css'
import 'element-plus/theme-chalk/el-dialog.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-divider.css'
import 'element-plus/theme-chalk/el-table.css'
import 'element-plus/theme-chalk/el-table-column.css'
import 'element-plus/theme-chalk/el-drawer.css'
import Drawer from '@/components/Drawer/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import { ref, watch, nextTick, reactive, inject } from 'vue';
// import { listForm } from "@/api/form";

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
});

// 注入属性
const prefix = inject('prefix');
const width = inject('width');

// 响应式变量（保持原有逻辑）
const formList = ref([]);
const formKey = ref("");
const businessKey = ref("");
const optionModelTitle = ref("");
const fieldList = ref([]);
const fieldType = ref({
  long: "长整型",
  string: "字符串",
  boolean: "布尔类",
  date: "日期类",
  enum: "枚举类",
  custom: "自定义类型"
});

// 对象类型响应式变量（reactive 适合复杂对象）
const formFieldForm = reactive({});
const fieldOptionForm = reactive({});

// 状态类响应式变量
const formFieldIndex = ref(-1); // 编辑中的字段，-1为新增
const formFieldOptionIndex = ref(-1); // 编辑中的字段配置项，-1为新增
const fieldModelVisible = ref(false);
const fieldOptionModelVisible = ref(false);
const fieldOptionType = ref(""); // 当前激活的字段配置项弹窗类型
const fieldEnumList = ref([]); // 枚举值列表
const fieldConstraintsList = ref([]); // 约束条件列表
const fieldPropertiesList = ref([]); // 绑定属性列表

// 临时变量（非响应式，用let声明）
let bpmnElement = null;
let elExtensionElements = null;
let formData = null;
let otherExtensions = null;

// 监听id变化（立即执行+深度监听，确保元素切换时同步数据）
watch(
  () => props.id,
  (val) => {
    if (val && val.length) {
      nextTick(() => resetFormList());
    }
  },
  { immediate: true }
);

/**
 * 查询表单列表
 * 注：原接口调用已注释，如需恢复需确保`@/api/form`存在
 */
function getFormList() {
  // listForm({ pageSize: 500 }).then(response => {
  //   formList.value = response.result.records;
  // });
}

// 初始化执行表单查询
getFormList();

/**
 * 重置表单配置列表
 * 从bpmn实例中读取元素扩展属性，初始化表单数据
 */
function resetFormList() {
  // 从全局bpmn实例获取当前选中元素
  bpmnElement = window.bpmnInstances?.bpmnElement;
  if (!bpmnElement) return;

  // 初始化表单key
  formKey.value = bpmnElement.businessObject.formKey || "";
  
  // 获取/创建扩展属性容器
  elExtensionElements = bpmnElement.businessObject.get("extensionElements") 
    || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
  
  // 获取/创建表单配置数据
  formData = elExtensionElements.values?.find(ex => ex.$type === `${prefix}:FormData`) 
    || window.bpmnInstances.moddle.create(`${prefix}:FormData`, { fields: [] });

  // 初始化业务标识
  businessKey.value = formData.businessKey || "";

  // 过滤非表单配置的扩展元素
  otherExtensions = elExtensionElements.values?.filter(ex => ex.$type !== `${prefix}:FormData`) || [];

  // 复制原始字段数据（深拷贝避免直接修改源数据）
  fieldList.value = JSON.parse(JSON.stringify(formData.fields || []));

  // 初始化时同步扩展属性到bpmn实例
  updateElementExtensions();
}

/**
 * 更新元素的formKey属性
 */
function updateElementFormKey() {
  if (!bpmnElement) return;
  window.bpmnInstances.modeling.updateProperties(bpmnElement, { 
    formKey: formKey.value 
  });
}

/**
 * 更新元素的businessKey属性
 */
function updateElementBusinessKey() {
  if (!bpmnElement || !formData) return;
  window.bpmnInstances.modeling.updateModdleProperties(
    bpmnElement, 
    formData, 
    { businessKey: businessKey.value }
  );
}

/**
 * 根据选择的类型调整字段type值
 * @param {string} type - 选中的类型（如long/string/custom）
 */
function changeFieldTypeType(type) {
  formFieldForm.type = type === "custom" ? "" : type;
}

/**
 * 打开字段详情侧边栏
 * @param {Object} field - 字段数据（null为新增）
 * @param {number} index - 字段索引（-1为新增）
 */
function openFieldForm(field, index) {
  formFieldIndex.value = index;

  // 优化：reactive对象清空逻辑（避免直接delete导致响应式丢失）
  Object.assign(formFieldForm, {});

  if (index !== -1 && field) {
    // 编辑模式：复制字段数据
    Object.assign(formFieldForm, JSON.parse(JSON.stringify(field)));
    // 确定字段类型（自定义类型需特殊标记）
    formFieldForm.typeType = fieldType.value[field.type] ? field.type : "custom";

    // 初始化关联列表（枚举/约束/属性）
    const FieldObject = formData.fields[index];
    fieldEnumList.value = field.type === "enum" 
      ? JSON.parse(JSON.stringify(FieldObject?.values || [])) 
      : [];
    fieldConstraintsList.value = JSON.parse(JSON.stringify(FieldObject?.validation?.constraints || []));
    fieldPropertiesList.value = JSON.parse(JSON.stringify(FieldObject?.properties?.values || []));
  } else {
    // 新增模式：重置关联列表
    fieldEnumList.value = [];
    fieldConstraintsList.value = [];
    fieldPropertiesList.value = [];
  }

  // 显示侧边栏
  fieldModelVisible.value = true;
}

/**
 * 打开字段配置项弹窗（枚举/约束/属性）
 * @param {Object} option - 配置项数据（null为新增）
 * @param {number} index - 配置项索引（-1为新增）
 * @param {string} type - 配置项类型（enum/constraint/property）
 */
function openFieldOptionForm(option, index, type) {
  // 优化：reactive对象清空逻辑
  Object.assign(fieldOptionForm, {});

  // 初始化弹窗状态
  fieldOptionModelVisible.value = true;
  fieldOptionType.value = type;
  formFieldOptionIndex.value = index;

  // 编辑模式：复制配置项数据
  if (option) {
    Object.assign(fieldOptionForm, JSON.parse(JSON.stringify(option)));
  }

  // 设置弹窗标题
  switch (type) {
    case "property":
      optionModelTitle.value = "属性配置";
      break;
    case "enum":
      optionModelTitle.value = "枚举值配置";
      break;
    case "constraint":
      optionModelTitle.value = "约束条件配置";
      break;
    default:
      optionModelTitle.value = "配置项编辑";
  }
}

/**
 * 保存字段配置项（枚举/约束/属性）
 */
function saveFieldOption() {
  const targetList = getTargetListByType(fieldOptionType.value);
  if (!targetList) return;

  // 新增/编辑配置项
  if (formFieldOptionIndex.value === -1) {
    targetList.push({ ...fieldOptionForm }); // 浅拷贝避免响应式丢失
  } else {
    targetList.splice(formFieldOptionIndex.value, 1, { ...fieldOptionForm });
  }

  // 关闭弹窗并清空表单
  fieldOptionModelVisible.value = false;
  Object.assign(fieldOptionForm, {});
}

/**
 * 根据类型获取目标列表
 * @param {string} type - 配置项类型
 * @returns {Ref} 对应的响应式列表
 */
function getTargetListByType(type) {
  switch (type) {
    case "property":
      return fieldPropertiesList.value;
    case "constraint":
      return fieldConstraintsList.value;
    case "enum":
      return fieldEnumList.value;
    default:
      console.warn(`未知的配置项类型：${type}`);
      return null;
  }
}

/**
 * 保存字段配置
 * 构建bpmn扩展属性模型，更新到元素中
 */
function saveField() {
  const { id, type, label, defaultValue, datePattern } = formFieldForm;
  if (!id || !type || !label) return;

  // 创建字段模型
  const Field = window.bpmnInstances.moddle.create(`${prefix}:FormField`, { 
    id, 
    type, 
    label 
  });

  // 补充可选属性
  if (defaultValue) Field.defaultValue = defaultValue;
  if (datePattern) Field.datePattern = datePattern;

  // 构建属性列表（若有）
  if (fieldPropertiesList.value.length) {
    const fieldPropertyList = fieldPropertiesList.value.map(fp => 
      window.bpmnInstances.moddle.create(`${prefix}:Property`, { 
        id: fp.id, 
        value: fp.value 
      })
    );
    Field.properties = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
      values: fieldPropertyList
    });
  }

  // 构建校验规则（若有）
  if (fieldConstraintsList.value.length) {
    const fieldConstraintList = fieldConstraintsList.value.map(fc => 
      window.bpmnInstances.moddle.create(`${prefix}:Constraint`, { 
        name: fc.name, 
        config: fc.config 
      })
    );
    Field.validation = window.bpmnInstances.moddle.create(`${prefix}:Validation`, {
      constraints: fieldConstraintList
    });
  }

  // 构建枚举值（若有）
  if (fieldEnumList.value.length) {
    Field.values = fieldEnumList.value.map(fe => 
      window.bpmnInstances.moddle.create(`${prefix}:Value`, { 
        name: fe.name, 
        id: fe.id 
      })
    );
  }

  // 新增/编辑字段
  if (formFieldIndex.value === -1) {
    fieldList.value.push({ ...formFieldForm });
    formData.fields.push(Field);
  } else {
    fieldList.value.splice(formFieldIndex.value, 1, { ...formFieldForm });
    formData.fields.splice(formFieldIndex.value, 1, Field);
  }

  // 更新扩展属性并关闭弹窗
  updateElementExtensions();
  fieldModelVisible.value = false;
}

/**
 * 移除字段配置项
 * @param {Object} option - 待移除的配置项
 * @param {number} index - 配置项索引
 * @param {string} type - 配置项类型
 */
function removeFieldOptionItem(option, index, type) {
  const targetList = getTargetListByType(type);
  if (targetList) targetList.splice(index, 1);
}

/**
 * 移除字段
 * @param {Object} field - 待移除的字段
 * @param {number} index - 字段索引
 */
function removeField(field, index) {
  fieldList.value.splice(index, 1);
  formData.fields.splice(index, 1);
  updateElementExtensions();
}

/**
 * 更新元素扩展属性到bpmn实例
 */
function updateElementExtensions() {
  if (!bpmnElement) return;

  // 创建新的扩展属性容器
  const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
    values: [...(otherExtensions || []), formData]
  });

  // 更新到bpmn元素上
  window.bpmnInstances.modeling.updateProperties(bpmnElement, {
    extensionElements: newElExtensionElements
  });
}
</script>