import BaseGraph from "../baseGraph/baseGraph";

/////////////////////////////////////////////

export default class Line extends BaseGraph {
    public x2: number;
    public y2: number;
    public lineWidth: number;
    /////////////////////////////////////////
    constructor(x: number, y: number, x2: number, y2: number, color: number = 0x000000) {
        super(x, y, 10, 10, color);
        /////////////////////////////
        this.x2 = x2;
        this.y2 = y2;
        this.lineWidth = 2;
    }

    /////////////////////////////////////////
    init() {
        // this.graphics.lineStyle(20, 0x000000);
        // this.graphics.moveTo(100, 100);
        // this.graphics.lineTo(700, 200);
        this.graphics.lineStyle(this.lineWidth, this.color);
        this.graphics.moveTo(this.x, this.y);
        this.graphics.lineTo(this.x2, this.y2);
    }
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    /**
     * This is different technique (clear Graphics and re0draw every time).
     * From user point of view its the same
     */
    public update(): void {
        this.graphics.clear();
        // super.update();
        this.init();
    }
}
