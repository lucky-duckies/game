function isClose(obj1, obj1Radius, obj2, obj2Radius) {
    const minDist = obj1Radius + obj2Radius;
    const dist = obj1.position.distanceTo(obj2.position);
    return dist < minDist;
  }
  class Mama extends Component {
    constructor(gameObject, model) {
      super(gameObject);
      const hitRadius = model.size / 2;
      const skinInstance = gameObject.addComponent(SkinInstance, model);
      skinInstance.mixer.timeScale = globals.moveSpeed / 4;
      const transform = gameObject.transform;
      const playerTransform = globals.player.gameObject.transform;

      this.fsm = new FiniteStateMachine(
        {
          idle: {

            update () {
            //   check if player is near
              if (
                isClose(
                  transform,
                  hitRadius,
                  playerTransform,
                  globals.playerRadius
                ) &&
                lose.style.display === 'none'
              ) {
                // display win screen
                blocker.style.display = 'block';
                win.style.display = 'block';
              }
            },
          },
        },
        'idle'
       );
    }
    update() {
      this.fsm.update();
      const dir = THREE.Math.radToDeg(this.gameObject.transform.rotation.y);
    }
  }
