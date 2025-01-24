/*
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint
 */
const fs = require('fs').promises;
const connection = require('../database/connection.js');


const fetchEndpoints = () => {
    return fs.readFile('./app/EndpointInfo.JSON', 'utf-8')
        .then(file => {
            return file; // Return the file content if the file is found
        })
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
    console.log(fetchProjectsSQL);
    return new Promise((resolve, reject) => {
        connection.query(fetchProjectsSQL, (error, results) => {
            if (error) {
                console.error("Error fetching projects:", error);
                return reject(error);
            }
            console.log(results);
            const plainResults = results.map(row => ({ ...row }));
            console.log(plainResults);
            resolve(plainResults);
        });
    });
}
    function buildShowOnlyString(showOnlyParameter, showOnlyAttribute) {
        if (blackListedWord(showOnlyParameter) || blackListedWord(showOnlyAttribute)) return "";

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

    function buildSortByString(sortByParameter) {
        if (blackListedWord(sortByParameter)) return "";

        if (sortByParameter === "Date") return " ORDER BY Finished";
        else if (sortByParameter === "Program") return " ORDER BY Program";
        else if (sortByParameter === "Complexity") return " ORDER BY Complexity";

        return "";
    }

    function buildOrderByString(orderByParameter) {
        if (blackListedWord(orderByParameter)) return "";

        if (orderByParameter === "ASC") return " ASC";
        else if (orderByParameter === "DESC") return " DESC";

        return "";
    }


    /*Prevents SQL injection via parameter or if the parameter is undefined*/
    function blackListedWord(parameter) {
        if(!parameter) return true;

        const blackList = ["select", "from", "where", "sort by", "order by", "having", "drop", "project", "project_details", "images", "database"];
        
        let containsBlackListedWord = false;
        blackList.forEach( (blackListedWord) => {
            if(parameter.toLowerCase().includes(blackListedWord)) {
                containsBlackListedWord = true;
            }
        })

        return containsBlackListedWord;
    }



module.exports = { fetchEndpoints, fetchAllProjects };