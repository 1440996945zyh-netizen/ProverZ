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

/**
 * bpmn-js 翻译核心函数（适配官方规范）
 * @param {Object} translations 翻译字典（如 zh.js）
 */
export default function customTranslate(translations = {}) {
  // 内置默认英文兜底（防止翻译缺失）
  const defaultTranslations = {
    'Append EndEvent': 'Append EndEvent',
    'Exclusive Gateway': 'Exclusive Gateway',
    // 可补充更多默认英文键
  };

  return function translate(key, replacements = {}) {
    // 1. 优先用自定义翻译 → 2. 兜底英文 → 3. 直接返回key
    let text = translations[key] || defaultTranslations[key] || key;

    // 替换占位符（如 {type}、{count} 等）
    Object.keys(replacements).forEach((placeholder) => {
      text = text.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
    });

    return text;
  };
}