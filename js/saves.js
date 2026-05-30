const SAVE_KEY = "pixel_civ_autosave";

// --- СОХРАНЕНИЕ ---
window.saveGame = function () {
  if (!window.gameScene) return;

  // 1. Сбор данных
  let villagersData = villagers.map((v) => ({
    x: v.x,
    y: v.y,
    energy: v.energy,
    // НОВОЕ: Сохраняем объект статистики
    dataStats: v.dataStats,
  }));

  let buildingsData = [];
  buildingsGroup.children.each((b) => {
    let type = "house";
    if (b.texture.key.includes("garden")) type = "garden";
    if (b.texture.key.includes("park")) type = "park";
    buildingsData.push({ x: b.x, y: b.y, type: type });
  });

  let natureData = [];
  natureGroup.children.each((obj) => {
    if (obj.active) {
      natureData.push({
        x: obj.x,
        y: obj.y,
        key: obj.texture.key,
        scale: obj.scaleX,
      });
    }
  });

  let gameState = {
    timestamp: Date.now(),
    seed: { x: window.SEED_X, y: window.SEED_Y },
    stats: gameStats,
    resources: resources,
    level: level,
    currentXP: currentXP,
    xpToNextLevel: xpToNextLevel,
    currentEra: currentEra,
    occupiedGrid: occupiedGrid,
    villagers: villagersData,
    buildings: buildingsData,
    nature: natureData,
    skins: {
      owned: window.ownedSkins,
      current: window.currentSkin,
    },
  };

  // 2. Запись и Уведомление
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));

    // === КОД УВЕДОМЛЕНИЯ ===
    let notif = document.getElementById("save-notification");
    if (notif) {
      // Показываем (меняем прозрачность на 1)
      notif.style.opacity = 1;

      // Если таймер уже был запущен (быстро сохранили 2 раза), сбрасываем его
      if (window.saveNotifTimeout) clearTimeout(window.saveNotifTimeout);

      // Через 2 секунды скрываем
      window.saveNotifTimeout = setTimeout(() => {
        notif.style.opacity = 0;
      }, 2000);
    }
    // ========================================
  } catch (e) {
    console.error("Save failed:", e);
  }
};

