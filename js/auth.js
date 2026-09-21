import { state } from "./state.js";
import { elements } from "./dom.js";

import {
  getUsers,
  saveUsers,
  saveSession,
  clearSession
} from "./storage.js";

import {
  cancelReply,
  renderComments,
  setModerationStatus
} from "./comments.js";

import {
  cancelAllModeration
} from "./moderation.js";

export function renderAuthState() {
    const loggedIn = Boolean(state.currentUser);

    elements.guestControls.classList.toggle("hidden", loggedIn);
    elements.userControls.classList.toggle("hidden", !loggedIn);
    elements.loggedInUser.textContent = loggedIn ? `Logged in as ${state.currentUser.username}` : "";

    elements.commentText.disabled = !loggedIn;
    elements.addCommentButton.disabled = !loggedIn;
    elements.guestNotice.classList.toggle("hidden", loggedIn);
    elements.commentTextArea.classList.toggle("hidden", !loggedIn);

    if (!loggedIn) {
      state.editingCommentId = null;
      cancelReply();
    }
}

export function openAuth(mode) {
      elements.authForms.classList.remove("hidden");
      elements.loginFormContainer.classList.toggle("hidden", mode !== "login");
      elements.registerFormContainer.classList.toggle("hidden", mode !== "register");
      elements.loginMessage.textContent = "";
      elements.registerMessage.textContent = "";
}
  
export function closeAuth() {
      elements.authForms.classList.add("hidden");
      elements.loginFormContainer.classList.add("hidden");
      elements.registerFormContainer.classList.add("hidden");
      elements.loginMessage.textContent = "";
      elements.registerMessage.textContent = "";
      elements.loginForm.reset();
      elements.registerForm.reset();
}

export function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(elements.registerForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const passwordConfirm = String(formData.get("passwordConfirm") || "");

    if (username.length < 3) {
      elements.registerMessage.textContent = "Username must contain at least 3 characters.";
      return;
    }

    if (password.length < 4) {
      elements.registerMessage.textContent = "Password must contain at least 4 characters.";
      return;
    }

    if (password !== passwordConfirm) {
      elements.registerMessage.textContent = "Passwords do not match.";
      return;
    }

    const users = getUsers();
    const exists = users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      elements.registerMessage.textContent = "This username is already registered.";
      return;
    }

    users.push({ username, password });
    saveUsers(users);

    state.currentUser = { username };
    saveSession(state.currentUser);

    closeAuth();
    renderAuthState();
    renderComments();
}

export function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(elements.loginForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    const user = getUsers().find(
      (candidate) =>
        candidate.username.toLowerCase() === username.toLowerCase() &&
        candidate.password === password
    );

    if (!user) {
      elements.loginMessage.textContent = "Invalid username or password.";
      return;
    }

    state.currentUser = { username: user.username };
    saveSession(state.currentUser);

    closeAuth();
    renderAuthState();
    renderComments();
}

export function logout() {
    cancelAllModeration();

    clearSession();
    state.currentUser = null;
    state.editingCommentId = null;

    elements.commentForm.reset();
    setModerationStatus("");

    renderAuthState();
    renderComments();
}