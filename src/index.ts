import { Graphics, Container, DisplayObject, Application } from "pixi.js";
// import '@pixi/graphics-extras';
import PixiEngine from "./pixiEngine";
import * as dat from "dat.gui";
import Rect from "./wrappedComps/rect";
import Polygon from "./wrappedComps/polygon";
import Circle from "./wrappedComps/circle";
import Ellipse from "./wrappedComps/ellipse";
import RoundRect from "./wrappedComps/roundRect";
import Line from "./wrappedComps/line";
import Text from "./wrappedComps/text";
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////
const title = new Text("These are Wrapper Components", 0x0000ff, 50);
title.x = 30;
title.y = 30;
engine.add(title);
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
const poly = new Polygon();
poly.addPoint(0, 0);
poly.addPoint(100, 25);
poly.addPoint(50, 50);
poly.init();
poly.setOriginX(1);
poly.x(200);
poly.y(200);
engine.add(poly.getDrawable());
console.log(poly.getWidth());
//nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
const circle = new Circle(100);
circle.color(0xff0000);
// circle.setOrigin(0);
circle.x(400);
circle.y(200);
engine.add(circle.getDrawable());
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
const ellipse = new Ellipse(20, 10);
ellipse.color(0x00ffff);
ellipse.x(100);
ellipse.y(100);
engine.add(ellipse.getDrawable());
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
const rr = new RoundRect(80, 40);
rr.y(150);
rr.color(0x0000ff);
rr.setOriginX(1);
rr.setOriginY(1);
engine.add(rr.getDrawable());
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
const line = new Line(0, 0, 200, 100);
// line.init(0,0,300,300);
line.color(0xffff00);
engine.add(line.getDrawable());
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
let count = 0;
setInterval(function () {
    rect.angle(count++);
    poly.angle(count);
    ellipse.x(ellipse.getX() + 0.4);
    rr.x(rr.getX() + 0.3);
    rr.y(rr.getY() + 0.1);
    rr.angle(count);
    line.x(count);
    // poly.x(count++);
    // poly.y(count++);
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
