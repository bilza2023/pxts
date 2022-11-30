import Engine from "./engine/engine";
import BaseGraph from "./core/baseGraph";

const engine = new Engine(800,350);
const bg = new BaseGraph();
engine.addComp(bg);

engine.start();

