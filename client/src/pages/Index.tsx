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
