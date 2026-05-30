// js/villagers.js

function spawnVillager(scene, x, y) {
  let textureKey = "villager_era" + window.currentEra;
  let v = scene.physics.add.sprite(x, y, textureKey);
  // ... (стандартный код: коллизии, setInteractive) ...
  v.setCollideWorldBounds(true);
  v.setInteractive({ draggable: true });

  // ... (стандартный код: коллизии с группами) ...
  scene.physics.add.collider(v, window.buildingsGroup);
  scene.physics.add.collider(v, window.natureGroup);
  scene.physics.add.collider(v, window.centralMonument);

  // ... (инициализация переменных движения, energy и т.д.) ...
  v.targetX = x;
  v.targetY = y;
  v.isMoving = false;
  v.speed = 60;
  v.isDragged = false;
  v.state = "IDLE";
  v.energy = 100;
  v.restTimer = 0;
  v.zzzTimer = 0;
  v.targetResource = null;
  v.gatherTimer = 0;
  v.stuckTimer = 0;
  v.lastX = x;
  v.lastY = y;

  // === НОВОЕ: ДАННЫЕ ЖИТЕЛЯ (Имя, Профессия, Статы) ===
  v.dataStats = {
    name: window.getRandomName(),
    woodGathered: 0,
    stoneGathered: 0,
    metalGathered: 0,
    job: "Бездельник",
  };

  // Для обработки двойного клика
  v.lastClickTime = 0;

  // Обработчик нажатия
  v.on("pointerdown", () => {
    let now = Date.now();
    // Если прошло меньше 300мс с прошлого клика -> ДВОЙНОЙ КЛИК
    if (now - v.lastClickTime < 300) {
      window.openVillagerPanel(v);
    }
    v.lastClickTime = now;
  });
  // =====================================================

  // ... (создание рук и инструментов) ...
  v.leftHand = scene.add.sprite(x, y, "villager_hand");
  v.rightHand = scene.add.sprite(x, y, "villager_hand");
  v.tool = scene.add.sprite(x, y, "tool_none");
  v.tool.setVisible(false);
  v.leftHand.setDepth(y + 1);
  v.rightHand.setDepth(y + 1);
  v.tool.setDepth(y + 2);
  v.walkCycle = 0;

  window.villagers.push(v);
}

window.spawnVillagerFromMonument = function (scene) {
  let centerX = window.worldWidth / 2;
  let centerY = window.worldHeight / 2;
  let spawnX = centerX + (Math.random() - 0.5) * 40;
  let spawnY = centerY + 60;
  spawnVillager(scene, spawnX, spawnY);
  let v = window.villagers[window.villagers.length - 1];
  v.setAlpha(0);
  scene.tweens.add({
    targets: [v, v.leftHand, v.rightHand],
    alpha: 1,
    duration: 500,
  });
};

function moveVillager(v) {
  if (v.isDragged) {
    handleDragState(v);
    return;
  }

  if (window.isNight) {
    handleNightBehavior(v);
    if (v.state === "SLEEPING") {
      v.setVisible(false);
      v.leftHand.setVisible(false);
      v.rightHand.setVisible(false);
      v.tool.setVisible(false);
      v.body.stop();
      return;
    }
  } else {
    if (v.state === "SLEEPING" || v.state === "GOING_HOME") wakeUp(v);
  }

  let h = window.getMapHeight ? window.getMapHeight(v.x, v.y) : 1;
  if (h < 0.25) {
    handleWaterPanic(v);
    return;
  }

  if (!window.isNight) {
    if (v.state === "IDLE") {
      v.setVelocity(0);
      v.rotation = 0;
      v.tool.setVisible(false);
      v.scaleY = 1;
      if (Math.random() < 0.02) {
        if (v.energy < 30) startResting(v);
        else {
          if (Math.random() < 0.7) findResource(v);
          else pickNewRandomTarget(v);
        }
      }
    } else if (v.state === "MOVING") {
      moveToTarget(v);
    } else if (v.state === "GATHERING") {
      handleGathering(v);
    } else if (v.state === "RESTING") {
      handleResting(v);
    }

    if (v.visible && v.state !== "RESTING") updateAnimation(v);
  } else if (v.state === "GOING_HOME" || v.state === "RESTING") {
    updateAnimation(v);
    if (v.state === "RESTING") handleResting(v);
  }
}

