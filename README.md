# ppm-view
生产管理系统前端

<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">港口生产管理系统</h1>

## 平台简介

```bash
# 阅读文档
yarn docs:dev
```
method: 'put',
## 前端运行

```bash
# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:9092
```

## 文件路径

-   components 公共组件
    -   BaseTable 公共表格组件
    -   Breadcrumb 面包屑组件
-   directive 自定义指令
-   layout 框架 vue 文件
-   plugins 插件
-   router 路由
-   store pinia 库
-   utils 常用方法
-   views 组件
    -   error 错误信息组件
    -   master 基础数据
        -   cargo 货物信息
            -   cargoNameList 货名列表组件
            -   detail 新增、编辑货种组件
        -   custom 客户管理
            -   detail 新增客户管理
    -   system 系统管理

```
view
├─ .editorconfig
├─ .env.development
├─ .env.production
├─ .env.staging
├─ .eslintignore
├─ .eslintrc.js
├─ .prettierrc
├─ bin
│  ├─ build.bat
│  ├─ package.bat
│  └─ run-web.bat
├─ docs
│  ├─ .vitepress
│  │  ├─ cache
│  │  │  └─ deps
│  │  │     ├─ @vueuse_core.js
│  │  │     ├─ @vueuse_core.js.map
│  │  │     ├─ axios.js
│  │  │     ├─ axios.js.map
│  │  │     ├─ chunk-AC2VUBZ6.js
│  │  │     ├─ chunk-AC2VUBZ6.js.map
│  │  │     ├─ chunk-IPZLLPFO.js
│  │  │     ├─ chunk-IPZLLPFO.js.map
│  │  │     ├─ chunk-KIXE3NUN.js
│  │  │     ├─ chunk-KIXE3NUN.js.map
│  │  │     ├─ chunk-TTC6GIF7.js
│  │  │     ├─ chunk-TTC6GIF7.js.map
│  │  │     ├─ element-plus.js
│  │  │     ├─ element-plus.js.map
│  │  │     ├─ element-plus_lib_locale_lang_zh-cn.js
│  │  │     ├─ element-plus_lib_locale_lang_zh-cn.js.map
│  │  │     ├─ file-saver.js
│  │  │     ├─ file-saver.js.map
│  │  │     ├─ js-cookie.js
│  │  │     ├─ js-cookie.js.map
│  │  │     ├─ mitt.js
│  │  │     ├─ mitt.js.map
│  │  │     ├─ package.json
│  │  │     ├─ pinia.js
│  │  │     ├─ pinia.js.map
│  │  │     ├─ sortablejs.js
│  │  │     ├─ sortablejs.js.map
│  │  │     ├─ vue-router.js
│  │  │     ├─ vue-router.js.map
│  │  │     ├─ vue.js
│  │  │     ├─ vue.js.map
│  │  │     ├─ vue3-tabs-chrome.js
│  │  │     ├─ vue3-tabs-chrome.js.map
│  │  │     ├─ vxe-table.js
│  │  │     ├─ vxe-table.js.map
│  │  │     └─ _metadata.json
│  │  ├─ config.js
│  │  ├─ plugins
│  │  │  ├─ index.js
│  │  │  ├─ modal.js
│  │  │  └─ tab.js
│  │  └─ theme
│  │     ├─ index.js
│  │     └─ index.scss
│  ├─ components
│  │  ├─ editTable.md
│  │  ├─ select.md
│  │  ├─ selectTable.md
│  │  └─ table
│  │     ├─ index.md
│  │     └─ renderTable.vue
│  ├─ home
│  │  ├─ introduce.md
│  │  └─ start.md
│  ├─ images
│  │  ├─ api.png
│  │  ├─ apijs.png
│  │  └─ file.png
│  ├─ index.md
│  ├─ modal
│  │  └─ index.md
│  ├─ public
│  │  ├─ box-sizing.png
│  │  ├─ eletron.png
│  │  ├─ favicon.ico
│  │  └─ md.png
│  └─ specification
│     ├─ addNew.md
│     ├─ demo.md
│     ├─ detail.vue
│     ├─ form.md
│     ├─ format.md
│     ├─ index.vue
│     └─ name.md
├─ html
│  └─ ie.html
├─ index.html
├─ package.json
├─ public
│  ├─ favicon.ico
│  ├─ favicon1.ico
│  └─ print-lock.css
├─ README.md
├─ src
│  ├─ api
│  │  ├─ login.js
│  │  ├─ master
│  │  │  ├─ berth
│  │  │  │  └─ index.js
│  │  │  ├─ cargo
│  │  │  │  └─ index.js
│  │  │  ├─ charges
│  │  │  │  └─ charges.js
│  │  │  ├─ custom
│  │  │  │  └─ index.js
│  │  │  ├─ dict
│  │  │  │  ├─ data.js
│  │  │  │  └─ index.js
│  │  │  ├─ entryNotice
│  │  │  │  └─ index.js
│  │  │  ├─ feeItem
│  │  │  │  └─ index.js
│  │  │  ├─ goods
│  │  │  │  └─ index.js
│  │  │  ├─ groupInfo
│  │  │  │  └─ index.js
│  │  │  ├─ hqCargo
│  │  │  │  └─ index.js
│  │  │  ├─ hqStorageStack
│  │  │  │  └─ index.js
│  │  │  ├─ labor
│  │  │  │  └─ index.js
│  │  │  ├─ machine
│  │  │  │  └─ index.js
│  │  │  ├─ machineType
│  │  │  │  └─ index.js
│  │  │  ├─ pieceRate
│  │  │  │  └─ index.js
│  │  │  ├─ port
│  │  │  │  └─ index.js
│  │  │  ├─ process
│  │  │  │  └─ index.js
│  │  │  ├─ serviceContent
│  │  │  │  └─ index.js
│  │  │  ├─ ship
│  │  │  │  └─ index.js
│  │  │  ├─ shipBlackList
│  │  │  │  └─ index.js
│  │  │  ├─ shipPrepayStandard
│  │  │  │  └─ index.js
│  │  │  ├─ stopReason
│  │  │  │  └─ index.js
│  │  │  ├─ storageStack
│  │  │  │  └─ index.js
│  │  │  ├─ technology
│  │  │  │  └─ index.js
│  │  │  ├─ towageStandard
│  │  │  │  └─ index.js
│  │  │  ├─ tug
│  │  │  │  └─ index.js
│  │  │  ├─ waifuProcess
│  │  │  │  └─ index.js
│  │  │  ├─ workSchedule
│  │  │  │  └─ index.js
│  │  │  ├─ workShift
│  │  │  │  └─ index.js
│  │  │  └─ workWare
│  │  │     └─ index.js
│  │  ├─ menu.js
│  │  ├─ monitor
│  │  │  ├─ cache.js
│  │  │  ├─ job.js
│  │  │  ├─ jobLog.js
│  │  │  ├─ logininfor.js
│  │  │  ├─ online.js
│  │  │  ├─ operlog.js
│  │  │  └─ server.js
│  │  ├─ public
│  │  │  └─ index.js
│  │  └─ system
│  │     ├─ dept.js
│  │     ├─ loginLog.js
│  │     ├─ menu.js
│  │     ├─ notice.js
│  │     ├─ online
│  │     │  └─ index.js
│  │     ├─ operLog.js
│  │     ├─ parameter
│  │     │  └─ index.js
│  │     ├─ post.js
│  │     ├─ role.js
│  │     ├─ user.js
│  │     └─ version.js
│  ├─ App.vue
│  ├─ assets
│  │  ├─ 401_images
│  │  │  └─ 401.gif
│  │  ├─ 404_images
│  │  │  ├─ 404.png
│  │  │  └─ 404_cloud.png
│  │  ├─ font
│  │  │  ├─ aliy-bold.ttf
│  │  │  ├─ aliy.ttf
│  │  │  ├─ dinglie.ttf
│  │  │  ├─ text.css
│  │  │  └─ 阿里健康体2.0
│  │  │     ├─ 阿里健康体 2.0 中文
│  │  │     │  ├─ AlibabaHealthFont2.0CN-45R.ttf
│  │  │     │  └─ AlibabaHealthFont2.0CN-85B.ttf
│  │  │     ├─ 阿里健康体 2.0 盲文
│  │  │     │  ├─ AlibabaHealthFont2.0Braille.ttc
│  │  │     │  └─ AlibabaHealthFont2.0Pro.ttc
│  │  │     ├─ 阿里健康体2.0使用说明.pdf
│  │  │     └─ 阿里健康体2.0拼音
│  │  │        ├─ AlibabaHealthFont2.0PY-Bold.ttc
│  │  │        └─ AlibabaHealthFont2.0PY-Regular.ttc
│  │  ├─ home_icon
│  │  │  ├─ font_icon
│  │  │  │  ├─ iconfont.css
│  │  │  │  ├─ iconfont.js
│  │  │  │  ├─ iconfont.json
│  │  │  │  ├─ iconfont.ttf
│  │  │  │  ├─ iconfont.woff
│  │  │  │  └─ iconfont.woff2
│  │  │  ├─ iconfont.css
│  │  │  ├─ iconfont.js
│  │  │  ├─ iconfont.json
│  │  │  ├─ iconfont.ttf
│  │  │  ├─ iconfont.woff
│  │  │  ├─ iconfont.woff2
│  │  │  ├─ main_icon_001.svg
│  │  │  ├─ main_icon_002.svg
│  │  │  ├─ main_icon_003.svg
│  │  │  ├─ main_icon_004.svg
│  │  │  ├─ main_icon_005.svg
│  │  │  ├─ main_icon_006.svg
│  │  │  ├─ main_icon_007.svg
│  │  │  └─ morentouxiang.svg
│  │  ├─ icons
│  │  │  ├─ close.png
│  │  │  ├─ file.png
│  │  │  ├─ full-star.png
│  │  │  ├─ png
│  │  │  │  ├─ refresh.png
│  │  │  │  ├─ 切换.png
│  │  │  │  ├─ 刷新.png
│  │  │  │  ├─ 历史.png
│  │  │  │  └─ 待跑垛.png
│  │  │  ├─ right.png
│  │  │  ├─ special.png
│  │  │  ├─ star.png
│  │  │  ├─ svg
│  │  │  │  ├─ 404.svg
│  │  │  │  ├─ blueShip.svg
│  │  │  │  ├─ bug.svg
│  │  │  │  ├─ build.svg
│  │  │  │  ├─ button.svg
│  │  │  │  ├─ cascader.svg
│  │  │  │  ├─ chart.svg
│  │  │  │  ├─ checkbox.svg
│  │  │  │  ├─ chuanfang.svg
│  │  │  │  ├─ clipboard.svg
│  │  │  │  ├─ close-icon.svg
│  │  │  │  ├─ close.svg
│  │  │  │  ├─ code.svg
│  │  │  │  ├─ color.svg
│  │  │  │  ├─ component.svg
│  │  │  │  ├─ dashboard.svg
│  │  │  │  ├─ DataLineFilled .svg
│  │  │  │  ├─ date-range.svg
│  │  │  │  ├─ date.svg
│  │  │  │  ├─ dict.svg
│  │  │  │  ├─ documentation.svg
│  │  │  │  ├─ download.svg
│  │  │  │  ├─ drag.svg
│  │  │  │  ├─ druid.svg
│  │  │  │  ├─ edit.svg
│  │  │  │  ├─ education.svg
│  │  │  │  ├─ email.svg
│  │  │  │  ├─ example.svg
│  │  │  │  ├─ excel.svg
│  │  │  │  ├─ exit-fullscreen.svg
│  │  │  │  ├─ eye-open.svg
│  │  │  │  ├─ eye.svg
│  │  │  │  ├─ form.svg
│  │  │  │  ├─ fullscreen.svg
│  │  │  │  ├─ github.svg
│  │  │  │  ├─ goods.svg
│  │  │  │  ├─ guide.svg
│  │  │  │  ├─ histroyList.svg
│  │  │  │  ├─ icon.svg
│  │  │  │  ├─ input.svg
│  │  │  │  ├─ international.svg
│  │  │  │  ├─ job.svg
│  │  │  │  ├─ L.svg
│  │  │  │  ├─ language.svg
│  │  │  │  ├─ leftImg.svg
│  │  │  │  ├─ link.svg
│  │  │  │  ├─ list.svg
│  │  │  │  ├─ lock.svg
│  │  │  │  ├─ log.svg
│  │  │  │  ├─ logininfor.svg
│  │  │  │  ├─ LOGO.svg
│  │  │  │  ├─ logofont.svg
│  │  │  │  ├─ message.svg
│  │  │  │  ├─ money.svg
│  │  │  │  ├─ monitor.svg
│  │  │  │  ├─ more.svg
│  │  │  │  ├─ nested.svg
│  │  │  │  ├─ note.svg
│  │  │  │  ├─ number.svg
│  │  │  │  ├─ online.svg
│  │  │  │  ├─ open.svg
│  │  │  │  ├─ outservice.svg
│  │  │  │  ├─ pagination.svg
│  │  │  │  ├─ password copy.svg
│  │  │  │  ├─ password.svg
│  │  │  │  ├─ pdf.svg
│  │  │  │  ├─ people.svg
│  │  │  │  ├─ peoples.svg
│  │  │  │  ├─ phone.svg
│  │  │  │  ├─ pingming.svg
│  │  │  │  ├─ post.svg
│  │  │  │  ├─ project.svg
│  │  │  │  ├─ qq.svg
│  │  │  │  ├─ question.svg
│  │  │  │  ├─ radio.svg
│  │  │  │  ├─ rate.svg
│  │  │  │  ├─ redis-list.svg
│  │  │  │  ├─ redis.svg
│  │  │  │  ├─ right-gray.svg
│  │  │  │  ├─ right.svg
│  │  │  │  ├─ rightImg.svg
│  │  │  │  ├─ row.svg
│  │  │  │  ├─ search.svg
│  │  │  │  ├─ select.svg
│  │  │  │  ├─ sendMessageError.svg
│  │  │  │  ├─ server.svg
│  │  │  │  ├─ ship.svg
│  │  │  │  ├─ shipList.svg
│  │  │  │  ├─ shopping.svg
│  │  │  │  ├─ size.svg
│  │  │  │  ├─ skill.svg
│  │  │  │  ├─ slider.svg
│  │  │  │  ├─ smileIcon.svg
│  │  │  │  ├─ special.svg
│  │  │  │  ├─ star.svg
│  │  │  │  ├─ swagger.svg
│  │  │  │  ├─ switch.svg
│  │  │  │  ├─ system.svg
│  │  │  │  ├─ tab.svg
│  │  │  │  ├─ table.svg
│  │  │  │  ├─ textarea.svg
│  │  │  │  ├─ theme.svg
│  │  │  │  ├─ time-range.svg
│  │  │  │  ├─ time.svg
│  │  │  │  ├─ tips.svg
│  │  │  │  ├─ tool.svg
│  │  │  │  ├─ tree-table.svg
│  │  │  │  ├─ tree.svg
│  │  │  │  ├─ tuntu.svg
│  │  │  │  ├─ tx.svg
│  │  │  │  ├─ txt.svg
│  │  │  │  ├─ upload.svg
│  │  │  │  ├─ user.svg
│  │  │  │  ├─ validCode.svg
│  │  │  │  ├─ video.svg
│  │  │  │  ├─ wechat.svg
│  │  │  │  ├─ zhaq_icon5.svg
│  │  │  │  ├─ zip.svg
│  │  │  │  ├─ 书签.svg
│  │  │  │  ├─ 其他-安全设置.svg
│  │  │  │  ├─ 分组4.svg
│  │  │  │  ├─ 卸.svg
│  │  │  │  ├─ 可视化大屏.svg
│  │  │  │  ├─ 商务服务.svg
│  │  │  │  ├─ 夜晚.svg
│  │  │  │  ├─ 夜班.svg
│  │  │  │  ├─ 定位.svg
│  │  │  │  ├─ 控制台.svg
│  │  │  │  ├─ 提单汇总.svg
│  │  │  │  ├─ 残损单.svg
│  │  │  │  ├─ 溢损单.svg
│  │  │  │  ├─ 理货日报.svg
│  │  │  │  ├─ 理货证明书.svg
│  │  │  │  ├─ 白天.svg
│  │  │  │  ├─ 舱口销账.svg
│  │  │  │  ├─ 菜单-生产管理.svg
│  │  │  │  ├─ 装.svg
│  │  │  │  ├─ 规格汇总.svg
│  │  │  │  ├─ 计数单.svg
│  │  │  │  ├─ 计费.svg
│  │  │  │  ├─ 调度指挥.svg
│  │  │  │  ├─ 财务.svg
│  │  │  │  ├─ 货主.svg
│  │  │  │  └─ 货物.svg
│  │  │  └─ systemSvg
│  │  │     ├─ APP库.svg
│  │  │     ├─ GIS地图.svg
│  │  │     ├─ GIS管控.svg
│  │  │     ├─ 劳务报表.svg
│  │  │     ├─ 劳务计费.svg
│  │  │     ├─ 商务管理.svg
│  │  │     ├─ 基础数据.svg
│  │  │     ├─ 堆场管理.svg
│  │  │     ├─ 数据大屏.svg
│  │  │     ├─ 机关财务管理.svg
│  │  │     ├─ 理货管理.svg
│  │  │     ├─ 生产外付.svg
│  │  │     ├─ 生产管理.svg
│  │  │     ├─ 系统管理.svg
│  │  │     ├─ 统计报表.svg
│  │  │     ├─ 计费结算.svg
│  │  │     ├─ 设备管理.svg
│  │  │     ├─ 调度管理.svg
│  │  │     ├─ 财务管理.svg
│  │  │     └─ 集疏港作业.svg
│  │  ├─ images
│  │  │  ├─ bg.jpg
│  │  │  ├─ bg.png
│  │  │  ├─ bottombg1@2x.png
│  │  │  ├─ close.png
│  │  │  ├─ dark.svg
│  │  │  ├─ dili.jpeg
│  │  │  ├─ dp_bg.jpg
│  │  │  ├─ dp_head_bg.png
│  │  │  ├─ file.png
│  │  │  ├─ light.svg
│  │  │  ├─ login-background.jpg
│  │  │  ├─ login-background1.jpg
│  │  │  ├─ map.png
│  │  │  ├─ map2.png
│  │  │  ├─ map3.png
│  │  │  ├─ open.png
│  │  │  ├─ profile.jpg
│  │  │  ├─ 白色bg1@2x.png
│  │  │  ├─ 白色bg2@2x.png
│  │  │  └─ 门机.png
│  │  ├─ logo
│  │  │  ├─ bzh.png
│  │  │  ├─ img.png
│  │  │  ├─ logo-h-white.png
│  │  │  ├─ logo-h-white2.png
│  │  │  ├─ logo-h-white3.png
│  │  │  ├─ logo.png
│  │  │  ├─ logo1.png
│  │  │  └─ logoMin.png
│  │  ├─ map
│  │  │  ├─ map.png
│  │  │  ├─ map1.png
│  │  │  ├─ map2.png
│  │  │  ├─ map3.png
│  │  │  ├─ map4.png
│  │  │  ├─ map5.png
│  │  │  ├─ map6.png
│  │  │  ├─ map7.png
│  │  │  └─ map8.png
│  │  ├─ newIconFonts
│  │  │  ├─ demo.css
│  │  │  ├─ demo_index.html
│  │  │  ├─ iconfont.css
│  │  │  ├─ iconfont.js
│  │  │  ├─ iconfont.json
│  │  │  ├─ iconfont.ttf
│  │  │  ├─ iconfont.woff
│  │  │  └─ iconfont.woff2
│  │  ├─ styles
│  │  │  ├─ @
│  │  │  │  └─ assets
│  │  │  │     └─ visualization
│  │  │  │        └─ title_left_bg.png
│  │  │  ├─ btn.scss
│  │  │  ├─ dispatch
│  │  │  │  ├─ img
│  │  │  │  │  ├─ bg1.png
│  │  │  │  │  ├─ border.png
│  │  │  │  │  ├─ day1.png
│  │  │  │  │  ├─ line.png
│  │  │  │  │  ├─ logo.png
│  │  │  │  │  ├─ month1.png
│  │  │  │  │  ├─ rect.png
│  │  │  │  │  └─ year1.png
│  │  │  │  ├─ shandong.json
│  │  │  │  └─ visualization.scss
│  │  │  ├─ element-ui.scss
│  │  │  ├─ formData.scss
│  │  │  ├─ index.scss
│  │  │  ├─ mixin.scss
│  │  │  ├─ searchform.scss
│  │  │  ├─ sidebar.scss
│  │  │  ├─ table.scss
│  │  │  ├─ transition.scss
│  │  │  ├─ variables.module.scss
│  │  │  ├─ visualization.scss
│  │  │  ├─ visualization2.scss
│  │  │  ├─ visualization3.scss
│  │  │  ├─ visualization4.scss
│  │  │  └─ yangyi.scss
│  │  ├─ visualization
│  │  │  ├─ arrow.png
│  │  │  ├─ bg2.jpg
│  │  │  ├─ bg_img03.png
│  │  │  ├─ bg_img04.png
│  │  │  ├─ border_bg.jpg
│  │  │  ├─ border_bg01.png
│  │  │  ├─ box_title.png
│  │  │  ├─ chart_icon.png
│  │  │  ├─ chart_icon_on.png
│  │  │  ├─ close.png
│  │  │  ├─ close_icon.png
│  │  │  ├─ data_icon.png
│  │  │  ├─ data_icon_on.png
│  │  │  ├─ fangda.png
│  │  │  ├─ index_bg.png
│  │  │  ├─ jian.png
│  │  │  ├─ line-blue.png
│  │  │  ├─ line_bg.png
│  │  │  ├─ line_crosswise_img.png
│  │  │  ├─ line_img.png
│  │  │  ├─ menu_btn.png
│  │  │  ├─ menu_on.png
│  │  │  ├─ next.png
│  │  │  ├─ people_iocn.png
│  │  │  ├─ plus.png
│  │  │  ├─ popUP_bg.png
│  │  │  ├─ prev.png
│  │  │  ├─ select_icon.png
│  │  │  ├─ select_icon_on.png
│  │  │  ├─ selsct_time.png
│  │  │  ├─ settings_icon.png
│  │  │  ├─ settings_icon_on.png
│  │  │  ├─ teacher_icon.png
│  │  │  ├─ title_bg01.png
│  │  │  ├─ title_border.png
│  │  │  ├─ title_border_bg.png
│  │  │  ├─ title_left_bg.png
│  │  │  ├─ title_line.png
│  │  │  ├─ title_right_bg.png
│  │  │  └─ weather
│  │  │     ├─ weather_img01.png
│  │  │     ├─ 中雨.png
│  │  │     ├─ 中雨转大雨.png
│  │  │     ├─ 中雪.png
│  │  │     ├─ 中雪转大雪.png
│  │  │     ├─ 冻雨.png
│  │  │     ├─ 多云.png
│  │  │     ├─ 大暴雨.png
│  │  │     ├─ 大暴雪.png
│  │  │     ├─ 大雨.png
│  │  │     ├─ 大雨转暴雨.png
│  │  │     ├─ 大雪.png
│  │  │     ├─ 大雪转暴雪.png
│  │  │     ├─ 小雨.png
│  │  │     ├─ 小雨转中雨.png
│  │  │     ├─ 小雪.png
│  │  │     ├─ 小雪转中雪.png
│  │  │     ├─ 强沙尘暴.png
│  │  │     ├─ 扬沙.png
│  │  │     ├─ 晴.png
│  │  │     ├─ 暴雨.png
│  │  │     ├─ 暴雨转大暴雨.png
│  │  │     ├─ 暴雪.png
│  │  │     ├─ 沙尘暴.png
│  │  │     ├─ 浮尘.png
│  │  │     ├─ 特大暴雨.png
│  │  │     ├─ 阴.png
│  │  │     ├─ 阵雨.png
│  │  │     ├─ 阵雪.png
│  │  │     ├─ 雨加雪.png
│  │  │     ├─ 雷阵雨.png
│  │  │     ├─ 雷阵雨加冰雹.png
│  │  │     ├─ 雾.png
│  │  │     └─ 霾.png
│  │  └─ wficonfont
│  │     ├─ demo.css
│  │     ├─ demo_index.html
│  │     ├─ iconfont.css
│  │     ├─ iconfont.js
│  │     ├─ iconfont.json
│  │     ├─ iconfont.ttf
│  │     ├─ iconfont.woff
│  │     └─ iconfont.woff2
│  ├─ components
│  │  ├─ BaseTable
│  │  │  └─ index.vue
│  │  ├─ Breadcrumb
│  │  │  └─ index.vue
│  │  ├─ Crontab
│  │  │  ├─ day.vue
│  │  │  ├─ hour.vue
│  │  │  ├─ index.vue
│  │  │  ├─ min.vue
│  │  │  ├─ month.vue
│  │  │  ├─ result.vue
│  │  │  ├─ second.vue
│  │  │  ├─ week.vue
│  │  │  └─ year.vue
│  │  ├─ Dialog
│  │  │  └─ index.vue
│  │  ├─ DictTag
│  │  │  └─ index.vue
│  │  ├─ DropDown
│  │  │  └─ index.vue
│  │  ├─ Editor
│  │  │  └─ index.vue
│  │  ├─ EditTable
│  │  │  └─ index.vue
│  │  ├─ FastEntry
│  │  │  └─ index.vue
│  │  ├─ FormatInput
│  │  │  └─ index.vue
│  │  ├─ Hamburger
│  │  │  └─ index.vue
│  │  ├─ HeaderSearch
│  │  │  └─ index.vue
│  │  ├─ IconSelect
│  │  │  ├─ index.vue
│  │  │  └─ requireIcons.js
│  │  ├─ iFrame
│  │  │  └─ index.vue
│  │  ├─ ImagePreview
│  │  │  └─ index.vue
│  │  ├─ ImageUpload
│  │  │  └─ index.vue
│  │  ├─ inputSearch
│  │  │  └─ index.vue
│  │  ├─ nvDatePicker
│  │  │  └─ index.vue
│  │  ├─ Pagination
│  │  │  └─ index.vue
│  │  ├─ ParentView
│  │  │  └─ index.vue
│  │  ├─ RemoteSelect
│  │  │  └─ index.vue
│  │  ├─ RemoteSelectTable
│  │  │  └─ index.vue
│  │  ├─ RenderDom
│  │  │  └─ index.vue
│  │  ├─ RightToolbar
│  │  │  └─ index.vue
│  │  ├─ Screenfull
│  │  │  └─ index.vue
│  │  ├─ SearchHeader
│  │  │  └─ index.vue
│  │  ├─ Select
│  │  │  └─ index.vue
│  │  ├─ SelectTable
│  │  │  └─ index.vue
│  │  ├─ SizeSelect
│  │  │  └─ index.vue
│  │  ├─ SvgIcon
│  │  │  ├─ index.vue
│  │  │  └─ svgicon.js
│  │  ├─ TopNav
│  │  │  └─ index.vue
│  │  ├─ TreeSelect
│  │  │  └─ index.vue
│  │  ├─ upload
│  │  │  ├─ index.vue
│  │  │  └─ zzz.vue
│  │  └─ Yangyi
│  │     ├─ Doc
│  │     │  └─ index.vue
│  │     └─ Git
│  │        └─ index.vue
│  ├─ config
│  │  └─ index.js
│  ├─ directive
│  │  ├─ common
│  │  │  └─ copyText.js
│  │  ├─ index.js
│  │  └─ permission
│  │     ├─ hasPermi.js
│  │     └─ hasRole.js
│  ├─ layout
│  │  ├─ components
│  │  │  ├─ AppMain.vue
│  │  │  ├─ IframeToggle
│  │  │  │  └─ index.vue
│  │  │  ├─ index.js
│  │  │  ├─ InnerLink
│  │  │  │  └─ index.vue
│  │  │  ├─ Navbar.vue
│  │  │  ├─ Settings
│  │  │  │  └─ index.vue
│  │  │  ├─ Sidebar
│  │  │  │  ├─ index.vue
│  │  │  │  ├─ Link.vue
│  │  │  │  ├─ Logo.vue
│  │  │  │  ├─ menuItemList
│  │  │  │  │  ├─ index.vue
│  │  │  │  │  ├─ NavigationItem-card.vue
│  │  │  │  │  ├─ NavigationItem-list.vue
│  │  │  │  │  └─ NavigationItem.vue
│  │  │  │  ├─ SidebarItem.vue
│  │  │  │  └─ topNavSidebarItem.vue
│  │  │  ├─ TagsView
│  │  │  │  ├─ index.vue
│  │  │  │  ├─ ScrollPane.vue
│  │  │  │  └─ yindex.vue
│  │  │  └─ userProfile
│  │  │     ├─ change
│  │  │     │  └─ index.vue
│  │  │     ├─ follow
│  │  │     │  └─ index.vue
│  │  │     ├─ index.vue
│  │  │     └─ page
│  │  │        └─ index.vue
│  │  └─ index.vue
│  ├─ main.js
│  ├─ permission.js
│  ├─ plugins
│  │  ├─ auth.js
│  │  ├─ cache.js
│  │  ├─ download.js
│  │  ├─ index.js
│  │  ├─ modal.js
│  │  └─ tab.js
│  ├─ router
│  │  └─ index.js
│  ├─ settings.js
│  ├─ store
│  │  ├─ index.js
│  │  └─ modules
│  │     ├─ app.js
│  │     ├─ dict.js
│  │     ├─ permission.js
│  │     ├─ settings.js
│  │     ├─ tableParams.js
│  │     ├─ tagsView.js
│  │     └─ user.js
│  ├─ utils
│  │  ├─ auth
│  │  │  ├─ jsencrypt.js
│  │  │  ├─ permission.js
│  │  │  ├─ request.js
│  │  │  └─ token.js
│  │  ├─ bus.js
│  │  ├─ commonFunc
│  │  │  ├─ dict.js
│  │  │  ├─ dynamicTitle.js
│  │  │  ├─ math.js
│  │  │  ├─ scroll-to.js
│  │  │  ├─ theme.js
│  │  │  └─ yangyi.js
│  │  ├─ constant
│  │  │  ├─ constant.js
│  │  │  └─ errorCode.js
│  │  ├─ index.js
│  │  └─ verify
│  │     ├─ validate.js
│  │     └─ verify.js
│  └─ views
│     ├─ error
│     │  ├─ 401.vue
│     │  └─ 404.vue
│     ├─ home
│     │  └─ index.vue
│     ├─ login.vue
│     ├─ master
│     │  └─ dict
│     │     ├─ detail
│     │     │  └─ index.vue
│     │     ├─ drawerList
│     │     │  ├─ detail
│     │     │  │  └─ index.vue
│     │     │  └─ index.vue
│     │     └─ index.vue
│     ├─ navigation
│     │  ├─ EachartNavigation.vue
│     │  ├─ index.vue
│     │  └─ NavigationItem.vue
│     ├─ redirect
│     │  └─ index.vue
│     ├─ register.vue
│     ├─ system
│     │  ├─ dept
│     │  │  └─ index.vue
│     │  ├─ log
│     │  │  ├─ loginLog
│     │  │  │  ├─ drawer
│     │  │  │  │  └─ index.vue
│     │  │  │  └─ index.vue
│     │  │  └─ operLog
│     │  │     ├─ drawer
│     │  │     │  └─ index.vue
│     │  │     └─ index.vue
│     │  ├─ menu
│     │  │  └─ index.vue
│     │  ├─ online
│     │  │  └─ index.vue
│     │  ├─ parameter
│     │  │  ├─ index.vue
│     │  │  └─ parameterLogDetail
│     │  │     └─ index.vue
│     │  ├─ parameterUser
│     │  │  ├─ index.vue
│     │  │  └─ parameterUserLogDetail
│     │  │     └─ index.vue
│     │  ├─ role
│     │  │  ├─ dialog
│     │  │  │  └─ index.vue
│     │  │  ├─ drawer
│     │  │  │  └─ index.vue
│     │  │  └─ index.vue
│     │  ├─ user
│     │  │  ├─ detail
│     │  │  │  └─ index.vue
│     │  │  ├─ index.vue
│     │  │  └─ profile
│     │  │     ├─ index.vue
│     │  │     ├─ personalization
│     │  │     │  └─ index.vue
│     │  │     ├─ resetPwd.vue
│     │  │     └─ userInfo.vue
│     │  └─ version
│     │     ├─ detail
│     │     │  └─ index.vue
│     │     └─ index.vue
│     └─ tools
│        ├─ demo
│        │  └─ index.vue
│        └─ templatedesign
│           └─ index.vue
├─ vite
│  └─ plugins
│     ├─ auto-import.js
│     ├─ compression.js
│     ├─ index.js
│     ├─ setup-extend.js
│     └─ svg-icon.js
└─ vite.config.js

```