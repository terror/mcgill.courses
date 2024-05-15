import 'react-loading-skeleton/dist/skeleton.css';
import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute';
import { About } from './pages/About';
import { Changelog } from './pages/Changelog';
import { CoursePage } from './pages/CoursePage';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';
import { Instructor } from './pages/Instructor';
import { NotFound } from './pages/NotFound';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Profile } from './pages/Profile';
import { Reviews } from './pages/Reviews';
import { TermsAndConditions } from './pages/TermsAndConditions';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/changelog' element={<Changelog />} />
      <Route path='/explore' element={<Explore />} />
      <Route path='/privacy' element={<PrivacyPolicy />} />
      <Route
        path='/profile'
        element={<PrivateRoute children={<Profile />} />}
      />
      <Route path='/reviews' element={<Reviews />} />
      <Route path='/tos' element={<TermsAndConditions />} />
      <Route path='course'>
        {' '}
        <Route path=':id' element={<CoursePage />} />{' '}
      </Route>
      <Route path='instructor'>
        {' '}
        <Route path=':name' element={<Instructor />} />{' '}
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
