<template>
	<div :style="{ width: mapWidth + 'px', height: mapHeight + 'px' }">
		<!-- 地图主页面 -->
		<div id="map" @contextmenu.prevent="rClick">
			<div v-show="consoleShow" class="con">
				<div class="harde">
					<div style="font-size: 14px; margin-left: 10px; margin-top: -13px; color: white">线路关键点</div>
					<!-- 更新最优路线的遮罩 -->
					<div style="position: absolute; top: -20px; right: 10px">
						<el-button status="primary" @click="generateNavigationRoute">生成最优路线</el-button>
						<el-button status="primary" @click="addKeyPoint">新增</el-button>
						<el-button status="danger" @click="consoleShow = false">关闭</el-button>
					</div>
				</div>

				<div style="margin-top: 5px; margin-left: 5px; width: 440px; height: 100%; overflow: scroll">
					<el-collapse accordion>
						<el-collapse-item title="关键点" name="1">
							<el-table :data="pointListData" height="500" row-key="pointId">
								<el-table-column prop="pointName" label="关键点" width="160" />
								<el-table-column prop="status" label="状态" width="80">
									<template v-slot:="scope">
										<el-tag v-if="scope.row.status === 0" type="danger">停用</el-tag>
										<el-tag v-else type="success">在用</el-tag>
									</template>
								</el-table-column>
								<el-table-column label="操作" width="160">
									<template v-slot:="scope">
										<el-button type="link" size="small" @click="editPointInfo(scope.row)">编辑</el-button>
										<el-button type="link" size="small" @click="deletePointInfo(scope.row)">删除</el-button>
									</template>
								</el-table-column>
							</el-table>
						</el-collapse-item>
						<el-collapse-item title="路线" name="2">
							<el-table :data="routeListData" height="500" row-key="routeId">
								<el-table-column prop="routeName" label="路线名称" width="160" />
								<el-table-column label="状态" width="80">
									<template v-slot:="scope">
										<el-tag v-if="scope.row.status === 0" type="danger">停用</el-tag>
										<el-tag v-else type="success">在用</el-tag>
									</template>
								</el-table-column>
								<el-table-column label="操作" width="160">
									<template v-slot:="scope">
										<el-button type="link" size="small" @click="editRouteInfo(scope.row)">编辑</el-button>
										<el-button type="link" size="small" @click="deleteRouteInfo(scope.row)">删除</el-button>
									</template>
								</el-table-column>
							</el-table>
						</el-collapse-item>
					</el-collapse>
				</div>
			</div>
		</div>
		<!-- 地图右键菜单 -->
		<div id="rMenuDiv">
			<ul id="rMenu">
				<li v-for="(val, index) in menuOptions" :key="index" @click="clickRMenuOption(val.cd)">
					{{ val.nm }}
				</li>
			</ul>
		</div>

		<!-- 关键点信息弹出框 -->
		<el-dialog title="编辑关键点" width="40%" :visible.sync="nodeDialog">
			<el-form :model="workNode" :rules="nodeRules" label-position="left" label-width="80">
				<el-form-item label="关键点名称" prop="pointName">
					<el-input placeholder="请输入" v-model="workNode.pointName" clearable />
				</el-form-item>
				<el-form-item label="关键点类型" prop="type">
					<el-select v-model="workNode.type">
						<el-option label="路口" value="1"></el-option>
						<el-option label="入口" value="2"></el-option>
						<el-option label="出口" value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="关键点状态" prop="status">
					<el-select v-model="workNode.status">
						<el-option label="停用" value="0" />
						<el-option label="在用" value="1" />
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="nodeDialog = false">取 消</el-button>
				<el-button type="primary" @click="drawNode">确 定</el-button>
			</div>
		</el-dialog>

		<!-- 路线信息编辑 -->
		<el-dialog :visible.sync="routeDialogShow" title="新增路线" width="30%">
			<el-form :model="mWorkRoute" :rules="routeRules" label-width="80" label-position="left">
				<el-form-item label="路线名称" prop="routeName">
					<el-input placeholder="请输入" v-model="mWorkRoute.routeName" />
				</el-form-item>
				<el-form-item label="路线类型" prop="routeType">
					<el-select v-model="mWorkRoute.routeType">
						<el-option label="双行" value="0" />
						<el-option label="单行" value="1" />
					</el-select>
				</el-form-item>
				<el-form-item label="路线状态" prop="status">
					<el-select v-model="mWorkRoute.status">
						<el-option label="停用" value="0" />
						<el-option label="在用" value="1" />
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="routeDialogShow = false">返回</el-button>
				<el-button type="primary" @click="drawRoute">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature'