function handleNightBehavior(v) {
  if (v.state === "SLEEPING") return;
  if (v.state !== "GOING_HOME" && v.state !== "RESTING") {
    let closestHouse = null;
    let minDst = 10000;
    window.buildingsGroup.children.iterate((b) => {
      if (b.active && b.texture.key.includes("house")) {
        let d = Phaser.Math.Distance.Between(v.x, v.y, b.x, b.y);
        if (d < minDst) {
          minDst = d;
          closestHouse = b;
        }
      }
    });
    if (closestHouse) {
      v.targetResource = null;
      v.targetX = closestHouse.x;
      v.targetY = closestHouse.y + 20;
      v.state = "GOING_HOME";
      v.isMoving = true;
      v.tool.setVisible(false);
      showFloatingText("🏠", v.x, v.y - 20, "#ffffff");
    } else {
      startResting(v);
    }
  }
  if (v.state === "GOING_HOME") {
    let d = Phaser.Math.Distance.Between(v.x, v.y, v.targetX, v.targetY);
    if (d < 40) {
      v.state = "SLEEPING";
      v.body.reset(v.targetX, v.targetY);
      v.energy = 100;
      v.setVisible(false);
      v.leftHand.setVisible(false);
      v.rightHand.setVisible(false);
    } else {
      v.scene.physics.moveTo(v, v.targetX, v.targetY, v.speed);
      v.setFlipX(v.targetX < v.x);
      v.rotation = Math.sin(v.scene.time.now * 0.015) * 0.15;
      if (v.body.velocity.x === 0 && v.body.velocity.y === 0 && d < 60) {
        v.x = v.targetX;
        v.y = v.targetY;
      }
    }
  }
}

function wakeUp(v) {
  v.state = "IDLE";
  v.setVisible(true);
  v.leftHand.setVisible(true);
  v.rightHand.setVisible(true);
  v.y += 10;
  v.scene.tweens.add({ targets: v, scaleY: 1.2, duration: 200, yoyo: true });
  showFloatingText("☀️", v.x, v.y - 20, "#ffff00");
}

function startResting(v) {
  v.state = "RESTING";
  v.setVelocity(0);
  v.restTimer = v.scene.time.now + 15000;
  v.scene.tweens.add({ targets: v, scaleY: 0.8, duration: 200 });
  v.tool.setVisible(false);
  v.leftHand.x = v.x - 4;
  v.leftHand.y = v.y + 6;
  v.rightHand.x = v.x + 4;
  v.rightHand.y = v.y + 6;
}

function handleResting(v) {
  v.setVelocity(0);
  v.rotation = 0;
  if (v.scene.time.now > v.zzzTimer) {
    showFloatingText("Zzz...", v.x, v.y - 15, "#b0bec5");
    v.zzzTimer = v.scene.time.now + 1500;
  }
  if (!window.isNight && v.scene.time.now > v.restTimer) {
    v.energy = 100;
    v.state = "IDLE";
    v.scene.tweens.add({ targets: v, scaleY: 1.0, duration: 200 });
  }
}

function findResource(v) {
  let closest = null;
  let minDst = 1000;
  let limit = window.getCurrentLimit ? window.getCurrentLimit() : 9999;

  let needWood = window.resources.wood < limit;
  let needStone = window.resources.stone < limit;
  if (!needWood && !needStone) {
    pickNewRandomTarget(v);
    return;
  }

  window.natureGroup.children.iterate((obj) => {
    if (!obj.active || obj.texture.key === "stick" || obj.scaleX < 0.9) return;
    let isTree = obj.texture.key.includes("tree");
    let isRock = obj.texture.key.includes("rock");
    if (isTree && !needWood) return;
    if (isRock && !needStone) return;

    let d = Phaser.Math.Distance.Between(v.x, v.y, obj.x, obj.y);
    if (d < minDst) {
      minDst = d;
      closest = obj;
    }
  });
  if (closest) {
    v.targetResource = closest;
    let angle = Phaser.Math.Angle.Between(v.x, v.y, closest.x, closest.y);
    v.targetX = closest.x - Math.cos(angle) * 30;
    v.targetY = closest.y - Math.sin(angle) * 30;
    v.state = "MOVING";
    v.isMoving = true;
  } else {
    pickNewRandomTarget(v);
  }
}

