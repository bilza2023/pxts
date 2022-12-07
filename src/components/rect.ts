import BaseGraph from "../baseGraph/baseGraph";

/////////////////////////////////////////////

export default class Rect extends BaseGraph {
    /////////////////////////////////////////
    constructor(x: number, y: number, width: number, height: number, color: number) {
        super(x, y, width, height, color);
        /////////////////////////////
    }

    init() {
        this.graphics.beginFill(0xffffff);

        this.graphics.drawRect(
            0, // dont use this.x in init since it accumulates
            0,
            this.width,
            this.height,
        );

        //======================================
        this.graphics.endFill();
        //======================================
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
