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

export default function customTranslate(translations) {
  // 预处理：将翻译键统一转为「小写 + 连字符转空格」，生成映射表
  const normalizedTranslations = Object.keys(translations).reduce((map, key) => {
    // 1. 转为小写；2. 连字符(-)替换为空格；3. 多个空格合并为一个（可选）
    const normalizedKey = key
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' '); // 合并连续空格（如"Event  based" → "Event based"）
    map[normalizedKey] = translations[key];
    return map;
  }, {});

  return function(template, replacements) {
    replacements = replacements || {};

    // 待翻译文本归一化：同上面的规则
    const normalizedTemplate = template
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ');

    // 匹配翻译（优先归一化后的键，否则 fallback 到原始文本）
    const translatedTemplate = normalizedTranslations[normalizedTemplate] || template;

    // 变量替换（同样归一化处理变量值）
    return translatedTemplate.replace(/{([^}]+)}/g, function(_, key) {
      let str = replacements[key];
      if (str) {
        // 变量值也做归一化处理
        const normalizedStr = str
          .toLowerCase()
          .replace(/-/g, ' ')
          .replace(/\s+/g, ' ');
        str = normalizedTranslations[normalizedStr] || str;
      }
      return str || `{${key}}`;
    });
  };
}