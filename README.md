# AI Travel Planner

A full-stack web application that generates AI-powered travel itineraries based on destination, number of days, and user interests.

The frontend is built with **React**, **Vite**, and **Tailwind CSS 4.0**, and the backend uses **Node.js + Express** with integration to **GPT-5 mini** for AI-generated itineraries.

---

## Features

* Enter destination, number of days, and interests
* Generate multi-day itineraries using GPT-5 mini
* Interactive and responsive UI
* Polished design with Tailwind CSS

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS 4.0
* **Backend:** Node.js, Express
* **AI:** OpenAI GPT-5 mini API

---

## Getting Started

### Prerequisites

* Node.js >= 18
* npm

---

### Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env` file with your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the backend server:

   ```bash
   npm start
   ```

   * Backend runs on `http://localhost:64055` by default.

---

### Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the frontend:

   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

1. Enter a **destination**, **number of days**, and optional **interests** (comma-separated).
2. Click **Generate Itinerary**.
3. The AI will return a structured itinerary for each day.
4. Optionally, copy or download the itinerary (future feature).

---

## Project Structure

```
root/
├─ backend/       # Express API + AI logic
├─ frontend/      # React + Vite + Tailwind frontend
├─ .gitignore
├─ README.md
```

---

## Environment Variables

* **Backend:** `.env`

  ```
  OPENAI_API_KEY=your_openai_api_key
  ```
* **Frontend:** No sensitive keys should be exposed. Frontend calls the backend API.

---

## License

MIT License
