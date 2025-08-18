# 快速了解

带你快速的了解该框架的结构、常用页面的写法，直接复制使用即可。

## 文件结构

```js
├── build                      // 构建相关
├── bin                        // 执行脚本
|—— docs					   // 项目文档
├── public                     // 公共文件
│   └── favicon.ico            // favicon图标
├── src                        // 源代码
│   ├── api                    // 所有请求
│   ├── assets                 // 主题 字体等静态资源
│   ├── components             // 全局公用组件
│   ├── config             	   // 全局变量名称定义
│   ├── directive              // 全局自定义指令
│   ├── layout                 // 布局
│   ├── plugins                // 通用插件定义
│   ├── router                 // 路由
│   ├── store                  // 全局 store管理
│   ├── utils                  // 全局公用方法
│   ├── views                  // view
│   ├── App.vue                // 入口页面
│   ├── main.js                // 入口 加载组件 初始化等
│   ├── permission.js          // 权限管理
│   └── settings.js            // 系统配置
├── .editorconfig              // 编码格式
├── .env.development           // 开发环境配置
├── .env.production            // 生产环境配置
├── .env.staging               // 测试环境配置
├── .eslintignore              // 忽略语法检查
├── .eslintrc.js               // eslint 配置项
├── .gitignore                 // git 忽略项
├── .prettierrc                // 格式化文件
├── babel.config.js            // babel.config.js
├── package.json               // package.json
└── vue.config.js              // vue.config.js
```
