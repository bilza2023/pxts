import { Graphics, Container, DisplayObject, Application } from "pixi.js";
// import '@pixi/graphics-extras';
import PixiEngine from "./pixiEngine";
import * as dat from "dat.gui";
import Rect from "./wrappedComps/rect";
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////

//nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
const rect = new Rect(100, 100);
rect.color(0x00ff00);
rect.x(100);
rect.y(100);
rect.width(100);
rect.height(100);
rect.setOriginX(0);
rect.setOriginY(1);
engine.add(rect.getDrawable());
///////////////////////////////////////
const rect2 = new Graphics();
rect2.beginFill(0xffffff);
rect2.drawRect(0, 0, 100, 100);
rect2.endFill();
rect2.tint = 0x0000ff;
rect2.width = 100;
rect2.height = 100;
rect2.pivot.x = 50;
rect2.pivot.y = 50;
rect2.x = 50;
rect2.y = 50;

engine.add(rect2);

//nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn

//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
let count = 0;
setInterval(function () {
    rect.angle(count++);
    // rect.width(count++);
}, 20);

//////////////////////

// const gui = new dat.GUI();

// const rectFolder = gui.addFolder("Rect");

// gui.addColor(c, "color")
//     .name("color")
//     .onChange(() => {
//         console.log("dat.gui..color changed");
//     });
