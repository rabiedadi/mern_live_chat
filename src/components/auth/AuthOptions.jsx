import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../context/UserContex';

export default function AuthOptions() {
  const { logout, checkAuth } = useContext(UserContext);
  const history = useHistory();
  const login = () => history.push('/login');
  const register = () => history.push('/register');
  return (
    <nav>
      {
        
        checkAuth() ? (
          <button type="button" onClick={logout}>Logout</button>
        ) : (
            <>
              <button type="button" onClick={register}>Register</button>
              <button type="button" onClick={login}>Login</button>
            </>
          )
      }
    </nav>
  );
}
