<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const tasks = ref([]);
const filteredTasks = ref([]);
const filterType = ref("all");
const showSharePopup = ref(false);
const showAddPopup = ref(false);
const selectedTaskId = ref(null);
const emailToShare = ref("");
const newTaskTitle = ref("");
const userList = ref([]);
const selectedUserId = ref("");

const fetchTasks = async () => {
  try {
    const res = await axios.get("http://localhost:3000/tasks");
    tasks.value = res.data;
    applyFilter();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3000/user-list");
    userList.value = res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const applyFilter = () => {
  const userId = localStorage.getItem("user_id");
  if (filterType.value === "all") {
    filteredTasks.value = tasks.value;
  } else if (filterType.value === "my") {
    filteredTasks.value = tasks.value.filter((task) => task.userId == userId);
  } else if (filterType.value === "shared") {
    filteredTasks.value = tasks.value.filter((task) => task.assignedToId==userId);
  }
};

const openSharePopup = (taskId: number) => {
  selectedTaskId.value = taskId;
  showSharePopup.value = true;
};

const shareTask = async () => {
  try {
    await axios.post(`http://localhost:3000/tasks-share`, {
      email: emailToShare.value,
      taskId: selectedTaskId.value,
    });
    alert("Task shared successfully!");
    showSharePopup.value = false;
    emailToShare.value = "";
  } catch (error) {
    console.error("Error sharing task:", error);
  }
};

const openAddPopup = () => {
  showAddPopup.value = true;
  fetchUsers();
};

const addTask = async () => {
  if (!newTaskTitle.value.trim()) {
    alert("Task title cannot be empty!");
    return;
  }
  if (!selectedUserId.value) {
    alert("Please select a user!");
    return;
  }
  try {
    const userId = localStorage.getItem("user_id");
    const response = await axios.post("http://localhost:3000/tasks", {
      title: newTaskTitle.value,
      assignedToId: selectedUserId.value,
      isMine: userId == selectedUserId.value ? true : false,
      userId: userId,
    });
    tasks.value.push(response.data);
    applyFilter();
    showAddPopup.value = false;
    newTaskTitle.value = "";
    selectedUserId.value = "";
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const deleteTask = async (taskId: number) => {
  try {
    await axios.post(`http://localhost:3000/tasks-delete/${taskId}`);
    tasks.value = tasks.value.filter((task) => task.id !== taskId);
    applyFilter();
    alert("Task deleted successfully!");
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};
const logout = async () => {
  localStorage.removeItem("user_id");
  window.location.href = "/login";
}

onMounted(() => {
  fetchTasks();
  fetchUsers();
});
</script>

<template>
  <div class="container">
  <div class="nav-bar">
    <h1>My Tasks</h1>
<Button @click="logout">Logout</Button>
</div>
    <div class="filter-container">
      <select v-model="filterType" @change="applyFilter" class="filter-dropdown">
        <option value="all">All Tasks</option>
        <option value="my">My Tasks</option>
        <option value="shared">Shared Tasks</option>
      </select>

      <button class="add-button" @click="openAddPopup">+ Add Task</button>
    </div>

    <ul class="task-list">
      <li v-for="task in filteredTasks" :key="task.id" class="task-item">
        <span class="task-title">{{ task.title }}</span>
        <div>
        <button class="share-button" @click="openSharePopup(task.id)">Share</button>
        <button class="delete-button" @click="deleteTask(task.id)">Delete</button>
        </div>
      </li>
    </ul>

    <!-- Share Task Popup -->
    <div v-if="showSharePopup" class="popup">
      <h2>Share Task</h2>
      <input type="email" v-model="emailToShare" placeholder="Enter email" class="input-field" />
      <div class="popup-buttons">
        <button class="confirm-button" @click="shareTask">Share</button>
        <button class="cancel-button" @click="showSharePopup = false">Cancel</button>
      </div>
    </div>

    <!-- Add Task Popup -->
    <div v-if="showAddPopup" class="popup">
      <h2>Add New Task</h2>
      <input type="text" v-model="newTaskTitle" placeholder="Task title" class="input-field" />
      <select v-model="selectedUserId" class="input-field">
        <option value="">Select User</option>
        <option v-for="user in userList" :key="user.id" :value="user.id">
          {{ user.email }}
        </option>
      </select>
      <div class="popup-buttons">
        <button class="confirm-button" @click="addTask">Add</button>
        <button class="cancel-button" @click="showAddPopup = false">Cancel</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* General Styles */
.container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

/* Filter & Add Button */
.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-dropdown {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.add-button {
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover {
  background-color: #0056b3;
}

/* Task List */
.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  background: #f9f9f9;
  padding: 10px;
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-size: 16px;
  font-weight: bold;
}

.share-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.share-button:hover {
  background-color: #218838;
}

/* Popups */
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  width: 300px;
  text-align: center;
  border-radius: 8px;
}

.input-field {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
}

.confirm-button {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}
.nav-bar{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

.nav-bar a {
  color: #007bff;
  text-decoration: none;
  margin: 0 10px;
}

.nav-bar a:hover {
  text-decoration: underline;
}
</style>
