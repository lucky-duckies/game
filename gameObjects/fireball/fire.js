class Fire extends Component {
  constructor(gameObject) {
    super(gameObject);

    const skinInstance = gameObject.addComponent(SkinInstance, models.fire);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;
  }
  update() {}
}
