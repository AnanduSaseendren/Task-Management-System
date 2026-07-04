import { useState } from "react";
import axios from "axios";

const API_URL = "https://tms-server-g26p.onrender.com/api/tasks";

function TaskForm({ onTaskAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    due_date: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (
      !formData.due_date ||
      isNaN(new Date(formData.due_date).getTime())
    ) {
      setError("Due date must be a valid date");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        API_URL,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onTaskAdded(response.data.task);

      setFormData({
        title: "",
        description: "",
        status: "Pending",
        due_date: "",
      });

      setMessage("Task added successfully");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold">
        Add Task
      </h2>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-4 text-green-600">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="Pending">
            Pending
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white"
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;