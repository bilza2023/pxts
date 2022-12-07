import BaseGraph from "../baseGraph/baseGraph";

/////////////////////////////////////////////

export default class Ellipse extends BaseGraph {
    /////////////////////////////////////////
    constructor(x: number, y: number, width: number, height: number, color: number) {
        super(x, y, width, height, color);
        /////////////////////////////
    }

    //xxxxxxx
    init() {
        this.graphics.beginFill(0xffffff); // Red
        this.graphics.drawEllipse(0, 0, this.width, this.height); // drawCircle(x, y, radius)
        this.graphics.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
