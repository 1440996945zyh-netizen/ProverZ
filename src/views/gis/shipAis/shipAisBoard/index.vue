<template>
  <div class="ship-ais-board">
    <div class="click-overlay-inner">
      <div class="click-overlay-inner-header">
        <div class="click-overlay-inner-header-title">{{ clickFeature.name || clickFeature.nameEn }}</div>
        <el-button style="float: right" type="text"
                   @click="switchClickOverlays; showTrackSidebar(clickFeature)">
          播放轨迹
        </el-button>
      </div>
      <div class="click-overlay-inner-body">
        <el-tabs v-model="activeName" class="demo-tabs" stretch>
          <el-tab-pane label="AIS信息" name="first">
            <div class="half-line">
              <div class="half-line-part"><div>船名</div>{{ clickFeature.name }}</div>
              <div class="half-line-part"><div>英文船名</div>{{ clickFeature.nameEn }}</div>
            </div>
            <div class="half-line">
              <div class="half-line-part"><div>MMSI</div>{{ clickFeature.mmsi }}</div>
              <div class="half-line-part"><div>呼号</div>{{ clickFeature.callSign }}</div>
            </div>
            <div class="half-line">
              <div class="half-line-part"><div>航速</div>{{ clickFeature.speed }}</div>
              <div class="half-line-part"><div>船首向</div>{{ clickFeature.heading }}</div>
            </div>
            <div class="half-line">
              <div class="half-line-part"><div>转向率</div>{{ clickFeature.rot }}</div>
              <div class="half-line-part"><div>航向</div>{{ clickFeature.cg }}</div>
            </div>
            <div class="half-line">
              <div class="half-line-part"><div>状态</div>{{ clickFeature.status }}</div>
              <div class="half-line-part"><div>作业状态</div>{{ clickFeature.workStatus ? clickFeature.workStatus : '' }}</div>
            </div>
            <div class="half-line">
              <div class="half-line-part"><div>AIS时间</div>{{ clickFeature.gpsTime }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="基本信息" name="second" v-if="shipBaseInfo.hasOwnProperty('SHIP_NAME')">
            <div class="three-line">
              <div class="three-line-part"><div>船名</div>{{ shipBaseInfo.SHIP_NAME }}</div>
              <div class="three-line-part"><div>速记码</div>{{ shipBaseInfo.SHORTHAND_CODE }}</div>
              <div class="three-line-part"><div>船舶类型</div>{{ shipBaseInfo.SHIP_KIND_LABEL }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>船籍</div>{{ shipBaseInfo.NATION_LABEL }}</div>
              <div class="three-line-part"><div>船型</div>{{ shipBaseInfo.SHIP_TYPE_LABEL }}</div>
              <div class="three-line-part"><div>IMO</div>{{ shipBaseInfo.IMO }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>MMSI</div>{{ shipBaseInfo.MMSI }}</div>
              <div class="three-line-part"><div>呼号</div>{{ shipBaseInfo.CALL_NO }}</div>
              <div class="three-line-part"><div>船长</div>{{ shipBaseInfo.SHIP_LENGTH }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>船宽</div>{{ shipBaseInfo.SHIP_WIDTH }}</div>
              <div class="three-line-part"><div>船高</div>{{ shipBaseInfo.SHIP_HEIGHT }}</div>
              <div class="three-line-part"><div>自重</div>{{ shipBaseInfo.SELF_WEIGHT }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>净吨</div>{{ shipBaseInfo.NET_WEIGHT }}</div>
              <div class="three-line-part"><div>总吨</div>{{ shipBaseInfo.TOTAL_WEIGHT }}</div>
              <div class="three-line-part"><div>舱口数</div>{{ shipBaseInfo.HATCH_NUM }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>舱层数</div>{{ shipBaseInfo.CABIN_LAYER_NUM }}</div>
              <div class="three-line-part"><div>载重吨</div>{{ shipBaseInfo.DWT }}</div>
              <div class="three-line-part"><div>舱容</div>{{ shipBaseInfo.CABIN_VOLUME }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>舱口尺寸</div>{{ shipBaseInfo.HATCH_SIZE }}</div>
              <div class="three-line-part"><div>最大船速</div>{{ shipBaseInfo.MAX_SPEED }}</div>
              <div class="three-line-part"><div>航速</div>{{ shipBaseInfo.SPEED }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>型深</div>{{ shipBaseInfo.MOULDED_DEPTH }}</div>
              <div class="three-line-part"><div>吊机数量</div>{{ shipBaseInfo.HANGER_NUM }}</div>
              <div class="three-line-part"><div>舱型</div>{{ shipBaseInfo.DICT_LABEL }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>机舱位置</div>{{ shipBaseInfo.DICT_LABEL }}</div>
              <div class="three-line-part"><div>舱口盖</div>{{ shipBaseInfo.DICT_LABEL }}</div>
              <div class="three-line-part"><div>吊机位置</div>{{ shipBaseInfo.MDD_HANGER_LOCATION_LABEL }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>船长电话</div>{{ shipBaseInfo.CAPTAIN_PHONE }}</div>
              <div class="three-line-part"><div>船长姓名</div>{{ shipBaseInfo.CAPTAIN_NAME }}</div>
              <div class="three-line-part"><div>建造年月</div>{{ shipBaseInfo.BUILT_YM }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>淡水容量</div>{{ shipBaseInfo.WATER_VOLUME }}</div>
              <div class="three-line-part"><div>富余水深</div>{{ shipBaseInfo.SURPLUS_WATER_DEPTH }}</div>
              <div class="three-line-part"><div>满载吃水</div>{{ shipBaseInfo.FULL_LOAD_WATER }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>空载吃水</div>{{ shipBaseInfo.EMPTY_LOAD_WATER }}</div>
              <div class="three-line-part"><div>头驾距离</div>{{ shipBaseInfo.HEADER_COCKPIT_DISTANCE }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="预到信息" name="third" v-if="shipBaseInfo.hasOwnProperty('SHIP_NAME')">
            <div class="three-line">
              <div class="three-line-part"><div>中文船名</div>{{ shipPreComing.SHIP_NAME }}</div>
              <div class="three-line-part"><div>进出口</div>{{ shipPreComing.IMP_EXP_LABEL }}</div>
              <div class="three-line-part"><div>贸别</div>{{ shipPreComing.TRADE_TYPE_LABEL }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>装卸</div>{{ shipPreComing.LOAD_UNLOAD }}</div>
              <div class="three-line-part"><div>加油加水</div>{{ getWord(shipPreComing.IS_WATER) }}</div>
              <div class="three-line-part"><div>接岸电</div>{{ getWord(shipPreComing.IS_SHORE_POWER) }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>预加水量</div>{{ shipPreComing.REQ_WATER }}</div>
              <div class="three-line-part"><div>预加油量</div>{{ shipPreComing.REQ_ELECTRICITY }}</div>
              <div class="three-line-part"><div>需要拖轮</div>{{ getWord(shipPreComing.IS_TUG) }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>抵港艏吃水</div>{{ shipPreComing.BOW_DRAFT }}</div>
              <div class="three-line-part"><div>抵港艉吃水</div>{{ shipPreComing.STERN_DRAFT }}</div>
              <div class="three-line-part"><div>是否扣除预缴费用</div>{{ getWord(shipPreComing.IS_PAYMENT) }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>拖轮个数</div>{{ shipPreComing.TUG_NUMBER }}</div>
              <div class="three-line-part"><div>引航方式</div>{{ getPilotage(shipPreComing.PILOTAGE) }}</div>
              <div class="three-line-part"><div>预缴金额</div>{{ shipPreComing.PAYMENT_AMOUNT }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>危险物品</div>{{ shipPreComing.IS_DANGEROUS }}</div>
              <div class="three-line-part"><div>预抵日期</div>{{ shipPreComing.ARRIVAL_TIME_PLAN }}</div>
              <div class="three-line-part"><div>预离日期</div>{{ shipPreComing.LEAVE_PORT_TIME_PLAN }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>抵锚时间</div>{{ shipPreComing.ARRIVAL_ANCHORAGE_TIME }}</div>
              <div class="three-line-part"><div>起锚时间</div>{{ shipPreComing.LEAVE_ANCHORAGE_TIME }}</div>
              <div class="three-line-part"><div>靠泊时间</div>{{ shipPreComing.BERTH_TIME }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>泊位名称</div>{{ shipPreComing.BERTH_NAME }}</div>
              <div class="three-line-part"><div>舷靠</div>{{ shipPreComing.BERTH_TYPE }}</div>
              <div class="three-line-part"><div>首榄</div>{{ shipPreComing.BOLLARD_NAME_START }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>尾榄</div>{{ shipPreComing.BOLLARD_NAME_END }}</div>
              <div class="three-line-part"><div>离泊时间</div>{{ shipPreComing.LEAVE_BERTH_TIME }}</div>
              <div class="three-line-part"><div>接收人</div>{{ shipPreComing.RECEIVE_BY_NAME }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>接收时间</div>{{ shipPreComing.RECEIVE_TIME }}</div>
              <div class="three-line-part"><div>起运港</div>{{ shipPreComing.START_PORT_NAME }}</div>
              <div class="three-line-part"><div>目的港</div>{{ shipPreComing.END_PORT_NAME }}</div>
            </div>
            <div class="three-line">
              <div class="three-line-part"><div>上一港</div>{{ shipPreComing.PRE_PORT_NAME }}</div>
              <div class="three-line-part"><div>下一港</div>{{ shipPreComing.NEXT_PORT_NAME }}</div>
              <div class="three-line-part"><div>状态</div>{{ shipPreComing.SHIP_STATUS_NAME }}</div>
            </div>
            <div class="one-line">
              <div class="one-line-part"><div>备注</div>{{ shipPreComing.REMARK }}</div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script name="ShipAisBoard" setup>
const emit = defineEmits(['switchClickOverlays', 'showTrackSidebar:value'])
const props = defineProps({
  clickFeature: {
  type: Object,
  default: () => {},
},
  shipBaseInfo: {
    type: Object,
    default: () => {}
  },
  shipPreComing: {
    type: Object,
    default: () => {}
  },
});

const activeName = ref('first');
const getWord = (num) => {
  if (num == 1) {
    return '是';
  } else if (num == 0) {
    return '否';
  } else {
    return '';
  }
}
const getPilotage = (num) => {
  if (num == 1) {
    return '自引';
  } else if (num == 2) {
    return '引航';
  } else if (num == 3) {
    return '进自引出引航';
  } else if (num == 4) {
    return '出引航进自引';
  } else {
    return '';
  }
}
const switchClickOverlays = () => {
  emit('switchClickOverlays');
}
const showTrackSidebar = (clickFeature) => {
  emit('showTrackSidebar', clickFeature);
}
</script>

<style lang="scss" scoped>
.ship-ais-board {
  width: 400px;
  height: 250px;
  background: white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  border-radius: 17px;
  display: flex;
  justify-content: start;
  flex-direction: column;
}

.ship-ais-board:after {
  top: 100%;
  border: solid transparent;
  content: " ";
  position: absolute;
  border-top-color: white;
  border-width: 30px 25px 0 0;
  left: 230px;
}
.click-overlay-inner {
  width: 98%;
  margin: 0 auto;
}
.click-overlay-inner-header {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px #ebeef5 solid;
  .click-overlay-inner-header-title {
    display: inline-block;
    margin-left: 40px;
  }
  .el-button {
    margin-top: 4px;
    margin-right: 20px;
  }
}
.click-overlay-inner-body {
  font-size: 13px;
  line-height: 22px;
  .half-line {
    .half-line-part {
      width: 48%;
      margin: 0 1%;
      display: inline-block;
      border-bottom: #0C85DE 1px dotted;
      div {
        display: inline-block;
        width: 54px;
        text-align: right;
        margin-right: 5px;
        color: #0C85DE;
      }
    }
  }
  .three-line {
    .three-line-part {
      width: 32.33%;
      margin: 0 0.5%;
      display: inline-block;
      border-bottom: #0C85DE 1px dotted;
      div {
        display: inline-block;
        width: 54px;
        text-align: right;
        margin-right: 5px;
        color: #0C85DE;
      }
    }
  }
  .one-line {
    .one-line-part {
      display: inline-block;
      width: 99%;
      border-bottom: #0C85DE 1px dotted;
      div{
        width: 54px;
        display: inline-block;
        text-align: right;
        margin-right: 5px;
        color: #0C85DE;
      }
    }
  }
}
::v-deep(.el-tabs__item) {
  padding: 0;
}
::v-deep(.el-tabs) {
  --el-tabs-header-height: 20px;
  padding-left: 0 !important;
}
/*去掉tabs底部的下划线*/
::v-deep(.el-tabs__nav-wrap::after) {
  background-color: transparent !important;
}

::v-deep(.el-tabs__active-bar) {
  background-color: transparent !important;
}
::v-deep(.el-tabs__content) {
  max-height: 170px !important;
  overflow-y: auto;
}
</style>
