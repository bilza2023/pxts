function drawPolygon(target, x, y, sides, radius, angle = 0) {
    let step = (Math.PI * 2) / sides;
    let start = (angle / 180) * Math.PI;
    let n, dx, dy;

    target.moveTo(x + Math.cos(start) * radius, y - Math.sin(start) * radius);

    for (n = 1; n <= sides; ++n) {
        dx = x + Math.cos(start + step * n) * radius;
        dy = y - Math.sin(start + step * n) * radius;
        target.lineTo(dx, dy);
    }
}

// Application
const app = new PIXI.Application({
    view: document.querySelector("#view"),
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0,
    antialias: true,
});

// Graphics Instance
const g = new PIXI.Graphics();
app.stage.addChild(g);

// State
let state = {
    stroke: 2,
    color: 0xffffff,
    fill: 0x0,
    sides: 5,
    radius: 25,
    angle: 0,
};

// Ticker
const ticker = new PIXI.Ticker();
ticker.add(() => {
    g.clear();
    g.lineStyle(state.stroke, state.color);
    g.beginFill(state.fill);

    drawPolygon(g, window.innerWidth / 2, window.innerHeight / 2, state.sides, state.radius, state.angle);
}, PIXI.UPDATE_PRIORITY.LOW);
ticker.start();

// Controls
const gui = new dat.GUI();
gui.add(state, "sides", 3, 24, 1).listen();
gui.add(state, "stroke", 1, 10).listen();
gui.add(state, "radius", 1, 100).listen();
gui.add(state, "angle", 1, 360).listen();

tweenProperty(state, "stroke", 1, 10);
tweenProperty(state, "fill", 0, 255);
tweenProperty(state, "radius", 0, 100);
tweenProperty(state, "angle", 0, 360);

function tweenProperty(target, prop, min, max) {
    TweenMax.to(target, random(0.5, 2), {
        [prop]: random(min, max),
        ease: Sine.easeInOut,
        onComplete: tweenProperty,
        onCompleteParams: [target, prop, min, max],
    });
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}
