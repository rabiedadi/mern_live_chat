import React, { useContext, useState, useEffect } from 'react';
import './auth.css';
import { UserContext } from '../../context/UserContex';

export default function Register() {
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [passwordCheck, setPasswordCheck] = useState();
  const [error, setError] = useState()

  const { register } = useContext(UserContext);

  const submit = async (e) => {
    e.preventDefault();
    if (!checkValidity) return;
    const registerRes = register({ email, username, password, passwordCheck })
    registerRes.err && setError(register.err);
  }

  const checkValidity = () => {
    if (password && password.length < 8) {
      setError('Password must be at least of 8 characters long.');
      return false;
    }
    if (passwordCheck !== password) {
      setError('Passwords don\'t match');
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (password && password.length < 8) {
      setError('Password must be at least of 8 characters long.');
    } else {
      setError();
    }
  }, [password]);

  useEffect(() => {
    if (passwordCheck !== password) {
      setError('Passwords don\'t match');
    } else {
      setError();
    }
  }, [passwordCheck]);
  return (
    <div className="w-full">
      <div className="card">
        <span className="card-title">
          CREATE ACCOUNT
        </span>
        {error && (
          <span className="error-box">
            { error}
          </span>
        )}
        <form style={{ width: "100%" }} onSubmit={submit}>
          <div className="input-container">
            <input type="text" id="username" placeholder="Username" onChange={e => { setUsername(e.target.value); setError() }} />
            <label htmlFor="username">Enter your username</label>
          </div>
          <div className="input-container">
            <input type="email" id="email" placeholder="Email" onChange={e => { setEmail(e.target.value); setError() }} />
            <label htmlFor="email">Enter your email</label>
          </div>
          <div className="input-container">
            <input type="password" id="password" placeholder="Password" onChange={e => { setPassword(e.target.value); setError() }} />
            <label htmlFor="password">Enter a password</label>
          </div>
          <div className="input-container">
            <input type="password" id="password2" placeholder="Password" onChange={e => { setPasswordCheck(e.target.value); }} />
            <label htmlFor="password2">Confirm your password</label>
          </div>
          <div className="input-container">
            <button className="submit-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}
