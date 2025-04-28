// /js/planner.js
document.addEventListener('DOMContentLoaded', () => {
    const taskTitleInput = document.getElementById('task-title');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.title}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(li);

            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                tasks[index].completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });
        });
    }

    addTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        if (title) {
            tasks.push({ title, completed: false });
            taskTitleInput.value = '';
            saveTasks();
            renderTasks();
        }
    });

    taskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    renderTasks();
});