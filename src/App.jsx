import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { UserContextProvider } from './context/UserContex';
import GuardRoute from './components/GuardRoute';
import Room from './components/Room';

const App = () => {

  return (
    <BrowserRouter>
      <UserContextProvider>
        <Header />
        <Switch>
          <GuardRoute exact path="/" component={Home} />
          <GuardRoute exact path="/room/:roomID" component={Room} />
          <Route path="/Login" component={Login} />
          <Route path="/Register" component={Register} />
        </Switch>
      </UserContextProvider>
    </BrowserRouter>
  );
}

export default App;
