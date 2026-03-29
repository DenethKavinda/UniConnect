# UniConnect - Educational Platform

UniConnect is a social networking platform designed for educational communities, built with Node.js/Express backend and React/Vite frontend.

## Project Structure

```
UniConnect/
├── backend/               # Node.js & Express API
│   ├── config/            # Database and Passport/Auth configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth guards and error handling
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions (mailers, token generators, validators)
│   ├── .env               # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js          # Main entry point
│
├── frontend/              # React (Vite) Application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Logos and styling images
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Full page views
│   │   ├── services/      # API abstraction
│   │   ├── store/         # Redux state management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .eslintrc.json
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore             # Global ignores
├── package.json           # Root workspace orchestration
└── README.md              # Project documentation
```

## Getting Started

### Installation

```bash
npm run install
```

### Development

Run both backend and frontend in development mode:

```bash
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:3000`.

### Production Build

```bash
npm run build
```

## Environment Setup

### Backend (.env)
```
DB_URI=mongodb://localhost:27017/uniconnect
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Technologies

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- Passport.js - Authentication strategy
- Nodemailer - Email service

### Frontend
- React - UI library
- Vite - Build tool
- Redux Toolkit - State management
- Axios - HTTP client
- React Router - Routing

## License

MIT License
