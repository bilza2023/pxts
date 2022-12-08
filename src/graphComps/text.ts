import BaseGraphComp from "../baseGraphComp/baseGraphComp";

import { DisplayObject, Text as PixiText, TextStyle } from "pixi.js";

///////////////////////////////////////////
export default class Text extends BaseGraphComp {
    ///////////////////////////////////////////
    private theText: PixiText;
    public style: TextStyle;
    constructor(content: string, color: number, fontSize: number = 24) {
        super();
        this.style = new TextStyle();
        this.style.fontSize = fontSize;
        this.style.lineHeight = 28;
        this.style.letterSpacing = 0;
        this.style.fill = color;
        this.style.align = "center";

        this.theText = new PixiText(content, this.style);
    }

    public getDrawable(): DisplayObject {
        return this.theText;
    }

    set content(content: string) {
        this.theText.text = content;
    }

    get content() {
        return this.theText.text;
    }
}
