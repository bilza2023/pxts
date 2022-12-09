import GraphWrapper from "./graphWrapper";

export default class Origin extends GraphWrapper {
    constructor() {
        super();
    }

    set originX(x: number) {
        const oldx = this.x;
        this.x = 0;
        this.graphics.pivot.x = x;
        this.x = oldx + x;
    }

    get originX() {
        return this.graphics.pivot.x;
    }

    ////////////////////////////
    set originY(y: number) {
        const oldy = this.y;
        this.y = 0;
        this.graphics.pivot.y = y;
        this.y = oldy + y;
    }

    get originY() {
        return this.graphics.pivot.y;
    }
    ////////////////////////////////////
    public originXAlign(x: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(x, this.width);
        this.originX = sum;
        return this.originX;
    }

    public originYAlign(y: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(y, this.height);
        this.originY = sum;
        return this.originY;
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
