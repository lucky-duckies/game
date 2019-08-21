class Obstacle extends Component {
  constructor(gameObject, model) {
    super(gameObject);

    const skinInstance = gameObject.addComponent(SkinInstance, model);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;
  }
  update() {}
}
