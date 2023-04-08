import { Route, Routes } from 'react-router-dom';

import { AddReviewPage } from './pages/AddReviewPage';
import { CoursePage } from './pages/CoursePage';
import { EditReviewPage } from './pages/EditReviewPage';
import { About } from './pages/About';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
      <Route path='review'>
        <Route path=':id/add' element={<AddReviewPage />} />
        <Route path=':id/edit' element={<EditReviewPage />} />
      </Route>
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
    </Routes>
  );
};

export default App;
