<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:20:36
 * @LastEditTime: 2025-12-22 17:33:16
 * @LastEditors: zhangsd
 * @Description: 签名弹窗
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\SignDialog.vue
-->
<template>
  <el-dialog v-model="signDialogVisible" title="签名" width="935">
    <div style="position: relative;">
      <Vue3Signature 
        style="border: 1px solid #ccc; border-style: solid;" 
        ref="signature" 
        w="900px" 
        h="400px" 
      />
      <el-button
        style="position: absolute; bottom: 20px; right: 10px;"
        type="primary"
        text
        size="small"
        @click="signature.clear()"
      >
        <el-icon style="margin-right: 5px;"><Delete /></el-icon>
        清除
      </el-button>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="signDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit"> 提交 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="js">
// 显式导入Vue3组合式API
import { ref, defineEmits, defineExpose } from 'vue'
// 导入签名组件
import Vue3Signature from 'vue3-signature'
// 导入接口和工具函数
// import * as FileApi from '@/api/infra/file'
// import download from '@/utils/download'
import { useMessage } from '@/plugins/useMessage' // 按项目实际路径调整

// 消息弹窗实例
const message = useMessage()
// 响应式变量定义（移除TS类型注解）
const signDialogVisible = ref(false)
const signature = ref(null)

// 打开签名弹窗
const open = async () => {
  signDialogVisible.value = true
}

// 定义组件事件（替换TS泛型为数组格式）
const emits = defineEmits(['success'])

// 提交签名
const submit = async () => {
  message.success('签名上传中请稍等。。。')
  // const res = await FileApi.updateFile({
  //   file: download.base64ToFile(signature.value.save('image/png'), '签名')
  // })
  emits('success', res.data)
  signDialogVisible.value = false
}

// 暴露方法给父组件
defineExpose({ open })
</script>

<style scoped>
/* 若dialog-footer有简写CSS，可在此补充标准样式，示例： */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>