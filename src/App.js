import React from 'react'
import Creator from './components/creator';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    }
  };

  snakeToCamel = (str) => str.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase()
                      .replace('-', '')
                      .replace('_', '')
  );

  // Fetch all the JSON data and update the app when it's loaded
  fetchData() {
    if (this.state.loaded) {
      return;
    }
    this.data = {}
    const data_to_load = [
      'ability_scores',
      'ammo',
      'armor',
      'gear',
      'languages',
      'origins',
      'skills',
      'tools',
      'vices',
      'weapons',
      'base_character_values'
    ];

    Promise.all(data_to_load.map(name => {
      const url = './json/' + name + '.json'
      return fetch(url, {headers : { 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        .then(resp => 
          resp.json().then(data => {
            const id = this.snakeToCamel(name)
            this.data[id] = data;
            return true;
          })
        )
    })).then(r => {
      this.setState({loaded: true})
    });
  }

  render() {
    this.fetchData()
    if (!this.state.loaded) {
      // Update this at some point
      return <div>LOADING</div>
    } else {
      return (
        <Creator data={this.data} />
      );
    }
  }
}

export default App;
