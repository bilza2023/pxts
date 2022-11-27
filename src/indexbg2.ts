// import { DisplayObject, Graphics, Loader, Texture, AnimatedSprite, Sprite, utils } from "pixi.js";
import Engine from "./engine/engine";
import BaseCompDb from "./baseComps/baseCompDb";
import BaseComp from "./baseComps/baseComp";
import "./style.css";

///////////////////////////////////////////////////
const engine = new Engine(400, 300, 0x94ef99);
load();
engine.start();
///////////////////////////////////////////////
function load() {
    for (let i = 0; i < 10; i++) {
        const bcDb = new BaseCompDb(0, 100);
        bcDb.y.set(100);
        bcDb.width.set(15);
        bcDb.height.set(15);
        bcDb.color = 0x932c2c;
        // bcDb.x.set(Math.random() * 300);
        // bcDb.y.set(Math.random() * 400);
        bcDb.y.set(Math.random() * 400);
        bcDb.x.animate(0, 3, 0, 10);
        //--------------------------    
        const bc = new BaseComp(bcDb);
        engine.addComp(bc);
    }
}

// console.log("ticker", engine.app.theApp.ticker);