
import BaseGraph from "../core/baseGraph"

/////////////////////////////////////////////
export default class Circle extends BaseGraph {
/////////////////////////////////////////

constructor( x: number, y: number, width: number, color: number = 0x000000) {
super(x, y, width, width);
this.color = color;
}


//xxxxxxx
init() {
this.graphics.beginFill(this.color); // Red
this.graphics.drawCircle(this.drawX(), this.drawY(), this.width); // drawCircle(x, y, radius)
this.graphics.endFill();

}
update(){
    super.update();
    this.height = this.width;
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}