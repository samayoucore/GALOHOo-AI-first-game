// js/ui.js

// Глобальная функция выбора здания
window.selectBuilding = selectBuilding;

// --- СМЕНА ЭРЫ ---
window.tryAdvanceEra = function () {
  if (currentEra >= 5) return;
  const req = NEXT_ERA_REQUIREMENTS[currentEra - 1];

  if (level < req.lvl) {
    alert(`Нужен уровень ${req.lvl}!`);
    return;
  }

  if (resources.gold >= req.gold) {
    resources.gold -= req.gold;
    currentEra++;

    refreshEraVisuals();
    updateUI();
    showFloatingText(
      "NEW ERA UNLOCKED!",
      worldWidth / 2,
      worldHeight / 2,
      "#ffff00",
      40
    );

    // Спавн жителей
    let newCount = Math.floor(Math.random() * 10) + 1;
    setTimeout(() => {
      showFloatingText(
        `+${newCount} поселенцев!`,
        worldWidth / 2,
        worldHeight / 2 + 50,
        "#00ff00"
      );
    }, 500);

    for (let i = 0; i < newCount; i++) {
      setTimeout(() => {
        if (window.spawnVillagerFromMonument && window.gameScene) {
          window.spawnVillagerFromMonument(window.gameScene);
        }
      }, 300 + i * 400);
    }
  } else {
    alert(`Нужно ${req.gold} золота!`);
  }
};

// --- ЗАДАЧИ (КВЕСТЫ) ---
// --- ЗАДАЧИ (КВЕСТЫ) ---
window.addTask = function () {
  const input = document.getElementById("task-input");
  const diffSelect = document.getElementById("task-difficulty");
  const timerInput = document.getElementById("task-timer");

  const text = input.value.trim(); // Убираем пробелы по краям
  if (!text) return;

  // === ЧИТ-КОД ПРОВЕРКА ===
  if (text === "godMode") {
    let panel = document.querySelector(".cheat-panel");

    // Переключаем видимость
    if (panel.style.display === "none") {
      panel.style.display = "flex";
      showFloatingText(
        "GOD MODE ACTIVATED",
        worldWidth / 2,
        worldHeight / 2,
        "#ff0000"
      );
    } else {
      panel.style.display = "none";
      showFloatingText(
        "GOD MODE DEACTIVATED",
        worldWidth / 2,
        worldHeight / 2,
        "#ffffff"
      );
    }

    // Очищаем поле и выходим, чтобы не создавать задачу
    input.value = "";
    return;
  }
  // ========================

  const diff = parseFloat(diffSelect.value);
  const timer = parseInt(timerInput.value) || 0;
  const list = document.getElementById("task-list");
  const li = document.createElement("li");

  let timerHtml = timer > 0 ? `<span class="timer-tag">⏱ ${timer}м</span>` : "";
  let diffText = diff === 1 ? "" : diff === 1.5 ? "⭐" : "⭐⭐";

  li.innerHTML = `<div class="task-info"><span>${text} ${diffText}</span>${timerHtml}</div><button class="complete-btn" onclick="completeTask(this, ${diff}, ${
    timer > 0
  })">✔</button>`;
  list.appendChild(li);

  input.value = "";
  timerInput.value = "";
};

window.completeTask = function (btn, multiplier, hasTimer) {
  btn.parentElement.remove();
  let baseReward = 50 + level * 5;
  let finalGold = Math.floor(baseReward * multiplier * (hasTimer ? 1.5 : 1));
  let finalXP = Math.floor(40 * multiplier);

  resources.gold += finalGold;

  // Статистика
  if (window.gameStats) {
    gameStats.totalRes.gold += finalGold;
    gameStats.tasksCompleted++;
  }

  // Добавляем опыт
  currentXP += finalXP;

  // Ресурсы
  let resAmount = Math.floor(20 * multiplier);
  let wood = 0,
    stone = 0,
    metal = 0;
  if (currentEra === 1) {
    wood = resAmount;
  } else if (currentEra === 2) {
    wood = resAmount * 0.6;
    stone = resAmount * 0.4;
  } else {
    wood = resAmount * 0.3;
    stone = resAmount * 0.4;
    metal = resAmount * 0.3;
  }

  wood = Math.floor(wood);
  stone = Math.floor(stone);
  metal = Math.floor(metal);
  resources.wood += wood;
  resources.stone += stone;
  resources.metal += metal;

  // Статистика ресурсов
  if (window.gameStats) {
    gameStats.totalRes.wood += wood;
    gameStats.totalRes.stone += stone;
    gameStats.totalRes.metal += metal;
  }

  // === ИСПРАВЛЕНИЕ: ЛОГИКА LEVEL UP ===
  // Используем while, чтобы можно было апнуть сразу 2 уровня, если много опыта
  while (currentXP >= xpToNextLevel) {
    currentXP -= xpToNextLevel; // Вычитаем потраченный опыт
    level++; // Повышаем уровень

    // Увеличиваем требование для следующего уровня на 20%
    xpToNextLevel = Math.floor(xpToNextLevel * 1.2);

    // Награда: Новый житель
    if (window.gameScene) {
      window.spawnVillagerFromMonument(window.gameScene);
    }

    showFloatingText(
      `LEVEL UP! (${level})`,
      worldWidth / 2,
      worldHeight / 2,
      "#ff00ff"
    );
  }
  // ====================================

  updateUI();

  let msg = `+${finalGold}g`;
  if (wood) msg += ` +${wood}🌲`;
  if (stone) msg += ` +${stone}🪨`;
  showFloatingText(msg, null, null, "#ffff00");
};

