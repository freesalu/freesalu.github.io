/**
 * A very inefficient implementation of Conway's GoL in 3D.
 */
const gameOfLife = () => {
  const { Vector3 } = THREE;

  const neighbourOffsets = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) {
          continue;
        }
        neighbourOffsets.push(new Vector3(x, y, z));
      }
    }
  }

  const Room = new Vector3(15, 15, 3);
  const RoomCenter = Room.clone().divideScalar(2);
  const MaxInitialCells = (Room.x * Room.y * Room.z) / 4;
  const UpdateInterval = 750;

  const Positions = [];
  for (let x = 0; x < Room.x; x++) {
    for (let y = 0; y < Room.y; y++) {
      for (let z = 0; z <= Room.z; z++) {
        Positions.push(new Vector3(x, y, z));
      }
    }
  }

  const { innerWidth, innerHeight } = window;

  const divTarget = document.getElementById("three");

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: divTarget,
  });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0xdddddd, 1);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  let currentCamera;
  const useCamera = (perspective) => {
    let camera;
    if (perspective) {
      camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight);
      camera.position.copy(
        new Vector3(RoomCenter.x, RoomCenter.y - 10, Room.z + 15)
      );
      camera.lookAt(RoomCenter);
    } else {
      camera = new THREE.OrthographicCamera(0, Room.x, 0, Room.y, 1, 100);
    }

    scene.remove(currentCamera);
    scene.add(camera);
    currentCamera = camera;
  };

  useCamera(false);

  document.getElementById("switch").addEventListener("click", () => {
    useCamera(!currentCamera.isPerspectiveCamera);
  });

  // Alive cells.
  let cells = [];

  const addCell = (p) => {
    if (["x", "y", "z"].some((key) => Room[key] > p[key] < 0)) {
      return;
    }
    const id = cells.length;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(-0.5, -0.5, -0.5);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.25 / (p.z + 1),
      transparent: true,
    });
    const cube = new THREE.Mesh(geometry, material);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0x0,
        opacity: 0.1,
        transparent: true,
      })
    );
    cube.add(line);
    cube.position.copy(p);
    cube.userData.cell = true;
    cells.push({ p, m: cube });

    scene.add(cube);
  };

  const randInt = (range) => Math.ceil(Math.random() * range);

  const randomizeCells = () => {
    const cellCount = randInt(MaxInitialCells);
    for (let i = 0; i < cellCount; i = i + 1) {
      addCell(new Vector3(randInt(Room.x), randInt(Room.y), randInt(Room.z)));
    }
  };

  let start;
  let iter;

  const startGame = () => {
    scene.children.forEach((c) => {
      if (c.userData.cell) {
        scene.remove(c);
      }
    });
    randomizeCells();
    start = undefined;
    iter = 1;
  };

  const updateGame = () => {
    let alive = 0;
    let stayed = 0;
    for (const position of Positions) {
      const aliveN = neighbourOffsets
        .map((offset) => {
          return cells.find(({ p }) => p.equals(position.clone().add(offset)))
            ? 1
            : 0;
        })
        .reduce((acc, v) => acc + v, 0);
      const isAlive = aliveN === 3;
      const currentCell = cells.find(({ p }) => p.equals(position));
      if (isAlive) {
        if (!currentCell) {
          addCell(position);
        } else {
          stayed += 1;
          currentCell.m.material.color.set(0x00ff00);
        }
        alive += 1;
      } else if (currentCell) {
        scene.remove(currentCell.m);
        cells = cells.filter((c) => c.m !== currentCell.m);
      }
    }

    if (alive === 0 || alive === stayed) {
      startGame();
    }
  };

  function render(timestamp) {
    requestAnimationFrame(render);

    if (!start) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    if (elapsed > iter * UpdateInterval) {
      updateGame();
      iter = Math.ceil(elapsed / UpdateInterval);
    }

    renderer.render(scene, currentCamera);
  }
  render();

  startGame();
  updateGame();
};

gameOfLife();
