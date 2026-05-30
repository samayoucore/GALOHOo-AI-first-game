const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  backgroundColor: "#0d47a1",
  pixelArt: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);

// --- ФРАЗЫ И ПОДСКАЗКИ ---
const LOADING_MESSAGES = [
  "Генерация пиксельного мира...",
  "Уговариваем жителей работать...",
  "Поливаем деревья...",
  "Раскладываем камни по фэн-шую...",
  "Настраиваем гравитацию...",
  "Ищем потерянный топор...",
  "Загрузка текстур ночи...",
  "Договариваемся с природой...",
  "Считаем пиксели...",
  "Включаем солнце...",
];

const GAME_TIPS = [
  "Жители устают. Если энергии мало, они пойдут спать.",
  "Ночью все жители прячутся в домах.",
  "Камни иногда содержат металл (шанс 50%).",
  "Только не пробуйте WorldBox, он лучше :(",
  "Используйте колесико мыши, чтобы приближать и отдалять камеру.",
  "Кто прочитал, у того будет понос",
  "Если житель застрял, вы можете перетащить его мышкой.",
  "Лучше бы ты работал, а не в игры играл",
  "Стройте дома рядом друг с другом.",
  "Смена эры открывает новые инструменты и здания.",
  "Сосал?",
  "Золото не занимает место на складе.",
];

function preload() {}

function create() {
  window.gameScene = this;

  // Инициализация движка
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);

  // 1. СНАЧАЛА ГЕНЕРИРУЕМ ТЕКСТУРЫ (В том числе explosion_sheet)
  generatePixelTextures(this);

  // 2. ЗАТЕМ СОЗДАЕМ ГЛОБАЛЬНЫЕ АНИМАЦИИ
  createGlobalAnimations(this);

  createPixelatedBiomes(this);
  createWater(this);

  buildingsGroup = this.physics.add.staticGroup();
  natureGroup = this.physics.add.staticGroup();
  decorationsGroup = this.add.group();

  window.pathsLayer = this.add.graphics();
  window.pathsLayer.setDepth(0);

  // Ночь и Погода
  this.nightRT = this.make.renderTexture({ width: 100, height: 100 }, true);
  this.nightRT.setDepth(10000);
  this.lightBrush = this.add.image(0, 0, "light_glow").setVisible(false);

  // Облака
  this.clouds = this.add.group();
  const cloudBounds = { minX: -2000, maxX: 5000, minY: -2000, maxY: 5000 };
  for (let i = 0; i < 50; i++) {
    let x = Phaser.Math.Between(cloudBounds.minX, cloudBounds.maxX);
    let y = Phaser.Math.Between(cloudBounds.minY, cloudBounds.maxY);
    let key = "cloud_" + Phaser.Math.Between(1, 3);
    let cloud = this.add.image(x, y, key);
    let factor = Phaser.Math.FloatBetween(0.05, 0.15);
    cloud.setScrollFactor(factor);
    cloud.setDepth(8000);
    cloud.setAlpha(0);
    cloud.setScale(Phaser.Math.FloatBetween(2.0, 4.0));
    cloud.speedX = Phaser.Math.FloatBetween(0.1, 0.3);
    this.clouds.add(cloud);
  }
  this.cloudBounds = cloudBounds;

  // Дождь (ULTRA WIDE)
  this.rainParticles = this.add.particles("rain_drop");
  let extraPad = 2500;
  let startX = -1000;
  this.rainZone = new Phaser.Geom.Rectangle(
    startX,
    -100,
    this.scale.width + extraPad,
    20
  );

  this.rainEmitter = this.rainParticles.createEmitter({
    emitZone: { type: "random", source: this.rainZone },
    lifespan: 3000,
    speedY: { min: 700, max: 1000 },
    speedX: { min: -100, max: -250 },
    scale: { start: 1, end: 1 },
    quantity: 0,
    blendMode: "ADD",
  });

  this.rainParticles.setScrollFactor(0);
  this.rainParticles.setDepth(9500);

  this.scale.on("resize", (gameSize) => {
    if (this.rainZone) {
      this.rainZone.width = gameSize.width + 2500;
    }
    if (window.isRaining) {
      let density = Math.ceil(gameSize.width / 100);
      this.rainEmitter.setQuantity(density);
    }
  });

  // Эффект стройки
  this.buildParticles = this.add.particles("smoke_puff");
  this.buildEmitter = this.buildParticles.createEmitter({
    lifespan: 800,
    speed: { min: 20, max: 60 },
    scale: { start: 1.5, end: 0 },
    alpha: { start: 0.8, end: 0 },
    rotate: { min: 0, max: 360 },
    gravityY: -20,
    on: false,
  });
  this.buildParticles.setDepth(5000);

  // Таймеры погоды
  this.weatherTimer = 0;
  this.nextWeatherChange = 20000;
  this.isStorm = false;

  // Таймер корабля
  this.time.addEvent({
    delay: 60000,
    loop: true,
    callback: () => {
      if (!window.isShipActive && Math.random() < 0.3) {
        window.spawnTradeShip(this);
      }
    },
  });

  setupInput(this);

  // Кастомный курсор (спрайт скрыт, работает CSS)
  window.gameCursor = this.add.sprite(0, 0, "custom_cursor").setVisible(false);

  startFakeLoading(this);
}

