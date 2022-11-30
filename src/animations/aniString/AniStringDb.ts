import AniPropDb from "../aniProp/aniPropDb";


export default class AniStringDb extends AniPropDb<string>{


    constructor(value: string) {
        super(value);
    }

}