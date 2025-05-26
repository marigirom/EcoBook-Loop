# EcoBook-Loop
This is a project that mainly targets to develop an application(i.e. web-based). Mainly a comprehensive, usable and simple application that will effectively enable households exchange/donate books as well as allow households/businesses link up with paper mills in need of recyclable print paper.
## EcoBook Loop – PWA

EcoBook Loop is a progressive web app for managing book donations, recycling, and reuse. Built with React (frontend), Node.js/Express (backend), and PostgreSQL. Africa's Talking API is integrated for SMS/USSD support.

## Setup Summary

- **Frontend:** Initialized with `create-react-app`, styled with CSS.
- **Backend:** Node.js/Express server with PostgreSQL. Authentication via JWT and bcrypt.

## Authentication

- Implemented user registration and login via `/api/register` and `/api/login`.
- JWT stored in localStorage.
- Created `AuthContext` to manage auth state.

## Login Page

- Built login form using `useState` and `useNavigate`.
- On success, JWT is saved and user redirected to `/dashboard`.

## Private Route

- Created `PrivateRoute` component to restrict access to `/dashboard`.
- Routes configured to redirect unauthenticated users to `/login`.



