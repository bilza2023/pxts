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

    public x        : AniNumber;
    public y        : AniNumber;
    private width   : AniNumber;
    private height  : AniNumber;
    private color   : AniNumber;
    
/////////////////////////////////////////
constructor(baseGraphDb : BaseGraphDb) {

    this.startTime = baseGraphDb.startTime;
    this.endTime =  baseGraphDb.endTime;
    this.canvasWidth = baseGraphDb.canvasWidth;
    this.canvasHeight = baseGraphDb.canvasHeight;
    this.id = Math.random().toString(36).slice(2);
    this.x = new AniNumber(baseGraphDb.x);
    this.y = new AniNumber(baseGraphDb.y);
    this.width =  new AniNumber(baseGraphDb.width);
    this.height = new AniNumber(baseGraphDb.height);
    this.color =  new AniNumber(baseGraphDb.color);
    // this.x;
    // this.setY(y);
/////////////////////////////
this.graphics = new Graphics();
this.graphics.beginFill(this.color.value() );
this.graphics.drawRect(this.x.value(), 10, this.width.value(), this.height.value());
this.graphics.endFill();   
///////////////////
// center the sprite's anchor point
this.graphics.pivot.x = 150;
this.graphics.pivot.y = 75;
// this.graphics.anchor.y = 0.5;

// move the sprite to the center of the screen
// this.graphics.x = 20;
// this.graphics.y = 20;
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

getDrawable():DisplayObject{
    return this.graphics;
}

update( timeMs :number=0 ):void {

this.x.update(timeMs);
// this.graphics.x = (this.canvasWidth/100) * this.x.value();
this.graphics.x =  this.x.value();
this.graphics.position.x = this.graphics.x;
//................................................
this.y.update(timeMs);
// this.graphics.y = (this.canvasHeight/100) * this.y.value();
this.graphics.y =  this.y.value();
this.graphics.position.y = this.graphics.y;
//................................................
this.width.update(timeMs);
// this.graphics.width = (this.canvasWidth/100) * this.width.value();
this.graphics.width =  this.width.value();
//................................................
this.height.update(timeMs);
// this.graphics.height = (this.canvasHeight/100) * this.height.value();
this.graphics.height =  this.height.value();
//................................................
this.graphics.rotation += 0.01;
// console.log( "this.graphics.x" , this.graphics.x);    
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