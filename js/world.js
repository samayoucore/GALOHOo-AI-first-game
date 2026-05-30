// --- ХЕЛПЕРЫ КООРДИНАТ ---
window.getGridFromPointer = function (pointer) {
  let relX = pointer.worldX - worldWidth / 2;
  let relY = pointer.worldY - worldHeight / 2;
  return { x: Math.round(relX / 64), y: Math.round(relY / 64) };
};

window.getWorldFromGrid = function (gx, gy) {
  return { x: worldWidth / 2 + gx * 64, y: worldHeight / 2 + gy * 64 };
};

// --- ГЕНЕРАТОР ВЫСОТ ---
const WATER_LEVEL = 0.25;

window.getMapHeight = function (x, y) {
  // 1. Шум (Ландшафт)
  let nx = x * 0.0025;
  let ny = y * 0.0025;
  let noise = Math.sin(nx + window.SEED_X) * Math.cos(ny + window.SEED_Y);
  noise +=
    Math.sin(nx * 3 + window.SEED_X) * 0.5 * Math.cos(ny * 3 + window.SEED_Y);

  let h = (noise / 1.5 + 1) / 2;

  // 2. Маска Острова
  let cx = worldWidth / 2;
  let cy = worldHeight / 2;
  let dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  let maxDist = Math.sqrt(cx ** 2 + cy ** 2);

  // === НАСТРОЙКА РАЗМЕРА ОСТРОВА ===
  // 0.65 -> Огромный остров (почти до краев)
  // 0.45 -> Средний остров (много воды вокруг)
  // 0.30 -> Маленький островок

  let distNorm = dist / (maxDist * 0.45);

  return h + 1.25 - distNorm * 1.2;
};

window.isWater = function (x, y) {
  return window.getMapHeight(x, y) < WATER_LEVEL;
};

// --- СОЗДАНИЕ БИОМОВ ---
window.createPixelatedBiomes = function (scene) {
  let g = scene.make.graphics();
  const step = 4;
  const LVL_SAND_START = 0.2;
  const LVL_GRASS_START = 0.45;
  const LVL_FOREST = 0.65;

  for (let y = 0; y < worldHeight; y += step) {
    for (let x = 0; x < worldWidth; x += step) {
      let h = window.getMapHeight(x, y);
      if (h >= LVL_SAND_START) {
        if (h > LVL_FOREST) {
          g.fillStyle(0x388e3c);
          g.fillRect(x, y, step, step);
          let rand = Math.random();
          if (rand < 0.02) {
            g.fillStyle(0x1b5e20);
            g.fillRect(x, y, 4, 4);
          } else if (rand < 0.05) {
            g.fillStyle(0x66bb6a);
            g.fillRect(x, y, 2, 2);
          } else if (rand > 0.98) {
            g.fillStyle(0x5d4037);
            g.fillRect(x, y, 2, 2);
          }
          if (h < LVL_FOREST + 0.03 && Math.random() > 0.5) {
            g.fillStyle(0x4caf50);
            g.fillRect(x, y, step, step);
          }
        } else if (h >= LVL_GRASS_START) {
          g.fillStyle(0x4caf50);
          g.fillRect(x, y, step, step);
          if (Math.random() > 0.95) {
            g.fillStyle(0x81c784);
            g.fillRect(x, y, 2, 2);
          }
        } else if (h >= LVL_SAND_START) {
          g.fillStyle(0xeedd82);
          g.fillRect(x, y, step, step);
          if (Math.random() > 0.92) {
            g.fillStyle(0xd4c472);
            g.fillRect(x, y, 2, 2);
          }
          if (h > LVL_GRASS_START - 0.02 && Math.random() > 0.6) {
            g.fillStyle(0x4caf50);
            g.fillRect(x, y, step, step);
          }
        }
      }
    }
  }

  // Удаляем старый слой, если есть (важно для перезагрузки!)
  if (scene.textures.exists("biome_layer"))
    scene.textures.remove("biome_layer");

  g.generateTexture("biome_layer", worldWidth, worldHeight);

  // Удаляем старую картинку со сцены, если есть
  let oldBg = scene.children.getByName("biome_bg_image");
  if (oldBg) oldBg.destroy();

  let bg = scene.add.image(0, 0, "biome_layer");
  bg.setName("biome_bg_image"); // Даем имя, чтобы найти потом
  bg.setOrigin(0, 0);
  bg.setDepth(-90);
  g.destroy();
};

