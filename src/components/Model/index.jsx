
import React from 'react';
import { Color } from 'three-full/sources/math/Color';
import { Group } from 'three-full/sources/objects/Group';
import { Vector3 } from 'three-full/sources/math/Vector3';
import { Scene } from 'three-full/sources/scenes/Scene';
import { OBJLoader } from 'three-full/sources/loaders/OBJLoader';
import { WebGLRenderer } from 'three-full/sources/renderers/WebGLRenderer';
import { OrbitControls } from 'three-full/sources/controls/OrbitControls';
import { PerspectiveCamera } from 'three-full/sources/cameras/PerspectiveCamera';

import { computeBoundingBox, lightElements, tick } from '../../utils';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_BACKGROUND_COLOR } from '../../constants';

class Model extends React.Component {
  static defaultProps = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: CANVAS_BACKGROUND_COLOR,
    antialias: true,
    loader: 'obj',
    baseUrl: '',
    texPath: '',
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    enableKeys: true,
    enableRotate: true,
    enableZoom: true,
    enabled: true
  }

  get arrayChildren() {
    if (!this.props.children) return [];

    if (!(this.props.children instanceof Array)) return [this.props.children];

    return this.props.children;
  }

  get needChildrenLights() {
    return this.arrayChildren.filter((o) => /directionligth|ambientlight|spotlight/.test(o.props.__constructor)).length > 0;
  }

  constructor(props) {
    super(props);

    this.obj3d = null;
    this.src = null;

    this.state = {
      lights: []
    };

    this.lights = [];

    this.group = new Group();
  }

  componentDidUpdate() {
    if (!this.obj3d) return false;

    const { src, width, height } = this.props;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    const { enableKeys, enableRotate, enableZoom, enabled } = this.props;

    Object.assign(this.orbitControls, {
      enableKeys, enablePan: true, enableRotate, enableZoom, enabled
    });

    if (typeof this.src != 'undefined' && this.src != src) {
      this.src = src;
      this.remove3dModel();
      this.load3dModel();
    }

    this.lights.forEach((light) => this.scene.remove(light));
    this.lights = [];

    this.addLight('ambientlight', { color: 'rgb(30, 30, 30)', __constructor: 'ambientlight' });

    if (this.needChildrenLights) {
      this.addChildrenLights();
    } else {
      this.addLight('directionligth', {
        color: 'rgb(250, 250, 250)',
        __constructor: 'directionligth',
        position: new Vector3(-30, 30, 30),
        castShadow: true
      });
    }
  }

  componentWillUnmount() {
    if (this.tick) this.tick.animate = false;
  }

  componentDidMount() {
    const { width, height, antialias, background } = this.props;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, width / height, .1, 8888);
    this.renderer = new WebGLRenderer({ antialias });

    this.renderer.setClearColor(new Color(background));
    this.renderer.setSize(width, height);

    this.containerNode.appendChild(this.renderer.domElement);

    this.scene.add(this.group);

    this.camera.position.set(0, 0, .1);

    this.createDefaultLight();

    const { position, rotation, scale } = this.props;

    this.group.position.copy(new Vector3(position.x, position.y, position.z));
    this.group.rotation.set(rotation.x, rotation.y, rotation.z);
    this.group.scale.set(scale.x, scale.y, scale.z);

    this.load3dModel();

    this.tick = tick(() => {
      this.renderer.render(this.scene, this.camera);

      if (this.obj3d) {
        if (!this.group.children.length) this.group.add(this.obj3d);

        const { position, rotation, scale } = this.props;
        this.group.position.copy(new Vector3(position.x, position.y, position.z));
        this.group.rotation.set(rotation.x, rotation.y, rotation.z);
        this.group.scale.set(scale.x, scale.y, scale.z);
      }
    });
  }

  initControl() {
    const { enableKeys, enableRotate, enableZoom, enabled } = this.props;

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

    Object.assign(this.orbitControls, {
      enableKeys, enablePan: true, enableRotate, enableZoom, enabled
    });

    this.orbitControls.update();
  }

  remove3dModel() {
    if (this.obj3d) {
      this.scene.remove(this.obj3d);
    }
  }

  load3dModel() {
    const { src } = this.props;

    if (!src) return false;

    try {
      const objLoader = new OBJLoader();

      objLoader.load(
        src,
        obj3d => {
          const bBox = computeBoundingBox(obj3d);
          const front = bBox.max;
          const cz = bBox.max.z - bBox.min.z;

          this.camera.position.set(0, 0, front.z + cz * 1.5);

          this.initControl();

          this.obj3d = obj3d;

          this.props.onLoad && this.props.onLoad()
        },

        xhr => {
          this.props.onProgress && this.props.onProgress(xhr);
        },
        error => {
          this.props.onError && this.props.onError(error);
        }
      );
    } catch (error) {
      this.props.onError && this.props.onError(error);
    }
  }

  style() {
    const { width, height } = this.props;

    return Object.assign({}, {
      width: width + 'px',
      height: height + 'px',
    });
  }

  traverseScene() {}

  createEnvironment() {}

  addLight(__constructor, props) {
    if (!(/directionligth|ambientlight|spotlight/.test(__constructor))) return;

    const o = lightElements[__constructor].create(props);

    this.scene.add(o);

    this.lights.push(o);

    return o;
  }

  addChildrenLights() {
    this.lights.forEach((light) => { this.scene.remove(light); });
    this.lights = [];

    this.arrayChildren.map(o => {
      const { props } = o;
      const { __constructor } = props;

      this.addLight(__constructor, props);
    });
  }

  createDefaultLight() {
    this.addLight('ambientlight', { color: 'rgb(30,30,30)', __constructor: 'ambientlight' });

    if (this.needChildrenLights) {
      this.addChildrenLights();
    } else {
      this.addLight('directionligth', {
        color: 0xffffff,
        __constructor: 'directionligth',
        position: new Vector3(-30, 30, 30),
        castShadow: true
      });
    }
  }

  render() {
    return (
      <div
        ref={n => this.containerNode = n}
        data-loader={this.props.loader}
        style={this.style()}
      />
    );
  }
}

export default Model;
