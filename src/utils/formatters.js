

export const formatVolume = (volume) => {
  if (!volume) return "Not Available";
  if (volume >= 1e7) return (volume / 1e7).toFixed(2) + "Cr";
  if (volume >= 1e5) return (volume / 1e5).toFixed(2) + "L";
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + "K";
  return volume.toString();
};

export const formatTimestamp = (timestamp, compact = false) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);

  if (compact) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
};