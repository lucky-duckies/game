class Obstacle extends Component {
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

    const transform = gameObject.transform;
    //for fireball collision
    const fireballs = globals.fireballs;

    this.fsm = new FiniteStateMachine(
      {
        idle: {
          enter: () => {},
          update: () => {
            // check for collision between fireballs and tree
            for (let i = 0; i < fireballs.length; i++) {
              if (fireballs[i] != 0) {
                if (
                  isClose(transform, 7, fireballs[i].gameObject.transform, 3)
                ) {
                  // remove tree
                  scene.remove(transform);

                  // add fire
                  const gameObject = gameObjectManager.createGameObject(
                    scene,
                    "fire"
                  );
                  gameObject.addComponent(Fire);
                  // make sure fire location in where the burned down tree was
                  gameObject.transform.position.x = transform.position.x;
                  gameObject.transform.position.z = transform.position.z;
                  gameObject.transform.position.y = 5;
                }
              }
            }
          }
        }
      },
      "idle"
    );
  }
  //model loads but below the ground
  update() {
    this.fsm.update();
  }
}
