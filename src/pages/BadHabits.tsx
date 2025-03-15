import React, { useState } from 'react';
import { useBadHabits } from '../hooks/useBadHabits';

const BadHabits: React.FC = () => {
  const { habits, addHabit, deleteHabit, trackHabit, getHabitStreak, calculateSavings } = useBadHabits();
  const [newHabit, setNewHabit] = useState({ title: '', description: '', cost_per_occurrence: 0 });

  const handleAddHabit = async () => {
    if (newHabit.title.trim() === '') return;
    await addHabit(newHabit);
    setNewHabit({ title: '', description: '', cost_per_occurrence: 0 });
  };

  const handleTrackHabit = async (habitId: string, avoided: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    await trackHabit(habitId, today, avoided);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bad Habits</h1>
      
      {/* Add Habit Form */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Habit title"
          value={newHabit.title}
          onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Cost"
          value={newHabit.cost_per_occurrence}
          onChange={(e) => setNewHabit({ ...newHabit, cost_per_occurrence: Number(e.target.value) })}
          className="border p-2 mr-2"
        />
        <button onClick={handleAddHabit} className="bg-blue-500 text-white p-2">Add Habit</button>
      </div>
      
      {/* Habits List */}
      <ul>
        {habits.map((habit) => (
          <li key={habit.id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{habit.title}</h2>
              <p className="text-sm">Cost: ${habit.cost_per_occurrence.toFixed(2)}</p>
            </div>
            <div>
              <button
                onClick={() => handleTrackHabit(habit.id, true)}
                className="bg-green-500 text-white p-2 mr-2"
              >Avoided</button>
              <button onClick={() => deleteHabit(habit.id)} className="bg-red-500 text-white p-2">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BadHabits;
