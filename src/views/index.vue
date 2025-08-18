<template>
  <div class="app-container home">
    <div class="app-container home" v-show="!is_yanshi">
      <h1 v-if="baseUrl.includes('localhost')">扬奕E-port——开发环境</h1>
      <h1 v-else-if="baseUrl.includes('172.18.5.147')">扬奕E-port</h1>
      <h1 v-else>扬奕E-port</h1>
    </div>

    <el-row :gutter="20" v-show="is_yanshi">
      <el-col :lg="6">
        <el-card class="card_item" shadow="hover">
          <div class="card_item_t">
            <span>船舶艘次</span>
            <img src="../assets/home_icon/main_icon_006.svg" alt="" @click="showReport(1)" />
          </div>
          <div class="card_item_m">
            <div class="number_size">
              <!-- <div class="number" v-if="actualtotal.length">{{ actualtotal[0].weight }}</div> -->
              <div class="number">1332</div>
              <div class="unit">次</div>
            </div>
            <div class="txt_number">
              <div class="day_txt">
                <span>年同比</span>
                <span :class="sumtucompare.rateDay > 0 ? 'red' : 'green'">{{ sumtucompare.rateDay }}%</span>
                <i class="iconfont icon-el-icon-caret-top1 red" v-if="sumtucompare.rateDay > 0"></i>
                <i class="iconfont icon-el-icon-caret-bottom1 green" v-else></i>
              </div>
              <div class="week_txt">
                <span>月同比</span>
                <span :class="sumtucompare.rateWeek > 0 ? 'red' : 'green'">{{ sumtucompare.rateWeek }}%</span>
                <i class="iconfont icon-el-icon-caret-top1 red" v-if="sumtucompare.rateWeek > 0"></i>
                <i class="iconfont icon-el-icon-caret-bottom1 green" v-else></i>
              </div>
            </div>
          </div>
          <div class="card_item_b">
            <div class="txt">年目标量</div>
            <div class="num" v-if="plantotal.length">{{ plantotal[0].sumVolume ? plantotal[0].sumVolume / 10000 : 0 }}万吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6">
        <el-card class="card_item" shadow="hover">
          <div class="card_item_t">
            <span>吞吐量</span>
            <img src="../assets/home_icon/main_icon_006.svg" alt="" @click="showReport(2)" />
          </div>
          <div class="card_item_m">
            <div class="number_size">
              <!-- <div class="number" v-if="actualtotal.length">{{ actualtotal[1].weight }}</div> -->
              <div class="number">14,963,548.03</div>
              <div class="unit">吨</div>
            </div>
            <div class="">
              <titleCharts ref="titleChartsRef" />
            </div>
          </div>
          <div class="card_item_b">
            <div class="txt">年目标量</div>
            <div class="num" v-if="plantotal.length">{{ plantotal[3].sumVolume ? plantotal[3].sumVolume / 10000 : 0 }}万吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6">
        <el-card class="card_item" shadow="hover">
          <div class="card_item_t">
            <span>外贸量</span>
            <img src="../assets/home_icon/main_icon_006.svg" alt="" @click="showReport(3)" />
          </div>
          <div class="card_item_m">
            <div class="number_size">
              <!-- <div class="number" v-if="actualtotal.length">{{ actualtotal[2].weight }}</div> -->
              <div class="number">8,365,558.03</div>
              <div class="unit">吨</div>
            </div>
            <div class="txt_number" v-if="proDatafenmu != '' && proDatafenzi != ''">
              <el-progress
                :stroke-width="9"
                :percentage="(proDatafenmu / proDatafenzi) * 100"
                :show-text="false"
              ></el-progress>
            </div>
          </div>
          <div class="card_item_b">
            <div class="txt">年目标量</div>
            <div class="num" v-if="plantotal.length">{{ plantotal[1].sumVolume ? plantotal[1].sumVolume / 10000 : 0 }}万吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6">
        <el-card class="card_item" shadow="hover">
          <div class="card_item_t">
            <span>在线用户</span>
            <img src="../assets/home_icon/main_icon_001.svg" alt="" />
          </div>
          <div class="card_item_m">
            <div class="number_size">
              <div class="number">{{ onlineUser.onlineCount }}</div>
              <div class="unit">位</div>
              <div class="txt" @click="openVisitNum">在线用户排行</div>
            </div>
            <div class="txt_number" style="padding: 10px 0">
              <el-tooltip
                class="item"
                :content="item.userName"
                placement="top"
                v-for="(item, index) in onlineUser.onlineUserDTOS"
                :key="index"
              >
                <img src="../assets/home_icon/morentouxiang.svg" alt="" />
              </el-tooltip>
            </div>
          </div>
          <div class="card_item_b">
            <div class="txt">总用户数</div>
            <div class="num">{{ onlineUser.userCount }}人</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 中部 -->
    <!-- <el-row style="margin-top: 20px" v-show="is_yanshi">
      <el-col
        :lg="3"
        v-for="(item, index) in serviceList"
        :key="index"
        @dblclick.native.stop="editFastEntry"
        @click.native="goToserviceList(index)"
      >
        <div class="service_item">
          <div class="service_icon">
            <img :src="item.src" alt="" v-if="item.src" width="36" />
            <i v-else :class="item.icon" class="iconfont" :style="{ fontSize: '36px', color: item.color }"></i>
          </div>
          <div class="service_name" v-if="item.text">{{ item.text }}</div>
          <div class="service_name" style="color: #cbcfd5" v-else>暂未配置</div>
        </div>
      </el-col>
    </el-row> -->
    <!-- 中部收藏快捷区域 -->
    <el-row v-show="is_yanshi" style="margin-top: 10px;">
      <FastEntry @getMenuList="getMenuList" style=" height: 100%; display: flex; flex-direction: row"></FastEntry>
    </el-row>
    <!-- 底部图标 -->
    <!-- <el-row style="margin-top: 20px"> -->
    <el-card class="throughput_item" shadow="hover" style="width: 100%; margin-top: 10px" v-show="is_yanshi">
      <el-row class="throughput_item_t">
        <el-col :lg="15">
          <div class="title_l">
            <i
              class="iconfont icon-tuntuliang-01"
              :style="{ fontSize: '22px', color: '#CAE8FF', backgroundColor: '#3180FB', borderRadius: '50%' }"
            ></i>
            <span>吞吐量</span>
          </div>
        </el-col>
        <el-col :lg="9">
          <div class="title_r">
            <div
              :class="['item', itemIndex === index ? 'active' : '']"
              v-for="(item, index) in itemList"
              :key="index"
              @click="itemHandleClick(index)"
            >
              {{ item }}
            </div>
            <el-date-picker
              size="mini"
              v-model="defaultDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleChange"
            ></el-date-picker>
          </div>
        </el-col>
      </el-row>
      <el-row class="throughput_item_b">
        <el-col :lg="18">
          <div class="title">货物吞吐量</div>
          <div style="padding-right: 30px">
            <throughputCharts ref="throughputOptionsRef" />
          </div>
        </el-col>
        <el-col :lg="6">
          <div class="title">货物吞吐量排行</div>
          <ul>
            <li v-for="(item, index) in sumtucargoList" :key="index">
              <div class="txt" :class="[index < 3 ? 'active' : '']">{{ index + 1 }}</div>
              <div class="txt">{{ item.cargoName }}</div>
              <div class="txt">{{ item.weight }}</div>
            </li>
          </ul>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="Index">
