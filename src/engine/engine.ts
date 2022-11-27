import { Application , utils } from "pixi.js";
import BaseComp from "../baseComps/baseComp";
import IBaseComp from "../baseComps/IBaseComp";
import StopWatch from "./stopWatch";

///////////////////////////////////////////
export default class Engine {
stopWatch:StopWatch;
comps : IBaseComp[];
app :Application;

///////////////////////////
constructor(width :number=600 , height :number=350, backgroundColor :number=0xd3d3d3){

this.stopWatch = new StopWatch();        
utils.skipHello();
this.app = new Application({ backgroundColor,width: width,
        height: height});
this.app.stage.interactive = true

this.comps = [];
document.body.appendChild( this.app.view );
//----------------------------
window.onload = async (): Promise<void> => {
    // await loadGameAssets();
    resizeCanvas(this.app);
};
//----------------------------
// this.app.theApp.renderer.
}

addComp(comp :IBaseComp){
this.comps.push(comp);
const displayObject = comp.getDisplayObject();        
this.app.stage.addChild(displayObject);
}

start(){
this.stopWatch.start(); 
this.app.ticker.add(    this.gameLoop, this   );
}
stop(){
this.stopWatch.stop(); 
this.app.ticker.remove(   this.gameLoop , this  );
}

private gameLoop(){        
const dt = this.stopWatch.getMsDelta();
console.log("dt",dt);
if (dt > 3000) {
        this.stop();
        // debugger;
}
for (let i = 0; i < this.comps.length; i++) {
        const comp = this.comps[i];
        comp.draw( dt , this.app.screen);
}
}
////////////////
}

///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function resizeCanvas(app :Application): void {
    const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.scale.x = window.innerWidth / app.screen.width;
    app.stage.scale.y = window.innerHeight / app.screen.height;
    };
    ///////////////
    window.addEventListener("resize", resize);
    /////////////////
    resize();
}

// window.onload = async (): Promise<void> => {
//     await loadGameAssets();
    
//    
//     resizeCanvas();
//     /////////////////////////////
//     };
    

    
////////////////--loadGameAssets
// async function loadGameAssets(): Promise<void> {
//     return new Promise((res, rej) => {
        // const loader = Loader.shared;
// loader.add("rabbit", "./assets/simpleSpriteSheet.json");
// loader.add("pixie", "./assets/spine-assets/pixie.json");
        ///////////////////
// loader.add("capGuy", "./assets/capGuy/capGuy.json");

        ///////////////////
//         loader.onComplete.once(() => {
//             res();
//         });

//         loader.onError.once(() => {
//             rej();
//         });

//         loader.load();
//     });
// }
