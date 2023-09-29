//npx electron-packager src ColorPicker --platform=win32 --arch=x64 --overwrite

"use strict";

const colorBox = document.getElementById("colorBox");
const dragColorBox = document.getElementById("dragColorBox");

const colorSlider = document.getElementById("colorSlider");
const dragSliderBox = document.getElementById("dragSliderBox");

const transparentSlider = document.getElementById("transparentSlider");
const tsDragSliderBox = document.getElementById("dragTransparentSliderBox");

const showDisplay = document.getElementById("frontPanel");

const colors = document.querySelectorAll(".resultCode");

const copiedSound = new Audio();
copiedSound.src = "copied.mp3";

let colorBoxDrag = false;
let sliderBoxDrag = false;
let tsSliderBoxDrag = false;

let offsetX, offsetY;
const containerSize = 275;

const maxNum = 255;

let colorX = 0;
let colorY = 0;
let sliderX = 0;
let tsSliderX = 255;

let red = maxNum;
let green = maxNum;
let blue = maxNum;

// color slider が左端の時の、r, g, b 値
// この関数の説明は、難しい
function UpdateColorBoxValue() {
  // colorX, colorY の計算(左上が (255, 255), 右下が (0, 0))
  let percent = (maxNum - colorX) / maxNum;
  // colorY px で、変動するy軸の値
  // control box が右に行くほど、y軸の幅が小さくなる。
  // 左端だと、1px で、1変動する。右端だと元が0なので動かない
  let moveY = colorY * percent;

  // 赤は、y軸に進んだ分だけ、255から引く
  red = maxNum - colorY;
  green = maxNum - colorX - moveY;
  blue = maxNum - colorX - moveY;
}

function UpdateSliderValueToColor() {
  // slider の移動による、色の変動幅
  // なぜ、red - green なのか...そういうものだから。
  let range = red - green;

  // color slider を動かした時に、どう変動するかを計算してもらう
  const convertColor = new ConvertColor(
    sliderX,
    red,
    green,
    blue,
    range,
    tsSliderX
  );

  // 取得したカラーコードで背景を塗る
  showDisplay.style.background = `${convertColor.getRGB}`;

  // カラーコードの表示
  colors[0].textContent = `${convertColor.getRGB}`;
  colors[1].textContent = `${convertColor.getRGB_C}`;
  colors[2].textContent = `${convertColor.getHex}`;
  colors[3].textContent = `${convertColor.getHex.slice(1)}`;
  colors[4].textContent = `${convertColor.getHsl}`;

  // color slider の移動による、colorBox の背景グラデーション
  const colorBoxBackground = new ConvertColor(
    sliderX,
    maxNum,
    0,
    0,
    maxNum,
    tsSliderX
  );

  const cbb = colorBoxBackground.getRGB;
  // color box の背景色を定義
  colorBox.style.background = `linear-gradient(0deg, black, transparent 85%),
            linear-gradient(245deg, ${cbb}, transparent 75%),
            linear-gradient(110deg, white, transparent 100%)`;
}

// ************* Event **************************************

colorBox.addEventListener("mousedown", (e) => {
  e.preventDefault();

  const colorBoxOffsetX = e.clientX - colorBox.getBoundingClientRect().left;
  const colorBoxOffsetY = e.clientY - colorBox.getBoundingClientRect().top;

  const x = colorBoxOffsetX - dragColorBox.offsetWidth / 2;
  const y = colorBoxOffsetY - dragColorBox.offsetHeight / 2;

  moveColorBoxToPosition(x, y);
});

function moveColorBoxToPosition(x, y) {
  // ボックスがコンテナ内に収まるように制限
  const maxX = containerSize - dragColorBox.offsetWidth;
  const maxY = containerSize - dragColorBox.offsetHeight;

  const clampedX = Math.min(Math.max(x, 0), maxX);
  const clampedY = Math.min(Math.max(y, 0), maxY);

  dragColorBox.style.left = clampedX + "px";
  dragColorBox.style.top = clampedY + "px";

  colorX = Math.floor(clampedX);
  colorY = Math.floor(clampedY);

  UpdateColorBoxValue();
  UpdateSliderValueToColor();
}

