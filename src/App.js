import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import allRoutes from './routes/routes';

function App() {
  return (
    <BrowserRouter>
        <Routes>
            {allRoutes.map((route, index) => {
              return(
              <Route key={index} path={route.path} element={route.component} />
            )
            })}
        </Routes>
      </BrowserRouter>
  );
}

export default App;
