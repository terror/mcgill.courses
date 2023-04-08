import { Route, Routes } from 'react-router-dom';

import { About } from './pages/About';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
    </Routes>
  );
};

export default App;
