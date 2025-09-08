import { useState, useEffect } from "react";

export default function GenerateButton({ loadingItinerary, colors }) {
  const loadingMessages = [
    "Generating...",
    "Wait a minute...",
    "Almost there...",
    "Cooking up your trip..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (loadingItinerary) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000); // change every 2s
    } else {
      setMessageIndex(0); // reset when done
    }

    return () => clearInterval(interval);
  }, [loadingItinerary]);

  return (
    <button
      type="submit"
      className="p-2 rounded hover:opacity-90"
      style={{
        backgroundColor: colors.accent,
        color: colors.buttonText,
      }}
      disabled={loadingItinerary}
    >
      {loadingItinerary ? loadingMessages[messageIndex] : "Generate Itinerary"}
    </button>
  );
}
