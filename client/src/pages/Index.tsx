import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import magnifyingGlass from '../assets/magnifyingGlass.png';
import '../App.css';

function Index() {
return (
    // navbar on top and search panel center of the screen
    <div className='flex flex-col items-center justify-center '>
      <Navbar/>
      <SearchPanel/>
    </div>
  );
}

//navbar with login and signup buttons and logo on the left
function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => { setShowLogin(!showLogin); };

  return (
    <div className='w-screen flex justify-between p-10'>
      <div className='flex items-center justify-center'>
        <img className='logo' src={reactLogo} alt='logo'/>
      </div>
      <div className='flex items-center justify-center text-xl'>
        <a onClick={handleLogin} className='cursor-pointer pr-6'>Login</a> {showLogin && <LoginWindow/>}
      </div>
    </div>
  );
}
