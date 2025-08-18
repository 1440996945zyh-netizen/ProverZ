<template>
  <div style="display: flex">
    <div class="floating-button">
      <div style="width: 40px; height: 40px;">
        <el-image
          style="width: 30px; height: 30px; margin-top:5px; color: rgba(255,255,255,0.5);"
          :src="refreshIcon" alt="刷新"
          fit="fill" @click="refreshData"></el-image>
      </div>
      <div style="width: 40px; height: 1px; background-color: rgb(64, 158, 255);">
      </div>
      <div style="width: 40px; height: 40px;">
        <el-image
          style="width: 30px; height: 30px; margin-top:5px; color: rgba(255,255,255,0.5);"
          :src="historyIcon" alt="跑垛历史"
          fit="fill" @click="showRunPileHistory"></el-image>
      </div>
      <div style="width: 40px; height: 1px; background-color: rgb(64, 158, 255);">
      </div>
      <div style="width: 40px; height: 40px;">
        <el-image
          style="width: 30px; height: 30px; margin-top:5px; color: rgba(255,255,255,0.5);"
          :src="needIcon" alt="待跑垛"
          fit="fill" @click="showRunPileNeed"></el-image>
      </div>
      <div style="width: 40px; height: 1px; background-color: rgb(64, 158, 255);">
      </div>
      <div style="width: 40px; height: 40px;">
        <el-image
          style="width: 30px; height: 30px; margin-top:5px; color: rgba(255,255,255,0.5);"
          :src="changeIcon" alt="切换"
          fit="fill" @click="changeStackShow"></el-image>
      </div>
      <div style="width: 40px; height: 1px; background-color: rgb(64, 158, 255);">
      </div>
    </div>
    <div class="floating-label">
      <div style="margin: 0px; padding: 0px;">
        <p>东作业区在港车辆：
          <a href="#" @click="showVehiclePort('01')" style="color: #1c84c6;text-underline: auto">
            {{dgVehicleNum}}
          </a>
        </p>
        <p>中作业区在港车辆：
          <a href="#" @click="showVehiclePort('02')" style="color: #1c84c6;text-underline: auto">
            {{zgVehicleNum}}
          </a>
        </p>
        <p>西作业区在港车辆：
          <a href="#" @click="showVehiclePort('03')" style="color: #1c84c6;text-underline: auto">
            {{xgVehicleNum}}
          </a>
        </p>
      </div>
    </div>

    <el-drawer
      title="跑垛历史" v-model="runPileHistoryVisible" size="60%">
      <runPileHistory/>
    </el-drawer>
    <el-drawer
      title="在港车辆" v-model="vehiclePortVisible" size="60%">
      <vehicleList ref="vehicleListRef"/>
    </el-drawer>


    <el-drawer
      title="待跑垛" v-model="runPileNeedVisible" size="60%">
      <runPileNeed/>
    </el-drawer>

    <div class="trackSidebar" v-if="trackSidebarVisible" :style="{height: innerHeight -84 + 'px'}">
      <div class="trackSidebar-inner">
        <div class="trackSidebar-inner-header">
          {{ !currentTrackBindsCarData.isAis ? currentTrackBindsCarData.macName : currentTrackBindsCarData.name }}
          <el-button style="float: right" icon="Close" circle @click="closeTrackSidebar"/>
        </div>
        <div class="trackSidebar-inner-body">
          <div class="trackSidebar-inner-form">
            <el-form :model="trackQueryForm" :rules="trackQueryFormRules" ref="trackQueryFormRef">
              <el-form-item label="起始时间" prop="beginTime">
                <el-date-picker v-model="trackQueryForm.beginTime" type="datetime" placeholder="选择起始时间"
                                value-format="YYYY-MM-DD HH:mm:ss" :clearable="false"/>
              </el-form-item>
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker v-model="trackQueryForm.endTime" type="datetime" placeholder="选择结束时间"
                                value-format="YYYY-MM-DD HH:mm:ss" :clearable="false"/>
              </el-form-item>
              <el-form-item>
                <el-button :disabled="0 !== trackPlayerState" @click="listTrack">查询轨迹
                </el-button>
              </el-form-item>
            </el-form>
            <el-form :model="trackOptions" :rules="trackOptionsRules" ref="trackOptionsRef">
              <el-form-item label="轨迹颜色" prop="color">
                <el-color-picker v-model="trackOptions.color" show-alpha :predefine="trackPredefineColors"
                                 :disabled="0 !== trackPlayerState"/>
              </el-form-item>
              <el-form-item label="轨迹宽度" prop="width">
                <el-input-number v-model="trackOptions.width" controls-position="right" :min="1" :max="10"
                                 placeholder="像素" :disabled="0 !== trackPlayerState"/>
              </el-form-item>
              <el-form-item label="播放间隔" prop="interval">
                <el-input-number v-model="trackOptions.interval" controls-position="right" :min="0.1" :max="1"
                                 placeholder="秒" :step="0.1" :precision="1" @change="trackPlayerTimeLapse"/>
              </el-form-item>
              <el-form-item>
                <el-button v-if="1 !== trackPlayerState"
                           :disabled="trackList.length === 0 || 1 === trackPlayerState" @click="playTrack">播放轨迹
                </el-button>
                <el-button v-else :disabled="1 !== trackPlayerState" @click="pausePlayTrack">暂停播放</el-button>
                <el-button :disabled="0 === trackPlayerState" @click="stopPlayTrack">停止播放</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="trackSidebar-inner-table">
            <div class="trackSidebar-inner-table-header">
              <table>
                <tr>
                  <td style="width: 56px; border-right: 1px solid #ebeef5">序号</td>
                  <td style="width: 156px; border-right: 1px solid #ebeef5">经度/纬度</td>
                  <td style="width: 150px; border-right: 1px solid #ebeef5">定位时间</td>
                  <td style="width: 55px">速度</td>
                </tr>
              </table>
            </div>
            <div class="trackSidebar-inner-table-body">
              <table>
                <tr v-for="( e, i ) in trackList">
                  <td style="width: 56px">{{ i + 1 }}</td>
                  <td style="width: 156px">{{ e.lon }} / {{ e.lat }}</td>
                  <td style="width: 150px">{{ e.gpsTime }}</td>
                  <td style="width: 55px">{{ e.speed }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="isShowSearchBar" class="search-bar">
      <el-select
        style="width: 400px;"
        v-model="currentSearchBarDataId"
        filterable
        placeholder="垛位/票货信息"
        clearable
        fit-input-width>
        <el-option v-for="item in stackList" :key="item.id" :label="item.label" :value="item.id" :title="item.label"></el-option>
      </el-select>
      <el-button @click="searchBarPosition" type="primary" plain style="margin: -1px; width: 80px; border-radius: 0 5px 5px 0;">定位
      </el-button>
    </div>

    <!-- 地图 -->
    <div :id="mapDivId" :style="{width: innerWidth + 'px', height: innerHeight -84 + 'px'}">
      <div :id="shipHoverOverlayDivId" class="hover-overlay ship-hover-overlay">
      </div>
      <div :id="stackHoverOverlayDivId" class="hover-overlay stack-hover-overlay">
      </div>
      <div :id="carHoverOverlayDivId" class="hover-overlay car-hover-overlay">
      </div>

      <div :id="shipClickOverlayDivId" class="click-overlay ship-click-overlay">
        <div class="click-overlay-inner">
          <div class="click-overlay-inner-header">
            {{ currentClickFeatureData.vesselName }}
          </div>
          <div class="click-overlay-inner-body">
            <div>首揽：{{ currentClickFeatureData.beginBollardName }}</div>
            <div>尾揽：{{ currentClickFeatureData.endBollardName }}</div>
          </div>
        </div>
      </div>
      <div :id="stackClickOverlayDivId" class="click-overlay" >
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane :label="currentClickFeatureData.stackName + '/' + currentClickFeatureData.storageName" name="first">
            <div style="height: 190px;width:100%;overflow-y:auto;">
              <div v-if="currentClickFeatureData.detail?.cargoInfos.length > 0">
                <div v-for="( e, i ) in currentClickFeatureData.detail?.cargoInfos" :key="i">
                  <div style="height:30px;line-height:30px;">
                    <div class="click-overlay-content" style="height:20px;width:20px;background-color: #82af6f;border-radius:10px;text-align:center;">{{ i + 1 }}</div>
                    <div class="click-overlay-content">  票货号:{{ e.cargoInfoNo }}</div>
                    <el-button icon="Operation" @click="showInoutDetail({massId : currentClickFeatureData.id, cargoInfoNo: e.cargoInfoNo})" style="left: 10px; background-color: #409eff; color: white; height:20px; width:20px;"/>
                  </div>
                  <div style="height:30px;line-height:30px;">
                    <div class="click-overlay-content">  船名航次:{{ e.shipNameVoyage }}</div>
                    <div class="click-overlay-content">  SCN:{{ e.scn }}</div>
                  </div>
                  <div style="height:30px;line-height:30px;">
                    <div class="click-overlay-content">货主:{{ e.cargoOwnerName }}</div>
                    <div class="click-overlay-content">货名:{{ e.cargoName }}</div>
                  </div>
                  <div style="height:30px;line-height:30px;">
                    <div class="click-overlay-content">交接清单量:{{ e.handoverlistTon }}</div>
                    <div class="click-overlay-content">港存量:{{ e.portStorageTon }}</div>
                  </div>
                </div>
              </div>
              <div style="height:30px;line-height:30px;">
                <div class="click-overlay-content">边长：{{ currentClickFeatureData.sideLength?.split(',').map(v1 => v1 + 'm').join(',') }}</div>
                <div class="click-overlay-content">面积：{{ currentClickFeatureData.area }}㎡</div>
              </div>
              <div style="height:30px;line-height:30px;">
                <div class="click-overlay-content">跑垛人：{{ currentClickFeatureData.createByName }}</div>
                <div class="click-overlay-content">跑垛时间：{{ currentClickFeatureData.positionTime }}</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="跑垛历史" name="second">
            <div style="height: 190px;width:100%;overflow-y:auto;">
              <div v-if="currentClickFeatureData.runPileHistoryList?.length > 0">
                <div v-for="( e, i ) in currentClickFeatureData.runPileHistoryList" :key="i">
                  <div style="height:40px;line-height:40px;">
                    <div class="click-overlay-content2">跑垛人:{{ e.createByName }}</div>
                    <div class="click-overlay-content2">跑垛时间:{{ e.createTime }}</div>
                    <div class="click-overlay-content2">在用:
                      <el-tag v-if="e.delFlag == 0" type="success">是</el-tag>
                      <el-tag v-if="e.delFlag == 1" type="danger">否</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>


      </div>
      <!-- 弹出框 -->
      <!-- <div :id="carClickOverlayDivId" class="click-overlay car-click-overlay" style="background-color: red;">
        <div class="click-overlay-inner">
          <div class="click-overlay-inner-header">
            {{ currentClickFeatureData.macId }}
            <el-button style="float: right" type="text"
                       @click="switchClickOverlays(undefined, undefined); showTrackSidebar(currentClickFeatureData)">
              播放轨迹
            </el-button>
          </div>
          <div class="click-overlay-inner-body">
            <div>速度：{{ currentClickFeatureData.speed }}</div>
            <div>方向：{{ currentClickFeatureData.direction }}</div>
            <div>定位时间：{{ currentClickFeatureData.gpsTime }}</div>
          </div>
        </div>
      </div> -->
      <div :id="carClickOverlayDivId" class=" click-overlay car-click-overlay" :style="miTableStyle">
        <div  class="click_overlay_top" >
          <img :src="mi_icon" style="height: 48px; width: 48px" />
          <div style="margin-left: 10px;line-height: 25px;">

            <span style="font-weight:500; font-size: 18px;">机械编号：{{ currentClickFeatureData.macName }}</span>

            <span style="display: block;font-weight:500; font-size: 16px;">机械类型：{{ currentClickFeatureData.macTypeName }}</span>

          </div>
          <el-button  type="text" style=" margin-left: auto; "
                      @click="switchClickOverlays(undefined, undefined); showTrackSidebar(currentClickFeatureData)">
            播放轨迹
          </el-button>
        </div>
        <div class="click_overlay_bottom" >
          <span >速度：{{ currentClickFeatureData.speed }}</span>
          <span style="display: block;">最后一次定位时间：{{ currentClickFeatureData.gpsTime }}</span>
        </div>
      </div>
      <div :id="shipAisClickOverlayDivId">
        <ship-ais-board :clickFeature="currentClickFeatureData" @switchClickOverlays="switchClickOverlays"
                        @showTrackSidebar="showTrackSidebar" :shipBaseInfo="shipBaseInfo"
                        :shipPreComing="shipPreComing"></ship-ais-board>
      </div>

      <div :id="menuDivId" class="menu">
        <div class="menu-inner">
          <div v-for="e in currentMenuOptions" class="menu-options"
               @click="menuVisible(undefined,undefined); e.action(currentRClickFeatureData)">
            {{ e.label }}
          </div>
        </div>
      </div>

      <div>
        <el-dialog v-model="isShowStackCreateOption" title="选择垛位" width="20%">
          <el-row>
            <el-form :model="stackCreateOptionForm" ref="stackCreateOptionFormRef" :rules="stackCreateOptionRules">
              <el-form-item label="库场" prop="storehouseId">
                <el-select v-model="stackCreateOptionForm.storehouseId"
                           clearable
                           filterable
                           @change="changeStorehouseOption">
                  <el-option
                    v-for="item in storehouseOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="区域" prop="regionId">
                <el-select v-model="stackCreateOptionForm.regionId"
                           clearable
                           filterable
                           @change="changeRegionOption">
                  <el-option
                    v-for="item in regionOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="垛位" prop="stackId">
                <el-select v-model="stackCreateOptionForm.stackId"
                           clearable
                           filterable>
                  <el-option
                    v-for="item in stackOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="绘制方式" prop="drawType">
                <el-radio v-model="stackCreateOptionForm.drawType" label="polygon">标准</el-radio>
                <el-radio v-model="stackCreateOptionForm.drawType" label="circle">自定义</el-radio>
              </el-form-item>
            </el-form>
          </el-row>
          <div slot="footer">
            <el-button @click="isShowStackCreateOption = false">返回</el-button>
            <el-button type="primary" @click="drawStack">确定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>

    <el-drawer v-model="isShowInoutDetail" title="详情" size="80%">
      <Detail ref="detailRef" :inoutDetailQuery="inoutDetailQuery" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="isShowInoutDetail = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>
<script name="vehiceControl" setup>
  import OlMap from "ol/Map";
  import View from "ol/View";
  import {DoubleClickZoom, Draw} from "ol/interaction";
  import {computed, getCurrentInstance, reactive, ref} from "vue";
  import {XYZ, TileWMS} from "ol/source";
  import {Tile, Vector} from "ol/layer";
  import {Overlay} from "ol";
  import Feature from 'ol/Feature.js';
  import Point from 'ol/geom/Point.js';
  import {LineString, Polygon} from "ol/geom";
  import {Fill, Icon, Stroke, Style, Text} from "ol/style";
  import VectorLayer from "ol/layer/Vector";
  import VectorSource from "ol/source/Vector";
  import {createStringXY} from "ol/coordinate";
  import ShipStyle from '../shipAis/methods/getShipStyle.min.js';
  import {MousePosition, defaults as defaultControls, ScaleLine} from "ol/control";
  import api from "@/api/gis/onSiteDynamics";
  import aisApi from "@/api/gis/shipAis";
  import Player from "@/views/gis/onSiteDynamics/utils/Player";
  import { onUnmounted } from 'vue';
  import ShipAisBoard from '@/views/gis/shipAis/ShipAisBoard';
  import Select from "@/components/Select/index.vue";
  import CircleStyle from "ol/style/Circle";
  import {createBox} from "ol/interaction/Draw";
  import * as Color from 'ol/color';
  import {checkPermi} from "@/utils/permission";
  import historyIcon from '@/assets/icons/png/历史.png';
  import refreshIcon from '@/assets/icons/png/刷新.png';
  import needIcon from '@/assets/icons/png/待跑垛.png';
  import changeIcon from '@/assets/icons/png/切换.png';
  import runPileHistory from '@/views/gis/runPileHistory/index.vue';
  import vehicleList from './vehicleList/index.vue';
  import runPileNeed from '@/views/gis/runPileNeed/index.vue';
  import Detail from './detail/index.vue'
  import {getArea, getLength} from 'ol/sphere.js';
  import { getCenter, boundingExtent } from 'ol/extent'


  const {proxy} = getCurrentInstance()
  const activeName= ref('first')

  /** 在港车辆查询 */
  const vehicleListRef = ref();
  const dgVehicleNum = ref(0);
  const zgVehicleNum = ref(0);
  const xgVehicleNum = ref(0);
  /**
   * 在港车辆列表
   */
  let vehiclePortVisible = ref(false)
  const showVehiclePort = e => {
    vehiclePortVisible.value = true
    nextTick(() => {
      vehicleListRef.value.init(e);
    })
  }
  /** 计算属性 START **/
// 窗口宽度
  const innerWidth = computed(() => {
    return window.innerWidth
  })

  // 窗口高度
  const innerHeight = computed(() => {
    return window.innerHeight
  })
  /** 计算属性 END **/

  /** 校验权限 START **/
  function validateMenuOptionPermission() {
    let _menuOptions = menuOptions
    _menuOptions = _menuOptions
      .filter(v1 => !v1.permission || checkPermi([v1.permission]))
    menuOptions.length = 0
    menuOptions.push(..._menuOptions)
  }
  /** 校验权限 END **/

  /** 初始化地图对象 START **/
  let map // 地图对象
  let mapDivId = 'map' // 地图对象绑定的divID
  let projection = 'EPSG:4326' // GIS投影类型
  const center = [119.17552,37.24343] // 地图中心坐标
  const zoom = 15 // 默认缩放等级
  const maxZoom = 22 // 最大缩放等级
  const minZoom = 10 // 最小缩放等级
  const mi_icon=ref('data:image/png;base64,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')
  const initMap = () => {

    var scaleLine = new ScaleLine({
      //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
      units: "metric"
    });
    var mousePosition = new MousePosition({
      projection: 'EPSG:4326',
      coordinateFormat: createStringXY(5),
      className: 'my-ol-mouse-position',
    });

    map = new OlMap({
      target: mapDivId,
      view: new View({
        projection,
        center,
        zoom,
        maxZoom,
        minZoom,
      }),
      //加载控件到地图容器中
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false
      }).extend([
        scaleLine,
        mousePosition
      ])
    })

    // 移除地图双击放大交互，避免与自定义事件冲突
    const interaction = map
      .getInteractions()
      .getArray()
      .find(interaction => {
        return interaction instanceof DoubleClickZoom
      })
    map.removeInteraction(interaction)
  }

  const refreshData = async () => {
    if(changeStackShowVal.value){
      await listStackForMac()
      const stackFeatures = stackList.map(stack => createStackFeatureMac(stack))
      elementLayers.stack.getSource().clear()
      elementLayers.stack.getSource().addFeatures(stackFeatures)
    } else {
      await listStack()
      const stackFeatures = stackList.map(stack => createStackFeature(stack))
      elementLayers.stack.getSource().clear()
      elementLayers.stack.getSource().addFeatures(stackFeatures)
    }
    // await listShip()
    const shipFeatures = shipList.map(ship => createShipFeature(ship))
    elementLayers.ship.getSource().clear()
    elementLayers.ship.getSource().addFeatures(shipFeatures)
    await listCar()
    await getShipAis(lastTime)
  }
  /**
   * 跑垛历史信息
   */
  let runPileHistoryVisible = ref(false)
  const showRunPileHistory = () => {
    runPileHistoryVisible.value = true
  }
  /**
   * 待跑垛信息
   */
  let runPileNeedVisible = ref(false)
  const showRunPileNeed = () => {
    runPileNeedVisible.value = true
  }

  /**
   * 切换货垛信息展示
   */
  let changeStackShowVal = ref(false)
  const changeStackShow = async () => {
    changeStackShowVal.value = !changeStackShowVal.value
    if(changeStackShowVal.value){
      await api.listStackForMac().then(res => {
        res.data.forEach(v1 => v1.label = v1.stackName + v1.cargoInfos.split(',').map(v1 => v1 ? `【${v1}】` : '').join(''))
        stackList.length = 0
        stackList.push(...res.data)

        const stackFeatures = stackList.map(stack => createStackFeatureMac(stack))
        elementLayers.stack.getSource().clear()
        elementLayers.stack.getSource().addFeatures(stackFeatures)
      })
    } else {
      await api.listStack().then(res => {
        res.data.forEach(v1 => v1.label = v1.stackName + v1.cargoInfos.split(',').map(v1 => v1 ? `【${v1}】` : '').join(''))
        stackList.length = 0
        stackList.push(...res.data)

        const stackFeatures = stackList.map(stack => createStackFeature(stack))
        elementLayers.stack.getSource().clear()
        elementLayers.stack.getSource().addFeatures(stackFeatures)
      })
    }
  }

  /** 初始化地图对象 END **/

  /** 注册鼠标指针移动事件 START **/
  let currentHoverFeature
  let currentHoverFeatureData = reactive({})

  const registerPointerMoveEvent = () => {
    map.addEventListener('pointermove', (event) => {
      if (event.dragging) return
      const pixel = event.pixel
      const coordinate = event.coordinate
      const feature = map.forEachFeatureAtPixel(pixel, (feature) => {
        return feature
      })
      Object.keys(currentHoverFeatureData).forEach(key => delete currentHoverFeatureData[key])
      if (!feature) {
        switchHoverOverlays(undefined, undefined)
      } else {
        if (feature.get('data')) {
          Object.keys(feature.get('data')).forEach(key => currentHoverFeatureData[key] = feature.get('data')[key])
        }
        if (feature.get('layerStyle') === 'ship') {
          switchHoverOverlays('ship', coordinate)
          if (currentHoverFeature === feature) return
        }
        if (feature.get('layerStyle') === 'stack') {
          switchHoverOverlays('stack', coordinate)
          if (currentHoverFeature === feature) return
        }
        if (feature.get('layerStyle') === 'car') {
          switchHoverOverlays('car', coordinate)
          if (currentHoverFeature === feature) return
        }
        // if (feature.get('layerStyle') === 'shipAis') {
        //   console.log('pointermove')
        //   switchHoverOverlays('shipAis', coordinate)
        //   if (currentHoverFeature === feature) return
        // }
      }
      currentHoverFeature = feature
    })
  }
  /** 注册鼠标指针移动事件 END **/

  /** 注册左键单击事件 START */
  let currentClickFeature
  const currentClickFeatureData = reactive({})
  // 如果点击船舶，还要单独查询船舶的作业数据。
  let shipBaseInfo = ref({});
  let shipPreComing = ref({});

  const registerClickEvent = () => {
    map.addEventListener('singleclick', (event) => {
      const pixel = event.pixel
      const coordinate = event.coordinate
      currentClickFeature = map.forEachFeatureAtPixel(pixel, (feature) => {
        return feature
      })
      Object.keys(currentClickFeatureData).forEach(key => delete currentClickFeatureData[key])
      switchHoverOverlays(undefined, undefined)
      menuVisible(undefined, undefined)
      if (!currentClickFeature) {
        switchClickOverlays(undefined, undefined)
      } else {
        if (currentClickFeature.get('data')) {
          Object.keys(currentClickFeature.get('data')).forEach(key => currentClickFeatureData[key] = currentClickFeature.get('data')[key])
        }
        if (currentClickFeature.get('layerStyle') === 'ship') {
          switchClickOverlays('ship', coordinate)
        }
        if (currentClickFeature.get('layerStyle') === 'stack') {
          switchClickOverlays('stack', coordinate)
          api.getStack(currentClickFeatureData.id).then(res => {
            currentClickFeatureData.detail = res.data
          })
          api.getRunPileHistoryList(currentClickFeatureData.id).then(res => {
            currentClickFeatureData.runPileHistoryList = res.data
          })
        }
        if (currentClickFeature.get('layerStyle') === 'car') {
          switchClickOverlays('car', coordinate)
        }
        if (currentClickFeature.get('layerStyle') === 'shipAis') {
          shipBaseInfo.value = {};
          shipPreComing.value = {};
          switchClickOverlays('shipAis', coordinate);
          if (currentClickFeature.id) {
            aisApi.getShipInfo(currentClickFeature.id).then(res => {
              if (res.data.baseInfo) {
                shipBaseInfo.value = res.data.baseInfo;
              }
              if (res.data.preComing) {
                shipPreComing.value = res.data.preComing;
              }
            })
          }
        }
      }
    })
  }
  /** 注册左键单击事件 END */

  /** 注册右键单击事件 START */
  let currentRClickFeature
  const currentRClickFeatureData = reactive({})

  const registerRClickEvent = () => {
    map.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      const pixel = event.pixel
      const coordinate = event.coordinate
      currentRClickFeature = map.forEachFeatureAtPixel(pixel, (feature) => {
        return feature
      })
      Object.keys(currentRClickFeatureData).forEach(key => delete currentRClickFeatureData[key])
      switchHoverOverlays(undefined, undefined)
      switchClickOverlays(undefined, undefined)
      if (!currentRClickFeature) {
        menuVisible(['创建垛位'], coordinate)
      } else {
        if (currentRClickFeature.get('data')) {
          Object.keys(currentRClickFeature.get('data')).forEach(key => currentRClickFeatureData[key] = currentRClickFeature.get('data')[key])
        }
        if (currentRClickFeature.get('layerStyle') === 'ship') {
          menuVisible([], coordinate)
        }
        if (currentRClickFeature.get('layerStyle') === 'stack') {
          menuVisible(['删除垛位'], coordinate)
        }
        if (currentRClickFeature.get('layerStyle') === 'car') {
          menuVisible(['播放轨迹'], coordinate)
        }
      }
    })
  }
  /** 注册右键单击事件 END */

  /** 注册缩放结束事件 START **/
  const registerZoomendEvent = () => {
    map.addEventListener('moveend', () => {
      const zoomLevel = '缩放等级：' + map.getView().getZoom().toFixed(2)
      let element = document.getElementById('zoomLevel')
      if (!element) {
        element = document.createElement('div')
        element.id = 'zoomLevel'
        element.style.position = 'absolute'
        element.style.left = '10px'
        element.style.bottom = '40px'
        document.getElementsByClassName('ol-overlaycontainer-stopevent')[0].appendChild(element)
      }
      element.innerHTML = zoomLevel
    })
  }
  /** 注册缩放结束事件 END **/

  /** 初始化hover叠加层 START **/
