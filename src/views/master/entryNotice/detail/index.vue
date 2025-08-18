<template>
  <div>
    <el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules" style="margin: 20px 20px">
      <el-row :gutter="24">
        <el-col :span="24" >
          <el-form-item label="公告标题" prop="title">
            <el-input v-model="formData.title" placeholder="公告标题" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="24" >
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio key="1" label="1">在用</el-radio>
              <el-radio key="0" label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12" >
          <el-form-item label="生效起始时间" prop="startTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm"
              v-model="formData.startTime"
              type="datetime"
              placeholder="生效起始时间"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" >
          <el-form-item label="生效截至时间" prop="endTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm"
              v-model="formData.endTime"
              type="datetime"
              placeholder="生效截至时间"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="24" >
          <el-form-item label="通知对象" prop="noticeRoleCodes">
            <Select
              :dataConfig="{ url: '/api/internal/public/getDictListByType/NOTICE_ROLE' }"
              v-model:value="formData.noticeRoleCodes"
              v-model:label="formData.noticeRoleNames"
              multiple
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="24" >
          <el-form-item label="内容" prop="content">
            <el-input v-model="formData.content" type="textarea" placeholder="内容" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup name="entryNotice">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
let noticeRoleList = ref([]);
const formData = reactive({
  id:'',
  title: '',
  status: '1',
  content: '',
  startTime:'',
  endTime:'',
  roleCode:'',
  roleName:'',
  noticeRoleCodes:[],
  noticeRoleNames:[]
})
const rules = reactive({
  title: proxy.getRules({
    required: true ,
  }),
  content: proxy.getRules({
    required: true ,
  }),
  status: proxy.getRules({
    required: true ,
  }),
  startTime: proxy.getRules({
    required: true ,
  }),
  endTime: proxy.getRules({
    required: true ,
  }),
  noticeRoleCodes: proxy.getRules({
    required: true ,
  }),
})

const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      flag = true
    } else {
      flag = false
      proxy.$modal.msgWarning('请完善表单信息！')
    }
  })
  return flag
}
const resetForm = () => {
  ruleForm.value.resetFields()
}
defineExpose({
  validate,
  resetForm,
  formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
