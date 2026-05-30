// js/state.js

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
window.resources = { gold: 0, wood: 0, stone: 0, metal: 0 };
window.level = 1;
window.currentXP = 0;
window.xpToNextLevel = 100;
window.currentEra = 1;
window.villagers = [];
window.isRaining = false; // Идет ли дождь прямо сейчас
window.isShipActive = false; // Есть ли корабль на экране
window.currentTradeOffer = null; // Текущее предложение торговца

// Свет и Группы
window.lightSources = [];
window.buildingsGroup = null;
window.natureGroup = null;
window.decorationsGroup = null;
window.centralMonument = null;
window.lightsGroup = null;
window.occupiedGrid = [{ x: 0, y: 0 }];
window.buildingRequests = [];
window.waterGraphics = null;
window.gameScene = null;
window.isDraggingEntity = false;

// Настройки мира
window.worldWidth = 3000;
window.worldHeight = 3000;
window.isNight = false;

// === СТАТИСТИКА (ИНИЦИАЛИЗАЦИЯ) ===
window.gameStats = {
  treesCut: 0,
  stonesMined: 0,
  daysPassed: 0,
  tasksCompleted: 0,
  totalRes: { gold: 0, wood: 0, stone: 0, metal: 0 },
};

// Глобальные сиды
window.SEED_X = Math.random() * 1000;
window.SEED_Y = Math.random() * 1000;

// Таймеры
window.autoSaveInterval = null;
window.villagerAIInterval = null;
window.natureRespawnEvent = null;

// Функция сброса
window.resetGlobalState = function () {
  window.resources = { gold: 0, wood: 0, stone: 0, metal: 0 };
  window.level = 1;
  window.currentXP = 0;
  window.xpToNextLevel = 100;
  window.currentEra = 1;
  window.occupiedGrid = [{ x: 0, y: 0 }];
  window.buildingRequests = [];
  window.lightSources = [];
  window.villagers = [];
  window.isNight = false;

  // Сброс статистики
  window.gameStats = {
    treesCut: 0,
    stonesMined: 0,
    daysPassed: 0,
    tasksCompleted: 0,
    totalRes: { gold: 0, wood: 0, stone: 0, metal: 0 },
  };

  window.SEED_X = Math.random() * 10000;
  window.SEED_Y = Math.random() * 10000;
};

// --- КОНФИГУРАЦИЯ ---
const RESOURCE_LIMITS = [500, 1000, 2500, 5000, 10000];

window.getCurrentLimit = function () {
  return RESOURCE_LIMITS[window.currentEra - 1];
};

window.NEXT_ERA_REQUIREMENTS = [
  { lvl: 10, gold: 500 },
  { lvl: 30, gold: 1500 },
  { lvl: 50, gold: 5000 },
  { lvl: 80, gold: 15000 },
];

window.BUILDING_TYPES = {
  // Мы оставили только заглушку, так как логика парков и садов удалена из геймплея.
  // Но типы 'house' обрабатываются отдельно в buildings.js через switch/case эр.
};

window.CURSOR_DB = [
  // Стандартный
  {
    id: "default",
    name: "Стандарт",
    rarity: "common",
    path: "cursors/default",
  },
  {
    id: "crystal",
    name: "Майнкрафт аметист",
    rarity: "common",
    path: "cursors/crystal",
  },
  {
    id: "bubbleDefault",
    name: "Пузырек",
    rarity: "common",
    path: "cursors/bubbleDefault",
  },
  {
    id: "overwatch",
    name: "Овервотч",
    rarity: "common",
    path: "cursors/overwatch",
  },
  { id: "big", name: "Большой", rarity: "common", path: "cursors/big" },

  // Редкий
  {
    id: "minecraft",
    name: "Майнкрафт",
    rarity: "rare",
    path: "cursors/minecraft",
  },
  {
    id: "cyberpunk",
    name: "Киберпанк",
    rarity: "rare",
    path: "cursors/cyberpunk",
  },
  { id: "rem", name: "Рем", rarity: "rare", path: "cursors/rem" },
  { id: "hornet", name: "Хорнет", rarity: "rare", path: "cursors/hornet" },

  // Эпик
  {
    id: "bubbleEpic",
    name: "Эпический пузырек",
    rarity: "epic",
    path: "cursors/bubbleEpic",
  },
  { id: "miku", name: "Мику", rarity: "epic", path: "cursors/miku" },
  {
    id: "castoria",
    name: "Кастория",
    rarity: "epic",
    path: "cursors/castoria",
  },
  { id: "elisia", name: "Элизия", rarity: "epic", path: "cursors/elisia" },
  { id: "ellen", name: "Эллен", rarity: "epic", path: "cursors/ellen" },

  // Легендарка
  {
    id: "bubbleLegendary",
    name: "Легендарный пузырек",
    rarity: "legend",
    path: "cursors/bubbleLegendary",
  },
  { id: "denji", name: "Дензи", rarity: "legend", path: "cursors/denji" },
  { id: "makima", name: "Макима", rarity: "legend", path: "cursors/makima" },
  { id: "mita", name: "Мита", rarity: "legend", path: "cursors/mita" },
  { id: "usa", name: "США", rarity: "legend", path: "cursors/usa" },
];

// Состояние игрока
window.ownedSkins = ["default"]; // ID купленных скинов
window.currentSkin = "default"; // Текущий ID
window.isSpinning = false; // Блокировка кнопки во время прокрутки

window.VILLAGER_NAMES = [
  "Боб",
  "Стив",
  "Алекс",
  "Урист",
  "Гимли",
  "Леголас",
  "Гндальф",
  "Фродо",
  "Бильбо",
  "Торин",
  "Артур",
  "Мерлин",
  "Робин",
  "Зельда",
  "Линк",
  "Марио",
  "Луиджи",
  "Пич",
  "Боузер",
  "Соник",
  "Геральт",
  "Йен",
  "Трисс",
  "Цири",
  "Лютик",
  "Кратос",
  "Атрей",
  "Джоэл",
  "Элли",
  "Натан",
  "Пиксель",
  "Воксель",
  "Глитч",
  "Спрайт",
  "Код",
];

window.getRandomName = function () {
  return window.VILLAGER_NAMES[
    Math.floor(Math.random() * window.VILLAGER_NAMES.length)
  ];
};