// --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
function updateUI() {
  let limit = getCurrentLimit();

  document.getElementById("gold-display").innerText = resources.gold;

  const setResText = (id, val) => {
    let el = document.getElementById(id);
    if (el) {
      el.innerText = `${val} / ${limit}`;
      if (val >= limit) el.style.color = "#ff5555";
      else el.style.color = "white";
    }
  };

  setResText("wood-display", resources.wood);
  setResText("stone-display", resources.stone);
  setResText("metal-display", resources.metal);

  document.getElementById("level-display").innerText = level;
  document.getElementById(
    "xp-text"
  ).innerText = `${currentXP} / ${xpToNextLevel}`;
  document.getElementById("xp-bar-fill").style.width =
    Math.min(100, (currentXP / xpToNextLevel) * 100) + "%";

  let eraNames = ["Племя", "Деревня", "Город", "Замок", "Мегаполис"];
  document.getElementById("era-name").innerText = eraNames[currentEra - 1];

  if (currentEra < 5) {
    let req = NEXT_ERA_REQUIREMENTS[currentEra - 1];
    let btnText = `${req.gold} зол. (ЛВЛ ${req.lvl})`;
    document.getElementById("era-cost").innerText = btnText;
    if (level < req.lvl)
      document.getElementById("era-cost").style.color = "#ff4444";
    else document.getElementById("era-cost").style.color = "inherit";
  } else {
    document.getElementById("era-cost").innerText = "МАКС";
  }

  // УДАЛЕНО: Обновление цен для кнопок в магазине (cost-house больше нет в магазине)
  // Обновляем статистику, если окно открыто
  if (window.updateStatsUI) window.updateStatsUI();
}

// --- ЛОГИКА ОКНА СТАТИСТИКИ (ИСПРАВЛЕНО) ---

// Открытие/Закрытие
window.toggleStatsPanel = function () {
  // Ищем по ID stats-overlay (как в новом HTML)
  let overlay = document.getElementById("stats-overlay");
  if (!overlay) return; // Защита от ошибки

  let isClosed = overlay.style.display === "none";

  if (isClosed) {
    overlay.style.display = "flex"; // flex для центрирования
    window.updateStatsUI(); // Обновляем цифры при открытии
  } else {
    overlay.style.display = "none";
  }
};

// Закрытие по клику вне окна (по темному фону)
window.closeStatsOutside = function (event) {
  if (event.target.id === "stats-overlay") {
    window.toggleStatsPanel();
  }
};

// Функция обновления данных в окне
window.updateStatsUI = function () {
  // Если элемента нет (еще не загрузился), выходим
  if (!document.getElementById("stat-days")) return;
  if (!window.gameStats) return;

  let stats = window.gameStats;

  document.getElementById("stat-days").innerText = stats.daysPassed;
  document.getElementById("stat-pop").innerText = window.villagers
    ? window.villagers.length
    : 0;
  document.getElementById("stat-tasks").innerText = stats.tasksCompleted;

  document.getElementById("stat-trees").innerText = stats.treesCut;
  document.getElementById("stat-stones").innerText = stats.stonesMined;

  document.getElementById("stat-total-gold").innerText = stats.totalRes.gold;
  document.getElementById("stat-total-wood").innerText = stats.totalRes.wood;
  document.getElementById("stat-total-stone").innerText = stats.totalRes.stone;
  document.getElementById("stat-total-metal").innerText = stats.totalRes.metal;
};

