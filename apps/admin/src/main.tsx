import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // <-- Novos imports
import "./index.css";
import App from "./App";
import { QuestionTable } from "./components/QuestionTable";
import { CategoryTable } from "./components/CategoryTable";
import { SettingsForm } from "./components/SettingsForm";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas (Protegidas) que usam o App como Layout */}
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="perguntas" element={<QuestionTable />} />
            <Route path="categorias" element={<CategoryTable />} />
            <Route path="configuracoes" element={<SettingsForm />} />
          </Route>

          {/* Rota Coringa (Se digitar URL errada, volta pro inicio) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>,
);
