class Fireball extends Component {
  constructor(gameObject, direction) {
    super(gameObject);
    const model = models.fireball;
    const skinInstance = gameObject.addComponent(SkinInstance, model);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;
    this.transform = this.gameObject.transform;

    this.direction = direction;
  }
  update() {
    this.transform.translateOnAxis(this.direction, 0.4);
  }
}
