# Installation & Setup

## Prerequisites

- **Node.js** 
  You can download it on [nodejs.org](https://nodejs.org/en).
  Try to run the command `npm` in the terminal.
  If it says `command not found`, make sure npm is added to the path-
  [click here](https://phoenixnap.com/kb/npm-command-not-found) and follow the
  tutorial.

- **`.env.local` file**  
  This file holds sensitive API keys. Do not upload it anywhere!
  Copy it from someone else on the team.

## Setup

1. Clone the GitHub repo with `git clone "https://github.com/TekClinic/TekClinic-Web-App"`

2. Run `npm install` and wait until the installation is over

3. Copy `.env.local` file in the root directory (where the `package.json`
   file is).

4. Open the setup repo and start all the services.

5. Run `npm run dev` to start the website locally, it should run at
   `http://localhost:3000/`.
   This command starts the website in development mode, allowing you to see
   changes you make to the code in real-time (How cool is that?).

