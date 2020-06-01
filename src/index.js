import React, { Component } from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Ring } from 'react-konva';
import Main from './components/main';

class App extends Component {

  render() {
    return (
      <div>
        <Main />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'));