// Закрытие по ESC
// --- ГЛОБАЛЬНОЕ ЗАКРЫТИЕ ПО ESC ---
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    // 1. Если открыто окно ЖИТЕЛЯ - закрываем
    let vPanel = document.getElementById("villager-overlay");
    if (vPanel && vPanel.style.display === "flex") {
      window.closeVillagerPanel();
      return; // Выходим, чтобы не закрыть остальные окна одновременно
    }

    // 2. Если открыто окно СКИНОВ - закрываем (если не крутится рулетка)
    let sPanel = document.getElementById("skin-overlay");
    if (sPanel && sPanel.style.display === "flex") {
      if (!window.isSpinning) {
        window.toggleSkinPanel();
      }
      return;
    }

    // 3. Если открыта ОБЩАЯ СТАТИСТИКА - закрываем
    let statsPanel = document.getElementById("stats-overlay");
    if (statsPanel && statsPanel.style.display !== "none") {
      window.toggleStatsPanel();
    }
  }
});

// --- ХЕЛПЕР ТЕКСТА ---
function showFloatingText(msg, x, y, color) {
  if (!x) {
    x = worldWidth / 2;
    y = worldHeight / 2;
  }
  const txt = window.gameScene.add
    .text(x, y, msg, {
      fontFamily: '"Press Start 2P"',
      fontSize: "12px",
      color: color,
      stroke: "#000",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  window.gameScene.tweens.add({
    targets: txt,
    y: y - 80,
    alpha: 0,
    duration: 2000,
    onComplete: () => txt.destroy(),
  });
}

// --- ЧИТЫ ---
window.cheatResources = function () {
  resources.gold = 999999;
  resources.wood = 999999;
  resources.stone = 999999;
  resources.metal = 999999;
  showFloatingText("RICH!", worldWidth / 2, worldHeight / 2, "#00ff00");
  updateUI();
};

window.cheatLevel = function () {
  level = 100;
  currentXP = 0;
  xpToNextLevel = 999999;
  showFloatingText("MAX LEVEL!", worldWidth / 2, worldHeight / 2, "#00ff00");
  updateUI();
};

// --- ЗАПРОСЫ ЖИТЕЛЕЙ ---
window.startVillagerAI = function () {
  if (window.villagerAIInterval) clearInterval(window.villagerAIInterval);

  window.villagerAIInterval = setInterval(() => {
    // Жители просят ТОЛЬКО дома ('house')
    let hCost = getCostByType("house");
    let canAfford = true;
    for (let key in hCost) {
      if (resources[key] < hCost[key] * 1.5) canAfford = false;
    }

    if (canAfford && buildingRequests.length < 5) {
      // Шанс запроса 30% в минуту
      if (Math.random() < 0.3) addBuildingRequest("house");
    }
  }, 60000);
};

function addBuildingRequest(type) {
  let id = Date.now() + Math.random();
  let name = type === "house" ? "Жилой дом" : "Здание";
  buildingRequests.push({
    id: id,
    type: type,
    text: `Мы хотим построить ${name}. Разрешите?`,
  });
  updateNotifUI();
  let badge = document.getElementById("notif-badge");
  if (badge) {
    badge.style.transform = "scale(1.5)";
    setTimeout(() => (badge.style.transform = "scale(1)"), 200);
  }
}

window.toggleNotifPanel = function () {
  let p = document.getElementById("notif-panel");
  if (p) {
    p.style.display = p.style.display === "none" ? "block" : "none";
    updateNotifUI();
  }
};

function updateNotifUI() {
  let list = document.getElementById("notif-list");
  let empty = document.getElementById("notif-empty");
  let badge = document.getElementById("notif-badge");

  if (buildingRequests.length > 0) {
    badge.innerText = buildingRequests.length;
    badge.style.display = "flex";
    empty.style.display = "none";
  } else {
    badge.style.display = "none";
    empty.style.display = "block";
  }

  list.innerHTML = "";
  buildingRequests.forEach((req) => {
    let cost = getCostByType(req.type);
    let costStr = "";
    if (cost.wood) costStr += `${cost.wood}🌲 `;
    if (cost.stone) costStr += `${cost.stone}🪨 `;

    let li = document.createElement("li");
    li.className = "notif-item";
    li.innerHTML = `<span>${req.text}</span><span style="color:#aaa; font-size:7px;">Стоимость: ${costStr}</span><div class="notif-actions"><button class="btn-reject" onclick="rejectRequest(${req.id})">Нет</button><button class="btn-accept" onclick="acceptRequest(${req.id})">Да</button></div>`;
    list.appendChild(li);
  });
}

window.acceptRequest = function (id) {
  let reqIndex = buildingRequests.findIndex((r) => r.id === id);
  if (reqIndex === -1) return;
  let req = buildingRequests[reqIndex];
  let cost = getCostByType(req.type);
  for (let res in cost) {
    if (resources[res] < cost[res]) {
      alert("Ресурсы потрачены!");
      buildingRequests.splice(reqIndex, 1);
      updateNotifUI();
      return;
    }
  }
  let spot = findRandomBuildSpot();
  if (!spot) {
    alert("Нет места!");
    return;
  }

  for (let res in cost) resources[res] -= cost[res];
  buildRealBuilding(window.gameScene, spot.x, spot.y, req.type);
  occupiedGrid.push({ x: spot.x, y: spot.y });
  let worldPos = getWorldFromGrid(spot.x, spot.y);
  showFloatingText("Стройка!", worldPos.x, worldPos.y, "#00ff00");

  buildingRequests.splice(reqIndex, 1);
  updateUI();
  updateNotifUI();
};

window.rejectRequest = function (id) {
  buildingRequests = buildingRequests.filter((r) => r.id !== id);
  updateNotifUI();
};

window.toggleSkinPanel = function () {
  // НОВОЕ: Если крутится рулетка, запрещаем закрывать/открывать
  if (window.isSpinning) return;

  let el = document.getElementById("skin-overlay");
  if (!el) return;
  if (el.style.display === "none") {
    el.style.display = "flex";
    switchSkinTab("inventory");
  } else {
    el.style.display = "none";
  }
};

window.closeSkinsOutside = function (e) {
  // НОВОЕ: Блокировка клика по фону
  if (window.isSpinning) return;

  if (e.target.id === "skin-overlay") window.toggleSkinPanel();
};

window.switchSkinTab = function (tabName) {
  if (window.isSpinning) return;

  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".skin-content")
    .forEach((c) => (c.style.display = "none"));

  // Находим заголовок
  let title = document.getElementById("skin-panel-title");

  if (tabName === "inventory") {
    document.getElementById("tab-inventory").style.display = "flex"; // Важно: flex для нашей верстки
    document.querySelector(".tab-btn:nth-child(2)").classList.add("active"); // nth-child(2) потому что 1 это заголовок меню

    if (title) title.innerText = "ИНВЕНТАРЬ"; // <--- МЕНЯЕМ ЗАГОЛОВОК

    renderInventory();
  } else {
    document.getElementById("tab-cases").style.display = "flex";
    document.querySelector(".tab-btn:nth-child(3)").classList.add("active");

    if (title) title.innerText = "КЕЙСЫ"; // <--- МЕНЯЕМ ЗАГОЛОВОК

    if (!window.isSpinning) {
      renderRouletteVisuals(null, true);
    }
  }
};

function renderRouletteVisuals(winnerSkin, isDummy = false) {
  let strip = document.getElementById("roulette-strip");
  strip.innerHTML = "";
  strip.style.transition = "none";

  let cardsCount = 60; // Длинная лента
  let winIndex = 45; // Индекс победителя

  // Если это просто декорация
  if (isDummy) {
    strip.style.transform = `translateX(-200px)`;
    winIndex = -1;
  } else {
    strip.style.transform = `translateX(0px)`;
  }

  for (let i = 0; i < cardsCount; i++) {
    let skin;

    if (i === winIndex && winnerSkin) {
      // Сюда ставим настоящего победителя
      skin = winnerSkin;
    } else {
      // Сюда ставим визуальный "шум" (чтобы мелькали леги)
      skin = getRandomVisualSkin();
    }

    let el = document.createElement("div");
    el.className = `case-card rarity-${skin.rarity}`;

    // Вставляем КАРТИНКУ вместо текста
    el.innerHTML = `<img src="${skin.path}/${skin.id}-cursor.webp" alt="${skin.name}">`;

    strip.appendChild(el);
  }

  return winIndex; // Возвращаем индекс, чтобы spinCase знал, куда крутить
}

function getRandomVisualSkin() {
  let pool = CURSOR_DB.filter((c) => c.id !== "default");
  // Если база пустая или сломана, вернем дефолт, чтобы не упало
  if (pool.length === 0) return CURSOR_DB[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- ИНВЕНТАРЬ ---
function renderInventory() {
  let grid = document.getElementById("skin-grid");
  grid.innerHTML = "";

  // Сортируем: сначала экипированный, потом по редкости
  let list = ownedSkins
    .map((id) => CURSOR_DB.find((c) => c.id === id))
    .filter((x) => x);

  list.forEach((skin) => {
    let el = document.createElement("div");
    // Добавляем класс редкости (rarity-common, rarity-legend и т.д.)
    el.className = `skin-card rarity-${skin.rarity}`;

    if (skin.id === currentSkin) el.classList.add("equipped");

    // УБРАЛИ <div> с текстом редкости
    // Оставили только Картинку и Название
    el.innerHTML = `
            <img src="${skin.path}/${skin.id}-cursor.webp" alt="cur" onerror="this.style.display='none'">
            <div class="skin-name">${skin.name}</div>
        `;

    el.onclick = () => equipSkin(skin.id);
    grid.appendChild(el);
  });
}
window.equipSkin = function (id) {
  currentSkin = id;
  applyCursorStyle(id);
  renderInventory();
  saveGame(); // Сохраняем выбор
};

// Функция применения стилей CSS
function applyCursorStyle(id) {
  let skin = CURSOR_DB.find((c) => c.id === id);
  if (!skin) return;

  let styleId = "dynamic-cursor-style";
  let oldStyle = document.getElementById(styleId);
  if (oldStyle) oldStyle.remove();

  // ВАЖНО: Теперь мы используем ${skin.id} в названии файла!
  // Если id="gold", путь будет: cursors/gold/gold-cursor.webp
  let css = `
        body, canvas { 
            cursor: url('${skin.path}/${skin.id}-cursor.webp') 0 0, auto; 
        }
        
        button, input, select, .pointer, .shop-btn, .notif-btn, 
        .cheat-btn, .add-btn, .complete-btn, .stats-btn, 
        .close-icon-btn, .skin-menu-btn, .skin-card {
            cursor: url('${skin.path}/${skin.id}-cursor-click.webp') 0 0, pointer !important;
        }
        
        body:active, canvas:active {
             cursor: url('${skin.path}/${skin.id}-cursor-click.webp') 0 0, auto;
        }
    `;

  let style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = css;
  document.head.appendChild(style);

  // Обновляем текст в инвентаре, если панель открыта
  let previewText = document.getElementById("skin-preview-text");
  if (previewText) previewText.innerText = `Текущий: ${skin.name}`;
}

// Функция анимации увеличения центральной карточки
function animateRouletteScale() {
  if (!window.isSpinning) return;

  let strip = document.getElementById("roulette-strip");
  if (!strip) return;

  // 1. Узнаем текущее смещение ленты (translateX)
  // getComputedStyle возвращает матрицу: matrix(1, 0, 0, 1, -1250, 0)
  // Нам нужно 5-е число (-1250)
  let style = window.getComputedStyle(strip);
  let matrix = new WebKitCSSMatrix(style.transform);
  let currentX = matrix.m41; // Текущий X

  // 2. Параметры (должны совпадать с теми, что в spinCase)
  const CARD_WIDTH = 90; // 80 ширина + 10 отступы
  const CONTAINER_CENTER = 175; // Центр окна рулетки (350 / 2)
  const CARD_CENTER_OFFSET = 45; // Половина карточки

  // 3. Вычисляем, какая карточка сейчас ближе всего к центру
  // Формула обратная той, что в spinCase
  // CenterX = currentX + (Index * CARD_WIDTH) + CARD_CENTER_OFFSET
  // Мы ищем Index, при котором CenterX максимально близко к CONTAINER_CENTER

  // Смещение ленты отрицательное, поэтому инвертируем знак
  let estimatedIndex = Math.round(
    (-currentX + CONTAINER_CENTER - CARD_CENTER_OFFSET) / CARD_WIDTH
  );

  // 4. Проходимся по карточкам и меняем стиль
  let cards = strip.children;

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];

    // Если это "та самая" карточка (плюс-минус, для надежности)
    if (i === estimatedIndex) {
      // Увеличиваем!
      card.style.transform = "scale(1.15)";
      card.classList.add("active-center"); // Добавляем подсветку (см CSS)
    } else {
      // Возвращаем в норму
      card.style.transform = "scale(0.9)"; // Чуть уменьшаем неактивные для контраста
      card.classList.remove("active-center");
    }
  }

  // Зацикливаем анимацию, пока идет вращение
  requestAnimationFrame(animateRouletteScale);
}

// --- РУЛЕТКА (КЕЙСЫ) ---
window.spinCase = function () {
  if (isSpinning) return;
  if (resources.gold < 500) {
    showFloatingText(
      "Не хватает 500g!",
      worldWidth / 2,
      worldHeight / 2,
      "#ff0000"
    );
    return;
  }

  resources.gold -= 500;
  updateUI();

  isSpinning = true;
  animateRouletteScale();
  let btn = document.getElementById("spin-btn");
  btn.disabled = true;
  btn.innerText = "КРУТИМ...";

  // 1. Определяем победителя (Честная математика)
  let winner = getRandomSkinByRarity();
  window.pendingReward = winner;

  // 2. Рисуем ленту с победителем
  let winIndex = renderRouletteVisuals(winner, false);

  // 3. МАТЕМАТИКА КООРДИНАТ (БАГ 1 ФИКС)
  // Ширина карточки: 80px + 10px (margins) = 90px
  const CARD_WIDTH = 90;
  // Центр контейнера (350px / 2) = 175px
  const CONTAINER_CENTER = 175;
  // Центр самой карточки (90px / 2) = 45px
  const CARD_CENTER = 45;

  // Смещение, чтобы центр карточки совпал с центром контейнера:
  // offset = 175 - 45 = 130px

  // Формула: (Индекс * Ширина) - (Смещение центровки)
  let basePosition = winIndex * CARD_WIDTH - (CONTAINER_CENTER - CARD_CENTER);

  // Добавляем случайный сдвиг внутри карточки (±35px), чтобы стрелка не всегда указывала ровно в центр
  // Это добавляет реализма ("чуть-чуть не докрутилось")
  let randomOffset = Math.floor(Math.random() * 70) - 35;

  let targetX = -(basePosition + randomOffset);

  // 4. Запуск анимации
  let strip = document.getElementById("roulette-strip");

  // Даем браузеру отрисовать начальное положение (0px), затем запускаем анимацию
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      strip.style.transition = "transform 8s cubic-bezier(0.1, 1.0, 0.1, 1.0)"; // Супер плавное торможение
      strip.style.transform = `translateX(${targetX}px)`;
    });
  });

  // 5. Завершение
  setTimeout(() => {
    isSpinning = false;
    btn.disabled = false;
    btn.innerText = "КРУТИТЬ";
    showRewardPopup(winner);
  }, 8500); // 8s анимация + 0.5s запас
};

