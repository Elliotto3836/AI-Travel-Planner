import { useState } from "react";

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItinerary(null);

    try {
      const res = await fetch("http://localhost:64055/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests }),
      });

      if (!res.ok) throw new Error("Failed to generate itinerary");

      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-8 text-center">
        AI Travel Planner
      </h1>

      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={1}
            required
          />
          <input
            type="text"
            placeholder="Interests (comma-separated)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {itinerary && (
        <div className="mt-8 w-full max-w-lg flex flex-col gap-6">
          {Object.keys(itinerary).map((day) => (
            <div key={day} className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl text-blue-600 mb-3">{day}</h2>
              <ul className="list-disc list-inside space-y-1">
                {itinerary[day].map((activity, idx) => (
                  <li key={idx} className="text-gray-700">{activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

