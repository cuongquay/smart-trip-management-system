import React from 'react';

const ThemeContext = React.createContext('light');

export class ThemeProvider extends React.Component {
  state = {
    theme: 'light'
  };

  render() {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}
