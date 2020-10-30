import React, { createContext, useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { auth_axios } from '../services/axios';

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const history = useHistory();
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined
  });

  useEffect(() => {
    initiateUserData();
  }, [])

  const login = async (data) => {
    await auth_axios.post('users/login', data)
      .then(res => {
        localStorage.setItem('access-token', res.data.accessToken);
        localStorage.setItem('refresh-token', res.data.refreshToken);
        setUserData({
          token: res.data.token,
          user: res.data.user
        });
        history.push('/');
      })
      .catch(err => { return { err: err.response.data.message } });
    return true;
  }

  const register = async (user) => {
    await auth_axios.post('users/register', user)
      .then(() => login({ email: user.email, password: user.password }))
      .catch(err => { return { err: err.response.data.message } });
    return true;
  }

  const logout = () => {
    // todo set logout endpoint to add ref and acc token to blacklist
    setUserData({
      token: undefined,
      user: undefined
    });
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  }

  const checkAuth = () => {
    const token = localStorage.getItem('access-token');
    return token ? token : false;
  }

  const initiateUserData = async () => {
    const token = checkAuth();
    if (token) {
      setUserData({ ...userData, token });
      await auth_axios.get('users/')
        .then(res => setUserData({ token, user: res.data }))
        .catch(err => console.error(err.response.data));
    }
  }

  return (
    <UserContext.Provider value={{ userData, initiateUserData, checkAuth, login, register, logout }}>
      { props.children}
    </UserContext.Provider>
  )

}
