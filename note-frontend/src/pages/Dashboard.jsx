import { useEffect, useState } from "react";
import { getUserFromToken } from "../services/auth";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function Dashboard() {
  const user = getUserFromToken();
  const isAdmin = user && user.email === "swarnadeep321@gmail.com";

  // Only admin can access the dashboard
  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">You do not have access to see the analytics dashboard.</p>
            <p className="text-sm text-gray-500">Only administrators can view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const [analytics, setAnalytics] = useState({
    top_users: [],
    top_tags: [],
    notes_per_day: [],
    login_logout_activity: {},
    study_activity: {},
    daily_activity: {},
    most_active_chart: { labels: [], data: [], formatted_data: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);
  const [sessionDurations, setSessionDurations] = useState({});
  const [debugData, setDebugData] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAnalytics();
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics/user-activity`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setActivity(res.data))
      .catch(() => setActivity([]));
    
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics/session-durations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setSessionDurations(res.data))
      .catch(() => setSessionDurations({}));
  }, []);

  const createTestData = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/analytics/create-test-data`, {}, { headers });
      alert(`Test data created: ${res.data.message}`);
      fetchAnalytics(); 
    } catch (err) {
      alert(`Error creating test data: ${err.response?.data?.detail || err.message}`);
    }
  };

  const fetchDebugData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics/debug-analytics`, { headers });
      setDebugData(res.data);
    } catch (err) {
      alert(`Error fetching debug data: ${err.response?.data?.detail || err.message}`);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics`, { headers });
      
      console.log("Analytics response:", res.data); // Debug log
      
      if (res.data.top_users && res.data.top_tags && res.data.notes_per_day) {
        setAnalytics(res.data);
      } else {
        // Fallback for old structure
        setAnalytics({
          top_users: res.data.top_users || [],
          top_tags: res.data.top_tags || [],
          notes_per_day: res.data.notes_per_day || [],
          login_logout_activity: res.data.login_logout_activity || {},
          study_activity: res.data.study_activity || {},
          daily_activity: res.data.daily_activity || {},
          most_active_chart: res.data.most_active_chart || { labels: [], data: [], formatted_data: [] }
        });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(`Failed to load analytics data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const barChartData = {
    labels: analytics.notes_per_day.map((n) => n.date),
    datasets: [
      {
        label: "Notes Created",
        data: analytics.notes_per_day.map((n) => n.count),
        backgroundColor: "#3B82F6",
        borderColor: "#2563EB",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Notes Created in Last 7 Days'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const mostActiveUserChartData = {
    labels: analytics.most_active_chart.labels,
    datasets: [
      {
        label: "Total Session Time (seconds)",
        data: analytics.most_active_chart.data,
        backgroundColor: "#10B981",
        borderColor: "#059669",
        borderWidth: 2,
      },
    ],
  };

  const mostActiveUserChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Most Active User - Total Session Time'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            return `Session Time: ${analytics.most_active_chart.formatted_data[index]}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Seconds'
        }
      }
    }
  };

  // Daily activity line chart data
  const dailyActivityData = {
    labels: Object.keys(analytics.daily_activity).sort(),
    datasets: [
      {
        label: "Logins",
        data: Object.keys(analytics.daily_activity).sort().map(date => analytics.daily_activity[date]?.logins || 0),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.1
      },
      {
        label: "Logouts",
        data: Object.keys(analytics.daily_activity).sort().map(date => analytics.daily_activity[date]?.logouts || 0),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.1
      },
      {
        label: "Study Sessions",
        data: Object.keys(analytics.daily_activity).sort().map(date => analytics.daily_activity[date]?.study_sessions || 0),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.1
      }
    ]
  };

  // Compute total study time per user for the chart
  const studyTimePerUser = {};
  activity.forEach((a) => {
    if (a.event === undefined && a.email && a.timeSpent) {
      studyTimePerUser[a.email] = (studyTimePerUser[a.email] || 0) + a.timeSpent;
    }
  });
  const chartData = {
    labels: Object.keys(studyTimePerUser),
    datasets: [
      {
        label: "Total Study Time (s)",
        data: Object.values(studyTimePerUser),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // Session durations bar chart data
  const sessionBarData = {
    labels: Object.keys(sessionDurations),
    datasets: [
      {
        label: "Total Session Time (s)",
        data: Object.values(sessionDurations),
        backgroundColor: "#f59e42",
      },
    ],
  };

  let mostActiveUser = null;
  let maxSessionTime = 0;
  if (Object.keys(sessionDurations).length > 0) {
    for (const [email, time] of Object.entries(sessionDurations)) {
      if (time > maxSessionTime) {
        maxSessionTime = time;
        mostActiveUser = email;
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Admin Analytics Dashboard</h2>

      {/* Debug Controls */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-yellow-800">Debug Controls</h3>
        <div className="flex gap-4">
          <button 
            onClick={createTestData}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Create Test Data
          </button>
          <button 
            onClick={fetchDebugData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fetch Debug Data
          </button>
        </div>
        {debugData && (
          <div className="mt-4 p-4 bg-white rounded border">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <p>Total Records: {debugData.total_records}</p>
            <p>Login/Logout Records: {debugData.login_logout_records}</p>
            <p>Study Records: {debugData.study_records}</p>
            <p>Tracked Users: {debugData.tracked_users?.join(", ")}</p>
            {debugData.recent_login_logout?.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Recent Login/Logout Events:</p>
                <ul className="text-sm">
                  {debugData.recent_login_logout.slice(0, 5).map((event, i) => (
                    <li key={i}>
                      {event.email} - {event.event} - {new Date(event.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Most Active User Chart */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Most Active User - Session Time Comparison</h3>
        {analytics.most_active_chart.labels.length > 0 ? (
          <div>
            <Bar data={mostActiveUserChartData} options={mostActiveUserChartOptions} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Tracking users: swarnadeep896@gmail.com, jimmycarter@gmail.com, willphilips364@yahoo.com
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No user activity data available</p>
        )}
      </div>

      {/* Daily Activity Summary */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Daily Activity Summary (Last 7 Days)</h3>
        {Object.keys(analytics.daily_activity).length > 0 ? (
          <Line data={dailyActivityData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Daily User Activity' }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }} />
        ) : (
          <p className="text-center text-gray-500 py-8">No daily activity data available</p>
        )}
      </div>

      {/* User Login/Logout Activity */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">User Login/Logout Activity</h3>
        {Object.keys(analytics.login_logout_activity).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">User Email</th>
                  <th className="border px-4 py-2 text-center">Total Sessions</th>
                  <th className="border px-4 py-2 text-center">Total Time</th>
                  <th className="border px-4 py-2 text-center">Login Count</th>
                  <th className="border px-4 py-2 text-center">Logout Count</th>
                  <th className="border px-4 py-2 text-center">Avg Session</th>
                  <th className="border px-4 py-2 text-center">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.login_logout_activity).map(([email, data]) => (
                  <tr key={email} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{email}</td>
                    <td className="border px-4 py-2 text-center">{data.total_sessions}</td>
                    <td className="border px-4 py-2 text-center">{data.total_time_formatted}</td>
                    <td className="border px-4 py-2 text-center text-green-600">{data.login_count}</td>
                    <td className="border px-4 py-2 text-center text-red-600">{data.logout_count}</td>
                    <td className="border px-4 py-2 text-center">{Math.round(data.avg_session_duration)}s</td>
                    <td className="border px-4 py-2 text-center text-sm">
                      {data.last_activity ? new Date(data.last_activity).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No login/logout activity data available</p>
        )}
      </div>

      {/* User Study Activity */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">User Study Activity</h3>
        {Object.keys(analytics.study_activity).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">User Email</th>
                  <th className="border px-4 py-2 text-center">Total Study Time</th>
                  <th className="border px-4 py-2 text-center">Study Sessions</th>
                  <th className="border px-4 py-2 text-center">Pages Visited</th>
                  <th className="border px-4 py-2 text-center">Avg Session Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.study_activity).map(([email, data]) => (
                  <tr key={email} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-medium">{email}</td>
                    <td className="border px-4 py-2 text-center font-semibold text-blue-600">{data.total_study_time_formatted}</td>
                    <td className="border px-4 py-2 text-center">{data.study_sessions}</td>
                    <td className="border px-4 py-2 text-center">{data.pages_visited}</td>
                    <td className="border px-4 py-2 text-center">{Math.round(data.avg_session_time)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No study activity data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notes Created Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Notes Created (Last 7 Days)</h3>
          {analytics.notes_per_day.length > 0 ? (
            <Bar data={barChartData} options={barChartOptions} />
          ) : (
            <p className="text-center text-gray-500 py-8">No data available for the last 7 days</p>
          )}
        </div>

        {/* Session Durations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">User Session Durations</h3>
          {mostActiveUser && (
            <div className="mb-4 text-green-700 font-bold">
              Most Active User: {mostActiveUser} ({Math.round(maxSessionTime)} seconds)
            </div>
          )}
          {Object.keys(sessionDurations).length > 0 ? (
            <Bar data={sessionBarData} />
          ) : (
            <p className="text-center text-gray-500 py-8">No session data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
          {analytics.top_users.length > 0 ? (
            <ul className="space-y-3">
              {analytics.top_users.map((user, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{user.email}</span>
                  <span className="text-blue-600 font-semibold">{user.note_count} notes</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No user data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Used Tags</h3>
          {analytics.top_tags.length > 0 ? (
            <ul className="space-y-3">
              {analytics.top_tags.map((tag, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium">{tag.tag}</span>
                  <span className="text-green-600 font-semibold">{tag.count} times</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">No tag data available</p>
          )}
        </div>
      </div>

      {/* Raw Activity Data */}
      <div className="mt-8 p-8 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Raw User Activity Data</h3>
        <div className="mb-8 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Total Study Time per User</h3>
          <Bar data={chartData} />
        </div>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Event</th>
              <th className="border px-4 py-2">Time Spent (s)</th>
              <th className="border px-4 py-2">Page</th>
              <th className="border px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.id}>
                <td className="border px-4 py-2">{a.email}</td>
                <td className="border px-4 py-2">{a.event ? a.event.toUpperCase() : (a.page ? "STUDY" : "-")}</td>
                <td className="border px-4 py-2">{a.timeSpent || "-"}</td>
                <td className="border px-4 py-2">{a.page || "-"}</td>
                <td className="border px-4 py-2">{new Date(a.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
