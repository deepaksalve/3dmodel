import React, { Component, Fragment } from 'react';

import Carousel from './components/Carousel';
import Loader from './components/Loader';
import Model from './components/Model';

import { API_META_DATA } from './constants';
import { fetchData, mapModels } from './utils';

class App extends Component {
  state = {
    models: [],
    isLoading: false
  }

  get canvasDimensions() {
    // 90% of width - the width of Prev+Next button
    return {
      width: (window.innerWidth * .9) - 152,
      height: (window.innerHeight * .8) - 36
    };
  }

  componentDidMount() {
    fetchData(`${window.origin}/${API_META_DATA}`).then(
      resp => {
        if (resp && resp.data && resp.data.categories) {
          this.setState({ models: mapModels(resp.data.categories) });
        }
      },
      err => {
        console.log('\n\nerr =-----> ', err);
      }
    );
  }

  onProgress = xhr => {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total;

      this.setState({ isLoading: percentComplete < 1 });
    }
  }

  onError = err => {
    console.log('err =-----> ', err);
  }

  render() {
    const { width, height } = this.canvasDimensions;

    return (
      <Fragment>
        <header className="site-header text-3d">3D Models</header>
        <div className="main-container">
          <Carousel>
            {this.state.models.map(model => (
              <Model
                key={model.id}
                width={width}
                height={height}
                src={model.modelObj}
                onError={this.onError}
                catName={model.catName}
                modelName={model.modelName}
                onProgress={this.onProgress}
              />
            ))}
          </Carousel>
        </div>
        {this.state.isLoading && <Loader />}
      </Fragment>
    );
  }
}

export default App;
