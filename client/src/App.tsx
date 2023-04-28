import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute';
import { About } from './pages/About';
import { CoursePage } from './pages/CoursePage';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
    </Routes>
  );
};

export default App;
