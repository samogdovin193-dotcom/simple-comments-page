The moderation logic is case-insensitive and also detects separated variants such as w.a.r or w-a-r,
while avoiding false positives in unrelated words such as warrior.

User accounts and passwords are stored locally only because this is explicitly required for the purposes of the assignment. In a production application, authentication and password storage would be handled securely on the server side.

The page uses 18px as the base font size. Headings and comment metadata use relative font sizes to preserve visual hierarchy and readability.

How to run

Because the application uses a Web Worker and loads a local JSON file, it should be served through a local HTTP server instead of opening index.html directly using the file:// protocol.
