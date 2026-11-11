import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Log in | Supplai',
  description: 'Log in to the Supplai demo dashboard.',
};

export default function LoginPage() {
  return <LoginForm />;
}