function getRandomSkinByRarity() {
  // 1. Исключаем стандартный (чтобы не падал)
  let dropPool = CURSOR_DB.filter((c) => c.id !== "default");

  let rand = Math.random();
  let rarity = "common";

  // === НОВЫЕ ШАНСЫ ===
  if (rand < 0.02) {
    rarity = "legend"; // 0 - 2%
  } else if (rand < 0.1) {
    rarity = "epic"; // 2 - 10% (Шанс 8%)
  } else if (rand < 0.35) {
    rarity = "rare"; // 10 - 35% (Шанс 25%)
  } else {
    rarity = "common"; // 35 - 100% (Шанс 65%)
  }

  let pool = dropPool.filter((c) => c.rarity === rarity);

  // Защита: если в базе нет эпиков, берем редкие, если нет редких - обычные
  if (pool.length === 0) pool = dropPool.filter((c) => c.rarity === "rare");
  if (pool.length === 0) pool = dropPool.filter((c) => c.rarity === "common");
  if (pool.length === 0) pool = dropPool; // Совсем запасной вариант

  return pool[Math.floor(Math.random() * pool.length)];
}

// --- НАГРАДА ---
// --- НАГРАДА ---
function showRewardPopup(skin) {
  // === ТРИГГЕР СЕКРЕТНОГО ИВЕНТА ===
  if (skin.id === "usa") {
    if (window.triggerUSAEvent) window.triggerUSAEvent();
  }
  // =================================
  let popup = document.getElementById("reward-popup");
  popup.style.display = "flex";

  // 1. Название и редкость
  let nameTitle = document.getElementById("reward-name");
  nameTitle.innerText = skin.name;
  nameTitle.className = `reward-name rarity-${skin.rarity}`;

  // 2. Вставляем КАРТИНКУ вместо палитры
  // Используем обычный курсор для отображения
  let iconBox = document.getElementById("reward-icon");
  iconBox.innerHTML = `<img src="${skin.path}/${skin.id}-cursor.webp" alt="${skin.name}">`;

  // 3. Логика кнопок и дубликатов
  let actionBox = document.querySelector(".reward-actions");
  let isNew = !ownedSkins.includes(skin.id);

  if (isNew) {
    // --- НОВЫЙ ПРЕДМЕТ ---
    // Добавляем в инвентарь
    ownedSkins.push(skin.id);
    saveGame();

    // Показываем кнопки выбора
    actionBox.innerHTML = `
            <button class="btn-accept" onclick="closeReward(true)">ЭКИПИРОВАТЬ</button>
            <button class="btn-reject" onclick="closeReward(false)">В ИНВЕНТАРЬ</button>
        `;
  } else {
    // --- ДУБЛИКАТ ---
    // Даем золото
    nameTitle.innerText += " (Дубликат +250g)";
    resources.gold += 250;
    updateUI();

    // Показываем только кнопку ОК
    // closeReward(false) просто закроет окно без экипировки
    actionBox.innerHTML = `
            <button class="btn-reject" onclick="closeReward(false)" style="width: 100px;">ОК</button>
        `;
  }
}

