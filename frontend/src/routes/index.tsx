import { createBrowserRouter } from "react-router-dom";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { BlackjackErrorState } from "../components/ui/BlackjackErrorState";


import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { OAuth2CallbackPage } from "../pages/auth/OAuth2CallbackPage";
import { AdminRoute } from "./AdminRoute";
import { UserLayout } from "../components/layout/user/UserLayout";
import RoomsPage from "../pages/user/RoomsPage";
import RoomPlayPage from "../pages/user/RoomPlayPage";
import DailyRewardsPage from "../pages/user/DailyRewardsPage";

export const router = createBrowserRouter([
  {
    errorElement: (
      <BlackjackErrorState
        fullScreen
        onRetry={() => window.location.reload()}
        retryLabel="Reload app"
      />
    ),
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/oauth2/callback", element: <OAuth2CallbackPage /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <UserLayout />,
            children: [
                { path: "/rooms", element: <RoomsPage /> },
                { path: "/rooms/:roomId", element: <RoomPlayPage /> },
                { path: "/rewards/daily", element: <DailyRewardsPage /> },
                // { path: "/wallet", element: <WalletPage /> },
                // { path: "/profile", element: <ProfilePage /> },
            ]
          }
        ],
      },

      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            // element: <AdminLayout />,
            // children: [
            //   { index: true, element: <Navigate to="/admin/overview" replace /> },
            //   { path: "overview", element: <AdminDashboardPage /> },
            //   { path: "rooms", element: <AdminRoomsPage /> },
            //   { path: "users", element: <AdminUsersPage /> },
            //   { path: "ledger", element: <AdminLedgerPage /> },
            // ],
          },
        ],
      },

      {
        path: "*",
        element: (
          <BlackjackErrorState
            variant="notFound"
            title="Page Not Found"
            fullScreen
            onRetry={() => window.history.back()}
            retryLabel="Go back"
          />
        ),
      },
    ],
  },
]);