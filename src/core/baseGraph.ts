import { DisplayObject, Graphics } from "pixi.js";
import IDrawable from "./IDrawable";
import {AniNumber} from "../animations/animations";
import BaseGraphDb from "./baseGraphDb";
/////////////////////////////////////////////
export default class BaseGraph implements IDrawable {
    private graphics : Graphics;
    public  readonly id: string;

    public readonly startTime: number;
    public readonly endTime: number;
    public canvasWidth: number;
    public canvasHeight: number;

    public x :AniNumber;
    private width: number;
    private height: number;
    private color: number;
    
/////////////////////////////////////////
constructor(baseGraphDb : BaseGraphDb) {

    this.startTime = baseGraphDb.startTime;
    this.endTime =  baseGraphDb.endTime;
    this.canvasWidth = baseGraphDb.canvasWidth;
    this.canvasHeight = baseGraphDb.canvasHeight;
    this.id = Math.random().toString(36).slice(2);
    this.x = new AniNumber(baseGraphDb.x);
    this.width = baseGraphDb.width;
    this.height = baseGraphDb.height;
    this.color = baseGraphDb.color;
    // this.x;
    // this.setY(y);
/////////////////////////////
this.graphics = new Graphics();
this.graphics.beginFill(this.color);
this.graphics.drawRect(this.x.value(), 10, this.width, this.height);
this.graphics.endFill();   
///////////////////

}



setX(x:number):number{
this.graphics.x = (this.canvasWidth/100) * x;
return this.graphics.x;
}
setY(y:number):number{
this.graphics.y = (this.canvasHeight/100) * y;
return this.graphics.y;
}
setxy(x:number , y:number):void{
this.setX(x);
this.setY(y);
}

// setWidth(width:number):number{
// this.graphics.width = (this.canvasWidth/100) * width;
// return this.graphics.width;
// }

// setHeight(height:number):number{
// this.graphics.height = (this.canvasHeight/100) * height;
// return this.graphics.height;
// }


// setWidthHeight(width:number,height:number):void{
// this.setWidth(width);
// this.setHeight(height);
// }

getDrawable():DisplayObject{
    return this.graphics;
}

update( timeMs :number=0 ):void {
// const xx = this.x();
// console.log( "timeMs" , timeMs);    
this.x.update(timeMs);
this.graphics.x = this.x.value();
console.log( "this.graphics.x" , this.graphics.x);    
// console.log( "this.x" , this.x);    
// this.setX(xx + 0.1);

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