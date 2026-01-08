# AutoHub Frontend

React-based admin and operations dashboard for the AutoHub platform. This application provides the web interface used by different roles (admin, staff, front desk, managers) to manage car intake, inventory, waivers, buyers/sellers, transactions, and reporting.

## Tech Stack

- **Framework**: React 19.1.1 with Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **UI Libraries**: 
  - Ant Design 5.27.2 (primary component library)
  - Bootstrap 5.3.8 & React Bootstrap 2.10.10
  - Font Awesome 7.1.0 (icons)
- **Charts & Visualization**: ApexCharts 5.3.6 with React ApexCharts 1.8.0
- **HTTP Client**: Axios 1.11.0
- **Build Tool**: Vite with React plugin
- **Linting**: ESLint 9.33.0 with React hooks and refresh plugins

## Project Structure

```
auto-hub-frontend/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                   # Root component with routing configuration
│   ├── App.css                   # Global app styles
│   ├── index.css                 # Base styles
│   ├── dark-theme.css            # Dark mode theme overrides
│   │
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # Layout components (Header, Sidebar, Footer, Layout)
│   │   │   ├── RBAC_IMPLEMENTATION.md  # RBAC documentation
│   │   ├── dashboard/            # Dashboard-specific widgets
│   │   ├── CarIntake/            # Car intake flow components
│   │   ├── CheckIn/              # Check-in modal components
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── PermissionGuard.jsx  # Permission-based UI guard
│   │   └── ...
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Login.jsx             # Authentication page
│   │   ├── CarIntake.jsx         # Car intake form
│   │   ├── CarIntakeList.jsx     # Car intake listing
│   │   ├── CarIntakeDetails.jsx  # Car intake detail view
│   │   ├── Buyer/                # Buyer management pages
│   │   ├── Seller/               # Seller management pages
│   │   ├── PartInventory/        # Part inventory pages
│   │   ├── Element/              # Element management
│   │   ├── Waiver/               # Waiver management
│   │   ├── Guide/                # User guides and documentation
│   │   └── ...
│   │
│   ├── context/                  # React Context providers
│   │   └── AuthContext.jsx       # Authentication state management
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   └── usePermissions.js     # Permission checking hook
│   │
│   ├── services/                 # API service layer
│   │   ├── apiService.js         # Main API service wrapper
│   │   └── elementHubService.js  # Element hub specific API calls
│   │
│   ├── utils/                    # Utility functions
│   │   ├── api.js                # API configuration and helpers
│   │   ├── rbac.js               # Role-based access control utilities
│   │   └── statusColors.js       # Status color mapping utilities
│   │
│   ├── styles/                   # Feature-specific stylesheets
│   │   ├── CarIntake.css
│   │   └── horizontal-sidebar.css
│   │
│   └── assets/                   # Static assets
│       └── css/
│           └── custom-layout.css
│
├── public/                       # Static public assets
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
└── eslint.config.js              # ESLint configuration
```

## Getting Started

### Prerequisites

- **Node.js**: LTS version (18.x or higher recommended)
- **npm**: Bundled with Node.js (or use yarn/pnpm)
- **Backend API**: The AutoHub backend must be running and accessible (see `auto-hub-backend/README.md`)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd auto-hub-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

This will install all required dependencies as defined in `package.json`.

### Environment Configuration

Create a `.env` file in the `auto-hub-frontend` root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client-side code. Never commit `.env` files containing sensitive information.

The API base URL should point to your backend server. Adjust the port/hostname based on your backend configuration.

## Running the Application

### Development Mode

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The server will start and display the local URL (typically `http://localhost:5173`). The app will automatically reload when you make changes to the source code.

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized production bundle in the `dist/` directory. The build includes:
- Code minification and tree-shaking
- Asset optimization
- Source maps (for debugging)

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the `dist/` directory using Vite's preview server, simulating how the app will behave in production.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Routing & Navigation

The application uses React Router DOM for client-side routing. Routes are defined in `src/App.jsx`:

- **Public Routes**: `/login` (authentication)
- **Protected Routes**: All other routes require authentication
  - `/dashboard` - Main dashboard
  - `/car-intake` - Car intake form
  - `/car-intake/list` - List all car intakes
  - `/inventory` - Inventory management
  - `/waivers` - Waiver management
  - `/buyers` - Buyer management
  - `/sellers` - Seller management
  - And more...

### Route Protection

Routes are protected using:
- **`ProtectedRoute`** component (`src/components/ProtectedRoute.jsx`) - Wraps routes that require authentication
- **`PermissionGuard`** component (`src/components/PermissionGuard.jsx`) - Provides fine-grained permission-based access control

## Authentication & Authorization

### Authentication Flow

1. User logs in via `/login` page
2. Credentials are sent to backend API (`/api/auth/login`)
3. JWT token is stored (typically in httpOnly cookie or localStorage)
4. Token is included in subsequent API requests
5. Auth state is managed via `AuthContext` (`src/context/AuthContext.jsx`)

### Role-Based Access Control (RBAC)

The application implements role-based access control:

