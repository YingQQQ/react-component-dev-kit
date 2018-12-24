import React, { Component } from 'react';
import styled from 'styled-components';

import LoadMore from './LoadMore';

const Wrapper = styled.ul`
  position: relative;
  display: flex;
  flex-direction: column;
  li {
    height: 4rem;
    font-size: 1rem;
  }
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      canRefreshResolve: 1,
      listLen: 0,
      hasMore: 0,
      initializing: 1,
      refreshedAt: Date.now()
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        listLen: 17,
        hasMore: 1,
        initializing: 2 // initialized
      });
    }, 2e3);
  }

  refresh = (resolve, reject) => {
    const { canRefreshResolve } = this.state;
    setTimeout(() => {
      if (!canRefreshResolve) reject();
      else {
        this.setState({
          listLen: 17,
          hasMore: 1,
          refreshedAt: Date.now()
        }, () => {
          resolve();
        });
      }
    }, 2e3);
  };

  loadMore = (resolve) => {
    setTimeout(() => {
      const { listLen } = this.state;
      const l = listLen + 9;

      this.setState({
        listLen: l,
        hasMore: l > 0 && l < 50
      });

      resolve();
    }, 2e3);
  };

  toggleCanRefresh = () => {
    const { canRefreshResolve } = this.state;

    this.setState({ canRefreshResolve: !canRefreshResolve });
  };

  render() {
    const {
      listLen,
      hasMore,
      initializing,
      refreshedAt,
      canRefreshResolve
    } = this.state;
    const list = [];

    if (listLen) {
      for (let i = 0; i < listLen; i++) {
        list.push(
          <li key={i}>
            <p>{i}</p>
          </li>
        );
      }
    }
    return (
      <>
        <LoadMore
          hasMore={hasMore}
          // onLoadMore={this.loadMore}
          onRefresh={this.refresh}
        >
          <Wrapper>{list}</Wrapper>
        </LoadMore>
      </>
    );
  }
}

export default App;
