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


//connect to my XAMPP database (ensure its running)
const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'portfolio'
    }
);

connection.connect();

//read the file and insert the data in data.JSON into the XAMPP database
fs.readFile('database/data.JSON', 'utf-8', (error, data) =>
    {
        //check if data.JSON was found
        if (error) throw error;
        console.log("JSON file read successfully!");

        //drop the table if it exists
        connection.query('DROP TABLE IF EXISTS Project', (error, results) =>
            {
                //check if we've successfully dropped the table
                if (error) throw error;
                console.log("Project table successfully dropped if it existed!");

                //Create the table
                connection.query( projectCreateTableSQL, (error, results) =>
                    {
                        //check if table is successfully created
                        if (error) throw error;
                        console.log("Project table successfully initiated");

                        //parse JSON data
                        const Projects = JSON.parse(data).Project;

                        //Insert all data into table
                        Projects.forEach((projectTuple) =>
                            {
                                const values = [projectTuple.ProjectID, projectTuple.Title, projectTuple.Finished, projectTuple.Complexity];

                                //insert tuple into table
                                connection.query(projectInsertProjectSQL, values, (error, results) =>
                                    {
                                        //check if tuple was successfully inserted
                                        if (error) throw error;
                                        console.log("Data for tuple successfully added: ", results);
                                    })
                            })

                        connection.end(); //end the connection (if you have more tables you should move this)
                    })
            })
})

