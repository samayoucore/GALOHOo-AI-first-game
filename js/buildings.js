let buildMode = null;
let previewSprite = null;
let previewRect = null;

function selectBuilding(type) {
  if (buildMode === type) {
    cancelBuildMode();
    return;
  }
  buildMode = type;
  if (previewSprite) previewSprite.destroy();
  if (previewRect) previewRect.destroy();

  let texture = getTextureByType(type);
  previewSprite = window.gameScene.add
    .sprite(0, 0, texture)
    .setAlpha(0.7)
    .setDepth(10000);
  previewRect = window.gameScene.add.graphics();
  previewRect.lineStyle(2, 0xffffff);

  // Адаптивная рамка под размер здания (48 для 1-2 эры, или стандарт 64)
  let size = 64;
  if (type === "house") {
    size = currentEra <= 2 ? 48 : 32; // В 1 и 2 эре дома большие (48px)
  }

  previewRect.strokeRect(-size / 2, -size / 2, size, size);
  previewRect.setDepth(10000);

  const hint = document.getElementById("build-hint");
  if (hint) hint.style.display = "block";
}

function cancelBuildMode() {
  buildMode = null;
  if (previewSprite) previewSprite.destroy();
  if (previewRect) previewRect.destroy();
  previewSprite = null;
  previewRect = null;
  const hint = document.getElementById("build-hint");
  if (hint) hint.style.display = "none";
}

function tryPlaceBuilding(scene, pointer) {
  const gridPos = getGridFromPointer(pointer);
  if (!isValidPlacement(gridPos.x, gridPos.y)) {
    showFloatingText("Нужен сосед!", pointer.x, pointer.y, "#ff0000");
    return;
  }
  let costObj = getCostByType(buildMode);
  for (let res in costObj) {
    if (resources[res] < costObj[res]) {
      showFloatingText(`Мало: ${res}`, pointer.x, pointer.y, "#ff0000");
      return;
    }
  }
  for (let res in costObj) resources[res] -= costObj[res];

  buildRealBuilding(scene, gridPos.x, gridPos.y, buildMode);
  occupiedGrid.push({ x: gridPos.x, y: gridPos.y });
  updateUI();
}

function buildRealBuilding(scene, gx, gy, type) {
  const pos = getWorldFromGrid(gx, gy);

  // Дорожки
  drawPathsFor(scene, gx, gy, pos.x, pos.y);
  updateNeighborPaths(scene, gx, gy);

  // Здание
  let texture = getTextureByType(type);
  let building = buildingsGroup.create(pos.x, pos.y, texture);

  // === НОВОЕ: ЭФФЕКТ ДЫМА ПРИ ПОСТРОЙКЕ ===
  if (window.gameScene && window.gameScene.buildEmitter) {
    // explode(количество, x, y) - создает разовый взрыв частиц
    window.gameScene.buildEmitter.explode(20, pos.x, pos.y);
  }

  // === ОБНОВЛЕНО: РЕГИСТРАЦИЯ СВЕТА (НОВАЯ СИСТЕМА) ===
  // Мы больше НЕ создаем желтый прямоугольник.
  // Мы просто добавляем здание в массив источников света.
  // main.js сам нарисует "дырку" в темноте в этом месте.
  if (type === "house") {
    // target: само здание
    // intensity: 1.0 (размер пятна света)
    lightSources.push({ target: building, intensity: 1.0, isMobile: false });
  }

  // Настройка физики
  if (type === "house") {
    if (currentEra <= 2) {
      building.body.setSize(36, 24);
      building.body.setOffset(6, 24);
    } else {
      building.body.setSize(32, 20);
      building.body.setOffset(0, 12);
    }
  } else {
    building.body.setSize(40, 40);
    building.body.setOffset(12, 12);
  }
  building.setDepth(building.y);

  // Удаляем природу под домом
  scene.physics.overlap(building, natureGroup, (b, natureObj) => {
    scene.tweens.add({
      targets: natureObj,
      scaleY: 0,
      duration: 200,
      onComplete: () => natureObj.destroy(),
    });
  });

  // Удаляем декор
  decorationsGroup.children.each((d) => {
    if (Phaser.Math.Distance.Between(d.x, d.y, building.x, building.y) < 30)
      d.destroy();
  });

  // Выталкиваем жителей
  scene.physics.overlap(building, villagers, (b, v) => {
    let angle = Phaser.Math.Angle.Between(b.x, b.y, v.x, v.y);
    v.x = b.x + Math.cos(angle) * 60;
    v.y = b.y + Math.sin(angle) * 60;
    v.targetX = v.x;
    v.targetY = v.y;
    v.isMoving = false;
  });
}

// --- ДОРОЖКИ ---
function drawPathsFor(scene, gx, gy, wx, wy) {
  const hasUp = occupiedGrid.some((p) => p.x === gx && p.y === gy - 1);
  const hasDown = occupiedGrid.some((p) => p.x === gx && p.y === gy + 1);
  const hasLeft = occupiedGrid.some((p) => p.x === gx - 1 && p.y === gy);
  const hasRight = occupiedGrid.some((p) => p.x === gx + 1 && p.y === gy);

  if (hasUp || hasDown || hasLeft || hasRight) {
    let g = scene.add.graphics();
    g.fillStyle(0x5d4037);
    g.setDepth(0);
    let py = wy + 16;
    let px = wx;

    // Центральный узел
    g.fillRect(px - 2, py - 2, 4, 4);

    // Лучи
    if (hasUp) g.fillRect(px - 2, py - 48, 4, 48);
    if (hasDown) g.fillRect(px - 2, py, 4, 48);
    if (hasLeft) g.fillRect(px - 48, py - 2, 48, 4);
    if (hasRight) g.fillRect(px, py - 2, 48, 4);
  }
}

