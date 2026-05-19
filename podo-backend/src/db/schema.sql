CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE animal_status AS ENUM ('happy', 'normal', 'sick', 'critical', 'gone');
CREATE TYPE task_difficulty AS ENUM ('easy', 'normal', 'hard');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    coin_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Animals
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    status animal_status DEFAULT 'happy',
    last_fed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty task_difficulty DEFAULT 'normal',
    pdf_path TEXT,
    questions JSONB,
    deadline TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Memorial Animals
CREATE TABLE memorial_animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_name VARCHAR(50) NOT NULL,
    animal_status_at_death animal_status NOT NULL,
    gone_at TIMESTAMP DEFAULT NOW()
);
