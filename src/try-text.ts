import { PixiEngine, Text,dat } from "./index";

////////////////////////////////////////////////
const engine = new PixiEngine("bilza", 800, 300, 0xb5af6c);
////////////////////////////////////////////////
////////////////////////////////////////////////
// const bgRect = new Rect(100, 100);
// bgRect.x = 350;
// bgRect.y = 100;
// bgRect.color = 0x00ff00;
// engine.add(bgRect.pixiObj);
///////////////////////////////////
const text = new Text("Welcome to PXTS",0xffff00,200);
engine.add(text.pixiObj);

 

const gui = new dat.GUI();

const rectFolder = gui.addFolder("Rect Component");
rectFolder.add(text, "text", "Welcome").name("angle Value").listen();
rectFolder.add(text, "x", 0, 800).name("x");
rectFolder.add(text, "y", 0, 400).name("y");
rectFolder.add(text, "width", 1, 1200).name("width");
rectFolder.add(text, "height", 1, 500).name("height");
rectFolder.add(text, "opacity", 0, 1).name("opacity");
rectFolder.add(text, "angle", 0, 360).name("angle");
rectFolder.add(text, "angle", 0, 360).name("angle Value").listen();
///////////////////////
rectFolder.add(text.style, "fontSize", 0, 200).name("fontSize").listen();

rectFolder.addColor(text, "color").name("color");
rectFolder.open();
