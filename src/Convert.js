"use strict";

class ConvertColor {
  constructor(sliderX, r, g, b, range, transparent) {
    this.max = 255;
    this.sliderX = sliderX;

    this.red = r;
    this.green = g;
    this.blue = b;
    this.transparent = transparent;

    this.getRGB;
    this.getRGB_C;
    this.getHex;
    this.getHsl;

    this.setColor;

    // 1つのsectionのpx (section は6個ある 今回は、42.5px)
    this.sectionPx = this.max / 6;
    // 1つのsectionで、数値の変動幅(42.5px間で変動する数値)
    this.sectionRangeNum = range;
    // 1px で変動する数値
    this.pxMoveNum = this.sectionRangeNum / this.sectionPx;
    // 小さな box left が何番目のsectionにあるか(0 ~ 5)
    this.sectionNumber = Math.floor(this.sliderX / this.sectionPx);
    // そのsectionのどの位置か(px)
    this.sliderPointPx = this.sliderX - this.sectionPx * this.sectionNumber;
    // 端数値(数値)
    this.fractionNum = this.sliderPointPx * this.pxMoveNum;

    this.update();
  }

  // color picker のスライダーを横に動かすと、6種類のactionが発生する。
  // 0: Gが上がる, 1: Rが下がる, 2: B が上がる, 3: Gが下がる, 4: Rが上がる, 5: Bが下がる
  ConvertCoordinatesToColor() {
    switch (this.sectionNumber) {
      case 0:
        // green up
        this.green += this.fractionNum;
        break;
      case 1:
        // red down
        this.green += this.sectionRangeNum;
        this.red -= this.fractionNum;
        break;
      case 2:
        // blue up
        this.green += this.sectionRangeNum;
        this.red -= this.sectionRangeNum;
        this.blue += this.fractionNum;
        break;
      case 3:
        // green down
        this.red -= this.sectionRangeNum;

        this.green += this.sectionRangeNum - this.fractionNum;

        this.blue += this.sectionRangeNum;
        break;
      case 4:
        // red up
        this.red += this.fractionNum - this.sectionRangeNum;

        // this.green += 0;
        this.blue += this.sectionRangeNum;

        break;
      case 5:
        // blue down

        // this.red += 0;
        // this.green += 0;
        this.blue += this.sectionRangeNum - this.fractionNum;
        break;

      default:
        break;
    }

    let r = Math.floor(this.red);
    let g = Math.floor(this.green);
    let b = Math.floor(this.blue);

    this.getRGB = this.ConvertRGB(r, g, b);

    this.getRGB_C = this.ConvertRGB_C(r, g, b);

    this.getHex = this.ConvertHex([r, g, b, this.transparent]);

    this.getHsl = this.ConvertHsl(r, g, b);
  }

  ConvertRGB(r, g, b) {
    if (this.transparent === this.max) {
      this.setColor = `rgb(${r}, ${g}, ${b})`;
    } else {
      let ts = (this.transparent / 255).toFixed(2);
      this.setColor = `rgba(${r}, ${g}, ${b}, ${ts})`;
    }

    return this.setColor;
  }

  ConvertRGB_C(r, g, b) {
    if (this.transparent === this.max) {
      this.setColor = `${r}, ${g}, ${b}`;
    } else {
      let ts = (this.transparent / 255).toFixed(2);
      this.setColor = `${r}, ${g}, ${b}, ${ts}`;
    }

    return this.setColor;
  }

  ConvertHex(rgba) {
    let clrStrings = [];

    for (const clr of rgba) {
      const s = clr.toString(16);
      if (s.length === 1) {
        clrStrings.push(s.padStart(2, "0"));
      } else {
        clrStrings.push(s);
      }
    }

    if (this.transparent === this.max) {
      this.getHex = `#${clrStrings[0]}${clrStrings[1]}${clrStrings[2]}`;
    } else {
      this.getHex = `#${clrStrings[0]}${clrStrings[1]}${clrStrings[2]}${clrStrings[3]}`;
    }

    return this.getHex;
  }

  ConvertHsl(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // gray
    } else {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      switch (max) {
        case r:
          h = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }

      h *= 60; // 0-360の角度に変換
    }

    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    if (this.transparent === this.max) {
      this.setColor = `hsl(${h}, ${s}%, ${l}%)`;
    } else {
      //
      let ts = Math.floor((100 / this.max) * this.transparent);
      this.setColor = `hsla(${h}, ${s}%, ${l}%, ${ts}%)`;
    }

    return this.setColor;
  }

  update() {
    this.ConvertCoordinatesToColor();
  }
}
