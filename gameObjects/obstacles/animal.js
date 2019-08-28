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
    const hitRadius = model.size / 2;
    const skinInstance = gameObject.addComponent(SkinInstance, model);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;
    this.transform = gameObject.transform;

    // phoenix
    this.phoenix = globals.player.gameObject.transform;

    // vectors for flocking motion
    this.position = this.transform.position;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);

    this.maxVelocity = 1;

    // for separation
    this.desiredSeparation = 10;

    // all other ducks
    this.ducks = globals.ducks;
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
    desired.subVectors(target.position, this.position);
    desired.normalize();

    // point head
    this.transform.lookAt(target.position);

    // console.log("transform ", this.transform);
    // console.log("desired", desired);

    // steer equation
    let steer = new THREE.Vector3(0, 0, 0);
    steer.subVectors(desired, this.velocity);

    steer.multiplyScalar(0.1);
    // apply steering force to our acceleration
    this.applyForce(steer);
  }

  update() {
    // this.acceleration = new THREE.Vector3(1, 0, 0);
    // this.acceleration.multiplyScalar(0.1);
    // this.position.add(this.acceleration);

    // random rotation

    // this.transform.rotation.y -= Math.random() * 0.001;
    // let negPos = Math.random();
    // if (negPos > 0.5) {
    //   this.transform.rotation.y -= Math.random();
    // } else {
    //   this.transform.rotation.y += Math.random();
    // }
    this.seek(this.phoenix);
    this.separate();

    this.velocity.add(this.acceleration);

    // limit velocity so its not too fast
    if (this.velocity.length > this.maxVelocity) {
      this.velocity.normalize;
    }
    this.position.add(this.velocity);

    this.velocity.multiplyScalar(0);
    this.acceleration.multiplyScalar(0);
  }
}
