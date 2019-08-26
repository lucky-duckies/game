/* eslint-disable max-statements */
/* eslint-disable complexity */
class Player extends Component {
  constructor(gameObject) {
    super(gameObject);
    const model = models.phoenix;
    globals.playerRadius = model.size / 8;
    this.skinInstance = gameObject.addComponent(SkinInstance, model);
    this.skinInstance.setAnimation("Take 001_Armature_0");
    this.turnSpeed = globals.moveSpeed / 4;
    this.offscreenTimer = 0;
    this.maxTimeOffScreen = 3;
  }
  update() {
    const { deltaTime, moveSpeed } = globals;
    const { transform } = this.gameObject;
    const delta =
      (inputManager.keys.left.down ? 1 : 0) +
      (inputManager.keys.right.down ? -1 : 0);
    //transform.rotation.y += this.turnSpeed * delta * deltaTime;
    //transform.translateOnAxis(kForward, moveSpeed * deltaTime);

    // direction vector is initialized to point in the same direction of the head of the bird
    let direction = new THREE.Vector3(1, 0, 0);

    // fire fireball on press of "d" key
    if (inputManager.keys.d.down) {
      // create fireball
      const gameObject = gameObjectManager.createGameObject(scene, "fireball");
      globals.fireball = gameObject.addComponent(Fireball, direction);
      // make sure fireball starting location in where the player is right now
      gameObject.transform.position.x = transform.position.x;
      gameObject.transform.position.z = transform.position.z;
      gameObject.transform.position.y = 5;
      globals.fireballs.push(globals.fireball);
    }

    // rotate 10 degrees on right arrow key press
    if (inputManager.keys.right.down) {
      transform.rotation.y -= Math.PI / 36;
    }

    // rotate 10 degrees on left arrow key press
    if (inputManager.keys.left.down) {
      // rotates 10 degrees
      transform.rotation.y += Math.PI / 36;
    }

    // move in direction of head by one unit
    if (inputManager.keys.up.down) {
      transform.translateOnAxis(direction, 1);
    }

    // move backwards
    if (inputManager.keys.down.down) {
      transform.translateOnAxis(direction, -1);
    }

    //camera follows (position, at speed (between 0 and 1))
    globals.camera.position.lerp(
      {
        x: this.gameObject.transform.position.x - 50,
        y: this.gameObject.transform.position.y + 70,
        z: this.gameObject.transform.position.z
      },
      0.5
    );

    // the following code gets the direction vector that our bird is facing
    var matrix = new THREE.Matrix4();
    matrix.extractRotation(transform.matrix);

    direction.applyMatrix4(matrix);

    let scaleFactor = 70;

    //camera is always facing player
    globals.camera.lookAt(this.gameObject.transform.position);

    if (inputManager.keys.a.down) {
      globals.camera.position.lerp(
        {
          x:
            this.gameObject.transform.position.x +
            (scaleFactor * direction.x) / 2,
          y: this.gameObject.transform.position.y - 10,
          z:
            this.gameObject.transform.position.z +
            (scaleFactor * direction.z) / 2
        },
        0.5
      );
    }

    if (inputManager.keys.s.down) {
      globals.camera.position.lerp(
        {
          x: this.gameObject.transform.position.x,
          y: this.gameObject.transform.position.y + 500,
          z: this.gameObject.transform.position.z
        },
        0.5
      );
    }
  }
}
