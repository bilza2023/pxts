import PixiEngine from "./pixiEngine"
import BaseGraph from "./core/baseGraph"
////////////////////////////////////////////////
const engine = new PixiEngine();
////////////////////////////////////////////////
const bg = new BaseGraph(10, 10, 100, 100);
bg.color = 0xbc1a1a;
bg.update();
const bg2 = new BaseGraph(50, 50, 100, 100);

engine.add(bg.getDrawable());
engine.add(bg2.getDrawable());
