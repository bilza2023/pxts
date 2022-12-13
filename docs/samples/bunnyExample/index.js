import { PixiEngine,Pixi,dat } from "../pxts.js";
/////////////////////////////////////////////////
const en = new PixiEngine("bilza", 800, 400, 0x4c101b);

const app = en.getApp();
//------------------------------
app.loader
.add("bunny", "../../assets/bunny.png")
.load(setup);
////////////////////////////////////
    const state = {
        count : 1000,
        // exponential : 10,
        minX : 0 ,
        maxX  : 800,
        minY : 0 ,
        maxY : 400,
};
//..
function setup() {
    //--celar old
    en.destroy();

    for (let i = 0; i < state.count; i++) {
const bunny = new Pixi.Sprite(en.getTexture("bunny"));
bunny.x = state.minX + Math.floor( Math.random() * state.maxX );
bunny.y = state.minY + Math.floor( Math.random() * state.maxY );
en.add(bunny);
    }
}


//////////////--GUI--/////////////////////
const gui = new dat.GUI();

gui.add(state,"count", 1 , 2000).name("numberOfLines")
.onChange(() => {
    setup()
});

gui.add(state,"minX", 0 , 800).name("minX1")
.onChange(() => {
    setup()
});

gui.add(state,"maxX", 0 , 800).name("maxX1")
.onChange(() => {
    setup()
});

gui.add(state,"minY", 0 , 400).name("minY1")
.onChange(() => {
    setup()
});

gui.add(state,"maxY", 0 , 400).name("maxY1")
.onChange(() => {
    setup()
});

///////////////////////////
gui.open();
