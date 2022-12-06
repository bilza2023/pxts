import { DisplayObject, Graphics } from "pixi.js";
import IDrawable from "./IDrawable"
/////////////////////////////////////////////

export default class BaseGraph  implements IDrawable{
    protected graphics : Graphics;
    public  readonly id: string;
    //------
    public x            : number;
    public y            : number;
    public width        : number;
    public height       : number;
    public color        : number;
    public rotation     : number;
    public opacity      : number;
    //------
    private pvtOffsetX      : 0|1|2;
    private pvtOffsetY      : 0|1|2;
    
/////////////////////////////////////////
constructor(x :number, y :number,width :number,height :number,color:number) {

    this.id = Math.random().toString(36).slice(2);
    
    this.x = x;
    this.y = y;
    this.width =  width;
    this.height = height;

    this.color =  color;
    
    this.rotation =  0;
    this.opacity =  100;
/////////////////////////////
this.graphics = new Graphics();
//--do not remove
this.pvtOffsetX = 0;
this.pvtOffsetY = 0;
}

public getDrawable():DisplayObject{
    return this.graphics;
}
//-----------------------------------------------
pivot( x : 0|1|2,  y : 0|1|2=0){
this.pvtOffsetX = x;       
this.pvtOffsetY = y;       
}

pivotX():number {   
let x = 0;
    switch ( this.pvtOffsetX ) 
    {
    case 0 :
        x = 0;       
    break;
    case 1:
        x = ((this.width/2));    
    break;
    case 2:
        x = ((this.width))
    break;
    }
return x;        
}
pivotY():number {   
let y = 0;
    switch ( this.pvtOffsetY ) 
    {
    case 0 :
        y = 0;       
    break;
    case 1:
        y = ( this.height/2 );    
    break;
    case 2:
        y = ( this.height );
    break;
    }
return y;        
}

//-----------------------------------------------
// public update( ):void {
//     this.graphics.width =  this.width;
//     this.graphics.height =  this.height;
//     this.graphics.angle =  this.rotation;
//     this.graphics.alpha =  this.opacity/100;
//     this.graphics.tint =  this.color;
    
//------------------set the rotation axis
// this.graphics.pivot.x = 0;
// this.graphics.pivot.y = 0;
// this.graphics.x =  this.x;
// this.graphics.y =  this.y;
// }

//////////////////////////////////////////////////////////
protected init(){}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}