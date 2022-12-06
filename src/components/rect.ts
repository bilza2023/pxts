import BaseGraph from "../core/baseGraph"

/////////////////////////////////////////////

export default class Rect extends BaseGraph {
    
/////////////////////////////////////////
constructor(x: number, y: number, width: number, height: number,color:number) {
super(x,y,width,height,color);
/////////////////////////////
}


init() {
this.graphics.beginFill(this.color);

this.graphics.drawRect(
    this.x,
    this.y,
    this.width,
    this.height);

//======================================
this.graphics.endFill();
//======================================
this.graphics.angle =  this.rotation;
this.graphics.alpha =  this.opacity/100;
//======================================
this.graphics.pivot.x =  this.x + this.width/2;
this.graphics.pivot.y =  this.y + this.height/2;
//--The position needs to be reset after the pivot has been changed
        //forget the intial position reset it again
this.graphics.x =  this.x;
this.graphics.y =  this.y;
//======================================

}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}