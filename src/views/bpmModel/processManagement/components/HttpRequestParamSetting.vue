<!--
 * @Author: zhangsd
 * @Date: 2025-12-19 17:20:30
 * @LastEditTime: 2025-12-19 17:28:48
 * @LastEditors: zhangsd
 * @Description: HTTP请求参数设置
 * @FilePath: \view\src\views\bpmModel\processManagement\components\HttpRequestParamSetting.vue
-->
<template>
  <!-- 请求头设置 -->
  <el-form-item label-position="top" label="请求头">
    <!-- 请求头参数行 -->
    <div 
      class="param-item-row" 
      v-for="(item, index) in props.header" 
      :key="index"
    >
      <!-- 参数名输入框容器 -->
      <div class="param-field-wrapper">
        <el-form-item
          :prop="`${bind}.header.${index}.key`"
          :rules="{
            required: true,
            message: '参数名不能为空',
            trigger: 'blur'
          }"
        >
          <el-input v-model="item.key" class="param-key-input" />
        </el-form-item>
      </div>

      <!-- 参数类型选择框容器 -->
      <div class="param-field-wrapper">
        <el-form-item>
          <el-select 
            v-model="item.type" 
            class="param-type-select" 
            @change="handleTypeChange(item)"
          >
            <el-option
              v-for="types in BPM_HTTP_REQUEST_PARAM_TYPES"
              :key="types.value"
              :label="types.label"
              :value="types.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 参数值输入/选择框容器 -->
      <div class="param-field-wrapper">
        <!-- 固定值输入框 -->
        <el-form-item
          :prop="`${bind}.header.${index}.value`"
          :rules="{
            required: true,
            message: '参数值不能为空',
            trigger: 'blur'
          }"
        >
          <el-input
            v-if="item.type === BpmHttpRequestParamTypeEnum.FIXED_VALUE"
            v-model="item.value"
            class="param-value-input"
          />
        </el-form-item>
        
        <!-- 表单字段选择框 -->
        <el-form-item
          :prop="`${bind}.header.${index}.value`"
          :rules="{
            required: true,
            message: '参数值不能为空',
            trigger: 'change'
          }"
        >
          <el-select
            v-if="item.type === BpmHttpRequestParamTypeEnum.FROM_FORM"
            v-model="item.value"
            class="param-value-select"
          >
            <el-option
              v-for="(field, fIdx) in formFieldOptions"
              :key="fIdx"
              :label="field.title"
              :value="field.field"
              :disabled="!field.required"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 删除按钮容器 -->
      <div class="delete-icon-wrapper">
        <el-icon size="18" @click="deleteHttpRequestParam(props.header, index)">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 添加请求头按钮 -->
    <el-button type="primary" text @click="addHttpRequestParam(props.header)">
      <el-icon class="add-btn-icon"><Plus /></el-icon>添加一行
    </el-button>
  </el-form-item>

  <!-- 请求体设置 -->
  <el-form-item label-position="top" label="请求体">
    <!-- 请求体参数行 -->
    <div 
      class="param-item-row" 
      v-for="(item, index) in props.body" 
      :key="index"
    >
      <!-- 参数名输入框容器 -->
      <div class="param-field-wrapper">
        <el-form-item
          :prop="`${bind}.body.${index}.key`"
          :rules="{
            required: true,
            message: '参数名不能为空',
            trigger: 'blur'
          }"
        >
          <el-input v-model="item.key" class="param-key-input" />
        </el-form-item>
      </div>

      <!-- 参数类型选择框容器 -->
      <div class="param-field-wrapper">
        <el-form-item>
          <el-select 
            v-model="item.type" 
            class="param-type-select" 
            @change="handleTypeChange(item)"
          >
            <el-option
              v-for="types in BPM_HTTP_REQUEST_PARAM_TYPES"
              :key="types.value"
              :label="types.label"
              :value="types.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 参数值输入/选择框容器 -->
      <div class="param-field-wrapper">
        <!-- 固定值输入框 -->
        <el-form-item
          :prop="`${bind}.body.${index}.value`"
          :rules="{
            required: true,
            message: '参数值不能为空',
            trigger: 'blur'
          }"
        >
          <el-input
            v-if="item.type === BpmHttpRequestParamTypeEnum.FIXED_VALUE"
            v-model="item.value"
            class="param-value-input"
          />
        </el-form-item>
        
        <!-- 表单字段选择框 -->
        <el-form-item
          :prop="`${bind}.body.${index}.value`"
          :rules="{
            required: true,
            message: '参数值不能为空',
            trigger: 'change'
          }"
        >
          <el-select
            v-if="item.type === BpmHttpRequestParamTypeEnum.FROM_FORM"
            v-model="item.value"
            class="param-value-select"
          >
            <el-option
              v-for="(field, fIdx) in formFieldOptions"
              :key="fIdx"
              :label="field.title"
              :value="field.field"
              :disabled="!field.required"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 删除按钮容器 -->
      <div class="delete-icon-wrapper">
        <el-icon size="18" @click="deleteHttpRequestParam(props.body, index)">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 添加请求体按钮 -->
    <el-button type="primary" text @click="addHttpRequestParam(props.body)">
      <el-icon class="add-btn-icon"><Plus /></el-icon>添加一行
    </el-button>
  </el-form-item>
