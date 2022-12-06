import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import PixiEngine from "../pixiEngine"
import Rect from "../components/rect"
import Line from "../components/line"
import Circle from "../components/circle"
import Ellipse from "../components/ellipse"
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////
const vertical = engine.drawRect(400, 0, 2, 300, 0x00ffff);
engine.add(vertical);
const horzontal = engine.drawRect(0, 150, 800, 2, 0x00ffff);
engine.add(horzontal);

let width = 100;
const xx = 400;
let pvtX = 50;

const graphics = new Graphics();
graphics.beginFill(0xcccfff);
graphics.drawRect(xx, 100, width, 100);
graphics.endFill();
graphics.pivot.x = xx + width / 2;
////////////////////////////
engine.add(graphics);

let count = 0;
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
setInterval(() => {
    if (count < 200) { count++; }

    graphics.width = width + count;
    //when ever you chagne width you have to change x as well-why??
    graphics.x = xx;

}, 20);


