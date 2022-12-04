import Engine from "./engine/engine";
import BaseGraph from "./core/baseGraph";
import BaseGraphDb from "./core/baseGraphDb";
import IDrawable from "./core/IDrawable";

/**
 * 4-dec-2022 : Rotation test of rectangle
 * 
 */

////////////////////////////////////////////////
const engine = new Engine(800,300);
////////////////////////////////////////////////
const comps: IDrawable[] = [];
// const bg = new BaseGraph(0,3000);
// comps.push(bg);
const baseGraphDb = new BaseGraphDb(0,10_000,0,0,10,10,0xf20404);
// baseGraphDb.rotation.animate(1,5,0,360 * 2);

baseGraphDb.y.set( 50 );
// baseGraphDb.x.animate(0,10,0,90);
// baseGraphDb.height.animate(1,10,0,90);

const bg2 = new BaseGraph(baseGraphDb);
// bg2.setX(0); 
// bg2.setY(10);

comps.push(bg2);
console.log("comps",comps);

engine.setComps(comps);
engine.setDuration(60_000);
// engine.start();
let xx = 0;
setInterval( ()=>{
    baseGraphDb.x.set( xx );
    xx +=1;
},100 );