function moveToTarget(v) {
  let d = Phaser.Math.Distance.Between(v.x, v.y, v.targetX, v.targetY);
  if (d < 5) {
    v.body.reset(v.targetX, v.targetY);
    v.isMoving = false;
    if (
      v.targetResource &&
      v.targetResource.active &&
      v.targetResource.scaleX > 0.9
    )
      startGathering(v);
    else {
      v.targetResource = null;
      v.state = "IDLE";
    }
  } else {
    v.scene.physics.moveTo(v, v.targetX, v.targetY, v.speed);
    v.setFlipX(v.targetX < v.x);
    if (v.scene.time.now > v.stuckTimer + 1000) {
      if (Phaser.Math.Distance.Between(v.x, v.y, v.lastX, v.lastY) < 5) {
        v.targetResource = null;
        pickNewRandomTarget(v);
      }
      v.stuckTimer = v.scene.time.now;
      v.lastX = v.x;
      v.lastY = v.y;
    }
  }
}

function startGathering(v) {
  if (!v.targetResource || !v.targetResource.active) {
    v.state = "IDLE";
    v.targetResource = null;
    return;
  }
  v.state = "GATHERING";
  v.setVelocity(0);
  v.gatherTimer = v.scene.time.now + 5000;
  let isTree = v.targetResource.texture.key.includes("tree");
  let eraSuffix = window.currentEra > 3 ? "" : "_" + window.currentEra;
  v.tool.setOrigin(0.5, 0.5);
  if (window.currentEra >= 4) {
    v.tool.setOrigin(0.5, 0.5);
    if (isTree) {
      v.tool.setTexture("tool_chainsaw_f0");
      v.toolType = "saw";
    } else {
      v.tool.setTexture("tool_drill_f0");
      v.toolType = "drill";
    }
  } else {
    v.tool.setOrigin(0.5, 1.0);
    if (isTree) {
      v.tool.setTexture("tool_axe" + eraSuffix);
      v.toolType = "swing";
    } else {
      v.tool.setTexture("tool_pick" + eraSuffix);
      v.toolType = "swing";
    }
  }
  v.tool.setVisible(true);
}

function handleGathering(v) {
  if (!v.targetResource || !v.targetResource.active) {
    v.tool.setVisible(false);
    v.state = "IDLE";
    v.targetResource = null;
    return;
  }
  v.setFlipX(v.targetResource.x < v.x);
  let t = v.scene.time.now;
  if (window.currentEra >= 4) {
    let frame = Math.floor(t / 50) % 2;
    if (v.toolType === "saw") v.tool.setTexture("tool_chainsaw_f" + frame);
    else v.tool.setTexture("tool_drill_f" + frame);
    v.tool.x += (Math.random() - 0.5) * 2;
    v.tool.y += (Math.random() - 0.5) * 2;
    v.tool.setRotation(0);
  } else {
    let rawSwing = Math.sin(t * 0.015);
    let dir = v.flipX ? -1 : 1;
    v.tool.setRotation((rawSwing + 0.5) * dir);
  }
  if (t > v.gatherTimer) finishGathering(v);
}

