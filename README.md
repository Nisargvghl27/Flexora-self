# Flexora

Flexora is a modern full-stack web application built with React and Node.js. It features a responsive and interactive user interface alongside a robust backend API, supporting secure authentication, payments, media management, and more.

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **State Management & Data Fetching:** React Query, Axios
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form, Zod
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Payment Gateway:** Razorpay
- **Media Storage:** Cloudinary (via Multer)
- **Security:** Helmet, CORS

## Features
- **Secure User Authentication:** JWT-based login and registration system.
- **Payment Integration:** Seamless payment processing using Razorpay.
- **Media Uploads:** Image and media management powered by Cloudinary.
- **Interactive UI:** Smooth animations, accessible components, and responsive design.
- **Form Validation:** Client-side validation ensuring data integrity before submission.
- **Admin & User Dashboards:** Role-based access for managing content and profiles.

## Project Structure

```text
Flexora/
├── backend/            # Express.js backend API
│   ├── config/         # Configuration files (Database, Cloudinary)
│   ├── middleware/     # Custom Express middlewares (Auth, Upload, Admin)
│   ├── models/         # Database models/schema
│   ├── server.js       # Main application entry point
│   └── package.json    # Backend dependencies
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application routes and views
│   │   ├── services/   # API integrations (Axios)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── styles/     # Global CSS and Tailwind directives
│   └── package.json    # Frontend dependencies
└── .gitignore          # Git ignore rules
```

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nisargvghl27/Flexora-self.git
   cd Flexora
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

You need to create a `.env` file in the `backend` directory. Use the following template and replace with your actual keys:

```env
# backend/.env
PORT=5000
JWT_SECRET=your_jwt_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Add database configuration variables as required
```

### Running the Application Locally

You will need two separate terminal windows/tabs to run the frontend and backend servers concurrently.

**1. Start the Backend Server:**
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:5000` (or your configured port).

**2. Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## Scripts

### Backend
- `npm start`: Runs the production server.
- `npm run dev`: Runs the development server using nodemon.
- `npm run seed`: Seeds the database with initial data.
- `npm run migrate`: Runs database migrations/schema sync.

### Frontend
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run preview`: Locally previews the production build.
