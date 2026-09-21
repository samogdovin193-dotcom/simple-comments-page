import { saveComments } from "./storage.js";
import { elements } from "./dom.js";
import { state } from "./state.js";

import {
  handleCommentSubmit,
  renderComments,
  pruneDeletedBranches,
  cancelReply,
  updateCharacterCounter
} from "./comments.js";

import {
  renderAuthState,
  openAuth,
  closeAuth,
  handleRegister,
  handleLogin,
  logout
} from "./auth.js";

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

init();