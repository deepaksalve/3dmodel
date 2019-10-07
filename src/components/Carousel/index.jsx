import React, { Component, Fragment } from 'react';

class Carousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: 0,
      totalSlides: React.Children.count(props.children),
    };
  }

  componentWillReceiveProps(nextProps) {
    const slides = React.Children.count(nextProps.children);

    if (this.state.totalSlides !== slides) {
      this.setState({ totalSlides: slides });
    }
  }

  onClickNext = e => {
    e.preventDefault();

    this.setState(prevState => ({
      activeIndex: prevState.activeIndex + 1 === prevState.totalSlides ? 0 : prevState.activeIndex + 1
    }));
  }

  onClickPrev = e => {
    e.preventDefault();

    this.setState(prevState => ({
      activeIndex: prevState.activeIndex <= 0 ? prevState.totalSlides - 1 : prevState.activeIndex - 1
    }));
  }

  render() {
    const { children } = this.props;
    const { activeIndex } = this.state;

    const currentItem = React.Children.toArray(children)[activeIndex];
    const label = [];

    if (currentItem && currentItem.props) {
      currentItem.props.catName && label.push(currentItem.props.catName);
      currentItem.props.modelName && label.push(currentItem.props.modelName);
    }

    return (
      <Fragment>
        <div className="carousel carousel-container h--f w--f d--f">
          <div className="carousel__action carousel__action--prev h--f d--t" onClick={this.onClickPrev}>
            <span className="carousel__action--label d--tc va--m ta--c">&lt; Prev</span>
          </div>
          <div className="carousel__items h--f">
            <div className="carousel__label w--f ta--c">{label.join(' :- ')}</div>
            <div className="carousel__item is-active w--f">{currentItem}</div>
          </div>
          <div className="carousel__action carousel__action--next h--f d--t" onClick={this.onClickNext}>
            <span className="carousel__action--label d--tc va--m ta--c">Next &gt;</span>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Carousel;