window.closeReward = function (equip) {
  document.getElementById("reward-popup").style.display = "none";
  if (equip && window.pendingReward) {
    equipSkin(window.pendingReward.id);
    switchSkinTab("inventory");
  }
  // Сброс рулетки
  document.getElementById("roulette-strip").style.transition = "none";
  document.getElementById("roulette-strip").style.transform = "translateX(0)";
};

// --- ОКНО ЖИТЕЛЯ ---
// --- ОКНО ЖИТЕЛЯ (С РУКАМИ И МЕТАЛЛОМ) ---
let currentVillager = null;

window.openVillagerPanel = function (villager) {
  if (!villager || !villager.active) return;
  currentVillager = villager;

  let overlay = document.getElementById("villager-overlay");
  overlay.style.display = "flex";

  // 1. Заполняем данные (с защитой от пустых значений)
  document.getElementById("villager-name").innerText = villager.dataStats.name;
  document.getElementById("villager-job").innerText = villager.dataStats.job;

  document.getElementById("v-stat-energy").innerText = Math.floor(
    villager.energy
  );

  // ДОБАВЛЕНО "|| 0" ДЛЯ СТАРЫХ СОХРАНЕНИЙ
  document.getElementById("v-stat-wood").innerText =
    villager.dataStats.woodGathered || 0;
  document.getElementById("v-stat-stone").innerText =
    villager.dataStats.stoneGathered || 0;
  document.getElementById("v-stat-metal").innerText =
    villager.dataStats.metalGathered || 0;

  document.getElementById("v-stat-state").innerText = villager.state;

  // 2. ГЕНЕРАЦИЯ АВАТАРКИ
  let canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  let ctx = canvas.getContext("2d");

  let bodyTex = window.gameScene.textures
    .get(villager.texture.key)
    .getSourceImage();
  let handTex = window.gameScene.textures.get("villager_hand").getSourceImage();

  ctx.drawImage(bodyTex, 0, 0);
  ctx.drawImage(handTex, 2, 9);
  ctx.drawImage(handTex, 10, 9);

  let img = document.createElement("img");
  img.src = canvas.toDataURL();

  let container = document.getElementById("villager-avatar-view");
  container.innerHTML = "";
  container.appendChild(img);
};

