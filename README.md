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

backend will start on **http://localhost:8000**


### 3. Frontend Setup
Navigate to the Frontend Directory

In another terminal window, move to the frontend folder:

To switch to the `minmod_editor/www` directory, use the following command:
```
cd minmod_editor/www
```
Install Frontend Dependencies

Install the necessary Node.js packages with npm:

Add **http://localhost:8000.** to the proxy of package.json
```
npm install
```
Start the frontend server:
```
npm start
```


### Usage
After starting both the backend and frontend servers, you should be able to interact with the application in your web browser at **http://localhost:3000.**

Log in with your credentials to access the MinMod Editor dashboard.

<img width="600" alt="Screenshot 2025-01-06 at 9 25 42 AM" src="https://github.com/user-attachments/assets/3d599d29-7233-4d7a-8f1f-8d4a4acc344c" />

### Searching for Records
Use the Search by Commodity feature to find records related to a specific commodity.

<img width="600" alt="Screenshot 2025-01-06 at 9 16 57 AM" src="https://github.com/user-attachments/assets/deb31e26-24d2-43c5-8496-2cdb4e31e54b" />

The search results will display the related mineral sites, showing their attributes like grade, tonnage, location, and deposit type.

<img width="600" alt="Screenshot 2025-01-06 at 9 21 12 AM" src="https://github.com/user-attachments/assets/9a6f6ed8-9e16-45df-b661-6a8c713124b4" />

### Editing Records
In the search results, click the Edit icon next to the field you want to modify.


<img width="600" alt="Screenshot 2025-01-06 at 9 21 51 AM" src="https://github.com/user-attachments/assets/4b8e2c41-a7b9-49f6-bf69-6718e6f0627b" />



Update fields like grade, tonnage, location, or deposit type as needed.

<img width="600" alt="Screenshot 2025-01-06 at 9 41 42 AM" src="https://github.com/user-attachments/assets/a465d14e-a2b5-4066-a63a-765cbe7dd04b" />

changing the name 

<img width="600" alt="Screenshot 2025-01-06 at 9 42 20 AM" src="https://github.com/user-attachments/assets/fd06d18c-d0de-467a-b43a-3facb18a542f" />


Save your changes to ensure the data is updated.

<img width="600" alt="Screenshot 2025-01-06 at 9 42 43 AM" src="https://github.com/user-attachments/assets/621e8215-8e11-4f3a-a472-7ddd79f5fc74" />



## Grouping and Ungrouping Sites

### Grouping Sites:
Select multiple sites that are similar.

<img width="600" alt="Screenshot 2025-01-06 at 9 36 07 AM" src="https://github.com/user-attachments/assets/a3572b8d-f0cd-4b0c-8ada-5f69546ddb4f" />


Click the Group button to combine them into a single group.

<img width="600" alt="Screenshot 2025-01-06 at 9 36 55 AM" src="https://github.com/user-attachments/assets/903a87a5-6bc4-4baf-9066-5204107322e1" />

### Ungrouping Sites:
Select a group of sites.

<img width="600" alt="Screenshot 2025-01-06 at 9 37 26 AM" src="https://github.com/user-attachments/assets/17f4af3f-cbae-4111-9e28-2ae4fec904fa" />

Click the Ungroup button to separate them into individual sites.

<img width="600" alt="Screenshot 2025-01-06 at 9 38 02 AM" src="https://github.com/user-attachments/assets/755f55df-3f8d-4b73-bcf1-c047691f67ae" />


### Adding a New Mineral Site
Click on the Add New Site button in the dashboard.

<img width="600" alt="Screenshot 2025-01-06 at 9 32 25 AM" src="https://github.com/user-attachments/assets/216568e1-166f-44e6-a107-2882c37cb7e5" />

Fill in the required details such as: Name, Location (latitude and longitude), Deposit Type and Confidence, Grade and Tonnage, Commodity, Source and Reference Document

<img width="600" alt="Screenshot 2025-01-06 at 9 33 54 AM" src="https://github.com/user-attachments/assets/659fb700-569e-46c0-bbdd-23a1915762cb" />

Save the new site to add it to the database.

<img width="600" alt="Screenshot 2025-01-06 at 9 34 38 AM" src="https://github.com/user-attachments/assets/9c71fa80-8c8a-4716-87cd-0e23881e8594" />


### Additional Features

Use the Filter Options to narrow down search results by location, grade, or other attributes.

View and analyze grouped records for better insights into data trends.

By following these instructions, users can effectively manage and update mineral site data using the MinMod Editor.


