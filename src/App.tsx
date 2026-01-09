import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { CreateFlow } from '@/pages/create';
import { RecoverFlow } from '@/pages/recover';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/create"
          element={
            <Layout>
              <CreateFlow />
            </Layout>
          }
        />
        <Route
          path="/recover"
          element={
            <Layout>
              <RecoverFlow />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