function update(time, delta) {
  updateWater(this, time);

  // === ЦИКЛ ДНЯ И НОЧИ ===
  const cycleDuration = 300000; // 5 минут
  let rawCycle = (time % cycleDuration) / cycleDuration;
  let darkness = 0;

  // Рассчет темноты ночи
  if (rawCycle > 0.58 && rawCycle < 0.62)
    darkness = ((rawCycle - 0.58) / 0.04) * 0.65;
  else if (rawCycle >= 0.62 && rawCycle < 0.96) darkness = 0.65;
  else if (rawCycle >= 0.96)
    darkness = 0.65 - ((rawCycle - 0.96) / 0.04) * 0.65;

  if (typeof this.lastCycle === "undefined") this.lastCycle = 0;
  if (rawCycle < this.lastCycle) {
    gameStats.daysPassed++;
    showFloatingText(
      `ДЕНЬ ${gameStats.daysPassed + 1}`,
      worldWidth / 2,
      worldHeight / 2 - 100,
      "#ffd700"
    );
  }
  this.lastCycle = rawCycle;
  window.isNight = rawCycle > 0.6 && rawCycle < 0.98;

  // === ЛОГИКА ПОГОДЫ ===
  this.weatherTimer += delta;

  // Смена погоды
  if (this.weatherTimer > this.nextWeatherChange) {
    this.weatherTimer = 0;

    if (!window.isRaining) {
      // НАЧАЛО ДОЖДЯ (Шанс 40%)
      if (Math.random() < 0.15) {
        window.isRaining = true;

        // ПЛОТНОСТЬ: Делим на 100 (Оптимизация)
        // Используем this.scale.width для точности
        let density = Math.ceil(this.scale.width / 100);
        this.rainEmitter.setQuantity(density);

        showFloatingText(
          "☔ ДОЖДЬ НАЧАЛСЯ",
          this.cameras.main.worldView.centerX,
          this.cameras.main.worldView.centerY - 150,
          "#4fc3f7"
        );

        this.nextWeatherChange = Phaser.Math.Between(20000, 45000);
      } else {
        // Если дождь не пошел, ждем еще 10-20 секунд до следующей проверки
        this.nextWeatherChange = Phaser.Math.Between(10000, 20000);
      }
    } else {
      // КОНЕЦ ДОЖДЯ
      window.isRaining = false;
      this.isStorm = false;
      this.rainEmitter.setQuantity(0); // Выкл партиклы
      showFloatingText(
        "🌤️ ЯСНО",
        this.cameras.main.worldView.centerX,
        this.cameras.main.worldView.centerY - 150,
        "#ffeb3b"
      );

      this.nextWeatherChange = Phaser.Math.Between(30000, 60000); // Ясно 30-60 сек
    }
  }

  // Эффекты Грозы (Вспышки)
  if (window.isRaining && this.isStorm) {
    // Если пришло время сверкнуть
    if (time > this.nextLightning) {
      // 1. Эффекты
      this.cameras.main.flash(200, 255, 255, 255); // Вспышка 200мс
      this.cameras.main.shake(150, 0.005); // Тряска

      // 2. Звук (если потом добавим)
      // this.sound.play('thunder');

      // 3. Планируем следующую молнию через 2-6 секунд
      // (Чтобы не долбило постоянно, но и не было скучно)
      this.nextLightning = time + Phaser.Math.Between(2000, 6000);
    }
  }

  // Добавляем "Пасмурность" к темноте
  let weatherDarkness = 0;
  if (window.isRaining) weatherDarkness = 0.2; // Дождь = немного темно
  if (this.isStorm) weatherDarkness = 0.4; // Гроза = сильно темно

  // Итоговая темнота (не может быть больше 0.9, иначе ничего не видно)
  let totalDarkness = Math.min(0.9, darkness + weatherDarkness);

  // === РЕНДЕР ТЕМНОТЫ (ОБНОВЛЕННЫЙ) ===
  if (this.nightRT) {
    this.nightRT.clear();
    // Рисуем, если есть хоть какая-то темнота (ночь ИЛИ дождь)
    if (totalDarkness > 0.05) {
      let cam = this.cameras.main;
      let pad = 1000; // Запас, чтобы не видеть края при тряске
      let x = cam.worldView.x - pad;
      let y = cam.worldView.y - pad;
      let w = cam.worldView.width + pad * 2;
      let h = cam.worldView.height + pad * 2;

      this.nightRT.setPosition(x, y);
      this.nightRT.resize(w, h);

      // Цвет темноты: Ночью синий, Днем в дождь - серый
      let tint = darkness > 0.1 ? 0x000010 : 0x263238;
      this.nightRT.fill(tint, totalDarkness);

      lightSources = lightSources.filter(
        (src) => src && src.target && src.target.active
      );

      lightSources.forEach((src) => {
        if (!src.target || !src.target.body) return;

        // Оптимизация: не рисуем свет, если он далеко за экраном
        if (
          src.target.x < x ||
          src.target.x > x + w ||
          src.target.y < y ||
          src.target.y > y + h
        )
          return;

        let drawX = src.target.x - x;
        let drawY = src.target.y - y;
        let brushScale = src.intensity;

        // Мерцание света
        let flicker = 1.0 + Math.sin(time * 0.005 + src.target.x) * 0.05;

        this.lightBrush.setScale(brushScale * flicker);
        this.lightBrush.setPosition(drawX, drawY);
        this.nightRT.erase(this.lightBrush);
      });
    }
  }

  // === ЛОГИКА ОБЛАКОВ (FIXED) ===
  if (this.clouds && this.cloudBounds) {
    let zoom = this.cameras.main.zoom;
    let targetAlpha = 0;
    if (zoom < 0.8) {
      targetAlpha = (0.8 - zoom) * 1.5;
      if (targetAlpha > 0.9) targetAlpha = 0.9;
    }
    this.clouds.children.iterate((cloud) => {
      cloud.alpha += (targetAlpha - cloud.alpha) * 0.05;
      cloud.x += cloud.speedX;
      if (cloud.x > this.cloudBounds.maxX) cloud.x = this.cloudBounds.minX;
    });
  }

  if (buildMode && previewSprite) {
    const p = this.input.activePointer;
    const g = getGridFromPointer(p);
    const w = getWorldFromGrid(g.x, g.y);
    previewSprite.setPosition(w.x, w.y);
    previewRect.setPosition(w.x, w.y);
    const v = isValidPlacement(g.x, g.y);
    let size =
      buildMode === "house" && currentEra > 2
        ? 32
        : buildMode === "house"
        ? 48
        : 64;
    previewRect.clear();
    if (v) {
      previewSprite.setTint(0x55ff55);
      previewRect.lineStyle(2, 0x00ff00);
    } else {
      previewSprite.setTint(0xff5555);
      previewRect.lineStyle(2, 0xff0000);
    }
    previewRect.strokeRect(-size / 2, -size / 2, size, size);
  }

  if (villagers) {
    villagers.forEach((v) => {
      if (v.active) {
        moveVillager(v);
        enforceBoundaries(v);
        v.setDepth(v.y);
      }
    });
  }
}

