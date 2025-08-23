import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const [activeDay, activeId] = active.id.split(":");
    const [overDay, overId] = over.id.split(":");

    if (activeDay === overDay) {
      const oldIndex = itinerary[activeDay].findIndex((a) => a.id === activeId);
      const newIndex = itinerary[overDay].findIndex((a) => a.id === overId);
      setItinerary((prev) => ({
        ...prev,
        [activeDay]: arrayMove(prev[activeDay], oldIndex, newIndex),
      }));
    } else {
      const activeItem = itinerary[activeDay].find((a) => a.id === activeId);
      setItinerary((prev) => {
        const newActive = prev[activeDay].filter((a) => a.id !== activeId);
        const insertIndex = prev[overDay].findIndex((a) => a.id === overId);
        const newOver = [...prev[overDay]];
        newOver.splice(insertIndex, 0, activeItem);
        return { ...prev, [activeDay]: newActive, [overDay]: newOver };
      });
    }
  };

  const handleEdit = (day, id, field, value) => {
    setItinerary((prev) => ({
      ...prev,
      [day]: prev[day].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addActivity = (day) => {
    const newActivity = {
      id: `${day}-${Date.now()}`,
      time: "9:00 AM",
      activity: "New activity",
    };
    setItinerary((prev) => ({
      ...prev,
      [day]: [...prev[day], newActivity],
    }));
  };

  const removeActivity = (day, id) => {
    setItinerary((prev) => ({
      ...prev,
      [day]: prev[day].filter((a) => a.id !== id),
    }));
  };

  const addDay = () => {
    const dayNum = Object.keys(itinerary).length + 1;
    const dayKey = `Day ${dayNum}`;
    setItinerary((prev) => ({ ...prev, [dayKey]: [] }));
  };

  const removeDay = (day) => {
    const copy = { ...itinerary };
    delete copy[day];
    setItinerary(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItinerary({});

    try {
      const res = await fetch("http://localhost:63930/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests }),
      });
      if (!res.ok) throw new Error("Failed to generate itinerary");
      const data = await res.json();
      const dataWithIds = {};
      Object.entries(data).forEach(([day, acts], dayIdx) => {
        dataWithIds[day] = acts.map((a, idx) => ({
          ...a,
          id: `d${dayIdx}-${idx}-${Date.now()}`,
        }));
      });
      setItinerary(dataWithIds);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 dark:bg-gray-900 py-6">
      <button
        className="fixed top-4 right-4 p-3 rounded-full bg-blue-600 text-white dark:bg-blue-300 dark:text-black shadow hover:scale-105 transition"
        onClick={toggleDarkMode}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        AI Travel Planner!
      </h1>

      {/* Form */}
      <div className="w-full mb-8 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
            min={1}
            required
          />
          <input
            type="text"
            placeholder="Interests (comma-separated)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Add day button */}
      <div className="w-full mb-6 flex justify-between items-center px-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Itinerary</h2>
        <button
          onClick={addDay}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add Day
        </button>
      </div>

      {/* Itinerary */}
      {Object.keys(itinerary).length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Object.keys(itinerary).map((day) => (
            <div key={day} className="w-full mb-6 px-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{day}</h3>
                <button onClick={() => removeDay(day)} className="text-red-500 hover:text-red-700">
                  Remove Day
                </button>
              </div>

              <SortableContext
                items={itinerary[day].map((a) => `${day}:${a.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {itinerary[day].map((activity) => (
                  <SortableItem
                    key={activity.id}
                    id={`${day}:${activity.id}`}
                    activity={activity}
                    onEdit={(field, value) => handleEdit(day, activity.id, field, value)}
                    onRemove={() => removeActivity(day, activity.id)}
                  />
                ))}
              </SortableContext>

              <button
                onClick={() => addActivity(day)}
                className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                + Add Activity
              </button>
            </div>
          ))}
        </DndContext>
      )}
    </div>
  );
}

function SortableItem({ id, activity, onEdit, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 mb-2 w-full"
    >
      <input
        type="text"
        value={activity.time}
        onChange={(e) => onEdit("time", e.target.value)}
        className="w-28 border rounded p-2 text-sm dark:bg-gray-600 dark:text-gray-100"
      />
      <input
        type="text"
        value={activity.activity}
        onChange={(e) => onEdit("activity", e.target.value)}
        className="flex-1 border rounded p-2 text-sm dark:bg-gray-600 dark:text-gray-100"
      />
      <button onClick={onRemove} className="text-red-500 font-bold">✕</button>
    </div>
  );
}

export default App;
