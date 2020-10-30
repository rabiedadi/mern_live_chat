import React, { useContext } from 'react';
import { Route, Redirect } from "react-router-dom";
import { UserContext } from '../context/UserContex';

const GuardRoute = ({ component: Component, ...rest }) => {
  const { checkAuth } = useContext(UserContext);
  return (
    <Route
      {...rest}
      
      render={props => (
        checkAuth()
        ? ( <Component {...props} /> )
        : ( <Redirect to='/register' /> )
      )}
    />
  )
}

export default GuardRoute