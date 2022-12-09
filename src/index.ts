import PixiEngine from "./engine/pixiEngine";
import * as dat from "dat.gui";
import Rect from "./graphComps/rect";

////////////////////////////////////////////////
const engine = new PixiEngine(800, 300, 0xb5af6c);
////////////////////////////////////////////////

const rect = new Rect(100, 100);
rect.color = 0x00ff00;
rect.x = 100;
rect.y = 100;
rect.width = 100;
rect.height = 100;
// rect.
rect.originX = 50;
rect.originY = 50;
engine.add(rect);
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
const state = {
    spin: true,
};
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
let count = 0;
const speed = 0.5;
setInterval(function () {
    count += speed;
    if (state.spin == true) {
        rect.angle = count;
    }
    // rect.originX = count;
}, 20);

//////////////////////

const gui = new dat.GUI();

const rectFolder = gui.addFolder("Rect Component");
rectFolder.add(rect, "x", 1, 900).name("x");
rectFolder.add(rect, "y", 1, 400).name("y");
rectFolder.add(rect, "width", 1, 500).name("width");
rectFolder.add(rect, "height", 1, 500).name("height");
rectFolder.add(rect, "opacity", 0, 1).name("opacity");
rectFolder.add(rect, "angle", 0, 360).name("angle");
rectFolder.add(rect, "angle", 0, 360).name("angle Value").listen();
rectFolder.add(state, "spin").name("Animation");
rectFolder.addColor(rect, "color").name("color");
// rectFolder.add(rect, "originX", 0, 50).name("originX");
// rectFolder.add(rect, "originY", 0, 50).name("originY");

rectFolder.open();
