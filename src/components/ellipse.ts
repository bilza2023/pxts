
import BaseGraph from "../core/baseGraph"

/////////////////////////////////////////////
export default class Ellipse extends BaseGraph {
/////////////////////////////////////////

constructor( x: number, y: number, width: number,height:number, color: number = 0x000000) {
super(x, y, width, height,color);

}


//xxxxxxx
init() {
this.graphics.beginFill(this.color); // Red
this.graphics.drawEllipse(this.drawX(), this.drawY(), this.width,this.height); // drawCircle(x, y, radius)
this.graphics.endFill();

}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}