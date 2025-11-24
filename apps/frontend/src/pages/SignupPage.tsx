import { useState } from 'react';
import { useCreateUser } from '../hooks/useUser';

/**
 * Signup page component
 * Demonstrates how to use the useCreateUser hook
 */
export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: createUser, isPending, isError, error } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createUser(
      { name, email, password },
      {
        onSuccess: (data) => {
          console.log('Signup successful:', data);
          alert(`Welcome ${data.user.name}! Token: ${data.accessToken.substring(0, 20)}...`);
          // TODO: Navigate to dashboard
        },
        onError: (error) => {
          console.error('Signup failed:', error);
        },
      }
    );
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
            Error: {error?.message || 'Signup failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: isPending ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
