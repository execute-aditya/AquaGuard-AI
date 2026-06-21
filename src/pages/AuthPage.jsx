import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password);
        setMessage('Check your email to verify your account.');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body-md text-on-surface antialiased selection:bg-cyan-500/30 selection:text-cyan-900 items-center auth-bg min-h-screen flex flex-col relative overflow-hidden justify-center">
      <div className="wave-decoration-top"></div>
      <div className="wave-decoration-2"></div>
      <div className="wave-decoration"></div>

      <main className="w-full max-w-md px-margin-x relative z-10 m-auto flex flex-col justify-center">
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-2 p-10 pt-12 pb-14">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-6 rounded-2xl overflow-hidden bg-primary-container shadow-level-1 flex items-center justify-center p-3">
              <span className="material-symbols-outlined text-on-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary-container mb-2 font-bold tracking-tight">AquaGuard AI</h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">Clean Water for Everyone</p>
          </div>

          {/* Login/Register Toggle */}
          <div className="bg-surface-container p-1 rounded-full flex mb-8">
            <button
              className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-all text-center ${
                isLogin
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-container-lowest/50'
              }`}
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-all text-center ${
                !isLogin
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-container-lowest/50'
              }`}
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
            >
              Register
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm text-center">
              {message}
            </div>
          )}

          {/* Form */}
          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember + Forgot (only on login) */}
            {isLogin && (
              <div className="flex items-center justify-between pt-2 mb-8">
                <div className="flex items-center">
                  <input
                    className="w-4 h-4 rounded border-outline-variant text-cyan-500 focus:ring-cyan-500/30"
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="ml-2 font-label-sm text-label-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Remember me</label>
                </div>
                <a className="font-label-sm text-label-sm text-cyan-600 hover:text-cyan-700 transition-colors" href="#">Forgot password?</a>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full mt-8 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>{isLogin ? 'Logging in...' : 'Registering...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Login' : 'Register'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-8 text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
                onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full py-6 z-10">
        <div className="text-center text-white/70 font-label-sm text-label-sm">
          © 2024 AquaGuard AI. Ensuring Clean Water for All.
        </div>
      </footer>
    </div>
  );
}
