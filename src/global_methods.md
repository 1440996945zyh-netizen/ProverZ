# 全局方法使用说明文档

## 概述

本文档详细说明在 `main.js` 中注册的全局方法的使用方式和功能。这些方法可以在任何 Vue 组件中通过 `this` 直接调用。

## 全局方法列表

### 1. 字典相关方法

#### `useDict`
**功能**: 获取字典数据
**参数**: `dictType` (字符串) - 字典类型
**返回值**: 字典数据数组
**示例**:
```javascript
// 在组件中使用
const dictData = this.useDict('user_type')
```

#### `selectDictLabel`
**功能**: 根据字典值和字典数据获取对应的标签
**参数**: 
- `dictData` (数组) - 字典数据
- `value` (字符串/数字) - 字典值
**返回值**: 对应的标签文本
**示例**:
```javascript
const dictData = this.useDict('user_type')
const label = this.selectDictLabel(dictData, 1)
```

#### `selectDictLabels`
**功能**: 根据多个字典值和字典数据获取对应的标签（逗号分隔）
**参数**: 
- `dictData` (数组) - 字典数据
- `value` (字符串) - 多个字典值，用逗号分隔
**返回值**: 对应的标签文本，用逗号分隔
**示例**:
```javascript
const dictData = this.useDict('user_type')
const labels = this.selectDictLabels(dictData, '1,2')
```

### 2. 数据处理方法

#### `deepClone`
**功能**: 深拷贝对象或数组
**参数**: `obj` (任意类型) - 需要拷贝的对象
**返回值**: 深拷贝后的新对象
**示例**:
```javascript
const original = { a: 1, b: { c: 2 } }
const cloned = this.deepClone(original)
```

#### `clearObjectValues`
**功能**: 清空对象的所有属性值
**参数**: `obj` (对象) - 需要清空的对象
**返回值**: 清空后的对象
**示例**:
```javascript
const form = { name: '张三', age: 25 }
this.clearObjectValues(form)
// form 变为 { name: '', age: null }
```

#### `flattenToTree`
**功能**: 将扁平数组转换为树形结构
**参数**: 
- `list` (数组) - 扁平数组
- `options` (对象) - 配置项（可选）
**返回值**: 树形结构数组
**示例**:
```javascript
const flatData = [
  { id: 1, name: '父节点', parentId: null },
  { id: 2, name: '子节点', parentId: 1 }
]
const treeData = this.flattenToTree(flatData)
```

#### `setFormData`
**功能**: 设置表单数据（常用于编辑详情）
**参数**: 
- `form` (对象) - 表单对象
- `data` (对象) - 数据对象
**示例**:
```javascript
this.setFormData(this.form, response.data)
```

### 3. 表格相关方法

#### `setEditTableOptions`
**功能**: 设置可编辑表格中的下拉框选项
**参数**: 
- `tableData` (数组) - 表格数据
- `field` (字符串) - 字段名
- `options` (数组) - 选项数组
**示例**:
```javascript
this.setEditTableOptions(this.tableData, 'status', statusOptions)
```

### 4. 日期时间方法

#### `parseTime` / `formatDate`
**功能**: 格式化日期时间
**参数**: 
- `time` (Date/字符串/数字) - 时间
- `pattern` (字符串) - 格式模式（可选）
**返回值**: 格式化后的时间字符串
**示例**:
```javascript
const formatted = this.parseTime(new Date(), '{y}-{m}-{d}')
// 输出: "2024-01-15"
```

#### `addDateRange`
**功能**: 添加日期范围参数到查询条件
**参数**: 
- `params` (对象) - 查询参数
- `dateRange` (数组) - 日期范围
- `propNames` (对象) - 属性名配置（可选）
**示例**:
```javascript
const queryParams = {}
this.addDateRange(queryParams, ['2024-01-01', '2024-01-15'])
```

### 5. 表单验证方法

#### `getRules`
**功能**: 获取表单校验规则
**参数**: `rulesConfig` (对象) - 规则配置
**返回值**: 校验规则对象
**示例**:
```javascript
const rules = this.getRules({
  name: [{ required: true, message: '请输入姓名' }],
  age: [{ required: true, message: '请输入年龄' }]
})
```

#### `resetForm`
**功能**: 重置表单
**参数**: `formRef` (对象) - 表单引用
**示例**:
```javascript
this.resetForm(this.$refs.form)
```

#### `verify` / `filterInput`
**功能**: 正则匹配验证输入
**参数**: 
- `value` (字符串) - 输入值
- `pattern` (字符串/正则) - 验证模式
**返回值**: 布尔值，表示是否匹配
**示例**:
```javascript
const isValid = this.verify('123abc', /^[a-zA-Z0-9]+$/)
```

### 6. 网络请求方法

#### `download`
**功能**: 文件下载
**参数**: 
- `url` (字符串) - 下载地址
- `params` (对象) - 参数（可选）
- `filename` (字符串) - 文件名（可选）
**示例**:
```javascript
this.download('/api/export', { type: 'excel' }, '数据导出.xlsx')
```

#### `$request`
**功能**: HTTP 请求（等同于 Vue2 的 `Vue.prototype.$request`）
**示例**:
```javascript
this.$request.get('/api/users').then(response => {
  // 处理响应
})
```

### 7. 事件总线

#### `$bus`
**功能**: 全局事件总线
**方法**:
- `$bus.emit(event, data)` - 触发事件
- `$bus.on(event, callback)` - 监听事件
- `$bus.off(event, callback)` - 取消监听
**示例**:
```javascript
// 发送事件
this.$bus.emit('user-updated', userData)

// 接收事件
this.$bus.on('user-updated', (data) => {
  console.log('用户已更新:', data)
})
```

### 8. 消息提示

#### `$message`
**功能**: Element Plus 消息提示
**示例**:
```javascript
this.$message.success('操作成功')
this.$message.error('操作失败')
this.$message.warning('警告信息')
```

## 使用示例

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
    <el-button @click="handleSubmit">提交</el-button>
    <el-button @click="handleReset">重置</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        age: ''
      },
      rules: this.getRules({
        name: [{ required: true, message: '请输入姓名' }]
      })
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.$request.post('/api/user', this.form)
            .then(() => {
              this.$message.success('保存成功')
              this.$bus.emit('user-saved')
            })
        }
      })
    },
    handleReset() {
      this.resetForm(this.$refs.formRef)
      this.clearObjectValues(this.form)
    }
  }
}
</script>
```

### 在组合式 API 中使用

```javascript
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    const { proxy } = getCurrentInstance()
    
    const handleAction = () => {
      // 使用全局方法
      const cloned = proxy.deepClone(someObject)
      proxy.$message.success('操作成功')
    }
    
    return { handleAction }
  }
}
```

## 注意事项

1. **TypeScript 支持**: 如需 TypeScript 支持，需要在 `shims-vue.d.ts` 中声明全局方法
2. **性能考虑**: 频繁使用的数据建议缓存，避免重复调用字典方法
3. **错误处理**: 网络请求方法已内置错误处理，但建议在业务代码中添加额外的错误处理逻辑
4. **内存管理**: 事件总线监听器在组件销毁时应及时移除，避免内存泄漏

## 扩展自定义全局方法

如需添加新的全局方法，请在 `main.js` 的 `全局方法挂载` 部分添加：

```javascript
// 在 main.js 中添加
app.config.globalProperties.你的方法名 = 你的方法
```

然后在本文档中相应位置补充说明。