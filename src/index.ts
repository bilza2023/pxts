import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import PixiEngine from "./pixiEngine";
import Rect from "./components/rect";
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
// engine.add(graf);
//---pivot is local value , its and offset i.e x - pivot.x
graf.pivot.x = 50; // width/2
graf.pivot.y = 50;
// graf.scale.x = 1;
graf.x = 400; 
graf.y = 150;

///zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
const rect = new Rect( 400, 150, 100, 100, 0x00ff00);
engine.add(rect.getDrawable());
rect.init();
rect.pivot( 2 , 2 );
// rect.getDrawable().pivot.x = 0;
// rect.getDrawable().pivot.y = 50;
// rect.x = 450; 
// rect.y = 200;

rect.update();
//////////////////////////
setInterval(function () {
    // graf.width++;
// rect.getDrawable().angle += 0.5;
// rect.getDrawable().width += 0.4;
// rect.getDrawable().height += 0.4;
// graf.angle += 0.5;
}, 20);

