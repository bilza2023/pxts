import { PixiEngine,Pixi } from "./index.js";


const en = new PixiEngine("bilza", 800, 400, 0xb5af6c);
en.backgroundColor(0x4c101b);

const app = en.getApp();



app.loader
.add("bunny", "assets/bunny.png")
.load(setup);

////////////////////////////////////
function setup() {

for (let i = 0; i < 100; i++) {
const bunny = new Pixi.Sprite(en.getTexture("bunny"));
bunny.x = Math.floor( Math.random() * 800 );
bunny.y = Math.floor( Math.random() * 400 );
en.add(bunny);
}

}