const baseUrl = reactive(window.location.hostname)
import * as echarts from 'echarts'
import throughputCharts from './home/throughputCharts/index.vue'
import titleCharts from './home/titleEcharts/index.vue'
import { onMounted, getCurrentInstance, reactive, nextTick } from 'vue'
import usePermissionStore from '@/store/modules/permission'
import api from '@/api/system/user'
import { useRoute } from 'vue-router'
import useUserStore from '@/store/modules/user'
import FastEntry from '@/components/FastEntry/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const version = ref('3.8.5')
// ============================================密码修改==================================
const changeVisible = ref(false)
//首先在setup中定义
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const is_yanshi = ref(true)
//query
// 权限
const permissionStore = usePermissionStore()
//
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))
console.log("sidebarRouters")
console.log(sidebarRouters.value)
let arr = []
sidebarRouters.value.forEach( v => {
  // 去掉 children 属性，避免循环引用
  const { children, ...routeWithoutChildren } = v
  arr.push(routeWithoutChildren)
})
const sideRoutes = arr
console.log(sideRoutes)
const getUser = () => {
  console.log(userStore.name)
  //is_yanshi.value = userStore.name=='系统管理员'
}
getUser()

let flagVal = ref(route.query.flagVal)
const formData = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined,
})
const equalToPassword = (rule, value, callback) => {
  if (formData.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    {
      pattern: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]*$/,
      message: '请输入正确格式密码，必须是大小写字母、符号、数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' },
  ],
})

