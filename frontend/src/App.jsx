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

const nord = {
  light: {
    background: "#ECEFF4", // nord6
    panel: "#E5E9F0",      // nord5
    card: "#D8DEE9",       // nord4
    border: "#B0BEC5",     // custom, close to nord3
    text: "#2E3440",       // nord0
    accent: "#5E81AC",     // nord10
    button: "#81A1C1",     // nord9
    buttonText: "#fff",
    inputBg: "#fff",
    inputText: "#2E3440",
  },
  dark: {
    background: "#2E3440", // nord0
    panel: "#3B4252",      // nord1
    card: "#434C5E",       // nord2
    border: "#4C566A",     // nord3
    text: "#ECEFF4",       // nord6
    accent: "#88C0D0",     // nord8
    button: "#5E81AC",     // nord10
    buttonText: "#ECEFF4",
    inputBg: "#4C566A",
    inputText: "#ECEFF4",
  }
};

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

  const colors = darkMode ? nord.dark : nord.light;

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.body.style.backgroundColor = isDark ? nord.dark.background : nord.light.background;
  
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
      const interestsToSend = interests.trim() === "" ? "general sightseeing" : interests;

      const res = await fetch(`${API_URL}/api/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests: interestsToSend }),
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
      const interestsToSend = interests.trim() === "" ? "general sightseeing" : interests;

      const res = await fetch(`${API_URL}/api/generate-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, interests: interestsToSend }),
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
    <div
      className="min-h-screen w-screen py-6 transition-colors duration-500"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <button
        className="fixed top-4 right-4 p-3 rounded-full shadow hover:scale-105 transition"
        style={{
          backgroundColor: colors.accent,
          color: colors.buttonText,
        }}
        onClick={toggleDarkMode}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold" style={{ color: colors.text }}>
          AI Travel Planner!
        </h1>
        <p className="text-lg mt-1" style={{ color: colors.text, opacity: 0.7 }}>
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
        <div className="flex min-h-screen w-full relative">
          {/* Extra Panel */}
          {itineraryGenerated && extraActivities.length > 0 && (
            <div
              className={`transition-all duration-300 flex-shrink-0 overflow-y-auto h-screen
                ${extraPanelVisible ? "w-80 p-4 border-r" : "w-0 p-0 border-0"}
              `}
              style={{
                backgroundColor: colors.panel,
                borderColor: colors.border,
                color: colors.text,
                minWidth: extraPanelVisible ? "20rem" : "0",
              }}
            >
              <div className={`flex justify-between items-center mb-3 ${extraPanelVisible ? "" : "hidden"}`}>
                <h3 className="text-lg font-semibold">Extra Activities</h3>
                <button
                  style={{
                    background: "none",
                    color: colors.accent,
                  }}
                  onClick={() => setExtraPanelVisible(false)}>
                  Hide
                </button>
              </div>
              <div className={extraPanelVisible ? "" : "hidden"}>
                <SortableContext items={extraActivities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  {extraActivities.map((activity) => (
                    <SortableItem key={activity.id} id={activity.id} activity={activity} container="extra" colors={colors} />
                  ))}
                </SortableContext>
              </div>
            </div>
          )}

          {/* Show Panel Button on left */}
          {!extraPanelVisible && itineraryGenerated && extraActivities.length > 0 && (
            <button
              onClick={() => setExtraPanelVisible(true)}
              className="absolute top-40 left-0 px-3 py-1 rounded z-50"
              style={{
                backgroundColor: colors.accent,
                color: colors.buttonText,
              }}
            >
              Show Extra Activities
            </button>
          )}

          {/* Main Content */}
          <div className="flex-1 transition-all duration-300 min-h-screen py-6 px-4">
            {/* Form */}
            <form onSubmit={generateItinerary} className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="p-2 border rounded"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                  borderColor: colors.border,
                }}
                required
              />
              <input
                type="number"
                placeholder="Days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="p-2 border rounded"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                  borderColor: colors.border,
                }}
                min={1}
                required
              />
              <input
                type="text"
                placeholder="Interests (comma-separated)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="p-2 border rounded"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                  borderColor: colors.border,
                }}
              />
              <button
                type="submit"
                className="p-2 rounded hover:opacity-90"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.buttonText,
                }}
                disabled={loadingItinerary}
              >
                {loadingItinerary ? "Generating..." : "Generate Itinerary"}
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </form>

            {/* Days */}
            {Object.keys(itinerary).map((day) => (
              <div
                key={day}
                className="mb-4 p-4 border rounded"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{day}</h3>
                  <button
                    onClick={() => removeDay(day)}
                    style={{
                      background: "none",
                      color: "#BF616A", // nord11 (red)
                    }}
                  >
                    Remove Day
                  </button>
                </div>
                <SortableContext items={itinerary[day].map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  {itinerary[day].map((activity) => (
                    <DayActivity
                      key={activity.id}
                      activity={activity}
                      day={day}
                      editActivity={editActivity}
                      removeActivity={removeActivity}
                      colors={colors}
                    />
                  ))}
                </SortableContext>
                <button
                  onClick={() => addActivity(day)}
                  className="mt-2 px-2 py-1 rounded hover:opacity-90"
                  style={{
                    backgroundColor: colors.button,
                    color: colors.buttonText,
                  }}
                >
                  + Add Activity
                </button>
              </div>
            ))}

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={addDay}
                className="px-3 py-1 rounded hover:opacity-90"
                style={{
                  backgroundColor: "#A3BE8C", // nord14 (green)
                  color: colors.buttonText,
                }}
              >
                + Add Day
              </button>
              {itineraryGenerated && (
                <button
                  onClick={generateExtraActivities}
                  className="px-3 py-1 rounded hover:opacity-90"
                  style={{
                    backgroundColor: "#B48EAD", // nord15 (purple)
                    color: colors.buttonText,
                  }}
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
              className="flex items-center gap-2 p-2 border rounded shadow-2xl scale-105 select-none"
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                transform: "scale(1.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
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
function SortableItem({ id, activity, container, colors }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { container, activity },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : "auto",
    backgroundColor: colors.card,
    color: colors.text,
    borderColor: colors.border,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-2 p-2 border rounded cursor-move select-none"
      {...attributes}
      {...listeners}
    >
      ☰ {activity.activity}
    </div>
  );
}

function DayActivity({ activity, day, editActivity, removeActivity, colors }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: { container: day, activity },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : "auto",
    backgroundColor: colors.card,
    color: colors.text,
    borderColor: colors.border,
  };

  return (
    <div className="relative">
      {isDragging && (
        <div
          className="absolute inset-0 border-dashed border-2 rounded"
          style={{ height: "100%", borderColor: colors.border }}
        ></div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 mb-2 p-2 border rounded select-none"
      >
        <div {...attributes} {...listeners} className="cursor-move">
          ☰
        </div>

        <input
          type="text"
          value={activity.time}
          onChange={(e) => editActivity(day, activity.id, "time", e.target.value)}
          className="w-24 border rounded p-1 text-sm"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.inputText,
            borderColor: colors.border,
          }}
        />
        <input
          type="text"
          value={activity.activity}
          onChange={(e) => editActivity(day, activity.id, "activity", e.target.value)}
          className="flex-1 border rounded p-1 text-sm"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.inputText,
            borderColor: colors.border,
          }}
        />
        <button
          onClick={() => removeActivity(day, activity.id)}
          className="font-bold cursor-pointer"
          type="button"
          style={{
            color: "#BF616A", // nord11 (red)
            background: "none",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default App;