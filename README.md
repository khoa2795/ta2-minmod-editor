# MinMod Editor

This project is structured with a **backend** built using FastAPI and a **frontend** managed with Node and npm. Follow the steps below to set up the project locally.

## Prerequisites

Ensure you have the following installed on your system:

- **Python** (version 3.8 or later)
- **Poetry** (for Python dependency management)
- **Node.js** and **npm** (for managing frontend dependencies)

## Getting Started

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-username/minmod_editor.git
cd minmod_editor

2. Backend Setup
Navigate to the Backend Directory
Move into the minmod_editor folder where the backend code is located:
cd minmod_editor

Install Dependencies
We use Poetry to manage Python dependencies. If you haven't installed Poetry yet, follow these instructions.
Once Poetry is installed, run the following command to install dependencies:
poetry install

Activate the Virtual Environment
Start a new shell session with Poetry:
poetry shell

Start the Backend Server
Run the FastAPI backend server:
python app.py

3. Frontend Setup
Navigate to the Frontend Directory
In another terminal window, move to the frontend folder:
cd minmod_editor/www

Install Frontend Dependencies
Install the necessary Node.js packages with npm:
npm install

Start the Frontend Server
Start the frontend server:
npm start


Usage
After starting both the backend and frontend servers, you should be able to interact with the application in your web browser at http://localhost:3000.
