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

this.graphics.endFill();
/////////
// this.graphics.pivot.x = this.graphics.width/2;
// this.graphics.pivot.y = this.graphics.height/2;
}


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}