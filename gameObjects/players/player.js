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

        // the following code gets the direction vector that our bird is facing
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(transform.matrix);
    
        direction.applyMatrix4(matrix);
    
        //multiply vector to make it longer?
        //add direction onto location of camera
        let scaleFactor = 70;


    // camera follows behind player at (position, going speed (between 0 and 1))
    globals.camera.position.lerp(
      {
        //direction accounts for players rotation
        x: this.gameObject.transform.position.x - (direction.x * 40),
        y: this.gameObject.transform.position.y + 45,
        z: this.gameObject.transform.position.z - (direction.z * 40)
      },
      1
    );
    //camera is always facing the same direction as the player
    globals.camera.lookAt(this.gameObject.transform.position.x + direction.x + 10, 
      this.gameObject.transform.position.y, this.gameObject.transform.position.z + direction.z);

    //first person view
    if(inputManager.keys.a.down) {
        globals.camera.position.lerp(
          {
            x: this.gameObject.transform.position.x + (direction.x * 50),
            y: this.gameObject.transform.position.y - 30,
            z: this.gameObject.transform.position.z + (direction.z * 50)
          },
          0.5
        );
          globals.camera.lookAt(this.gameObject.transform.position.x + (direction.x * 100), 
          this.gameObject.transform.position.y, this.gameObject.transform.position.z + (direction.z * 100))
    }

    //overhead view
    if (inputManager.keys.s.down) {
      globals.camera.position.lerp(
        {
          x: this.gameObject.transform.position.x,
          y: this.gameObject.transform.position.y + 500,
          z: this.gameObject.transform.position.z
        },
        0.5
      );

      globals.camera.lookAt(this.gameObject.transform.position)
    }
  }
}
