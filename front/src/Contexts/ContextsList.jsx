import React, { Component } from 'react';
import fetch from 'node-fetch';
import './ContextsList.css';

class ContextList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contexts: [],
    };
    this.updateContext = this.updateContext.bind(this);
  }

  updateContext(e) {
    const { changeContext } = this.props;
    const newContext = e.target.value;
    changeContext(newContext);
  }

  componentDidMount() {
    fetch('http://192.168.211.211:8080/contexts')
      .then(res => res.json())
      .then(data => this.setState({ contexts: data}));
  }

  render() {
    const { contexts } = this.state;
    const { context } = this.props;

    if (!contexts || !context)
      return <div className="select-css-wrapper">
        <select className="select-css" placeholder="Context"> </select>
      </div>

    return (
      <div className="select-css-wrapper">
        <select onChange={this.updateContext} className="select-css">
          <option
            key={context}
            value={context}
            defaultValue
          >
            {context}
          </option>
          { contexts.map(ctx => ctx.name !== context && <option
            key={ctx.name}
            value={ctx.name}
          >
            {ctx.name}
          </option>) }
        </select>
      </div>
    );
  }
}

export default ContextList;
