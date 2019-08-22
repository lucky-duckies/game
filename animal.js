// Returns true of obj1 and obj2 are close
function isClose(obj1, obj1Radius, obj2, obj2Radius) {
  const minDist = obj1Radius + obj2Radius;
  const dist = obj1.position.distanceTo(obj2.position);
  return dist < minDist;
}

// keeps v between -min and +min
function minMagnitude(v, min) {
  return Math.abs(v) > min ? min * Math.sign(v) : v;
}

class Animal extends Component {
  constructor(gameObject, model) {
    super(gameObject);
    this.helper = gameObject.addComponent(StateDisplayHelper, model.size);
    const hitRadius = model.size / 2;
    const skinInstance = gameObject.addComponent(SkinInstance, model);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;
    const transform = gameObject.transform;
    const playerTransform = globals.player.gameObject.transform;

    this.fsm = new FiniteStateMachine(
      {
        idle: {
          enter: () => {
            skinInstance.setAnimation("Idle");
          },
          update: () => {
            // check if player is near
            if (
              isClose(
                transform,
                hitRadius,
                playerTransform,
                globals.playerRadius
              ) && 
              globals.duckCount > 0
            ) {
              //this.fsm.transition("waitForEnd");
              // display win screen
              blocker.style.display = "block";
              win.style.display = "block";
            }
          }
        },
      },
      "idle"
    );
  }
  update() {
    this.fsm.update();
    const dir = THREE.Math.radToDeg(this.gameObject.transform.rotation.y);
    this.helper.setState(`${this.fsm.state}:${dir.toFixed(0)}`);
  }
}
