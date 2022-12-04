import PixiEngine from "./pixiEngine"
import Rect from "./components/rect"
////////////////////////////////////////////////
const engine = new PixiEngine(800,300,0xb5af6c);
////////////////////////////////////////////////
const marker = new Rect(50, 50, 20, 20);
marker.color = 0xe5e50d; 
marker.update();
engine.add(marker.getDrawable());


const bg = new Rect(50, 50, 100, 100);
bg.color = 0xbc1a1a;
bg.update();

engine.add(bg.getDrawable());


setInterval( ()=>{
bg.x += 0.1;
bg.rotation +=1;
// bg.opacity = 10;
bg.update();
},50 );