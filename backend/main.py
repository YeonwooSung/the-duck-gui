from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import duckdb
from datetime import datetime, timedelta


# Initialize DuckDB
DB_PATH = "logs.db"
conn = duckdb.connect(DB_PATH)


# Sample data insertion function
def insert_sample_data():
    global conn

    # Check if table is empty
    count = conn.execute("SELECT COUNT(*) FROM http_logs").fetchone()[0]
    print(f"Current log count: {count}")
    if count == 0:
        # Generate sample data
        current_time = datetime.now()
        methods = ["POST", "GET", "PUT", "DELETE"]
        statuses = [200, 201, 301, 302, 400, 401, 403, 404, 500, 503]

        for i in range(1000):
            timestamp = current_time - timedelta(seconds=i % 300)
            conn.execute("""
                INSERT INTO http_logs VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, [
                timestamp,
                f"{100+i%150}.{i%255}.{i%255}.{i%255}",
                methods[i % len(methods)],
                f"HTTP/{i%2+1}.{i%2}",
                f"https://example{i%10}.com/referer{i%5}",
                f"/path/to/resource{i%20}",
                statuses[i % len(statuses)],
                f"user{i%50}",
                1000 + (i * 100) % 50000
            ])
        conn.commit()
        print("Sample data inserted!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    print("Starting up...")
    insert_sample_data()

    yield
    # Shutdown event
    print("Shutting down...")


app = FastAPI(
    title="Log Analysis System",
    lifespan=lifespan,
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create table if not exists
conn.execute("""
    CREATE TABLE IF NOT EXISTS http_logs (
        timestamp TIMESTAMP,
        host VARCHAR,
        method VARCHAR,
        protocol VARCHAR,
        referer VARCHAR,
        request VARCHAR,
        status INTEGER,
        user_identifier VARCHAR,
        bytes INTEGER
    )
""")


# Data models
class LogEntry(BaseModel):
    timestamp: datetime
    host: str
    method: str
    protocol: str
    referer: str
    request: str
    status: int
    user_identifier: str
    bytes: int


class TimeSeriesData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]


@app.get("/logs", response_model=List[LogEntry])
async def get_logs(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    method: Optional[str] = None,
    status: Optional[int] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    query = "SELECT * FROM http_logs WHERE 1=1"
    params = []

    if start_time:
        query += " AND timestamp >= ?"
        params.append(start_time)

    if end_time:
        query += " AND timestamp <= ?"
        params.append(end_time)

    if method:
        query += " AND method = ?"
        params.append(method)

    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    try:
        result = conn.execute(query, params).fetchall()
        column_names = [desc[0] for desc in conn.description]

        logs = []
        for row in result:
            log_entry = {}
            for i, col_name in enumerate(column_names):
                log_entry[col_name] = row[i]
            logs.append(LogEntry(**log_entry))

        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/time-series")
async def get_time_series(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    interval: str = "5m",  # 1m, 5m, 15m, 1h, etc.
    group_by: str = "status"
):
    # Parse interval
    interval_value = int(interval[:-1])
    interval_unit = interval[-1]

    if interval_unit == 'm':
        duck_interval = f'{interval_value} minutes'
    elif interval_unit == 'h':
        duck_interval = f'{interval_value} hours'
    else:
        duck_interval = '5 minutes'  # Default

    # Build query based on parameters
    query = f"""
        SELECT 
            time_bucket(INTERVAL '{duck_interval}', timestamp) as time_bucket,
            {group_by},
            COUNT(*) as count
        FROM http_logs
        WHERE 1=1
    """

    params = []
    if start_time:
        query += " AND timestamp >= ?"
        params.append(start_time)

    if end_time:
        query += " AND timestamp <= ?"
        params.append(end_time)

    query += f" GROUP BY time_bucket, {group_by} ORDER BY time_bucket"

    try:
        result = conn.execute(query, params).fetchall()
        
        # Process data for frontend charting
        time_buckets = {}
        unique_groups = set()
        
        for row in result:
            time_str = row[0].strftime("%H:%M:%S")
            group_value = str(row[1])
            count = row[2]
            
            if time_str not in time_buckets:
                time_buckets[time_str] = {}
            
            time_buckets[time_str][group_value] = count
            unique_groups.add(group_value)

        # Format data for chart.js
        labels = sorted(time_buckets.keys())
        datasets = []

        # Generate colors for each group
        colors = {
            "200": "rgba(75, 192, 192, 0.6)",
            "201": "rgba(54, 162, 235, 0.6)",
            "301": "rgba(153, 102, 255, 0.6)",
            "302": "rgba(255, 159, 64, 0.6)",
            "400": "rgba(255, 99, 132, 0.6)",
            "401": "rgba(255, 206, 86, 0.6)",
            "403": "rgba(255, 99, 71, 0.6)",
            "404": "rgba(240, 128, 128, 0.6)",
            "500": "rgba(255, 0, 0, 0.6)",
            "503": "rgba(255, 69, 0, 0.6)",
            "POST": "rgba(75, 192, 192, 0.6)",
            "GET": "rgba(54, 162, 235, 0.6)",
            "PUT": "rgba(153, 102, 255, 0.6)",
            "DELETE": "rgba(255, 99, 132, 0.6)",
        }

        for group in sorted(unique_groups):
            data = [time_buckets.get(label, {}).get(group, 0) for label in labels]
            datasets.append({
                "label": group,
                "data": data,
                "backgroundColor": colors.get(group, f"rgba({hash(group) % 255}, {(hash(group) * 2) % 255}, {(hash(group) * 3) % 255}, 0.6)"),
            })
        
        return {"labels": labels, "datasets": datasets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/summary")
async def get_summary(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
):
    """Get summary statistics of logs"""
    where_clause = "WHERE 1=1"
    params = []
    
    if start_time:
        where_clause += " AND timestamp >= ?"
        params.append(start_time)
    
    if end_time:
        where_clause += " AND timestamp <= ?"
        params.append(end_time)
    
    try:
        # Total requests
        total = conn.execute(f"SELECT COUNT(*) FROM http_logs {where_clause}", params).fetchone()[0]
        
        # Status code distribution
        status_dist = conn.execute(f"""
            SELECT status, COUNT(*) as count 
            FROM http_logs {where_clause} 
            GROUP BY status 
            ORDER BY count DESC
        """, params).fetchall()
        
        # Method distribution
        method_dist = conn.execute(f"""
            SELECT method, COUNT(*) as count 
            FROM http_logs {where_clause} 
            GROUP BY method 
            ORDER BY count DESC
        """, params).fetchall()
        
        # Average response size
        avg_size = conn.execute(f"""
            SELECT AVG(bytes) 
            FROM http_logs {where_clause}
        """, params).fetchone()[0]
        
        return {
            "total_requests": total,
            "status_distribution": {row[0]: row[1] for row in status_dist},
            "method_distribution": {row[0]: row[1] for row in method_dist},
            "average_response_size": round(avg_size, 2) if avg_size else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
