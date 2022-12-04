import { Application, Loader, utils } from "pixi.js";
import IDrawable from "../core/IDrawable";
import StopWatch from "./stopWatch";

///////////////////////////////////////////
export default class Engine {
//--These are the components which also hold the pointer to pixi.js displayObject  object
private comps : IDrawable[];
private app :Application;
private stopWatch:StopWatch;
private duration:number;
///////////////////////////

constructor(width :number=600 , height :number=300, backgroundColor :number=0xd3d3d3){
//----------------------------
this.comps = [];
this.duration = 60_000;
this.stopWatch = new StopWatch();
//----------------------------
utils.skipHello();
this.app = new Application({ backgroundColor,width: width,
        height: height, antialias :true});
this.app.stage.interactive = true
this.app.renderer.backgroundColor = 0x061744; 
//.........................................
document.body.appendChild( this.app.view );
/////////////////////
window.onload = async (): Promise<void> => {
    // await loadGameAssets();
    resizeCanvas(this.app);
};
//----------------------------
this.commitComps(); //importantay
}
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////-------- Public API------/////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
public start(){
this.stopWatch.start(); 
this.app.ticker.add(    this.gameLoop, this   );
}
public stop(){
this.stopWatch.stop(); 
this.app.ticker.remove(   this.gameLoop , this  );
}

public setComps(comps:IDrawable[]=[]){
this.comps = comps;
this.commitComps();
}

public setDuration(durationMilliSec : number){
this.duration = durationMilliSec;
}


//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////-------- Private API------////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

private gameLoop(){        

const msDelta = this.stopWatch.getMsDelta();
console.log("msDelta:: ",msDelta);

if (msDelta > this.duration) { this.stop(); }
/////////////////////////////////////////////////////
for (let i = 0; i < this.comps.length; i++) {
        const comp = this.comps[i];
        comp.update(msDelta);
        }
}
///////////////////////////////////////////////////////////
private commitComps(){
        for (let i = 0; i < this.comps.length; i++) {
                const comp = this.comps[i];
                comp.canvasWidth = this.app.renderer.width;
                comp.canvasHeight = this.app.renderer.height;
                this.app.stage.addChild(comp.getDrawable());  
        }
}
}

///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function resizeCanvas(app :Application): void {
    const resize = () => {
    app.renderer.resize(app.renderer.width, app.renderer.height);
//     app.stage.scale.x = window.innerWidth / app.screen.width;
//     app.stage.scale.y = window.innerHeight / app.screen.height;
    };
//     const resize = () => {
//     app.renderer.resize(window.innerWidth, window.innerHeight);
//     app.stage.scale.x = window.innerWidth / app.screen.width;
//     app.stage.scale.y = window.innerHeight / app.screen.height;
//     };
    ///////////////
    window.addEventListener("resize", resize);
    /////////////////
    resize();
}


    
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