function startFakeLoading(scene) {
  // 1. Сначала выполняем РЕАЛЬНУЮ загрузку мира (на фоне)
  let saveExists = false;
  try {
    if (window.hasSave && window.hasSave()) {
      occupiedGrid = [];
      saveExists = window.loadGame(scene);
    }
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
  }

  // ФИКС БАГА:
  // Добавляем проверку "&& window.villagers.length === 0"
  // Если сохранение не вернуло true (saveExists = false), НО жители в массиве уже есть,
  // значит загрузка прошла частично успешно, и спавнить новых НЕ НАДО.

  if (!saveExists && window.villagers.length === 0) {
    console.log("New Game Init...");
    if (window.regenerateMapSeed) window.regenerateMapSeed();
    if (window.createPixelatedBiomes) window.createPixelatedBiomes(scene);
    populateWorld(scene);

    // Спавним стартовых только если жителей реально 0
    window.spawnVillagerFromMonument(scene);
    window.spawnVillagerFromMonument(scene);

    occupiedGrid = [{ x: 0, y: 0 }];
    occupiedGrid.push({ x: 1, y: 0 });
    buildRealBuilding(scene, 1, 0, "house");
    occupiedGrid.push({ x: -1, y: 0 });
    buildRealBuilding(scene, -1, 0, "house");
    updateUI();
    window.saveGame(); // Сохраняем старт
  }

  // Запуск таймеров игры
  if (window.natureRespawnEvent) window.natureRespawnEvent.remove();
  window.startNatureRespawn(scene);
  if (window.villagerAIInterval) clearInterval(window.villagerAIInterval);
  window.startVillagerAI();
  if (window.autoSaveInterval) clearInterval(window.autoSaveInterval);
  window.autoSaveInterval = setInterval(() => {
    if (window.saveGame) window.saveGame();
  }, 10000);

  // 2. ТЕПЕРЬ ВИЗУАЛЬНАЯ ЧАСТЬ (Анимация загрузки)
  const TOTAL_TIME = 2000; // Уменьшил до 2 сек для тестов (можете вернуть 8000)

  const UPDATE_INTERVAL = 100;
  let elapsedTime = 0;

  const bar = document.getElementById("progress-bar");
  const percentTxt = document.getElementById("loading-percent");
  const msgTxt = document.getElementById("loading-message");
  const hintTxt = document.getElementById("loading-hint");
  const screen = document.getElementById("loading-screen");
  const ui = document.getElementById("ui-layer");

  let messageTimer = 0;
  let hintTimer = 0;

  let loadingInterval = setInterval(() => {
    elapsedTime += UPDATE_INTERVAL;

    let rawProgress = Math.min(100, (elapsedTime / TOTAL_TIME) * 100);
    let step = 4.5;
    let steppedProgress = Math.floor(rawProgress / step) * step;

    if (bar) bar.style.width = steppedProgress + "%";
    if (percentTxt) percentTxt.innerText = Math.floor(rawProgress) + "%";

    // Смена фраз
    if (elapsedTime > messageTimer && msgTxt) {
      let rndMsg =
        LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      msgTxt.innerText = rndMsg;
      messageTimer = elapsedTime + 1500;
    }

    // Подсказки меняем раз в 4 секунды
    if (elapsedTime > hintTimer && hintTxt) {
      let rndHint = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
      hintTxt.innerText = rndHint;
      hintTimer = elapsedTime + 4000;
    }

    // КОНЕЦ
    if (elapsedTime >= TOTAL_TIME) {
      clearInterval(loadingInterval);
      if (bar) bar.style.width = "100%";
      if (percentTxt) percentTxt.innerText = "100%";

      screen.style.opacity = 0;
      screen.style.transition = "opacity 0.5s";

      setTimeout(() => {
        screen.style.display = "none";
        ui.style.display = "block";
        ui.style.opacity = 0;
        ui.style.transition = "opacity 1s";
        setTimeout(() => (ui.style.opacity = 1), 50);
      }, 500);
    }
  }, UPDATE_INTERVAL);
}

