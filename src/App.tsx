import { AppRouter } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <AppRouter />
    </>
  );
}

export default App;