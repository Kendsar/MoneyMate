import React, { useState } from "react";
import { useBadHabits } from "../hooks/useBadHabits";
import { Plus, Target, Trash2, X } from "lucide-react";

interface BadHabitsProps {
  darkMode: boolean;
}

const BadHabits: React.FC<BadHabitsProps> = ({ darkMode }) => {
  const {
    habits,
    loading,
    addHabit,
    deleteHabit,
    trackHabit,
    getHabitStreak,
    calculateSavings,
  } = useBadHabits();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({
    title: "",
    description: "",
    cost_per_occurrence: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [showAddHabitForm, setShowAddHabitForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if editing
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null); // Track which habit is being edited

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await deleteHabit(id);
      if (error) {
        console.error('Error deleting goal:', error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.title.trim() === "") {
      setError("Habit title is required.");
      return;
    }
    await addHabit(newHabit);
    setNewHabit({ title: "", description: "", cost_per_occurrence: 0 });
    setShowAddHabitForm(false);
    setError(null);
  };

  const handleEditHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.title.trim() === "") {
      setError("Habit title is required.");
      return;
    }
    // Call your edit habit function here (you'll need to implement this in your hook)
    // await editHabit(editingHabitId, newHabit);
    setNewHabit({ title: "", description: "", cost_per_occurrence: 0 });
    setShowAddHabitForm(false);
    setIsEditing(false);
    setError(null);
  };

  const cancelForm = () => {
    setShowAddHabitForm(false);
    setIsEditing(false);
    setNewHabit({ title: "", description: "", cost_per_occurrence: 0 });
    setError(null);
  };

  const handleEditClick = (habit: any) => {
    setNewHabit({
      title: habit.title,
      description: habit.description,
      cost_per_occurrence: habit.cost_per_occurrence,
    });
    setEditingHabitId(habit.id);
    setIsEditing(true);
    setShowAddHabitForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-semibold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Bad Habits
        </h2>
        <button
          onClick={() => setShowAddHabitForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Bad Habit
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : habits.length === 0 ? (
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl p-8 shadow-sm text-center`}
        >
          <Target
            className={`w-12 h-12 mx-auto mb-4 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <h3
            className={`text-lg font-semibold mb-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            No Bad Habits Yet
          </h3>
          <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Add your first bad habits to start tracking your progress
          </p>
          <button
            onClick={() => setShowAddHabitForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const cost_per_occurrence = Number(habit.cost_per_occurrence || 0);

            return (
              <div
                key={habit.id}
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl p-6 shadow-sm relative`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {habit.title}
                    </h3>
                    {habit.cost_per_occurrence && (
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Cost: ${habit.cost_per_occurrence}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    disabled={isDeleting === habit.id}
                    className={`p-1 rounded-full ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } ${
                      isDeleting === habit.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <button
                  onClick={() => handleEditClick(habit)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Habit Form */}
      {showAddHabitForm && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
            darkMode ? "dark" : ""
          }`}
        >
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } rounded-xl p-6 shadow-sm w-full max-w-md`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {isEditing ? "Edit Habit" : "Add Bad Habit"}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form
              onSubmit={isEditing ? handleEditHabit : handleAddHabit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="habitTitle"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Habit Title
                </label>
                <input
                  type="text"
                  id="habitTitle"
                  value={newHabit.title}
                  onChange={(e) =>
                    setNewHabit({ ...newHabit, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Smoking, Junk Food"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="habitCost"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Cost per Occurrence (TND)
                </label>
                <input
                  type="number"
                  id="habitCost"
                  value={newHabit.cost_per_occurrence}
                  onChange={(e) =>
                    setNewHabit({
                      ...newHabit,
                      cost_per_occurrence: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border focus:ring-2 focus:ring-blue-500`}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelForm}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? "Update Habit" : "Add Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadHabits;