import GraphWrapper from "./graphWrapper";

export default class Origin extends GraphWrapper implements IComponent {
    orignalX: number;
    orignalY: number;
    constructor() {
        super();
        this.orignalX = 0;
        this.orignalY = 0;
    }

    set x(x: number) {
        this.orignalX = x;
        this.graphics.x = this.orignalX + this.graphics.pivot.x;
    }
    get x(): number {
        return this.orignalX;
    }
    //===Y
    set y(y: number) {
        this.orignalY = y;
        this.graphics.y = this.orignalY + this.graphics.pivot.y;
    }
    get y(): number {
        return this.orignalY;
    }
    /////////////////////////////////////////
    set pivotX(x: number) {
        this.graphics.x = 0;
        this.graphics.pivot.x = x;
        this.graphics.x = this.orignalX + this.graphics.pivot.x;
    }

    get pivotX() {
        return this.graphics.pivot.x;
    }

    ////////////////////////////
    set pivotY(y: number) {
        this.graphics.y = 0;
        this.graphics.pivot.y = y;
        this.graphics.y = this.orignalY + this.graphics.pivot.y;
    }

    get pivotY() {
        return this.graphics.pivot.y;
    }
    ////////////////////////////////////
    public pivotXAlign(x: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(x, this.width);
        this.pivotX = 0;
        this.pivotX = sum;
        return this.pivotX;
    }

    public pivotYAlign(y: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(y, this.height);
        this.pivotY = 0;
        this.pivotY = sum;
        return this.pivotY;
    }

    ////////////////////////////
    zeroFiftyHundred(offset: 0 | 1 | 2, widthHeight: number): number {
        let ret = 0;
        switch (offset) {
            case 0:
                ret = 0;
                break;
            case 1:
                ret = widthHeight / 2;
                break;
            case 2:
                ret = widthHeight;
                break;
        }
        return ret;
    }
}