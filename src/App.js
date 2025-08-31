import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import Signin from './Signin';
import Signup from './Signup';
import Signupotp from './Signupotp';
import { loadUser, signOut } from './api';

function App() {
  const [page, setPage] = useState('signin');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = loadUser();
    if (u) {
      setUser(u);
      setPage('dashboard');
    }
  }, []);

  const onSignIn = (userData) => {
    setUserData(userData);
    setUser(userData.user);
    setPage('dashboard');
  };

  const onSignOut = () => {
    signOut();
    setUser(null);
    setUserData(null);
    setPage('signin');
  };

  const renderPage = () => {
    switch (page) {
      case 'signup':
        return <Signup onNext={() => setPage('signupotp')} />;
      case 'signupotp':
        return <Signupotp onSignIn={onSignIn} />;
      case 'signin':
        return <Signin onSignIn={onSignIn} onSignUp={() => setPage('signup')} />;
      case 'dashboard':
        return <Dashboard user={user} onSignOut={onSignOut} />;
      default:
        return <Signin onSignIn={onSignIn} onSignUp={() => setPage('signup')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}

export default App;
