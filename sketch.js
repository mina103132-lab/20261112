// 宣告變數以儲存各種圖片精靈檔案
let stopSprite, walkSprite, magicSprite, magicEffectSprite;

// === 角色 1：「站立/停止」狀態參數 (12張, 1663x212, 橫向) ===
let stopTotalFrames = 12;
let stopSheetWidth = 1663;
let stopSheetHeight = 212;
let stopFrameWidth, stopFrameHeight;
let stopCurrentFrame = 0;

// === 角色 1：「走路」狀態參數 (9張, 1246x198, 橫向) ===
let walkTotalFrames = 9;
let walkSheetWidth = 1246;
let walkSheetHeight = 198;
let walkFrameWidth, walkFrameHeight;
let walkCurrentFrame = 0;

// === 角色 1：「施法魔法」狀態參數 (4張, 1039x146, 橫向) ===
let magicTotalFrames = 4;
let magicSheetWidth = 1039;
let magicSheetHeight = 146;
let magicFrameWidth, magicFrameHeight;
let magicCurrentFrame = 0;

// === 魔法特效參數 (5張, 740x19, 橫向) ===
let effectTotalFrames = 5;
let effectSheetWidth = 740;
let effectSheetHeight = 19;
let effectFrameWidth, effectFrameHeight;
let effectCurrentFrame = 0;

// === 動畫與載入控制變數 ===
let frameDelay = 6;            // 動畫播放速度
let imgLoadedCount = 0;        // 記錄已載入圖片數量
let totalImagesToLoad = 4;     // 總共需載入 4 張圖片精靈
let isLoaded = false;          // 是否全部載入完成

// === 角色與特效狀態變數 ===
let charX;                     // 角色 1 的 X 軸位置
let moveSpeed = 4;             // 移動速度
let currentAction = "stop";    // 目前狀態："stop", "walk", "magic"
let facingDirection = 1;       // 朝向：1=右, -1=左

// 魔法特效物件變數（用來管理發射出去的特效）
let activeEffect = null; 

// 預載入函式：在程式啟動前載入所有圖片資源（已修正為你資料夾中的正確路徑與檔名）
function preload() {
  stopSprite = loadImage('1/stop/stop.png', () => { checkImagesLoaded(); }, (err) => { console.error("stop.png 載入失敗", err); });
  walkSprite = loadImage('1/walk/walk.png', () => { checkImagesLoaded(); }, (err) => { console.error("walk.png 載入失敗", err); });
  magicSprite = loadImage('1/magic1/magic1.png', () => { checkImagesLoaded(); }, (err) => { console.error("magic1.png 載入失敗", err); });
  magicEffectSprite = loadImage('1/magic1_effect/magic1_effect.png', () => { checkImagesLoaded(); }, (err) => { console.error("magic1_effect.png 載入失敗", err); });
}

// 檢查圖片載入進度
function checkImagesLoaded() {
  imgLoadedCount++;
  if (imgLoadedCount >= totalImagesToLoad) {
    isLoaded = true;
    console.log("所有圖片精靈載入成功！");
  }
}

// 初始化設定函式
function setup() {
  createCanvas(windowWidth, windowHeight);
  charX = width * (2 / 3);

  // 計算各精靈的單一影格寬高
  stopFrameWidth = stopSheetWidth / stopTotalFrames;
  stopFrameHeight = stopSheetHeight;

  walkFrameWidth = walkSheetWidth / walkTotalFrames;
  walkFrameHeight = walkSheetHeight;

  magicFrameWidth = magicSheetWidth / magicTotalFrames;
  magicFrameHeight = magicSheetHeight;

  effectFrameWidth = effectSheetWidth / effectTotalFrames;
  effectFrameHeight = effectSheetHeight;

  imageMode(CENTER);
}

