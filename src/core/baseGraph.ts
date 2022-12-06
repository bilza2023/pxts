import { Graphics } from "pixi.js";
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

public getDrawable():Graphics{
    return this.graphics;
}
//-----------------------------------------------
pivot( x : 0|1|2|null=null,  y : 0|1|2|null=null){
    if ( x !== null ) {
        this.pvtOffsetX = x;       
    }
    if (y !== null ) {
        this.pvtOffsetY = y;       
    }
}


getPivotX( ):number {   
let ret = 0;    
    switch ( this.pvtOffsetX ) 
    {
    case 0 :
        ret = 0;       
    break;
    case 1:
        ret = ((this.width/2));    
    break;
    case 2:
        ret = ((this.width))
    break;
    }
return ret;        
}
getPivotY():number {   
let ret = 0;    
    switch ( this.pvtOffsetY ) 
    {
    case 0 :
        ret = 0;       
    break;
    case 1:
        ret = ((this.height/2));    
    break;
    case 2:
        ret = ((this.height))
    break;
    }
return ret;        
}

//-----------------------------------------------
public update( ):void {
    this.graphics.width =  this.width;
    this.graphics.height =  this.height;
    this.graphics.angle =  this.rotation;
    this.graphics.alpha =  this.opacity/100;
    this.graphics.tint =  this.color;
    
// ------------------set the rotation axis
this.graphics.pivot.x = this.getPivotX();
this.graphics.pivot.y = this.getPivotY();
this.graphics.x =  this.x + this.getPivotX();
this.graphics.y =  this.y + this.getPivotY();
}

//////////////////////////////////////////////////////////
protected init(){}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}