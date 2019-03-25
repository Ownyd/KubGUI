import React, { Component } from 'react';
import ContextsList from './Contexts/ContextsList';
import NamespacesList from './Namespaces/NamespacesList';
import PodsList from './Pods/PodsList';
import SearchBar from './Components/SearchBar/SearchBar';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      context: null,
      namespace: null,
      search: null,
    };
    this.changeContext = this.changeContext.bind(this)
    this.changeNamespace = this.changeNamespace.bind(this)
    this.changeSearch = this.changeSearch.bind(this)
  }

  changeContext(newCtx) {
    this.setState({ context: newCtx});
    fetch(`http://localhost:8080/namespace/current?context=${newCtx}`)
      .then(res => res.json())
      .then(data => this.setState({ namespace: data[0]}));
  }

  changeNamespace(newNsp) {
    this.setState({ namespace: newNsp });
  }

  changeSearch(newSrch) {
    this.setState({ search: newSrch });
  }


  componentDidMount() {
    fetch('http://localhost:8080/context/current')
      .then(res => res.json())
      .then(data => this.setState({ context: data[0]})).then(() => {
        fetch(`http://localhost:8080/namespace/current?context=${this.state.context}`)
          .then(res => res.json())
          .then(data => this.setState({ namespace: data[0]}));
    });
  }

  render() {
    return (
      <div className="App">
        <ContextsList
          context={this.state.context}
          changeContext={this.changeContext}
        />
        <NamespacesList
          context={this.state.context}
          namespace={this.state.namespace}
          changeNamespace={this.changeNamespace}
        />
        <SearchBar
          search={this.state.search}
          changeSearch={this.changeSearch}
        />
        <PodsList
          search={this.state.search}
          context={this.state.context}
          namespace={this.state.namespace}
        />
      </div>
    );
  }
}

export default App;
