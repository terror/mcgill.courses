import { Route, Routes } from 'react-router-dom';

import { ReviewForm } from './components/ReviewForm';
import { CoursePage } from './pages/CoursePage';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';
import { ReviewPage } from './pages/ReviewPage';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
      <Route path='review'>
        <Route path=':id/add' element={<ReviewPage />} />
      </Route>
      <Route path='/explore' element={<Explore />} />
    </Routes>
  );
};

export default App;