function update(time, delta) {
  updateWater(this, time);

  // === ЦИКЛ ДНЯ И НОЧИ ===
  const cycleDuration = 300000; // 5 минут
  let rawCycle = (time % cycleDuration) / cycleDuration;
  let darkness = 0;

  if (rawCycle > 0.58 && rawCycle < 0.62)
    darkness = ((rawCycle - 0.58) / 0.04) * 0.65;
  else if (rawCycle >= 0.62 && rawCycle < 0.96) darkness = 0.65;
  else if (rawCycle >= 0.96)
    darkness = 0.65 - ((rawCycle - 0.96) / 0.04) * 0.65;

  if (typeof this.lastCycle === "undefined") this.lastCycle = 0;
  if (rawCycle < this.lastCycle) {
    gameStats.daysPassed++;
    showFloatingText(
      `ДЕНЬ ${gameStats.daysPassed + 1}`,
      worldWidth / 2,
      worldHeight / 2 - 100,
      "#ffd700"
    );
  }
  this.lastCycle = rawCycle;
  window.isNight = rawCycle > 0.6 && rawCycle < 0.98;

  // === ЛОГИКА ПОГОДЫ (УПРОЩЕННАЯ: ТОЛЬКО ДОЖДЬ) ===
  this.weatherTimer += delta;

  if (this.weatherTimer > this.nextWeatherChange) {
    this.weatherTimer = 0;

    if (!window.isRaining) {
      // ПОПЫТКА ЗАПУСТИТЬ ДОЖДЬ (Шанс 40%)
      if (Math.random() < 0.4) {
        window.isRaining = true;

        // Включаем партиклы
        // Плотность: ширина / 20 (довольно плотный дождь)
        let density = Math.ceil(this.scale.width / 20);
        this.rainEmitter.setQuantity(density);

        showFloatingText(
          "☔ ДОЖДЬ НАЧАЛСЯ",
          this.cameras.main.worldView.centerX,
          this.cameras.main.worldView.centerY - 150,
          "#4fc3f7"
        );

        // Дождь идет от 20 до 45 секунд
        this.nextWeatherChange = Phaser.Math.Between(20000, 45000);
      } else {
        // Дождь не начался, попробуем снова через 10-20 секунд
        this.nextWeatherChange = Phaser.Math.Between(10000, 20000);
      }
    } else {
      // ОСТАНОВКА ДОЖДЯ
      window.isRaining = false;
      this.rainEmitter.setQuantity(0); // Выкл партиклы
      showFloatingText(
        "🌤️ ЯСНО",
        this.cameras.main.worldView.centerX,
        this.cameras.main.worldView.centerY - 150,
        "#ffeb3b"
      );

      // Следующая ясная погода длится 30-60 секунд
      this.nextWeatherChange = Phaser.Math.Between(30000, 60000);
    }
  }

  // === ЗАТЕМНЕНИЕ НЕБА ===
  // Если идет дождь, добавляем немного серости (0.2)
  let weatherDarkness = window.isRaining ? 0.2 : 0;
  let totalDarkness = Math.min(0.9, darkness + weatherDarkness);

  // === РЕНДЕР ТЕМНОТЫ И СВЕТА ===
  if (this.nightRT) {
    this.nightRT.clear();
    // Рисуем слой, если есть хоть какая-то темнота (ночь ИЛИ дождь)
    if (totalDarkness > 0.05) {
      let cam = this.cameras.main;
      let pad = 1000;
      let x = cam.worldView.x - pad;
      let y = cam.worldView.y - pad;
      let w = cam.worldView.width + pad * 2;
      let h = cam.worldView.height + pad * 2;

      this.nightRT.setPosition(x, y);
      this.nightRT.resize(w, h);

      // Цвет: Ночью синий (0x000010), Днем в дождь серый (0x263238)
      let tint = darkness > 0.1 ? 0x000010 : 0x263238;
      this.nightRT.fill(tint, totalDarkness);

      // Вырезаем дырки под свет
      lightSources = lightSources.filter(
        (src) => src && src.target && src.target.active
      );

      lightSources.forEach((src) => {
        if (!src.target || !src.target.body) return;
        if (
          src.target.x < x ||
          src.target.x > x + w ||
          src.target.y < y ||
          src.target.y > y + h
        )
          return;

        let drawX = src.target.x - x;
        let drawY = src.target.y - y;
        let brushScale = src.intensity;
        let flicker = 1.0 + Math.sin(time * 0.005 + src.target.x) * 0.05;

        this.lightBrush.setScale(brushScale * flicker);
        this.lightBrush.setPosition(drawX, drawY);
        this.nightRT.erase(this.lightBrush);
      });
    }
  }

  // === ЛОГИКА ОБЛАКОВ ===
  if (this.clouds && this.cloudBounds) {
    let zoom = this.cameras.main.zoom;
    let targetAlpha = 0;
    if (zoom < 0.8) {
      targetAlpha = (0.8 - zoom) * 1.5;
      if (targetAlpha > 0.9) targetAlpha = 0.9;
    }
    this.clouds.children.iterate((cloud) => {
      cloud.alpha += (targetAlpha - cloud.alpha) * 0.05;
      cloud.x += cloud.speedX;
      if (cloud.x > this.cloudBounds.maxX) cloud.x = this.cloudBounds.minX;
    });
  }

  // === РЕЖИМ СТРОИТЕЛЬСТВА ===
  if (buildMode && previewSprite) {
    const p = this.input.activePointer;
    const g = getGridFromPointer(p);
    const w = getWorldFromGrid(g.x, g.y);
    previewSprite.setPosition(w.x, w.y);
    previewRect.setPosition(w.x, w.y);
    const v = isValidPlacement(g.x, g.y);
    let size =
      buildMode === "house" && currentEra > 2
        ? 32
        : buildMode === "house"
        ? 48
        : 64;
    previewRect.clear();
    if (v) {
      previewSprite.setTint(0x55ff55);
      previewRect.lineStyle(2, 0x00ff00);
    } else {
      previewSprite.setTint(0xff5555);
      previewRect.lineStyle(2, 0xff0000);
    }
    previewRect.strokeRect(-size / 2, -size / 2, size, size);
  }

  // === ЛОГИКА ЖИТЕЛЕЙ ===
  if (villagers) {
    villagers.forEach((v) => {
      if (v.active) {
        moveVillager(v);
        enforceBoundaries(v);
        v.setDepth(v.y);
      }
    });
  }
}

