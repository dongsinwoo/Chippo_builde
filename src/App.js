import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeadNav from './component/HeadNav';
import LoginPage from './routes/LoginPage';
import Portfolios from './routes/Portfolios';
import Uplode from './routes/Uplode';
import PrivateRoute from './component/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import Home from './routes/Home';
import Profile from './routes/Profile';
import PortfolioDetail from './component/PortfolioDetail';
import Footer from './component/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <HeadNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/portfolio" element={<Portfolios />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route 
            path="/upload" 
            element={
              <PrivateRoute>
                <Uplode />
              </PrivateRoute>
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