import { fromLonLat } from 'ol/proj'
import { Point, LineString } from 'ol/geom'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM } from 'ol/source'
import { Fill, Icon, Stroke, Style, Text } from 'ol/style'
import Overlay from 'ol/Overlay'
import { defaults } from 'ol/control'
import 'ol/ol.css'
import VectorSource from 'ol/source/Vector'
import { Draw } from 'ol/interaction'
import CircleStyle from 'ol/style/Circle'
import GeoJSON from 'ol/format/GeoJSON'
import request from '@/utils/request'

export default {
	name: 'gis',
	components: {},
	data() {
		return {
			// 地图对象
			map: null,
			mapWidth: 0,
			mapHeight: 0,
			// 交互功能
			interactions: {
				// 垛位绘制器
				massDraw: null,

				//点绘制
				pointDraw: null,

				//线绘制
				lineDraw: null,
			},
			// 显示控制台
			consoleShow: false,
			//新增关键点表单
			workNode: {
				id: '',
				pointName: '',
				type: '1',
				status: '1',
			},
			//关键节点
			mWorkPoint: {
				pointId: '',
				pointName: '',
				longitude: null,
				latitude: null,
				type: '',
				status: '',
			},
			//节点表单校验
			nodeRules: {
				pointName: [{ required: true, message: '关键点名称不能为空' }],
				status: [{ required: true, message: '关键点状态不能为空' }],
				type: [{ required: true, message: '关键点类型不能为空' }],
			},
			//节点信息弹框
			nodeDialog: false,
			//路线信息
			mWorkRoute: {
				routeId: '',
				routeName: '',
				routeType: '',
				status: '',
				beginPid: '',
				endPid: '',
			},
			routeDialogShow: false,
			//路线表单校验
			routeRules: {
				routeName: [{ required: true, message: '路线名称不能为空' }],
				routeType: [{ required: true, message: '路线类型不能为空' }],
				status: [{ required: true, message: '状态不能为空' }],
			},
			// 右键菜单选项
			menuOptions: [],
			// 弹出式图层
			popupOverlays: {
				// 右键菜单图层
				rMenuPopupOverlay: null,

				// 机械弹出式图层
				macPopupOverlay: null,

				// 垛位弹出式图层
				massPopupOverlay: null,

				// 区域弹出式图层
				areaPopupOverlay: null,

				// 关键点弹出式图层
				keyPointOverlay: null,

				// 路线弹出式图层
				lineOverlay: null,
			},
			// 初始化选项
			options: {
				// 地图中心坐标
				center: [118.98133632282485, 37.27351630612998],
				// 地图默认缩放等级
				zoom: 16,
				// 地图最大缩放等级
				maxZoom: 21,
				// 地图最小缩放等级
				minZoom: 15,
				// 是否加载底图
				loadBaseLayer: false,
			},
			//tree树形控件
			pointListData: [],
			pointFlag: 'add',
			//路线信息集合
			routeListData: [],
			routeFlag: 'add',
			// 路线图层
			lineLayer: null,
			// 箭头图层
			arrowLayer: null,
			// API版本号
			$version: 'v1',
			// GeoJSON配置
			geoJsonConf: [
				{
					id: 'cangku',
					name: '仓库',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/仓库.json',
					fillColor: '#BBE8D5',
					strokeColor: '#BBE8D5',
					fontColor: '#676E7C',
				},
				{
					id: 'biandiansuo',
					name: '变电所',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/变电所.json',
					fillColor: '#BBE8D5',
					strokeColor: '#BBE8D5',
					fontColor: '#676E7C',
				},
				{
					id: 'duichang',
					name: '堆场',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/堆场.json',
					fillColor: '#FFFFFF',
					strokeColor: '#FFFFFF',
					fontColor: '#676E7C',
				},
				{
					id: 'fangwu',
					name: '房屋',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/房屋.json',
					fillColor: '#A7CEFC',
					strokeColor: '#A7CEFC',
					fontColor: '#676E7C',
				},
				{
					id: 'dianzibang',
					name: '电子磅',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/电子磅.json',
					fillColor: '#C5D0F8',
					strokeColor: '#C5D0F8',
					fontColor: '#676E7C',
				},
				{
					id: 'pidaiji',
					name: '皮带机',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/皮带机.json',
					fillColor: '#C5D0F8',
					strokeColor: '#C5D0F8',
					fontColor: '#676E7C',
				},
				{
					id: 'bangfang',
					name: '磅房',
					zIndex: 1,
					visible: true,
					url: '/src/assets/geojson/磅房.json',
					fillColor: '#CBECF7',
					strokeColor: '#CBECF7',
					fontColor: '#676E7C',
				},
				{
					id: 'lanzhuang',
					name: '缆桩',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/缆桩.json',
					fillColor: 'red',
					strokeColor: 'red',
					fontColor: '#676E7C',
				},
				{
					id: 'huochangdi',
					name: '货场地',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/货场地.json',
					fillColor: '#F4FFD5',
					strokeColor: '#F4FFD5',
					fontColor: '#676E7C',
				},
				{
					id: 'daolu',
					name: '道路',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/道路.json',
					fillColor: '#F7FABF',
					strokeColor: '#C0C676',
					fontColor: '#676E7C',
				},
				{
					id: 'fangchenwang',
					name: '防尘网',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/防尘网.json',
					fillColor: '#9DCCFF',
					strokeColor: '#9DCCFF',
					fontColor: '#676E7C',
				},
				{
					id: 'fengji',
					name: '风机',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/风机.json',
					fillColor: '#FFDFDF',
					strokeColor: '#FFDFDF',
					fontColor: '#676E7C',
				},
				{
					id: 'gaogandeng',
					name: '高杆灯',
					zIndex: 0,
					visible: true,
					url: '/src/assets/geojson/高杆灯.json',
					fillColor: '#FD5E4A',
					strokeColor: '#FD5E4A',
					fontColor: '#676E7C',
				},
			],
			// 右键单击事件Feature
			rClickFeature: null,
			//地图左键点击事件
			lClickFeature: null,
			//黑点，表在用
			keyPointimg:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAMhJREFUWEftlDEKAlEMRGfPYmMx4F0U9C72nsELWGlhI97BzmJA7P4hfmEjysJfxGLdfBGCkNRhMrxM0sC5Guf5CANBIAgEga8IkFwCmAOYALgDOAHYSFrXPrYqAyRHAA4Axj2DjjnnWUrpZjVSa+DyYXg3cy9p+nMDBfvKKLyQtLX0mgmQPJedW3R3ktqMDFaNgceg2qvhKqkvJ28yf2XAfQXt7fuFsF0cSb8zLAZ8H1EXX7dXXHGG5lbzGZoVKxvDQBAIAkHgCafOSCGahkUCAAAAAElFTkSuQmCC',

			//红点，表停用
			keyPointimg2:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAJ5JREFUWEdjZBhgwDjA9jOMOmA0BEZDYDQERkOA7BC4Lsfuy/j/vx6oKP/PyHhJ89HPzeQU62Q54IYc2xoGBoZgNAvXajz6FUKqI0h2ANjnDP83YbPoPwOjH6khQbIDbsiyVTMwMrRg9el/hhqNx79aSQmFoeeAAY8CUPAOaCKExe+AZkNSEhkhtSQnQkIGkio/6oDREBgNgdEQGA0BAHydNCHRoKbtAAAAAElFTkSuQmCC',

			//黑色上下双向箭头
			arrowImg:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAXZJREFUSEu1lrsvBUEUxn+3IqFV6BQ01LQSKn8AlWc8boEGFUpUaFB4xbPibyC01DT0Ci0JFTly9ubcyc6d3blrk012Zr7zfec1M1si/AwBvcAa8BaGVyNKAYNR4EwxHcBrkQLTwIESShTXeckF74tgDthRwh7gMYbcJ7AIbCphM/AZS54msAysK2GoPpl0Lck4cKJWd0CbvpmIHFA5qZ8VGASuChKoNIWbhn9NURLlArClg0bgOyZHiY2vkLPAbo0N1gqsAvcmral+1OqUKeBQrfqBW8PQDrzoeAw490UZasURY9wFPBsi2xQzxpkqrZCAgKUjhoFJ4N3xtBt40Ll5k9YKLItAqMZNwIeClkyD/E0VIZA48KMfK8BGWhdJHvdD7nrW5RiXog/o+gRw6kZgi5ZXxxXw7uS8xBYfTFEseQPwpcZy1G9bonqLbDecXFJ7rpf1CPQBN0oo1+tRWgpiBTqBJyWUH4OL2KPCZ9cCHAOXocPuF2y8PBk3FkuVAAAAAElFTkSuQmCC',

			//黑色单向右箭头
			arrowRightRed:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAdZJREFUSEu1ljFrFEEUx/9vudraLzBvvpGKyXmJNiGGFELABEkMQoqAheiRRpKgoBaCWFhYiNiFQGz35s20GmwVUs6TPfbCeNzdzmVxy903v9+8N+8NS8h8jDHrRHRdRLYylwzDKCfYGLNEREd1bF9E1nLWZQuY+R2Amwn0tYj0AGiTKCuDCmKtPVTV5QT4McZ4J4Twe5YkW1BBmPkFgPsJ8CuAroj8mCaZS1Bnsq+qGwnwTFW73vtykmRuQZ3JLoDtEVBVPREtisjpuORKgjqTDVXdT4C/ACyIyJdUcmVBnckqgP4ISEQXqlpl8uHyXVObNX1n5qpdj8fieiLyajgHzPy4CTLjezoH45w1EelXgsZhabGBrf8t2JxUovGMchth55/uIVp1zh3kLp5aJWbuAhgeaDIXC977N8NDblFfGGNWiOggAV8AuOG9/9S6TZn5AYCnyQZ/xhhvhxC+tR40Y8wjInqSgMoY42II4Xvrq4KZ9wBsJqCToih6g8FAJpV7rjOw1j5T1fWk5p87nc5yWZbn084yW8DMLwHcS+Dvi6K465z7M6tRsgTM/BbAreRSO3LOVbLGWyBLYK1dUdVROz4XkcsyNbV5lqCCMPNDANfm/W35C7UYrO7lx8zfAAAAAElFTkSuQmCC',

			//红色单向右箭头
			arrowRight:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAANCAYAAADbnyzoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEASURBVHjazNW9SgNBGIXhJ7KiiBAINhZehDfnHViJCIKChQYLWyVYaKHYKaiIhaWm9qdTg+THfDaDBNSsgSzJCx/swAxzYM45WwruMY8WukZPhlmcY68UhPHjDjs4yvCECt4NV2xgAtOYSt95NHGJTRyikaVFGZ0hC+xgBotpyjn7X3GKZdx8awkmCxpBJVgK6kH0mUawESz0nBXJkO0CvdTOCd4nnrGOarLbj8QUSSnd8Zv/WukpqzjAy1+RHgVtnGELx/jo1zmjoIaVlNjcUiyabk87vGEbu7j9b2sX7cEy5vCIVeyjPshvpWiauMAJ1lJyjYvADh5whetBxcHXAJRObcD8y7YEAAAAAElFTkSuQmCC',
		}
	},

	mounted() {
		this.mapHeight = window.innerHeight - 85
		this.mapWidth = window.innerWidth

		this.init()
	},

	methods: {
		//初始化
		init() {
			setTimeout(() => {
				//初始化地图图层及地图控件
				this.initTheMap()
				this.initTheLayer()
				this.initThePopupLayer()
				this.initTheInteraction()
				//关键点
				this.getAllKeyPoints()

				this.getAllRoutes()
			}, 100)
		},
		// 初始化地图对象
		initTheMap() {
			this.map = new Map({
				controls: defaults({
					attribution: false,
				}),
				target: 'map',
				view: new View({
					projection: 'EPSG:4326',
					center: this.options.center,
					zoom: this.options.zoom,
					maxZoom: this.options.maxZoom,
					minZoom: this.options.minZoom,
				}),
			})
			this.lClick()
		},
		// 左键单击事件
		lClick() {
			this.map.addEventListener('click', event => {
				const pixel = event.pixel
				const coordinate = event.coordinate

				this.lClickFeature = this.map.forEachFeatureAtPixel(pixel, feature => {
					return feature
				})
				if (!this.lClickFeature) {
					this.showPopupOverlay()
				} else {
					if (this.lClickFeature.get('showType') === 'point') {
						this.showPopupOverlay('macPopupOverlay', coordinate)
					}
					if (this.lClickFeature.get('showType') === 'Route') {
						this.showPopupOverlay('massPopupOverlay', coordinate)
					}
				}
			})
		},
		// 右键单击事件
		rClick(event) {
			this.removeInteractions()
			const pixel = this.map.getEventPixel(event)
			const coordinate = this.map.getEventCoordinate(event)

			this.rClickFeature = this.map.forEachFeatureAtPixel(pixel, feature => {
				return feature
			})

			if (this.rClickFeature) {
				if (this.rClickFeature.get('showType') === 'point') {
					this.menuOptions = [
						{ cd: 'editPoint', nm: '修改关键点' },
						{ cd: 'setbgPoint', nm: '设为起点' },
						{ cd: 'setendPoint', nm: '设为终点' },
						{ cd: 'deletePoint', nm: '删除关键点' },
					]
					this.showPopupOverlay('rMenuPopupOverlay', coordinate)
					return
				}
				if (this.rClickFeature.get('showType') === 'Route') {
					this.menuOptions = [
						{ cd: 'editRoute', nm: '修改路线' },
						{ cd: 'deleteRoute', nm: '删除路线' },
					]
					this.showPopupOverlay('rMenuPopupOverlay', coordinate)
					return
				}

				if (this.consoleShow) {
					this.menuOptions = [{ cd: 'hideConsole', nm: '隐藏控制台' }]
				} else {
					this.menuOptions = [{ cd: 'showConsole', nm: '显示控制台' }]
				}
				this.showPopupOverlay('rMenuPopupOverlay', coordinate)
			}
		},
		// 初始化图层
		initTheLayer() {
			if (this.options.loadBaseLayer) {
				const baseLayer = new TileLayer({
					source: new OSM({
						isBaseLayer: true,
					}),
				})
				this.map.addLayer(baseLayer)
			}

			// GeoJSON方式创建图层
			this.geoJsonConf.forEach(val => {
				let layer = this.createLayersByConf(val)
				this.map.addLayer(layer)
			})
		},
		// 通过配置文件创建图层
		createLayersByConf(val) {
			return new VectorLayer({
				zIndex: val.zIndex,
				visible: val.visible,
				source: new VectorSource({
					url: val.url,
					format: new GeoJSON(),
				}),
				style: function (feature) {
					const style = new Style({
						fill: new Fill({
							color: val.fillColor,
						}),
						stroke: new Stroke({
							color: val.strokeColor,
							width: 1,
						}),
						text: new Text({
							font: '12px Calibri,sans-serif',
							fill: new Fill({
								color: val.fontColor,
							}),
							overflow: true,
						}),
					})
					style.getText().setText(feature.get('NAME'))
					return style
				},
				declutter: true,
			})
		},
		// 初始化弹出式图层
		initThePopupLayer() {
			this.popupOverlays.rMenuPopupOverlay = new Overlay({
				element: document.getElementById('rMenuDiv'),
				positioning: 'top-left',
			})
			this.map.addOverlay(this.popupOverlays.rMenuPopupOverlay)

			this.popupOverlays.macPopupOverlay = new Overlay({
				element: document.getElementById('macDiv'),
				positioning: 'bottom-center',
			})
			this.map.addOverlay(this.popupOverlays.macPopupOverlay)

			this.popupOverlays.massPopupOverlay = new Overlay({
				element: document.getElementById('massDiv'),
				positioning: 'bottom-center',
			})
			this.map.addOverlay(this.popupOverlays.massPopupOverlay)

			this.popupOverlays.areaPopupOverlay = new Overlay({
				element: document.getElementById('areaDiv'),
				positioning: 'bottom-center',
			})
			this.map.addOverlay(this.popupOverlays.areaPopupOverlay)

			this.popupOverlays.keyPointOverlay = new Overlay({
				element: document.getElementById('pointDiv'),
				positioning: 'bottom-center',
			})
			this.map.addOverlay(this.popupOverlays.keyPointOverlay)

			this.popupOverlays.lineOverlay = new Overlay({
				element: document.getElementById('pointDiv'),
				positioning: 'bottom-center',
			})
			this.map.addOverlay(this.popupOverlays.lineOverlay)
		},
		// 初始化交互功能
		initTheInteraction() {
			//绘制点
			this.interactions.pointDraw = new Draw({
				type: 'Point',
				maxPoints: 1,
				style: new Style({
					stroke: new Stroke({
						color: 'rgb(70, 162, 207)',
						width: 3,
					}),
					image: new CircleStyle({
						radius: 5,
						fill: new Fill({
							color: 'rgb(70, 162, 207)',
						}),
					}),
				}),
			})
			this.interactions.pointDraw.on('drawend', this.onPointDraw)
			//绘制线
			this.interactions.lineDraw = new Draw({
				type: 'LineString',
				maxPoints: 2,
				style: new Style({
					stroke: new Stroke({
						color: 'rgb(70, 162, 207)',
						width: 3,
					}),
					image: new CircleStyle({
						radius: 5,
						fill: new Fill({
							color: 'rgb(70, 162, 207)',
						}),
					}),
				}),
			})
			this.interactions.lineDraw.on('drawend', this.insertroute)
		},
		// 关键点图层
		loadingAreaLayer() {
			if (this.pointLayer) {
				this.map.removeLayer(this.pointLayer)
			}

			const features = []

			this.pointListData.forEach(val => {
				if (val.status == 1) {
					const pointLayer = [val.latitude, val.longitude]
					let feature = new Feature({
						geometry: new Point([val.longitude, val.latitude]),
					})
					feature.set('showType', 'point')

					for (let key in val) {
						if (val.hasOwnProperty(key)) {
							feature.set(key, val[key])
						}
					}

					let style = new Style({
						image: new Icon({
							src: this.keyPointimg,
							scale: 1,
						}),
						text: new Text({
							font: '12px Calibri,sans-serif',
							text: val.pointName,
							fill: new Fill({
								color: 'blue',
							}),
							offsetX: 0,
							offsetY: -15,
						}),
					})

					feature.setStyle(style)
					features.push(feature)
				} else {
					const pointLayer = [val.latitude, val.longitude]

					let feature = new Feature({
						geometry: new Point([val.longitude, val.latitude]),
					})
					feature.set('showType', 'point')

					for (let key in val) {
						if (val.hasOwnProperty(key)) {
							feature.set(key, val[key])
						}
					}

					let style = new Style({
						image: new Icon({
							src: this.keyPointimg2,
							scale: 1.7,
						}),
						text: new Text({
							font: '12px Calibri,sans-serif',
							text: val.pointName,
							fill: new Fill({
								color: 'green',
							}),
							offsetX: 0,
							offsetY: -15,
						}),
					})

					feature.setStyle(style)
					features.push(feature)
				}
			})

			this.pointLayer = new VectorLayer({
				source: new VectorSource({
					features: features,
				}),
				zIndex: 1,
			})

			this.map.addLayer(this.pointLayer)
		},
		// 移除交互功能
		removeInteractions() {
			this.map.removeInteraction(this.interactions.lineDraw)
			this.map.removeInteraction(this.interactions.pointDraw)
		},
		// 生成最优路线
		generateNavigationRoute() {
			const loading = this.$loading({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)',
			})
			request({ url: '/api/external/route/generateNavigationRoute', method: 'get' }).then(result => {
				this.$modal.msgSuccess('成功生成最优路线信息')
				loading.close()
			})
		},
		//绘制节点
		addKeyPoint() {
			this.pointFlag = 'add'
			this.workNode = {
				pointName: '',
				type: '1',
				status: '1',
			}
			this.nodeDialog = true
		},
		//绘制关键点
		drawNode() {
			if (this.workNode.pointName == '') {
				this.$message.error('节点名称不能为空')
				return
			}
			if (this.pointFlag === 'add') {
				this.nodeDialog = false
				this.map.addInteraction(this.interactions.pointDraw)
			} else {
				request({ url: '/api/external/route/editKeyPoint', method: 'put', data: this.workNode }).then(result => {
					this.$modal.msgSuccess('修改成功')
					this.nodeDialog = false
					this.getAllKeyPoints()
				})
			}
		},
		// 节点绘制完成回调方法
		onPointDraw(event) {
			this.map.removeInteraction(this.interactions.pointDraw)

			const coordinates = event.feature.getGeometry().getCoordinates()

			this.mWorkPoint.longitude = coordinates[0]
			this.mWorkPoint.latitude = coordinates[1]

			this.mWorkPoint.pointName = this.workNode.pointName
			this.mWorkPoint.type = this.workNode.type
			this.mWorkPoint.status = this.workNode.status
			request({ url: '/api/external/route/addKeyPoint', method: 'post', data: this.mWorkPoint }).then(result => {
				this.$modal.msgSuccess('新增成功')

				this.getAllKeyPoints()
			})
		},
		//获取全部关键点集合
		getAllKeyPoints() {
			request({ url: '/api/external/route/listpoint', method: 'get' }).then(result => {
				this.pointListData = result.data

				this.loadingAreaLayer()
			})
		},
		//编辑关键点信息
		editPointInfo(rowData) {
			this.pointFlag = 'edit'
			this.nodeDialog = true
			this.workNode = JSON.parse(JSON.stringify(rowData))
			this.workNode.status = this.workNode.status + ''
			this.workNode.type = this.workNode.type + ''
		},
		deletePointInfo(rowData) {
			this.$confirm(`确定要删除关键点${rowData.pointName}吗？删除关键点后与之关联的路线也将删除`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					request({ url: `/api/external/route/deleteKeyPoint/${rowData.id}`, method: 'delete' }).then(result => {
						this.$modal.msgSuccess('删除成功')

						this.getAllKeyPoints()
					})
				})
				.catch(() => {})
		},
		//绘制路线
		drawRoute() {
			if (this.routeFlag === 'add') {
				request({ url: `/api/external/route/addRouteInfo`, method: 'post', data: this.mWorkRoute }).then(result => {
					this.$modal.msgSuccess('新增成功')

					this.getAllRoutes()

					this.routeDialogShow = false
				})
			} else {
				request({ url: `/api/external/route/editRouteInfo`, method: 'put', data: this.mWorkRoute }).then(result => {
					this.$modal.msgSuccess('修改成功')

					this.getAllRoutes()

					this.routeDialogShow = false
				})
			}
		},
		//获取全部路线信息
		getAllRoutes() {
			request({ url: `/api/external/route/getAllRouteInfo`, method: 'get' }).then(result => {
				this.routeListData = result.data

				this.loadingLineLayer()

				this.loadingArrowLayer()
			})
		},
		editRouteInfo(rowData) {
			this.routeFlag = 'edit'
			this.mWorkRoute = rowData
			this.mWorkRoute.routeType += ''
			this.mWorkRoute.status += ''
			this.routeDialogShow = true
		},
		deleteRouteInfo(rowData) {
			this.$confirm(`确定要删除路线${rowData.routeName}吗？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}).then(() => {
				request({ url: `/api/external/route/deleteRouteInfo/${rowData.routeId}`, method: 'delete' }).then(result => {
					this.$message.success('删除成功')

					this.getAllRoutes()
				})
			})
		},
		// 显示/隐藏弹出式图层
		showPopupOverlay(overlayName, coordinate) {
			for (let key in this.popupOverlays) {
				if (this.popupOverlays.hasOwnProperty(key)) {
					if (key === overlayName) {
						this.popupOverlays[key].setPosition(coordinate)
					} else {
						this.popupOverlays[key].setPosition(undefined)
					}
				}
			}
		},
		// 单击菜单选项事件
		clickRMenuOption(cd) {
			this.showPopupOverlay()

			let id = this.rClickFeature.get('id')
			switch (cd) {
				case 'editPoint':
					let pointInfo = this.pointListData.filter(value => value.id === id)
					if (pointInfo !== null && pointInfo !== undefined && pointInfo.length > 0) {
						this.editPointInfo(pointInfo[0])
					}
					break
				case 'setbgPoint':
					this.mWorkRoute.beginPid = id
					break
				case 'setendPoint':
					if (this.mWorkRoute.beginPid === '' || this.mWorkRoute.beginPid === null) {
						this.$message.error('请先配置起点')
						return
					}
					this.mWorkRoute.endPid = id

					if (this.mWorkRoute.beginPid === this.mWorkRoute.endPid) {
						this.$message.error('路线起点、终点不应在同一个点上')
						return
					}
					this.mWorkRoute.routeName = ''
					this.mWorkRoute.routeType = '0'
					this.mWorkRoute.status = '1'
					this.routeFlag = 'add'
					this.routeDialogShow = true
					break
				case 'deletePoint':
					let point = this.pointListData.filter(value => value.id === id)
					if (point !== null && point !== undefined && point.length > 0) {
						this.deletePointInfo(point[0])
					}
					break
				case 'editRoute':
					let routeid = this.rClickFeature.get('routeId')
					let temp = this.routeListData.filter(val => val.routeId === routeid)
					if (temp !== undefined && temp !== null && temp.length > 0) {
						this.editRouteInfo(temp[0])
					}
					break
				case 'deleteRoute':
					let routeId = this.rClickFeature.get('routeId')
					let temp2 = this.routeListData.filter(val => val.routeId === routeId)
					if (temp2 !== undefined && temp2 !== null && temp2.length > 0) {
						this.deleteRouteInfo(temp2[0])
					}
					break
				case 'hideConsole':
					this.consoleShow = false
					break
				case 'showConsole':
					this.consoleShow = true
					break
			}
		},
		//路线图层
		loadingLineLayer() {
			if (this.lineLayer) {
				this.map.removeLayer(this.lineLayer)
			}

			const features = []

			this.routeListData.forEach(val => {
				if (val.status == 1) {
					var beginFrom = [val.startLon, val.startLat]
					var endTo = [val.endLon, val.endLat]

					let feature = new Feature({
						geometry: new LineString([beginFrom, endTo]),
					})
					feature.set('showType', 'Route')

					for (let key in val) {
						if (val.hasOwnProperty(key)) {
							feature.set(key, val[key])
						}
					}

					let style = new Style({
						stroke: new Stroke({
							color: 'red',
							width: 5,
						}),
						text: new Text({
							font: '12px Calibri,sans-serif',
							text: val.routeName,
							fill: new Fill({
								color: 'blue',
							}),
							offsetX: 0,
							offsetY: -15,
						}),
					})

					feature.setStyle(style)
					features.push(feature)
				} else {
					var beginFrom = [val.startLon, val.startLat]
					var endTo = [val.endLon, val.endLat]

					let feature = new Feature({
						geometry: new LineString([beginFrom, endTo]),
					})
					feature.set('showType', 'Route')

					for (let key in val) {
						if (val.hasOwnProperty(key)) {
							feature.set(key, val[key])
						}
					}

					let style = new Style({
						stroke: new Stroke({
							color: 'red',
							width: 5,
						}),
						text: new Text({
							font: '12px Calibri,sans-serif',
							text: val.routeName,
							fill: new Fill({
								color: 'blue',
							}),
							offsetX: 0,
							offsetY: -15,
						}),
					})

					feature.setStyle(style)
					features.push(feature)
				}
			})

			this.lineLayer = new VectorLayer({
				source: new VectorSource({
					features: features,
				}),
				zIndex: 1,
			})

			this.map.addLayer(this.lineLayer)
		},
		//箭头图层
		loadingArrowLayer() {
			//先移除所有的图层
			if (this.arrowLayer) {
				this.map.removeLayer(this.arrowLayer)
			}
			const features = []
			this.routeListData.forEach(val => {
				//(0双行 1单行)
				if (val.routeType == 0) {
					//线的中间位置坐标
					let arrowLonLat = [(val.startLon - 0 + (val.endLon - 0)) / 2, (val.startLat - 0 + (val.endLat - 0)) / 2]

					var dx = val.endLon - 0 - (val.startLon - 0)
					var dy = val.endLat - 0 - (val.startLat - 0)
					//返回点(x,y)和原点(0,0)之间直线的倾斜角
					var rotation = Math.atan2(dy, dx)

					let feature = new Feature({
						geometry: new Point(arrowLonLat),
					})

					let style = new Style({
						image: new Icon({
							src: this.arrowImg,
							scale: 1,
							anchor: [0.5, 0.5],
							rotation: -rotation,
							rotateWithView: true,
						}),

						text: new Text({
							font: '12px Calibri,sans-serif',
							// text: '箭头',
							fill: new Fill({
								color: 'blue',
							}),
							offsetX: 0,
							offsetY: 0,
						}),
					})
					feature.setStyle(style)
					features.push(feature)
				} else {
					//线的中间位置坐标
					var arrowLonLat = [(val.startLon - 0 + (val.endLon - 0)) / 2, (val.startLat - 0 + (val.endLat - 0)) / 2]

					var dx = val.endLon - 0 - (val.startLon - 0)
					var dy = val.endLat - 0 - (val.startLat - 0)
					//返回点(x,y)和原点(0,0)之间直线的倾斜角
					var rotation = Math.atan2(dy, dx)

					let feature = new Feature({
						geometry: new Point(arrowLonLat),
					})

					let style = new Style({
						image: new Icon({
							src: this.arrowRight,
							scale: 0.7,
							anchor: [0.5, -0.3],
							rotation: -rotation,
							rotateWithView: true,
						}),
					})
					feature.setStyle(style)
					features.push(feature)
				}
			})

			this.arrowLayer = new VectorLayer({
				source: new VectorSource({
					features: features,
				}),
				zIndex: 1,
			})
			this.map.addLayer(this.arrowLayer)
		},
	},
}
</script>

<style lang="less" scoped>
//********************** 地图 START ***********************

#map {
	height: 100%;
	width: 100%;
}

.con {
	position: absolute;
	background-color: #f5f7fa;
	height: 80%;
	width: 452px;
	z-index: 1;
	border: 0.1px solid #c1c1c1;
	opacity: 0.8;
}

.el-input {
	width: 221px;
}

#rMenu {
	width: 120px;
	border-radius: 5px;
	border: 1px solid #999999;
	background-color: #ffffff;
	list-style-type: none;
	padding-inline-start: 5px;
}

#rMenu li {
	line-height: 25px;
	text-align: center;
	margin-top: 5px;
	margin-bottom: 5px;
}

#rMenu li:hover {
	background-color: #ebebeb;
	cursor: pointer;
}

//********************** 右键菜单 END *************************

//********************** 按钮 START *************************

.buttonDiv button {
	position: relative;
	display: block;
	margin: 1px;
	padding: 0;
	color: white;
	font-size: 1.14em;
	font-weight: bold;
	text-decoration: none;
	text-align: center;
	height: 23px;
	width: 23px;
	line-height: 0.4em;
	background-color: #708fb4;
	border: none;
	border-radius: 2px;
}

.buttonDiv img {
	position: relative;
	display: block;
	margin: 1px;
	padding: 0;
	color: white;
	font-size: 1.14em;
	font-weight: bold;
	text-decoration: none;
	text-align: center;
	height: 23px;
	width: 23px;
	line-height: 0.4em;
	background-color: #708fb4;
	border: none;
	border-radius: 2px;
}

//********************** 按钮 END *************************

//********************** 控制台中的机械列表 END *************************

/deep/ .macTable .ivu-table .block {
	display: table-row;
}

/deep/ .macTable .ivu-table .none {
	display: none;
}

//********************** 控制台中的机械列表 END *************************
.harde {
	width: 100%;
	height: 50px;
	background-color: #548bdf;
	border: 0.1px solid #c1c1c1;
	line-height: 80px;
	margin-top: -1px;
}
.footer {
	width: 30%;
	height: 50px;
	background-color: #f5f7fa;
	border: 0.1px solid #c1c1c1;
	position: fixed;
	bottom: 0;
	line-height: 80px;
}
.addanddel {
	margin-left: 320px;
	margin-top: 5px;
	position: absolute;
	clear: both;
}
//加载遮罩
/* 旋转效果 */
.demo-spin-icon-load {
	animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
	from {
		transform: rotate(0deg);
	}
	50% {
		transform: rotate(180deg);
	}
	to {
		transform: rotate(360deg);
	}
}
/* 假如内容过长，一屏放不下，滚动条下拉覆盖不全 */
.ivu-spin-fix {
	position: fixed;
	top: 9%;
	left: 15%;
	z-index: 8;
	width: 100%;
	height: 100%;
	background-color: hsla(0, 0%, 100%, 0.9);
}
</style>
