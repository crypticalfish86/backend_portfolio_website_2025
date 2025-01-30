const connection = require('../../database/connection.js');

//Helper functions
function hasAllRequiredProperties(projectInformation, propertyArray) {
    let hasAllProperties = true;

    propertyArray.forEach((property) => {
        if (!projectInformation.hasOwnProperty(property)) {
            hasAllProperties = false;
        }
    })

    return hasAllProperties;
}

function hasAnyProperty(projectInformation, propertyArray) {
let hasAnyProperty = false;

propertyArray.forEach((property) => {
    if (projectInformation.hasOwnProperty(property)) {
        hasAnyProperty = true;
    }
})

return hasAnyProperty;
}


/*
    GET '/api/projects'
    Fetches all Projects (with included query parameters if you want to limit your viewing)
*/
const fetchAllProjects = (queryParameters) => {

    //build the strings for extra parameters (sorting/filtering)
    let showOnly = buildShowOnlyString(queryParameters.show_only, queryParameters.show_only_attribute);
    let sortBy = buildSortByString(queryParameters.sort_by);
    let orderBy = buildOrderByString(queryParameters.order_by);

    const fetchProjectsSQL =
    `
        SELECT 
            *
        FROM 
            Project
    ` + showOnly + sortBy + orderBy;

    return new Promise((resolve, reject) => {
        connection.query(fetchProjectsSQL, (error, results) => {
            if (error) {
                console.error("Error fetching projects:", error);
                return reject(error);
            }

            //return the plain results (just an array of objects)
            const plainResults = results.map(row => ({ ...row }));
            resolve(plainResults);
        });
    });
}
    /*Build the show only request, rejecting if there is an SQL injection attempt*/
    function buildShowOnlyString(showOnlyParameter, showOnlyAttribute) {

        if (showOnlyParameter === "Year") {
            return ` WHERE Finished >= \'${showOnlyAttribute}-01-01\'`;
        }
        else if (showOnlyParameter === "Program") {
            return ` WHERE Program = \'${showOnlyAttribute}\'`;
        }
        else if (showOnlyParameter === "Complexity") {
            return ` WHERE Complexity = ${showOnlyAttribute}`;
        }

        return "";
    }

    /*Build the sort by request, rejecting if there is an SQL injection attempt*/
    function buildSortByString(sortByParameter) {

        if (sortByParameter === "Date") return " ORDER BY Finished";
        else if (sortByParameter === "Program") return " ORDER BY Program";
        else if (sortByParameter === "Complexity") return " ORDER BY Complexity";

        return "";
    }

    /*Build the order by request, rejecting if there is an SQL injection attempt*/
    function buildOrderByString(orderByParameter) {

        if (orderByParameter === "ASC") return " ASC";
        else if (orderByParameter === "DESC") return " DESC";

        return "";
    }


/*
    GET '/api/projects/:projectID'
    Fetches a single project by its id
*/
const fetchProjectByID = (projectID) => {
    return new Promise((resolve, reject) => {
        if (typeof projectID !== 'string' || !/^\d+$/.test(projectID)) {
            return reject({status: 400, msg: "Error, projectID must be an integer number"});
        }

        const fetchprojectByIDSQL = 
        `
        SELECT 
            project.Title, 
            project.Finished, 
            project.Program, 
            project.Complexity, 
            project.ProjectLink, 
            project_details.DetailID, 
            project_details.Description, 
            images.ImageID, 
            images.DetailID, 
            images.Image_Title, 
            images.Image_URL
        FROM 
            project 
        INNER JOIN 
            project_details ON project.ProjectID = project_details.ProjectID 
        INNER JOIN 
            images on project_details.ProjectID = images.ProjectID
        WHERE 
            project.ProjectID = ? 
            AND project_details.DetailID = images.DetailID
        `

        connection.query(fetchprojectByIDSQL, [projectID], (error, results) => {
            if(results.length === 0){
                return reject({status: 404, msg: "Error, Project not found at that ID"});
            }
            
            const plainResults = results.map(row => ({ ...row }));
            return resolve(plainResults);
        })
    })
}

