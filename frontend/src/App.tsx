import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { queryClient } from "./lib/queryClient";
import { router } from "./routes";

export function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;