function finishGathering(v) {
  v.tool.setVisible(false);
  v.state = "IDLE";

  // Проверка: существует ли ресурс
  if (!v.targetResource || !v.targetResource.active) {
    v.targetResource = null;
    return;
  }

  v.targetResource.setActive(false);
  let resType = v.targetResource.texture.key.includes("tree")
    ? "wood"
    : "stone";

  // Анимация исчезновения ресурса
  v.scene.tweens.add({
    targets: v.targetResource,
    scaleY: 0,
    duration: 200,
    onComplete: () => {
      if (v.targetResource && v.targetResource.destroy)
        v.targetResource.destroy();
    },
  });

  // 1. РАСЧЕТ КОЛИЧЕСТВА
  let amount = Phaser.Math.Between(50, 100);
  let isRare = Math.random() < 0.1;
  if (isRare) amount = 500;

  if (isRare) v.energy = 0;
  else v.energy -= Math.floor(amount * 0.4);

  let limit = window.getCurrentLimit ? window.getCurrentLimit() : 9999;

  // Проверка лимита (чтобы не добыть больше максимума)
  if (window.resources[resType] + amount > limit) {
    amount = limit - window.resources[resType];
    if (amount < 0) amount = 0;
  }

  // 2. НАЧИСЛЕНИЕ ОСНОВНОГО РЕСУРСА (Глобально)
  window.resources[resType] += amount;

  // 3. ОБНОВЛЕНИЕ СТАТИСТИКИ ЖИТЕЛЯ (ТОЛЬКО ОДИН РАЗ!)
  // (Защита от undefined на случай старых сохранений)
  if (!v.dataStats)
    v.dataStats = { woodGathered: 0, stoneGathered: 0, metalGathered: 0 };

  if (resType === "wood") {
    v.dataStats.woodGathered += amount;
  } else {
    v.dataStats.stoneGathered += amount;
  }

  // 4. ОБНОВЛЕНИЕ ГЛОБАЛЬНОЙ СТАТИСТИКИ
  if (window.gameStats) {
    if (resType === "wood") {
      window.gameStats.treesCut++;
      window.gameStats.totalRes.wood += amount;
    } else {
      window.gameStats.stonesMined++;
      window.gameStats.totalRes.stone += amount;
    }
  }

  // 5. СОЗДАНИЕ СООБЩЕНИЯ (ИСПРАВЛЕНИЕ ОШИБКИ ReferenceError)
  // Сначала создаем msg, и только потом будем добавлять туда металл
  let color = isRare ? "#ff00ff" : "#ffffff";
  let icon = resType === "wood" ? "🌲" : "🪨";
  let msg = `+${amount}${icon}`;

  // 6. ЛОГИКА МЕТАЛЛА
  if (resType === "stone" && Math.random() < 0.5) {
    let metalAmount = Math.floor(amount / 2);
    if (window.resources.metal + metalAmount > limit) {
      metalAmount = limit - window.resources.metal;
      if (metalAmount < 0) metalAmount = 0;
    }

    window.resources.metal += metalAmount;

    // Статистика металла (Игра)
    if (window.gameStats) window.gameStats.totalRes.metal += metalAmount;

    // Статистика металла (Житель)
    v.dataStats.metalGathered = (v.dataStats.metalGathered || 0) + metalAmount;

    // Добавляем текст к сообщению (теперь msg уже существует)
    msg += `\n+${metalAmount}🔩`;
  }

  // 7. ПРОВЕРКА ПРОФЕССИИ
  let w = v.dataStats.woodGathered || 0;
  let s = v.dataStats.stoneGathered || 0;
  if (w > 100 || s > 100) {
    if (w > s * 1.5) v.dataStats.job = "Лесоруб";
    else if (s > w * 1.5) v.dataStats.job = "Шахтер";
    else v.dataStats.job = "Работяга";
  }

  // 8. ФИНАЛ
  showFloatingText(msg, v.x, v.y - 20, color);
  updateUI();

  if (isRare)
    v.scene.tweens.add({
      targets: v,
      y: v.y - 20,
      duration: 150,
      yoyo: true,
      repeat: 2,
    });
  v.targetResource = null;
}

