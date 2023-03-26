import { Route, Routes } from 'react-router-dom';
import { CoursePage } from './pages/CoursePage';
import { Home } from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='course'>
        <Route path=':id' element={<CoursePage />} />
      </Route>
    </Routes>
  );
};

export default App;
