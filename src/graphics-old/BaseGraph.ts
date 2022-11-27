import { Graphics } from "pixi.js";
import IComonent from "../IComonent";
////////////////////////////////////////////
export default class BaseComp implements IComonent{
graphics: Graphics;
/////////////////////////    
x: number;
y: number;
width: number;
height: number;
color: number;
alpha: number;
///////////////--border
border: number;
colorBorder: number;
alphaBorder: number;

////////////////////////////////
constructor(x: number, y: number, width: number, height: number, color: number) {
    this.graphics = new Graphics();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    //---------not set by constructor
    this.alpha = 1;
    
    this.border = 0;
    this.colorBorder = 0x000000;
    this.alphaBorder = 1;

}
//////////////////////////////////////////////
init():Graphics {
   const g = new Graphics();
   return g;
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
update (timeMs :number){

}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
protected drawBorder(graphics :Graphics){
    if (this.border > 0) {
graphics.lineStyle(this.border, this.colorBorder, this.alphaBorder);
    }
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}