// hover叠加层
  const hoverOverlays = {
    ship: undefined, // 船舶
    stack: undefined, // 垛位
    car: undefined, // 车辆
  }

  const shipHoverOverlayDivId = 'shipHoverOverlay'
  const stackHoverOverlayDivId = 'stackHoverOverlay'
  const carHoverOverlayDivId = 'carHoverOverlay'

  const initHoverOverlays = () => {
    hoverOverlays.ship = new Overlay({
      element: document.getElementById(shipHoverOverlayDivId),
      positioning: 'bottom-center',
      offset: [0, 0],
    })

    hoverOverlays.stack = new Overlay({
      element: document.getElementById(stackHoverOverlayDivId),
      positioning: 'bottom-center',
      offset: [0, 0],
    })

    hoverOverlays.car = new Overlay({
      element: document.getElementById(carHoverOverlayDivId),
      positioning: 'bottom-center',
      offset: [0, 0],
    })
  }
  /** 初始化hover叠加层 END **/

  /** 初始化click叠加层 START **/
// click叠加层
  const clickOverlays = {
    ship: undefined, // 船舶
    stack: undefined, // 垛位
    car: undefined, // 车辆
    shipAis: undefined, // 车辆
  }

  const shipClickOverlayDivId = 'shipClickOverlay'
  const stackClickOverlayDivId = 'stackClickOverlay'
  const carClickOverlayDivId = 'carClickOverlay'
  const shipAisClickOverlayDivId = 'shipAisClickOverlay'

  const initClickOverlays = () => {
    clickOverlays.ship = new Overlay({
      element: document.getElementById(shipClickOverlayDivId),
      positioning: 'bottom-center',
      offset: [-29, -30],
    })

    clickOverlays.stack = new Overlay({
      element: document.getElementById(stackClickOverlayDivId),
      positioning: 'bottom-center',
      offset: [-100, -10],
    })

    clickOverlays.car = new Overlay({
      element: document.getElementById(carClickOverlayDivId),
      positioning: 'bottom-center',
      offset: [-100, -10],
    })

    clickOverlays.shipAis = new Overlay({
      element: document.getElementById(shipAisClickOverlayDivId),
      positioning: 'bottom-center',
      offset: [-29, -30],
    })
  }
  /** 初始化click叠加层 END **/

  /** 初始化菜单 START **/
  let menu

  const menuDivId = 'menu'

  const initMenu = () => {
    menu = new Overlay({
      element: document.getElementById(menuDivId),
      positioning: 'top-left',
      offset: [1, 1],
    })
  }
  /** 初始化菜单 END **/

  /** 控制hover叠加层的显示和隐藏 START **/
  const switchHoverOverlays = (hoverOverlayKey, coordinate) => {
    for (const key in hoverOverlays) {
      if (key === hoverOverlayKey) {
        map.addOverlay(hoverOverlays[key])
        hoverOverlays[key].setPosition(coordinate)
      } else {
        if (Object.prototype.hasOwnProperty.call(hoverOverlays, key)) {
          map.removeOverlay(hoverOverlays[key])
          hoverOverlays[key].setPosition(undefined)
        }
      }
    }
  }
  /** 控制hover叠加层的显示和隐藏 END **/

  /** 控制click叠加层的显示和隐藏 START */
  const switchClickOverlays = (clickOverlayKey, coordinate) => {
    for (const key in clickOverlays) {
      if (key === clickOverlayKey) {
        map.addOverlay(clickOverlays[key])
        clickOverlays[key].setPosition(coordinate)
      } else {
        if (Object.prototype.hasOwnProperty.call(clickOverlays, key)) {
          map.removeOverlay(clickOverlays[key])
          clickOverlays[key].setPosition(undefined)
        }
      }
    }
  }
  /** 控制click叠加层的显示和隐藏 END */

  /** 控制菜单的显示和隐藏 START */
  const menuOptions = [
    {
      label: '播放轨迹',
      action: showTrackSidebar,
    },
    {
      label: '创建垛位',
      action: showStackCreateOption,
      permission: 'gis:onSiteDynamics:insertStorageStackPosition'
    },
    {
      label: '删除垛位',
      action: deleteStack,
      permission: 'gis:onSiteDynamics:deleteStorageStackPosition'
    },
  ]

  const currentMenuOptions = reactive([])

  const menuVisible = (options, coordinate) => {
    if (!options || !coordinate) {
      map.removeOverlay(menu)
      menu.setPosition(undefined)
      return
    }
    const _currentMenuOptions = menuOptions.filter(v1 => options.includes(v1.label))
    if (!_currentMenuOptions.length) {
      map.removeOverlay(menu)
      menu.setPosition(undefined)
      return
    }
    currentMenuOptions.length = 0
    currentMenuOptions.push(..._currentMenuOptions)
    map.addOverlay(menu)
    menu.setPosition(coordinate)
  }
  /** 控制菜单的显示和隐藏 END */

  /** 初始化世界图层 START **/
  let wordLayers = {
    normal: undefined,
  }

  const initWordLayers = () => {
    wordLayers.normal = new Tile({
      source: new XYZ({
        url: 'http://t{0-5}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=1a352ee60367cb9ac14fe370d9d3849a',
      }),
      zIndex: 0,
    })
  }
  /** 初始化世界图层 END **/

  /** 初始化港区图层 START **/
  let portLayers = {
    _0: undefined,
  }

  const initPortLayers = () => {
    portLayers._0 = new Tile({
      source: new TileWMS({
        url: 'http://172.18.5.147:8989/geoserver/wms',
        params: {
          SERVICE: 'WMS',
          VERSION: '1.1.0',
          REQUEST: 'GetMap',
          LAYERS: 'wfg:wfg',
          STYLES: '',
        },
      }),
      zIndex: 1,
    })
  }
  /** 初始化港区图层 END **/

  /** 初始化港口元素图层 START **/
  let elementLayers = {
    ship: undefined, // 船舶
    shipAis: undefined, // 船舶
    stack: undefined, // 垛位
    car: undefined, // 车辆
  }

  const initElementLayers = () => {
    elementLayers.ship = new VectorLayer({
      source: new VectorSource(),
      zIndex: 2
    })

    elementLayers.shipAis = new VectorLayer({
      source: new VectorSource(),
      style: ShipStyle,
      zIndex: 10
    })

    elementLayers.stack = new VectorLayer({
      source: new VectorSource(),
      zIndex: 2,
      opacity: 0.7,
    })

    elementLayers.car = new VectorLayer({
      source: new VectorSource(),
      zIndex: 4
    })
  }
  /** 初始化港口元素图层 END **/

  /** 获取船舶数据 START **/
  let shipList = []

  const listShip = async () => {
    await api.listShip().then(res => {
      shipList = res.data
    })
  }

  /** 获取船舶数据 END **/

  const queryPortVehicleNum = async () => {
    await api.queryPortVehicleNum().then(res => {
      res.data.forEach(item => {
        if (item.portCode == '01') {
          dgVehicleNum.value = item.num
        }
        if (item.portCode == '02') {
          zgVehicleNum.value = item.num
        }
        if (item.portCode == '03') {
          xgVehicleNum.value = item.num
        }
      })
    })
  }

  /** 获取船舶数据(科技集团日照公司) START **/
  let shipAisList = []
  let lastTime = '';
  let loopTime = 0;
  let shipLooping = true;
  let shipTimer = null;
  const getShipAis = (queryTime) => {
    if (shipLooping) {
      shipLooping = false;
      aisApi.getShipAis(queryTime).then(res => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          lastTime = res.data.queryTime;
          drawShip(res.data.data);
          if (loopTime > 40) {
            loopTime = 0;
            deleteOfflineShip();
          } else {
            loopTime++;
          }
        }
        shipLooping = true;
      }).catch(err => {
        shipLooping = true;
      })
    }
  }
  const drawShip = (shipList) => {
    let feature;
    let geometry;
    for (const ship of shipList) {
      const oldFeature = elementLayers.shipAis.getSource().getFeatureById(ship.mmsi);
      if (oldFeature) {
        feature = oldFeature;
      } else {
        feature = new Feature();
        feature.setId(ship.mmsi);
        feature.name = ship.name || ship.nameEn;
        feature.nameEn = ship.nameEn;
        feature.length = ship.length;
        feature.width = ship.width;
        feature.isAis = true;
      }
      ship.macId = ship.mmsi;
      ship.name = ship.name || ship.nameEn;
      ship.isAis = true;
      feature.set('data', ship);
      feature.set('layerStyle', 'shipAis');
      feature.gpsTime = ship.gpsTime;
      feature.cg = ship.cg !== null ? Number(ship.cg) * 0.0174533 : ship.heading !== null ? Number(ship.heading) * 0.0174533 : 0;
      feature.heading = ship.heading !== null ? Number(ship.heading) * 0.0174533 : ship.cg !== null ? Number(ship.cg) * 0.0174533 : 0;
      feature.speed = ship.speed;
      feature.mmsi = ship.mmsi;
      feature.anchor = ship.anchor;
      feature.status = ship.status;
      feature.workStatus = ship.workStatus;
      feature.id = ship.id;
      geometry = new Point([Number(ship.lon), Number(ship.lat)]);
      feature.setGeometry(geometry);
      if (!oldFeature) {
        elementLayers.shipAis.getSource().addFeature(feature);
      }
    }
  }
  const deleteOfflineShip = () => {
    const featureList = elementLayers.shipAis.getSource().getFeatures();
    for (const feature of featureList) {
      if (Date.now() - new Date(feature.gpsTime).getTime() > 3600000) {
        elementLayers.shipAis.getSource().removeFeature(feature);
      }
    }
    elementLayers.shipAis.getSource().changed();
  }
  // const getShipList = async () => {
  //   await api.getShipList().then(res => {
  //     shipAisList = res.data
  //   })
  // }
  /** 获取船舶数据 END **/

  /** 获取垛位数据 START **/
  const stackList = reactive([])

  const listStack = async () => {
    await api.listStack().then(res => {
      res.data.forEach(v1 => v1.label = v1.stackName + v1.cargoInfos.split(',').map(v1 => v1 ? `【${v1}】` : '').join(''))
      stackList.length = 0
      stackList.push(...res.data)
    })
  }

  const listStackForMac = async () => {
    await api.listStackForMac().then(res => {
      res.data.forEach(v1 => v1.label = v1.stackName + v1.cargoInfos.split(',').map(v1 => v1 ? `【${v1}】` : '').join(''))
      stackList.length = 0
      stackList.push(...res.data)
    })
  }
  /** 获取垛位数据 END **/

  /** 获取车辆数据 START **/
  let carList = []
  let carTimer = null
  let isPauseListCar = false

  const listCar = async () => {
    if (!isPauseListCar) {
      await api.listCar().then(res => {
        carList = res.data
        const carFeatures = carList.map(car => createCarFeature(car))
        elementLayers.car.getSource().clear()
        elementLayers.car.getSource().addFeatures(carFeatures)
      })
    }
  }
  /** 获取车辆数据 END **/

  /** 创建船舶feature START **/
  let shipFeatureStyle = new Style({
    fill: new Fill({
      color: '#32CD32',
    }),
    stroke: new Stroke({
      color: '#000000',
      width: 1,
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'blue',
      }),
    }),
  })

  const createShipFeature = (ship) => {
    const feature = new Feature()
    feature.set('layerStyle', 'ship')
    feature.set('data', ship)

    const coordinates = []
    for (let i = 1; i <= 5; i++) {
      const lon = ship['lon' + i]
      const lat = ship['lat' + i]
      coordinates.push([lon, lat])
    }

    feature.setGeometry(new Polygon([coordinates]))
    feature.setStyle(_ => {
      shipFeatureStyle.getText().setText(feature.get('data').vesselName)
      return shipFeatureStyle
    })
    return feature
  }
  /** 创建船舶feature END **/

  /** 创建垛位feature START **/
  const stackFeatureStyle = new Style({
    stroke: new Stroke({
      color: '#A7AAB5',
      width: 1,
    }),
    fill: new Fill({
      color: 'yellow',
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'blue',
      }),
    }),
  })


  const getPolygonCenter = (pointArr) => {
    return getCenter(boundingExtent(pointArr));
  }
  const carCountStyle = new Style({
    text: new Text({
      text: '',
      fill: new Fill({
        color: 'white',
      }),
      stroke: new Stroke({
        color: 'black',
        width: 1,
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 255, 0.9)', // 蓝色半透明背景
      }),
      backgroundStroke: new Stroke({
        color: 'blue', // 背景边框颜色
        width: 1,
      }),
      padding: [1.5, 1.5, 1.5, 1.5],
      style: new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({ color: 'blue' }),
        }),
      }),
      //font: '12px Calibri,sans-serif',
    }),
    geometry: (feature) => {
      let center = getPolygonCenter(feature.getGeometry().getCoordinates()[0])
      center = [center[0], center[1] + 0.0002]
      return new Point(center)
    }
  })

  const createStackFeature = (stack) => {
    const feature = new Feature()
    feature.set('layerStyle', 'stack')
    feature.set('data', stack)

    const coordinates = []
    for (let i = 0; i < stack.coordinates.length; i++) {
      const lon = stack.coordinates[i].lon
      const lat = stack.coordinates[i].lat
      coordinates.push([lon, lat])
    }

    feature.setGeometry(new Polygon([coordinates]))
    feature.setStyle(_ => {
      if (map.getView().getZoom().toFixed(2) > 20) {
        stackFeatureStyle.getText().setText(feature.get('data').stackName + '\n' + feature.get('data').cargoInfos.split(',').join('\n'))
      } else {
        stackFeatureStyle.getText().setText(feature.get('data').stackName)
      }

      let cargoColor = feature.get('data').cargoColor
      cargoColor = cargoColor ? cargoColor : '#ffffff'
      stackFeatureStyle.getFill().setColor(cargoColor)

      const textColor = '#' + parseInt(parseInt(cargoColor.substring(1), 16).toString(2).padStart(24, '0').split('').map(v1 => +!+v1).join(''), 2).toString(16).padStart(6, '0')
      stackFeatureStyle.getText().getFill().setColor(textColor)

      return stackFeatureStyle
    })
    return feature
  }

  const createStackFeatureMac = (stack) => {
    const feature = new Feature()
    feature.set('layerStyle', 'stack')
    feature.set('data', stack)

    const coordinates = []
    for (let i = 0; i < stack.coordinates.length; i++) {
      const lon = stack.coordinates[i].lon
      const lat = stack.coordinates[i].lat
      coordinates.push([lon, lat])
    }

    feature.setGeometry(new Polygon([coordinates]))
    feature.setStyle(_ => {
      if (map.getView().getZoom().toFixed(2) > 20) {
        stackFeatureStyle.getText().setText(feature.get('data').stackName + '\n' + feature.get('data').cargoInfos.split(',').join('\n'))
      } else {
        stackFeatureStyle.getText().setText(feature.get('data').stackName)
      }

      stackFeatureStyle.getFill().setColor('#ffffff')
      stackFeatureStyle.getText().getFill().setColor('#000000')
      if(feature.get('data').carCount){
        if(feature.get('data').carCount > 10){
          stackFeatureStyle.getFill().setColor('#ff3300')
          carCountStyle.getText().getFill().setColor('#ff3300')
        } else if(feature.get('data').carCount >= 0 && feature.get('data').carCount <= 10){
          stackFeatureStyle.getFill().setColor('#ffff00')
          carCountStyle.getText().getFill().setColor('#ffff00')
        }
        console.log(feature.get('data').macCode)
        if(feature.get('data').macCode){
          stackFeatureStyle.getFill().setColor('#00ccff')
        }
        carCountStyle.getText().setText(feature.get('data').carCount + '');
        return [stackFeatureStyle, carCountStyle]
      } else {
        return [stackFeatureStyle]
      }
    })
    return feature
  }
  /** 创建垛位feature END **/

  /** 创建车辆feature START **/
  const carFeatureStyle = new Style({
    image: new Icon({
      src: 'data:image/png;base64,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',
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'blue'
      }),
      offsetX: 0,
      offsetY: -20,
    })
  })

  const createCarFeature = (car) => {
    const feature = new Feature()
    feature.set('layerStyle', 'car')
    feature.set('data', car)

    feature.setGeometry(new Point([car.lon, car.lat]))
    feature.setStyle(_ => {
      carFeatureStyle.getText().setText(feature.get('data').macName)
      return carFeatureStyle
    })
    return feature
  }
  /** 创建车辆feature END **/

  /** 播放轨迹 START **/
  const trackSidebarVisible = ref(false)
  const currentTrackBindsCarData = reactive({})

  function showTrackSidebar(data) {
    if (Object.keys(currentTrackBindsCarData).length) {
      closeTrackSidebar()
    }
    trackSidebarVisible.value = true
    isShowSearchBar.value = false
    isPauseListCar = true
    Object.keys(currentTrackBindsCarData).forEach(key => delete currentTrackBindsCarData[key])
    Object.keys(data).forEach(key => currentTrackBindsCarData[key] = data[key])
  }

  /** 播放轨迹 END **/

  /** 垛位创建选项 START **/
  const isShowStackCreateOption = ref(false)

  const stackCreateOptionForm = reactive({
    storehouseId: '',
    regionId: '',
    stackId: '',
    drawType: 'polygon',
  })

  const stackCreateOptionFormRef = ref()

  const stackCreateOptionRules = {
    storehouseId: [
      {required: true, message: '请选择库场', trigger: 'change'}
    ],
    regionId: [
      {required: true, message: '请选择区域', trigger: 'change'}
    ],
    stackId: [
      {required: true, message: '请选择垛位', trigger: 'change'}
    ],
    drawType: [
      {required: true, message: '请选择绘制方式', trigger: 'change'}
    ],
  }

  function showStackCreateOption() {
    isShowStackCreateOption.value = true
    listStorehouseOption()
  }
  /** 垛位创建选项 END **/

  /** 查询库场下拉框 START **/
  const storehouseOptions = reactive([])

  function listStorehouseOption() {
    api.listStorehouseOption().then(res => {
      storehouseOptions.length = 0
      storehouseOptions.push(...res.data)
    })
  }
  /** 查询库场下拉框 END **/

  /** 查询区域下拉框 START **/
  const regionOptions = reactive([])

  function listRegionOption() {
    api.listRegionOption(stackCreateOptionForm.storehouseId).then(res => {
      regionOptions.length = 0
      regionOptions.push(...res.data)
    })
  }
  /** 查询区域下拉框 END **/

  /** 查询垛位下拉框 START **/
  const stackOptions = reactive([])

  function listStackOption() {
    api.listStackOption(stackCreateOptionForm.regionId).then(res => {
      stackOptions.length = 0
      stackOptions.push(...res.data)
    })
  }
  /** 查询垛位下拉框 END **/

  /** 库场下拉框change事件 START **/
  function changeStorehouseOption() {
    listRegionOption()
    stackCreateOptionForm.regionId = ''
    stackCreateOptionForm.regionName = ''
    changeRegionOption()
  }
  /** 库场下拉框change事件 END **/

  /** 区域下拉框change事件 START **/
  function changeRegionOption() {
    listStackOption()
    stackCreateOptionForm.stackId = ''
    stackCreateOptionForm.stackName = ''
  }
  /** 区域下拉框change事件 END **/

  /** 绘制垛位 START **/
  async function drawStack() {
    let valid
    await stackCreateOptionFormRef.value.validate((_valid, fields) => {
      valid = _valid
    })
    if (!valid) {
      return
    }
    isShowStackCreateOption.value = false

    let drawer
    switch (stackCreateOptionForm.drawType) {
      case 'polygon':
        drawer = interactions.stackPolygonDrawer
        break
      default:
        drawer = interactions.stackCircleDrawer
        proxy.$message.info('开始自定义绘制，最多6个点')
    }
    map.addInteraction(drawer)

    drawer.once('drawend', event => {
      map.removeInteraction(drawer)
      const geometry = event.feature.getGeometry()
      const coordinate = geometry.getCoordinates()[0]
      // if (JSON.stringify(coordinate[0]) === JSON.stringify(coordinate[coordinate.length - 1])) {
      //   coordinate.length -= 1
      // }
      const area = getArea(geometry, {projection: 'EPSG:4326'}).toFixed(2)
      const line = new LineString(geometry.getCoordinates()[0])
      const sideLength = []
      line.forEachSegment((v1, v2) => {
        const length = getLength(new LineString([v1, v2]), {projection: 'EPSG:4326'}).toFixed(2)
        sideLength.push(length)
      })
      api.insertStorageStackPosition({
        stackName: stackOptions.filter(v1 => v1.value === stackCreateOptionForm.stackId)[0].label,
        stackId: stackCreateOptionForm.stackId,
        position: JSON.stringify(coordinate),
        sideLength: sideLength.join(),
        area,
      }).then(async res => {
        proxy.$message.success(res.msg)
        await listStack()
        const stackFeatures = stackList.map(stack => createStackFeature(stack))
        elementLayers.stack.getSource().clear()
        elementLayers.stack.getSource().addFeatures(stackFeatures)
      })
    })
  }
  /** 绘制垛位 END **/

  /** 初始化交互功能 START **/
  const interactions = {
    stackPolygonDrawer: null,
    stackCircleDrawer: null,
  }

  function initInteraction() {
    // 垛位绘制 标准
    interactions.stackPolygonDrawer = new Draw({
      type: 'Circle',
      maxPoints: 6,
      style: new Style({
        stroke: new Stroke({
          color: '#ffcc33',
          width: 3
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      }),
      geometryFunction: createBox(),
    })

    // 垛位绘制 自定义
    interactions.stackCircleDrawer = new Draw({
      type: 'Polygon',
      maxPoints: 6,
      style: new Style({
        stroke: new Stroke({
          color: '#ffcc33',
          width: 3
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      }),
    })
  }
  /** 初始化交互功能 END **/

  /** 删除垛位 START **/
  function deleteStack() {
    proxy.$modal
      .confirm('删除垛位包含清场操作，是否确认删除垛位？')
      .then(_ => {
        api.deleteStorageStackPosition(currentRClickFeatureData.id).then(async res => {
          proxy.$message.success(res.msg)
          await listStack()
          const stackFeatures = stackList.map(stack => createStackFeature(stack))
          elementLayers.stack.getSource().clear()
          elementLayers.stack.getSource().addFeatures(stackFeatures)
        })
      })
      .catch(_ => {
      })
  }
  /** 删除垛位 END **/

  /** data START **/
// 轨迹查询表单
  const trackQueryForm = reactive({
    beginTime: '',
    endTime: '',
  })

  // 轨迹选项
  const trackOptions = reactive({
    color: '#90ee90',
    width: 4,
    interval: .2,
  })

  // 预定义轨迹颜色
  const trackPredefineColors = [
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
  ]

  const trackList = reactive([])

  const trackQueryFormRules = {
    beginTime: [
      {required: true, trigger: 'blur'},
    ],
    endTime: [
      {required: true, trigger: 'blur'},
    ],
  }

  const trackOptionsRules = {
    color: [
      {required: true, trigger: 'blur'},
    ],
    width: [
      {required: true, trigger: 'blur'},
    ],
    interval: [
      {required: true, trigger: 'blur'},
    ],
  }
  /** data END **/

  /** 查询轨迹 START **/
  const listTrack = async () => {
    let _valid
    await proxy.$refs['trackQueryFormRef'].validate(valid => {
      _valid = valid
    })
    if (!_valid) {
      return
    }

    if (!currentTrackBindsCarData.isAis) {
      api.listCarHistory(currentTrackBindsCarData.macId, trackQueryForm.beginTime, trackQueryForm.endTime).then(res => {
        trackList.length = 0
        trackList.push(...res.data)
      })
    } else {
      aisApi.listAisHistory(currentTrackBindsCarData.mmsi, trackQueryForm.beginTime, trackQueryForm.endTime).then(res => {
        trackList.length = 0
        trackList.push(...res.data)
      })
    }
  }
  /** 查询轨迹 END **/

  /** 初始化轨迹图层 START **/
  let trackLayer

  const initTrackLayer = () => {
    trackLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 4
    })
  }
  /** 初始化轨迹图层 END **/

  /** 初始化轨迹路线图层 START **/
  let trackLineLayer

  const initTrackLineLayer = () => {
    trackLineLayer = new Vector({
      source: new VectorSource(),
      zIndex: 3,
      style: new Style({
        stroke: new Stroke({
          width: trackOptions.width,
          color: trackOptions.color,
        }),
      })
    })
  }
  /** 初始化轨迹路线图层 END **/

  /** 创建轨迹feature START **/
  const createTrackFeature = (track) => {
    return createCarFeature(track)
  }
  /** 创建轨迹feature END **/

  /** 创建轨迹路线feature START **/
  const createTrackLineFeature = (coordinates) => {
    return new Feature({
      geometry: new LineString(coordinates),
    })
  }
  /** 创建轨迹路线feature END **/

  /** 播放轨迹 START **/
  let trackPlayer

  const trackPlayerState = ref(0)

  const playTrack = async () => {
    if (!trackPlayer || 0 === trackPlayer.state()) {
      await setupTrackPlayer()
    }
    trackPlayer.play()
    trackPlayerState.value = trackPlayer.state()
  }
  /** 播放轨迹 END **/

  /** 轨迹播放器首次播放设置 START **/
  const setupTrackPlayer = async () => {
    let _valid
    await proxy.$refs['trackOptionsRef'].validate(valid => {
      _valid = valid
    })
    if (!_valid) {
      return
    }

    const carFeature = elementLayers.car.getSource().getFeatures().filter(v1 => v1.get('data').macId === currentTrackBindsCarData.macId)[0]
    elementLayers.car.getSource().removeFeature(carFeature)

    if (!map.getLayers().getArray().includes(trackLayer)) {
      map.addLayer(trackLayer)
    }
    if (!map.getLayers().getArray().includes(trackLineLayer)) {
      map.addLayer(trackLineLayer)
    }
    trackLineLayer.getStyle().getStroke().setWidth(trackOptions.width)
    trackLineLayer.getStyle().getStroke().setColor(trackOptions.color)

    resetTrackTableRolling()

    position(trackList[0].lon, trackList[0].lat)

    if (!trackPlayer) {
      trackPlayer = Player.newBuilder()
        .frames(trackList)
        .frameRate(1 / (trackOptions.interval * 1000))
        .callback((frame, index) => {
          trackLayer.getSource().clear()
          trackLineLayer.getSource().clear()

          trackLayer.getSource().addFeatures([createTrackFeature(trackList[index])])

          const trackLineFeatures = trackList.slice(0, index + 1).map((v1, _index) => {
            return createTrackLineFeature(trackList.slice(0, _index + 1).map(v1 => [v1.lon, v1.lat]))
          })
          trackLineLayer.getSource().addFeatures(trackLineFeatures)

          trackTableRolling(index)
        })
        .completedCallback(() => {
          proxy.$message.success('播放完成')
          trackPlayerState.value = trackPlayer.state()
        })
        .build()
    }
  }
  /** 轨迹播放器首次播放设置 END **/

  /** 轨迹侧栏table滚动 START **/
  const trackTableRolling = (index) => {
    const tableWrapper = document
      .getElementsByClassName('trackSidebar-inner-table-body')[0]
    let trs = tableWrapper
      .getElementsByTagName('table')[0]
      .getElementsByTagName('tr')
    for (let i = 0; i < trs.length; i++) {
      trs[i].classList.remove('trackSidebar-inner-table-body-table-tr-already-played')
    }
    for (let i = 0; i <= index; i++) {
      trs[i].classList.add('trackSidebar-inner-table-body-table-tr-already-played')
    }

    const scrollTop = tableWrapper.scrollTop
    const clientHeight = tableWrapper.clientHeight
    const trHeight = 27
    const clientCount = Math.floor((scrollTop + clientHeight) / trHeight)
    if (index === clientCount - 1) {
      tableWrapper.scrollTop += trHeight
    }
  }
  /** 轨迹侧栏table滚动 END **/

  /** 重置轨迹侧栏table滚动 START **/
  const resetTrackTableRolling = () => {
    const tableWrapper = document.getElementsByClassName('trackSidebar-inner-table-body')[0]
    tableWrapper.scrollTop = 0
    const trs = tableWrapper
      .getElementsByTagName('table')[0]
      .getElementsByTagName('tr')
    for (let i = 0; i < trs.length; i++) {
      trs[i].classList.remove('trackSidebar-inner-table-body-table-tr-already-played')
    }
  }
  /** 重置轨迹侧栏table滚动 END **/

  /** 播放倍速调整 START **/
  const trackPlayerTimeLapse = () => {
    if (trackPlayer) {
      trackPlayer.timeLapse(1 / (trackOptions.interval * 1000))
    }
  }
  /** 播放倍速调整 END **/

  /** 坐标定位 START **/
  const position = (lon, lat) => {
    map.getView().setCenter([lon, lat])
  }
  /** 坐标定位 END **/

  /** 暂停播放轨迹 START **/
  const pausePlayTrack = () => {
    trackPlayer.pause()
    trackPlayerState.value = trackPlayer.state()
  }
  /** 暂停播放轨迹 END **/

  /** 停止播放轨迹 START **/
  const stopPlayTrack = () => {
    if (trackPlayer) {
      trackPlayer.stop()
      trackPlayerState.value = trackPlayer.state()
    }

    map.removeLayer(trackLayer)
    map.removeLayer(trackLineLayer)

    const features = elementLayers.car.getSource().getFeatures().filter(v1 => v1.get('data').macId === currentTrackBindsCarData.macId)
    if (!features.length) {
      elementLayers.car.getSource().addFeature(createCarFeature(carList.filter(v1 => v1.macId === currentTrackBindsCarData.macId)[0]))
      position(currentTrackBindsCarData.lon, currentTrackBindsCarData.lat)
    }

    resetTrackTableRolling()
  }
  /** 停止播放轨迹 END **/

  /** 关闭轨迹侧栏 START **/
  const closeTrackSidebar = () => {
    trackSidebarVisible.value = false
    isShowSearchBar.value = true
    isPauseListCar = false
    stopPlayTrack()
    Object.keys(currentTrackBindsCarData).forEach(key => delete currentTrackBindsCarData[key])
    trackList.length = 0
  }
  /** 关闭轨迹侧栏 END **/

  /** 搜索 START **/
  const isShowSearchBar = ref(true)
  const currentSearchBarDataId = ref(null)

  function searchBarPosition() {
    if (!currentSearchBarDataId.value) {
      proxy.$message.info('请先选择数据~')
      return
    }

    const feature = elementLayers.stack.getSource().getFeatures().filter(v1 => v1.get('data').id === currentSearchBarDataId.value)[0]
    const polygon = feature.getGeometry()
    map.getView().fit(polygon)
    proxy.$message.success('定位成功~')
  }
  /** 搜索 END **/

  /** 港存进出明细 START **/
  const isShowInoutDetail = ref(false)

  const inoutDetailQuery = reactive({
    cargoInfoNo: '',
    massId: '',
    beginWorkDate: '',
    beginClassCode: '',
    endWorkDate: '',
    endClassCode: '',
    processDetailCode: ''
  })

  const showInoutDetail = ({massId, cargoInfoNo}) => {
    inoutDetailQuery.massId = massId
    inoutDetailQuery.cargoInfoNo = cargoInfoNo

    isShowInoutDetail.value = true
  }
  /** 港存进出明细 END **/

  /** init START **/
  const init = () => {
    window.setTimeout(async () => {
      validateMenuOptionPermission()
      initMap()
      registerPointerMoveEvent()
      registerClickEvent()
      registerRClickEvent()
      registerZoomendEvent()
      initHoverOverlays()
      initClickOverlays()
      initMenu()
      // initWordLayers()
      // map.addLayer(wordLayers.normal)
      initPortLayers()
      map.addLayer(portLayers._0)
      initElementLayers()
      map.addLayer(elementLayers.ship)
      map.addLayer(elementLayers.stack)
      map.addLayer(elementLayers.car)
      map.addLayer(elementLayers.shipAis)
      // await listShip()
      await listStack()
      const shipFeatures = shipList.map(ship => createShipFeature(ship))
      const stackFeatures = stackList.map(stack => createStackFeature(stack))
      elementLayers.ship.getSource().addFeatures(shipFeatures)
      elementLayers.stack.getSource().addFeatures(stackFeatures)
      await listCar()
      carTimer = setInterval(() => {
        listCar()
      }, 8000)
      await getShipAis(lastTime);
      shipTimer = setInterval(() => {
        getShipAis(lastTime);
      }, 8000)
      initTrackLayer()
      initTrackLineLayer()
      initInteraction()
      queryPortVehicleNum()
      setInterval(() => {
        queryPortVehicleNum()
      }, 8000)
    }, 1)
  }

  init()
  /** init END **/

  onUnmounted(() => {
    if (shipTimer) {
      clearInterval(shipTimer);
      shipTimer = null;
    }

    if (carTimer) {
      clearInterval(carTimer)
      carTimer = null
    }
  });
</script>

<style lang="scss" scoped>
  :deep(.my-ol-mouse-position) {
    position: absolute  !important;
    bottom: 20px;
    right: 20px;
  }
  :deep(.el-tabs) {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .search-bar {
    position: absolute;
    z-index: 99;
    left: 80px;
    top: 30px;
    width: 500px;
    height: 47px;
  }

  :deep(.search-bar .el-input__wrapper) {
    border-radius: 5px 0 0 5px;
  }

  .click-overlay {
    // width: 351px;
    // height: 250px;
    // background: white;
    // box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
    // border-radius: 17px;
    // display: flex;
    // justify-content: center;
    // flex-direction: column;

    font-size: 12px;
    background-color: white;
    border-radius: 10px;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    position: absolute;
    bottom: 20px;
    left: -130px;
    height: 250px;
    width: 400px;
    .click-overlay-content{
      margin-top:5px;
      float: left;
      height:20px;
      line-height:20px;
      margin-left:5px;
    }
    .click-overlay-content2{
      margin-top:5px;
      float: left;
      height:40px;
      line-height:40px;
      margin-left:5px;
    }
  }

  .click-overlay:after {
    top: 100%;
    border: solid transparent;
    content: " ";
    position: absolute;
    border-top-color: white;
    border-width: 30px 25px 0 0;
    left: 230px;
  }

  .click-overlay-inner {
    height: 90%;
    width: 90%;
    margin: 0 auto;
  }

  .click-overlay-inner-header {
    height: 15%;
    border-bottom: 1px #ebeef5 solid;
    font-size: 18px;
  }

  .click-overlay-inner-body {
    height: 85%;
    padding: 5px 0 0 0;
  }

  .menu {
    width: 100px;
    background: white;
    box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
    border-radius: 5px;
    display: flex;
  }

  .menu-inner {
    height: 90%;
    width: 90%;
    margin: 5px auto;
  }

  .menu-options {
    border-radius: 5px;
    cursor: pointer;
    padding: 3px 0;
  }

  .menu-options:hover {
    color: #414141;
    background: #efefef;
  }

  .trackSidebar {
    width: 650px;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .trackSidebar-inner {
    height: 95%;
    width: 95%;
    margin: 5px auto;
  }

  .trackSidebar-inner-header {
    height: 7%;
    border-bottom: 1px #ebeef5 solid;
    font-size: 20px;
  }

  .trackSidebar-inner-body {
    height: 93%;
    padding: 17px 0 0 0;
  }

  .trackSidebar-inner-form {
    height: 45%;
    border-bottom: 1px #ebeef5 solid;
    padding: 0 62px;
  }

  .trackSidebar-inner-form .el-form-item {
    margin-bottom: 5px;
  }

  .trackSidebar-inner-form :deep(.el-form-item__error) {
    display: none;
  }

  .trackSidebar-inner-table {
    height: 55%;
    border-bottom: 1px #ebeef5 solid;
    text-align: center;
    font-size: 14px;
    color: #606266;
  }

  .trackSidebar-inner-table table {
    line-height: 25px;
  }

  .trackSidebar-inner-table-header {
    height: 8%;
    font-weight: 500;
  }

  .trackSidebar-inner-table-body {
    height: 92%;
    line-height: 25px;
    overflow: auto;
  }

  .trackSidebar-inner-table-body table {
    border-collapse: collapse;
  }

  .trackSidebar-inner-table-body-table-tr-already-played {
    background: rgb(193, 193, 193, 0.3);
  }

  .click_overlay_top{
    border-bottom: 1px dashed #cccccc;
    margin: 0 auto;
    height: 70px;
    width: 360px;
    display: flex;
    margin-top: 20px;
  }
  .click_overlay_bottom{
    height: 80px;
    width: 360px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 30px;

  }
  .floating-button {
    position: absolute; /* 设置为固定位置 */
    text-align: center;
    line-height: 30px;
    top: 30px; /* 距离页面底部的距离 */
    left: 30px; /* 距离页面右侧的距离 */
    width: 40px; /* 按钮的宽度 */
    height: 200px; /* 按钮的高度 */
    border-radius: 8px;
    border: 1px solid rgb(64, 158, 255);
    background-color: rgba(255, 255, 255, 0.5); /* 按钮的背景色 */
    z-index: 99;
  }
  .floating-label {
    position: absolute; /* 设置为固定位置 */
    /*text-align: center;*/
    padding-left: 5px;
    line-height: 30px;
    top: 300px; /* 距离页面底部的距离 */
    left: 30px; /* 距离页面右侧的距离 */
    width: 200px; /* 按钮的宽度 */
    height: 150px; /* 按钮的高度 */
    border-radius: 8px;
    border: 0px solid rgb(64, 158, 255);
    background-color: rgba(255, 255, 255, 0.5); /* 按钮的背景色 */
    z-index: 99;
  }
</style>
