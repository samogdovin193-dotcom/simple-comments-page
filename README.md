# 💬 Simple Comments Page

A vanilla JavaScript comments application with user authentication, nested replies, comment moderation, editing, deletion, sorting, and local browser persistence.

The project was originally created as a small frontend coding exercise and was later expanded and refactored into a modular JavaScript application suitable for portfolio use.

---

## 🚀 Features

- 👤 User registration and login
- 🔐 Session-based authentication using `sessionStorage`
- 💾 Persistent comments and user data using `localStorage`
- 💬 Add comments as a logged-in user
- 🌳 Nested reply structure
- ↩️ Reply to any comment
- ✏️ Edit your own comments
- 🗑️ Delete your own comments
- ⚠️ Confirmation before deleting a comment
- 🧹 Deleted-comment handling that preserves reply structure when necessary
- 👁️ Show or hide replies for root comments
- 🔃 Sort root comments by:
  - Newest first
  - Oldest first

- 🔢 Character counter with a 2000-character limit
- 🛡️ Comment moderation using a Web Worker
- 🚫 Case-insensitive inappropriate-word detection
- 🔎 Detection of separated variants such as `w.a.r`, `w-a-r`, or `w a r`
- ✅ Avoids false positives in unrelated words such as `warrior`
- 🧾 Localized timestamp formatting
- 🔒 User-generated comment content is rendered using `textContent` to avoid HTML injection

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
- `moderation.js` – Web Worker creation and moderation communication
- `state.js` – shared application state
- `storage.js` – `localStorage` and `sessionStorage` access
- `utils.js` – reusable helper functions

---

## 💬 Comment System

Each comment contains a unique identifier and an optional `parentId`.

Root comments do not have a parent, while replies store the ID of the comment they belong to.

The application recursively renders the comment tree so replies remain attached to their parent comments regardless of nesting depth.

Users can:

- Add root comments
- Reply to existing comments
- Edit their own comments
- Delete their own comments
- Expand or collapse replies
- Sort root comments by date

---

## 🗑️ Comment Deletion

Before deleting a comment, the application asks the user for confirmation.

Deletion behavior also takes the reply tree into account.

If the entire subtree can safely be removed, it is deleted completely.

If removing the comment would affect replies that need to remain visible, the original comment is replaced with:

```text
Príspevok bol odstránený.
```

This preserves the structure of the discussion.

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

## 🎨 Styling

The interface uses:

- `#F5F5F5` page background
- `18px` base font size
- `"Lucida Handwriting"` font family with fallbacks
- Custom Reply and Add Comment button styles
- Visual indentation for nested replies
- Responsive text wrapping for long comments

Headings and metadata use relative font sizes to maintain visual hierarchy and readability.

---

## 🧩 Architecture

The JavaScript was refactored from a single large application file into separate ES modules.

The goal of the refactor was to keep responsibilities separated:

```text
app.js
        ↓
Initialization and event wiring

auth.js
        ↓
Authentication

comments.js
        ↓
Comment functionality

storage.js
        ↓
Browser persistence

moderation.js
        ↓
Web Worker moderation

state.js
        ↓
Shared application state

dom.js
        ↓
DOM references

utils.js
        ↓
Reusable helpers
```

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

## 🌍 Live Demo

Deployment coming soon.

---

## 👨‍💻 Author

Built by Ing. Samuel Gdovin.

A frontend developer focused on building practical projects with JavaScript, React, and modern frontend technologies.

---

## 📄 License

This project is for educational and portfolio purposes.
