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
const mainRect = new Rect(400, 0, 1, 150, 0xff0000);
mainRect.pivot(0);
mainRect.init();
const mainRectPixi = mainRect.getDrawable();
engine.add(mainRectPixi);
//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
const leftRect = new Rect(400, 0, 1, 150, 0x00ff00);
leftRect.pivot(2);
leftRect.init();
const leftRectPixi = leftRect.getDrawable();
engine.add(leftRectPixi);
//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
const lowerRect = new Rect(400, 150, 1, 150, 0x00ff);
lowerRect.pivot(1);
lowerRect.init();
const lowerRectPixi = lowerRect.getDrawable();
engine.add(lowerRectPixi);
//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

setInterval(() => {
    if (mainRect.width < 400) {
        mainRect.width += 1;
        mainRect.height += 1;
    }
    mainRect.init();

    if (leftRect.width < 400) {
        leftRect.width += 1;
        leftRect.height += 1;
    }
    leftRect.init();

    if (lowerRect.width < 800) {
        lowerRect.width += 1;
    }
    lowerRect.init();
}, 20);