// ... (функции закрытия closeVillagerPanel и closeVillagerOutside оставьте без изменений) ...

// ОБНОВЛЕНИЕ В РЕАЛЬНОМ ВРЕМЕНИ (Тоже добавляем защиту)
setInterval(() => {
  let overlay = document.getElementById("villager-overlay");
  if (currentVillager && overlay.style.display === "flex") {
    if (!currentVillager.active) {
      closeVillagerPanel();
      return;
    }

    document.getElementById("v-stat-energy").innerText = Math.floor(
      currentVillager.energy
    );

    // ЗАЩИТА ТУТ ТОЖЕ
    document.getElementById("v-stat-wood").innerText =
      currentVillager.dataStats.woodGathered || 0;
    document.getElementById("v-stat-stone").innerText =
      currentVillager.dataStats.stoneGathered || 0;
    document.getElementById("v-stat-metal").innerText =
      currentVillager.dataStats.metalGathered || 0;

    document.getElementById("v-stat-state").innerText = currentVillager.state;
    document.getElementById("villager-job").innerText =
      currentVillager.dataStats.job;
  }
}, 500);

window.closeVillagerPanel = function () {
  let panel = document.getElementById("villager-overlay");
  if (panel) {
    panel.style.display = "none";
  }
  currentVillager = null; // Сбрасываем выбор
};

