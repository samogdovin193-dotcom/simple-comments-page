import {
  loadComments,
  loadSession
} from "./storage.js";

export const state = {
  comments: loadComments(),
  currentUser: loadSession(),
  editingCommentId: null,
  sortOrder: "newest"
};