const ruleForm = ref()

const resetForm = () => {
  proxy.resetObj(formData)
}

const save = async () => {
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(formData)) // 取到子组件的formData

      proxy.$modal.confirm('确定保存？').then(() => {
        api.updateUserPwd(params.oldPassword, params.newPassword).then(res => {
          proxy.$modal.msgSuccess(res.msg)

          changeVisible.value = false

          setTimeout(() => {
            userStore.logOut().then(() => {
              location.href = '/index'
            })
          }, 1000)
        })
      })
    } else {
      proxy.$modal.msgWarning('密码不符合格式，请先修改密码')
    }
  })
}

function goTarget(url) {
  if (flagVal.value) {
    changeVisible.value = true
  } else {
    changeVisible.value = false
  }
}

goTarget()
const titleChartsRef = ref(null)
const throughputOptionsRef = ref(null)
const itemList = ref(['今日', '月度', '全年'])
const defaultDate = ref(['2025-05-25', '2023-05-29'])
const sumtucargoList = ref([
  { cargoName: '金属矿石', weight: '6,126,255.45' },
  { cargoName: '煤炭', weight: '2,024,202.65' },
  { cargoName: '矿物性材料', weight: '550,121.03' },
  { cargoName: '化工原料', weight: '268,492.956' },
  { cargoName: '石油', weight: '102,834.5' },
  { cargoName: '木材', weight: '49,520.98' },
])
const proDatafenmu = ref(10020)
const proDatafenzi = ref(50000)
const sumtucompare = ref({
  rateDay: 130,
  rateWeek: 115,
})
const plantotal = ref([
  { volumeType: '101', sumVolume: '132300000.00' },
  { volumeType: '201', sumVolume: '31350000.00' },
  { volumeType: '301', sumVolume: '60000000.00' },
  { volumeType: '401', sumVolume: '70170000.00' },
])
// 在线用户
const onlineUser = ref({
  onlineCount: 3,
  userCount: 1000,
  onlineUserDTOS: [
    { userNO: '2021090901', userName: '金港测试', avatar: null },
    { userNO: '140068', userName: '严佳婷', avatar: null },
    { userNO: '150028', userName: '郭道华', avatar: null },
    { userNO: '220108', userName: '钟晨薇', avatar: null },
    { userNO: '9202068', userName: '胡铁琦', avatar: null },
  ],
})
const getTitleCharts = () => {
  let data = [
    // { companyName: '江苏港口矿业科技有限公司', weight: '848.52' },
    { companyName: '散货码头有限公司', weight: '7345997.78' },
    { companyName: '西作业区码头有限公司', weight: '26116168.04' },
    { companyName: '东作业区码头有限公司', weight: '13022765.69' },
  ]
  nextTick(() => {
    titleChartsRef.value.naturalOptions.xAxis.data = data.map(item => item.companyName)
    titleChartsRef.value.naturalOptions.series[0].data = data.map(item => item.weight)
    // console.log('上图表', titleChartsRef.value.naturalOptions)
  })
}
getTitleCharts()
// 快速入口
const goToserviceList = index => {
  if (index == 0) {
    router.push('/produce/portTrends')
  }
}
const getThroughputOptions = () => {
  // 由于现在改为柱状图，这个函数不再需要
  // 图表数据现在由throughputCharts组件内部管理
}

