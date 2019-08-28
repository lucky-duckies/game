/* eslint-disable complexity */
/* eslint-disable react/no-multi-comp */
/* eslint-disable max-statements */
"use strict";

/* global THREE, dat */
const vertex = new THREE.Vector3();
const color = new THREE.Color();
const listener = new THREE.AudioListener();

const blocker = document.getElementById("blocker");
const win = document.getElementById("win");
const lose = document.getElementById("lose");
const help = document.getElementById("help");
const score = document.getElementById("score");
const animatedBanner = document.querySelector(".banner");

blocker.style.display = "none";
win.style.display = "none";
lose.style.display = "none";

let floorOn = true;
let skyOn = true;

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 70, 40);
  // adding background music to the game
  // camera.add(listener);
  // // create a global audio source
  // const sound = new THREE.Audio(listener);

  // const audioLoader = new THREE.AudioLoader();
  // audioLoader.load("resources/music/Horror Stories.ogg", function(buffer) {
  //   sound.setBuffer(buffer);
  //   sound.setLoop(true);
  //   sound.setVolume(0.5);
  //   sound.play();
  // });

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

  // sky
  if (skyOn){
    const sky = new Sky();
    sky.scale.setScalar( 45000 );
    scene.add(sky);

    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 20000, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );

    const defaultSkyVals = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.010,
      mieDirectionalG: 0.72,
      luminance: 1,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.37, // Facing front,
      sun: ! true
    };

    const distance = 400;

    const uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = defaultSkyVals.turbidity;
    uniforms[ "rayleigh" ].value = defaultSkyVals.rayleigh;
    uniforms[ "mieCoefficient" ].value = defaultSkyVals.mieCoefficient;
    uniforms[ "mieDirectionalG" ].value = defaultSkyVals.mieDirectionalG;
    uniforms[ "luminance" ].value = defaultSkyVals.luminance;
    
    const theta = Math.PI * ( defaultSkyVals.inclination - 0.5 );
    const phi = 2 * Math.PI * ( defaultSkyVals.azimuth - 0.5 );
    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
    sunSphere.visible = defaultSkyVals.sun;
    uniforms[ "sunPosition" ].value.copy( sunSphere.position );
  }

  // floor
  if (floorOn) {
    let floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    // vertex displacement

    let position = floorGeometry.attributes.position;

    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2 - 10;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colors = [];

    for (let i = 0, l = position.count; i < l; i++) {
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

    const floorMaterial = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
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

    //game starts if user presses enter
    document.addEventListener("keyup", event => {
      event.preventDefault();
      if (event.keyCode === 13 || event.keyCode === 36) {
        document.getElementById("startBtn").click();
      }
    });

    document.getElementById("startBtn").onclick = function() {
      //hide instructions screen
      const instructions = document.querySelector("#loading");
      instructions.style.display = "none";
      //hide start button
      const startPrompt = document.querySelector("#loaded");
      startPrompt.style.display = "none";
      //hide falling duckies and stars
      animatedBanner.style.display = "none";
      //show help button
      help.style.display = "block";
    };
  };

  //help button toggles instructions
  document.getElementById("help").addEventListener("click", event => {
    const instructions = document.querySelector("#loading");
    if (instructions.style.display === "none") {
      //show instructions screen
      instructions.style.opacity = 0.8;
      instructions.style.display = "flex";
      //show falling duckies and stars
      const animatedBanner = document.querySelector(".banner");
      animatedBanner.style.opacity = 0.8;
      animatedBanner.style.display = "flex";
    } else {
      document.getElementById("startBtn").click();
    }
  });

  //nesting these under one query/class doesn't work for some reason
  document.getElementById("restartBtn").onclick = function() {
    window.location.reload();
  };
  document.getElementById("replayBtn").onclick = function() {
    window.location.reload();
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

  globals = {
    camera,
    canvas,
    debug: true,
    time: 0,
    moveSpeed: 16,
    deltaTime: 0,
    player: null,
    duckCount: 0,
    originalCount: 0,
    obstacles: [],
    environment: [],
    fireballs: [],
    trees: [],
    ducks: []
  };
  gameObjectManager = new GameObjectManager();
  inputManager = new InputManager();

  function init() {
    prepModelsAndAnimations();

    {
      const gameObject = gameObjectManager.createGameObject(camera, "camera");
      globals.cameraInfo = gameObject.addComponent(CameraInfo);
    }
    //below: adding 3D models to environment

    {
      const gameObject = gameObjectManager.createGameObject(scene, "venus");
      globals.venus = gameObject.addComponent(Obstacle, models["venus"]);
      gameObject.transform.position.x = 70;
      gameObject.transform.position.z = 120;
      globals.obstacles.push(globals.venus);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "venus");
      globals.venus = gameObject.addComponent(Obstacle, models["venus"]);
      gameObject.transform.position.x = 25;
      gameObject.transform.position.z = -125;
      globals.obstacles.push(globals.venus);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "mushroom");
      globals.mushroom = gameObject.addComponent(Obstacle, models["mushroom"]);
      gameObject.transform.position.x = -115;
      gameObject.transform.position.z = 50;

      globals.obstacles.push(globals.mushroom);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "mushroom");
      globals.mushroom = gameObject.addComponent(Obstacle, models["mushroom"]);
      gameObject.transform.position.x = -85;
      gameObject.transform.position.z = -85;

      globals.obstacles.push(globals.mushroom);
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "spider");
      globals.spider = gameObject.addComponent(Obstacle, models["spider"]);
      gameObject.transform.position.x = -20;
      gameObject.transform.position.z = -105;

      globals.obstacles.push(globals.spider);
    }

    // first circle of trees
    {
      const radius = 55;
      let numTrees = 12;
      for (let i = 0; i < numTrees; i++) {
        if (i !== 11) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          globals.trees.push(gameObject.addComponent(Tree, models["tree"]));
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 6)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 6)) * radius;
        }
      }
    }

    {
      const radius = 80;
      let numTrees = 20;
      for (let i = 0; i < numTrees; i++) {
        if (i === 1 || i === 8 || i === 18) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          globals.trees.push(gameObject.addComponent(Tree, models["tree"]));
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 12)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 12)) * radius;
        }
      }
    }

    // second circle of trees
    {
      const radius = 105;
      let numTrees = 24;
      for (let i = 0; i < numTrees; i++) {
        if (
          !(i > 11 && i < 13) &&
          i !== 10 &&
          !(i > 6 && i < 8) &&
          i !== 2 &&
          i !== 23 &&
          i !== 17
        ) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          globals.trees.push(gameObject.addComponent(Tree, models["tree"]));
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 12)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 12)) * radius;
        }
      }
    }

    // trees connecting outer circle with middle circle
    {
      const radius = 130;
      let numTrees = 50;
      for (let i = 0; i < numTrees; i++) {
        if (i === 23 || i === 32 || i === 36 || i === 6) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          globals.trees.push(gameObject.addComponent(Tree, models["tree"]));
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 24)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 24)) * radius;
        }
      }
    }

    {
      const radius = 155;
      let numTrees = 50;
      for (let i = 0; i < numTrees; i++) {
        if (!(i > 23 && i < 26)) {
          const gameObject = gameObjectManager.createGameObject(scene, "tree");
          globals.trees.push(gameObject.addComponent(Tree, models["tree"]));
          gameObject.transform.position.x =
            Math.cos(i * (Math.PI / 24)) * radius;
          gameObject.transform.position.z =
            Math.sin(i * (Math.PI / 24)) * radius;
        }
      }
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "player");
      globals.player = gameObject.addComponent(Player);
      gameObject.transform.position.x = -130;
      gameObject.transform.position.y = 5;
    }
    {
      const ducks = ["duck", "duck", "duck"];
      ducks.forEach((name, ndx) => {
        globals.duckCount++;
        const gameObject = gameObjectManager.createGameObject(
          scene,
          name,
          ndx + 1
        );
        globals.ducks.push(gameObject.addComponent(Duck));
        gameObject.transform.position.x = -130 - ndx * 7;
        gameObject.transform.position.y = 5;
      });
      globals.originalCount = globals.duckCount;
    }
    {
      const gameObject = gameObjectManager.createGameObject(scene, "mama");
      globals.zebra = gameObject.addComponent(Mama, models["mama"]);
      gameObject.transform.position.x = 7;
      gameObject.transform.position.y = 2;
      gameObject.transform.position.z = 2;
    }
  }
  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl("resources/models/pond/flower2.mtl", null, materials => {
      objLoader.setMaterials(materials);
      objLoader.load("resources/models/pond/flower2.obj", event => {
        const root = event.detail.loaderRootNode;
        scene.add(root);
      });
    });
  }

  {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl("resources/models/pond/pond4.mtl", null, materials => {
      objLoader.setMaterials(materials);
      objLoader.load("resources/models/pond/pond4.obj", event => {
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