// --- СИСТЕМА ВОДЫ (АНИМАЦИЯ) ---
function createWater(scene) {
  waterGraphics = scene.add.graphics();
  waterGraphics.setDepth(-80);

  let g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.clear();
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 2, 2);
  g.generateTexture("sparkle_dot", 2, 2);
  g.clear();
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 6, 2);
  g.generateTexture("sparkle_short", 6, 2);
  g.clear();
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 14, 2);
  g.generateTexture("sparkle_long", 14, 2);
  g.destroy();

  const createEmitter = (key) => {
    return scene.add.particles(key).createEmitter({ on: false });
  };
  let emitters = [
    createEmitter("sparkle_dot"),
    createEmitter("sparkle_short"),
    createEmitter("sparkle_long"),
  ];

  scene.tweens.addCounter({
    from: 0,
    to: 100,
    duration: 1500,
    loop: -1,
    yoyo: true,
    onUpdate: () => {
      emitters.forEach((em) => {
        em.forEachAlive((p) => {
          p.alpha = Math.sin((p.lifeCurrent / p.life) * Math.PI) * 0.8;
        });
      });
    },
  });

  scene.time.addEvent({
    delay: 200,
    callback: () => {
      spawnWaterEffect(scene);
    },
    loop: true,
  });
}

function spawnWaterEffect(scene) {
  for (let i = 0; i < 10; i++) {
    let x = Phaser.Math.Between(0, worldWidth);
    let y = Phaser.Math.Between(0, worldHeight);

    if (window.isWater(x, y)) {
      if (Math.random() < 0.05) {
        let fish = scene.add.image(x, y, "fish_silhouette");
        fish.setDepth(-85);
        fish.setAlpha(0);
        fish.setScale(Math.random() < 0.5 ? 1 : -1, 1);
        scene.tweens.add({
          targets: fish,
          alpha: { from: 0, to: 0.6 },
          x: x + (Math.random() * 40 - 20),
          duration: 2000,
          yoyo: true,
          onComplete: () => fish.destroy(),
        });
      } else if (Math.random() < 0.15) {
        let tex = Math.random() > 0.5 ? "water_splash" : "sparkle_dot";
        let part = scene.add.image(x, y, tex);
        part.setDepth(-79);
        part.setAlpha(0);
        scene.tweens.add({
          targets: part,
          y: y - 5,
          alpha: { start: 0, to: 0.8 },
          duration: 1000,
          yoyo: true,
          onComplete: () => part.destroy(),
        });
      }
      return;
    }
  }
}