// 处理时间切换点击事件
const itemHandleClick = (index) => {
  const types = ['today', 'month', 'year']
  if (types[index] && throughputOptionsRef.value) {
    throughputOptionsRef.value.switchDataType(types[index])
  }
}

// 中间图标配置
const serviceList = ref([
  {
    icon: 'icon-tubiao-01',
    id: '',
    text: '',
    color: '#F75E5E',
    radio: 1,
  },
  {
    icon: 'icon-tongyongtubiao1',
    id: '',
    text: '',
    radio: 2,
    color: '#5a59a6',
  },
  {
    icon: 'icon-zongheguanli',
    id: '',
    text: '',
    color: '#edb01b',
  },
  {
    icon: 'icon-tongyongtubiao2',
    id: '',
    text: '',
    color: '#45b6e4',
  },
  {
    icon: 'icon-danzhengzhongxin',
    id: '',
    text: '',
    color: '#80DA22',
  },
  {
    icon: 'icon-zuoye',
    id: '',
    text: '',
    color: '#F7B500',
  },
  {
    icon: 'icon-kuchangguanli',
    id: '',
    text: '',
    color: '#F75E5E',
  },
  {
    icon: 'icon-shangcaiyitihua',
    id: '',
    text: '',
    color: '#45b6e4',
  },
])

const getMenuList = data => {
  // serviceList.value = data
}
/**
 * 获取快捷入口区域列表
 */