function setupInput(scene) {
  scene.input.on("dragstart", (p, g) => {
    if (g.texture && g.texture.key.includes("villager")) {
      isDraggingEntity = true;
      g.isDragged = true;
      g.body.enable = false;
      scene.tweens.add({
        targets: g,
        scale: 1.3,
        duration: 150,
        ease: "Back.out",
      });
      g.isMoving = false;
      g.targetX = g.x;
      g.targetY = g.y;
    }
  });
  scene.input.on("drag", (p, g, x, y) => {
    if (g.isDragged) {
      g.x = x;
      g.y = y;
    }
  });
  scene.input.on("dragend", (p, g) => {
    if (g.isDragged) {
      isDraggingEntity = false;
      g.isDragged = false;
      g.body.enable = true;
      scene.tweens.add({
        targets: g,
        scale: 1.0,
        duration: 150,
        ease: "Bounce.out",
      });
      g.targetX = g.x;
      g.targetY = g.y;
    }
  });
  scene.input.on("wheel", (p, g, x, y, z) => {
    let newZoom = scene.cameras.main.zoom - y * 0.001;
    if (newZoom > 2) newZoom = 2;
    if (newZoom < 0.2) newZoom = 0.2;
    scene.cameras.main.setZoom(newZoom);
  });
  scene.input.on("pointermove", (p) => {
    if (!p.isDown || buildMode !== null || isDraggingEntity) return;
    const cam = scene.cameras.main;
    cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
    cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
  });
  scene.input.on("pointerdown", (p) => {
    if (buildMode) tryPlaceBuilding(scene, p);
    else if (p.rightButtonDown()) cancelBuildMode();
  });
  scene.input.mouse.disableContextMenu();
}

