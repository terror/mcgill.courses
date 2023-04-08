import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute';
import { About } from './pages/About';
import { AddReviewPage } from './pages/AddReviewPage';
import { CoursePage } from './pages/CoursePage';
import { EditReviewPage } from './pages/EditReviewPage';
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
        <Route
          path=':id/add'
          element={
            <PrivateRoute>
              <AddReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path=':id/edit'
          element={
            <PrivateRoute>
              <EditReviewPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path='/explore' element={<Explore />} />
      <Route path='/about' element={<About />} />
    </Routes>
  );
};

export default App;
