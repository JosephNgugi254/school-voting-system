# School Voting System

A simple school voting system built using HTML, CSS, and JavaScript. This project allows students to cast their votes for various candidates in a user friendly UI. It also integrates a local API (`db.json`) to manage and store voting data.

## Features
- User-friendly voting interface.
- Real-time vote counting.
- Local API integration using `db.json` for data storage.
- Responsive design for better usability.

## Technologies Used
- **HTML**: Structure of the application.
- **CSS**: Styling and layout.
- **JavaScript**: Logic and interactivity.
- **JSON Server**: Local API for managing data.

## Setup Instructions
1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```bash
    cd school-voting-system
    ```
3. Install JSON Server globally if not already installed:
    ```bash
    npm install -g json-server
    ```
4. Start the JSON Server:
    ```bash
    json-server --watch db.json
    ```
5. Open `index.html` in your browser to access the application.

## How It Works
1. The voting system fetches data from `db.json` using the JSON Server and displays the candidate names in the respective positions they are vying for.
2. Users can select their preferred candidate and cast their votes.
3. Votes are updated in real time and stored in the local API.
4. Finally, the updated vote count is visualized using charts for the respective positions.

## License
This is my personal project and is open-source. You are free to use, modify, and distribute it under the terms of the [MIT License](LICENSE).


