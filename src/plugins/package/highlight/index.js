// src/plugins/package/highlight/index.js
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';

// 注册语言
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);

// 改为 ES 模块的默认导出
export default hljs;