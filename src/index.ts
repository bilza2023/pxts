import {Graphics,Container,DisplayObject} from "pixi.js";
import PixiEngine from "./pixiEngine"
import Rect from "./components/rect"
import Line from "./components/line"
import Circle from "./components/circle"
import Ellipse from "./components/ellipse"
////////////////////////////////////////////////
const canvasWidth = 800;
const canvasHeight = 300;
const color = 0x00ffff;
const engine = new PixiEngine( canvasWidth , canvasHeight ,0xb5af6c);
////////////////////////////////////////////////


const vertical  = drawRect( 400, 0, 2 ,300, 0x00ffff);
const horzontal = drawRect( 0 , 150 , 800 ,2, 0x00ffff);

let width = 100;
let xx = 400;
let pvtX = 50;

const graphics  = new Graphics();
graphics.beginFill(0xcccfff);
graphics.drawRect( xx, 100 , width, 100 );
graphics.endFill();
graphics.pivot.x = xx + width/2;

engine.add(graphics);

let count = 0;
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
setInterval( ( )=>{
    if (count < 200){
        count++;
        width++;
        pvtX++;
        // xx++;
    }

    graphics.width = width + count;
    // graphics.pivot.x = pvtX ;
    // graphics.x = xx + count ;
    graphics.x = xx ;

    console.log("width", graphics.width );
    console.log("pivot.x", graphics.pivot.x );
    console.log("x", graphics.x );

    // graphics.x = graphics.width;
    // graphics.pivot.x = graphics.width;
    
},20);


function drawRect (x :number,y :number,width :number,height :number,color :number) {
const graphics  = new Graphics();
graphics.beginFill(color);
graphics.drawRect( x, y , width, height );
graphics.endFill();
engine.add(graphics);
}