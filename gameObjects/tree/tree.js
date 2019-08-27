/* eslint-disable complexity */

class Tree extends Component {
  constructor(gameObject, model) {
    super(gameObject);

    this.skinInstance = gameObject.addComponent(SkinInstance, model);

    const transform = gameObject.transform;
    // for fireball collision
    // const fireballs = globals.fireballs;

    // this.fsm = new FiniteStateMachine(
    //   {
    //     idle: {
    //       enter: () => {},
    //       update: () => {
    //         // check for collision between fireballs and tree
    //         for (let i = 0; i < fireballs.length; i++) {
    //           if (fireballs[i] != 0) {
    //             if (
    //               isClose(transform, 7, fireballs[i].gameObject.transform, 3)
    //             ) {
    //               // remove tree
    //               scene.remove(transform);

    //               // add fire
    //               const gameObject = gameObjectManager.createGameObject(
    //                 scene,
    //                 "fire"
    //               );
    //               gameObject.addComponent(Fire);
    //               // make sure fire location in where the burned down tree was
    //               gameObject.transform.position.x = transform.position.x;
    //               gameObject.transform.position.z = transform.position.z;
    //               gameObject.transform.position.y = 5;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   "idle"
    // );
  }
  update() {
    // this.fsm.update();
  }
}
