import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import allRoutes from './routes/routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position="top-center" />
    <BrowserRouter>
        <Routes>
            {allRoutes.map((route, index) => {
              return(
              <Route key={index} path={route.path} element={route.component} />
            )
            })}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
