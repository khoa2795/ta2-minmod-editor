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

Log in with your credentials to access the MinMod Editor dashboard.

### Searching for Records
Use the Search by Commodity feature to find records related to a specific commodity.

The search results will display the related mineral sites, showing their attributes like grade, tonnage, location, and deposit type.

### Editing Records
In the search results, click the Edit icon next to the field you want to modify.

Update fields like grade, tonnage, location, or deposit type as needed.

Save your changes to ensure the data is updated.


## Grouping and Ungrouping Sites

### Grouping Sites:
Select multiple sites that are similar.

Click the Group button to combine them into a single group.

### Ungrouping Sites:
Select a group of sites.

Click the Ungroup button to separate them into individual sites.

### Adding a New Mineral Site
Click on the Add New Site button in the dashboard.

Fill in the required details such as: Name, Location (latitude and longitude), Deposit Type and Confidence, Grade and Tonnage, Commodity, Source and Reference Document

Save the new site to add it to the database.

### Additional Features

Use the Filter Options to narrow down search results by location, grade, or other attributes.

View and analyze grouped records for better insights into data trends.

By following these instructions, users can effectively manage and update mineral site data using the MinMod Editor.


