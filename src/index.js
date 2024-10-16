import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./components/Lobby";
import SocketProvider from "./context/SocketProvider";
import Room from "./components/Room";
import Signup from "./components/auth/Signup";
import Signin from "./components/auth/Signin";
import VerifyEmail from "./components/auth/VerifyEmail";
import AuthWrapper from "./components/AuthWrapper";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Lobby />,
      },
      {
        path: "/room/:roomId",
        element: (
          <AuthWrapper authentication={true}>
            <Room />
          </AuthWrapper>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthWrapper>
            <Signup />
          </AuthWrapper>
        ),
      },
      {
        path: "/signin",
        element: (
          <AuthWrapper>
            <Signin />
          </AuthWrapper>
        ),
      },
      {
        path: "/verify",
        element: (
          <AuthWrapper>
            <VerifyEmail />
          </AuthWrapper>
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
