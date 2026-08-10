const brandCopy = {
  en: {
    directory: "Product directory", brandEyebrow: "OFFICIAL BRAND RESOURCES", brandTitle: "One home for the Integ.Life identity.",
    brandLede: "Download the current marks, use the shared palette, and keep every Integ.Life surface recognizably related.",
    logosTitle: "Marks for every scale.", logosNote: "Use the wordmark when space allows. Use the icon for compact square placements.",
    wordmarkTitle: "Horizontal wordmark", iconLargeTitle: "App icon", iconSmallTitle: "Web icon", download: "Download ↓",
    colorsTitle: "Warm paper. Clear ink. Small signals.", colorsNote: "Paper and ink carry the interface. Accent colors organize information; they are not decorative gradients.",
    downloadTokens: "Download CSS color tokens ↓", guidanceTitle: "Keep it quiet and recognizable.", doTitle: "Do",
    doBody: "Keep clear space around the mark, preserve its proportions, and use the supplied files.", dontTitle: "Avoid",
    dontBody: "Do not stretch, recolor, crop, add effects, or rebuild the feather from screenshots.", typeTitle: "Typography",
    typeBody: "Use Avenir Next or Helvetica Neue for interface text, with Didot or Iowan Old Style for expressive headings.",
    brandFooter: "Use these files as the public source of truth.",
  },
  zh: {
    directory: "产品目录", brandEyebrow: "官方品牌资源", brandTitle: "Integ.Life 品牌资源，统一放在这里。",
    brandLede: "下载当前标识、使用统一色彩，让每个 Integ.Life 界面彼此独立又清晰相连。",
    logosTitle: "适用于各种尺寸的标识。", logosNote: "空间充足时使用横向文字标识；紧凑的方形位置使用图标。",
    wordmarkTitle: "横向文字标识", iconLargeTitle: "App 图标", iconSmallTitle: "网页图标", download: "下载 ↓",
    colorsTitle: "温暖纸色，清晰墨色，克制信号色。", colorsNote: "纸色与墨色构成界面主体；强调色用于组织信息，不用于装饰性渐变。",
    downloadTokens: "下载 CSS 色彩变量 ↓", guidanceTitle: "保持克制，也保持一眼可认。", doTitle: "推荐",
    doBody: "为标识保留足够留白、保持原始比例，并直接使用这里提供的文件。", dontTitle: "避免",
    dontBody: "不要拉伸、改色、裁切、添加特效，也不要从截图重新描摹羽毛图标。", typeTitle: "字体",
    typeBody: "界面文字使用 Avenir Next 或 Helvetica Neue；表达性标题使用 Didot 或 Iowan Old Style。",
    brandFooter: "这些文件是公开品牌资源的唯一准则。",
  },
};

function applyBrandLanguage() {
  const language = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  document.querySelectorAll("[data-copy]").forEach((node) => {
    if (brandCopy[language][node.dataset.copy]) node.textContent = brandCopy[language][node.dataset.copy];
  });
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => requestAnimationFrame(applyBrandLanguage));
});
applyBrandLanguage();
