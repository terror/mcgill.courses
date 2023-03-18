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

function SearchPanel() {
  return (
    <div className='searchpanel absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    space-y-10 '>
      <div className='searchbar-wrapper'>
        <img className='searchbar-icon' src={magnifyingGlass} alt='search'/>
        <input className="searchbar-input" type="text" placeholder="Search for courses or instructors"/>
      </div>
      <div>
        <p className="searchbar-text">Explore the courses and instructors at <span className='red-text'>McGill University</span></p>
      </div>
      <Button content="Take me there!" url=""/>
    </div>
  );
}