const getFastEntry = async () => {
  addParentPath(sideRoutes)
  const response = await api.getCustomRegionList()
  if (response.code == '0000') {
    serviceList.value = response.data.slice(0, 8)
    serviceList.value.forEach(i => {
      delete i.id
      i.icon = 'icon-shangcaiyitihua'
      i.path = getMenuPath(i.menuId).path
      i.icon = getMenuPath(i.menuId).icon
    })
    console.log('serviceList.value', serviceList.value)
  }
}
const getMenuPath = menuId => {
  const route = findRouteById(sideRoutes, menuId)
  if (route) {
    const parentPaths = getParentPaths(route)
    return { path: parentPaths.join('/') + '/' + route.path, icon: route.icon }
  }
  return ''
}
const findRouteById = (routes, id) => {
  for (const route of routes) {
    if (route.id === id) {
      return route
    }
    if (route.children) {
      const found = findRouteById(route.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}
const getParentPaths = (route, paths = []) => {
  if (route.parentPath) {
    paths.unshift(route.parentPath)
    getParentPaths(route.parent, paths)
  }
  return paths
}
const addParentPath = routes => {
  routes.forEach(route => {
    if (route.children) {
      route.children.forEach(child => {
        child.parent = route
        child.parentPath = route.path
      })
      addParentPath(route.children)
    }
  })
}

onMounted(() => {
  // getFastEntry()
})
</script>

<style scoped lang="scss">
.green {
  color: #1ab667;
}

.red {
  color: #e02020;
}
.home {
  background-color: #f5f7f9;
}
.card_item {
  height: 200px;

  ::v-deep .el-card__body {
    padding: 0;
  }

  .card_item_t {
    display: flex;
    padding: 10px 16px;
    justify-content: space-between;
    align-items: center;
    height: 40px;

    span {
      font-family: 'Microsoft YaHei';
      font-size: 16px;
      color: #303133;
      letter-spacing: 0;
      text-align: left;
      line-height: 20px;
    }
  }

  .card_item_m {
    padding: 0 16px;
    border-top: 1px solid #e9edf0;
    border-bottom: 1px solid #e9edf0;
    height: 120px;

    .number_size {
      padding: 20px 0 15px 0;
      display: flex;
      align-items: flex-end;

      .number {
        font-family: ArialMT;
        font-size: 28px;
        color: #303133;
        letter-spacing: 0;
        text-align: left;
        line-height: 22px;
      }

      .unit {
        margin-left: 10px;
        // font-family: MicrosoftYaHei;
        font-size: 12px;
        color: #909399;
        letter-spacing: 0;
        text-align: left;
      }

      .txt {
        margin-left: 30px;
        font-size: 14px;
        color: #338ce8;
        letter-spacing: 0;
        text-align: left;
      }
    }

    .txt_number {
      padding: 20px 0;
      // height: 35px;
      font-size: 12px;
      color: #606266;
      display: flex;

      ::v-deep .el-progress {
        width: 100%;
      }

      img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
      }

      img + img {
        margin-left: -5px;
      }

      .day_txt {
        width: 50%;

        span:nth-child(2) {
          margin-left: 5px;
          font-family: ArialMT;
        }
      }

      .week_txt {
        width: 50%;

        span:nth-child(2) {
          margin-left: 5px;
          font-family: ArialMT;
        }
      }
    }
  }

  .card_item_b {
    display: flex;
    padding: 10px 16px;
    justify-content: space-between;
    align-items: center;
    height: 40px;

    .txt {
      font-size: 12px;
      color: #606266;
    }

    .num {
      font-size: 12px;
      color: #909399;
    }
  }
}

.service_item {
  // height: 107px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
  cursor: pointer;
  ::v-deep .el-card__body {
    padding: 0;
  }

  .service_icon {
    text-align: center;
    padding-top: 25px;
  }

  .service_name {
    text-align: center;
    font-size: 14px;
    color: #606266;
    letter-spacing: 0;
    text-align: center;
    padding: 17px 0;
  }
}
.throughput_item {
  padding-bottom: 20px;

  ::v-deep .el-card__body {
    padding: 0;
  }

  .throughput_item_t {
    border-bottom: 1px solid #e9edf0;
    padding: 0 16px;
  }

  .title_l {
    display: flex;
    align-items: center;
    height: 50px;

    span {
      margin-left: 15px;
      font-size: 16px;
      color: #303133;
      letter-spacing: 0;
      line-height: 16px;
    }
  }

  .title_r {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 50px;
    .item {
      margin: 0 15px;
      font-size: 14px;
      color: #606266;
      letter-spacing: 0;
      text-align: center;
      line-height: 34px;
      min-width: 30px;
    }
    .item {
      cursor: pointer;
    }
    .active {
      color: #338ce8;
    }
  }

  .throughput_item_b {
    padding: 0 16px;
    .title {
      font-size: 16px;
      color: #303133;
      letter-spacing: 0;
      line-height: 16px;
      padding: 24px 0;
    }

    li {
      display: flex;
      align-items: center;
      padding-right: 30px;

      div:nth-child(1) {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        text-align: center;
        line-height: 18px;
        font-size: 12px;
        color: #00003f;
        background: #f3f3f3;
        border: 1px solid #f0f0f0;
      }

      div:nth-child(2) {
        margin-left: 10px;
        font-size: 14px;
        color: #606266;
        letter-spacing: 0;
        text-align: center;
        line-height: 34px;
      }

      div:nth-child(3) {
        flex: 1;
        text-align: right;
        font-size: 14px;
        color: #909399;
        letter-spacing: 0;
        text-align: right;
        line-height: 34px;
        // margin-right: 0;
      }

      .txt.active {
        border: 1px solid #a2e5ff;
        background: #dcf5ff;
        color: #006ab7;
      }
    }
  }
}
.el-card {
  cursor: pointer;
}
</style>
