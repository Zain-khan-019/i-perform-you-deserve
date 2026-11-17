# I Perform You Deserve

AI-powered student lifestyle and accommodation platform for Lahore. Students get budget and location based recommendations for hostels, mess, laundry, commute and pest control, while service providers manage their listings through a vendor portal.

## Features

- Budget slider (PKR 15,000 to 150,000) and location based recommender
- Hostels, mess, laundry, commute and pest control services in one place
- Health guide with practical tips for Lahore (mosquitoes, snakes and more)
- Separate customer and vendor portals with OTP login
- Vendors can list their hostel or service with details, rent, facilities and photos

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI |
| Database | SQLite with SQLAlchemy |
| Authentication | OTP login |

## Project Structure

```
backend/    API, database models, authentication, recommender
frontend/   React application
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000` and the interactive docs are at `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Author

Zain Khan ([@Zain-khan-019](https://github.com/Zain-khan-019))

## License

This project is licensed under the MIT License.
