import { useRef, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three/build/three";
//import { ArToolkitProfile, ArToolkitSource, ArToolkitContext, ArMarkerControls} from 'ar-js-org/three.js/build/ar-THREEx.js';
import * as THREEx from "ar-js-org/three.js/build/ar-threex";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

function App() {
  useEffect(() => {
    console.log(THREE);
    window.THREE = THREE;
  }, []);

  useEffect(() => {
    console.log("hier hier", THREE);
    var scene, camera, renderer, clock, deltaTime, totalTime;
    console.log(THREE);
    var arToolkitSource, arToolkitContext;

    var markerRoot1, markerRoot2;

    var mesh1;
    let domdom;

    initialize();
    animate();
    function initialize() {
      scene = new THREE.Scene();

      let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
      scene.add(ambientLight);

      camera = new THREE.Camera();
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setClearColor(new THREE.Color("lightgrey"), 0);
      renderer.setSize(width, height);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0px";
      renderer.domElement.style.left = "0px";
      renderer.domElement.style.width = width+"px";
      renderer.domElement.style.height = height+"px";
      document.getElementById("app").appendChild(renderer.domElement);
      //appDom.appendChild(renderer.domElement)
      //domdom = renderer.domElement;
      //console.log(domdom)
      clock = new THREE.Clock();
      deltaTime = 0;
      totalTime = 0;

      ////////////////////////////////////////////////////////////
      // setup arToolkitSource
      ////////////////////////////////////////////////////////////

      arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: "webcam",
        sourceWidth: height,
        sourceHeight: height,
      });

      function onResize() {
        arToolkitSource.onResize();
        arToolkitSource.copySizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
          arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
        }
      }

      arToolkitSource.init(function onReady() {
        onResize();
      });
     
      // handle resize event
      window.addEventListener("resize", function () {
        onResize();
      });

      ////////////////////////////////////////////////////////////
      // setup arToolkitContext
      ////////////////////////////////////////////////////////////

      // create atToolkitContext
      arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: "data/camera_para.dat",
        detectionMode: "mono",
      });

      // copy projection matrix to camera when initialization complete
      arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
      });

      ////////////////////////////////////////////////////////////
      // setup markerRoots
      ////////////////////////////////////////////////////////////

      // build markerControls
      markerRoot1 = new THREE.Group();
      scene.add(markerRoot1);
      let markerControls1 = new THREEx.ArMarkerControls(
        arToolkitContext,
        markerRoot1,
        {
          type: "pattern",
          patternUrl: "data/hiro.patt",
        }
      );


      let geometry1 = new THREE.BoxGeometry(1, 1, 1);
      let material1 = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });

      mesh1 = new THREE.Mesh(geometry1, material1);
      mesh1.position.y = 0.5;

      let svgIcon = doTheSVGthing();
      svgIcon.scale.set(0.1,0.1,0.1);
      svgIcon.rotation.set(0,0.2,0);
      markerRoot1.add(svgIcon);
    }

    function doTheSVGthing() {
      // Get SVG's markup
      const svgMarkup = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>AddThis</title><path d="M18 13.496h-4.501v4.484h-3v-4.484H6v-2.99h4.5V6.021h3.001v4.485H18v2.99zM21 .041H3C1.348.043.008 1.379 0 3.031v17.94c.008 1.65 1.348 2.986 3 2.988h18c1.651-.002 2.991-1.338 3-2.988V3.031c-.009-1.652-1.348-2.987-3-2.99z"/></svg>`;
      const loader = new SVGLoader();
      const svgData = loader.parse(svgMarkup);
      // Group that will contain all of our paths
      const svgGroup = new THREE.Group();

      const material = new THREE.MeshNormalMaterial();

      // Loop through all of the parsed paths
      svgData.paths.forEach((path, i) => {
        const shapes = path.toShapes(true);

        // Each path has array of shapes
        shapes.forEach((shape, j) => {
          // Finally we can take each shape and extrude it
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 20,
            bevelEnabled: false,
          });

          // Create a mesh and add it to the group
          const mesh = new THREE.Mesh(geometry, material);

          svgGroup.add(mesh);
        });
      });

      // Add our group to the scene (you'll need to create a scene)
      return svgGroup;
    }

    function update() {
      // update artoolkit on every frame
      if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);
    }

    function render() {
      renderer.render(scene, camera);
    }

    function animate() {
      requestAnimationFrame(animate);
      deltaTime = clock.getDelta();
      totalTime += deltaTime;
      update();
      render();
    }
  }, [window.THREE]);

  return (
    <div className="App">
      <div id="app"></div>
    </div>
  );
}

export default App;
