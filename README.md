# the duck gui

A modern web application for OLTP service with DuckDB.

## Features

- **Real-time Log Querying**: Filter logs by method, status code, timestamp, etc.
- **Time Series Visualization**: View log distribution over time, grouped by status code or method
- **Summary Statistics**: Get quick insights about request volume, status codes, and HTTP methods
- **Pagination**: Navigate through large log datasets with ease
- **Date Range Selection**: Filter logs by specific time periods

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for building APIs with Python
- **DuckDB**: Embeddable analytical database, perfect for log analysis
- **Uvicorn**: ASGI server to run the FastAPI application

### Frontend
- **Next.js**: React framework with App Router for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Recharts**: Composable charting library for visualizing time series data
- **Axios**: Promise-based HTTP client for API requests
- **Date-fns**: Modern JavaScript date utility library

## Project Structure

```
/
├── backend/                # FastAPI backend
│   ├── main.py            # Main FastAPI application
│   └── logs.db            # DuckDB database file
│
├── frontend/          # Next.js frontend
│   ├── app/
│   │   ├── components/    # React components
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── LogTable.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SummaryStats.tsx
│   │   │   └── TimeSeriesChart.tsx
│   │   ├── lib/
│   │   │   └── api.ts     # API client
│   │   ├── layout.tsx     # App layout
│   │   └── page.tsx       # Main page
│   └── public/            # Static assets
```

## Setup and Installation

### Backend

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-name>/backend
   ```

2. **Create a virtual environment**:

   ```bash
   uv sync
   ```

3. **Run the FastAPI server**:

   ```bash
   source .venv/bin/activate

   uvicorn main:app --reload
   ```

   The server will run at `http://localhost:8000` with the API documentation available at `http://localhost:8000/docs`.

### Frontend

1. **Navigate to the frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env.local` file:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the Next.js development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`.

## Usage

1. **Filtering Logs**:
   - Use the search bar to filter logs with a query like `method="POST" and status!=200`
   - Click the "Run Query" button to execute the filter

2. **Date Range Selection**:
   - Click on the date range picker to select a specific time period
   - Use the predefined options (Last Hour, Last 24h, Last 7d) for quick selection

3. **Time Series Visualization**:
   - Switch between status and method grouping using the dropdown
   - Change the time interval (1m, 5m, 15m, 1h) to adjust visualization granularity

4. **Pagination**:
   - Navigate through the log entries using the pagination controls at the bottom of the table

## API Endpoints

- `GET /logs`: Retrieve log entries with optional filtering
- `GET /time-series`: Get time series data for visualization
- `GET /summary`: Get summary statistics for logs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
