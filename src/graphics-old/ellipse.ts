import { Application, Graphics } from "pixi.js";
import BaseComp from "./BaseGraph";

/////////////////////////////////////////
export default class Ellipse extends BaseComp {


constructor(x: number, y: number, width: number, height: number, color: number) {
    super(x, y, width, height, color);
}

/**
 * I am calling this as draw but it is actually add to stage
*/
draw(stage: Application['stage']) {
    this.drawBorder(this.graphics);
    // Rectangle
    this.graphics.beginFill(this.color);
    this.graphics.drawEllipse(this.x, this.y, this.width, this.height);
    this.graphics.endFill();
///--------------------------------
stage.addChild(this.graphics);
}
///////////////////////////////////
move() {
    this.graphics.x += 0.1;
}

}