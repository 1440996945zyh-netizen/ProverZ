<template>
  <el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-form-item label="合同号" prop="hth">
          <el-input v-model="formData.hth"    disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="作业委托人" prop="zywtr">
          <el-input v-model="formData.zywtr" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="船名" prop="zhwchm">
          <el-input v-model="formData.zhwchm" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="货物名称" prop="hwmch">
          <el-input v-model="formData.hwmch" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="货权持有人" prop="hqcyr">
          <el-input v-model="formData.hqcyr" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="数量" prop="cargokeyshl">
          <el-input v-model="formData.cargokeyshl" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="通关数" prop="tgs">
          <el-input v-model="formData.tgs" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="下达数" prop="xds">
          <el-input v-model="formData.xds" show-word-limit clearable autocomplete="off" disabled>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="剩余数" prop="sys">
          <el-input v-model="formData.sys" show-word-limit clearable autocomplete="off" disabled />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="分货控数" prop="fhks">
          <el-input v-model="formData.fhks" show-word-limit clearable autocomplete="off" placeholder="请输入数字(限数字)" @input="handleEdit"/>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="备注" prop="note">
          <el-input v-model="formData.note" show-word-limit clearable autocomplete="off" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup name="drawer">
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  const { proxy } = getCurrentInstance() // 相当于vue2里的this
  //import Select from '@/components/Select'
  //import RemoteSelect from '@/components/RemoteSelect'
  import publicApi from '@/api/public/index'
  let selectLabel = ref('dictLabel')
  let selectValue = ref('dictValue')
  const myValue = ref('')
  const myLabel = ref('')
  const ruleForm = ref()
  const myValue1 = ref('')
  const myLabel1 = ref('')

  const changeSelect1 = val => {
    console.log('远程回显')
    console.log(val, myValue1.value, myLabel1.value) // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
  }
  const formData = reactive({
    hth:'',
    zywtr:'',
    zhwchm:'',
    hwmch:'',
    hqcyr:'',
    cargokeyshl:'',
    tgs:'',
    xds:'',
    sys:'',
    fhks:'',
    note:'',
    cargokey:''

  })
  const rules = reactive({
    fhks: proxy.getRules({
      required: true,
    }),
  })

const handleEdit =e=>{
  let value = e.replace(/[^\-\d.]/g, '') // 只能输入.和-和数字
  value = value.replace(/^\./g, '') // 第一个字符不能是.
  value = value.replace(/\.{2,}/g, '.') // 不能连续输入.
  value = value.replace(/(\.\d+)\./g, '$1') // .后面不能再输入.
  value = value.replace(/(-)\./g, '$1') // -后面不能输入.
  value = value.replace(/\-{2,}/g, '-') // -只能保留一个
  value = value.replace(/(\d+|\.)-/g, '$1') // 数字和.后面不能接-,不能出现类似11-, 12.-
  value = value.replace(/-(0){2,}/g, '$1') // 不能出现-00,-001,-0001类似
  value = value.replace(/(-)0+(\d+)/g, '$1$2') // 不能出现-01,-02类似
  value = value.replace(/^0+(\d)/, '$1') // 第一位0开头，0后面为数字，则过滤掉，取后面的数字
  value = value.replace(/(\d{15})\d*/, '$1') // 最多保留15位整数
  value = value.replace(/(\.\d{2})\d*/, '$1')// 最多保留2位小数
   formData.fhks = value
}
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
  // 表单重置
  const resetForm = () => {
    proxy.resetObj(formData)
  }
  const changeSelect = val => {
    console.log(val, myValue.value, myLabel.value)
  }

  defineExpose({
    validate,
    resetForm,
    formData
  })
</script>
<style lang="scss" scoped>
  @import '@/assets/styles/formData.scss';
</style>
