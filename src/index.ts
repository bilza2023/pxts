import {Graphics} from "pixi.js";
import PixiEngine from "./pixiEngine"
import Rect from "./components/rect"
import Line from "./components/line"
import Circle from "./components/circle"
////////////////////////////////////////////////
<<<<<<< HEAD
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
=======
const canvasWidth = 800;
const canvasHeight = 300;
const engine = new PixiEngine( canvasWidth , canvasHeight ,0xb5af6c);
////////////////////////////////////////////////
const marker = new Rect(300, 40, 30, 30);
marker.color = 0xe5e50d; 
marker.init();
// marker.update();
engine.add(marker.getDrawable());
>>>>>>> bilza_cairo


/////////////////////////////////////////////////////////
const circle = new Circle(200,200,50, 0x00ffff);
circle.init();
engine.add(circle.getDrawable());

/////////////////////////////////////////////////////////
var line = new Line(0,50, 600,50);
line.lineWidth = 2;
// line.color = 0x04ff00;
line.init();
// line.lineStyle(1, 0xff0000);
// line.moveTo(0,window.innerHeight/2);
// line.lineTo(window.innerWidth/2, 0);
// line.lineTo(window.innerWidth, window.innerHeight/2);
engine.add(line.getDrawable());  
/////////////////////////////////////////////////////////


const bg = new Rect(100, 40, 100, 100);
bg.color = 0xbc1a1a;
bg.align(1,1);
// bg.align(2,2);
bg.init();

engine.add(bg.getDrawable());

let angle = 0;
setInterval( ()=>{
bg.rotation = angle ++;
bg.update(); 
circle.x = angle;
circle.update(); 
// bg.opacity = 10;
// bg.update();
},50 );
