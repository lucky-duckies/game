class CameraInfo extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.projScreenMatrix = new THREE.Matrix4();
    this.frustum = new THREE.Frustum();
  }
  update() {
    const { camera } = globals;
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromMatrix(this.projScreenMatrix);
  }
}