// 主繪圖迴圈函式
function draw() {
  drawFightingBackground();

  if (!isLoaded) {
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("正在載入圖片精靈檔案，請檢查路徑...", width / 2, height / 2);
    return;
  }

  let displayHeight = height / 3;
  let currentImg, frameW, frameH, currentFrame, totalFrames;

  // === 根據目前動作狀態切換對應的圖片與邏輯 ===
  if (currentAction === "magic") {
    currentImg = magicSprite;
    frameW = magicFrameWidth;
    frameH = magicFrameHeight;
    currentFrame = floor(magicCurrentFrame); // 確保影格為整數
    totalFrames = magicTotalFrames;

    // 播放魔法動畫：每隔幾幀推進一次影格
    if (frameCount % frameDelay === 0) {
      magicCurrentFrame++;
      // 當 4 張圖片播放完畢（達到最後一張）
      if (magicCurrentFrame >= magicTotalFrames) {
        magicCurrentFrame = 0;
        // 施法動作結束，切回站立狀態
        currentAction = "stop";

        // === 施法完成瞬間：在角色前方產生魔法特效 ===
        activeEffect = {
          x: charX + (facingDirection * (displayHeight * 0.3)), // 產生在角色前方
          y: height - (displayHeight / 2),                     // 高度對齊角色中心
          direction: facingDirection,                          // 紀錄特效飛行方向
          speed: 8                                             // 特效飛行速度
        };
      }
    }
  } else if (currentAction === "walk") {
    currentImg = walkSprite;
    frameW = walkFrameWidth;
    frameH = walkFrameHeight;
    currentFrame = walkCurrentFrame;
    totalFrames = walkTotalFrames;

    // 處理左右移動與邊界限制
    if (keyIsDown(RIGHT_ARROW)) {
      charX += moveSpeed;
      facingDirection = 1;
      if (charX > width) charX = width;
    } else if (keyIsDown(LEFT_ARROW)) {
      charX -= moveSpeed;
      facingDirection = -1;
      if (charX < 0) charX = 0;
    }

    // 動畫影格推進
    if (frameCount % frameDelay === 0) {
      walkCurrentFrame = (walkCurrentFrame + 1) % walkTotalFrames;
    }
  } else {
    // 預設為站立狀態 "stop"
    currentImg = stopSprite;
    frameW = stopFrameWidth;
    frameH = stopFrameHeight;
    currentFrame = stopCurrentFrame;
    totalFrames = stopTotalFrames;

    // 動畫影格推進
    if (frameCount % frameDelay === 0) {
      stopCurrentFrame = (stopCurrentFrame + 1) % stopTotalFrames;
    }
  }

  // 計算顯示寬度與高度比例
  let scaleRatio = displayHeight / frameH;
  let displayWidth = frameW * scaleRatio;
  let charY = height - (displayHeight / 2);
  let srcX = currentFrame * frameW;

  // === 繪製角色 1 ===
  push();
  translate(charX, charY);
  scale(facingDirection, 1);
  image(currentImg, 0, 0, displayWidth, displayHeight, srcX, 0, frameW, frameH);
  pop();

  // === 處理與繪製魔法特效 ===
  if (activeEffect !== null) {
    // 特效依據方向移動
    activeEffect.x += activeEffect.speed * activeEffect.direction;

    // 檢查特效是否超出畫布邊界（右端或左端），超出則銷毀消失
    if (activeEffect.x > width || activeEffect.x < 0) {
      activeEffect = null; // 移除特效
    } else {
      // 計算特效顯示大小（依畫面比例調整）
      let effectDisplayH = height / 6; // 特效高度為畫布的 1/6
      let effectScale = effectDisplayH / effectFrameHeight;
      let effectDisplayW = effectFrameWidth * effectScale;
      let effectSrcX = floor(effectCurrentFrame) * effectFrameWidth;

      // 繪製特效
      push();
      translate(activeEffect.x, activeEffect.y);
      scale(activeEffect.direction, 1); // 讓特效跟隨角色方向翻轉
      image(
        magicEffectSprite,
        0,
        0,
        effectDisplayW,
        effectDisplayH,
        effectSrcX,
        0,
        effectFrameWidth,
        effectFrameHeight
      );
      pop();

      // 特效自身的動畫播放更新
      if (frameCount % 3 === 0) {
        effectCurrentFrame = (effectCurrentFrame + 1) % effectTotalFrames;
      }
    }
  }
}

// 鍵盤按下事件
function keyPressed() {
  // 當按下空白鍵 (32)，且目前不是在施法中，則觸發魔法攻擊
  if (key === ' ' && currentAction !== "magic") {
    currentAction = "magic";
    magicCurrentFrame = 0; // 重置魔法動畫從第 0 張開始
  } 
  // 當按下左右方向鍵
  else if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    // 只有在非施法狀態下才能切換為走路
    if (currentAction !== "magic") {
      currentAction = "walk";
    }
  }
}

// 鍵盤放開事件
function keyReleased() {
  // 當放開左右鍵時，且目前不是在施法狀態，恢復為站立
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    if (!keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
      if (currentAction !== "magic") {
        currentAction = "stop";
      }
    }
  }
}

// 自訂函式：繪製格鬥遊戲背景
function drawFightingBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let bgColor = lerpColor(color(20, 12, 28), color(85, 20, 25), inter);
    stroke(bgColor);
    line(0, y, width, y);
  }

  noStroke();
  fill(230, 80, 30, 160);
  ellipse(width * 0.35, height * 0.45, width * 0.25, width * 0.25);

  fill(15, 10, 20);
  rect(0, height * 0.55, width * 0.2, height * 0.45);
  rect(width * 0.18, height * 0.48, width * 0.15, height * 0.52);
  rect(width * 0.75, height * 0.52, width * 0.25, height * 0.48);

  let floorY = height * 0.88;
  fill(35, 30, 35);
  rect(0, floorY, width, height - floorY);

  stroke(220, 60, 40);
  strokeWeight(4);
  line(0, floorY, width, floorY);
  strokeWeight(1);
}

// 視窗大小改變時自適應調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}