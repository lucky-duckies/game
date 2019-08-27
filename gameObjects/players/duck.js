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
    this.uncaught = true;

    const transform = gameObject.transform;
    const obstacles = globals.obstacles;
    const hitRadius = model.size / 2;

    this.collidingWithTree = false;
    const trees = globals.trees;

    this.fsm = new FiniteStateMachine(
      {
        idle: {
          enter: () => {
            //skinInstance.setAnimation("Idle");
          },
          update: () => {
            // check if duck is near tree
            for (let i = 0; i < trees.length; i++) {
              if (isClose(transform, 7, trees[i].gameObject.transform, 10)) {
                this.collidingWithTree = true;
              }
            }

            // check if duck is near obstacle
            for (let i = 0; i < obstacles.length; i++) {
              if (
                isClose(
                  transform,
                  hitRadius,
                  obstacles[i].gameObject.transform,
                  3
                )
              ) {
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
    //retrieves numbers of present and lost ducks from global variables and renders living/lost icons accordingly
    let duckDisplay = () => {
      let displayHTML = "";
      for (let count = 0; count < globals.duckCount; count++) {
        displayHTML += `<img class=life src="../../resources/images/duckicon.png"/>`;
      }
      if (globals.duckCount < globals.originalCount) {
        for (
          let lostDucks = 0;
          lostDucks < globals.originalCount - globals.duckCount;
          lostDucks++
        ) {
          displayHTML += `<img class=life src="../../resources/images/lostduck.png"/>`;
        }
      }
      return displayHTML;
    };
    //updates score in user view
    function duckCount() {
      document.getElementById("score").innerHTML = duckDisplay();
    }
    duckCount();
    this.fsm.update();

    if (!this.isCaught) {
      const { deltaTime, moveSpeed } = globals;
      const { transform } = this.gameObject;
      transform.position.x = globals.player.gameObject.transform.position.x;
      transform.position.z = globals.player.gameObject.transform.position.z;
    }
  }
}
