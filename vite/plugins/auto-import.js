import autoImport from 'unplugin-auto-import/vite'

export default function createAutoImport() {
    return autoImport({
        imports: [
            'vue',
            'vue-router',
            'pinia'
        ],
        dts: false,
        // 添加Element Plus的自动导入配置
        resolvers: [
            (name) => {
                if (name.startsWith('El')) {
                    return { name, from: 'element-plus' }
                }
            }
        ]
    })
}