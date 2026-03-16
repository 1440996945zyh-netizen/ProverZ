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
import defaultTranslationsCN from './zh';

/**
 * 优化后的翻译核心函数
 */
export default function createCustomTranslate(customTranslations = {}) {
  // 合并字典
  const translations = {
    ...defaultTranslationsCN,
    ...customTranslations
  };

  // 创建一个全小写的副本，用于模糊匹配
  const lowercaseMap = {};
  Object.keys(translations).forEach(key => {
    lowercaseMap[key.toLowerCase()] = translations[key];
  });

  return function translate(template, replacements = {}) {
    replacements = replacements || {};

    // 1. 尝试直接匹配（最高优先级）
    let text = translations[template];

    // 2. 如果没找到，尝试忽略大小写匹配（解决 Intermediate throw event 等问题）
    if (text === undefined) {
      text = lowercaseMap[template.toLowerCase()] || template;
    }

    // 3. 递归替换占位符 {key}
    return text.replace(/{([^}]+)}/g, function (_, key) {
      let replacementValue = replacements[key];

      if (replacementValue !== undefined && replacementValue !== null) {
        // 尝试翻译占位符里的值 (例如 {type} 里的 "User Task")
        // 同样支持忽略大小写匹配
        const translatedValue = translations[replacementValue] ||
          lowercaseMap[replacementValue.toString().toLowerCase()] ||
          replacementValue;
        return translatedValue;
      }

      return '{' + key + '}';
    });
  };
}
