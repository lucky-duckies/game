class GameObjectManager {
  constructor() {
    this.gameObjects = new SafeArray();
  }
  createGameObject(parent, name, congaNdx = null) {
    const gameObject = new GameObject(parent, name, congaNdx);
    this.gameObjects.add(gameObject);
    return gameObject;
  }
  removeGameObject(gameObject) {
    this.gameObjects.remove(gameObject);
  }
  update() {
    this.gameObjects.forEach(gameObject => gameObject.update());
  }
}
