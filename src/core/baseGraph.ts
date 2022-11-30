import { DisplayObject, Graphics } from "pixi.js";
import IDrawable from "./IDrawable";
import {AniNumber} from "../animations/animations";

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
constructor(startTime: number,endTime: number,x :number=0,y :number=0,width :number=50,height :number=50,color :number =0xde3249) {

    this.startTime = startTime;
    this.endTime =  endTime;
    this.canvasWidth = 800;
    this.canvasHeight = 350;
    this.id = Math.random().toString(36).slice(2);
    this.x = new AniNumber();
    this.width = width;
    this.height = height;
    this.color = color;
    // this.x;
    // this.setY(y);
/////////////////////////////
this.graphics = new Graphics();
this.graphics.beginFill(this.color);
this.graphics.drawRect(0, 0, 1, 1);
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