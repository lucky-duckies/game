class Ant extends Component {
    constructor(gameObject, model) {
      super(gameObject);

      this.skinInstance = gameObject.addComponent(SkinInstance, model);
      this.skinInstance.mixer.timeScale = globals.moveSpeed / 4;
       this.skinInstance.setAnimation("ArmatureAction_Armature_0");
    }
    update() {}
  }