function updateWater(scene, time) {
  waterGraphics.clear();
  const step = 8;

  // Прилив
  let tide = Math.sin(time * 0.0015) * 0.02;

  // Пороги
  let lDeep = WATER_LEVEL - 0.15 + tide * 0.5;
  let lMid = WATER_LEVEL - 0.08 + tide * 0.8;
  let lShore = WATER_LEVEL + tide;
  let lFoam = WATER_LEVEL + 0.02 + tide;

  // Параметр зоны затухания (сколько пикселей от края начинать гасить блики)
  // 500px обеспечит очень плавный переход
  const fadeZone = 500;

  for (let y = 0; y < worldHeight; y += step) {
    for (let x = 0; x < worldWidth; x += step) {
      let h = window.getMapHeight(x, y);

      if (h < lFoam) {
        // 1. Подложка (рисуется всегда, создавая бесшовный фон)
        let baseColor = 0x0d47a1;
        if (h >= lDeep && h < lMid) baseColor = 0x1976d2;
        if (h >= lMid && h < lShore) baseColor = 0x64b5f6;

        if (h < lShore) {
          waterGraphics.fillStyle(baseColor, 1);
          waterGraphics.fillRect(x, y, step, step);
        }

        // 2. ИСКОРКИ (С УЧЕТОМ ГРАНИЦ КАРТЫ)
        if (h < lDeep) {
          // Считаем расстояние до ближайшего края карты
          // min(расстояние до левого, правого, верхнего, нижнего края)
          let distToEdge = Math.min(x, worldWidth - x, y, worldHeight - y);

          // Если мы внутри безопасной зоны - коэффициент 1 (полная яркость)
          // Если ближе к краю - коэффициент падает к 0
          let edgeFade = 1;
          if (distToEdge < fadeZone) {
            edgeFade = distToEdge / fadeZone;
          }

          // Если мы совсем на краю (edgeFade почти 0), то даже не считаем математику
          if (edgeFade > 0.05) {
            let randomSeed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            let cycle = Math.sin(time * 0.002 + randomSeed);

            if (cycle > 0.98) {
              // Базовая альфа блика
              let alpha = (cycle - 0.98) * 30;

              // Умножаем яркость на коэффициент затухания у краев
              alpha *= edgeFade;

              waterGraphics.fillStyle(0x81d4fa, alpha);
              waterGraphics.fillRect(x + 3, y + 3, 2, 2);
            }
          }
        }

        // 3. Пена
        if (h >= lShore) {
          if (Math.sin(x * 0.1) * Math.cos(y * 0.1) > -0.2) {
            waterGraphics.fillStyle(0xffffff, 0.7);
            waterGraphics.fillRect(x, y, step, step);
          }
        }
      }
    }
  }
}

