import { Graphics } from "pixi.js";
import IDrawable from "./IDrawable";
import Pivot from "./pivot";
/////////////////////////////////////////////

export default class BaseGraph extends Pivot implements IDrawable {
    protected graphics : Graphics;
    public  readonly id: string;
    //------
    public x            : number;
    public y            : number;
    public width        : number;
    public height       : number;
    public color        : number;
    public angle        : number;
    public opacity      : number;
    
/////////////////////////////////////////
constructor(x :number, y :number,width :number,height :number,color:number) {
super();
    this.id = Math.random().toString(36).slice(2);
    
    this.x = x;
    this.y = y;
    this.width =  width;
    this.height = height;

    this.color =  color;
    
    this.angle =  0;
    this.opacity =  100;
/////////////////////////////
this.graphics = new Graphics();
//--do not remove : By default the pivot is set to top left cornor

}
/**
 * Returns the pixi Graphics element.
 * @returns Graphics
 */
public getDrawable():Graphics{
    return this.graphics;
}

//-----------------------------------------------
public update( ):void {
    this.graphics.width =  this.width;
    this.graphics.height =  this.height;
    this.graphics.angle =  this.angle;
    this.graphics.alpha =  this.opacity/100;
    this.graphics.tint =  this.color;
    
// ------------------set the rotation axis
//--set pivot first
this.graphics.pivot.x = this.getPivotX( this.width);
this.graphics.pivot.y = this.getPivotY( this.height );
//--after pivot set position
this.graphics.x =  this.x + this.getPivotX( this.width );
this.graphics.y =  this.y + this.getPivotY( this.height );
}

/**
 * The init function creates the pixi graphics element. 
 * Do not insert it into constructor since we want to keep everything manual at this level.
 * Once pixi element is created the changes in class variables are inserted into pixi element by "update" fn.
 */
public init(){

}
/**
 * Every child must run this as the last line of their init function
 */
protected postInit(){
    //======================================
this.graphics.pivot.x =  0;
this.graphics.pivot.y =  0;
//--The position needs to be reset after the pivot has been changed
//Set the position again even if it was set before
this.graphics.x =  this.x;
this.graphics.y =  this.y;
//======================================
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}