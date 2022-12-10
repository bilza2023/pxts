import { PixiEngine, Rect, dat } from "../pxts.js";

////////////////////////////////////////////////
const engine = new PixiEngine("bilza", 800, 300, 0xb5af6c);

//  Create a static rectangle for reference
const bgRect = new Rect(100, 100);
bgRect.x = 350;
bgRect.y = 100;
bgRect.color = 0x00ff00;
engine.add(bgRect.pixiObj);


//--The rotating Rectangle

const rect = new Rect(100, 100);
rect.color = 0xff0000;
rect.x = 350;
rect.y = 100;

rect.opacity = 0.8;

rect.pivotX = 0;
rect.pivotY = 0;
engine.add(rect.pixiObj);


//--Gui Related Code
class StateObj {
    constructor() {
        this.pivotX = 0;
        this.pivotY = 0;
        this.spin = true;
    }
}
////////////////////////////////

const state = new StateObj();
let count = 0;
const speed = 0.5;
setInterval(function () {
    count += speed;
    if (state.spin == true) {
        rect.angle = count;
    }
    // rect.originX = count;
}, 20);

///----------------------------------------------

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
///////////////////////

rectFolder.add(state, "pivotX", [0, 1, 2]).onChange(() => {
    console.log("stateObj", state.pivotX);
    //@ts-expect-error
    rect.pivotXAlign(parseInt(state.pivotX));
});

rectFolder.add(state, "pivotY", [0, 1, 2]).onChange(() => {
    console.log("stateObj", state.pivotY);
    //@ts-expect-error
    rect.pivotYAlign(parseInt(state.pivotY));
});
///////////////////////

rectFolder.add(rect, "pivotX", 0, 200).name("pivotX");
rectFolder.add(rect, "pivotY", 0, 200).name("pivotY");

rectFolder.addColor(rect, "color").name("color");
rectFolder.open();