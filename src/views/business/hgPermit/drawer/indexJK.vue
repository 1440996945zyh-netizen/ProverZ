<template>
  <el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">
    <el-collapse v-model="collapseOpen">
      <el-collapse-item title="船舶货物信息" name="1">
        <!-- 基本信息 -->
        <el-row :gutter="20">
          <!--<el-col :span="6">-->
          <!--<el-form-item label="作业公司" prop="companyName">-->
          <!--<div style="width: 100%">-->
          <!--<Select-->
          <!--:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"-->
          <!--v-model:value="formData.companyId"-->
          <!--v-model:label="formData.companyName"-->
          <!--/>-->
          <!--</div>-->
          <!--</el-form-item>-->
          <!--</el-col>-->
          <!--<el-col :span="6">-->
          <!--<el-form-item label="货名" prop="cargoName">-->
          <!--<div style="width: 100%">-->
          <!--<RemoteSelect-->
          <!--type="CARGO_INFO"-->
          <!--v-model:value="formData.cargoCode"-->
          <!--v-model:label="formData.cargoName"-->
          <!--@change="changeSelect1"-->
          <!--/>-->
          <!--</div>-->
          <!--</el-form-item>-->
          <!--</el-col>-->
          <!--<el-col :span="6">-->
          <!--<el-form-item label="货代" prop="cargoAgentName">-->
          <!--<div style="width: 100%">-->
          <!--<RemoteSelect-->
          <!--type="CUSTOMER_CARGO_AGENT"-->
          <!--v-model:value="formData.cargoAgentId"-->
          <!--v-model:label="formData.cargoAgentName"-->
          <!--@change="changeSelect1"-->
          <!--/>-->
          <!--</div>-->
          <!--</el-form-item>-->
          <!--</el-col>-->
          <!--<el-col :span="6">-->
            <!--<el-form-item label="作业公司" prop="zygsdm" >-->
              <!--<el-select v-model="formData.zygsdm" placeholder="请选择状态" :disabled ="updateShow" size="medium" @change="getKhxxByZygsdm('')">-->
                <!--<el-option-->
                  <!--v-for="(item, index)  in zygsOptions"-->
                  <!--:key="item.zygsdm"-->
                  <!--:label="item.zygsmch"-->
                  <!--:value="item.zygsdm">-->
                <!--</el-option>-->
              <!--</el-select>-->
            <!--</el-form-item>-->
          <!--</el-col>-->
          <el-col :span="6">
            <el-form-item label="中文船名"  prop="cargokey"  v-if="chmInsertShow">
              <el-select
                v-model="formData.cargokey"
                placeholder="请先录入船名"
                filterable
                clearable
                @change="changekhxx"
                size="medium"
                :disabled="isShowChm"
                collapse-tags
                remote
                reserve-keyword
                :remote-method='remoteMethodShipJK'
                @focus="focusShipJK"

              >
                <el-option
                  v-for="item in zhwchmList"
                  :key="item.cargokey"
                  :label="item.zhwchm"
                  :value="item.cargokey">
                  <span style="float: left">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="中文船名"  prop="zhwchm" v-if="chmUpdateShow" >
              <el-input v-model="formData.zhwchm" size="medium" :disabled ="updateShow"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="英文船名" prop="ywchm" >
              <el-input v-model="formData.ywchm" size="medium" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货物名称" prop="hwmchXl" >
              <el-input v-model="formData.hwmchXl" size="medium"  disabled ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="海关放行人" prop="hqcyrid" >
              <el-select
                v-model="formData.hqcyrid"
                placeholder="请选择"
                filterable
                clearable
                collapse-tags
                remote
                reserve-keyword
                :remote-method='remoteMethod'
                @focus="focus"
                size="medium"
              >
                <el-option
                  v-for="(item, index)  in hqcyrList"
                  :key="item.hqcyrid"
                  :label="item.hqcyr"
                  :value="item.hqcyrid">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="重量" prop="zhl" >
              <el-input v-model="formData.zhl" size="medium"  disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="抵港日期" prop="dgrq" >
              <el-date-picker type="date"  value-format="YYYY-MM-DD" placeholder="选择日期" v-model="formData.dgrq" size="medium"   ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="已通关数" prop="tgs" >
              <el-input v-model="formData.tgs" size="medium"  disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item title="放行单信息" name="2">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提单号" prop="tdh" >
              <el-input v-model="formData.tdh" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="IMO" prop="imo" >
              <el-input v-model="formData.imo" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理航次" prop="dlhc" >
              <el-input v-model="formData.dlhc" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="英文船名" prop="ywchm" >
              <el-input v-model="formData.ywchm" size="medium"  disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="报关单号" prop="bgdh" >
              <el-input v-model="formData.bgdh" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!--不能改是因为关联到货健表，通关数是累加的，修改这个不知道上次是多少了-->
            <el-form-item label="通关数量" prop="fxshl" >
              <el-input  v-model="formData.fxshl" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="备注" prop="note" >
              <el-select v-model="formData.note" placeholder="请选择状态" size="medium">
                <el-option label="全部通关" value="全部通关"></el-option>
                <el-option label="" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="放行日期" prop="fxrq" >
              <el-date-picker type="date"
                              value-format="YYYY-MM-DD"
                              placeholder="选择日期"
                              v-model="formData.fxrq"
                              size="medium"
                              format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="控货件数" prop="khjsh" >
              <el-input  v-model="formData.khjsh" size="medium" ></el-input>
            </el-form-item>
          </el-col>

        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script setup name="drawer">
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  const { proxy } = getCurrentInstance() // 相当于vue2里的this
  //import Select from '@/components/Select'
  //import RemoteSelect from '@/components/RemoteSelect'
  import publicApi from '@/api/public/index'
  const collapseOpen = ['1', '2'] // 打开的面板
  let selectLabel = ref('dictLabel')
  let selectValue = ref('dictValue')
  const myValue = ref('')
  const myLabel = ref('')
  const ruleForm = ref()
  const myValue1 = ref('')
  const myLabel1 = ref('')

  const zygsOptions =ref([{ zygsdm: '', zygsmch: '' }])
  const zhwchmList = ref([{ zhwchm: '', value: '', cargokey: '', hc: '' }])
  const hqcyrList =ref([{ hqcyrid: '', hqcyr: '' }])
  const zcList = ref([])
  const isShowChm = ref(true)
  const chmUpdateShow = ref(false)//修改页面显示这个中文船名
  const chmInsertShow = ref(true)//默认显示这个中文船名
  const  updateShow = ref(false)//新增页面这些都是可操作的，修改的时候改成不可操作为true
  const changeSelect1 = val => {
    console.log('远程回显')
    console.log(val, myValue1.value, myLabel1.value) // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
  }
  const formData = reactive({
    id:null,
    hqcyrid: '',
    hqcyr: '',
    zygsdm: '',
    zygsmch: '',
    zhwchm: '',
    hwdmXl: '',
    hwmchXl: '',
    zhl: '',
    dgrq: '',
    cargokey: '',
    tgs: '',
    khfs: '',
    hc: '',
    // 放行单信息
    tdh: '',
    imo: '',
    dlhc: '',
    xcdId: '',
    ywchm: '',
    fxrq: '',
    bgdh: '',
    fxshl: 0,
    note: '',
    khjsh:''
  })
  const rules = reactive({
    hqcyrid: proxy.getRules({
      required: true,
    }),
    fxrq: proxy.getRules({
      required: true,
    }),
    // zygsdm: proxy.getRules({
    //   required: true,
    // }),
    cargokey: proxy.getRules({
      required: true,
    }),
    dgrq: proxy.getRules({
      required: true,
    }),
    fxshl: proxy.getRules({
      required: true, numberCheck: { int: 11, dec: 4, startWith: '+' }
    }),
  })
  const getOrglist = () => {
    // 作业公司
    proxy.$request({
      url: '/hgfx/getZygsInfo',
      method: 'post',
    }).then(res => {
      zygsOptions.value = res.data;
    })

  }
  /**
   * 初始化
   */
    const init = (hqcyrid, hqcyr) => {
    // 海关放行人list
      proxy.$request({
      url: `/hgfx/getHqcyrInfo?hqcyrid=${hqcyrid}&hqcyr=${hqcyr}`,
      method: 'POST'
    }).then(res => {
      if (res.code === '0000') {
        hqcyrList.value = res.data
      }
    })
  }
  const remoteMethod = (query) => {
    // 输入文字模糊搜索，覆盖旧数据
     init('', query)
  }
  const focus = (event) => {
    if (!event.sourceCapabilities) return // 如果是勾选或反选下拉选项
    if (!event.target.value) { // 输入框没有搜索条件时触发
      init('', '')
    }
  }
  /**
   * 作业公司改变，查询该作业公司下对应的船舶
   */

  const getKhxxByZygsdm = zhwchm => {
    isShowChm.value = false
    var lb = '进口'
    proxy.$request({
      url: `/hgfx/getKhxxByZygsdm?zhwchm=${zhwchm}&lb=${lb}`,
      method: 'post'
    }).then(res => {
      if (res.data !== null) {
        zhwchmList.value = res.data
        zcList.value = res.data // 暂存数据用于后面过滤
      }
    })

  }
  const remoteMethodShipJK = query => {
    // 输入文字模糊搜索，覆盖旧数据
    getKhxxByZygsdm(query)

  }
  const focusShipJK = event => {
    if (!event.sourceCapabilities) return // 如果是勾选或反选下拉选项
    if (!event.target.value) { // 输入框没有搜索条件时触发
      // this.getKhxxByZygsdm('')
    }
  }
  /**
   * 选中某一条船（中文船名），自动赋值其他字段数据
   */
  const changekhxx = () => {
    // 海关放行人list（先进行海关放行人筛选，再赋值id，才能对应上）
    proxy.$request({
      url: `/hgfx/getHqcyrInfo?hqcyrid=${zcList.value.filter(item => item.cargokey === formData.cargokey)[0].hthqcyrid}`,
      method: 'POST'
    }).then(res => {
      if (res.code === '0000') {
        hqcyrList.value = res.data
        const chbForm = JSON.parse(JSON.stringify(zcList.value.filter(item => item.cargokey === formData.cargokey)[0]))
        formData.hqcyrid = JSON.parse(JSON.stringify(chbForm.hthqcyrid))
        formData.hqcyr = JSON.parse(JSON.stringify(chbForm.hthqcyr))
        formData.zygsdm = JSON.parse(JSON.stringify(chbForm.zygsdm))
        formData.zygsmch = JSON.parse(JSON.stringify(chbForm.zygsmch))
        formData.zhwchm = JSON.parse(JSON.stringify(chbForm.zhwchm))
        formData.ywchm = JSON.parse(JSON.stringify(chbForm.ywchm))
        formData.hwdmXl = JSON.parse(JSON.stringify(chbForm.hwdmXl))
        formData.hwmchXl = JSON.parse(JSON.stringify(chbForm.hwmchXl))

        formData.zhl = JSON.parse(JSON.stringify(chbForm.zhl))
        formData.dgrq = JSON.parse(JSON.stringify(chbForm.dgrq))
        formData.cargokey = JSON.parse(JSON.stringify(chbForm.cargokey))
        formData.tgs = JSON.parse(JSON.stringify(chbForm.tgs))
        formData.khfs = JSON.parse(JSON.stringify(chbForm.khfs))
        if (chbForm.imo !== null) {
          formData.imo = JSON.parse(JSON.stringify(chbForm.imo))//加判断的原因是经过json会把null变成字符串‘null’
        }
        formData.hc = JSON.parse(JSON.stringify(chbForm.hc))

      }
    })
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
    chmUpdateShow.value = false //每次重置都要把该显示字段复原
    chmInsertShow.value = true
    updateShow.value = false
  }
  const changeSelect = val => {
    console.log(val, myValue.value, myLabel.value)
  }
  //修改的时候修改字段展示
  const showUpdate=() =>{
      chmUpdateShow.value = true
      chmInsertShow.value = false
      updateShow.value = true
  }
  defineExpose({
    validate,
    resetForm,
    showUpdate,
    formData,
    hqcyrList,
    getKhxxByZygsdm
  })
</script>
<style lang="scss" scoped>
  @import '@/assets/styles/formData.scss';
</style>
