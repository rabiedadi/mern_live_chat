import React from 'react';
import AuthOptions from '../auth/AuthOptions';
import './header.css';
import { useHistory } from 'react-router-dom';

export default function Header() {
  const history = useHistory();
  const home = () => history.push('/');
  return (
    <header>
      <button type="button" className="logo" onClick={home}>Logo</button>
      <AuthOptions />
    </header>
  );
}
