import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContractsProvider } from "./lib/contracts-context";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import NewContract from "./pages/NewContract";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ContractsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="contracts/new" element={<NewContract />} />
            <Route path="contracts/:id" element={<ContractDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContractsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
