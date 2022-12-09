import PixiEngine from "./engine/pixiEngine";
import * as dat from "dat.gui";
import Rect from "./graphComps/rect";

////////////////////////////////////////////////
const engine = new PixiEngine(800, 300, 0xb5af6c);
////////////////////////////////////////////////
const bgRect = new Rect(100, 100);
bgRect.x = 100;
bgRect.y = 100;
bgRect.color = 0x00ff00;
engine.add(bgRect);
///////////////////////////////////

const rect = new Rect(100, 100);
rect.color = 0xff0000;
rect.x = 100;
rect.y = 100;

rect.pivotX = 0;
rect.pivotY = 0;
engine.add(rect);
//sssssssssssssssssssssssssssssssssssssssssssssssssssssss
const state = {
    spin: true,
    pivotX0: () => {
        rect.pivotXAlign(0);
    },
    pivotX1: () => {
        rect.pivotXAlign(1);
    },
    pivotX2: () => {
        rect.pivotXAlign(2);
    },
    pivotY0: () => {
        rect.pivotYAlign(0);
    },
    pivotY1: () => {
        rect.pivotYAlign(1);
    },
    pivotY2: () => {
        rect.pivotYAlign(2);
    },
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

rectFolder.add(state, "pivotX0").name("pivotX0");
rectFolder.add(state, "pivotX1").name("pivotX1");
rectFolder.add(state, "pivotX2").name("pivotX2");

rectFolder.add(state, "pivotY0").name("pivotY0");
rectFolder.add(state, "pivotY1").name("pivotY1");
rectFolder.add(state, "pivotY2").name("pivotY2");

rectFolder.open();
