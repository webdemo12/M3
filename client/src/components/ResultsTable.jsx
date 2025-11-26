export default function ResultsTable({ results }) {
  // Group results by date and organize by time slots
  const groupedByDate = results.reduce((acc, result) => {
    if (!acc[result.result_date]) {
      acc[result.result_date] = {};
    }
    acc[result.result_date][result.time_slot] = result;
    return acc;
  }, {});

  const TIME_SLOTS = [
    "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM",
    "04:30 PM", "06:00 PM", "07:30 PM", "09:00 PM"
  ];

  return (
    <div className="table-container">
      <table className="table" data-testid="results-table">
        <thead>
          <tr>
            <th>Date</th>
            {TIME_SLOTS.map((slot) => (
              <th key={slot} style={{ textAlign: "center" }}>{slot}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByDate).map(([date, dayResults]) => (
            <tr key={date} data-testid={`results-row-${date}`}>
              <td className="text-sm text-muted">
                {new Date(date).toLocaleDateString('en-IN', { 
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
              {TIME_SLOTS.map((slot) => {
                const result = dayResults[slot];
                return (
                  <td key={slot} style={{ textAlign: "center" }}>
                    {result ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#EF4444" }}>
                          {result.number_1}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                          {result.number_2}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
