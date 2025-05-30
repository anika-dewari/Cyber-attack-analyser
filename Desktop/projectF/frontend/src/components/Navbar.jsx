import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full py-6 px-6 sm:px-10 bg-[#0e0f1a] border-b border-[#1c1f2f] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-cyan-400">
            KillSwitch
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-300 hover:text-cyan-400">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/history" className="text-gray-300 hover:text-cyan-400">
                History
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-cyan-400"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-cyan-400">
                  Login
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-cyan-400">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar; 