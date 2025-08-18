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
