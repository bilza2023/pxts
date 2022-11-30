import Engine from "./engine/engine";
import BaseGraph from "./core/baseGraph";
import BaseGraphDb from "./core/baseGraphDb";
import IDrawable from "./core/IDrawable";

////////////////////////////////////////////////
const engine = new Engine();
////////////////////////////////////////////////
const comps: IDrawable[] = [];
// const bg = new BaseGraph(0,3000);
// comps.push(bg);
const baseGraphDb = new BaseGraphDb(0,3000,100,100,100,100,0xf20404);

// baseGraphDb.x.set(10);
// baseGraphDb.x.animate(0,10,0,90);
// baseGraphDb.height.animate(1,10,0,90);

const bg2 = new BaseGraph(baseGraphDb);
// bg2.setX(0); 
// bg2.setY(10);

comps.push(bg2);
console.log("comps",comps);

engine.setComps(comps);
engine.setDuration(60_000);
engine.start();

