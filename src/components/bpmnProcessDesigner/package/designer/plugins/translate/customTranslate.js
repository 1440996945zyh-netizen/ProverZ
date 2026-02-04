// import translations from "./zh";
//
// export default function customTranslate(template, replacements) {
//   replacements = replacements || {};
//
//   // Translate
//   template = translations[template] || template;
//
//   // Replace
//   return template.replace(/{([^}]+)}/g, function(_, key) {
//     let str = replacements[key];
//     if (
//       translations[replacements[key]] !== null &&
//       translations[replacements[key]] !== "undefined"
//     ) {
//       // eslint-disable-next-line no-mixed-spaces-and-tabs
//       str = translations[replacements[key]];
//       // eslint-disable-next-line no-mixed-spaces-and-tabs
//     }
//     return str || "{" + key + "}";
//   });
// }
// customTranslate.js
import defaultTranslationsCN from './zh'; // 导入默认中文翻译
/**
 * bpmn-js 翻译核心函数（适配官方规范）
 * @param {Object} customTranslations 翻译字典（如 zh.js）
 */
export default function createCustomTranslate(customTranslations = {}) {
   // 合并默认翻译和自定义翻译
  const translations = {
    // 默认英文兜底
    'Append EndEvent': 'Append EndEvent',
    'Append Gateway': 'Append Gateway',
    'Append Task': 'Append Task',
    'Exclusive Gateway': 'Exclusive Gateway',
    'Parallel Gateway': 'Parallel Gateway',
    'Inclusive Gateway': 'Inclusive Gateway',
    'Event-based Gateway': 'Event-based Gateway',
    
        // 默认中文翻译
    ...defaultTranslationsCN,
    
    // 用户自定义翻译（最高优先级）
    ...customTranslations
  };
  
  return function translate(key, replacements = {}) {
    // 获取翻译文本
    let text = translations[key];
    
    // 如果没找到翻译，返回原始key（或者可以返回key）
    if (text === undefined) {
      console.warn(`Missing translation for key: "${key}"`);
      text = key;
    }
    
    // 替换占位符
    if (replacements && typeof replacements === 'object') {
      Object.keys(replacements).forEach((placeholder) => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        text = text.replace(regex, replacements[placeholder]);
      });
    }
    
    return text;
  };
}