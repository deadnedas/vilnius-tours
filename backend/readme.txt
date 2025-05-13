Table

-- Create User table
CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwd VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL
);

-- Create TourDate table
CREATE TABLE TourDates (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES Tour(id),
    date DATE NOT NULL
);

-- Create Tour table
CREATE TABLE Tours (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    img_url VARCHAR(255),
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(20) CHECK (category IN ('group', 'individual')) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_by INTEGER REFERENCES "User"(id)
);

-- Create TourRegistration table
CREATE TABLE TourRegistrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id),
    tour_date_id INTEGER REFERENCES TourDate(id),
    status VARCHAR(10) CHECK (status IN ('pending', 'approved')) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reviews table
CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id),
    tour_id INTEGER REFERENCES Tour(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);