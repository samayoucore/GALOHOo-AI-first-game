function generatePixelTextures(scene) {
  let g = scene.make.graphics({ x: 0, y: 0, add: false });

  // ==========================================
  // 1. БАЗОВЫЕ ТЕКСТУРЫ
  // ==========================================
  g.clear();
  g.fillStyle(0x4caf50);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x388e3c);
  for (let i = 0; i < 10; i++)
    g.fillRect(Math.random() * 32, Math.random() * 32, 2, 2);
  g.fillStyle(0x81c784);
  for (let i = 0; i < 5; i++)
    g.fillRect(Math.random() * 32, Math.random() * 32, 2, 2);
  g.generateTexture("tex_grass_bg", 32, 32);
  g.clear();
  g.fillStyle(0x5d4037);
  g.fillRect(30, 0, 4, 64);
  g.fillRect(0, 30, 64, 4);
  g.generateTexture("path_thin", 64, 64);
  g.clear();
  g.fillStyle(0xffcc80);
  g.fillRect(4, 0, 8, 6);
  g.fillStyle(0x1565c0);
  g.fillRect(4, 6, 8, 10);
  g.fillStyle(0x000000);
  g.fillRect(5, 2, 2, 2);
  g.fillRect(9, 2, 2, 2);

  // === ЖИТЕЛИ (5 ЭПОХ) ===
  const villagerStyles = [
    { top: 0x8d6e63, bot: 0x5d4037, detail: 0x3e2723 }, // 1: Шкуры (Коричневый)
    { top: 0xe6ee9c, bot: 0x1b5e20, detail: 0x9e9d24 }, // 2: Крестьянин (Зеленый)
    { top: 0xbdbdbd, bot: 0x424242, detail: 0x757575 }, // 3: Средневековье (Серый/Кольчуга)
    { top: 0xffffff, bot: 0x1565c0, detail: 0x90caf9 }, // 4: Офис (Белый верх, синий низ)
    { top: 0x212121, bot: 0x000000, detail: 0x00e5ff }, // 5: Кибер (Черный + Неон)
  ];

  for (let i = 0; i < 5; i++) {
    g.clear();
    let style = villagerStyles[i];

    // Голова (Телесный цвет у всех одинаковый)
    g.fillStyle(0xffcc80);
    g.fillRect(4, 0, 8, 6);

    // Глаза
    g.fillStyle(0x000000);
    g.fillRect(5, 2, 2, 2);
    g.fillRect(9, 2, 2, 2);

    // Тело (Верхняя одежда)
    g.fillStyle(style.top);
    g.fillRect(4, 6, 8, 6);

    // Ноги (Нижняя одежда)
    g.fillStyle(style.bot);
    g.fillRect(4, 12, 8, 4); // Штаны

    // Детали (Пояс или узор)
    g.fillStyle(style.detail);
    g.fillRect(4, 10, 8, 2); // Пояс посередине

    // Для киберпанка добавим очки
    if (i === 4) {
      g.fillStyle(0x00e5ff); // Неоновые очки/визор
      g.fillRect(5, 2, 6, 2);
    }

    g.generateTexture("villager_era" + (i + 1), 16, 16);
  }

  // Рука жителя (Оставляем одну общую, телесного цвета)
  g.clear();
  g.fillStyle(0xffcc80);
  g.fillRect(0, 0, 4, 4);
  g.fillStyle(0xe65100); // Тень
  g.fillRect(0, 3, 4, 1);
  g.generateTexture("villager_hand", 4, 4);

  // === ДОМА ЭР 1-5 ===

  // Эра 1 (Палатка)
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(24, 42, 40, 12);
  let cLight = 0x8d6e63;
  let cDark = 0x5d4037;
  let cWood = 0x3e2723;
  g.fillStyle(cLight);
  g.fillRect(6, 36, 18, 8);
  g.fillStyle(cDark);
  g.fillRect(24, 36, 18, 8);
  g.fillStyle(0x1a1a1a);
  g.fillRect(14, 36, 6, 8);
  g.fillRect(15, 32, 4, 4);
  g.fillStyle(cLight);
  g.fillRect(10, 28, 14, 8);
  g.fillStyle(cDark);
  g.fillRect(24, 28, 14, 8);
  g.fillStyle(cLight);
  g.fillRect(14, 20, 10, 8);
  g.fillStyle(cDark);
  g.fillRect(24, 20, 10, 8);
  g.fillStyle(cLight);
  g.fillRect(18, 12, 6, 8);
  g.fillStyle(cDark);
  g.fillRect(24, 12, 6, 8);
  g.fillStyle(cWood);
  g.fillRect(16, 4, 4, 10);
  g.fillRect(28, 4, 4, 10);
  g.fillRect(20, 8, 8, 4);
  g.fillStyle(cWood);
  g.fillRect(10, 30, 2, 2);
  g.generateTexture("house_era1", 48, 48);

  // Эра 2 (Сруб)
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillRect(4, 40, 40, 8);
  let wBase = 0x795548;
  let wShadow = 0x4e342e;
  let wRoof = 0x3e2723;
  let wDoor = 0x212121;
  g.fillStyle(wShadow);
  g.fillRect(28, 20, 16, 20);
  g.fillStyle(0x3e2723);
  g.fillRect(28, 24, 16, 2);
  g.fillRect(28, 30, 16, 2);
  g.fillRect(28, 36, 16, 2);
  g.fillStyle(wBase);
  g.fillRect(4, 20, 24, 20);
  g.fillStyle(0x5d4037);
  g.fillRect(4, 24, 24, 2);
  g.fillRect(4, 30, 24, 2);
  g.fillRect(4, 36, 24, 2);
  g.fillStyle(wDoor);
  g.fillRect(10, 28, 10, 12);
  g.fillStyle(0x81d4fa);
  g.fillRect(32, 26, 6, 6);
  g.fillStyle(0x212121);
  g.fillRect(28, 18, 16, 2);
  g.fillStyle(wRoof);
  g.fillRect(2, 18, 28, 4);
  g.fillRect(6, 14, 20, 4);
  g.fillRect(10, 10, 12, 4);
  g.fillRect(14, 6, 4, 4);
  g.fillStyle(0x5d4037);
  g.fillRect(18, 6, 26, 4);
  g.fillRect(22, 10, 22, 4);
  g.fillRect(26, 14, 18, 4);
  g.fillRect(30, 18, 14, 4);
  g.fillStyle(0x9e9e9e);
  g.fillRect(34, 4, 6, 8);
  g.fillStyle(0x212121);
  g.fillRect(35, 4, 4, 2);
  g.generateTexture("house_era2", 48, 48);

  // Эра 3 (Средневековье)
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillRect(6, 40, 36, 8);
  let stD = 0x546e7a;
  let wP = 0xeeeeee;
  let wW = 0x4e342e;
  let rB = 0x263238;
  let rS = 0x37474f;
  g.fillStyle(0xbdbdbd);
  g.fillRect(26, 20, 14, 20);
  g.fillStyle(wW);
  g.fillRect(26, 20, 14, 2);
  g.fillRect(26, 38, 14, 2);
  g.fillRect(32, 20, 2, 20);
  g.fillStyle(wP);
  g.fillRect(6, 20, 20, 20);
  g.fillStyle(stD);
  g.fillRect(6, 36, 20, 4);
  g.fillRect(26, 36, 14, 4);
  g.fillStyle(wW);
  g.fillRect(6, 20, 20, 2);
  g.fillRect(6, 20, 2, 20);
  g.fillRect(24, 20, 2, 20);
  g.fillRect(6, 28, 20, 2);
  g.fillRect(8, 22, 2, 2);
  g.fillRect(10, 24, 2, 2);
  g.fillRect(12, 26, 2, 2);
  g.fillStyle(0x3e2723);
  g.fillRect(12, 30, 8, 10);
  g.fillRect(13, 29, 6, 2);
  g.fillStyle(0x000000);
  g.fillRect(18, 34, 2, 2);
  g.fillStyle(0x1a237e);
  g.fillRect(26, 18, 14, 2);
  g.fillStyle(wP);
  g.fillRect(6, 14, 20, 6);
  g.fillRect(10, 8, 12, 6);
  g.fillRect(14, 4, 4, 4);
  g.fillStyle(wW);
  g.fillRect(15, 6, 2, 12);
  g.fillRect(6, 18, 20, 2);
  g.fillStyle(rB);
  g.fillRect(4, 18, 4, 2);
  g.fillRect(6, 14, 4, 4);
  g.fillRect(10, 8, 4, 6);
  g.fillRect(14, 2, 4, 6);
  g.fillStyle(rS);
  g.fillRect(18, 2, 22, 4);
  g.fillRect(14, 8, 26, 6);
  g.fillRect(10, 14, 30, 4);
  g.fillRect(8, 18, 32, 2);
  g.generateTexture("house_era3", 48, 48);

  // Эра 4 (Коттедж)
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillRect(2, 40, 44, 8);
  let wallWhite = 0xf5f5f5;
  let wallSide = 0xbdbdbd;
  let glass = 0x81d4fa;
  let glassDark = 0x4fc3f7;
  let woodTrim = 0x5d4037;
  let roofDark = 0x424242;
  g.fillStyle(wallSide);
  g.fillRect(24, 24, 20, 16);
  g.fillStyle(0x757575);
  g.fillRect(28, 28, 12, 12);
  g.fillStyle(0x616161);
  g.fillRect(28, 31, 12, 1);
  g.fillRect(28, 34, 12, 1);
  g.fillRect(28, 37, 12, 1);
  g.fillStyle(wallWhite);
  g.fillRect(4, 12, 24, 28);
  g.fillStyle(glass);
  g.fillRect(8, 16, 16, 8);
  g.fillStyle(glassDark);
  g.fillRect(8, 22, 16, 2);
  g.fillStyle(0xffffff, 0.6);
  g.fillRect(10, 18, 4, 2);
  g.fillStyle(woodTrim);
  g.fillRect(8, 28, 8, 12);
  g.fillStyle(0x3e2723);
  g.fillRect(14, 34, 2, 2);
  g.fillStyle(glass);
  g.fillRect(18, 30, 6, 8);
  g.fillStyle(roofDark);
  g.fillRect(2, 10, 28, 2);
  g.fillRect(24, 22, 22, 2);
  g.generateTexture("house_era4", 48, 48);

  // Эра 5 (Киберпанк)
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillRect(6, 40, 36, 8);
  let metalDark = 0x263238;
  let metalLight = 0x37474f;
  let neonCyan = 0x00e5ff;
  let neonPink = 0xff4081;
  g.fillStyle(metalLight);
  g.fillRect(24, 12, 16, 28);
  g.fillStyle(metalDark);
  g.fillRect(8, 12, 16, 28);
  g.fillStyle(neonCyan);
  g.fillRect(8, 16, 2, 20);
  g.fillRect(38, 16, 2, 20);
  g.fillStyle(neonPink);
  g.fillRect(8, 36, 16, 2);
  g.fillRect(24, 36, 16, 2);
  g.fillStyle(0x00e5ff, 0.4);
  g.fillRect(12, 18, 8, 12);
  g.fillStyle(0xffffff);
  g.fillRect(12, 18, 2, 12);
  g.fillStyle(0x000000);
  g.fillRect(8, 10, 32, 2);
  g.fillStyle(neonCyan);
  g.fillRect(22, 2, 2, 8);
  g.fillRect(21, 2, 4, 2);
  g.generateTexture("house_era5", 48, 48);

  // ==========================================
  // 2. МОНУМЕНТЫ
  // ==========================================

  // ЭРА 1: КОСТЕР
  for (let i = 0; i < 4; i++) {
    g.clear();
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(24, 44, 36, 10);
    g.fillStyle(0x4e342e);
    g.fillRect(8, 38, 32, 6);
    g.fillRect(22, 32, 6, 18);
    g.fillRect(10, 40, 6, 6);
    g.fillRect(32, 34, 6, 6);
    g.fillStyle(0x8d6e63);
    g.fillRect(8, 38, 2, 6);
    g.fillRect(38, 38, 2, 6);
    g.fillRect(22, 32, 6, 2);
    g.fillRect(22, 48, 6, 2);
    let flicker = i % 2 === 0 ? 0 : 2;
    let hVar = i === 1 || i === 3 ? 4 : 0;
    g.fillStyle(0xd32f2f);
    g.fillRect(14, 34, 20, 8);
    g.fillRect(16 + flicker, 24, 16, 10);
    g.fillStyle(0xf57c00);
    g.fillRect(18 + flicker, 26 - hVar, 12, 12 + hVar);
    g.fillRect(20 + flicker, 18, 8, 8);
    g.fillStyle(0xffeb3b);
    g.fillRect(22 + flicker, 18 - hVar, 4, 10 + hVar);
    if (i === 0) {
      g.fillRect(18, 10, 2, 2);
      g.fillRect(28, 14, 2, 2);
    }
    if (i === 1) {
      g.fillRect(20, 8, 2, 2);
      g.fillRect(30, 12, 2, 2);
    }
    if (i === 2) {
      g.fillRect(22, 6, 2, 2);
      g.fillRect(26, 16, 2, 2);
    }
    if (i === 3) {
      g.fillRect(16, 12, 2, 2);
      g.fillRect(28, 8, 2, 2);
    }
    g.generateTexture("bonfire_f" + i, 48, 48);
    if (i === 0) g.generateTexture("monument_era1", 48, 48);
  }

  // ЭРА 2: КОЛОДЕЦ
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(24, 42, 32, 10);
  g.fillStyle(0x616161);
  g.fillRect(12, 32, 24, 12);
  g.fillRect(10, 34, 28, 8);
  g.fillStyle(0x9e9e9e);
  g.fillRect(14, 34, 4, 4);
  g.fillRect(24, 38, 4, 4);
  g.fillRect(32, 34, 4, 4);
  g.fillStyle(0x1e88e5);
  g.fillRect(14, 32, 20, 4);
  g.fillStyle(0x5d4037);
  g.fillRect(14, 16, 4, 16);
  g.fillRect(30, 16, 4, 16);
  g.fillStyle(0x3e2723);
  g.fillRect(10, 16, 28, 4);
  g.fillStyle(0x8d6e63);
  g.fillRect(8, 12, 32, 4);
  g.fillRect(12, 8, 24, 4);
  g.fillRect(16, 4, 16, 4);
  g.fillStyle(0xeeeeee);
  g.fillRect(23, 16, 2, 10);
  g.fillStyle(0x4e342e);
  g.fillRect(21, 26, 6, 6);
  g.fillStyle(0x000000);
  g.fillRect(22, 26, 4, 2);
  g.generateTexture("monument_era2", 48, 48);

  // ЭРА 3: СТАТУЯ
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(24, 44, 32, 8);
  g.fillStyle(0x757575);
  g.fillRect(8, 40, 32, 8);
  g.fillStyle(0x9e9e9e);
  g.fillRect(12, 36, 24, 4);
  g.fillStyle(0xbdbdbd);
  g.fillRect(16, 34, 16, 2);
  let cHero = 0xe0e0e0;
  let cShadow = 0x9e9e9e;
  g.fillStyle(cHero);
  g.fillRect(20, 24, 3, 10);
  g.fillRect(25, 24, 3, 10);
  g.fillStyle(cHero);
  g.fillRect(18, 14, 12, 10);
  g.fillStyle(cShadow);
  g.fillRect(20, 16, 8, 6);
  g.fillStyle(cHero);
  g.fillRect(21, 8, 6, 6);
  g.fillStyle(cShadow);
  g.fillRect(21, 8, 6, 2);
  g.fillRect(23, 10, 2, 4);
  g.fillStyle(0xffd700);
  g.fillRect(23, 16, 2, 20);
  g.fillRect(20, 16, 8, 2);
  g.fillRect(23, 12, 2, 4);
  g.generateTexture("monument_era3", 48, 48);

  // ЭРА 4: ФОНТАН
  for (let i = 0; i < 4; i++) {
    g.clear();
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(24, 42, 40, 12);
    g.fillStyle(0x9e9e9e);
    g.fillRect(4, 32, 40, 12);
    g.fillStyle(0x757575);
    g.fillRect(4, 40, 40, 4);
    g.fillStyle(0xbdbdbd);
    g.fillRect(4, 32, 40, 2);
    g.fillStyle(0x0288d1);
    g.fillRect(8, 34, 32, 6);
    g.fillStyle(0x757575);
    g.fillRect(20, 18, 8, 16);
    g.fillStyle(0x9e9e9e);
    g.fillRect(22, 18, 4, 16);
    let jetH = i === 0 ? 8 : i === 1 ? 12 : i === 2 ? 14 : 10;
    g.fillStyle(0x4fc3f7);
    g.fillRect(22, 18 - jetH, 4, jetH);
    g.fillStyle(0xffffff);
    g.fillRect(22, 18 - jetH, 4, 2);
    g.fillStyle(0x81d4fa);
    let dropY = 24 + i * 2;
    g.fillRect(16, dropY, 2, 2);
    g.fillRect(14, dropY - 4, 2, 2);
    g.fillRect(30, dropY, 2, 2);
    g.fillRect(32, dropY - 4, 2, 2);
    if (i % 2 === 0) {
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(10, 36, 6, 2);
      g.fillRect(32, 36, 6, 2);
    }
    g.generateTexture("fountain_f" + i, 48, 48);
    if (i === 0) g.generateTexture("monument_era4", 48, 48);
  }

  // === ЭРА 5: ПИКСЕЛЬНОЕ ЯДРО (НОВОЕ) ===
  for (let i = 0; i < 4; i++) {
    g.clear();

    // 1. Основание (Прямоугольное)
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(24, 44, 32, 8);
    g.fillStyle(0x212121);
    g.fillRect(12, 40, 24, 6); // Темный низ
    g.fillStyle(0x37474f);
    g.fillRect(14, 36, 20, 4); // Верх платформы

    // 2. Левитация
    let floatY = i === 0 ? 0 : i === 1 ? -2 : i === 2 ? -4 : -2;
    let y = 12 + floatY;

    // 3. Свечение (Квадратный ореол)
    let pulse = i % 2 === 0 ? 0 : 2;
    g.fillStyle(0x00e5ff, 0.3);
    g.fillRect(14 - pulse, y - pulse, 20 + pulse * 2, 20 + pulse * 2);

    // 4. Кристалл (Пиксельный ромб)
    let color = i < 2 ? 0x00e5ff : 0xe040fb; // Смена цвета
    g.fillStyle(color);

    // Рисуем ромб лесенкой
    // Центр X = 24
    g.fillRect(22, y, 4, 2); // Верх
    g.fillRect(20, y + 2, 8, 4); // Расширение
    g.fillRect(18, y + 6, 12, 8); // Середина (самая широкая)
    g.fillRect(20, y + 14, 8, 4); // Сужение
    g.fillRect(22, y + 18, 4, 2); // Низ

    // Блик на кристалле
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(22, y + 2, 2, 2);
    g.fillRect(20, y + 6, 2, 4);

    g.generateTexture("holo_f" + i, 48, 48);
    if (i === 0) g.generateTexture("monument_era5", 48, 48);
  }

  // ==================
  // 3. ЗДАНИЯ И ДЕКОР
  // ==================
  g.clear();
  g.fillStyle(0x5d4037);
  g.fillRect(0, 0, 64, 64);
  g.fillStyle(0x4caf50);
  g.fillRect(4, 4, 56, 56);
  g.fillStyle(0xe91e63);
  g.fillRect(10, 10, 8, 8);
  g.fillRect(40, 10, 8, 8);
  g.fillStyle(0xffeb3b);
  g.fillRect(10, 40, 8, 8);
  g.fillRect(40, 40, 8, 8);
  g.fillStyle(0x8d6e63);
  g.fillRect(28, 0, 8, 64);
  g.fillRect(0, 28, 64, 8);
  g.generateTexture("garden", 64, 64);
  g.clear();
  g.fillStyle(0x2e7d32);
  g.fillRect(0, 0, 64, 64);
  g.fillStyle(0x3e2723);
  g.fillRect(10, 40, 6, 12);
  g.fillStyle(0x4caf50);
  g.fillRect(4, 28, 18, 12);
  g.fillStyle(0x3e2723);
  g.fillRect(45, 10, 6, 12);
  g.fillStyle(0x4caf50);
  g.fillRect(39, 0, 18, 12);
  g.fillStyle(0x8d6e63);
  g.fillRect(20, 30, 24, 8);
  g.generateTexture("park", 64, 64);
  g.clear();
  g.lineStyle(2, 0x5d4037);
  g.beginPath();
  g.moveTo(2, 14);
  g.lineTo(14, 2);
  g.strokePath();
  g.generateTexture("stick", 16, 16);

  // ===================
  // 4. ДЕРЕВЬЯ И КАМНИ
  // ===================
  function drawLeafLayer(x, y, w, h, color) {
    g.fillStyle(color);
    g.fillRect(x + 4, y, w - 8, h);
    g.fillRect(x, y + 4, w, h - 8);
    g.fillRect(x - 4, y + h / 2 - 2, 4, 4);
    g.fillRect(x + w, y + h / 2 - 2, 4, 4);
    g.fillStyle(0xffffff, 0.15);
    let lD = Math.floor((w * h) / 25);
    for (let i = 0; i < lD; i++)
      g.fillRect(
        x + 4 + Math.random() * (w - 8),
        y + Math.random() * (h / 2),
        2,
        2
      );
    g.fillStyle(0x000000, 0.1);
    let sD = Math.floor((w * h) / 25);
    for (let i = 0; i < sD; i++)
      g.fillRect(
        x + 2 + Math.random() * (w - 4),
        y + h / 2 + Math.random() * (h / 2),
        2,
        2
      );
  }
  function createTreeTexture(key, type, trunkColor, leavesColors, hasFruit) {
    g.clear();
    g.fillStyle(0x000000, 0.2);
    let sW = type === "spruce" ? 20 : 26;
    g.fillEllipse(32, 76, sW, 8);
    g.fillStyle(trunkColor);
    let tH = type === "pine" ? 40 : 20;
    let tY = type === "pine" ? 40 : 60;
    g.fillRect(28, tY, 8, tH);
    if (type === "birch") {
      g.fillStyle(0x000000);
      g.fillRect(28, 64, 2, 2);
      g.fillRect(34, 70, 2, 2);
      g.fillRect(29, 75, 2, 2);
    }
    g.fillStyle(trunkColor);
    g.fillRect(26, 76, 12, 4);
    if (type === "spruce") {
      drawLeafLayer(12, 52, 40, 18, leavesColors[0]);
      drawLeafLayer(18, 36, 28, 16, leavesColors[1]);
      drawLeafLayer(24, 20, 16, 16, leavesColors[2]);
    } else if (type === "pine") {
      drawLeafLayer(14, 30, 36, 20, leavesColors[0]);
      drawLeafLayer(16, 16, 32, 14, leavesColors[1]);
      drawLeafLayer(22, 4, 20, 12, leavesColors[2]);
    } else if (type === "birch") {
      drawLeafLayer(16, 42, 32, 28, leavesColors[0]);
      drawLeafLayer(18, 22, 28, 20, leavesColors[1]);
      drawLeafLayer(22, 8, 20, 14, leavesColors[2]);
    } else {
      drawLeafLayer(12, 40, 40, 24, leavesColors[0]);
      drawLeafLayer(16, 24, 32, 20, leavesColors[1]);
      drawLeafLayer(22, 8, 20, 16, leavesColors[2]);
    }
    if (hasFruit) {
      let fC = type === "pine" ? 0x3e2723 : 0xe53935;
      g.fillStyle(fC);
      let ps =
        type === "pine"
          ? [
              { x: 20, y: 20 },
              { x: 40, y: 22 },
              { x: 30, y: 15 },
            ]
          : [
              { x: 20, y: 30 },
              { x: 40, y: 45 },
              { x: 30, y: 15 },
              { x: 15, y: 50 },
            ];
      ps.forEach((p) => {
        if (Math.random() > 0.4) {
          g.fillRect(p.x, p.y, 4, 4);
          g.fillStyle(0x000000, 0.2);
          g.fillRect(p.x + 2, p.y + 2, 2, 2);
          g.fillStyle(fC);
        }
      });
    }
    g.generateTexture(key, 64, 80);
  }
  createTreeTexture(
    "tree_oak",
    "round",
    0x4e342e,
    [0x1b5e20, 0x2e7d32, 0x66bb6a],
    false
  );
  createTreeTexture(
    "tree_birch",
    "birch",
    0xeeeeee,
    [0x33691e, 0x689f38, 0x8bc34a],
    false
  );
  createTreeTexture(
    "tree_spruce",
    "spruce",
    0x3e2723,
    [0x004d40, 0x00695c, 0x00796b],
    false
  );
  createTreeTexture(
    "tree_pine",
    "pine",
    0x5d4037,
    [0x1b5e20, 0x388e3c, 0x81c784],
    true
  );
  createTreeTexture(
    "tree_apple",
    "round",
    0x4e342e,
    [0x1b5e20, 0x43a047, 0x4caf50],
    true
  );

  let cD = 0x2c2c2c;
  let cB = 0x5c5c5c;
  let cL = 0x8c8c8c;
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(12, 14, 18, 6);
  g.fillStyle(cD);
  g.fillRect(2, 8, 20, 6);
  g.fillStyle(cB);
  g.fillRect(4, 6, 16, 6);
  g.fillRect(6, 4, 8, 2);
  g.fillStyle(cL);
  g.fillRect(6, 4, 6, 2);
  g.generateTexture("rock_small_1", 24, 16);
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(8, 16, 14, 6);
  g.fillStyle(cD);
  g.fillRect(2, 10, 12, 8);
  g.fillStyle(cB);
  g.fillRect(2, 6, 10, 10);
  g.fillRect(4, 2, 6, 4);
  g.fillStyle(cL);
  g.fillRect(4, 2, 4, 2);
  g.generateTexture("rock_small_2", 16, 20);
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(16, 22, 28, 8);
  g.fillStyle(cD);
  g.fillRect(4, 10, 24, 14);
  g.fillStyle(cB);
  g.fillRect(8, 4, 20, 18);
  g.fillRect(4, 14, 4, 8);
  g.fillStyle(cL);
  g.fillRect(8, 4, 16, 4);
  g.fillRect(24, 6, 4, 4);
  g.fillStyle(cD);
  g.fillRect(14, 10, 2, 6);
  g.generateTexture("rock_medium_1", 32, 24);
  g.clear();
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(18, 20, 32, 8);
  g.fillStyle(cD);
  g.fillRect(2, 12, 32, 10);
  g.fillStyle(cB);
  g.fillRect(4, 6, 28, 14);
  g.fillRect(10, 2, 16, 4);
  g.fillStyle(cL);
  g.fillRect(10, 2, 14, 2);
  g.fillRect(6, 6, 4, 4);
  g.generateTexture("rock_medium_2", 36, 24);

  // ===========================
  // 6. ПАЛЬМА И ЭЛЕМЕНТЫ ПЛЯЖА
  // ===========================
  g.clear();
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(32, 76, 24, 6);
  g.fillStyle(0x8d6e63);
  g.fillRect(28, 60, 6, 20);
  g.fillRect(30, 45, 6, 15);
  g.fillRect(34, 30, 6, 15);
  g.fillStyle(0x5d4037);
  g.fillRect(28, 64, 6, 2);
  g.fillRect(30, 50, 6, 2);
  g.fillRect(34, 35, 6, 2);
  g.fillStyle(0x3e2723);
  g.fillEllipse(34, 32, 6, 6);
  g.fillEllipse(40, 34, 6, 6);
  function dFr(sx, sy, st, cl) {
    g.fillStyle(cl);
    let x = sx,
      y = sy;
    for (let i = 0; i < st.length; i++) {
      g.fillRect(x, y, 6, 6);
      x += st[i].x;
      y += st[i].y;
    }
  }
  let cx = 37,
    cy = 30;
  let pD = 0x1b5e20,
    pB = 0x2e7d32,
    pL = 0x66bb6a;
  dFr(
    cx - 4,
    cy,
    [
      { x: -4, y: 2 },
      { x: -4, y: 4 },
      { x: -4, y: 6 },
    ],
    pD
  );
  dFr(
    cx + 4,
    cy,
    [
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 6 },
    ],
    pD
  );
  dFr(
    cx - 2,
    cy - 4,
    [
      { x: -5, y: -1 },
      { x: -5, y: 2 },
      { x: -5, y: 4 },
    ],
    pB
  );
  dFr(
    cx + 2,
    cy - 4,
    [
      { x: 5, y: -1 },
      { x: 5, y: 2 },
      { x: 5, y: 4 },
    ],
    pB
  );
  dFr(
    cx - 2,
    cy - 8,
    [
      { x: -3, y: -4 },
      { x: -4, y: -2 },
      { x: -4, y: 2 },
    ],
    pL
  );
  dFr(
    cx + 2,
    cy - 8,
    [
      { x: 3, y: -4 },
      { x: 4, y: -2 },
      { x: 4, y: 2 },
    ],
    pL
  );
  dFr(
    cx,
    cy - 10,
    [
      { x: 0, y: -5 },
      { x: -1, y: -3 },
      { x: 1, y: -2 },
    ],
    pL
  );
  g.generateTexture("tree_palm", 64, 80);

  g.clear();
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(4, 5, 6, 2);
  g.fillStyle(0xbdbdbd);
  g.fillRect(2, 2, 4, 3);
  g.generateTexture("pebble_1", 8, 8);
  g.clear();
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(4, 5, 7, 2);
  g.fillStyle(0xffe0b2);
  g.fillRect(1, 2, 6, 3);
  g.generateTexture("pebble_2", 8, 8);

  // ========
  // 7. ВОДА
  // ========
  g.clear();
  g.fillStyle(0x0d47a1);
  g.fillRect(2, 2, 8, 4);
  g.fillRect(0, 3, 2, 2);
  g.fillRect(5, 1, 2, 1);
  g.generateTexture("fish_silhouette", 12, 8);
  g.clear();
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 2, 2);
  g.generateTexture("water_splash", 2, 2);

  // ===============
  // 8. ИНСТРУМЕНТЫ
  // ===============

  // Стили инструментов по эрам: [Рукоятка, Лезвие/Голова]
  const toolStyles = [
    { h: 0x5d4037, head: 0x8d6e63 }, // Эра 1: Дерево
    { h: 0x5d4037, head: 0x9e9e9e }, // Эра 2: Камень
    { h: 0x3e2723, head: 0xb0bec5 }, // Эра 3: Железо
  ];

  // --- ТОПОРЫ И КИРКИ (ЭРЫ 1-3) ---
  for (let i = 0; i < 3; i++) {
    let s = toolStyles[i];

    // ТОПОР
    g.clear();
    g.fillStyle(s.h);
    g.fillRect(6, 10, 4, 10); // Ручка
    g.fillStyle(s.head);
    g.beginPath();
    g.moveTo(6, 10);
    g.lineTo(14, 6);
    g.lineTo(14, 14);
    g.lineTo(6, 10);
    g.fill();
    g.generateTexture("tool_axe_" + (i + 1), 16, 20);

    // КИРКА (ИСПРАВЛЕНО: Заменили кривые на линии)
    g.clear();
    g.fillStyle(s.h);
    g.fillRect(6, 8, 4, 12); // Ручка
    g.fillStyle(s.head);
    g.beginPath();
    g.moveTo(0, 6); // Левый край
    g.lineTo(8, 4); // Верхний центр (изгиб)
    g.lineTo(16, 6); // Правый край
    g.lineTo(16, 9); // Правое острие (низ)
    g.lineTo(8, 7); // Нижний центр (изгиб)
    g.lineTo(0, 9); // Левое острие (низ)
    g.fill();
    g.generateTexture("tool_pick_" + (i + 1), 16, 20);
  }

  // --- СОВРЕМЕННЫЕ ИНСТРУМЕНТЫ (ЭРА 4-5) ---
  // БЕНЗОПИЛА
  for (let f = 0; f < 2; f++) {
    g.clear();
    g.fillStyle(0xe65100); // Корпус
    g.fillRect(2, 10, 8, 6);
    g.fillStyle(0x212121); // Ручка
    g.fillRect(0, 8, 4, 4);
    g.fillStyle(0xbdbdbd); // Шина
    g.fillRect(10, 12, 12, 3);
    g.fillStyle(0x424242); // Зубья
    let offset = f === 0 ? 0 : 2;
    for (let j = 0; j < 5; j++) {
      g.fillRect(10 + j * 2 + offset, 11, 1, 1);
      g.fillRect(10 + j * 2 + offset, 15, 1, 1);
    }
    g.generateTexture("tool_chainsaw_f" + f, 24, 20);
  }

  // БУР
  for (let f = 0; f < 2; f++) {
    g.clear();
    g.fillStyle(0xfbc02d); // Корпус
    g.fillRect(2, 6, 6, 8);
    g.fillStyle(0x212121); // Ручки
    g.fillRect(0, 10, 2, 4);
    g.fillRect(8, 10, 2, 4);
    g.fillStyle(0x9e9e9e); // Сверло
    g.fillRect(4, 14, 2, 8);
    g.fillStyle(0x424242); // Спираль
    let off = f === 0 ? 0 : 2;
    g.fillRect(3, 15 + off, 4, 1);
    g.fillRect(3, 18 + off, 4, 1);
    g.generateTexture("tool_drill_f" + f, 12, 24);
  }

  // Пустышка
  if (!scene.textures.exists("tool_none")) {
    g.clear();
    g.generateTexture("tool_none", 1, 1);
  }

  // ==================
  // 9. ТЕКСТУРА СВЕТА
  // ==================

  g.clear();

  // Размер пятна света
  const size = 128;
  const steps = 5; // Количество слоев света
  const stepSize = size / 2 / steps;

  for (let i = 0; i < steps; i++) {
    // Альфа уменьшается от центра к краю (0.5 -> 0.0)
    // Делаем свет мягким (max alpha 0.4), чтобы не был белым пятном
    let alpha = 0.4 - i * (0.4 / steps);

    g.fillStyle(0xffffff, alpha);

    // Рисуем квадрат по центру. С каждым шагом он больше.
    // Начинаем с маленького яркого центра, заканчиваем большим тусклым
    // Но для стирания тьмы нам нужно наоборот: рисовать от самого большого к центру?
    // Нет, для 'erase' (ластика) чем ярче (непрозрачнее) пиксель, тем сильнее стирается тьма.

    // Рисуем вложенные квадраты:
    // Самый большой - очень прозрачный (мало стирает)
    // Самый маленький - непрозрачный (стирает полностью)

    // Рисуем "пирамидку" света
    let currentSize = size - i * stepSize * 2;
    let offset = i * stepSize;

    // Используем белый цвет. Его альфа-канал будет определять силу "стирания" тьмы.
    // Центр (i=0) должен быть самым "сильным" ластиком.
  }

  // Рисуем 4 квадрата друг на друге
  g.clear();

  // 1. Самый широкий, слабый свет (внешний ореол)
  g.fillStyle(0xffffff, 0.2);
  g.fillRect(0, 0, 128, 128);

  // 2. Средний
  g.fillStyle(0xffffff, 0.4);
  g.fillRect(16, 16, 96, 96);

  // 3. Яркий
  g.fillStyle(0xffffff, 0.6);
  g.fillRect(32, 32, 64, 64);

  // 4. Центр (самый яркий)
  g.fillStyle(0xffffff, 1.0);
  g.fillRect(48, 48, 32, 32);

  g.generateTexture("light_glow", 128, 128);

  // ==================
  // 10. ОБЛАКА
  // ==================
  const cloudColors = {
    shadow: 0x90a4ae, // Тень
    base: 0xcfd8dc, // Основа
    light: 0xffffff, // Блик
  };

  // Размер одного "пикселя" облака (чем больше, тем грубее края)
  const pxSize = 4;

  for (let i = 1; i <= 3; i++) {
    g.clear();

    // 1. Генерируем форму облака из "мета-шаров" (невидимых кругов)
    let spheres = [];
    let numSpheres = Phaser.Math.Between(4, 6);

    // Центр облака примерно 70, 40
    for (let s = 0; s < numSpheres; s++) {
      spheres.push({
        x: Phaser.Math.Between(40, 100),
        y: Phaser.Math.Between(30, 50),
        r: Phaser.Math.Between(15, 25), // Радиус шара
      });
    }

    // Хелпер: проверяет, попадает ли точка (x,y) внутрь любого из шаров
    // dx, dy - смещение всего слоя (для теней)
    // dr - изменение радиуса (для бликов, чтобы они были меньше)
    const isInside = (x, y, dx, dy, dr) => {
      for (let s of spheres) {
        let distSq = (x - (s.x + dx)) ** 2 + (y - (s.y + dy)) ** 2;
        let radSq = (s.r + dr) ** 2;
        if (distSq < radSq) return true;
      }
      return false;
    };

    // 2. Проходимся по сетке и рисуем пиксели
    // Сканируем область 140x80 с шагом pxSize
    for (let y = 0; y < 80; y += pxSize) {
      for (let x = 0; x < 140; x += pxSize) {
        // Слой 1: Тень (Смещена вниз-вправо на 4px)
        if (isInside(x, y, 4, 4, 0)) {
          g.fillStyle(cloudColors.shadow);
          g.fillRect(x, y, pxSize, pxSize);
        }

        // Слой 2: Основа (Без смещения)
        // Рисуем поверх тени
        if (isInside(x, y, 0, 0, 0)) {
          g.fillStyle(cloudColors.base);
          g.fillRect(x, y, pxSize, pxSize);
        }

        // Слой 3: Блик (Смещен вверх-влево и радиус меньше на 4px)
        // Рисуем поверх основы
        if (isInside(x, y, -2, -4, -5)) {
          g.fillStyle(cloudColors.light);
          g.fillRect(x, y, pxSize, pxSize);
        }
      }
    }

    g.generateTexture("cloud_" + i, 140, 80);
  }

  // ==================
  // 11. ДОЖДЬ
  // ==================
  g.clear();
  g.fillStyle(0x4fc3f7, 0.6); // Голубой, полупрозрачный
  g.fillRect(0, 0, 2, 8); // Длинная капля-полоска
  g.generateTexture("rain_drop", 2, 8);

  // ==================
  // 12. ЧАСТИЦА СТРОЙКИ (ДЫМ)
  // ==================
  g.clear();
  g.fillStyle(0xe0e0e0); // Светло-серый
  g.fillRect(0, 0, 6, 6);
  g.generateTexture("smoke_puff", 6, 6);

  // ==================
  // 13. КОРАБЛЬ ТОРГОВЦА
  // ==================
  g.clear();

  // 1. Тень на воде
  g.fillStyle(0x000000, 0.3);
  g.fillRect(8, 48, 48, 8); // Тень под корпусом

  // 2. Корпус (Темное дерево)
  g.fillStyle(0x3e2723);
  // Нижняя часть (Днище)
  g.fillRect(8, 36, 48, 14);
  // Нос (Справа - по ходу движения)
  g.fillRect(56, 32, 6, 14);
  g.fillRect(60, 28, 4, 8);
  // Корма (Слева)
  g.fillRect(4, 32, 4, 16);
  g.fillRect(2, 28, 4, 10);

  // 3. Палуба (Светлое дерево)
  g.fillStyle(0x5d4037);
  g.fillRect(8, 36, 48, 8); // Основная палуба

  // Бортики (Перила)
  g.fillStyle(0x4e342e);
  g.fillRect(8, 34, 48, 2); // Верхний борт
  g.fillRect(8, 44, 48, 2); // Нижний борт (визуально)

  // 4. Груз (Ящики и золото)
  g.fillStyle(0x8d6e63); // Ящик 1
  g.fillRect(14, 34, 8, 8);
  g.fillStyle(0x6d4c41); // Окантовка ящика
  g.fillRect(14, 34, 8, 2);
  g.fillRect(14, 40, 8, 2);

  g.fillStyle(0xffd700); // Золото
  g.fillRect(44, 38, 4, 4);
  g.fillStyle(0xffecb3); // Блик на золоте
  g.fillRect(45, 38, 2, 2);

  // 5. Мачта
  g.fillStyle(0x4e342e);
  g.fillRect(30, 6, 4, 34); // Столб

  // 6. Парус (Полосатый)
  // Рисуем рядами пикселей для текстуры ткани
  let sailColors = [0xffffff, 0xffffff, 0xd32f2f, 0xd32f2f]; // Белый-Красный
  let sailWidth = 36;
  let sailHeight = 24;
  let sailX = 14;
  let sailY = 8;

  for (let y = 0; y < sailHeight; y += 2) {
    // Выбираем цвет полоски (каждые 6 пикселей меняем цвет)
    let colorIdx = Math.floor(y / 6) % 2;
    g.fillStyle(colorIdx === 0 ? 0xffffff : 0xef5350); // Белый или Красный

    // Имитация изгиба паруса (он шире в середине)
    let curve = Math.sin((y / sailHeight) * Math.PI) * 4;
    g.fillRect(sailX - curve, sailY + y, sailWidth + curve * 2, 2);
  }

  // Рея (палка, на которой держится парус)
  g.fillStyle(0x3e2723);
  g.fillRect(12, 8, 40, 2);

  // 7. Декор: Щиты по борту (Викинг стиль)
  let shieldColors = [0x1565c0, 0xfbc02d]; // Синий и Желтый
  for (let i = 0; i < 4; i++) {
    g.fillStyle(shieldColors[i % 2]);
    g.fillEllipse(12 + i * 12, 44, 6, 6);
    g.fillStyle(0x000000); // Заклепка в центре
    g.fillRect(14 + i * 12, 46, 2, 2);
  }

  g.generateTexture("ship_trader", 64, 64);

  // ==================
  // 14. SECRET USA EVENT ASSETS
  // ==================

  // A. ИСТРЕБИТЕЛЬ
  // A. ИСТРЕБИТЕЛЬ (HIGH-RES PIXEL ART)
  g.clear();

  const jDark = 0x37474f; // Тень
  const jBase = 0x607d8b; // Корпус
  const jLight = 0x90a4ae; // Свет
  const jGlass = 0x4fc3f7; // Стекло
  const jFire = 0xff5722; // Огонь
  const jWhite = 0xffffff; // Ракеты/Блики

  const p = 2; // Размер пикселя (Детализация x2)

  // Хелпер для рисования по сетке
  const drawRect = (x, y, w, h, color) => {
    g.fillStyle(color);
    g.fillRect(x * p, y * p, w * p, h * p);
  };

  // --- 1. ДАЛЬНЕЕ КРЫЛО (Левое) ---
  // Рисуем "лесенкой" для плавного скоса
  for (let i = 0; i < 10; i++) {
    drawRect(20 + i, 12 + i, 14, 1, jBase); // Основа
    drawRect(20 + i, 12 + i, 2, 1, jDark); // Передняя кромка
  }

  // --- 2. ДАЛЬНИЙ ХВОСТ ---
  drawRect(6, 6, 8, 10, jDark); // Темный, т.к. в тени
  drawRect(10, 4, 4, 2, jDark); // Верхушка

  // --- 3. ФОРСАЖ (Детализированный огонь) ---
  // Верхнее сопло
  drawRect(0, 18, 6, 3, jFire);
  drawRect(1, 19, 4, 1, 0xffeb3b); // Желтое ядро
  // Нижнее сопло
  drawRect(0, 24, 6, 3, jFire);
  drawRect(1, 25, 4, 1, 0xffeb3b);

  // --- 4. КОРПУС (Фюзеляж) ---
  // Нижняя тень
  drawRect(6, 22, 40, 6, jDark);
  // Основное тело (рисуем слоями для обтекаемости)
  drawRect(6, 16, 42, 6, jBase);
  drawRect(8, 14, 38, 2, jBase); // Скругление сверху

  // --- 5. ВОЗДУХОЗАБОРНИК ---
  drawRect(16, 20, 10, 4, 0x263238); // Вход (черный)
  drawRect(14, 20, 2, 4, jLight); // Кромка

  // --- 6. КАБИНА (Обтекаемая) ---
  drawRect(34, 12, 10, 4, jGlass);
  drawRect(36, 10, 6, 2, jGlass); // Верх купола
  drawRect(36, 11, 2, 1, jWhite); // Блик
  drawRect(38, 13, 2, 1, jWhite);

  // --- 7. НОС (Длинный и острый) ---
  drawRect(48, 16, 6, 6, jBase); // Переход
  drawRect(54, 17, 6, 4, jDark); // Конус
  drawRect(60, 18, 2, 2, 0x000000); // Игла радара

  // --- 8. БЛИЖНЕЕ КРЫЛО (Правое) ---
  // Большая плоскость с "ступеньками"
  for (let i = 0; i < 12; i++) {
    let width = 24 - i;
    drawRect(24 + i, 22 + i, width, 1, jBase);
    drawRect(24 + i, 22 + i, width, 1, jLight); // Светлая кромка сверху
  }
  // Закрылки (тень сзади крыла)
  for (let i = 0; i < 12; i++) drawRect(24 + i, 23 + i, 2, 1, jDark);

  // --- 9. БЛИЖНИЙ ХВОСТ ---
  drawRect(10, 8, 8, 10, jBase);
  drawRect(10, 8, 2, 10, jLight); // Передняя кромка
  drawRect(14, 10, 4, 4, 0x37474f); // Эмблема/Деталь

  // --- 10. ВООРУЖЕНИЕ (Ракеты) ---
  // Ракета на конце крыла
  drawRect(36, 33, 10, 1, jWhite);
  drawRect(44, 33, 2, 1, 0xd32f2f); // Головка
  // Ракета под брюхом
  drawRect(26, 28, 12, 2, jWhite);
  drawRect(36, 28, 2, 2, 0xd32f2f);

  // Генерируем текстуру (Размер 128x64 - в 2 раза больше старой)
  g.generateTexture("fighter_jet", 128, 64);

  // C. ВЗРЫВ (ИСПРАВЛЕННЫЙ: ОТДЕЛЬНЫЕ КАДРЫ)
  // C. ВЗРЫВ (HIGH DETAIL VOXEL STYLE)
  // Палитра взрыва
  const exWhite = 0xffffff;
  const exYellow = 0xffeb3b;
  const exOrange = 0xff5722;
  const exRed = 0xb71c1c;
  const exSmoke = 0x37474f; // Чуть светлее для дыма

  const px = 2; // Размер пикселя (был 4, стал 2 -> больше деталей)

  // Функция рисования "шумного" круга
  // ditherChance: от 0 до 1. Чем больше, тем "рванее" края.
  const drawVoxelBlob = (cx, cy, radius, color, ditherEdge = true) => {
    g.fillStyle(color);

    for (let y = cy - radius; y <= cy + radius; y += px) {
      for (let x = cx - radius; x <= cx + radius; x += px) {
        let dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

        if (dist <= radius) {
          // Если мы на самом краю (последние 4 пикселя радиуса)
          if (ditherEdge && dist > radius - 4) {
            // Рисуем с вероятностью 60% (создаем "шум")
            if (Math.random() < 0.6) g.fillRect(x, y, px, px);
          } else {
            // Внутри рисуем сплошным цветом
            g.fillRect(x, y, px, px);
          }
        }
      }
    }
  };

  for (let i = 0; i < 5; i++) {
    g.clear();

    // Центр X=32, Низ Y=60

    if (i === 0) {
      // КАДР 1: Яркая вспышка у земли
      // Рисуем много маленьких частиц вокруг
      drawVoxelBlob(32, 54, 14, exYellow);
      drawVoxelBlob(32, 54, 8, exWhite);
    } else if (i === 1) {
      // КАДР 2: Огненный шар (расширение)
      drawVoxelBlob(32, 48, 22, exOrange);
      drawVoxelBlob(32, 46, 16, exYellow);
      drawVoxelBlob(32, 44, 8, exWhite);

      // Ударная волна (разлетающиеся пиксели по бокам)
      g.fillStyle(exWhite);
      for (let k = 0; k < 10; k++) {
        g.fillRect(10 + Math.random() * 10, 58 + Math.random() * 4, px, px);
        g.fillRect(44 + Math.random() * 10, 58 + Math.random() * 4, px, px);
      }
    } else if (i === 2) {
      // КАДР 3: ГРИБ (Объемный)
      // Ножка (Конус)
      for (let y = 40; y < 64; y += px) {
        let w = 6 + (y - 40) / 3; // Расширяется к низу
        g.fillStyle(exOrange);
        g.fillRect(32 - w, y, w * 2, px);
      }

      // Шляпка (Слои друг на друге со смещением вверх)
      drawVoxelBlob(32, 34, 26, exRed); // Тень/Края
      drawVoxelBlob(32, 30, 20, exOrange); // Основная масса
      drawVoxelBlob(32, 26, 12, exYellow); // Верхушка
      drawVoxelBlob(32, 24, 6, exWhite); // Блик
    } else if (i === 3) {
      // КАДР 4: Дым и остывание
      // Ножка стала дымом
      for (let y = 42; y < 64; y += px) {
        if (Math.random() > 0.3) {
          let w = 8 + (y - 40) / 4;
          g.fillStyle(exSmoke);
          g.fillRect(32 - w, y, w * 2, px);
        }
      }

      // Шляпка распадается на куски
      drawVoxelBlob(32, 30, 24, exSmoke); // Дымная основа
      drawVoxelBlob(26, 32, 10, exRed); // Огонь слева
      drawVoxelBlob(38, 28, 8, exOrange); // Огонь справа
      drawVoxelBlob(32, 24, 6, exRed); // Огонь сверху
    } else if (i === 4) {
      // КАДР 5: Рассеивание (Клочья дыма)
      // Рисуем много маленьких облачков вместо одного большого
      const smokePuffs = [
        { x: 32, y: 20, r: 8 },
        { x: 20, y: 30, r: 6 },
        { x: 44, y: 28, r: 7 },
        { x: 32, y: 40, r: 5 },
        { x: 18, y: 18, r: 4 },
        { x: 46, y: 36, r: 4 },
      ];

      smokePuffs.forEach((p) => {
        drawVoxelBlob(p.x, p.y, p.r, exSmoke);
      });
    }

    g.generateTexture("explosion_f" + i, 64, 64);
  }

  // D. ТЕКСТУРА ФЛАГА (ПАТТЕРН)
  g.clear();

  // 1. Белый фон
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 128, 64);

  // 2. Красные полосы
  g.fillStyle(0xb71c1c);
  // Рисуем полоски через одну
  for (let y = 0; y < 64; y += 10) {
    g.fillRect(0, y, 128, 5);
  }

  // 3. Синий угол (Кантон)
  g.fillStyle(0x0d47a1);
  g.fillRect(0, 0, 50, 36);

  // 4. Звезды (Белые точки)
  g.fillStyle(0xffffff);
  for (let y = 4; y < 32; y += 6) {
    for (let x = 4; x < 46; x += 6) {
      // Рисуем звездочку
      if ((x + y) % 5 !== 0) g.fillRect(x, y, 2, 2);
    }
  }

  g.generateTexture("flag_pattern", 128, 64);

  g.destroy();
}

