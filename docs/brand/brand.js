const brandCopy = {
  en: {
    directory: "Product directory", brandEyebrow: "OFFICIAL BRAND RESOURCES", brandTitle: "One home for the Integ.Life identity.",
    brandLede: "Download the current marks, use the shared palette, and keep every Integ.Life surface recognizably related.",
    familyTitle: "One living system. Ten distinct doors.", familyNote: "Every product keeps the master leaf and gains one consistently placed badge for its own job.",
    masterRole: "MASTER BRAND", productRole: "PRODUCT", downloadSvg: "SVG ↓", chineseChess: "Chinese Chess", internationalChess: "Chess",
    systemRuleLabel: "SYSTEM RULE", systemRule: "The leaf establishes family. The lower-right badge names the product. Badge size and position never change.",
    logosTitle: "The master mark, ready for use.", logosNote: "Use the wordmark when space allows. Use the master icon for compact organization-level placements.",
    wordmarkTitle: "Horizontal wordmark", masterIconTitle: "Master icon", download: "Download ↓",
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
    familyTitle: "一个有生命的体系，十个各自清晰的入口。", familyNote: "每个产品都保留母标羽叶，并在同一位置加入代表自身任务的徽记。",
    masterRole: "主品牌", productRole: "产品", downloadSvg: "SVG ↓", chineseChess: "中国象棋", internationalChess: "国际象棋",
    systemRuleLabel: "体系规则", systemRule: "羽叶负责建立家族感，右下徽记负责指认产品；徽记的尺寸和位置始终不变。",
    logosTitle: "可直接使用的主品牌素材。", logosNote: "空间充足时使用横向文字标识；组织级的紧凑位置使用主品牌图标。",
    wordmarkTitle: "横向文字标识", masterIconTitle: "主品牌图标", download: "下载 ↓",
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
