// src/plugins/package/highlight/index.js
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';

// 注册语言
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);

// 导出 hljs 实例（兼容 Vue 插件）
export default hljs;