window.closeVillagerOutside = function (e) {
  if (e.target.id === "villager-overlay") {
    window.closeVillagerPanel();
  }
};

// ==========================================
// === СИСТЕМА ТОРГОВОГО КОРАБЛЯ ===
// ==========================================

window.spawnTradeShip = function (scene) {
  window.isShipActive = true;

  // Показываем кнопку
  let btn = document.getElementById("ship-alert-btn");
  if (btn) btn.style.display = "flex";

  let startX = -150;
  let targetX = 150;
  let spawnY = Phaser.Math.Between(100, worldHeight - 100);

  let ship = scene.physics.add.sprite(startX, spawnY, "ship_trader");
  ship.setDepth(9000);
  ship.setInteractive({ useHandCursor: true });

  // Покачивание
  scene.tweens.add({
    targets: ship,
    y: spawnY + 10,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // Приплытие
  scene.tweens.add({
    targets: ship,
    x: targetX,
    duration: 5000,
    ease: "Power1",
    onComplete: () => {
      let cam = scene.cameras.main;
      showFloatingText(
        "⛵ ТОРГОВЕЦ ПРИБЫЛ!",
        cam.worldView.centerX,
        cam.worldView.centerY - 100,
        "#4fc3f7"
      );
    },
  });

  ship.on("pointerdown", () => {
    window.openTradePanel(ship);
  });

  window.currentShipSprite = ship;

  // === ТАЙМЕР УБЫТИЯ (ИСПРАВЛЕННЫЙ) ===
  // Сохраняем таймер в свойство корабля, чтобы могли его отменить при сделке
  ship.leaveTimer = scene.time.delayedCall(60000, () => {
    if (!ship || !ship.active) return; // Если уже уничтожен

    // 1. Скрываем кнопку
    let btnCheck = document.getElementById("ship-alert-btn");
    if (btnCheck) btnCheck.style.display = "none";

    // 2. Если открыто окно торговли — закрываем его
    let tradePanel = document.getElementById("trade-overlay");
    if (tradePanel && tradePanel.style.display === "flex") {
      window.closeTradePanel();
      showFloatingText("Торговец уплыл...", ship.x, ship.y - 50, "#ff5252");
    }

    // 3. Уплывает
    scene.tweens.add({
      targets: ship,
      x: -300,
      duration: 5000,
      onComplete: () => {
        ship.destroy();
        window.isShipActive = false;
      },
    });
  });
};

// --- МЕНЮ ТОРГОВЛИ ---

window.openTradePanel = function (shipSprite) {
  let overlay = document.getElementById("trade-overlay");
  overlay.style.display = "flex";

  generateTradeOffer();
};

window.closeTradePanel = function () {
  document.getElementById("trade-overlay").style.display = "none";
};

window.closeTradeOutside = function (e) {
  if (e.target.id === "trade-overlay") window.closeTradePanel();
};

function generateTradeOffer() {
  // Генерируем сделку
  // Тип 1: Продать ресурс за золото (Часто)
  // Тип 2: Купить ресурс за золото (Редко)

  let type = Math.random() < 0.7 ? "sell" : "buy";
  let offer = {};

  if (type === "sell") {
    // Игрок отдает Дерево/Камень -> Получает Золото
    let res = Math.random() < 0.5 ? "wood" : "stone";
    let amount = Phaser.Math.Between(100, 500);
    let price = Math.floor(amount * 0.5); // Курс 2 к 1

    offer = {
      type: "sell",
      giveRes: res,
      giveAmount: amount,
      getRes: "gold",
      getAmount: price,
      text: `Продать <span style="color:#a5d6a7">${amount} ${
        res === "wood" ? "Дерева" : "Камня"
      }</span><br>за <span style="color:#ffd700">${price} Золота</span>`,
    };
  } else {
    // Игрок отдает Золото -> Получает Ресурс (выгодно)
    let res = Math.random() < 0.5 ? "wood" : "stone";
    let amount = Phaser.Math.Between(200, 600);
    let price = Math.floor(amount * 0.2); // Курс: золото очень ценное тут (дешевая покупка)

    offer = {
      type: "buy",
      giveRes: "gold",
      giveAmount: price,
      getRes: res,
      getAmount: amount,
      text: `Купить <span style="color:#a5d6a7">${amount} ${
        res === "wood" ? "Дерева" : "Камня"
      }</span><br>за <span style="color:#ffd700">${price} Золота</span>`,
    };
  }

  window.currentTradeOffer = offer;
  document.getElementById("trade-offer-text").innerHTML = offer.text;
}

window.acceptTrade = function () {
  let offer = window.currentTradeOffer;
  if (!offer) return;

  // Проверка ресурсов
  if (resources[offer.giveRes] >= offer.giveAmount) {
    // Списание и начисление
    resources[offer.giveRes] -= offer.giveAmount;
    let limit = getCurrentLimit();
    if (
      offer.getRes !== "gold" &&
      resources[offer.getRes] + offer.getAmount > limit
    ) {
      resources[offer.getRes] = limit;
    } else {
      resources[offer.getRes] += offer.getAmount;
    }

    updateUI();
    showFloatingText("СДЕЛКА!", worldWidth / 2, worldHeight / 2, "#00ff00");
    closeTradePanel();

    // ЛОГИКА УБЫТИЯ ПОСЛЕ СДЕЛКИ
    if (window.currentShipSprite && window.currentShipSprite.active) {
      let ship = window.currentShipSprite;

      // ВАЖНО: Отменяем таймер автоматического ухода, так как он уплывает сейчас
      if (ship.leaveTimer) {
        ship.leaveTimer.remove();
      }

      // Скрываем кнопку маяк
      let btn = document.getElementById("ship-alert-btn");
      if (btn) btn.style.display = "none";

      // Анимация уплытия
      window.gameScene.tweens.add({
        targets: ship,
        x: -300,
        duration: 4000,
        onComplete: () => {
          ship.destroy();
          window.isShipActive = false;
        },
      });
    }
  } else {
    alert("Недостаточно ресурсов!");
  }
};

// Функция фокуса камеры на корабле
window.focusOnShip = function () {
  if (window.currentShipSprite && window.currentShipSprite.active) {
    let ship = window.currentShipSprite;
    let cam = window.gameScene.cameras.main;

    // Плавный перелет камеры (Pan) за 1 секунду
    cam.pan(ship.x, ship.y, 1000, "Power2");

    // Опционально: небольшой зум, чтобы рассмотреть
    cam.zoomTo(1.2, 1000);
  }
};
