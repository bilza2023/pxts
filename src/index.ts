import Engine from "./engine/engine";
import BaseGraph from "./core/baseGraph";
import IDrawable from "./core/IDrawable";

////////////////////////////////////////////////
const engine = new Engine();
////////////////////////////////////////////////
const comps: IDrawable[] = [];
// const bg = new BaseGraph(0,3000);
// comps.push(bg);

const bg2 = new BaseGraph(0,3000,20,20,30,100,0xf20404);
bg2.setX(0); 
bg2.setY(10);

comps.push(bg2);


engine.setComps(comps);
engine.setDuration(60_000);
engine.start();

