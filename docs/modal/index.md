## 消息提示用法

统一使用`proxy.$modal.xxx`来使用消息弹框

弹出内容规范为：

-   确定新增？ 成功弹出 res.msg
-   确定修改？ 成功弹出 res.msg
-   确定删除？ 成功弹出 res.msg
-   确定保存？ 成功弹出 res.msg
-   请完善表单信息
-   请选择一条数据

### 弹框类型

各种弹框类型请看如下代码,用哪个就 . 哪个，例如成功消息提示：`proxy.$modal.msgSuccess('保存成功！')`

```js
  // 消息提示
  msg(content) {
    ElMessage.info(content)
  },
  // 错误消息
  msgError(content) {
    ElMessage.error(content)
  },
  // 成功消息
  msgSuccess(content) {
    ElMessage.success(content)
  },
  // 警告消息
  msgWarning(content) {
    ElMessage.warning(content)
  },
  // 弹出提示
  alert(content) {
    ElMessageBox.alert(content, "系统提示")
  },
  // 错误提示
  alertError(content) {
    ElMessageBox.alert(content, "系统提示", { type: 'error' })
  },
  // 成功提示
  alertSuccess(content) {
    ElMessageBox.alert(content, "系统提示", { type: 'success' })
  },
  // 警告提示
  alertWarning(content) {
    ElMessageBox.alert(content, "系统提示", { type: 'warning' })
  },
  // 通知提示
  notify(content) {
    ElNotification.info(content)
  },
  // 错误通知
  notifyError(content) {
    ElNotification.error(content);
  },
  // 成功通知
  notifySuccess(content) {
    ElNotification.success(content)
  },
  // 警告通知
  notifyWarning(content) {
    ElNotification.warning(content)
  },
  // 确认窗体
  confirm(content) {
    return ElMessageBox.confirm(content, "系统提示", {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: "warning",
    })
  },
  // 提交内容
  prompt(content) {
    return ElMessageBox.prompt(content, "系统提示", {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: "warning",
    })
  },
  // 打开遮罩层
  loading(content) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: "rgba(0, 0, 0, 0.7)",
    })
  },
  // 关闭遮罩层
  closeLoading() {
    loadingInstance.close();
  }


```
