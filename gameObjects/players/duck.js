/* eslint-disable complexity */
// Returns true of obj1 and obj2 are close
function isClose(obj1, obj1Radius, obj2, obj2Radius) {
  const minDist = obj1Radius + obj2Radius;
  const dist = obj1.position.distanceTo(obj2.position);
  return dist < minDist;
}
// adding sound effect when duck is lost
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  };
  this.stop = function() {
    this.sound.pause();
  };
}
let duckLostSound = new sound("../../resources/music/quack.ogg");

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

    this.transform = gameObject.transform;

    // phoenix
    this.phoenix = globals.player.gameObject.transform;

    // vectors for flocking motion
    this.position = this.transform.position;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);

    this.maxVelocity = 1;

    // for separation
    this.desiredSeparation = 8;

    // all other ducks
    this.ducks = globals.ducks;

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
                  duckLostSound.play();
                }
              }
            }
            //display lose screen
            if (globals.duckCount === 0 && win.style.display === "none") {
              help.style.display = "none";
              blocker.style.display = "block";
              lose.style.display = "block";
            }
          }
        }
      },
      "idle"
    );
  }

  // gets each duck to separate/move away if it is too close to another duck
  separate() {
    let sum = new THREE.Vector3(0, 0, 0);
    let count = 0;

    // loop through all ducks to see which ones are too close
    for (let i = 0; i < this.ducks.length; i++) {
      let dist = this.ducks[i].gameObject.transform.position.distanceTo(
        this.position
      );
      if (dist < this.desiredSeparation && dist > 0) {
        // checking dist > 0 makes sure we don't compare with ourselves
        let diff = new THREE.Vector3(0, 0, 0);
        diff.subVectors(
          this.position,
          this.ducks[i].gameObject.transform.position
        );
        diff.normalize();
        sum.add(diff);
        count++;
      }
    }

    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();

      // steer equation
      let steer = new THREE.Vector3(0, 0, 0);
      steer.subVectors(sum, this.velocity);

      steer.multiplyScalar(0.1);
      // apply steering force to our acceleration
      this.applyForce(steer);
    }
  }

  // adds a force to acceleration
  applyForce(force) {
    this.acceleration.add(force);
  }

  // take a target vector (for location of phoenix) and return a steering force towards target
  seek(target) {
    let desired = new THREE.Vector3(0, 0, 0);
    desired.subVectors(target, this.position);
    desired.normalize();

    // point head
    this.transform.lookAt(target);

    // console.log("transform ", this.transform);
    // console.log("desired", desired);

    // steer equation
    let steer = new THREE.Vector3(0, 0, 0);
    steer.subVectors(desired, this.velocity);

    steer.multiplyScalar(0.05);
    // apply steering force to our acceleration
    this.applyForce(steer);
  }

  update() {
    //retrieves numbers of present and lost ducks from global variables and renders living/lost icons accordingly
    let duckDisplay = () => {
      let displayHTML = "";
      for (let count = 0; count < globals.duckCount; count++) {
        displayHTML += `<img class=icon src="../../resources/images/duckicon.png"/>`;
      }
      if (globals.duckCount < globals.originalCount) {
        for (
          let lostDucks = 0;
          lostDucks < globals.originalCount - globals.duckCount;
          lostDucks++
        ) {
          displayHTML += `<img class=icon src="../../resources/images/lostduck.png"/>`;
        }
      }
      return displayHTML;
    };
    //updates score in user view
    function duckCount() {
      score.innerHTML = duckDisplay();
    }
    duckCount();
    this.fsm.update();

    if (!this.isCaught) {
      // get direction vector of phoenix
      let direction = globals.player.gameObject.components[1].direction;
      direction.normalize();
      direction.multiplyScalar(10);

      // get a location slightly behind phoenix
      let behindPhoenix = new THREE.Vector3(0, 0, 0);
      behindPhoenix.copy(this.phoenix.position);
      behindPhoenix.sub(direction);

      // have duck seek behind phoenix
      this.seek(behindPhoenix);
      this.separate();

      this.velocity.add(this.acceleration);

      // limit velocity so its not too fast

      this.velocity.normalize();
      this.velocity.multiplyScalar(0.5);

      this.position.add(this.velocity);

      this.velocity.multiplyScalar(0);
      this.acceleration.multiplyScalar(0);
    }
  }
}