</template>

<script setup lang="js">
import { Delete, Plus } from '@element-plus/icons-vue'
import { 
  BPM_HTTP_REQUEST_PARAM_TYPES,
  BpmHttpRequestParamTypeEnum 
} from  "@/components/bpmnProcessDesigner/package/penal/consts.js"
import { useFormFieldsAndStartUser } from  "@/components/bpmnProcessDesigner/package/penal/node.js"

// 定义组件名称
defineOptions({
  name: 'HttpRequestParamSetting'
})

// 定义 props (JS 版本)
const props = defineProps({
  header: {
    type: Array,
    required: false,
    default: () => []
  },
  body: {
    type: Array,
    required: false,
    default: () => []
  },
  bind: {
    type: String,
    required: true
  }
})

// 流程表单字段，发起人字段
const formFieldOptions = useFormFieldsAndStartUser()

/** 监听类型变化，清空值 */
const handleTypeChange = (item) => {
  // 当类型改变时，清空值
  item.value = ''
}

/** 添加请求配置项 */
const addHttpRequestParam = (arr) => {
  arr.push({
    key: '',
    type: BpmHttpRequestParamTypeEnum.FIXED_VALUE,
    value: ''
  })
}

/** 删除请求配置项 */
const deleteHttpRequestParam = (arr, index) => {
  arr.splice(index, 1)
}
</script>

<style lang="scss" scoped>
// 参数项行容器（替换原 flex/pb-4/items-center）
.param-item-row {
  display: flex;
  align-items: center; // 替换 items-center
  padding-bottom: 16px; // 替换 pb-4
  margin-bottom: 8px; // 补充底部间距，提升可读性
}

// 参数字段容器（替换原 mr-2）
.param-field-wrapper {
  margin-right: 8px; // 替换 mr-2
}

// 删除图标容器（替换原 mr-1/items-center）
.delete-icon-wrapper {
  margin-right: 4px; // 替换 mr-1
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ef4444; // 危险色，提升交互提示

  &:hover {
    color: #dc2626; //  hover 加深颜色
  }
}

// 添加按钮图标间距（替换原 mr-5px）
.add-btn-icon {
  margin-right: 5px;
}

// 参数名输入框样式（原 style="width: 160px" 移到样式里）
.param-key-input {
  width: 160px;
}

// 参数类型选择框样式（原 style="width: 160px" 移到样式里）
.param-type-select {
  width: 160px;
}

// 参数值输入框样式（原 style="width: 200px" 移到样式里）
.param-value-input {
  width: 200px;
}

// 参数值选择框样式（原 style="width: 200px" 移到样式里）
.param-value-select {
  width: 200px;
}

// 兼容 Element Plus 组件样式
:deep(.el-form-item) {
  margin-bottom: 0; // 去掉表单项默认底部间距，避免重复
}

:deep(.el-icon) {
  transition: color 0.2s ease; // 图标颜色过渡，提升交互体验
}
</style>