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
const vertical = engine.drawRect(400, 0, 1, 300, 0x00ffff);
engine.add(vertical);
const horzontal = engine.drawRect(0, 150, 800, 2, 0x00ffff);
engine.add(horzontal);



//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
const mainRect = new Rect(200, 150, 100, 100, 0xff0000);
mainRect.pivot(1, 1);
mainRect.init();
const mainRectPixi = mainRect.getDrawable();
engine.add(mainRectPixi);

setInterval(() => {
    mainRect.rotation += 0.5;
    mainRect.init();
}, 20);


