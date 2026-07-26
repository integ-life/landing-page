const copy = {
  en: {
    openApp: "Open the app",
    eyebrow: "ONE DOMAIN / MANY TOOLS",
    heroTitle: "A small constellation for a more intentional life.",
    heroLede:
      "Integ.Life is not one giant platform. It is a family of focused tools—each useful on its own, connected by a shared identity when it matters.",
    principleOne: "Focused by design.",
    principleTwo: "Connected by identity.",
    principleThree: "Independent by default.",
    directoryEyebrow: "THE DIRECTORY",
    directoryTitle: "Choose your door.",
    directoryNote: "Six live products. One deliberately small ecosystem.",
    appDescription:
      "A private operating system for notes, tasks, goals, focus, people, and money.",
    langDescription:
      "Read with context and turn unfamiliar words into a bounded daily learning loop.",
    debateDescription:
      "Structured two-party debates with explicit proposals, votes, and consensus.",
    chessTitle: "Chinese Chess",
    chessDescription:
      "Learn Xiangqi through rules, exploration, engines, and durable game records.",
    snakeDescription:
      "A compact competitive Snake game with persistent identity, replays, and stats.",
    blogTitle: "Field Notes",
    blogDescription:
      "Notes on focused work, AI-assisted execution, and the systems behind these tools.",
    enter: "Enter ↗",
    read: "Read ↗",
    identityEyebrow: "SHARED IDENTITY",
    identityTitle: "Move between tools without becoming the product.",
    identityBody:
      "The connected apps use one secure Integ.Life identity while keeping their own sessions and business data separate.",
    footer: "Built as a collection, not a cage.",
  },
  zh: {
    openApp: "打开 App",
    eyebrow: "一个域名 / 多个工具",
    heroTitle: "一组小而专注的工具，连接更有意识的生活。",
    heroLede:
      "Integ.Life 不是一个包揽一切的巨型平台，而是一组各自独立、各自有用的专注工具；需要时，它们由同一个身份连接起来。",
    principleOne: "专注，是设计选择。",
    principleTwo: "身份，让工具相连。",
    principleThree: "默认保持独立。",
    directoryEyebrow: "产品目录",
    directoryTitle: "选择你的入口。",
    directoryNote: "六个在线产品，一套刻意保持小而清晰的生态。",
    appDescription: "用于笔记、任务、目标、专注、关系与财务的私人生活操作系统。",
    langDescription: "在上下文中阅读，把陌生词汇变成边界清晰的每日学习闭环。",
    debateDescription: "为人与 Agent 提供结构化的双边讨论、明确提案、投票与共识。",
    chessTitle: "中国象棋",
    chessDescription: "通过规则、推演、引擎和可长期保存的棋谱学习中国象棋。",
    snakeDescription: "一款紧凑的竞技贪吃蛇游戏，支持统一身份、回放和统计。",
    blogTitle: "实践笔记",
    blogDescription: "记录专注工作、AI 辅助执行，以及这些工具背后的系统实践。",
    enter: "进入 ↗",
    read: "阅读 ↗",
    identityEyebrow: "统一身份",
    identityTitle: "在工具之间移动，但不被任何一个产品困住。",
    identityBody:
      "关联应用使用同一个安全的 Integ.Life 身份，同时继续保持各自独立的 Session 和业务数据。",
    footer: "它是一组工具，而不是一座围墙。",
  },
};

const buttons = document.querySelectorAll("[data-language]");
const nodes = document.querySelectorAll("[data-copy]");

function setLanguage(language) {
  const selected = copy[language] ? language : "en";
  document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
  nodes.forEach((node) => {
    node.textContent = copy[selected][node.dataset.copy];
  });
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === selected));
  });
  localStorage.setItem("integ-life-language", selected);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

const preferred =
  localStorage.getItem("integ-life-language") ||
  (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en");
setLanguage(preferred);
