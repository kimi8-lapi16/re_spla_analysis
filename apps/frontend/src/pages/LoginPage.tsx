import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';

/**
 * Login page component
 * Demonstrates how to use the useLogin hook
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    login(
      { email, password },
      {
        onSuccess: (data) => {
          console.log('Login successful:', data);
          alert(`Welcome back! Token: ${data.accessToken.substring(0, 20)}...`);
          // TODO: Navigate to dashboard
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      }
    );
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isPending}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        {isError && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            Error: {error?.message || 'Login failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: isPending ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
