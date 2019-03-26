import React, { Component } from 'react';
import fetch from 'node-fetch';

class NamespacesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      namespaces: [],
    };
    this.updateNamespace = this.updateNamespace.bind(this);

  }

  updateNamespace(e) {
    const { changeNamespace } = this.props;
    const newNamespace = e.target.value;
    changeNamespace(newNamespace);
  }

  componentDidMount() {
    fetch('http://192.168.211.211:8080/namespaces')
      .then(res => res.json())
      .then(data => this.setState({ namespaces: data}));
  }

  componentWillReceiveProps(nextProps) {
    const { context } = nextProps;
    fetch(`http://192.168.211.211:8080/namespaces?context=${context}`)
    .then(res => res.json())
    .then(data => this.setState({ namespaces: data}));
  }

  render() {
    const { namespaces } = this.state;
    const { namespace } = this.props;

    if (!namespace || !namespaces)
      return <div className="select-css-wrapper">
        <select className="select-css" placeholder="Namespace"> </select>
      </div>

    return (
        <div className="select-css-wrapper">
          <select onChange={this.updateNamespace} value={namespace} className="select-css">
            <option
              key={namespace}
              value={namespace}
              defaultValue
            >
              {namespace}
            </option>
            { namespaces.map(nsp => nsp.name !== namespace && <option
              key={nsp.name}
              value={nsp.name}
              disabled={!nsp.active}
            >
              {nsp.name}
            </option>) }
          </select>
        </div>
    );
  }
}

export default NamespacesList;