/*
    POST /api/projects

    Inserts a new project into the database

    minimally, projectInformation should come in looking like so:
    {
        Title: String,
        Complexity: Int,
        project_details: [{ProjectID: Int, DetailID: Int, Description: String}],
    }

    maximally with optional attributes, project information looks like:
    {
        Title: String,
        Finished: mysql Date,
        Program: String,
        Complexity: Int,
        ProjectLink: String,
        project_details: [{ProjectID: Int, DetailID: Int, Description: String}, ...],
        images: [{ProjectID: Int, DetailID: Int, Image_Title: String, Image_URL: String}, ...]
    }
*/
const insertNewProject = (projectInformation) => {
    return new Promise((resolve, reject) => {
        // Validate required properties
        if (!hasAllRequiredProperties(projectInformation, ['Title', 'Complexity', 'project_details'])) {
            return reject({ status: 400, msg: "Error, does not have required properties, new projects need at least: 'Title', 'Complexity' and a 'project_details' array" });
        }

        // Validate at least one project detail
        if (projectInformation.project_details.length < 1) {
            return reject({ status: 400, msg: "Error, need at least one project_details object to add to this project" });
        }

        // Validate project details
        for (const detail of projectInformation.project_details) {
            if (!hasAllRequiredProperties(detail, ['ProjectID', 'DetailID', 'Description'])) {
                return reject({ status: 400, msg: "Error, project details does not have required properties on all details, project_details need at least: 'ProjectID','DetailID','Description'" });
            }
        }

        // Validate images if present
        if (projectInformation.Images) {
            for (const image of projectInformation.Images) {
                if (!hasAllRequiredProperties(image, ['ProjectID', 'DetailID', 'Image_Title', 'Image_URL'])) {
                    return reject({ status: 400, msg: "Error, images included that do not have required properties, images needs at least: 'ProjectID', 'DetailID', 'Image_Title', 'Image_URL'" });
                }
            }
        }

        //Build projectParams queries
        const projectParams = [];

        // Build the Project SQL with parameterized queries
        let createProjectSQL = "INSERT INTO project (Title";
        let valuesProjectSQL = " VALUES (?";
        projectParams.push(projectInformation.Title);

        if (projectInformation.Finished !== undefined) {
            createProjectSQL += ", Finished";
            valuesProjectSQL += ", ?";
            projectParams.push(projectInformation.Finished);
        }

        if (projectInformation.Program !== undefined) {
            createProjectSQL += ", Program";
            valuesProjectSQL += ", ?";
            projectParams.push(projectInformation.Program);
        }

        createProjectSQL += ", Complexity";
        valuesProjectSQL += ", ?";
        projectParams.push(projectInformation.Complexity);

        if (projectInformation.ProjectLink !== undefined) {
            createProjectSQL += ", ProjectLink)";
            valuesProjectSQL += ", ?)";
            projectParams.push(projectInformation.ProjectLink);
        } else {
            createProjectSQL += ")";
            valuesProjectSQL += ")";
        }

        const projectSQL = createProjectSQL + valuesProjectSQL;

        // Build the project_details SQL with parameterized queries
        let createProjectDetailsSQL = "INSERT INTO project_details (ProjectID, DetailID, Description) VALUES ";
        const projectDetailsParams = [];
        const projectDetailsValues = projectInformation.project_details.map(detail => {
            projectDetailsParams.push(detail.ProjectID, detail.DetailID, detail.Description);
            return "(?, ?, ?)";
        }).join(", ");

        const projectDetailsSQL = createProjectDetailsSQL + projectDetailsValues;

        // Build the images SQL with parameterized queries (if images are present)
        let imagesSQL;
        const imagesParams = [];
        if (projectInformation.Images) {
            let createImagesSQL = "INSERT INTO images (ProjectID, DetailID, Image_Title, Image_URL) VALUES ";
            const imagesValues = projectInformation.Images.map(image => {
                imagesParams.push(image.ProjectID, image.DetailID, image.Image_Title, image.Image_URL);
                return "(?, ?, ?, ?)";
            }).join(", ");

            imagesSQL = createImagesSQL + imagesValues;
        }

        // Execute the queries in sequence
        connection.query(projectSQL, projectParams, (error, results) => {
            if (error) {
                return reject(error);
            }

            connection.query(projectDetailsSQL, projectDetailsParams, (error, results) => {
                if (error) {
                    return reject(error);
                }

                if (imagesSQL) {
                    connection.query(imagesSQL, imagesParams, (error, results) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(projectInformation);
                    });
                } else {
                    resolve(projectInformation);
                }
            });
        });
    })
    .then((projectInformation) => {
        return new Promise((resolve, reject) => {
            // Fetch the newly inserted project using parameterized queries
            const selectProjectSQL = `
                SELECT project.ProjectID, project.Title, project.Finished, project.Program, project.Complexity, project.ProjectLink
                FROM project
                INNER JOIN project_details ON project.ProjectID = project_details.ProjectID
                LEFT OUTER JOIN images ON project.ProjectID = images.ProjectID
                WHERE project.Title = ?
            `;
            connection.query(selectProjectSQL, [projectInformation.Title], (error, results) => {
                if (error) {
                    return reject({ status: 404, msg: "Your request went through, however, it does not appear to be in the server" });
                }

                resolve(results);
            });
        });
    });
};

