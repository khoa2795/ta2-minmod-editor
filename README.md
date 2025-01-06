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

git clone https://github.com/DARPA-CRITICALMAAS/ta2-minmod-editor.git

--**cd minmod_editor**

### 2. Backend Setup
Navigate to the Backend Directory

git clone https://github.com/DARPA-CRITICALMAAS/ta2-minmod-kg.git

Follow the README.md to set it up

backend will start on --**http://localhost:8000.--**


### 3. Frontend Setup
Navigate to the Frontend Directory

In another terminal window, move to the frontend folder:

--**cd minmod_editor/www**

Install Frontend Dependencies

Install the necessary Node.js packages with npm:

Add --**http://localhost:8000.--** to the proxy of package.json

--**npm install**

Start the frontend server:
--**npm start**


### Usage
After starting both the backend and frontend servers, you should be able to interact with the application in your web browser at --**http://localhost:3000.--**
