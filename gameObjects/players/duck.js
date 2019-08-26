/* eslint-disable complexity */
// Returns true of obj1 and obj2 are close
function isClose(obj1, obj1Radius, obj2, obj2Radius) {
  const minDist = obj1Radius + obj2Radius;
  const dist = obj1.position.distanceTo(obj2.position);
  return dist < minDist;
}

class Duck extends Component {
  constructor(gameObject) {
    super(gameObject);
    const model = models.duck;
    globals.playerRadius = model.size / 8;
    this.skinInstance = gameObject.addComponent(SkinInstance, model);
    this.turnSpeed = globals.moveSpeed / 4;
    this.offscreenTimer = 0;
    this.maxTimeOffScreen = 3;
    this.isCaught = false;
    this.uncaught = true

    const transform = gameObject.transform;
    const obstacles = globals.obstacles;
    const playerTransform = globals.horse.gameObject.transform;
    const hitRadius = model.size / 2;

    this.fsm = new FiniteStateMachine(
      {
        idle: {
          enter: () => {
            //skinInstance.setAnimation("Idle");
          },
          update: () => {

            // check if duck is near obstacle
            for (let i = 0; i < obstacles.length; i++){
            if (isClose(transform, hitRadius, obstacles[i].gameObject.transform, 3)) {
              this.isCaught = true;

              //ensures that the duckCount only decrements once
              if (this.isCaught && this.uncaught) {
                this.uncaught = false;
                globals.duckCount--;
              }
            }
          }
            //display lose screen
            if (globals.duckCount === 0 && win.style.display === "none") {
              blocker.style.display = "block";
              lose.style.display = "block";
            }
          }
        }
      },
      "idle"
    );
  }
  update() {
    let duckDisplay = () => {
      let displayHTML = "";
      for(let count = 0; count < globals.duckCount; count++) {displayHTML += `<img class=life src="../../resources/images/duckicon.png"/>`}
      return displayHTML;
    }
    //updates score in user view
    function duckCount() {
      document.getElementById(
        "score"
      ).innerHTML = duckDisplay();
    }
    duckCount();
    this.fsm.update();

    if (!this.isCaught) {
      const { deltaTime, moveSpeed } = globals;
      const { transform } = this.gameObject;
      const delta =
        (inputManager.keys.left.down ? 1 : 0) +
        (inputManager.keys.right.down ? -1 : 0);

      // direction vector is initialized to point in the same direction of the head of the bird
      let direction = new THREE.Vector3(1, 0, 0);

      // rotate 90 degrees on right arrow key press
      if (inputManager.keys.right.down) {
        transform.rotation.y -= Math.PI / 36;
      }

      // rotate 90 degrees on left arrow key press
      if (inputManager.keys.left.down) {
        transform.rotation.y += Math.PI / 36;

        // the following code gets the direction vector that our bird is facing
        var matrix = new THREE.Matrix4();
        matrix.extractRotation(transform.matrix);

        direction.applyMatrix4(matrix);
      }

      // move in direction of head by one unit
      if (inputManager.keys.up.down) {
        transform.translateOnAxis(direction, 1);
      }

      // move backwards
      if (inputManager.keys.down.down) {
        transform.translateOnAxis(direction, -1);
      }
    }
  }
}
