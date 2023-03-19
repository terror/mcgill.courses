import Fuse from 'fuse.js';
import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import magnifyingGlass from '../assets/magnifyingGlass.png';
import '../App.css';

function Index() {
return (
    <div className='flex flex-col items-center justify-center '>
      <Navbar/>
      <SearchPanel/>
    </div>
  );
}

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {setShowLogin(true); };

  window.onclick = function(event) {
    if (event.target === document.getElementsByClassName('backdrop-filter')[0]) {
      setShowLogin(false);
    }
  };

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
  const [query, setQuery] = useState('');
  const data: readonly object[] = [
    {title: 'Fundamentals of Programming', subject: 'COMP', code: "202"}, 
    {title: 'Introduction to Computer Science', subject: 'COMP', code: "250"},
    {title: 'Introduction to Algorithms', subject: 'COMP', code: "251"},
    {title: 'Introduction to Software Engineering', subject: 'COMP', code: "303"},
    {title: 'Introduction to Computer Systems', subject: 'COMP', code: "206"},
    {title: 'Database Systems', subject: 'COMP', code: "421"},
    {title: 'Applied Machine Learning', subject: 'COMP', code: "551"}
  ]

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    setQuery(event.target.value);

    const fuse = new Fuse(data, { keys: ['title', 'subject', 'code'], });
    const result = fuse.search(query);
    console.log(result);
  };


  return (
    <div className='searchpanel absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    space-y-10 '>
      <div className='searchbar-wrapper'>
        <img className='searchbar-icon' src={magnifyingGlass} alt='search'/>
        <input className="searchbar-input" type="text" placeholder="Search for courses or instructors" onChange={handleInputChange}/>
      </div>
      <div>
        <p className="searchbar-text">Explore the courses and instructors at <span className='red-text'>McGill University</span></p>
      </div>
      {/* <Button content="Take me there!" url=""/> */}
    </div>
  );
}

function Button({url, content}: {url:string, content:string}) {
  return (
    <div>
      <a href={url}>
        <button className="button hover:bg-red-600 duration-300">
          {content}
        </button>
      </a>
    </div>
  );
}

function LoginWindow(){
  return (
    <div>
      <div className='backdrop-filter backdrop-blur-sm absolute top-0 left-0 w-screen h-screen z-40'>
      </div>
      <div className='login-panel flex-col z-50 space-y-4'>
          <p className='login-panel-title mb-10'>Login</p>
          <div className='mr-auto ml-10'>Email</div>
          <div className='login-panel-input-box'>
            <input className='login-panel-input' type='email'/>
          </div>
          <div className='mr-auto ml-10'>Password</div>
          <div className='login-panel-input-box'>
            <input className='login-panel-input' type='password'/>
          </div>
          <div className='text-lg  p-3'>Don't have an account? <a>Sign up</a> </div>
          <Button content="Login" url=""/>
      </div>
    </div>
  );
}

function SignUpWindow(){
  return (
    <div> </div>
  );
}

export default Index;