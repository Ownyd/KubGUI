import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import PodDetails from './PodDetails/PodDetails'
import Terminal from './Components/Terminal/Terminal'

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/pod/:name/:context/:namespace" component={PodDetails}/>
      <Route path="/terminal/:name/:context/:namespace" component={Terminal}/>
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))