import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import PixiEngine from "./pixiEngine";
import Rect from "./components/rect";
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////
const vertical = new Rect(400, 0, 1, 300, 0x00ffff);
vertical.init();
engine.add(vertical.getDrawable());
const horzontal = new Rect(0, 150, 800, 2, 0x00ffff);
horzontal.init();
engine.add(horzontal.getDrawable());

//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
const rect = new Rect( 400, 150, 100, 100, 0x00ff00);
engine.add(rect.getDrawable());
rect.init();
rect.pivot( 1 , 1 );

rect.update();
//////////////////////////
setInterval(function () {
rect.angle += 0.5;

rect.update();
}, 20);

