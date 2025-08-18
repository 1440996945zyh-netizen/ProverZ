<template>
  <!--<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">-->
    <el-collapse v-model="jiaKouActiveNames">
      <!--accordion-->

      <el-row>
        <el-col :span="12">
          <div class="sub-title">
            合计数量
          </div>
          <el-form :model="jiaKouTotalForm.form" size="medium" label-position="top" disabled>
            <el-row>
              <el-col :span="6">
                <el-form-item label="加数合计"  prop="sumJs">
                  <el-input v-model="jiaKouTotalForm.form.sumJs"  clearable >
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="扣数合计"  prop="sumKs">
                  <el-input v-model="jiaKouTotalForm.form.sumKs"  clearable  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="数量"  prop="cargokeyshl">
                  <el-input v-model="jiaKouTotalForm.form.cargokeyshl"  clearable  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="可发数"  prop="kfs">
                  <el-input v-model="jiaKouTotalForm.form.kfs"  clearable  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="下达数"  prop="xds">
                  <el-input v-model="jiaKouTotalForm.form.xds"  clearable  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="剩余数" prop="sys">
                  <el-input v-model="jiaKouTotalForm.form.sys" show-word-limit clearable autocomplete="off" >
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
        <el-col :span="12">
          <div class="sub-title">
            新加扣数
          </div>
          <el-form ref="ruleForm" :model="jiaKouForm" size="medium" label-position="top" :rules="rules" >
            <el-row>
              <el-col :span="8">
                <el-form-item label="加扣数类型" prop="lb">
                  <el-select v-model="jiaKouForm.lb" placeholder="请选择加扣数类型" clearable  @change="setTypeOptions()">
                    <el-option label = "加数" value="加数" />
                    <el-option label = "扣数" value="扣数" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="类型" prop="type">
                  <el-select v-model="jiaKouForm.type" placeholder="请选择类型" clearable>
                    <el-option v-for="item in typeOptions" :key="item.dm" :label="item.mch" :value="item.mch">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="数量" prop="cdshl">
                  <el-input v-model="jiaKouForm.cdshl" show-word-limit clearable autocomplete="off" placeholder="整数11位，小数4位" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item prop="note" label="备注">
                  <el-input v-model="jiaKouForm.note" show-word-limit clearable autocomplete="off" placeholder="最多输入150个汉字">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
      <el-collapse-item title="加扣数分类汇总" name="jkshType" class="no-padding">
        <el-row>
          <el-col :span="12">
            <div class="sub-title">
              加数
            </div>
            <el-table
              :data="typeLbJia"
              style="width: 100%"
              tableHeight="200"
            >
              <el-table-column  v-for="item in typeLbJiaTableColumns" :label="item.label" :property="item.prop" :key="item.prop" :width="item.width">
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12">
            <div class="sub-title">
              扣数
            </div>
            <el-table
              :data="typeLbKou"
              style="width: 100%"
              tableHeight="200"
            >
              <el-table-column  v-for="item in typeLbKouTableColumns" :label="item.label" :property="item.prop" :key="item.prop" :width="item.width">
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item title="历史记录" name="hisData" class="no-padding">
        <el-row>
          <el-col :span="12">
            <div class="sub-title">
              加数
            </div>
            <el-table
              :data="hisDataJia"
              style="width: 100%"
              tableHeight="300"
            >
              <el-table-column  v-for="item in hisDataJiaTableColumns" :label="item.label" :property="item.prop" :key="item.prop" :width="item.width">
              </el-table-column>
            </el-table>

          </el-col>
          <el-col :span="12">
            <div class="sub-title">
              扣数
            </div>
            <el-table
              :data="hisDataKou"
              style="width: 100%"
              tableHeight="300"
            >
              <el-table-column  v-for="item in hisDataKouTableColumns" :label="item.label" :property="item.prop" :key="item.prop" :width="item.width">
              </el-table-column>
            </el-table>

          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  <!--</el-form>-->
</template>

