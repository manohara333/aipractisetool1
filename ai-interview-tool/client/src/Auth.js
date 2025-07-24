import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './Auth.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleLogo from './GoogleLogo';
import { checkUserExists, insertUserManually } from './userUtils';

export default function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpMode, setSignUpMode] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👇 Insert user into ai_users table with proper user data
  const insertUserIntoTable = async (user) => {
    try {
      const exists = await checkUserExists(user.id);
      
      if (!exists) {
        const success = await insertUserManually(user);
        if (success) {
          console.log("✅ User inserted into ai_users table");
        } else {
          console.error("❌ Failed to insert user into ai_users table");
        }
      } else {
        console.log("✅ User already exists in ai_users table");
      }
    } catch (error) {
      console.error("❌ Error in insertUserIntoTable:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setIsSubmitting(true);

    try {
      let authResponse;
      if (signUpMode) {
        authResponse = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: email.split('@')[0] // Use email prefix as default name
            }
          }
        });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data: sessionData, error: authError } = authResponse;

      if (authError) {
        setError(authError.message);
        setIsSubmitting(false);
        return;
      }

      if (sessionData?.user) {
        await insertUserIntoTable(sessionData.user);
      }

      onAuthSuccess();
      setIsSubmitting(false);
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173' // Redirect back to your app
      }
    });

    if (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = session?.user;
        if (user) {
          await insertUserIntoTable(user);
          onAuthSuccess();
        }
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{signUpMode ? 'Sign Up' : 'Login'}</h2>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (signUpMode ? 'Signing up...' : 'Logging in...')
              : (signUpMode ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <button onClick={handleGoogleSignIn} className="google-button">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <GoogleLogo size={20} /> Sign in with Google
          </span>
        </button>

        <p className="auth-switch">
          {signUpMode ? 'Already have an account?' : 'No account yet?'}{' '}
          <span onClick={() => setSignUpMode(!signUpMode)}>
            {signUpMode ? 'Login' : 'Sign Up'}
          </span>
        </p>

        {resetSent && <p className="auth-success">📬 Password reset link sent!</p>}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
}
