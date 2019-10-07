import { DirectionalLight } from 'three-full/sources/lights/DirectionalLight';
import { AmbientLight } from 'three-full/sources/lights/AmbientLight';
import { Mesh } from 'three-full/sources/objects/Mesh';
import { Box3 } from 'three-full/sources/math/Box3';
import { Color } from 'three-full/sources/math/Color';
import { Vector3 } from 'three-full/sources/math/Vector3';

import axios from 'axios';

import { API_BASE_URL } from './constants';

export const relativeUrl = (url = '') => {
  return url.replace(API_BASE_URL, '/api');
};

export const mapModels = (models = []) => {
  if (models && models.reduce) {
    return models.reduce((prev, cat) => {
      if (cat && cat.models) {
        cat.models.map(model => {
          if (/\.obj$/.test(model.obj)) {
            prev.push({
              id: uuidv4(),
              catName: cat.name,
              modelName: model.name,
              modelObj: relativeUrl(model.obj)
            });
          }
        });
      }

      return prev;
    }, []);
  }

  return [];
};

export const fetchData = (url) => {
  if (typeof url !== 'string') return Promise.resolve();

  return axios.get(url);
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
};

export const lightElements = {
  directionligth: {
    create({ color, position, castShadow } = {}) {
      const directionLight = new DirectionalLight(new Color(color), 0.95);

      directionLight.position.set(position.x, position.y, position.z);

      directionLight.castShadow = castShadow;

      return directionLight;
    }
  },

  ambientlight: {
    create({ color } = {}) {
      return new AmbientLight(new Color(color));
    }
  },

  spotlight: {
    create() { }
  }
};

export const computeBoundingBox = obj => {
  if (obj instanceof Mesh) {
    const geometry = obj.geometry;

    if (geometry) {
      if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
      }

      const geometryBBox = geometry.boundingBox;
      obj.updateMatrix();
      geometryBBox.applyMatrix4(obj.matrix);

      return geometryBBox;
    }

    return new Box3(new Vector3, new Vector3);
  } else {
    const len = obj.children.length;
    const boundingBox = new Box3(new Vector3, new Vector3);

    for (let i = 0; i < len; i++) {
      const bBox = computeBoundingBox(obj.children[i]);

      if (bBox.min.x < boundingBox.min.x) boundingBox.min.x = bBox.min.x;
      if (bBox.max.x > boundingBox.max.x) boundingBox.max.x = bBox.max.x;

      if (bBox.min.y < boundingBox.min.y) boundingBox.min.y = bBox.min.y;
      if (bBox.max.y > boundingBox.max.y) boundingBox.max.y = bBox.max.y;

      if (bBox.min.z < boundingBox.min.z) boundingBox.min.z = bBox.min.z;
      if (bBox.max.z > boundingBox.max.z) boundingBox.max.z = bBox.max.z;
    }

    obj.updateMatrix();
    boundingBox.applyMatrix4(obj.matrix);

    return boundingBox;
  }
};

export let tick = (fuc, name) => {
  const Renderer = { animate: true, name: '' };

  const els = [
    Object.assign(Object.create(Renderer), { fuc, name })
  ];

  const animate = () => {
    requestAnimationFrame(animate);

    els.forEach(o => {
      const { fuc, animate } = o

      if (animate) fuc.call(o, Date.now());
    });
  };

  animate();

  tick = (fuc, name) => {
    const o = Object.assign(Object.create(Renderer), { fuc, name });

    els.push(o);

    return o;
  };

  return els[0];
};
