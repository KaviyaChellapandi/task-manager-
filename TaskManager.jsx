import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

const TaskItem = ({ task, index, moveTask, toggleComplete, deleteTask }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "TASK",
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [, drop] = useDrop(() => ({
        accept: "TASK",
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveTask(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    }));

    return (
        <div ref={(node) => drag(drop(node))} className={`task-item ${isDragging ? "opacity-50" : ""}`}>
            <div>
                <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} className="mr-2" />
                <span className={task.completed ? "line-through" : ""}>{task.title}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="task-button delete">Delete</button>
        </div>
    );
};

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        setTasks(savedTasks);
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (newTask.trim() === "") return;
        setTasks([...tasks, { id: uuidv4(), title: newTask, completed: false }]);
        setNewTask("");
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const moveTask = (fromIndex, toIndex) => {
        const updatedTasks = [...tasks];
        const [movedTask] = updatedTasks.splice(fromIndex, 1);
        updatedTasks.splice(toIndex, 0, movedTask);
        setTasks(updatedTasks);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={`task-container ${darkMode ? "dark-mode" : ""}`}>
                <button onClick={() => setDarkMode(!darkMode)} className="task-button add">
                    Toggle Dark Mode
                </button>
                <div className="mb-4 flex">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} className="p-2 border rounded flex-grow" placeholder="Add a new task..." />
                    <button onClick={addTask} className="task-button add">Add</button>
                </div>
                {tasks.map((task, index) => (
                    <TaskItem key={task.id} task={task} index={index} moveTask={moveTask} toggleComplete={toggleComplete} deleteTask={deleteTask} />
                ))}
            </div>
        </DndProvider>
    );
};

export default TaskManager;
