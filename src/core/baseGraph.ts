import {Rectangle, DisplayObject, Graphics } from "pixi.js";
import IDrawable from "./IDrawable";

/////////////////////////////////////////////
export default class BaseGraph implements IDrawable {
    private graphics : Graphics;
    public  readonly id: string;

    public startTime: number;
    public endTime: number;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public color: number;
    
/////////////////////////////////////////
constructor(x :number=0,y :number=0,width :number=50,height :number=50,color :number =0xde3249) {
    this.startTime =0;
    this.endTime = 3000;
    this.id = Math.random().toString(36).slice(2);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
/////////////////////////////
this.graphics = new Graphics();
this.graphics.beginFill(this.color);
this.graphics.drawRect(x, y, width, height);
this.graphics.endFill();   
}

setX(x:number){
this.graphics.x = x;
}

getDrawable():DisplayObject{
    return this.graphics;
}
update( timeMs :number ):void {

    
}
qualifyToDraw(timeMs :number):boolean{
    if (timeMs >= this.startTime){
            if (timeMs < this.endTime){
                return true;
            }else {
                return false;
            }
    }else {
        return false;
    }
}

expired(timeMs :number):boolean{
    if (timeMs > this.endTime){
        return true;
    }else {
        return false;
    }
} 
}