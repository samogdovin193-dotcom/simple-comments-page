import {
  getUsers,
  saveUsers,
  saveComments,
  saveSession,
  clearSession
} from "./storage.js";

import { cancelAllModeration } from "./moderation.js";
import { elements } from "./dom.js";
import { state } from "./state.js";

import {
  handleCommentSubmit,
  renderComments,
  pruneDeletedBranches,
  cancelReply,
  setModerationStatus,
  updateCharacterCounter
} from "./comments.js";

(() => {
  "use strict";

  function init() {
    bindEvents();

    if (pruneDeletedBranches()) {
      saveComments(state.comments);
    }

    updateCharacterCounter(
      elements.commentText,
      elements.commentCharacterCount
    );

    renderAuthState();
    renderComments();
  }

  function bindEvents() {
    elements.showLoginButton.addEventListener("click", () => openAuth("login"));
    elements.showRegisterButton.addEventListener("click", () => openAuth("register"));
    elements.cancelLoginButton.addEventListener("click", closeAuth);
    elements.cancelRegisterButton.addEventListener("click", closeAuth);
    elements.logoutButton.addEventListener("click", logout);

    elements.loginForm.addEventListener("submit", handleLogin);
    elements.registerForm.addEventListener("submit", handleRegister);
    elements.commentForm.addEventListener("submit", handleCommentSubmit);
    elements.cancelReplyButton.addEventListener("click", cancelReply);
    elements.commentText.addEventListener("input", () => {
      updateCharacterCounter(
        elements.commentText,
        elements.commentCharacterCount
      );
    });
    elements.commentForm.addEventListener("reset", () => {
      requestAnimationFrame(() => {
        updateCharacterCounter(
          elements.commentText,
          elements.commentCharacterCount
        );
      });
    });
    elements.commentSort.addEventListener("change", () => {
      state.sortOrder = elements.commentSort.value;
      renderComments();
    });
  }

  function renderAuthState() {
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

  function openAuth(mode) {
    elements.authForms.classList.remove("hidden");
    elements.loginFormContainer.classList.toggle("hidden", mode !== "login");
    elements.registerFormContainer.classList.toggle("hidden", mode !== "register");
    elements.loginMessage.textContent = "";
    elements.registerMessage.textContent = "";
  }

  function closeAuth() {
    elements.authForms.classList.add("hidden");
    elements.loginFormContainer.classList.add("hidden");
    elements.registerFormContainer.classList.add("hidden");
    elements.loginMessage.textContent = "";
    elements.registerMessage.textContent = "";
    elements.loginForm.reset();
    elements.registerForm.reset();
  }

  function handleRegister(event) {
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

  function handleLogin(event) {
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

  function logout() {
    cancelAllModeration();

    clearSession();
    state.currentUser = null;
    state.editingCommentId = null;

    elements.commentForm.reset();
    setModerationStatus("");

    renderAuthState();
    renderComments();
  }

  init();
})();