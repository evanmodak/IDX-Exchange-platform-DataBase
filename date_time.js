import "./PropertyOpenHouses.css";

// Debug challenge fix: `remarks` was never appearing because the backend
// only returns raw columns — it never extracts OpenHouseRemarks from
// all_data. all_data is a JSON blob stored as a string (or already an
// object, depending on the mysql2 driver's JSON column handling), so we
// parse it here in the component and pull the key out, per the hint
// ("do this in the component, not the API").
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
  // Handles "HH:MM:SS" style values coming back from MySQL TIME columns.
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ?? "00";
  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
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
                  {start}
                  {start && end ? " – " : ""}
                  {end}
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
