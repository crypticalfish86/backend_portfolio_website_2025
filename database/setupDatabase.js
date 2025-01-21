/*
    This File is the setup of the database (it currently only sets up the Project table but more will be added)
    Refer to the "Project_Database_ER_Diagram.png" for information on what the database should look like
*/

const fs = require('fs');
const mysql = require('mysql');

//SQL Tables creation
const projectCreateTableSQL =
`
    CREATE TABLE Project(
        ProjectID INT, 
        Title VARCHAR(100) NOT NULL,
        Finished DATE,
        Complexity INT NOT NULL,
        PRIMARY KEY (ProjectID)
    )
`;
const projectInsertProjectSQL =
`
    INSERT INTO Project (ProjectID, Title, Finished, Complexity)
    VALUES (?, ?, ?, ?)
`;


//create the connection to my XAMPP database (ensure its running)
const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'portfolio'
    }
);

connection.connect(); //attempt to connect to the database

//This promise chain drops all tables, recreates them and then adds all data into the database stored in the JSON file
fs.promises.readFile('database/data.JSON', 'utf-8')
.then( JSONdata => {
    //check if data.JSON was found
    console.log("JSON file read successfully!");

    return JSONdata;
}) 
.then( JSONdata => {
    //drop the project table if it existed
    connection.query('DROP TABLE IF EXISTS Project', (error, data) =>
    {
        if (error) throw error;
        console.log("Table successfully dropped if it existed!");
    })

    return JSONdata
})
.then( JSONdata => {
    //create the project table
    connection.query(projectCreateTableSQL, (error, data) =>
    {
        if (error) throw error;
        console.log("Table successfully created!");
    })

    return JSONdata
})
.then( JSONdata => {
    //parse JSON data
    const Projects = JSON.parse(JSONdata).Project;

    //insert all data into table
    Projects.forEach( projectTuple => {
        const values = [projectTuple.ProjectID, projectTuple.Title, projectTuple.Finished, projectTuple.Complexity];

        connection.query(projectInsertProjectSQL, values, (error, results) => {
            if (error) throw error;
            console.log("tuple successfully added");
        })
    })

    return JSONdata;
})
.finally(() => {connection.end()}) //after everything end the connection
.catch(error => {console.log(error)}) //if there ever is an error console log the error