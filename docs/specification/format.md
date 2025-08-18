## 代码自动格式化

使用 VSCode 开发。使用 IDEA 暂时不会自动格式化...

1. 安装 ESLint 以及 Prettier - Code formatter
2. 按住 ctrl + shift + P ，输入 setting.json ，选择首选项：打开工作区设置。
3. 将以下代码替换

```js
{
    "eslint.validate": [
        {
            "language": "vue",
            "autoFix": true
        },
        {
            "language": "html",
            "autoFix": true
        },
        {
            "language": "javascript",
            "autoFix": true
        }
    ],
    "eslint.autoFixOnSave": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "vue.features.codeActions.enable": false
}

```

4. 这时候按 ctrl + S 保存时会自动格式化代码了！如果你不能，那在代码中点击右键，点击格式化文档，配置，将 Prettier 配置成默认即可。
