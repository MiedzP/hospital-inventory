# Hospital Inventory Request System

A web application for hospital staff to request inventory items (blankets, supplies, etc.) from the hospital supply chain.

## Features

- **Request Submission**: Staff can easily submit requests for inventory items
- **Request Tracking**: View status of active and fulfilled requests
- **Admin Dashboard**: Supply team can manage and fulfill requests
- **Priority Levels**: Requests can be marked as Urgent, High, Normal, or Low priority
- **Real-time Updates**: Dashboard auto-refreshes every 3 seconds

## Project Structure

```
hospital-inventory/
├── backend/          # Node.js Express API
│   ├── server.js     # Main server file
│   ├── package.json
│   └── inventory.db  # SQLite database (auto-created)
└── frontend/         # React web app (Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── components/
    │       ├── RequestForm.jsx
    │       ├── RequestsList.jsx
    │       └── AdminDashboard.jsx
    └── package.json
```

## Setup & Running

### Prerequisites
- Node.js 16+ installed

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Submit Request** tab: Fill out the form to request an inventory item
   - Select or type the item name (autocomplete from inventory list)
   - Enter quantity needed
   - Select your department
   - Set priority if needed
   - Submit

2. **My Requests** tab: View all your active and fulfilled requests

3. **Admin Dashboard** tab: 
   - View all requests from all staff
   - See statistics (pending, in progress, fulfilled)
   - Change request status
   - Delete requests if needed

## Database

The backend uses SQLite with two main tables:

- **inventory_items**: Available items for request (can be edited later)
- **requests**: All submitted requests with status tracking

Initial inventory includes common hospital supplies like blankets, pillows, bandages, etc.

## Adding/Removing Inventory Items

Currently, you can add items to the `inventory_items` table in the SQLite database. The app will auto-populate from this list.

To add more items programmatically or through an admin interface, you can:
1. Add a new backend endpoint for managing inventory
2. Create an admin section in the frontend
3. Or directly edit the database file

## Deployment

For deployment to a hospital network:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist/` folder to your web server
3. Update the backend API URL in the frontend to point to your production server
4. Deploy the backend to a production Node.js environment

## Future Enhancements

- User authentication (integrate with hospital Active Directory)
- Email/SMS notifications when requests are fulfilled
- Inventory level tracking
- Delivery scheduling
- Request history and analytics
- Multi-facility support
