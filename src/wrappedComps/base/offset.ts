export default function getOffset(offset: 0 | 1 | 2, widthHeight: number): number {
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