function updateNeighborPaths(scene, gx, gy) {
  const offsets = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  offsets.forEach((o) => {
    let nx = gx + o.x;
    let ny = gy + o.y;
    if (occupiedGrid.some((p) => p.x === nx && p.y === ny)) {
      let nPos = getWorldFromGrid(nx, ny);
      drawPathsFor(scene, nx, ny, nPos.x, nPos.y);
    }
  });
}

// --- ХЕЛПЕРЫ СТРОЙКИ ---
function isValidPlacement(gx, gy) {
  if (occupiedGrid.some((p) => p.x === gx && p.y === gy)) return false;
  const hasNeighbor = occupiedGrid.some(
    (p) =>
      (p.x === gx + 1 && p.y === gy) ||
      (p.x === gx - 1 && p.y === gy) ||
      (p.x === gx && p.y === gy + 1) ||
      (p.x === gx && p.y === gy - 1)
  );
  if (!hasNeighbor) return false;
  let worldPos = getWorldFromGrid(gx, gy);
  let waterX = getCoastLineX(worldPos.y);
  if (worldPos.x > waterX - 40) return false;
  return true;
}

function getCostByType(type) {
  if (type === "house") {
    const baseCosts = [
      { wood: 50 },
      { wood: 150, stone: 50 },
      { stone: 200, wood: 100, metal: 50 },
      { stone: 400, metal: 200, gold: 100 },
      { metal: 500, gold: 300, wood: 200 },
    ];
    return baseCosts[currentEra - 1];
  }
  return BUILDING_TYPES[type].cost;
}

function getTextureByType(type) {
  if (type === "house") return "house_era" + currentEra;
  return BUILDING_TYPES[type].texture;
}

// === ОБНОВЛЕНИЕ ГРАФИКИ ПРИ СМЕНЕ ЭРЫ ===
function refreshEraVisuals() {
  let houseTex = "house_era" + currentEra;
  let villagerTex = "villager_era" + currentEra;

  // Обновляем жителей
  villagers.forEach((v) => {
    v.setTexture(villagerTex);
  });

  // Обновляем дома
  buildingsGroup.children.iterate((b) => {
    if (b.texture.key.includes("house")) {
      b.setTexture(houseTex);
      if (currentEra <= 5) {
        b.body.setSize(36, 24);
        b.body.setOffset(6, 24);
      }
    }
  });

  // Пересоздаем монумент
  let x = centralMonument.x;
  let y = centralMonument.y;
  centralMonument.destroy();

  if (currentEra === 1) {
    centralMonument = window.gameScene.physics.add.sprite(x, y, "bonfire_f0");
    centralMonument.play("bonfire_anim");
    centralMonument.body.setSize(36, 20);
    centralMonument.body.setOffset(6, 24);
  } else if (currentEra === 4) {
    centralMonument = window.gameScene.physics.add.sprite(x, y, "fountain_f0");
    centralMonument.play("fountain_anim");
    centralMonument.body.setSize(40, 16);
    centralMonument.body.setOffset(4, 32);
  } else if (currentEra === 5) {
    centralMonument = window.gameScene.physics.add.sprite(x, y, "holo_f0");
    centralMonument.play("holo_anim");
    centralMonument.body.setSize(32, 16);
    centralMonument.body.setOffset(8, 32);
  } else {
    // Эра 2 и 3 - Статичные спрайты
    centralMonument = window.gameScene.physics.add.staticSprite(
      x,
      y,
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

  // Проверяем, есть ли у тела метод setImmovable (у статичных его нет)
  if (
    centralMonument.body &&
    typeof centralMonument.body.setImmovable === "function"
  ) {
    centralMonument.body.setImmovable(true);
  }

  window.gameScene.physics.add.collider(villagers, centralMonument);
}

// Автоматический поиск места для строительства (для ИИ жителей)
function findRandomBuildSpot() {
  // 1. Перемешиваем массив занятых клеток, чтобы выбор был случайным
  let shuffledGrid = occupiedGrid.slice(); // Копия массива
  // Алгоритм тасования Фишера-Йетса
  for (let i = shuffledGrid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledGrid[i], shuffledGrid[j]] = [shuffledGrid[j], shuffledGrid[i]];
  }

  // 2. Проверяем соседей каждой занятой клетки
  // Мы ищем пустую клетку РЯДОМ с уже существующим зданием/дорогой
  const offsets = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  for (let cell of shuffledGrid) {
    for (let o of offsets) {
      let testX = cell.x + o.x;
      let testY = cell.y + o.y;

      // Проверка 1: Можно ли тут строить? (нет ли здания, есть ли сосед, не вода ли это)
      // isValidPlacement уже проверяет наличие соседа, так что это ок.
      if (isValidPlacement(testX, testY)) {
        // Нашли валидное место!
        return { x: testX, y: testY };
      }
    }
  }

  return null; // Мест нет (остров кончился)
}
