import { Application,Graphics, Loader, Texture, AnimatedSprite , utils } from "pixi.js";
import Engine from "../engine/engine";
import BaseGraph from "../core/baseGraph";
import IDrawable from "../core/IDrawable";
import Duration from "../engine/duration";


export default class Bilza{
    private comps : IDrawable[];
    private duration :Duration;
    private engine :Engine;
////////////////////////////////////////
constructor(){
    this.comps =[];
    this.duration = new Duration();
}

addComp(comp :BaseGraph){
this.comps.push(comp);
const displayObject = comp.getDrawable();        
// this.app.stage.addChild(displayObject);
}

start(){
    this.engine.start();
}
stop(){
    this.engine.stop();
}

}