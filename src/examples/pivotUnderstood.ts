import { Graphics, Container, DisplayObject, Application } from "pixi.js";
// import '@pixi/graphics-extras';
import PixiEngine from "../pixiEngine";
import * as dat from "dat.gui";
import Rect from "../inheretedComps/rect";
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////

//nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
const rect = new Rect();
rect.tint = 0x00ff00;
rect.x = 100;
rect.y = 100;
rect.width = 100;
rect.height = 100;
engine.add(rect);

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
setInterval(function () {
    rect2.angle += 0.2;
}, 20);

//////////////////////

const gui = new dat.GUI();

const rectFolder = gui.addFolder("Rect");
rectFolder.add(rect2, "x", 0, 800).name("x");
rectFolder.add(rect2, "y", 0, 300).name("y");
rectFolder.add(rect2, "width", 1, 800).name("width");
rectFolder.add(rect2, "height", 1, 300).name("height");
rectFolder.add(rect2, "tint").name("tint");
rectFolder.add(rect2, "angle", 0, 360).name("angle").listen();
rectFolder.add(rect2, "alpha", 0, 1).name("alpha");
rectFolder.add(rect2.pivot, "x", 0, 100).name("pivot.x");
rectFolder.add(rect2.pivot, "y", 0, 100).name("pivot.y");

rectFolder.open();

// gui.addColor(c, "color")
//     .name("color")
//     .onChange(() => {
//         console.log("dat.gui..color changed");
//     });
