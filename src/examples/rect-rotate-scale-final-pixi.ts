import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import PixiEngine from "../pixiEngine"
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine(canvasWidth, canvasHeight, 0xb5af6c);
////////////////////////////////////////////////
const vertical = engine.drawRect(400, 0, 1, 300, 0x00ffff);
engine.add(vertical);
const horzontal = engine.drawRect(0, 150, 800, 2, 0x00ffff);
engine.add(horzontal);



//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
// const graf = engine.drawRect( 0, 0 , 100, 100 , 0xff0000 );

const graf = new Graphics();
graf.beginFill(0xff0000);
graf.drawRect(0, 0, 100, 100);
graf.endFill();
engine.add(graf);
//---pivot is local value , its and offset i.e x - pivot.x
graf.pivot.x = 50; // width/2
graf.pivot.y = 50;
// graf.scale.x = 1;
graf.x = 400;
graf.y = 150;

//////////////////////////
setInterval(function () {
    // graf.width++;
    graf.angle += 0.5;
}, 20);


