class Mushroom extends Component {
  constructor(gameObject, model) {
    super(gameObject);
    this.model = model;

    this.skinInstance = gameObject.addComponent(SkinInstance, model);
    // grab name of first animation
    this.animName = "";
    for (let key in model.animations) {
      this.animName = key;
      break;
    }
    this.skinInstance.mixer.timeScale = globals.moveSpeed / 4;
    this.skinInstance.setAnimation(this.animName);
  }
  //model loads but below the ground
  update() {}
}
