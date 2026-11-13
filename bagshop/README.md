# BagShop - Vue.js E-commerce Frontend

A modern e-commerce frontend built with Vue.js 3, Vite, Tailwind CSS, and Pinia.

## 🚀 Features

- 🛍️ Product listing with search and filters
- 🛒 Shopping cart with local storage persistence
- 👤 User authentication (Login/Register)
- 💳 Checkout flow
- 📱 Responsive design
- ⚡ Fast development with Vite
- 🎨 Beautiful UI with Tailwind CSS

## 📦 Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 🏃 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
bagshop/
├── src/
│   ├── api/           # API configuration
│   ├── assets/        # Static assets
│   ├── components/    # Reusable components
│   ├── router/        # Route definitions
│   ├── stores/        # Pinia stores
│   ├── views/         # Page components
│   ├── App.vue        # Root component
│   └── main.js        # Entry point
├── public/            # Public assets
├── index.html         # HTML template
├── tailwind.config.js # Tailwind configuration
└── vite.config.js     # Vite configuration
```

## 🔗 API Endpoints

The frontend expects a backend API with these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

## 🌐 Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

## 📝 License

MIT
