import { Graphics, Container, DisplayObject, Application } from "pixi.js";
// import '@pixi/graphics-extras';
import PixiEngine from "./pixiEngine";
import Rect from "./components/rect";
import Ellipse from "./components/ellipse";
import RoundRect from "./components/roundRect";
import Line from "./components/line";
import Polygon from "./components/polygon";
import * as dat from "dat.gui";
import Text from "./components/text";
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
const polygon = new Polygon(10, 10, 200, 200, 0x00ff00);
// 10, 10, 120, 100, 120, 200, 70, 200
polygon.addPoint(10, 10);
polygon.addPoint(120, 100);
polygon.addPoint(120, 200);
polygon.addPoint(70, 200);
polygon.color = 0xff0000;
polygon.init();
engine.add(polygon.getDrawable());
polygon.update();
// const line = new Graphics ();
// line.lineStyle(20, 0x000000);
// line.moveTo(100, 100);
// line.lineTo(700, 200);
// engine.add(line);

const lineObj = new Line(100, 10, 400, 200);
engine.add(lineObj.getDrawable());
lineObj.lineWidth = 20;
lineObj.color = 0xff0000;
lineObj.init();

lineObj.update();

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
//.............................
const rr = new RoundRect(500, 20, 100, 50, 0xff0000, 10);
rr.init();
engine.add(rr.getDrawable());
rr.color = 0x0000ff;
rr.update();
//////////////////////////
const text = new Text("This is from PXTS..", 0x00ff00, 24);
text.style.fill = 0x0000ff;
text.text = "Do not Mess it Up";
// text.init();
engine.add(text);
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
setInterval(function () {
    rect.update();
    c.update();
    rr.update();

    // lineObj.x += 1;
    lineObj.update();

    // polygon.points[0] += 1;
    // polygon.points[1] += 1;
    polygon.update();
    text.x += 0.1;
}, 20);

//////////////////////

const gui = new dat.GUI();

const scaleFolder = gui.addFolder("Scale");
scaleFolder.add(c, "width", 1, 500).name("width");
scaleFolder.add(c, "height", 1, 500).name("height");
scaleFolder.open();
//..
const transFolder = gui.addFolder("Transition");

transFolder.add(c, "x", 0, 800).name("x");
transFolder.add(c, "y", 0, 300).name("y");

gui.add(c, "angle", 0, 360).name("rotate");

// gui.add(polygon, "points[0]", 0, 360).name("point");

gui.addColor(c, "color")
    .name("color")
    .onChange(() => {
        console.log("dat.gui..color changed");
    });

const lineFolder = gui.addFolder("line");
lineFolder.open();
lineFolder.add(lineObj, "x", 1, 800);
lineFolder.add(lineObj, "y", 1, 300);
lineFolder.add(lineObj, "x2", 1, 800);
lineFolder.add(lineObj, "y2", 1, 300);
/////////////////////////////////////////
const textFolder = gui.addFolder("Text");
textFolder.open();
textFolder.add(text, "text");
textFolder.add(text.style, "fill");
textFolder.add(text.style, "fontSize", 5, 300);
// textFolder.add(text, "style.fontSize" ,5,100);
