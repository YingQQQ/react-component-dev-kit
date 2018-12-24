import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';

import { listen } from './events';

const pullingMsg = '下拉刷新';
const pullingEnoughMsg = '松开刷新';
const refreshedMsg = '刷新成功';
const refreshingMsg = '正在刷新...';
const Height = '40px';
const fontColor = '#999';

const content = (loaderState) => {
  switch (loaderState) {
    case 'pulling':
      return pullingMsg;
    case 'pullEnough':
      return pullingEnoughMsg;
    case 'refreshing':
      return refreshingMsg;
    case 'refreshed':
      return refreshedMsg;
    default:
      return null;
  }
};


const refreshed = keyframes`
  0% {
    transform: translate3d(0, ${Height}, 0);
  }
  50% {
    transform: translate3d(0, ${Height}, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const refreshedRule = time => css`
  ${refreshed} ${time}s;
`;

/*
  * 标明了top和bottom滑动的就是View而不再是document.body,
  * hidden去除wrap层的滚动条，确保只有scrol层有滚动条
  * 使用3d加速时，尽可能的使用index，防止浏览器默认给后续的元素创建复合层渲染
  * 因为CSS3中，如果这个元素添加了硬件加速，并且index层级比较低，
  * 在这个元素的后面其它元素（层级比这个元素高的，或者相同的，并且releative或absolute属性相同的），会默认变为复合层渲染
  * 如果处理不当会极大的影响性能，可以用chrome的rending查看
  */
const View = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom:0;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1;
`;

const Wrapper = styled.div`
  position: relative;
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
  opacity: 1;
  -webkit-overflow-scrolling: touch; // enhance ios scrolling
`;

const Content = styled(Wrapper)`
  // overflow: ${props => (props.loaderState ? 'hidden !important' : 'none')};
`;


// active the scrollbar of ios
const Main = styled.div.attrs({
  style: ({ transform }) => ({
    transform,
  })
})`
  margin-top: -1px;
  padding-top: 1px;
  transition: transform 0.2s;
  .loader-refreshed & {
    animation: ${refreshedRule(0.4)}
  }
  .state-reset & {
    transition: transform 0.2s;
  }
`;

const LoaderMsg = styled.div`
  line-height: ${Height};
  ${props => (props.loaderState === 'refreshed' ? `
  i {
    display: inline-block;
    box-sizing: content-box;
    vertical-align: middle;
    margin-right: 10px;
    font-size: 20px;
    height: 1em;
    width: 1em;
    border: 1px solid;
    border-radius: 100%;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 3px;
      left: 7px;
      height: 11px;
      width: 5px;
      border: solid;
      border-width: 0 1px 1px 0;
      transform: rotate(40deg);
      }
    }
  
  ` : `
  i {
    display: ${props.loaderState === 'reset' ? 'none' : 'inline-block'};
    font-size: 2em;
    margin-right: 0.6em;
    vertical-align: middle;
    height: 1em;
    border-left: 1px solid;
    position: relative;
    transition: transform 0.3s ease;
    transform: ${props.loaderState === 'pulling' ? 'none' : 'rotate(180deg)'};
    &:before,
    &:after {
      content: '';
      position: absolute;
      font-size: 0.5em;
      width: 1em;
      bottom: 0px;
      border-top: 1px solid;
    }
    &:before {
      right: 1px;
      transform: rotate(50deg);
      transform-origin: right;
    }
    &:after {
      left: 0px;
      transform: rotate(-50deg);
      transform-origin: left;
    }
  }`)}
`;


const LoaderSymbol = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: ${fontColor};
  text-align: center;
  opacity: 1;
  height: ${props => (content(props.loaderState) ? `${Height}` : 0)};
  overflow: hidden;
  display: ${props => (content(props.loaderState) ? 'block' : 'none')};
`;

const Footer = styled.div`
  margin-top: -1px;
  padding-top: 1px;
`;

const Loading = styled.div`
    // display: none;
    text-align: center;
    line-height: ${Height};
    color: #999;
    i {
      font-size: 20px;
      margin-right: 9px;
    }
`;

const circle = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const circleRule = css`
  ${circle} 0.8s infinite linear;
`;

const UiLoading = styled.i`
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(162, 162, 162, 0.6);
  border-top-color: rgba(255,255,255,0.4);
  border-radius: 100%;
  animation: ${circleRule};