// --- ЗАГРУЗКА ---
window.loadGame = function (scene) {
  let dataStr = localStorage.getItem(SAVE_KEY);
  if (!dataStr) return false;

  let data = JSON.parse(dataStr);

  // 1. Восстанавливаем переменные
  resources = data.resources;
  if (data.stats) {
    gameStats = data.stats;
  } else {
    gameStats = {
      treesCut: 0,
      stonesMined: 0,
      daysPassed: 0,
      tasksCompleted: 0,
      totalRes: { gold: 0, wood: 0, stone: 0, metal: 0 },
    };
  }
  level = data.level;
  currentXP = data.currentXP;
  xpToNextLevel = data.xpToNextLevel;
  currentEra = data.currentEra;
  occupiedGrid = data.occupiedGrid;

  if (data.skins) {
    // Восстанавливаем купленные скины (или даем стандартный, если пусто)
    window.ownedSkins = data.skins.owned || ["default"];
    window.currentSkin = data.skins.current || "default";

    // Применяем скин сразу же
    // (Проверка нужна, так как ui.js мог еще не проинициализироваться, если порядок скриптов нарушен)
    if (typeof window.applyCursorStyle === "function") {
      window.applyCursorStyle(window.currentSkin);
    }
  }

  // Восстанавливаем СИД
  if (data.seed) {
    window.SEED_X = data.seed.x;
    window.SEED_Y = data.seed.y;
  }
  window.createPixelatedBiomes(scene);

  // 2. Очистка
  if (villagers) {
    villagers.forEach((v) => {
      if (v.leftHand) v.leftHand.destroy();
      if (v.rightHand) v.rightHand.destroy();
      if (v.tool) v.tool.destroy();
      v.destroy();
    });
  }
  villagers = [];
  buildingsGroup.clear(true, true);
  natureGroup.clear(true, true);
  decorationsGroup.clear(true, true);
  lightSources = [];

  // 3. Здания
  if (data.buildings) {
    data.buildings.forEach((b) => {
      let gx = Math.round((b.x - worldWidth / 2) / 64);
      let gy = Math.round((b.y - worldHeight / 2) / 64);
      buildRealBuilding(scene, gx, gy, b.type);
    });
  }

  // 4. Природа
  if (data.nature) {
    data.nature.forEach((n) => {
      let obj = natureGroup.create(n.x, n.y, n.key);
      obj.setDepth(n.y);
      obj.setScale(n.scale);
      if (n.key.includes("tree")) {
        if (n.key === "tree_palm") {
          obj.body.setSize(10, 10);
          obj.body.setOffset(27, 70);
        } else {
          obj.body.setSize(16, 10);
          obj.body.setOffset(24, 68);
        }
      } else if (n.key.includes("rock")) {
        if (n.key.includes("small")) {
          obj.body.setSize(14, 8);
          obj.body.setOffset(2, 6);
        } else {
          obj.body.setSize(24, 12);
          obj.body.setOffset(4, 10);
        }
      }
      scene.physics.add.existing(obj, true);
    });
  }

  // 5. Жители
  if (data.villagers) {
    data.villagers.forEach((vData) => {
      spawnVillager(scene, vData.x, vData.y);
      let newV = villagers[villagers.length - 1];
      if (newV) {
        newV.energy = vData.energy;

        // ЗАГРУЗКА СТАТИСТИКИ + ПАТЧ ДЛЯ СТАРЫХ СЕЙВОВ
        if (vData.dataStats) {
          newV.dataStats = vData.dataStats;

          // Если в сохранении нет металла - добавляем его
          if (typeof newV.dataStats.metalGathered === "undefined") {
            newV.dataStats.metalGathered = 0;
          }
        }
      }
    });
  }

  createMonumentOnLoad(scene);

  // 2. Потом обновляем его визуал
  refreshEraVisuals();

  // 3. Потом обновляем интерфейс
  updateUI();

  return true;
};

function createMonumentOnLoad(scene) {
  let mx = worldWidth / 2,
    my = worldHeight / 2;
  if (centralMonument) centralMonument.destroy();

  if (currentEra === 1) {
    centralMonument = scene.physics.add.sprite(mx, my, "bonfire_f0");
    centralMonument.play("bonfire_anim");
    centralMonument.body.setSize(36, 20);
    centralMonument.body.setOffset(6, 24);
  } else if (currentEra === 4) {
    centralMonument = scene.physics.add.sprite(mx, my, "fountain_f0");
    centralMonument.play("fountain_anim");
    centralMonument.body.setSize(40, 16);
    centralMonument.body.setOffset(4, 32);
  } else if (currentEra === 5) {
    centralMonument = scene.physics.add.sprite(mx, my, "holo_f0");
    centralMonument.play("holo_anim");
    centralMonument.body.setSize(32, 16);
    centralMonument.body.setOffset(8, 32);
  } else {
    centralMonument = scene.physics.add.staticSprite(
      mx,
      my,
      "monument_era" + currentEra
    );
    if (currentEra === 3) {
      centralMonument.body.setSize(32, 16);
      centralMonument.body.setOffset(8, 32);
    } else {
      centralMonument.body.setSize(32, 20);
      centralMonument.body.setOffset(8, 24);
    }
  }
  centralMonument.setDepth(centralMonument.y + 16);
  if (
    centralMonument.body &&
    typeof centralMonument.body.setImmovable === "function"
  ) {
    centralMonument.body.setImmovable(true);
  }
  lightSources.push({
    target: centralMonument,
    intensity: 1.5,
    isMobile: false,
  });
  scene.physics.add.collider(villagers, centralMonument);
}

window.resetGame = function () {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
};

window.hasSave = function () {
  return localStorage.getItem(SAVE_KEY) !== null;
};
