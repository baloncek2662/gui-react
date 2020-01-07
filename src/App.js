import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (<div>
      <div>
        <h1>Notepad</h1>
        <h2>Time: {this.state.date.toLocaleTimeString()}.</h2>
      </div>
      <NameForm /></div>
    );
  }
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      ddl: 'prva'
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    alert('A description was submitted: ' + this.state.ddl);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name: <input name="name" type="text" value={this.state.name} onChange={this.handleInputChange} />
        </label><br />
        <label>
          Essay: <textarea name="description" value={this.state.description} onChange={this.handleInputChange  } />
        </label><br />
        <label>
          Pick your favorite flavor:
          <select name="ddl" value={this.state.ddl} onChange={this.handleInputChange}>
            <option value="prva">Grapefruit</option>
            <option value="druga">Lime</option>
          </select>
        </label><br />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default App;
