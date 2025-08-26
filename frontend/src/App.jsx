import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
  const [extraActivities, setExtraActivities] = useState([]);
  const [extraPanelVisible, setExtraPanelVisible] = useState(true);
  const [itineraryGenerated, setItineraryGenerated] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null);

  // Dark mode setup
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

  const generateItinerary = async (e) => {
    e.preventDefault();
    setLoadingItinerary(true);
    setError("");
    setItinerary({});
    setItineraryGenerated(false);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/api/generate-itinerary`, {
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
      setItineraryGenerated(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingItinerary(false);
    }
  };

  const generateExtraActivities = async () => {
    setLoadingExtra(true);
    setError("");
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/api/generate-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, interests }),
      });
      if (!res.ok) throw new Error("Failed to generate extra activities");
      const data = await res.json();
      if (!Array.isArray(data.suggestions)) throw new Error("Invalid suggestions format");

      const dataWithIds = data.suggestions.map((s) => ({
        id: `extra-${Date.now()}-${Math.random()}`,
        activity: s,
        time: "",
      }));
      setExtraActivities(dataWithIds);
      setExtraPanelVisible(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingExtra(false);
    }
  };

  const addDay = () => {
    const dayNum = Object.keys(itinerary).length + 1;
    setItinerary((prev) => ({ ...prev, [`Day ${dayNum}`]: [] }));
  };

  const removeDay = (day) => {
    const copy = { ...itinerary };
    delete copy[day];
    setItinerary(copy);
  };

  const addActivity = (day) => {
    const newActivity = {
      id: `${day}-${Date.now()}`,
      time: "9:00 AM",
      activity: "New Activity",
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

  const editActivity = (day, id, field, value) => {
    setItinerary((prev) => ({
      ...prev,
      [day]: prev[day].map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceContainer = active.data.current.container;
    const targetContainer = over.data.current.container;

    // Extra → Day
    if (sourceContainer === "extra" && targetContainer.startsWith("Day")) {
      const idx = extraActivities.findIndex((a) => a.id === active.id);
      if (idx === -1) return;
      const activity = extraActivities[idx];
      setExtraActivities((prev) => prev.filter((a) => a.id !== active.id));
      setItinerary((prev) => ({
        ...prev,
        [targetContainer]: [...(prev[targetContainer] || []), activity],
      }));
      return;
    }

    // Reorder within same day
    if (sourceContainer.startsWith("Day") && sourceContainer === targetContainer) {
      const list = [...itinerary[sourceContainer]];
      const oldIndex = list.findIndex((a) => a.id === active.id);
      const newIndex = list.findIndex((a) => a.id === over.id);
      setItinerary((prev) => ({
        ...prev,
        [sourceContainer]: arrayMove(list, oldIndex, newIndex),
      }));
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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          AI Travel Planner!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">
          by Elliot Zheng
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          const activity = event.active.data.current?.activity || null;
          setActiveDrag({ ...event.active, activity });
        }}
        onDragEnd={(event) => {
          handleDragEnd(event);
          requestAnimationFrame(() => setActiveDrag(null));
        }}
      >
        <div className="flex gap-4 px-4 relative">
          {/* Extra Panel */}
          {itineraryGenerated && extraActivities.length > 0 && (
            <div
              className={`w-80 bg-gray-200 dark:bg-gray-800 p-4 border-l sticky top-0 h-screen flex-shrink-0 overflow-y-auto transform transition-transform duration-300 ${
                extraPanelVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold dark:text-gray-100">Extra Activities</h3>
                <button onClick={() => setExtraPanelVisible(false)}>Hide</button>
              </div>
              <SortableContext items={extraActivities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                {extraActivities.map((activity) => (
                  <SortableItem key={activity.id} id={activity.id} activity={activity} container="extra" />
                ))}
              </SortableContext>
            </div>
          )}

          {/* Show Panel Button on left */}
          {!extraPanelVisible && itineraryGenerated && extraActivities.length > 0 && (
            <button
              onClick={() => setExtraPanelVisible(true)}
              className="fixed top-40 left-4 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 z-50"
            >
              Show Extra Activities
            </button>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Form */}
            <form onSubmit={generateItinerary} className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
                required
              />
              <input
                type="number"
                placeholder="Days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
                min={1}
                required
              />
              <input
                type="text"
                placeholder="Interests (comma-separated)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loadingItinerary}
              >
                {loadingItinerary ? "Generating..." : "Generate Itinerary"}
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </form>

            {/* Days */}
            {Object.keys(itinerary).map((day) => (
              <div key={day} className="mb-4 p-4 border rounded bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{day}</h3>
                  <button onClick={() => removeDay(day)} className="text-red-500">Remove Day</button>
                </div>
                <SortableContext items={itinerary[day].map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  {itinerary[day].map((activity) => (
                    <DayActivity
                      key={activity.id}
                      activity={activity}
                      day={day}
                      editActivity={editActivity}
                      removeActivity={removeActivity}
                    />
                  ))}
                </SortableContext>
                <button
                  onClick={() => addActivity(day)}
                  className="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  + Add Activity
                </button>
              </div>
            ))}

            {/* Controls */}
            <div className="flex gap-2">
              <button onClick={addDay} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ Add Day</button>
              {itineraryGenerated && (
                <button
                  onClick={generateExtraActivities}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                >
                  {loadingExtra ? "Generating..." : "+ Generate Extra Activities"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDrag?.activity && (
            <div
              className="flex items-center gap-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 shadow-2xl scale-105 select-none"
              style={{ transform: "scale(1.05)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
            >
              {activeDrag.activity.activity}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Sortable Extra Item
function SortableItem({ id, activity, container }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { container, activity },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 mb-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 cursor-move select-none"
    >
      ☰ {activity.activity}
    </div>
  );
}

function DayActivity({ activity, day, editActivity, removeActivity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: { container: day, activity },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div className="relative">
      {isDragging && (
        <div
          className="absolute inset-0 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded"
          style={{ height: "100%" }}
        ></div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 mb-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 cursor-move select-none"
      >
        <div className="cursor-move">☰</div>
        <input
          type="text"
          value={activity.time}
          onChange={(e) => editActivity(day, activity.id, "time", e.target.value)}
          className="w-24 border rounded p-1 text-sm dark:bg-gray-600 dark:text-gray-100"
        />
        <input
          type="text"
          value={activity.activity}
          onChange={(e) => editActivity(day, activity.id, "activity", e.target.value)}
          className="flex-1 border rounded p-1 text-sm dark:bg-gray-600 dark:text-gray-100"
        />
        <button onClick={() => removeActivity(day, activity.id)} className="text-red-500 font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}

export default App;
