const STORAGE_KEYS = {
  users: "simpleComments.users",
  session: "simpleComments.session",
  comments: "simpleComments.comments"
};

export function loadComments() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.comments);
        const comments = raw ? JSON.parse(raw) : [];
        return Array.isArray(comments) ? comments : [];
    } catch {
        return [];
    }
}

export function loadSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.session);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.users);
        const users = raw ? JSON.parse(raw) : [];
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

export function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function saveComments(comments) {
    localStorage.setItem(
        STORAGE_KEYS.comments,
        JSON.stringify(comments)
    );
}

export function saveSession(user) {
  sessionStorage.setItem(
    STORAGE_KEYS.session,
    JSON.stringify(user)
  );
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEYS.session);
}