/*Update any non primary key attribute of a tuple in the project table */
const editProjectByID = (projectID, informationToUpdate) => {
    
    return new Promise((resolve, reject) => {

        

        /*Check the projectID is an integer */
        if (!/^-?\d+$/.test(projectID)) {
            return reject({status: 400, msg: "Error, ProjectID must be an integer"});
        }

        /*Check there is at least one attribute the request is updating */
        if (!hasAnyProperty(informationToUpdate, ['Title', 'Finished', 'Program', 'Complexity', 'ProjectLink'])) {
            return reject({status: 400, msg: "Error, Please specify at least one attribute to update"});
        }

        //NOTE: SQL INJECTION FOR THIS FUNCTION ONWARDS WILL NOT BE CHECKED AS WE WILL SWITCH TO PARAMITARIZED QUERIES BEFORE DEPLOYMENT

        connection.query(`SELECT * FROM project WHERE ProjectID = ${projectID}`, (error, results) => {
            if (error) {
                return reject(error);
            }

            if (results.length == 0) {
                return reject ({status: 404, msg : "Error, project with that ID is not in the database"});
            }

            /*Build SQL statement */
            let updateSQL = `UPDATE project SET`;
            if (informationToUpdate.Title) {
                updateSQL += ` Title = \'${informationToUpdate.Title}\',`;
            }
            if (informationToUpdate.Finished) {
                updateSQL += ` Finished = \'${informationToUpdate.Finished}\',`;
            }
            if (informationToUpdate.Program) {
                updateSQL += ` Program = \'${informationToUpdate.Program}\',`;
            }
            if (informationToUpdate.Complexity) {
                updateSQL += ` Complexity = ${informationToUpdate.Complexity},`;
            }
            if (informationToUpdate.ProjectLink) {
                updateSQL += ` ProjectLink = ${informationToUpdate.ProjectLink},`
            }

            updateSQL = updateSQL.substring(0, updateSQL.length - 1); //remove trailing comma

            updateSQL += ` WHERE ProjectID = ${projectID}`;

            /*Execute the update*/
            connection.query(updateSQL, (error, results) => {
                if (error) {
                    return reject(error);
                }

                /*Select the project again and return it in the response.body*/
                connection.query(`SELECT * FROM project WHERE ProjectID = ${projectID}`, (error, results) => {
                    if (error) {
                        return reject (error);
                    }

                    const plainResults = results.map(row => ({ ...row }));
                    return resolve(plainResults[0]);
                })
            })
        })
    })
}

module.exports = { fetchAllProjects, fetchProjectByID, insertNewProject, editProjectByID }