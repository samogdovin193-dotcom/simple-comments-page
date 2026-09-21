# 💬 Simple Comments Page

A vanilla JavaScript comments application with user authentication, nested replies, comment moderation, editing, deletion, sorting, and local browser persistence.

The project was originally created as a small frontend coding exercise and was later expanded and refactored into a modular JavaScript application.

---

## 🚀 Features

- 👤 User registration and login
- 💬 Add comments and nested replies
- ✏️ Edit your own comments
- 🗑️ Delete your own comments with confirmation
- 👁️ Expand or collapse replies
- 🔃 Sort root comments by newest or oldest
- 🔢 2000-character limit with live character counter
- 🛡️ Comment moderation using a Web Worker
- 💾 Local browser persistence
- 🧾 Localized timestamp formatting
- 🔒 User-generated content rendered safely using textContent

---

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- ES Modules
- Web Workers
- `localStorage`
- `sessionStorage`

No JavaScript framework or external dependency is required.

---

## 📁 Project Structure

```bash
simple-comments-page/
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── comments.js
│   ├── dom.js
│   ├── moderation.js
│   ├── state.js
│   ├── storage.js
│   └── utils.js
│
├── index.html
├── styles.css
├── worker.js
├── inappropriate-words.json
└── README.md
```

### JavaScript modules

- `app.js` – application initialization and event binding
- `auth.js` – registration, login, logout, and authentication UI
- `comments.js` – comment creation, replies, editing, deletion, rendering, sorting, and counters
- `dom.js` – cached DOM element references
- `moderation.js` – Web Worker lifecycle and moderation communication
- `state.js` – shared application state
- `storage.js` – `localStorage` and `sessionStorage` access
- `utils.js` – reusable helper functions

---

## 💬 Comment System

Each comment contains a unique identifier and an optional `parentId`.

Root comments do not have a parent, while replies store the ID of the comment they belong to.

The application recursively renders the comment tree so replies remain attached to their parent comments regardless of nesting depth.

When a comment is deleted, the application removes the whole subtree when possible. If replies from other users need to remain visible, the deleted comment is replaced with:

Príspevok bol odstránený.

This keeps the discussion structure intact.

---

## 🛡️ Comment Moderation

Every new or edited comment is checked by a Web Worker before it is saved.

The worker loads the moderation dictionary from:

```bash
inappropriate-words.json
```

Moderation is case-insensitive and can detect separated character variants.

For example:

```text
war
WAR
w.a.r
w-a-r
w a r
```

are detected, while unrelated words such as:

```text
warrior
```

are allowed.

Using a Web Worker keeps the moderation logic separated from the main UI thread.

---

## 💾 Local Data Storage

The project does not use a server-side database.

### `localStorage`

Used for:

- Registered users
- Comments

This data remains available after refreshing or reopening the browser.

### `sessionStorage`

Used for:

- Currently logged-in user

The session survives page refreshes but is cleared when the browser session is closed.

> User accounts and passwords are stored locally only for demonstration purposes. A production application should use secure server-side authentication and password hashing.

---

## ⚙️ Setup & Installation

1. Clone the repository

```bash
git clone https://github.com/samogdovin193-dotcom/simple-comments-page.git
cd simple-comments-page
```

2. Start a local HTTP server

For example, using Python:

```bash
python -m http.server 8000
```

3. Open:

```bash
http://localhost:8000
```

You can also use an editor extension such as Live Server.

---

## ⚠️ Why a Local Server Is Required

The application uses:

- ES Modules
- A Web Worker
- A local JSON moderation file

Because of browser security restrictions, the project should not be opened directly using the `file://` protocol.

It should instead be served through HTTP or HTTPS.

---

## 🧩 Architecture

The JavaScript was refactored from a single large application file into separate ES modules.

The goal of the refactor was to keep responsibilities separated.

This makes the project easier to maintain and extend without introducing a frontend framework.

---

## 🎯 Future Improvements

- 🧪 Add automated tests
- 🎨 Replace the native delete confirmation with a custom modal
- 📱 Improve responsive behavior for smaller screens
- 🔐 Replace local authentication with a backend authentication system
- 🗄️ Add server-side persistence
- 👤 Add user profiles or avatars
- 🔎 Add comment search and filtering

---

## 📸 Preview

![Preview screen](.prview.png)

---

## 🌍 Live Demo

[Simple-comments-page](https://simple-comments-page-eight.vercel.app/)

---

## 👨‍💻 Author

Built by Ing. Samuel Gdovin.

A frontend developer focused on building practical projects with JavaScript, React, and modern frontend technologies.

---

## 📄 License

This project is for educational and portfolio purposes.
