/* eslint-disable complexity */
/* eslint-disable react/no-multi-comp */
/* eslint-disable max-statements */
"use strict";

/* global THREE, dat */
var vertex = new THREE.Vector3();
var color = new THREE.Color();
var listener = new THREE.AudioListener();

var blocker = document.getElementById("blocker");

var win = document.getElementById("win");

blocker.style.display = "none";

win.style.display = "none";
lose.style.display = "none";
let floorOn = true;

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 70, 40);
  // adding background music to the game
  camera.add(listener);
  // create a global audio source
  var sound = new THREE.Audio(listener);

  var audioLoader = new THREE.AudioLoader();
  audioLoader.load("resources/music/Horror Stories.ogg", function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  });

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableKeys = false;
  controls.target.set(0, 10, 0);
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  function addLight(...pos) {
    const color = 0xffffff;
    const intensity = 0.7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
    scene.add(light.target);
  }
  addLight(50, 4000, 20);
  addLight(-50, 4000, 50);

  // floor
  if (floorOn) {
    var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    // vertex displacement

    var position = floorGeometry.attributes.position;

    for (var i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2 - 10;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    var colors = [];

    for (var i = 0, l = position.count; i < l; i++) {
      color.setHSL(
        Math.random() * 0.3 + 0.23, // hue (color tone)
        0.38, // saturation
        Math.random() * 0.1 + 0.05 // lightness (closer to 1 means lighter)
      );
      colors.push(color.r, color.g, color.b);
    }

    floorGeometry.addAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    var floorMaterial = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);
  }
  // end floor

  //displays instruction screen, initializes game when player clicks start
  const manager = new THREE.LoadingManager();

  // displays a loading bar
  const progressbarElem = document.querySelector("#progressbar");
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width = `${((itemsLoaded / itemsTotal) * 100) | 0}%`;
  };

  manager.onLoad = function() {
    // hide the loading bar
    const loadingElem = document.querySelector("#loadStatus");
    loadingElem.style.display = "none";

    // load start button
    const loadedElem = document.querySelector("#loaded");
    loadedElem.style.display = "flex";

    //start game before player can see
    //this should be moved inside of the onClick if
    //a timer is implemented, but player will see
    //a quick screen render
    init();

    document.getElementById("startBtn").onclick = function() {
      //hide instructions screen
      const instructions = document.querySelector("#loading");
      instructions.style.display = "none";
    };
  };

  {
    const gltfLoader = new THREE.GLTFLoader(manager);
    for (const model of Object.values(models)) {
      gltfLoader.load(model.url, gltf => {
        model.gltf = gltf;
      });
    }
  }

  function prepModelsAndAnimations() {
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    Object.values(models).forEach(model => {
      box.setFromObject(model.gltf.scene);
      box.getSize(size);
      model.size = size.length();
      const animsByName = {};
      model.gltf.animations.forEach(clip => {
        animsByName[clip.name] = clip;
        // Should really fix this in .blend file
        if (clip.name === "Walk") {
          clip.duration /= 2;
        }
      });
      model.animations = animsByName;
    });
  }

  const kForward = new THREE.Vector3(0, 0, 1);
  globals = {
    camera,
    canvas,
    debug: true,
    time: 0,
    moveSpeed: 16,
    deltaTime: 0,
    player: null,
    duckCount: 0,
    obstacles: [],
    environment: [],
    fireballs: []
  };
  gameObjectManager = new GameObjectManager();
  inputManager = new InputManager();

  function init() {
    prepModelsAndAnimations();

    {
      const gameObject = gameObjectManager.createGameObject(camera, "camera");
      globals.cameraInfo = gameObject.addComponent(CameraInfo);
    }

    {
      const gameObject = gameObjectManager.createGameObject(scene, "player");
      globals.player = gameObject.addComponent(Player);
      gameObject.transform.position.x = -30;
      gameObject.transform.position.y = 5;
    }

    {
      const gameObject = gameObjectManager.createGameObject(scene, "zebra");
      globals.zebra = gameObject.addComponent(Animal, models["zebra"]);
      gameObject.transform.position.x = 2;
      gameObject.transform.position.y = 5;
    }

    {
      const gameObject = gameObjectManager.createGameObject(scene, "horse");
      globals.horse = gameObject.addComponent(Obstacle, models["horse"]);
      gameObject.transform.position.x = 25;
      gameObject.transform.position.z = -105;
      globals.obstacles.push(globals.horse);
    }

    {
      const gameObject = gameObjectManager.createGameObject(scene, "venus");
      globals.venus = gameObject.addComponent(Venus, models["venus"]);
      gameObject.transform.position.x = 25;
      gameObject.transform.position.z = -85;
      globals.obstacles.push(globals.venus);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "mushroom");
      globals.mushroom = gameObject.addComponent(Mushroom, models["mushroom"]);
      gameObject.transform.position.x = 25;
      gameObject.transform.position.z = -135;

      globals.obstacles.push(globals.mushroom);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "spider");
      globals.spider = gameObject.addComponent(Spider, models["spider"]);
      gameObject.transform.position.x = 25;
      gameObject.transform.position.z = -205;

      globals.obstacles.push(globals.spider);
    }

    // {
    //   const gameObject = gameObjectManager.createGameObject(scene, "tree");
    //   gameObject.addComponent(Obstacle, models["tree"]);
    //   gameObject.transform.position.x = 0;
    //   gameObject.transform.position.z = 0;
    //   gameObject.transform.position.y = 0;
    //   //globals.obstacles.push(globals.mushroom);
    // }

    // eslint-disable-next-line no-lone-blocks
    // first circle of trees
    {
      const radius = 55;
      let numTrees = 12;
      for (let i = 0; i < numTrees; i++) {
        if (!(i > 5 && i < 8)) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          gameObject.addComponent(Tree, models["tree"]);
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 6)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 6)) * radius;
        }
      }
    }

    // second circle of trees
    {
      const radius = 105;
      let numTrees = 24;
      for (let i = 0; i < numTrees; i++) {
        if (!(i > 5 && i < 8)) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          gameObject.addComponent(Tree, models["tree"]);
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 12)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 12)) * radius;
        }
      }
    }

    {
      const radius = 155;
      let numTrees = 50;
      for (let i = 0; i < numTrees; i++) {
        if (!(i > 5 && i < 8)) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          gameObject.addComponent(Tree, models["tree"]);
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 24)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 24)) * radius;
        }
      }
    }

    {
      const ducks = ["duck", "duck", "duck"];
      ducks.forEach((name, ndx) => {
        globals.duckCount++;
        const gameObject = gameObjectManager.createGameObject(scene, name);
        gameObject.addComponent(Duck);
        gameObject.transform.position.x = -30 - ndx * 7;
        gameObject.transform.position.y = 0;
      });
    }

    const animalModelNames = ["zebra", "horse", "phoenix"];
  }

  // loading obj trees
  // {
  //   const objLoader = new THREE.OBJLoader2();
  //   objLoader.loadMtl(
  //     "resources/models/windmill/tree3.mtl",
  //     null,
  //     materials => {
  //       objLoader.setMaterials(materials);
  //       objLoader.load("resources/models/windmill/tree3.obj", event => {
  //         const root = event.detail.loaderRootNode;
  //         scene.add(root);
  //       });
  //     }
  //   );
  // }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl("resources/models/pond/flower.mtl", null, materials => {
      objLoader.setMaterials(materials);
      objLoader.load("resources/models/pond/flower.obj", event => {
        const root = event.detail.loaderRootNode;
        scene.add(root);
      });
    });
  }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl("resources/models/pond/pond.mtl", null, materials => {
      objLoader.setMaterials(materials);
      objLoader.load("resources/models/pond/pond.obj", event => {
        const root = event.detail.loaderRootNode;
        scene.add(root);
      });
    });
  }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl("resources/models/pond/floor2.mtl", null, materials => {
      objLoader.setMaterials(materials);
      objLoader.load("resources/models/pond/floor2.obj", event => {
        const root = event.detail.loaderRootNode;
        scene.add(root);
      });
    });
  }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl(
      "resources/models/pond/floorOutside2.mtl",
      null,
      materials => {
        objLoader.setMaterials(materials);
        objLoader.load("resources/models/pond/floorOutside2.obj", event => {
          const root = event.detail.loaderRootNode;

          scene.add(root);
        });
      }
    );
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let then = 0;
  function render(now) {
    // convert to seconds
    globals.time = now * 0.001;
    // make sure delta time isn't too big.
    globals.deltaTime = Math.min(globals.time - then, 1 / 20);
    then = globals.time;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    gameObjectManager.update();
    inputManager.update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
