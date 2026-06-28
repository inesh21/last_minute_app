export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

export function getDefaultSession(): AuthSession {
  return {
    userId: 'demo-user',
    email: 'alex.demo@example.com',
    name: 'Alex',
  };
}
