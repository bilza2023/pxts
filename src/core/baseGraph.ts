import { DisplayObject, Graphics } from "pixi.js";
import IDrawable from "./IDrawable"
/////////////////////////////////////////////

export default class BaseGraph  implements IDrawable{
    private graphics : Graphics;
    public  readonly id: string;

    public x            : number;
    public y            : number;
    public width        : number;
    public height       : number;
    public color        : number;
    public rotation     : number;
    public opacity      : number;
    
/////////////////////////////////////////
constructor(x :number, y :number,width :number,height :number) {

    this.id = Math.random().toString(36).slice(2);
    this.x = x;
    this.y = y;
    this.width =  width;
    this.height = height;

    this.color =  0xffffff;
    
    this.rotation =  0;
    this.opacity =  100;
/////////////////////////////
this.graphics = new Graphics();
this.addPixiElement();
///////////////////
}

public getDrawable():DisplayObject{
    return this.graphics;
}

public update( ):void {
//--7 so far
this.graphics.x =  this.x;
this.graphics.y =  this.y;
this.graphics.width =  this.width;
this.graphics.height =  this.height;
this.graphics.angle =  this.rotation;
this.graphics.alpha =  this.opacity/100;
this.graphics.tint =  this.color;

}

//////////////////////////////////////////////////////////
protected addPixiElement(){
    this.graphics.beginFill(this.color );

    this.graphics.drawRect(
        this.x, 
        this.y, 
        this.width, 
        this.height);
    
    this.graphics.endFill();   
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}