// --- СПАВН ОБЪЕКТОВ ---
function populateWorld(scene) {
  const objectCount = 220;
  const treeTypes = [
    "tree_oak",
    "tree_birch",
    "tree_spruce",
    "tree_pine",
    "tree_apple",
  ];
  const smallRocks = ["rock_small_1", "rock_small_2"];
  const mediumRocks = ["rock_medium_1", "rock_medium_2"];
  const pebbles = ["pebble_1", "pebble_2"];
  let palmsSpawned = 0;

  const LVL_SAND_START = WATER_LEVEL;
  const LVL_GRASS_START = 0.45;
  const LVL_FOREST_START = 0.65;

  for (let i = 0; i < objectCount * 5; i++) {
    let x = Phaser.Math.Between(20, worldWidth - 20);
    let y = Phaser.Math.Between(20, worldHeight - 20);
    if (
      Phaser.Math.Distance.Between(x, y, worldWidth / 2, worldHeight / 2) < 150
    )
      continue;

    let h = window.getMapHeight(x, y);
    let biome = "water";
    if (h >= LVL_SAND_START && h < LVL_GRASS_START) biome = "sand";
    else if (h >= LVL_GRASS_START && h < LVL_FOREST_START) biome = "grass";
    else if (h >= LVL_FOREST_START) biome = "forest";

    if (biome === "water") continue;

    if (biome === "sand") {
      if (Math.random() < 0.08) {
        let palm = natureGroup.create(x, y, "tree_palm");
        palm.setDepth(palm.y + 30);
        palm.body.setSize(10, 10);
        palm.body.setOffset(27, 70);
        palmsSpawned++;
      } else if (Math.random() < 0.05) {
        let pKey = Phaser.Utils.Array.GetRandom(pebbles);
        let pebble = natureGroup.create(x, y, pKey);
        pebble.setDepth(0);
        pebble.body.checkCollision.none = true;
      }
    } else if (biome === "forest") {
      if (Math.random() < 0.4) {
        let type = Phaser.Utils.Array.GetRandom(treeTypes);
        let tree = natureGroup.create(x, y, type);
        tree.setDepth(tree.y + 35);
        tree.body.setSize(16, 10);
        tree.body.setOffset(24, 68);
      } else if (Math.random() < 0.15) {
        let rockKey =
          Math.random() < 0.6
            ? Phaser.Utils.Array.GetRandom(smallRocks)
            : Phaser.Utils.Array.GetRandom(mediumRocks);
        let rock = natureGroup.create(x, y, rockKey);
        rock.setDepth(rock.y + 10);
        if (rockKey.includes("small")) {
          rock.body.setSize(14, 8);
          rock.body.setOffset(2, 6);
        } else {
          rock.body.setSize(24, 12);
          rock.body.setOffset(4, 10);
        }
      } else if (Math.random() < 0.1) {
        let deco = decorationsGroup.create(x, y, "stick");
        deco.setDepth(0);
        deco.setRotation(Math.random() * 6);
      }
    } else if (biome === "grass") {
      if (Math.random() < 0.03) {
        let type = Phaser.Utils.Array.GetRandom(treeTypes);
        let tree = natureGroup.create(x, y, type);
        tree.setDepth(tree.y + 35);
        tree.body.setSize(16, 10);
        tree.body.setOffset(24, 68);
      }
    }
    if (natureGroup.getLength() >= objectCount) break;
  }

  // Гарантия пальм
  let attempts = 0;
  while (palmsSpawned < 3 && attempts < 2000) {
    let x = Phaser.Math.Between(0, worldWidth);
    let y = Phaser.Math.Between(0, worldHeight);
    let h = window.getMapHeight(x, y);
    if (h >= LVL_SAND_START && h < LVL_GRASS_START) {
      let palm = natureGroup.create(x, y, "tree_palm");
      palm.setDepth(palm.y + 30);
      palm.body.setSize(10, 10);
      palm.body.setOffset(27, 70);
      palmsSpawned++;
    }
    attempts++;
  }

  // Монументы
  if (!scene.anims.exists("bonfire_anim")) {
    scene.anims.create({
      key: "bonfire_anim",
      frames: [
        { key: "bonfire_f0" },
        { key: "bonfire_f1" },
        { key: "bonfire_f2" },
        { key: "bonfire_f3" },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }
  if (!scene.anims.exists("fountain_anim")) {
    scene.anims.create({
      key: "fountain_anim",
      frames: [
        { key: "fountain_f0" },
        { key: "fountain_f1" },
        { key: "fountain_f2" },
        { key: "fountain_f3" },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }
  if (!scene.anims.exists("holo_anim")) {
    scene.anims.create({
      key: "holo_anim",
      frames: [
        { key: "holo_f0" },
        { key: "holo_f1" },
        { key: "holo_f2" },
        { key: "holo_f3" },
      ],
      frameRate: 6,
      repeat: -1,
    });
  }

  let mx = worldWidth / 2,
    my = worldHeight / 2;
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

  // === НОВОЕ: ДОБАВЛЯЕМ СВЕТ МОНУМЕНТУ ===
  // Очищаем старые (на случай перезапуска)
  lightSources = [];

  // Добавляем монумент как источник света
  lightSources.push({
    target: centralMonument,
    intensity: 1.5,
    isMobile: false,
  });

  // Добавляем свет существующим домам (если загрузили карту)
  buildingsGroup.children.each((b) => {
    if (b.texture.key.includes("house")) {
      lightSources.push({ target: b, intensity: 1.0, isMobile: false });
    }
  });

  if (
    centralMonument.body &&
    typeof centralMonument.body.setImmovable === "function"
  ) {
    centralMonument.body.setImmovable(true);
  }

  scene.physics.add.collider(villagers, buildingsGroup);

  scene.physics.add.collider(villagers, buildingsGroup);
  scene.physics.add.collider(villagers, natureGroup);
  scene.physics.add.collider(villagers, centralMonument);
}

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ГРАНИЦ ---
// Вынесены из populateWorld, чтобы быть доступными всегда

window.getCoastLineX = function (y) {
  let startX = worldWidth / 2;
  for (let x = startX; x < worldWidth; x += 16) {
    if (window.isWater(x, y)) return x;
  }
  return worldWidth;
};

window.getForestLineX = function (y) {
  let startX = worldWidth / 2 - 200;
  if (startX < 0) startX = 0;
  for (let x = startX; x < worldWidth; x += 16) {
    let h = window.getMapHeight(x, y);
    if (h < 0.65) return x;
  }
  return 50;
};

// Запуск таймера роста природы (вызвать 1 раз в create)

window.startNatureRespawn = function (scene) {
  // Каждые 3 секунды пытаемся вырастить дерево или камень
  scene.time.addEvent({
    delay: 3000,
    loop: true,
    callback: () => {
      // ВО ВРЕМЯ ДОЖДЯ ПРИРОДА РАСТЕТ В 3 РАЗА БЫСТРЕЕ (x3 попытки)
      let attempts = window.isRaining ? 3 : 1;

      for (let i = 0; i < attempts; i++) {
        // Максимум объектов
        if (natureGroup.getLength() > 300) return;

        let x = Phaser.Math.Between(50, worldWidth - 50);
        let y = Phaser.Math.Between(50, worldHeight - 50);

        // Проверки ландшафта
        let h = window.getMapHeight(x, y);
        if (h < 0.25) continue; // Вода (continue вместо return, чтобы цикл не прерывался)
        if (
          Phaser.Math.Distance.Between(x, y, worldWidth / 2, worldHeight / 2) <
          200
        )
          continue;

        // Выбор типа
        let type = null;
        if (h > 0.65) {
          // Лес
          if (Math.random() < 0.7)
            type = Phaser.Utils.Array.GetRandom([
              "tree_oak",
              "tree_birch",
              "tree_spruce",
              "tree_pine",
            ]);
          else
            type = Phaser.Utils.Array.GetRandom([
              "rock_medium_1",
              "rock_small_1",
            ]);
        } else if (h > 0.45) {
          // Поляна
          if (Math.random() < 0.3) type = "tree_apple";
          else if (Math.random() < 0.3) type = "rock_small_2";
        } else {
          // Пляж
          if (Math.random() < 0.2) type = "tree_palm";
        }

        if (type) {
          let obj = natureGroup.create(x, y, type);
          obj.setDepth(y);
          obj.setScale(0);
          scene.tweens.add({
            targets: obj,
            scale: 1,
            duration: 1000,
            ease: "Bounce.out",
          });

          if (type.includes("tree")) {
            if (type === "tree_palm") {
              obj.body.setSize(10, 10);
              obj.body.setOffset(27, 70);
            } else {
              obj.body.setSize(16, 10);
              obj.body.setOffset(24, 68);
            }
          } else if (type.includes("rock")) {
            if (type.includes("small")) {
              obj.body.setSize(14, 8);
              obj.body.setOffset(2, 6);
            } else {
              obj.body.setSize(24, 12);
              obj.body.setOffset(4, 10);
            }
          } else if (type === "stick") {
            obj.body.checkCollision.none = true;
          }
        }
      }
    },
  });
};

// --- ГЛОБАЛЬНЫЕ АНИМАЦИИ (Вставить в конец файла) ---
window.createGlobalAnimations = function (scene) {
  if (!scene.anims.exists("bonfire_anim")) {
    scene.anims.create({
      key: "bonfire_anim",
      frames: [
        { key: "bonfire_f0" },
        { key: "bonfire_f1" },
        { key: "bonfire_f2" },
        { key: "bonfire_f3" },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }
  if (!scene.anims.exists("fountain_anim")) {
    scene.anims.create({
      key: "fountain_anim",
      frames: [
        { key: "fountain_f0" },
        { key: "fountain_f1" },
        { key: "fountain_f2" },
        { key: "fountain_f3" },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }
  if (!scene.anims.exists("holo_anim")) {
    scene.anims.create({
      key: "holo_anim",
      frames: [
        { key: "holo_f0" },
        { key: "holo_f1" },
        { key: "holo_f2" },
        { key: "holo_f3" },
      ],
      frameRate: 6,
      repeat: -1,
    });
  }
};
