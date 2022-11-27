const app = new PIXI.Application({ background: "#1099bb" });
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from("../images/bunny.png");

const bunny = new PIXI.Sprite(texture);
bunny.anchor.set(0.5);
bunny.x = 0;
bunny.y = 0;
container.addChild(bunny);

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// pivot.x and y is for rotation
// container.pivot.x = container.width / 2;
// container.pivot.y = container.height / 2;

// ticker
// app.ticker.add((delta) => {
//     container.rotation -= 0.01 * delta;
// });
