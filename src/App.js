import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import allRoutes from './routes/routes';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import FloatingSupport from './components/FloatingSupport';

function App() {
  return (
    <>
    <Toaster position="top-center" />
    <BrowserRouter>
        <Routes>
            {allRoutes.map((route, index) => {
              return(
              <Route key={index} path={route.path}
              element={
                  route.role === "public" ? (
                    route.component
                  ) : (
                    <ProtectedRoute role={route.role} children={route.component}/>
                  )
                }/>
            )
            })}
        </Routes>
        <FloatingSupport />
      </BrowserRouter>
    </>
  );
}

export default App;
