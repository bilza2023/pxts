import BaseGraph from "../baseGraph/baseGraph";

/////////////////////////////////////////////

export default class RoundRect extends BaseGraph {
    radius: number;
    /////////////////////////////////////////
    constructor(x: number, y: number, width: number, height: number, color: number, radius: number = 10) {
        super(x, y, width, height, color);
        this.radius = radius;
        /////////////////////////////
    }

    init() {
        this.graphics.beginFill(0xffffff);

        this.graphics.drawRoundedRect(
            0, // dont use this.x in init since it accumulates
            0,
            this.width,
            this.height,
            this.radius,
        );

        //======================================
        this.graphics.endFill();
        //======================================
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
