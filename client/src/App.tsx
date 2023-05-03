import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute';
import { About } from './pages/About';
import { CoursePage } from './pages/CoursePage';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';
import { NotFound404 } from './pages/404';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
      <Route path='/404' element={<NotFound404 />} />
    </Routes>
  );
};

export default App;