`;

const STATUS = {
  init: '',
  pullEnough: 'pullEnough',
  pulling: 'pulling',
  loading: 'loading',
  refreshing: 'refreshing',
  refreshed: 'refreshed',
  reset: 'reset',
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
    children: PropTypes.node,
    className: PropTypes.string,
    distanceToRefresh: PropTypes.number
  };

  static defaultProps = {
    distanceToRefresh: 40
  }

  state = {
    loaderState: STATUS.init,
    pullHeight: 0
  };

  panel = null;

  isLoadingMore = false;

  initialTouch = {};

  componentDidMount() {
    this.touchMoveListener = listen(this.panel, 'touchmove', (event) => {
      this.handleTouchMove(event);
    }, {
      passive: false
    });
  }

  componentWillUnmount() {
    this.touchMoveListener();
  }

  panelRef = (element) => {
    this.panel = element;
  };

  handleClick = () => {
    this.setState({
      loaderState: STATUS.refreshed
    });
  };

  canRefresh = () => {
    const { onRefresh } = this.props;
    const { loaderState } = this.state;

    return onRefresh && ![STATUS.refreshing, STATUS.loading].includes(loaderState);
  };

  loadMore = () => {
    const { onLoadMore } = this.props;
    onLoadMore(() => {
      this.setState(
        () => ({
          loaderState: STATUS.init
        }),
        () => {
          this.isLoadingMore = false;
        }
      );
    });
  };

  handleTouchStart = (e) => {
    if (!this.canRefresh()) {
      return;
    }

    if (!e.touches.length) {
      return;
    }
    this.initialTouch = {
      clientY: e.touches[0].clientY,
      scrollTop: this.panel.scrollTop
    };
  };

  handleTouchMove = (e) => {
    const {
      panel,
      initialTouch,
      props: { distanceToRefresh }
    } = this;
    const { scrollTop } = panel;
    // 获取滚动的距离
    const distance = e.touches[0].clientY - initialTouch.clientY;

    // 判断是不是下拉屏幕
    if (scrollTop <= 0 && distance > 0) {
      let pullDistance = distance - initialTouch.scrollTop;

      if (pullDistance < 0) {
        // 修复 webview 滚动过程中 touchstart时计算panel.scrollTop不准
        pullDistance = 0;
        initialTouch.scrollTop = distance;
      }

      const pullHeight = easeOutSine(pullDistance);
      // 减弱滑动
      if (pullHeight) {
        // e.preventDefault();
      }
      this.setState(() => ({
        loaderState:
          pullHeight > distanceToRefresh
            ? STATUS.pullEnough
            : STATUS.pulling,
        pullHeight
      }));
    }
  };

  handleTouchEnd = () => {
    if (!this.canRefresh()) {
      return;
    }

    const {
      state: { loaderState },
      props: { onRefresh },
    } = this;

    const endState = {
      loaderState: STATUS.reset,
      pullHeight: 0
    };

    if (loaderState === STATUS.pullEnough) {
      // 刷新页面ing
      this.setState(() => ({
        loaderState: STATUS.refreshing,
      }), () => {
        onRefresh(
          () => {
            console.log('refreshed');
            this.setState(() => ({
              loaderState: STATUS.refreshed,
            }), () => {
              this.setState(endState);
            });
          }
        );
      });
      return;
    }
    this.setState(endState);
  };

  handleOnAnimationEnd = (e) => {
    console.log(e);
  }

  handleOnScroll = () => {
    const { hasMore } = this.props;
    const { scrollHeight, clientHeight, scrollTop } = this.panel;
    if (hasMore) {
      const scrollBottom = scrollHeight - clientHeight - scrollTop;
      if (scrollBottom > 5 && !this.isLoadingMore) {
        this.isLoadingMore = true;
        this.loadMore();
      }
    }
  };

  render() {
    const { className, children, hasMore } = this.props;
    const { loaderState, pullHeight } = this.state;
    const events = {
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchEnd,
      onScroll: this.handleOnScroll,
      onAnimationEnd: this.handleOnAnimationEnd
    };
    const transform = {
      transform: pullHeight ? `translate3d(0, ${pullHeight}px,0)` : null
    };

    return (
      <View>
        <Content
          ref={this.panelRef}
          {...events}
          className={className}
          loaderState={loaderState}
        >
          <LoaderSymbol pullHeight={pullHeight} loaderState={loaderState}>
            <LoaderMsg loaderState={loaderState}>
              <i />
              <span>{content(loaderState)}</span>
            </LoaderMsg>
          </LoaderSymbol>
          <Main style={transform} loaderState={loaderState}>
            {children}
          </Main>
          <Footer hasMore={hasMore}>
            <Loading>
              <UiLoading />
            </Loading>
          </Footer>
        </Content>
      </View>
    );
  }
}

export default LoadMore;