function handleDragState(v) {
  v.body.setVelocity(0, 0);
  v.setDepth(99999);
  v.leftHand.setDepth(100000);
  v.rightHand.setDepth(100000);
  v.tool.setVisible(false);
  let swing = Math.sin(v.scene.time.now * 0.015) * 0.2;
  v.rotation = swing;
  let panic = Math.sin(v.scene.time.now * 0.03) * 5;
  let cos = Math.cos(swing),
    sin = Math.sin(swing);
  let lx = -8,
    ly = -10 + panic;
  let rx = 8,
    ry = -10 - panic;
  v.leftHand.setPosition(
    v.x + (lx * cos - ly * sin),
    v.y + (lx * sin + ly * cos)
  );
  v.rightHand.setPosition(
    v.x + (rx * cos - ry * sin),
    v.y + (rx * sin + ry * cos)
  );
  v.stuckTimer = v.scene.time.now;
  v.lastX = v.x;
  v.lastY = v.y;
  v.state = "IDLE";
  v.energy = Math.max(v.energy, 50);
}

function handleWaterPanic(v) {
  v.setAlpha(0);
  v.speed = 90;
  v.tool.setVisible(false);
  let targetH = window.getMapHeight(v.targetX, v.targetY);
  if (!v.isMoving || targetH < 0.25) {
    v.targetX = window.worldWidth / 2 + (Math.random() * 100 - 50);
    v.targetY = window.worldHeight / 2 + (Math.random() * 100 - 50);
    v.isMoving = true;
    v.state = "MOVING";
  }
  v.scene.physics.moveTo(v, v.targetX, v.targetY, v.speed);
  let sX = (Math.random() - 0.5) * 3;
  let sY = (Math.random() - 0.5) * 3;
  v.leftHand.setPosition(v.x - 6 + sX, v.y - 12 + sY);
  v.rightHand.setPosition(v.x + 6 + sX, v.y - 12 + sY);
  v.leftHand.setVisible(true);
  v.rightHand.setVisible(true);
}

function updateAnimation(v) {
  if (v.state === "GATHERING") {
    let dir = v.flipX ? -1 : 1;
    v.rightHand.x = v.x + 8 * dir;
    v.rightHand.y = v.y + 4;
    v.leftHand.x = v.x - 4 * dir;
    v.leftHand.y = v.y + 4;
    if (window.currentEra < 4) {
      v.tool.x = v.rightHand.x;
      v.tool.y = v.rightHand.y;
    } else {
      v.tool.x = v.rightHand.x + 6 * dir;
      v.tool.y = v.rightHand.y;
    }
    v.tool.setFlipX(v.flipX);
    v.tool.setDepth(v.depth + 1);
  } else {
    v.setAlpha(1);
    v.speed = 60;
    let dir = v.flipX ? -1 : 1;
    if (v.isMoving) v.walkCycle += 0.2;
    else v.walkCycle += 0.05;
    let wL = Math.sin(v.walkCycle) * 2;
    let wR = Math.sin(v.walkCycle + Math.PI) * 2;
    if (!v.isMoving) wR = wL;
    v.leftHand.setPosition(v.x + 6 * dir - dir * 2, v.y + 2 + wL);
    v.rightHand.setPosition(v.x - 6 * dir + dir * 2, v.y + 2 + wR);
    if (v.state === "MOVING")
      v.rotation = Math.sin(v.scene.time.now * 0.015) * 0.15;
    else v.rotation = 0;
  }
  v.setDepth(v.y);
  v.leftHand.setDepth(v.y + 1);
  v.rightHand.setDepth(v.y + 1);
}

function pickNewRandomTarget(v) {
  let safe = false;
  let tx, ty;
  let attempts = 0;
  while (!safe && attempts < 10) {
    let angle = Math.random() * Math.PI * 2;
    let dist = Math.random() * 600;
    tx = window.worldWidth / 2 + Math.cos(angle) * dist;
    ty = window.worldHeight / 2 + Math.sin(angle) * dist;
    if (window.getMapHeight) {
      let h = window.getMapHeight(tx, ty);
      if (
        h >= 0.25 &&
        tx > 50 &&
        tx < window.worldWidth - 50 &&
        ty > 50 &&
        ty < window.worldHeight - 50
      )
        safe = true;
    } else safe = true;
    attempts++;
  }
  if (safe) {
    v.targetX = tx;
    v.targetY = ty;
    v.state = "MOVING";
    v.isMoving = true;
  }
}

function enforceBoundaries(v) {}
