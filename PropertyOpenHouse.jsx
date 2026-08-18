import "./PropertyOpenHouses.css";

function extractRemarks(allData) {
  if (!allData) return null;

  try {
    const parsed = typeof allData === "string" ? JSON.parse(allData) : allData;
    return parsed?.OpenHouseRemarks?.trim() || null;
  } catch {
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] ?? "00";
  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return displayHour + ":" + minutes + " " + period;
}

export default function PropertyOpenHouses({ openHouses }) {
  if (!openHouses || openHouses.length === 0) {
    return (
      <div className="open-houses">
        <h2 className="open-houses-title">Open Houses</h2>
        <p className="open-houses-empty">No open houses scheduled</p>
      </div>
    );
  }

  return (
    <div className="open-houses">
      <h2 className="open-houses-title">Open Houses</h2>
      <ul className="open-houses-list">
        {openHouses.map((oh) => {
          const remarks = extractRemarks(oh.allData);
          const start = formatTime(oh.startTime);
          const end = formatTime(oh.endTime);

          return (
            <li key={oh.id} className="open-house-item">
              <div className="open-house-date">{formatDate(oh.date)}</div>
              {(start || end) && (
                <div className="open-house-time">
                  {start}{start && end ? " - " : ""}{end}
                </div>
              )}
              {remarks && <p className="open-house-remarks">{remarks}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
