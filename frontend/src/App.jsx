import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./index.css";

// ---------------------
// Sortable Item Component
// ---------------------
function SortableItem({ id, item, activeId }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
    boxSizing: "border-box",
  };

  const isDragging = activeId === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`draggable-item p-3 rounded shadow flex items-center gap-3 transition-all duration-150
        ${isDragging ? "opacity-0 scale-95" : "bg-white dark:bg-gray-800"}`}
    >
      <span className="cursor-grab select-none text-gray-500 dark:text-gray-300">☰</span>
      <span>
        <strong>{item.time}</strong>: {item.activity}
      </span>
    </div>
  );
}

// ---------------------
// Main App
// ---------------------
function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // ---------------------
  // Handle itinerary fetch
  // ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setItinerary(null);

    try {
      const res = await fetch("http://localhost:52275/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests }),
      });
      if (!res.ok) throw new Error("Failed to generate itinerary");

      const data = await res.json();

      // Normalize activities: ensure every activity has a time, activity, and unique id
      const withIds = {};
      Object.keys(data).forEach((day) => {
        withIds[day] = data[day].map((act, idx) => {
          let activityObj;

          if (typeof act === "string") {
            const splitIndex = act.indexOf(":");
            if (splitIndex > -1) {
              const timePart = act.slice(0, splitIndex).trim();
              const activityPart = act.slice(splitIndex + 1).trim();
              activityObj = { time: timePart || "(No time)", activity: activityPart };
            } else {
              // If no colon, use first word as time and rest as activity
              const words = act.split(" ");
              const timePart = words[0];
              const activityPart = words.slice(1).join(" ");
              activityObj = { time: timePart, activity: activityPart };
            }
          } else {
            activityObj = { time: act.time || "(No time)", activity: act.activity || "" };
          }

          return {
            id: `${day}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            ...activityObj,
          };
        });
      });

      setItinerary(withIds);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------
  // Drag handlers
  // ---------------------
  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const newItinerary = { ...itinerary };
    let sourceDay, sourceIndex, targetDay, targetIndex;

    Object.keys(newItinerary).forEach((day) => {
      const idx = newItinerary[day].findIndex((i) => i.id === active.id);
      if (idx > -1) {
        sourceDay = day;
        sourceIndex = idx;
      }
    });

    Object.keys(newItinerary).forEach((day) => {
      const idx = newItinerary[day].findIndex((i) => i.id === over.id);
      if (idx > -1) {
        targetDay = day;
        targetIndex = idx;
      }
    });

    if (sourceDay && targetDay) {
      if (sourceDay === targetDay) {
        newItinerary[sourceDay] = arrayMove(newItinerary[sourceDay], sourceIndex, targetIndex);
      } else {
        const [moved] = newItinerary[sourceDay].splice(sourceIndex, 1);
        newItinerary[targetDay].splice(targetIndex, 0, moved);
      }
    }

    setItinerary(newItinerary);
    setActiveId(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <button className="toggle-button" onClick={toggleDarkMode}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      <h1 className="text-4xl font-extrabold text-center mb-8">AI Travel Planner!</h1>

      <div className="w-full max-w-lg card p-6 mb-6">
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {Object.keys(itinerary)
            .sort((a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1]))
            .map((day) => (
              <div
                key={day}
                className="p-4 mb-4 rounded shadow-md w-full max-w-lg flex flex-col gap-2 bg-gray-100 dark:bg-gray-700"
              >
                <h2 className="font-bold text-xl mb-2">{day}</h2>
                <SortableContext
                  items={itinerary[day].map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {itinerary[day].map((item) => (
                    <SortableItem key={item.id} id={item.id} item={item} activeId={activeId} />
                  ))}
                </SortableContext>
              </div>
            ))}

          <DragOverlay>
            {activeId
              ? (() => {
                  const flatItems = Object.values(itinerary).flat();
                  const activeItem = flatItems.find((i) => i.id === activeId);

                  return activeItem ? (
                    <div
                      className="draggable-item p-3 rounded shadow-lg flex items-center gap-3 bg-white dark:bg-gray-800 w-full transform scale-105 transition-transform duration-150"
                      style={{ zIndex: 1000 }}
                    >
                      <span className="cursor-grab select-none text-gray-500 dark:text-gray-300">☰</span>
                      <span>
                        <strong>{activeItem.time}</strong>: {activeItem.activity}
                      </span>
                    </div>
                  ) : null;
                })()
              : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

export default App;
