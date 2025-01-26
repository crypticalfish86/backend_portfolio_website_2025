/*
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint
 */
const fs = require('fs').promises;
const connection = require('../database/connection.js');

/*Return a JSON file containing information on all the endpoints*/
const fetchEndpoints = () => {
    return fs.readFile('./app/EndpointInfo.JSON', 'utf-8')
        .catch(error => {
            if (error.code === 'ENOENT') {
                // File not found, return a 404 error
                return Promise.reject({ status: 404, msg: 'Endpoint JSON file not found' });
            } else {
                // Other errors (e.g., permission issues), return a 500 error
                return Promise.reject({ status: 500, msg: 'Internal Server Error' });
            }
        });
};

/*
    Fetches all Projects (with included query parameters if you want to limit your viewing)
*/
const fetchAllProjects = (queryParameters) => {

    let showOnly = buildShowOnlyString(queryParameters.show_only, queryParameters.show_only_attribute);
    let sortBy = buildSortByString(queryParameters.sort_by);
    let orderBy = buildOrderByString(queryParameters.order_by);

    const fetchProjectsSQL =
    `
        SELECT *
        FROM Project
    ` + showOnly + sortBy + orderBy;

    //If an SQL injection was ever attempted in the queries, reject the request with a 400 bad request code
    if (fetchProjectsSQL.includes("SQL Injection Attempt")) {
        return Promise.reject({status: 400, msg: 'Attempted SQL injection'});
    }


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
        if (blackListedWord(showOnlyParameter) || blackListedWord(showOnlyAttribute)) return "SQL Injection Attempt";

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
        if (blackListedWord(sortByParameter)) return "SQL Injection Attempt";

        if (sortByParameter === "Date") return " ORDER BY Finished";
        else if (sortByParameter === "Program") return " ORDER BY Program";
        else if (sortByParameter === "Complexity") return " ORDER BY Complexity";

        return "";
    }

    /*Build the order by request, rejecting if there is an SQL injection attempt*/
    function buildOrderByString(orderByParameter) {
        if (blackListedWord(orderByParameter)) return "SQL Injection Attempt";

        if (orderByParameter === "ASC") return " ASC";
        else if (orderByParameter === "DESC") return " DESC";

        return "";
    }


    /*Prevents SQL injection via parameter or if the parameter is undefined*/
    function blackListedWord(parameter) {
        if(!parameter) return false;

        const blackList = ["select", "from", "where", "sort by", "order by", "having", "drop", "project", "project_details", "images", "database"];
        
        let containsBlackListedWord = false;
        blackList.forEach( (blackListedWord) => {
            if(parameter.toLowerCase().includes(blackListedWord)) {
                containsBlackListedWord = true;
            }
        })

        return containsBlackListedWord;
    }

    //for some reason it doesn't think .then can work, figure this out
const fetchProjectByID = (projectID) => {
    return new Promise((resolve, reject) => {
        if (typeof projectID !== 'string' || !/^\d+$/.test(projectID)) {
            return reject({status: 400, msg: "Error, projectID must be an integer number"});
        }

        const fetchprojectByIDSQL = 
        `
        SELECT project.Title, project.Finished, project.Program, project.Complexity, project.ProjectLink, project_details.DetailID, project_details.Description, images.DetailID, images.Image_Title, images.Image_URL
        FROM project INNER JOIN project_details ON project.ProjectID = project_details.ProjectID INNER JOIN images on project_details.ProjectID = images.ProjectID
        WHERE project.ProjectID = ${projectID} AND project_details.DetailID = images.DetailID
        `

        connection.query(fetchprojectByIDSQL, (error, results) => {
            if(results.length === 0){
                return reject({status: 404, msg: "Error, Project not found at that ID"});
            }
            
            const plainResults = results.map(row => ({ ...row }));
            console.log(plainResults);
            resolve(plainResults);
        })
    })
}

module.exports = { fetchEndpoints, fetchAllProjects, fetchProjectByID };