- **Roles**: Admin, Manager, Staff, Front Desk (roles defined by backend)
- **Permissions**: Fine-grained permissions control access to features
- **Implementation**:
  - `src/hooks/useAuth.js` - Access authentication state
  - `src/hooks/usePermissions.js` - Check user permissions
  - `src/utils/rbac.js` - RBAC utility functions
  - `src/components/layout/RBAC_IMPLEMENTATION.md` - Detailed RBAC documentation

### Using Permissions in Components

```jsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('inventory:create')) {
    return <div>Access Denied</div>;
  }
  
  return <div>Protected Content</div>;
}
```

## API Integration

### API Service Layer

The application uses a centralized API service layer:

- **`src/services/apiService.js`** - Main API service with axios configuration
- **`src/utils/api.js`** - API configuration and helper functions
- **Feature-specific services** - E.g., `elementHubService.js` for element hub operations

### Making API Calls

```jsx
import apiService from '../services/apiService';

// GET request
const data = await apiService.get('/inventory');

// POST request
const result = await apiService.post('/car-intake', formData);

// PUT request
await apiService.put(`/inventory/${id}`, updates);

// DELETE request
await apiService.delete(`/inventory/${id}`);
```

### Error Handling

API errors are typically handled at the component level or via global error boundaries. The `ErrorBoundary` component (`src/components/ErrorBoundary.jsx`) catches React errors.

## Styling & Theming

### CSS Architecture

- **Global Styles**: `src/index.css`, `src/App.css`
- **Theme**: `src/dark-theme.css` for dark mode support
- **Component Styles**: Feature-specific CSS files in `src/styles/`
- **Layout Styles**: `src/assets/css/custom-layout.css`

### UI Component Libraries

- **Ant Design**: Primary component library - use Ant Design components for consistency
- **Bootstrap**: Used for some legacy components and utilities
- **Custom CSS**: For application-specific styling

### Theming

The application supports light and dark themes. Theme configuration is handled via Ant Design's `ConfigProvider` in `src/App.jsx`.

## Code Quality & Linting

### ESLint Configuration

ESLint is configured via `eslint.config.js` with:
- React hooks rules (`eslint-plugin-react-hooks`)
- React refresh rules (`eslint-plugin-react-refresh`)
- Modern JavaScript standards

### Running Linter

```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

### Best Practices

1. **Component Organization**: 
   - Reusable components → `src/components/`
   - Route-level pages → `src/pages/`

2. **API Calls**: 
   - Always use the service layer (`src/services/`) instead of calling axios directly
   - Centralize API configuration and error handling

3. **State Management**: 
   - Use React Context for global state (auth, theme)
   - Use local state (`useState`) for component-specific state
   - Consider React Query or similar for server state if needed

4. **Permissions**: 
   - Use `PermissionGuard` or `usePermissions` hook instead of inline permission checks
   - Keep permission logic centralized

## Development Tips

### Adding New Features

1. **New Page/Route**:
   - Create component in `src/pages/`
   - Add route in `src/App.jsx`
   - Wrap with `ProtectedRoute` if authentication required
   - Add permission checks if needed

2. **New API Endpoint**:
   - Add backend route first (see backend README)
   - Create/update service function in `src/services/`
   - Use service in your component

3. **New Reusable Component**:
   - Create in `src/components/`
   - Export from appropriate index file if needed
   - Document props and usage

### Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Verify API calls in Network tab
- Check authentication state in React DevTools

## Deployment

### Build for Production

1. Set environment variables for production:
   ```env
   VITE_API_BASE_URL=https://api.autohub.com/api
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. The `dist/` directory contains the production-ready static files.

### Deployment Options

The frontend is a static site and can be deployed to:

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Web Server**: Nginx, Apache (serve `dist/` directory)
- **Container**: Docker with nginx serving static files

### Deployment Checklist

- [ ] Update `VITE_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all API endpoints are accessible from production domain
- [ ] Check CORS configuration on backend allows frontend domain
- [ ] Test authentication flow in production environment
- [ ] Verify all routes work correctly
- [ ] Check console for errors

## Troubleshooting

### Common Issues

1. **API calls failing**:
   - Verify `VITE_API_BASE_URL` is correct
   - Check backend is running and accessible
   - Verify CORS settings on backend

2. **Authentication not working**:
   - Check token storage (cookies/localStorage)
   - Verify backend auth endpoints
   - Check token expiration

3. **Build errors**:
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Review error messages for missing dependencies

## Additional Resources

- **RBAC Documentation**: `src/components/layout/RBAC_IMPLEMENTATION.md`
- **User Guides**: `src/pages/Guide/guides/` (USER_GUIDE_ADMIN.md, USER_GUIDE_MANAGER.md, etc.)
- **Backend API Docs**: `../auto-hub-backend/API_DOCS.md`
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Ant Design Documentation**: https://ant.design/

## Contributing

When contributing to the frontend:

1. Follow existing code structure and patterns
2. Use ESLint and fix any linting errors
3. Test your changes in development mode
4. Ensure API integration works with backend
5. Update documentation if adding new features
6. Test with different user roles/permissions

## License

[Specify your license here]
