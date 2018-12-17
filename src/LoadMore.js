import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch; // enhance ios scrolling
`;

const Content = styled(Wrapper)`
  overflow: ${props => (props.loaderState ? 'hidden !important' : 'none')};
`;

const LoaderBody = styled.div`

`;

const STATUS = {
  init: '',
  refreshed: 'refreshed'
};

// find them exported for ES6 consumption here: https://github.com/jaxgeller/ez.js
// t: current time, b: beginning value, c: change in value, d: duration
function easeOutSine(distance) {
  const t = distance;
  const b = 0;
  const d = document.documentElement.clientHeight;
  const c = d / 2;
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
}

class LoadMore extends Component {
  static propTypes = {
    color: PropTypes.string,
    className: PropTypes.string
  };

  state = {
    loaderState: STATUS.init
  };

  handleClick = () => {
    this.setState({
      loaderState: STATUS.refreshed
    });
  };

  render() {
    const { color, className } = this.props;
    const { loaderState } = this.state;
    const events = {
      onTouchStart: this.handleTouchStart,
      onTouchEnd: this.handleTouchEnd,
      onScroll: this.handleOnScroll,
      onAnimationEnd: this.handleOnAnimationEnd
    };
    console.log(loaderState);
    return (
      <Content
        ref={(el) => {
          this.panel = el;
        }}
        {...events}
        className={className}
        loaderState={loaderState}
      >
        <LoaderBody>
          <h1>123</h1>
          <h1 onClick={this.handleClick}>{color}</h1>
        </LoaderBody>
      </Content>
    );
  }
}

export default LoadMore;
