const STORAGE_KEY = "studentStudyPlannerTasks";
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterSelect = document.getElementById("filter");

let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

const today = new Date();
document.getElementById("today").textContent = today.toLocaleDateString(undefined, {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
});
document.getElementById("taskDate").value = today.toISOString().slice(0, 10);

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderTasks() {
  const filter = filterSelect.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === "pending") return !task.completed;
    if (filter === "done") return task.completed;
    return true;
  });

  taskList.innerHTML = "";
  emptyState.style.display = visibleTasks.length ? "none" : "block";

  visibleTasks.forEach(task => {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    const priorityClass = task.priority === "Low" ? "low" : "";
    item.innerHTML = `
      <input class="check" type="checkbox" aria-label="Mark task complete" ${task.completed ? "checked" : ""}>
      <div>
        <p class="task-title">${safeText(task.title)}</p>
        <div class="task-meta">
          <span class="tag">${safeText(task.subject)}</span>
          <span>${safeText(task.date)}</span>
          <span>${Number(task.duration)} min</span>
          <span class="priority ${priorityClass}">${safeText(task.priority)} priority</span>
        </div>
      </div>
      <button class="delete-btn" type="button" aria-label="Delete task" title="Delete task">×</button>
    `;
    item.querySelector(".check").addEventListener("change", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });
    item.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });
    taskList.appendChild(item);
  });

  const total = tasks.length;
  const done = tasks.filter(task => task.completed).length;
  const pending = total - done;
  const rate = total ? Math.round(done / total * 100) : 0;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("doneCount").textContent = done;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completionRate").textContent = `${rate}%`;
  document.getElementById("progressLabel").textContent = `${rate}% complete`;
  document.getElementById("progressBar").style.width = `${rate}%`;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const date = document.getElementById("taskDate").value;
  const duration = Number(document.getElementById("duration").value);
  const priority = document.getElementById("priority").value;

  if (!title || !subject || !date || !Number.isFinite(duration) || duration < 5) return;

  tasks.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    title, subject, date, duration, priority, completed: false
  });
  saveTasks();
  taskForm.reset();
  document.getElementById("taskDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("duration").value = 30;
  renderTasks();
});

filterSelect.addEventListener("change", renderTasks);
renderTasks();
