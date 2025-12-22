<!--
 * @Author: zhangsd
 * @Date: 2025-12-19 17:20:15
 * @LastEditTime: 2025-12-19 17:30:22
 * @LastEditors: zhangsd
 * @Description: HTTP请求设置
 * @FilePath: \view\src\views\bpmModel\processManagement\components\HttpRequestSetting.vue
-->
<template>
  <!-- 提示信息 -->
  <el-form-item class="alert-container">
    <el-alert
      title="仅支持 POST 请求，以请求体方式接收参数"
      type="warning"
      show-icon
      :closable="false"
      effect="light"
    />
  </el-form-item>

  <!-- 请求地址 -->
  <el-form-item
    label-position="top"
    label="请求地址"
    :prop="`${formItemPrefix}.url`"
    :rules="urlRules"
  >
    <el-input
      v-model="setting.url"
      placeholder="请输入完整的 HTTP/HTTPS 请求地址（如：https://api.example.com/test）"
      clearable
      class="request-url-input"
    />
  </el-form-item>

  <!-- 请求头、请求体设置 -->
  <HttpRequestParamSetting
    :header="setting.header || []"
    :body="setting.body || []"
    :bind="formItemPrefix"
  />

  <!-- 返回值设置 -->
  <div v-if="responseEnable" class="response-setting-container">
    <el-form-item label="返回值映射" label-position="top">
      <el-alert
        title="通过请求返回值，可以修改流程表单的字段值（格式：返回字段名 → 表单字段名）"
        type="info"
        show-icon
        :closable="false"
        effect="light"
      />
    </el-form-item>

    <!-- 返回值映射列表 -->
    <el-form-item>
      <div 
        class="response-item" 
        v-for="(item, index) in setting.response || []" 
        :key="`response-item-${index}`"
      >
        <!-- 表单字段选择 -->
        <div class="response-field-wrapper">
          <el-form-item
            :prop="`${formItemPrefix}.response.${index}.key`"
            :rules="responseKeyRules"
            label=""
          >
            <el-select 
              class="response-select-input" 
              v-model="item.key" 
              placeholder="请选择表单字段"
              clearable
            >
              <el-option
                v-for="field in formFields"
                :key="`field-${field.field}`"
                :label="field.title"
                :value="field.field"
                :disabled="!field.required"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 箭头分隔符 -->
        <div class="response-arrow-separator">→</div>

        <!-- 返回字段输入 -->
        <div class="response-field-wrapper">
          <el-form-item
            :prop="`${formItemPrefix}.response.${index}.value`"
            :rules="responseValueRules"
            label=""
          >
            <el-input 
              class="response-value-input" 
              v-model="item.value" 
              placeholder="请求返回的字段名"
              clearable
            />
          </el-form-item>
        </div>

        <!-- 删除按钮 -->
        <div class="delete-icon-wrapper">
          <el-icon size="18" @click="deleteHttpResponseSetting(index)">
            <Delete />
          </el-icon>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!(setting.response && setting.response.length)" class="empty-state-tip">
        暂无返回值映射配置，点击下方按钮添加
      </div>
    </el-form-item>

    <!-- 添加按钮 -->
    <div class="add-button-wrapper">
      <el-button type="primary" text @click="addHttpResponseSetting">
        <el-icon class="add-button-icon"><Plus /></el-icon>添加返回值映射
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef, watch } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import HttpRequestParamSetting from './HttpRequestParamSetting.vue'
import { useFormFields } from  "@/components/bpmnProcessDesigner/package/penal/node.js"

// 定义组件名称
defineOptions({
  name: 'HttpRequestSetting'
})

// 定义Props（JS版本）
const props = defineProps({
  setting: {
    type: Object,
    required: true,
    default: () => ({
      url: '',
      header: [],
      body: [],
      response: []
    })
  },
  responseEnable: {
    type: Boolean,
    required: true,
    default: false
  },
  formItemPrefix: {
    type: String,
    required: true
  }
})

// 定义Emits
const emits = defineEmits(['update:setting'])

// 响应式处理：使用toRef确保对props.setting的响应式引用
const setting = toRef(props, 'setting')

// 流程表单字段
const formFields = useFormFields()

// 表单校验规则（抽离成常量，更清晰）
const urlRules = [
  { required: true, message: '请求地址不能为空', trigger: 'blur' },
  { 
    pattern: /^https?:\/\/.+$/, 
    message: '请输入合法的 HTTP/HTTPS 地址', 
    trigger: 'blur' 
  }
]
const responseKeyRules = [
  { required: true, message: '表单字段不能为空', trigger: 'change' }
]
const responseValueRules = [
  { required: true, message: '请求返回字段不能为空', trigger: 'blur' }
]

/**
 * 添加返回值映射项
 */
const addHttpResponseSetting = () => {
  // 确保response数组存在
  if (!setting.value.response) {
    setting.value.response = []
  }
  setting.value.response.push({
    key: '',
    value: ''
  })
  // 触发更新
  emits('update:setting', setting.value)
}

/**
 * 删除返回值映射项
 * @param {number} index 索引
 */
const deleteHttpResponseSetting = (index) => {
  if (setting.value.response && setting.value.response.length > 0) {
    setting.value.response.splice(index, 1)
    // 触发更新
    emits('update:setting', setting.value)
  }
}

/**
 * 监听setting变化，触发更新（深度监听）
 */
watch(
  () => setting.value,
  (val) => {
    emits('update:setting', val)
  },
  { deep: true, immediate: false } // 深度监听对象内部变化
)
</script>

<style lang="scss" scoped>
// 提示信息容器
.alert-container {
  margin-bottom: 16px;
}

// 请求地址输入框
.request-url-input {
  width: 100%; // 补充宽度，适配容器
  max-width: 800px; // 限制最大宽度，提升体验
}

// 返回值设置容器
.response-setting-container {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

// 返回值映射项
.response-item {
  display: flex; // 替换原 flex 缩写
  align-items: center; // 替换原 align-center 缩写
  padding-bottom: 12px;
  margin-bottom: 8px; // 补充底部间距

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

// 返回值字段容器（替换原 mr-2 缩写）
.response-field-wrapper {
  margin-right: 8px;
}

// 箭头分隔符
.response-arrow-separator {
  margin-right: 8px; // 替换原 mr-2 缩写
  color: #9ca3af;
  font-size: 14px;
}

// 表单字段选择框（替换原 w-160px 缩写）
.response-select-input {
  width: 160px;
}

// 返回字段输入框（替换原 w-160px 缩写）
.response-value-input {
  width: 160px;
}

// 删除图标容器（替换原 mr-1 + cursor-pointer 缩写）
.delete-icon-wrapper {
  margin-right: 4px; // 替换原 mr-1 缩写
  cursor: pointer;
  color: #ef4444;
  transition: color 0.2s ease; // 补充过渡动画

  &:hover {
    color: #dc2626;
  }
}

// 添加按钮容器
.add-button-wrapper {
  margin-top: 8px;
}

// 添加按钮图标间距（替换原 mr-5px 缩写）
.add-button-icon {
  margin-right: 5px;
}

// 空状态提示
.empty-state-tip {
  padding: 16px 0;
  color: #9ca3af;
  text-align: center;
  font-size: 14px;
}

// 兼容 Element Plus 组件样式
:deep(.el-form-item) {
  margin-bottom: 0; // 去掉表单项默认底部间距，避免重复
}

:deep(.el-select),
:deep(.el-input) {
  width: 100%; // 确保选择框/输入框宽度生效
}
</style>