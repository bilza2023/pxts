import { PixiEngine,dat,Rect,Pixi } from "../pxts.js";

////////////////////////////////////////////////
const engine = new PixiEngine("bilza", 1000, 400, 0xb5af6c);

//  Create a static rectangle for reference
const bgRect = new Rect(100, 100);
bgRect.x = 350;
bgRect.y = 100;
bgRect.color = 0x00ff00;
engine.add(bgRect.pixiObj);


//--Gui Related Code
const state =  {
count :0,
speed :0.5,        
spin :true,
anchorX :0,
anchorY :0,
backgroundColor : 0xcccccc        
};
////////////////////////////////
//--The rotating Rectangle

const rect = new Pixi.Sprite(Pixi.Texture.WHITE);
rect.tint = 0xff0000;
rect.x = 350;
rect.y = 100;
rect.width = 100;
rect.height = 100;
rect.alpha = 0.8;
rect.anchor.x = state.anchorX;
rect.anchor.y = state.anchorY;
engine.add(rect);

////////////////////////////////

setInterval(function () {
    state.count += state.speed;
    if (state.spin == true) {
        rect.angle = state.count;
    }
}, 20);

///----------------------------------------------

const gui = new dat.GUI();

gui.add(rect, "x", 1, 1000).name("x");
gui.add(rect, "y", 1, 500).name("y");
gui.add(rect, "width", 1, 1000).name("width");
gui.add(rect, "height", 1, 500).name("height");
gui.add(rect, "alpha", 0, 1).name("opacity");
gui.add(rect, "angle", 0, 360).name("angle");
gui.add(rect, "angle", 0, 360).name("angle Value").listen();

gui.add(state, "anchorX", 0, 100).name("anchorX")
.onChange( ( )=>{
    rect.anchor.x = state.anchorX/100;
});

gui.add(state, "anchorY", 0, 100).name("anchorY")
.onChange( ( )=>{
    rect.anchor.y = state.anchorY/100;
});

gui.add(state, "spin").name("Animation");
gui.addColor(rect, "tint").name("Color");

gui.addColor(state, "backgroundColor").name("backgroundColor")
.onChange( ( )=>{
    engine.backgroundColor(state.backgroundColor);
});

gui.open();