import React from 'react';
import './SearchBar.css'

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.updateSearch = this.updateSearch.bind(this);
  }

  updateSearch(e) {
    const { changeSearch } = this.props;
    const newSearch = e.target.value;
    changeSearch(newSearch);
  }


  render() {
    return (
      <input
        placeholder="Filter pods"
        type="search"
        className="searchBar"
        onChange={this.updateSearch}>
      </input>
    )
  }
}

export default SearchBar;
