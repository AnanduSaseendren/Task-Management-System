import { useEffect, useState } from "react";
import axios from "axios";
import TaskForm from "../components/TaskForm";

const API_URL = "https://tms-server-g26p.onrender.com/api/tasks";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "Pending",
        due_date: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const getTokenConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setTasks(response.data.tasks);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load tasks"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);


    const handleTaskAdded = (newTask) => {
        setTasks((previousTasks) => [
            newTask,
            ...previousTasks,
        ]);
    };


    const handleEditClick = (task) => {
        setEditingTask(task);

        setEditForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
            due_date: task.due_date
                ? task.due_date.split("T")[0]
                : "",
        });

        setError("");
    };


    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };


    const handleUpdateTask = async (e) => {
        e.preventDefault();

        if (!editForm.title.trim()) {
            setError("Title is required");
            return;
        }

        if (
            !editForm.due_date ||
            isNaN(new Date(editForm.due_date).getTime())
        ) {
            setError("Due date must be a valid date");
            return;
        }

        try {
            setUpdating(true);
            setError("");

            const response = await axios.put(
                `${API_URL}/${editingTask._id}`,
                editForm,
                getTokenConfig()
            );

            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task._id === editingTask._id
                        ? response.data.task
                        : task
                )
            );

            setEditingTask(null);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to update task"
            );
        } finally {
            setUpdating(false);
        }
    };


    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setError("");

            await axios.delete(
                `${API_URL}/${taskId}`,
                getTokenConfig()
            );

            setTasks((previousTasks) =>
                previousTasks.filter(
                    (task) => task._id !== taskId
                )
            );

            if (editingTask?._id === taskId) {
                setEditingTask(null);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete task"
            );
        }
    };


    const handleCancelEdit = () => {
        setEditingTask(null);
        setError("");
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Task Management
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Add, edit, update and delete your tasks.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-2">


                    <div>
                        {editingTask ? (
                            <div className="rounded-2xl bg-white p-6 shadow-lg">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Edit Task
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Update your task information.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleUpdateTask}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleEditChange}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            rows="4"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={editForm.status}
                                            onChange={handleEditChange}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none"
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Completed">
                                                Completed
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Due Date
                                        </label>

                                        <input
                                            type="date"
                                            name="due_date"
                                            value={editForm.due_date}
                                            onChange={handleEditChange}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {updating
                                                ? "Updating..."
                                                : "Update Task"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 rounded-lg bg-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <TaskForm
                                onTaskAdded={handleTaskAdded}
                            />
                        )}
                    </div>


                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <h2 className="mb-6 text-2xl font-bold text-slate-900">
                            My Tasks
                        </h2>

                        {loading ? (
                            <p className="text-slate-500">
                                Loading tasks...
                            </p>
                        ) : tasks.length === 0 ? (
                            <p className="text-slate-500">
                                No tasks found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="rounded-xl border border-slate-200 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {task.title}
                                                </h3>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    {task.description ||
                                                        "No description"}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${task.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm text-slate-500">
                                            Due Date:{" "}
                                            {task.due_date
                                                ? new Date(
                                                    task.due_date
                                                ).toLocaleDateString()
                                                : "No due date"}
                                        </p>

                                        <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(task)
                                                }
                                                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDeleteTask(task._id)
                                                }
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;