<script setup name="drawer">
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  const { proxy } = getCurrentInstance() // 相当于vue2里的this
  import BaseTable from '@/components/BaseTable/index.vue'
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

  /** -----------------------加扣数抽屉-合计---------------------------------*/

  const jiaKouActiveNames =ref( ['hisData', 'jkshType'])
  const typeOptions =ref([{ dm: '', mch: '' }])
  const jiaTypeOptions =ref([
    {dm:'01', mch:'涨吨加数'},
    {dm:'02', mch:'水呎加数'},
    {dm:'03', mch:'补货加数'},
    {dm:'04', mch:'数据修正'},
    {dm:'05', mch:'其他加数'},
    {dm:'06', mch:'预放货'},
    {dm:'07', mch:'三方控货'}
  ])
  const  kouTypeOptions =ref([
    {dm:'001', mch:'质押托盘'},
    {dm:'002', mch:'欠款控货'},
    {dm:'003', mch:'银行控货'},
    {dm:'004', mch:'三方控货'},
    {dm:'005', mch:'期货控货'},
    {dm:'006', mch:'其他扣数'}
  ])
    /** 合计 */
  const jiaKouTotalForm=reactive({
    arr:[],
    form:{
      sumJs: '',
      sumKs: '',
      cargokeyshl: '',
      kfs: '',
      xds: '',
      sys: '',
      cdshl: '',
      shlShj: '',
      fyshlShj: ''
    }
  })
  /** -----------------------加扣数抽屉-新加扣数 ---------------------------------*/
  const jiaKouForm=reactive({
      lb: '',
      type: '',
      cdshl: '',
      note: '',
      cargokey: ''
  })
  const rules=reactive({
    lb: proxy.getRules({
      required: true
    }),
      type: proxy.getRules({
      required: true
    }),
      cdshl: proxy.getRules({
      required: true,
      numberCheck: {
        int: 11,
        dec: 4,
        startWith: '+'
      }
    }),
      note: {
      length: '0-150'
    }
  })
  /** -----------------------加扣数分类汇总---------------------------------*/
  const  typeLbJia =ref([])
  const   typeLbKou =ref([])
  const  typeLbJiaTableColumns =ref([{
    prop: 'TYPE',
    label: '类型'
  }, {
    prop: 'SUMSHL',
    label: '数量'
  }])
  const typeLbKouTableColumns =ref([{
    prop: 'TYPE',
    label: '类型'
  }, {
    prop: 'SUMSHL',
    label: '数量'
  }])
  /** -----------------------加扣数抽屉-历史 ---------------------------------*/
  /** 加 */
  const  hisDataJia =ref([])
  const  hisDataJiaTableColumns = ref([{
    prop: 'type',
    label: '类型'
  }, {
    prop: 'cdshl',
    label: '数量'
  }, {
    prop: 'note',
    label: '备注'
  }])
  const  hisDataKou =ref([])
    /** 扣 */
  const  hisDataKouTableColumns=ref([{
      prop: 'type',
      label: '类型'
    }, {
      prop: 'cdshl',
      label: '数量'
    }, {
      prop: 'note',
      label: '备注'
    }])
  const formData = reactive({
    cargokey:'',

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

  /**
   * 加扣数类型变化
   */
    const setTypeOptions = () => {
    jiaKouForm.type = '';
    console.log(typeOptions.value)
    if (jiaKouForm.lb == '加数') {
      debugger
      typeOptions.value = jiaTypeOptions.value
    } else if (jiaKouForm.lb == '扣数') {
     typeOptions.value = kouTypeOptions.value
    } else {
      typeOptions.value = [];
    }
    console.log(typeOptions.value)
  }
  // 表单重置
  const resetForm = () => {
    proxy.resetObj(jiaKouForm)
    proxy.resetObj(formData)
  }
  const changeSelect = val => {
    console.log(val, myValue.value, myLabel.value)
  }

  const init = () => {

    // // 加数类型
    // proxy.$request({
    //   url: '/PublicResource/getcldm?lb=加数',
    //   method: 'POST'
    // }).then(res => {
    //   this.loading = false;
    //   if (res.code === '00000000') {
    //     jiaTypeOptions.value = res.data
    //   }
    // })
    // // 扣数类型
    // proxy.$request({
    //   url: '/PublicResource/getcldm?lb=扣数',
    //   method: 'POST'
    // }).then(res => {
    //   this.loading = false;
    //   if (res.code === '00000000') {
    //     kouTypeOptions.value = res.data
    //   }
    // })
    // 加扣数信息查询
    proxy.$request({
      url: `/khgl/queryOneCargokey?cargokey=`+ formData.cargokey,
      method: 'get'
    }).then(res => {
      if (res.data !== null) {
        if (res.data.cargoInfoDetailList !== null) {
          // 加数履历
           hisDataJia.value = res.data.cargoInfoDetailList.filter((item, index) => {
            return item.lb === '加数';
          })
          // 扣数履历
          hisDataKou.value = res.data.cargoInfoDetailList.filter((item, index) => {
            return item.lb === '扣数';
          })
        }
       jiaKouTotalForm.form = res.data
      }
    })
    // 加扣数分类汇总
    proxy.$request({
      url: `/khgl/getTypeLb?cargokey=` +formData.cargokey,
      method: 'get'
    }).then(res => {
      if (res.data !== null) {

        typeLbJia.value = res.data.filter((item, index) => {
          return item.LB === '加数';
        })
        typeLbKou.value = res.data.filter((item, index) => {
          return item.LB === '扣数';
        })
      }
    })
  }

  defineExpose({
    validate,
    resetForm,
    jiaKouForm,
    formData,
    init
  })
</script>
<style lang="scss" scoped>
  @import '@/assets/styles/formData.scss';

  .sub-title {
    border: 0.06em solid rgb(225, 241, 254);
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    background-color: #F5F7FA;
    padding-left: 10px;
  }
</style>
