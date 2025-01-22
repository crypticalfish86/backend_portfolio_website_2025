/*
    This File is the setup of the database (it currently only sets up the Project table but 
    more will be added). Refer to the "Project_Database_ER_Diagram.png" for information on 
    what the database should look like
*/

const fs = require('fs');


const filepathForJSON = 'database/data.JSON';


const connection = require('./connection.js');//create the connection to my XAMPP database (ensure its running)
connection.connect(); //attempt to connect to the database

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
const projectDetailsCreateTableSQL = 
`
    CREATE TABLE Project_Details(
        ProjectID INT,
        DetailID INT, 
        Description VARCHAR(500) NOT NULL,
        PRIMARY KEY (ProjectID, DetailID),
        FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
    )
`;
const imagesCreateTableSQL = 
`
    CREATE TABLE Images(
        ProjectID INT,
        DetailID INT,
        Image_Title VARCHAR(100) NOT NULL,
        Image_URL VARCHAR(255) NOT NULL,
        PRIMARY KEY (ProjectID, DetailID),
        FOREIGN KEY (ProjectID, DetailID) REFERENCES Project_Details(ProjectID, DetailID)
    )
`

//SQL Tables insertion
const projectInsertProjectSQL =
`
    INSERT INTO Project (ProjectID, Title, Finished, Complexity)
    VALUES (?, ?, ?, ?)
`;
const projectDetailsInsertProjectSQL =
`
    INSERT INTO Project_Details (ProjectID, DetailID, Description)
    VALUES (?, ?, ?)
`;
const imagesInsertProjectSQL =
`
    INSERT INTO Images (ProjectID, DetailID, Image_Title, Image_URL)
    VALUES (?, ?, ?, ?)
`;



/*
    This promise chain drops all tables, recreates them and then adds all data into the database 
    stored in the JSON file. JSONdata is returned after every .then() as it contains the
    JSON file data and is needed to parse the data for the individual tables.
*/
fs.promises.readFile(filepathForJSON, 'utf-8')
.then( data => {
    //check if data.JSON was found
    console.log("JSON file read successfully!");

    return JSON.parse(data); //returned the parsed JSON file to create the individual tables further down
}) 
.then( JSONdata => {
    //drop each table if it existed (ensure each table is dropped in the right order to prevent foreign key constraints failing)
    connection.query('DROP TABLE IF EXISTS Images', (error, data) => {
        if (error) throw error;
        console.log("Images table successfully dropped if it existed!");
    })
    
    connection.query('DROP TABLE IF EXISTS Project_Details', (error, data) => {
        if (error) throw error;
        console.log("Project_Details table successfully dropped if it existed!");
    })

    connection.query('DROP TABLE IF EXISTS Project', (error, data) => {
        if (error) throw error;
        console.log("Project table successfully dropped if it existed!\n");
    })

    return JSONdata
})
.then( JSONdata => {
    //create the project table
    connection.query(projectCreateTableSQL, (error, data) => {
        if (error) throw error;
        console.log("\nProject table successfully created! \n");
    })

    return JSONdata
})
.then( JSONdata => {
    //Seperate Projects table from JSON data
    const Projects = JSONdata.Project;

    //insert all data into table
    Projects.forEach( projectTuple => {
        const values = [projectTuple.ProjectID, projectTuple.Title, projectTuple.Finished, projectTuple.Complexity];

        connection.query(projectInsertProjectSQL, values, (error, results) => {
            if (error) throw error;
            console.log("Project tuple successfully added");
        })
    })

    return JSONdata;
})
.then( JSONdata => {
    //create Project_Details table
    connection.query(projectDetailsCreateTableSQL, (error, data) => {
        if (error) throw error;
        console.log("\nProject_Details table successfully created! \n");
    })

    return JSONdata;
})
.then( JSONdata => {
    //seperate Project_Details table from JSON data
    const ProjectDetails = JSONdata.Project_Details;

    //insert all data into table
    ProjectDetails.forEach( projectDetailsTuple => {
        const values = [projectDetailsTuple.ProjectID, projectDetailsTuple.DetailID, projectDetailsTuple.Description];

        connection.query(projectDetailsInsertProjectSQL, values, (error, results) => {
            if (error) throw error;
            console.log("Project_Details tuple successfully added");
        })
    })

    return JSONdata;
})
.then( JSONdata => {
    //create Images table
    connection.query(imagesCreateTableSQL, (error, data) => {
        if (error) throw error;
        console.log("\nImages table successfully created!\n");
    })

    return JSONdata;
})
.then( JSONdata => {
    //seperate Images table from JSON data
    const Images = JSONdata.Images;

    //insert all data into table
    Images.forEach( imageTuple => {
        const values = [imageTuple.ProjectID, imageTuple.DetailID, imageTuple.Image_Title, imageTuple.Image_URL];

        connection.query(imagesInsertProjectSQL, values, (error, results) => {
            if (error) throw error;
            console.log("Image tuple successfully added");
        })
    })

    return JSONdata;
})
.finally(() => {connection.end()}) //after everything end the connection
.catch(error => {console.log(error)}) //if there ever is an error console log the error