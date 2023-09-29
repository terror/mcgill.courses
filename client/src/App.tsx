import 'react-loading-skeleton/dist/skeleton.css';
import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute';
import { About } from './pages/About';
import { CoursePage } from './pages/CoursePage';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';
import { Instructor } from './pages/Instructor';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
      <Route path='instructor'>
        <Route path=':name' element={<Instructor />} />
      </Route>
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
      <Route
        path='/profile'
        element={<PrivateRoute children={<Profile />} />}
      />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