// colorSlider全体にクリックイベントを追加
colorSlider.addEventListener("mousedown", (e) => {
  e.preventDefault();
  const sliderOffsetX = e.clientX - colorSlider.getBoundingClientRect().left;

  // クリックした位置に小さなbox の中央を配置
  moveSliderBoxToPosition(sliderOffsetX - dragSliderBox.offsetWidth / 2);
});

// transparent Slider全体にクリックイベントを追加
transparentSlider.addEventListener("mousedown", (e) => {
  e.preventDefault();
  const sliderOffsetX =
    e.clientX - transparentSlider.getBoundingClientRect().left;

  // クリックした位置に小さなbox の中央を配置
  moveTsSliderBoxToPosition(sliderOffsetX - dragSliderBox.offsetWidth / 2);
});

function moveSliderBoxToPosition(sliderOffsetX) {
  // 3 は、border 分
  const maxX = colorSlider.offsetWidth - dragSliderBox.offsetWidth - 3;
  const clampedX = Math.min(Math.max(sliderOffsetX, 0), maxX);

  dragSliderBox.style.left = clampedX + "px";

  sliderX = Math.floor(clampedX);


  UpdateSliderValueToColor();
}

function moveTsSliderBoxToPosition(sliderOffsetX) {
  // 4 は、border 分
  const maxX = transparentSlider.offsetWidth - tsDragSliderBox.offsetWidth - 4;
  const clampedX = Math.min(Math.max(sliderOffsetX, 0), maxX);

  tsDragSliderBox.style.left = clampedX + "px";

  tsSliderX = maxNum - Math.floor(clampedX);


  UpdateSliderValueToColor();
}

dragColorBox.addEventListener("mousedown", (e) => {
  e.preventDefault();
  colorBoxDrag = true;
  sliderBoxDrag = false;
  tsSliderBoxDrag = false;

  offsetX = e.clientX - dragColorBox.getBoundingClientRect().left;
  offsetY = e.clientY - dragColorBox.getBoundingClientRect().top;
});

dragSliderBox.addEventListener("mousedown", (e) => {
  e.preventDefault();
  sliderBoxDrag = true;
  colorBoxDrag = false;
  tsSliderBoxDrag = false;

  offsetX = e.clientX - dragSliderBox.getBoundingClientRect().left;
});

tsDragSliderBox.addEventListener("mousedown", (e) => {
  e.preventDefault();
  tsSliderBoxDrag = true;
  sliderBoxDrag = false;
  colorBoxDrag = false;

  offsetX = e.clientX - tsDragSliderBox.getBoundingClientRect().left;
});

document.addEventListener("mousemove", (e) => {
  if (colorBoxDrag) {
    const x = e.clientX - offsetX - colorBox.getBoundingClientRect().left;
    const y = e.clientY - offsetY - colorBox.getBoundingClientRect().top;

    moveColorBoxToPosition(x, y);
  } else if (sliderBoxDrag) {
    const x = e.clientX - offsetX - colorBox.getBoundingClientRect().left;

    moveSliderBoxToPosition(x);
  } else if (tsSliderBoxDrag) {
    const x = e.clientX - offsetX - colorBox.getBoundingClientRect().left;

    moveTsSliderBoxToPosition(x);
  }
});

document.addEventListener("mouseup", () => {
  colorBoxDrag = false;
  sliderBoxDrag = false;
  tsSliderBoxDrag = false;
});

// ********** text copy Event ****************

for (const c of colors) {
  c.addEventListener("click", () => {
    if (!navigator.clipboard) {
      //  alert("このブラウザは対応していません");
      return;
    }

    navigator.clipboard.writeText(c.textContent).then(
      () => {
        copiedSound.currentTime = 0;
        copiedSound.volume = 0.3;
        copiedSound.play();

        // showDisplay.style.fontWeight = "bold";
        showDisplay.style.fontSize = `40px`;
        showDisplay.style.color = `rgb(7, 7, 7)`;
        showDisplay.style.textShadow = `1px 1px 0 #d0d0d0, -1px -1px 0 #d0d0d0`;
        showDisplay.textContent = "Copied!";
        setTimeout(() => {
          showDisplay.textContent = "";
        }, 500);
      },
      () => {
        //  console.log("sorry");
      }
    );
  });
}
