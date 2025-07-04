import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function dashboard() {
  const [topUsers, setTopUsers] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [notesPerDay, setNotesPerDay] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics`, { headers }).then((res) => {
      setTopUsers(res.data.top_users || []);
      setTopTags(res.data.top_tags || []);
      setNotesPerDay(res.data.notes_per_day || []);
    });
  }, []);

  const barChartData = {
    labels: notesPerDay.map((n) => n.date),
    datasets: [
      {
        label: "Notes Created",
        data: notesPerDay.map((n) => n.count),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Notes Created (Last 7 Days)</h3>
        <Bar data={barChartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Most Active Users</h3>
          <ul className="bg-white shadow p-4 rounded space-y-2">
            {topUsers.map((u, i) => (
              <li key={i} className="text-gray-700">
                {u.email} — {u.note_count} notes
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Most Used Tags</h3>
          <ul className="bg-white shadow p-4 rounded space-y-2">
            {topTags.map((t, i) => (
              <li key={i} className="text-gray-700">
                {t.tag} — {t.count} times
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default dashboard;
