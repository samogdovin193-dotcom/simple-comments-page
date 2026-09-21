(() => {
  "use strict";

  const STORAGE_KEYS = {
    users: "simpleComments.users",
    session: "simpleComments.session",
    comments: "simpleComments.comments"
  };

  const DELETED_COMMENT_TEXT = "Príspevok bol odstránený.";

  const state = {
    comments: loadComments(),
    currentUser: loadSession(),
    moderationWorkers: new Set(),
    editingCommentId: null,
    sortOrder: "newest"
  };

  const elements = {
    guestControls: document.getElementById("guestControls"),
    userControls: document.getElementById("userControls"),
    loggedInUser: document.getElementById("loggedInUser"),
    logoutButton: document.getElementById("logoutButton"),
    showLoginButton: document.getElementById("showLoginButton"),
    showRegisterButton: document.getElementById("showRegisterButton"),
    authForms: document.getElementById("authForms"),
    loginFormContainer: document.getElementById("loginFormContainer"),
    registerFormContainer: document.getElementById("registerFormContainer"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    cancelLoginButton: document.getElementById("cancelLoginButton"),
    cancelRegisterButton: document.getElementById("cancelRegisterButton"),
    loginMessage: document.getElementById("loginMessage"),
    registerMessage: document.getElementById("registerMessage"),
    commentForm: document.getElementById("commentForm"),
    commentText: document.getElementById("commentText"),
    addCommentButton: document.getElementById("addCommentButton"),
    replyToId: document.getElementById("replyToId"),
    replyIndicator: document.getElementById("replyIndicator"),
    replyToAuthor: document.getElementById("replyToAuthor"),
    cancelReplyButton: document.getElementById("cancelReplyButton"),
    guestNotice: document.getElementById("guestNotice"),
    moderationStatus: document.getElementById("moderationStatus"),
    commentsContainer: document.getElementById("commentsContainer"),
    commentCount: document.getElementById("commentCount"),
    commentTextArea: document.getElementById("commentTextArea"),
    commentCharacterCount: document.getElementById("commentCharacterCount"),
    commentSort: document.getElementById("commentSort"),
  };

  function init() {
    bindEvents();

    if (pruneDeletedBranches()) {
      saveComments();
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

  function loadComments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.comments);
      const comments = raw ? JSON.parse(raw) : [];
      return Array.isArray(comments) ? comments : [];
    } catch {
      return [];
    }
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.session);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      const users = raw ? JSON.parse(raw) : [];
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function saveComments() {
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(state.comments));
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
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state.currentUser));

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
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state.currentUser));

    closeAuth();
    renderAuthState();
    renderComments();
  }

  function logout() {
    state.moderationWorkers.forEach((worker) => worker.terminate());
    state.moderationWorkers.clear();

    sessionStorage.removeItem(STORAGE_KEYS.session);
    state.currentUser = null;
    state.editingCommentId = null;

    elements.commentForm.reset();
    setModerationStatus("");

    renderAuthState();
    renderComments();
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!state.currentUser) {
      setModerationStatus("You must be logged in to add comments.", true);
      return;
    }

    const text = elements.commentText.value.trim();

    if (!text) {
      setModerationStatus("Please enter a comment.", true);
      return;
    }

    setModerationStatus("Checking comment…");
    elements.addCommentButton.disabled = true;

    const result = await moderateText(text);

    if (!state.currentUser) {
      return;
    }

    if (result.allowed) {
      addComment(text, elements.replyToId.value || null);
      setModerationStatus("Comment added.");
      elements.commentForm.reset();
      cancelReply();
    } else {
      setModerationStatus(
        result.error || `You cannot use the wording "${result.matchedWord}" in a comment.`,
        true
      );
    }

    elements.addCommentButton.disabled = false;
  }

  function moderateText(text) {
    return new Promise((resolve) => {
      const worker = new Worker("./worker.js");
      state.moderationWorkers.add(worker);
      let finished = false;

      const finish = (result) => {
        if (finished) {
          return;
        }

        finished = true;
        worker.terminate();
        state.moderationWorkers.delete(worker);
        resolve(result);
      };

      worker.addEventListener("message", (event) => {
        finish(event.data || { allowed: false, error: "Moderation could not be completed. Please try again." });
      }, { once: true });

      worker.addEventListener("error", () => {
        finish({
          allowed: false,
          error: "Moderation could not be completed. Please try again."
        });
      }, { once: true });

      worker.postMessage({
        type: "check-comment",
        text
      });
    });
  }

  function addComment(text, parentId) {
    const comment = {
      id: createId(),
      parentId,
      author: state.currentUser.username,
      text,
      timestamp: new Date().toISOString(),
      deleted: false
    };

    state.comments.push(comment);
    saveComments();
    renderComments();
  }

  const expandedRootCommentIds = new Set();
  let rootRepliesInitialized = false;

  function renderComments() {
    elements.commentsContainer.replaceChildren();

    const commentIds = new Set(state.comments.map((comment) => comment.id));

    const roots = state.comments
      .filter(
        (comment) => !comment.parentId || !commentIds.has(comment.parentId)
      )
      .sort((a, b) => {
        if (state.sortOrder === "oldest") {
          return new Date(a.timestamp) - new Date(b.timestamp);
        }

        return new Date(b.timestamp) - new Date(a.timestamp);
      });

    const activeCommentCount = state.comments.filter(
      (comment) => !comment.deleted
    ).length;

    if (state.comments.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No comments yet.";

      elements.commentsContainer.appendChild(empty);
      elements.commentCount.textContent = "0 comments";

      rootRepliesInitialized = false;
      expandedRootCommentIds.clear();

      return;
    }
  
    if (!rootRepliesInitialized && roots.length > 0) {
      expandedRootCommentIds.clear();
      expandedRootCommentIds.add(roots[0].id);
      rootRepliesInitialized = true;
    }

    roots.forEach((comment) => {
      elements.commentsContainer.appendChild(
        renderCommentTree(comment, true)
      );
    });

    elements.commentCount.textContent =
      `${activeCommentCount} ${
        activeCommentCount === 1 ? "comment" : "comments"
      }`;
  }


  function renderCommentTree(comment, isRoot = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "comment-tree";

    const article = document.createElement("article");
    article.className = "comment";

    if (comment.deleted) {
      article.classList.add("deleted-comment");
    }

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const author = document.createElement("span");
    author.className = "comment-author";
    author.textContent = comment.author;

    const timestamp = document.createElement("time");
    timestamp.dateTime = comment.timestamp;
    timestamp.textContent = formatTimestamp(comment.timestamp);

    meta.append(author, timestamp);
    article.appendChild(meta);

    const isEditing =
      state.editingCommentId === comment.id &&
      canCurrentUserModify(comment) &&
      !comment.deleted;

    if (isEditing) {
      article.appendChild(renderEditForm(comment));
    } else {
      const text = document.createElement("div");
      text.className = "comment-text";
      text.textContent = comment.deleted
        ? DELETED_COMMENT_TEXT
        : comment.text;

      article.appendChild(text);
    }

    const replies = state.comments.filter(
      (child) => child.parentId === comment.id
    );

    if (
      !isEditing &&
      (state.currentUser || (isRoot && replies.length > 0))
    ) {
      const actions = document.createElement("div");
      actions.className = "comment-actions";

      if (state.currentUser) {
        const replyButton = document.createElement("button");
        replyButton.type = "button";
        replyButton.className = "reply-button";
        replyButton.textContent = "Reply";
        replyButton.addEventListener("click", () => startReply(comment));

        actions.appendChild(replyButton);

        if (canCurrentUserModify(comment) && !comment.deleted) {
          const editButton = document.createElement("button");
          editButton.type = "button";
          editButton.className = "comment-action-button";
          editButton.textContent = "Edit";
          editButton.addEventListener("click", () => startEdit(comment));

          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className =
            "comment-action-button delete-comment-button";
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () =>
            deleteComment(comment.id)
          );

          actions.append(editButton, deleteButton);
        }
      }

      if (isRoot && replies.length > 0) {
        const repliesVisible =
          expandedRootCommentIds.has(comment.id);

        const toggleRepliesButton = document.createElement("button");
        toggleRepliesButton.type = "button";
        toggleRepliesButton.className =
          "comment-action-button toggle-replies-button";

        toggleRepliesButton.textContent = repliesVisible
          ? "Hide replies"
          : "Show replies";

        toggleRepliesButton.addEventListener("click", () => {
          if (expandedRootCommentIds.has(comment.id)) {
            expandedRootCommentIds.delete(comment.id);
          } else {
            expandedRootCommentIds.add(comment.id);
          }

          renderComments();
        });

        actions.appendChild(toggleRepliesButton);
      }

      article.appendChild(actions);
    }

    wrapper.appendChild(article);

    if (replies.length > 0) {
      if (isRoot) {
        const repliesContainer = document.createElement("div");
        repliesContainer.className = "comment-replies";

        const repliesVisible =
          expandedRootCommentIds.has(comment.id);

        repliesContainer.hidden = !repliesVisible;

        replies.forEach((reply) => {
          repliesContainer.appendChild(
            renderCommentTree(reply, false)
          );
        });

        wrapper.appendChild(repliesContainer);
      } else {
        replies.forEach((reply) => {
          wrapper.appendChild(
            renderCommentTree(reply, false)
          );
        });
      }
    }

    return wrapper;
  }

  function renderEditForm(comment) {
    const form = document.createElement("form");
    form.className = "comment-edit-form";

    const textarea = document.createElement("textarea");
    textarea.className = "comment-edit-text";
    textarea.rows = 4;
    textarea.maxLength = 2000;
    textarea.value = comment.text;
    textarea.setAttribute("aria-label", "Edit comment");

    const characterCount = document.createElement("span");
    characterCount.className = "character-count";

    updateCharacterCounter(textarea, characterCount);

    textarea.addEventListener("input", () => {
      updateCharacterCounter(textarea, characterCount);
    });

    const status = document.createElement("span");
    status.className = "edit-status status-text";
    status.setAttribute("aria-live", "polite");

    const actions = document.createElement("div");
    actions.className = "comment-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "comment-action-button";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "comment-action-button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", cancelEdit);

    actions.append(saveButton, cancelButton);
    form.append(textarea, characterCount, status, actions);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!canCurrentUserModify(comment) || comment.deleted) {
        state.editingCommentId = null;
        renderComments();
        return;
      }

      const newText = textarea.value.trim();

      if (!newText) {
        status.textContent = "Please enter a comment.";
        status.classList.add("moderation-error");
        return;
      }

      status.textContent = "Checking comment…";
      status.classList.remove("moderation-error");
      textarea.disabled = true;
      saveButton.disabled = true;
      cancelButton.disabled = true;

      const result = await moderateText(newText);

      if (!state.currentUser || state.editingCommentId !== comment.id) {
        return;
      }

      if (!result.allowed) {
        status.textContent = result.error || `You cannot use the wording "${result.matchedWord}" in a comment.`;
        status.classList.add("moderation-error");
        textarea.disabled = false;
        saveButton.disabled = false;
        cancelButton.disabled = false;
        return;
      }

      updateComment(comment.id, newText);
    });

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });

    return form;
  }

  function canCurrentUserModify(comment) {
    return Boolean(
      state.currentUser &&
      comment &&
      comment.author === state.currentUser.username
    );
  }

  function startEdit(comment) {
    if (!canCurrentUserModify(comment) || comment.deleted) {
      return;
    }

    cancelReply();
    state.editingCommentId = comment.id;
    renderComments();
  }

  function cancelEdit() {
    state.editingCommentId = null;
    renderComments();
  }

  function updateComment(commentId, newText) {
    const comment = state.comments.find((candidate) => candidate.id === commentId);

    if (!canCurrentUserModify(comment) || comment.deleted) {
      return;
    }

    comment.text = newText;
    comment.timestamp = new Date().toISOString();
    state.editingCommentId = null;

    saveComments();
    renderComments();
  }

  function deleteComment(commentId) {
    const comment = state.comments.find((candidate) => candidate.id === commentId);

    if (!canCurrentUserModify(comment) || comment.deleted) {
      return;
    }

    const confirmed = window.confirm("Do you really want to delete this comment?");
    if (!confirmed) {
      return;
    }

    const username = state.currentUser.username;
    const subtreeIds = getSubtreeIds(commentId);
    const canRemoveWholeSubtree = state.comments
      .filter((candidate) => subtreeIds.has(candidate.id))
      .every((candidate) => candidate.deleted || candidate.author === username);

    state.editingCommentId = null;

    if (canRemoveWholeSubtree) {
      state.comments = state.comments.filter((candidate) => !subtreeIds.has(candidate.id));
    } else {
      comment.deleted = true;
      comment.text = DELETED_COMMENT_TEXT;
    }

    pruneDeletedBranches();
    saveComments();
    renderComments();
  }

  function getSubtreeIds(commentId) {
    const childrenByParent = new Map();

    state.comments.forEach((comment) => {
      if (!childrenByParent.has(comment.parentId)) {
        childrenByParent.set(comment.parentId, []);
      }
      childrenByParent.get(comment.parentId).push(comment.id);
    });

    const subtreeIds = new Set();
    const stack = [commentId];

    while (stack.length > 0) {
      const currentId = stack.pop();

      if (subtreeIds.has(currentId)) {
        continue;
      }

      subtreeIds.add(currentId);
      const children = childrenByParent.get(currentId) || [];
      children.forEach((childId) => stack.push(childId));
    }

    return subtreeIds;
  }

  function pruneDeletedBranches() {
    if (state.comments.length === 0) {
      return false;
    }

    const commentsById = new Map(state.comments.map((comment) => [comment.id, comment]));
    const childrenByParent = new Map();

    state.comments.forEach((comment) => {
      if (!childrenByParent.has(comment.parentId)) {
        childrenByParent.set(comment.parentId, []);
      }
      childrenByParent.get(comment.parentId).push(comment.id);
    });

    const activeMemo = new Map();

    function subtreeContainsActiveComment(commentId, visiting = new Set()) {
      if (activeMemo.has(commentId)) {
        return activeMemo.get(commentId);
      }

      if (visiting.has(commentId)) {
        return true;
      }

      const comment = commentsById.get(commentId);

      if (!comment) {
        return false;
      }

      if (!comment.deleted) {
        activeMemo.set(commentId, true);
        return true;
      }

      const nextVisiting = new Set(visiting);
      nextVisiting.add(commentId);

      const hasActiveChild = (childrenByParent.get(commentId) || []).some((childId) =>
        subtreeContainsActiveComment(childId, nextVisiting)
      );

      activeMemo.set(commentId, hasActiveChild);
      return hasActiveChild;
    }

    const removableIds = new Set();

    state.comments.forEach((comment) => {
      if (!comment.deleted || subtreeContainsActiveComment(comment.id)) {
        return;
      }

      getSubtreeIds(comment.id).forEach((id) => removableIds.add(id));
    });

    if (removableIds.size === 0) {
      return false;
    }

    state.comments = state.comments.filter((comment) => !removableIds.has(comment.id));
    return true;
  }

  function startReply(comment) {
    if (!state.currentUser) {
      return;
    }

    state.editingCommentId = null;
    elements.replyToId.value = comment.id;
    elements.replyToAuthor.textContent = comment.author;
    elements.replyIndicator.classList.remove("hidden");
    elements.commentText.focus();
  }

  function cancelReply() {
    elements.replyToId.value = "";
    elements.replyIndicator.classList.add("hidden");
    elements.replyToAuthor.textContent = "";
  }

  function setModerationStatus(message, isError = false) {
    elements.moderationStatus.textContent = message;
    elements.moderationStatus.classList.toggle("moderation-error", isError);
  }

  function updateCharacterCounter(textarea, counter) {
    const maxLength = textarea.maxLength;

    counter.textContent =
      `${textarea.value.length} / ${maxLength}`;
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function createId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  init();
})();
