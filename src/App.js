import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import Signin from './Signin';
import Signup from './Signup';
import Signupotp from './Signupotp';
import { loadUser, signOut } from './api';

function App() {
  const [page, setPage] = useState('signup');
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
    console.log('onSignIn called with:', userData); // Debug log
    setUserData(userData);
    setUser(userData.user); // Extract user from userData.user
    setPage('dashboard');
  };

  const onSignOut = () => {
    signOut();
    setUser(null);
    setUserData(null);
    setPage('signup');
  };

  const renderPage = () => {
    switch (page) {
      case 'signup':
        return <Signup 
          onNext={(data) => {
            setUserData(data);
            setPage('signupotp');
          }} 
          onSignIn={() => setPage('signin')}
        />;
      case 'signupotp':
        return <Signupotp 
          onSignIn={onSignIn} 
          userData={userData}
          onBack={() => setPage('signup')}
        />;
      case 'signin':
        return <Signin 
          onSignIn={onSignIn} 
          onSignUp={() => setPage('signup')}
        />;
      case 'dashboard':
        return <Dashboard user={user} onSignOut={onSignOut} />;
      default:
        return <Signup onNext={(data) => {
          setUserData(data);
          setPage('signupotp');
        }} onSignIn={() => setPage('signin')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}

export default App;
