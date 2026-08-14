const copy = {
  en: {
    openApp: "Open the app",
    brandResources: "Brand resources",
    eyebrow: "ONE DOMAIN / MANY TOOLS",
    heroTitle: "A small constellation for a more intentional life.",
    heroLede:
      "Integ.Life is not one giant platform. It is a family of focused tools—each useful on its own, connected by a shared identity when it matters.",
    principleOne: "Focused by design.",
    principleTwo: "Connected by identity.",
    principleThree: "Independent by default.",
    directoryEyebrow: "THE DIRECTORY",
    directoryTitle: "Choose your door.",
    directoryNote: "Nine live products. One deliberately small ecosystem.",
    appDescription:
      "An offline-first personal operating system for notes, tasks, goals, focus, relationships, accounting, and AI-assisted review.",
    langDescription:
      "Turn interests into short readings, tappable vocabulary, quick checks, and structured language courses.",
    chatDescription:
      "Slack-style rooms and DMs where people and agents collaborate through messages, threads, files, canvases, and tasks.",
    chessTitle: "Chinese Chess",
    chessDescription:
      "Learn and play Xiangqi with courses, engines, analysis, online matches, and a synced game library.",
    internationalChessTitle: "Chess",
    internationalChessDescription:
      "Learn and play chess with courses, Stockfish, analysis, online matches, and synced games.",
    snakeDescription:
      "Real-time multiplayer Snake with territory painting, co-op challenges, shared rooms, and reconnectable play.",
    gamesDescription:
      "Twenty original, touch-friendly browser games with local saves and no account required.",
    toolsDescription:
      "Privacy-first browser utilities and calculators that process inputs locally in seven languages.",
    blogTitle: "Field Notes",
    blogDescription:
      "Notes on focused work, AI-assisted execution, and the systems behind these tools.",
    enter: "Enter ↗",
    play: "Play ↗",
    use: "Use ↗",
    read: "Read ↗",
    identityEyebrow: "SHARED IDENTITY",
    identityTitle: "Move between tools without becoming the product.",
    identityBody:
      "The connected apps use one secure Integ.Life identity while keeping their own sessions and business data separate.",
    footer: "Built as a collection, not a cage.",
  },
  zh: {
    openApp: "打开 App",
    brandResources: "品牌资源",
    eyebrow: "一个域名 / 多个工具",
    heroTitle: "一组小而专注的工具，连接更有意识的生活。",
    heroLede:
      "Integ.Life 不是一个包揽一切的巨型平台，而是一组各自独立、各自有用的专注工具；需要时，它们由同一个身份连接起来。",
    principleOne: "专注，是设计选择。",
    principleTwo: "身份，让工具相连。",
    principleThree: "默认保持独立。",
    directoryEyebrow: "产品目录",
    directoryTitle: "选择你的入口。",
    directoryNote: "九个在线产品，一套刻意保持小而清晰的生态。",
    appDescription: "离线优先的个人生活操作系统，连接笔记、任务、目标、专注、关系、记账与 AI 复盘。",
    langDescription: "把兴趣变成短阅读、可点词汇、快速检查和结构化语言课程。",
    chatDescription: "Slack 式 Room 与私聊，让人与 Agent 通过消息、Thread、文件、Canvas 和任务协作。",
    chessTitle: "中国象棋",
    chessDescription: "通过课程、引擎、推演、在线对局和同步棋谱学习并实战中国象棋。",
    internationalChessTitle: "国际象棋",
    internationalChessDescription: "通过课程、Stockfish、推演、在线对局和同步棋谱学习并实战国际象棋。",
    snakeDescription: "实时多人贪吃蛇，支持圈地、组队闯关、共享房间与断线接回。",
    gamesDescription: "20 款原创、触屏友好的浏览器小游戏，本地保存进度，无需账号。",
    toolsDescription: "隐私优先的浏览器工具与实用计算器，输入在本地处理，支持七种语言。",
    blogTitle: "实践笔记",
    blogDescription: "记录专注工作、AI 辅助执行，以及这些工具背后的系统实践。",
    enter: "进入 ↗",
    play: "游玩 ↗",
    use: "使用 ↗",
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

async function retireLegacyServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const hadController = Boolean(navigator.serviceWorker.controller);
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }

    if (hadController && sessionStorage.getItem("legacy-pwa-retired") !== "true") {
      sessionStorage.setItem("legacy-pwa-retired", "true");
      window.location.reload();
    }
  } catch (error) {
    console.warn("Unable to retire the legacy service worker", error);
  }
}

function setLanguage(language) {
  const selected = copy[language] ? language : "en";
  document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
  nodes.forEach((node) => {
    if (copy[selected][node.dataset.copy]) node.textContent = copy[selected][node.dataset.copy];
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

void retireLegacyServiceWorker();
