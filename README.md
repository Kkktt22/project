# 🎬 Lingua

**Lingua** is an interactive educational web application for learning English phrasal verbs through context, film- and series-inspired situations and active practice.

## What makes the product educational?

The learning flow is:

**Context → Meaning → Recall → Practice → Review**

Instead of only memorizing translations, learners meet a phrasal verb in a meaningful situation, practise recognition and recall, and return to expressions they found difficult.

## Features

- 🎬 Cinema Context
- 📚 37+ phrasal verbs
- 🧭 CEFR-style levels from A1/A2 to B1/B2
- 🎯 Multiple-choice practice
- ✍️ Fill-in-the-gap practice
- 🧠 Meaning and context challenges
- 🔁 Review mode for missed expressions
- 🎲 Mixed practice
- 📅 Daily challenge
- 🏆 Achievements
- 📈 Progress dashboard
- 🔎 Search and level filters
- 💾 Local progress with `localStorage`
- 📱 Responsive interface
- 🌐 Static hosting compatible with GitHub Pages

## Run locally

Because the project uses JavaScript ES modules, open it through a local server.

### VS Code

1. Install VS Code.
2. Open the `Lingua` folder.
3. Install the **Live Server** extension.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

## Publish on GitHub Pages

1. Create a repository on GitHub, for example `lingua`.
2. Upload all project files, keeping the `data` folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`.
6. Click **Save**.
7. GitHub will generate the website address.

## Project structure

```text
Lingua/
├── index.html
├── style.css
├── script.js
├── README.md
└── data/
    ├── verbs.js
    └── questions.js
```

## Educational / research extension

The interface is also suitable as the practical component of a school research project. A future research mode can add:

- pre-test;
- learning phase;
- post-test;
- delayed test;
- anonymised participant IDs;
- exportable aggregate results;
- comparison of learning conditions.

The application itself does not claim that contextual learning is automatically more effective; it provides a structure in which that hypothesis can be tested.

## Copyright note

Film and series titles are used as contextual references. The learning sentences are original educational examples and are not presented as quotations from the source works.

## License

For a school/research prototype, you can use a simple MIT License if you want the source code to be openly reusable.
