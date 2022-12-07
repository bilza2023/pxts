import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import PixiEngine from "./pixiEngine";
import Rect from "./components/rect";
import Ellipse from "./components/ellipse";
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////
const vertical = new Rect(400, 0, 1, 300, 0x00ffff);
vertical.init();
vertical.update();
engine.add(vertical.getDrawable());

const horzontal = new Rect(0, 150, 800, 2, 0x00ffff);
horzontal.init();
horzontal.update();
engine.add(horzontal.getDrawable());

//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
const rect = new Rect(400, 150, 100, 100, 0x00ff00);
engine.add(rect.getDrawable());
rect.init();
rect.pivot(1, 1);

rect.update();

//nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
const c = new Ellipse(0, 0, 50, 50, 0x00ffff);
c.init();
engine.add(c.getDrawable());
c.x = 100;
c.y = 100;
// c.color = 0x245399;
// c.getDrawable().tint = 0x245399;

c.update();

//////////////////////////
setInterval(function () {
    rect.angle += 0.5;
    if (rect.angle > 10) {
        rect.color = 0x245399;
    }
    rect.update();

    ////////////////////////////////
    c.x += 0.3;
    c.width += 0.3;
    c.height += 0.3;
    // c.opacity -= 0.1;
    if (c.width > 70) {
        c.color = 0xff0000;
    }
    c.update();
}, 20);