// === СЕКРЕТНЫЙ ИВЕНТ (HELL YEAH) ===
// === СЕКРЕТНЫЙ ИВЕНТ (HELL YEAH) - BEZ SKELETOV ===
window.triggerUSAEvent = function () {
  let scene = window.gameScene;
  let cam = scene.cameras.main;

  // --- СОЗДАНИЕ АНИМАЦИИ ---
  if (!scene.anims.exists("explode_anim")) {
    scene.anims.create({
      key: "explode_anim",
      frames: [
        { key: "explosion_f0" },
        { key: "explosion_f1" },
        { key: "explosion_f2" },
        { key: "explosion_f3" },
        { key: "explosion_f4" },
      ],
      frameRate: 15,
      repeat: 0,
      hideOnComplete: true,
    });
  }

  // 1. Надпись HELL YEAH (Флаг + Обводка)
  let cx = scene.scale.width / 2;
  let cy = scene.scale.height / 2;

  let maskText = scene.add
    .text(cx, cy, "HELL YEAH!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "72px",
      color: "#ffffff",
      align: "center",
    })
    .setOrigin(0.5)
    .setVisible(false);

  let flagSprite = scene.add.tileSprite(cx, cy, 800, 200, "flag_pattern");
  flagSprite.setMask(maskText.createBitmapMask());

  let strokeText = scene.add
    .text(cx, cy, "HELL YEAH!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "72px",
      color: "transparent",
      stroke: "#d32f2f",
      strokeThickness: 2,
      align: "center",
    })
    .setOrigin(0.5);

  [maskText, flagSprite, strokeText].forEach((obj) => {
    obj.setDepth(20000).setScrollFactor(0).setScale(0);
  });

  scene.tweens.add({
    targets: [maskText, flagSprite, strokeText],
    scale: 1.5,
    angle: { from: -10, to: 10 },
    duration: 500,
    ease: "Back.out",
    yoyo: true,
    repeat: 4,
    onComplete: () => {
      maskText.destroy();
      flagSprite.destroy();
      strokeText.destroy();
    },
  });

  scene.tweens.add({
    targets: flagSprite,
    tilePositionX: 200,
    duration: 4000,
    ease: "Linear",
  });

  // 2. Истребители (Пролетают стаей)
  for (let i = 0; i < 5; i++) {
    let jet = scene.add.sprite(
      cam.worldView.x - 100 - i * 80,
      cam.worldView.y + 100 + i * 40,
      "fighter_jet"
    );
    jet.setDepth(19000).setScale(1.5);
    jet.angle = 0;

    scene.tweens.add({
      targets: jet,
      x: cam.worldView.x + cam.worldView.width + 500,
      duration: 2500,
      delay: i * 200,
      onComplete: () => jet.destroy(),
    });
  }

  // 3. Взрывы (Рандомно на экране)
  let explosionCount = 20;
  scene.time.addEvent({
    delay: 150,
    repeat: explosionCount,
    callback: () => {
      let exX = Phaser.Math.Between(0, scene.scale.width);
      let exY = Phaser.Math.Between(0, scene.scale.height);

      let explosion = scene.add.sprite(exX, exY, "explosion_f0");
      explosion.setScrollFactor(0).setDepth(19500).setScale(4);
      explosion.play("explode_anim");
      explosion.on("animationcomplete", () => explosion.destroy());

      cam.shake(100, 0.01);
    },
  });
};
