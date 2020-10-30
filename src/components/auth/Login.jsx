import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContex';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(UserContext);

  const submit = async (e) => {
    e.preventDefault();
    const loginRes = login({ email, password });
    loginRes.err && setError(loginRes.err);
  }

  return (
    <div className="w-full">
      <div className="card">
        <span className="card-title">
          Login
        </span>
        {error && (
          <span className="error-box">
            { error}
          </span>
        )}
        <form style={{ width: "100%" }} onSubmit={submit}>
          <div className="input-container">
            <input
              type="email" id="email" placeholder="Email"
              onChange={e => { setEmail(e.target.value); setError() }} />
            <label htmlFor="email">Enter your email</label>
          </div>
          <div className="input-container">
            <input type="password" id="password" placeholder="Password"
              onChange={e => { setPassword(e.target.value); setError() }} />
            <label htmlFor="password">Enter a password</label>
          </div>
          <div className="input-container">
            <button className="submit-button">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
