document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS (Unchanged) ---
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const dueDateInput = document.getElementById('due-date-input');
    const taskList = document.getElementById('task-list');
    const newProjectForm = document.getElementById('new-project-form');
    const newProjectInput = document.getElementById('new-project-input');
    const projectList = document.getElementById('project-list');
    const mainViewTitle = document.getElementById('main-view-title');
    const focusModal = document.getElementById('focus-modal');
    const modalContent = document.getElementById('modal-content');
    const closeFocusModalBtn = document.getElementById('close-modal-btn');
    const focusTaskName = document.getElementById('focus-task-name');
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const durationInput = document.getElementById('duration-input');
    const timerSetup = document.getElementById('timer-setup');
    const progressRing = document.getElementById('progress-ring');
    const ringCircumference = 2 * Math.PI * 45;

    // --- APP STATE & TIMER STATE (Unchanged) ---
    let tasks = [];
    let projects = ['All Tasks', 'Work', 'Personal'];
    let currentProject = 'All Tasks';
    let timerInterval;
    let initialSeconds = 25 * 60;
    let totalSeconds = 25 * 60;
    let isPaused = true;
    const alarmSound = new Audio('asset/loud_alarm_sound.mp3');
    alarmSound.loop = true;

    // --- RENDER FUNCTIONS ---
    const render = () => { renderProjects(); renderTasks(); };

    // UPDATED renderProjects function
    const renderProjects = () => {
        projectList.innerHTML = '';
        projects.forEach(project => {
            const li = document.createElement('li');
            // Add 'group' for hover effects on children
            li.className = 'group flex items-center justify-between px-4 py-2 rounded-md cursor-pointer font-medium transition-colors text-sm';
            
            if (project === currentProject) {
                li.classList.add('bg-brand-primary', 'text-white');
            } else {
                li.classList.add('hover:bg-brand-surface', 'text-brand-text');
            }
            
            // Project name
            const projectNameSpan = document.createElement('span');
            projectNameSpan.textContent = project;
            projectNameSpan.className = 'flex-grow'; // Allow name to take up space
            projectNameSpan.addEventListener('click', () => { 
                currentProject = project; 
                mainViewTitle.textContent = project; 
                render(); 
            });
            li.appendChild(projectNameSpan);

            // Add delete button ONLY if it's not the "All Tasks" project
            if (project !== 'All Tasks') {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-project-btn text-brand-muted hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity';
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt fa-xs"></i>';
                deleteBtn.dataset.projectName = project; // Store project name in data attribute
                li.appendChild(deleteBtn);
            }
            
            projectList.appendChild(li);
        });
    };

    const renderTasks = () => { /* ... unchanged ... */ taskList.innerHTML = ''; const filteredTasks = (currentProject === 'All Tasks') ? tasks : tasks.filter(task => task.project === currentProject); if (filteredTasks.length === 0) { taskList.innerHTML = '<p class="text-brand-muted text-center py-4">Looks like you\'re all done. ✨</p>'; return; } const priorityColors = { high: 'bg-priority-high', medium: 'bg-priority-medium', low: 'bg-priority-low' }; filteredTasks.forEach(task => { const taskElement = document.createElement('li'); const priorityClass = priorityColors[task.priority] || 'bg-slate-400'; taskElement.className = `task-item group flex items-start bg-brand-bg p-3 sm:p-4 rounded-lg border border-brand-border transition-all hover:shadow-md hover:border-slate-300 ${task.completed ? 'opacity-50' : ''}`; taskElement.dataset.id = task.id; taskElement.innerHTML = `<div class="flex items-center h-6"><span class="h-2 w-2 mr-3 rounded-full ${priorityClass}"></span><input type="checkbox" class="task-checkbox h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer" ${task.completed ? 'checked' : ''}></div><div class="task-details flex-grow ml-4"><span class="task-text font-medium text-brand-text ${task.completed ? 'line-through' : ''}">${task.text}</span><div class="task-info text-sm text-brand-muted mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">${task.project !== 'All Tasks' ? `<span class="project-tag bg-brand-surface text-brand-muted px-2 py-0.5 rounded-full text-xs font-medium">${task.project}</span>` : ''} ${task.dueDate ? `<span class="due-date"><i class="far fa-calendar-alt mr-1.5"></i>${task.dueDate}</span>` : ''}</div><ul class="subtask-list mt-3 pt-3 border-t border-brand-border border-dashed space-y-2"></ul><form class="add-subtask-form mt-3 hidden"><input type="text" class="add-subtask-input bg-brand-surface border border-brand-border rounded-md px-2 py-1 text-sm w-full" placeholder="Add subtask..."><button type="submit" class="hidden"></button></form></div><div class="task-actions flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><button class="add-subtask-btn text-brand-muted hover:text-brand-primary p-1" title="Add Subtask"><i class="fas fa-plus-circle"></i></button><button class="focus-btn text-brand-muted hover:text-brand-primary p-1" title="Start Focus Session"><i class="fas fa-brain"></i></button><button class="delete-btn text-brand-muted hover:text-red-500 p-1" title="Delete Task"><i class="fas fa-trash-alt"></i></button></div>`; const subtaskListElement = taskElement.querySelector('.subtask-list'); if (task.subtasks?.length > 0) { task.subtasks.forEach(subtask => { const subtaskLi = document.createElement('li'); subtaskLi.className = `subtask-item flex items-center text-sm text-brand-muted ${subtask.completed ? 'line-through opacity-70' : ''}`; subtaskLi.dataset.id = subtask.id; subtaskLi.innerHTML = `<input type="checkbox" class="subtask-checkbox h-4 w-4 mr-2 rounded cursor-pointer" ${subtask.completed ? 'checked' : ''}><span>${subtask.text}</span>`; subtaskListElement.appendChild(subtaskLi); }); } taskList.appendChild(taskElement); }); };
    
    // --- EVENT HANDLERS ---
    addTaskForm.addEventListener('submit', e => { /* ... */ e.preventDefault(); const text = taskInput.value.trim(); if (text === '') return; tasks.push({id: Date.now(), text, priority: prioritySelect.value, dueDate: dueDateInput.value, completed: false, project: currentProject === 'All Tasks' ? 'Personal' : currentProject, subtasks: []}); taskInput.value = ''; dueDateInput.value = ''; prioritySelect.value = 'medium'; renderTasks(); });
    newProjectForm.addEventListener('submit', e => { /* ... */ e.preventDefault(); const name = newProjectInput.value.trim(); if (name && !projects.includes(name)) { projects.push(name); newProjectInput.value = ''; currentProject = name; render(); }});
    taskList.addEventListener('click', e => { /* ... */ const taskEl = e.target.closest('.task-item'); if (!taskEl) return; const id = Number(taskEl.dataset.id); if (e.target.matches('.task-checkbox')) toggleTaskComplete(id); else if (e.target.closest('.delete-btn')) deleteTask(id); else if (e.target.closest('.focus-btn')) openFocusModal(id); else if (e.target.closest('.add-subtask-btn')) { const form = taskEl.querySelector('.add-subtask-form'); form.classList.toggle('hidden'); if(!form.classList.contains('hidden')) form.querySelector('input').focus(); } else if (e.target.matches('.subtask-checkbox')) { const subId = Number(e.target.closest('.subtask-item').dataset.id); toggleSubtaskComplete(id, subId); }});
    taskList.addEventListener('submit', e => { /* ... */ if (e.target.matches('.add-subtask-form')) { e.preventDefault(); const input = e.target.querySelector('input'); const text = input.value.trim(); if (text === '') return; const id = Number(e.target.closest('.task-item').dataset.id); addSubtask(id, text); input.value = ''; }});

    // NEW event listener for project list using event delegation
    projectList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-project-btn');
        if (deleteButton) {
            const projectName = deleteButton.dataset.projectName;
            deleteProject(projectName);
        }
    });

    // --- CORE LOGIC FUNCTIONS ---
    const toggleTaskComplete = id => { const task = tasks.find(t => t.id === id); if (task) { task.completed = !task.completed; renderTasks(); } };
    const deleteTask = id => { tasks = tasks.filter(t => t.id !== id); renderTasks(); };
    const addSubtask = (pId, text) => { const task = tasks.find(t => t.id === pId); if (task) { task.subtasks = task.subtasks || []; task.subtasks.push({id: Date.now(), text, completed: false}); renderTasks(); } };
    const toggleSubtaskComplete = (pId, sId) => { const task = tasks.find(t => t.id === pId); if (task?.subtasks) { const sub = task.subtasks.find(st => st.id === sId); if(sub) { sub.completed = !sub.completed; renderTasks(); }}};

    // NEW function to delete a project and its tasks
    const deleteProject = (projectName) => {
        if (confirm(`Are you sure you want to delete the "${projectName}" project and all of its tasks? This action cannot be undone.`)) {
            // Filter out the deleted project's tasks
            tasks = tasks.filter(task => task.project !== projectName);
            // Filter out the project itself
            projects = projects.filter(p => p !== projectName);

            // Switch to a safe view
            currentProject = 'All Tasks';
            
            // Re-render the entire UI
            render();
        }
    };

    // --- FOCUS TIMER FUNCTIONS (Unchanged) ---
    const openFocusModal = (taskId) => { /* ... */ const task = tasks.find(t => t.id === taskId); if (task) { focusTaskName.textContent = task.text; resetTimer(); focusModal.classList.remove('pointer-events-none'); focusModal.classList.add('opacity-100'); modalContent.classList.add('scale-100'); }};
    const closeFocusModal = () => { /* ... */ focusModal.classList.remove('opacity-100'); modalContent.classList.remove('scale-100'); focusModal.classList.add('pointer-events-none'); clearInterval(timerInterval); alarmSound.pause(); alarmSound.currentTime = 0; };
    const updateTimerDisplay = () => { /* ... */ const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0'); const seconds = String(totalSeconds % 60).padStart(2, '0'); timerDisplay.textContent = `${minutes}:${seconds}`; const progress = (initialSeconds - totalSeconds) / initialSeconds; const dashOffset = ringCircumference * (1 - progress); progressRing.style.strokeDashoffset = dashOffset; };
    const startTimer = () => { /* ... */ if (isPaused) { isPaused = false; startTimerBtn.classList.add('hidden'); pauseTimerBtn.classList.remove('hidden'); timerSetup.classList.add('hidden'); timerInterval = setInterval(() => { totalSeconds--; updateTimerDisplay(); if (totalSeconds <= 0) { clearInterval(timerInterval); alarmSound.play(); }}, 1000); }};
    const pauseTimer = () => { /* ... */ isPaused = true; startTimerBtn.classList.remove('hidden'); pauseTimerBtn.classList.add('hidden'); clearInterval(timerInterval); };
    const resetTimer = () => { /* ... */ clearInterval(timerInterval); alarmSound.pause(); alarmSound.currentTime = 0; isPaused = true; initialSeconds = (parseInt(durationInput.value, 10) || 25) * 60; totalSeconds = initialSeconds; updateTimerDisplay(); startTimerBtn.classList.remove('hidden'); pauseTimerBtn.classList.add('hidden'); timerSetup.classList.remove('hidden'); };

    // --- Event Listeners (Unchanged) ---
    durationInput.addEventListener('change', resetTimer);
    durationInput.addEventListener('keyup', resetTimer);
    closeFocusModalBtn.addEventListener('click', closeFocusModal);
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Initial Render
    render();
});