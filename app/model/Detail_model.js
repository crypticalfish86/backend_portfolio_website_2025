/*
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint

    TODO:
        -ADD PARAMITARIZED QUERIES AT SOME POINT BEFORE DEPLOYING API
        (CHANGE THINGS TO connection.execute)

        -REFACTOR TO .THEN PROMISES TO IMPROVE READABILITY (and therefore maintainability)

 */
const connection = require('../../database/connection.js');

/*Replaces a project_detail with new description and images (note for front end: requires COMPLETE replacement so new description, image title and image url)*/
const editProjectDetailByID = (projectID, projectDetailID, informationToUpdate) => {
    return new Promise((resolve, reject) => {
        
        /*Check the projectID is an integer */
        if (!/^-?\d+$/.test(projectID)) {
            return reject({status: 400, msg: "Error, ProjectID must be an integer"});
        }

        /*Check the projectDetailID is an integer */
        if (!/^-?\d+$/.test(projectDetailID)) {
            return reject({status: 400, msg: "Error, ProjectDetailID must be an integer"});
        }

        if(!hasAllRequiredProperties(informationToUpdate, ['Description'])) {
            return reject({status: 400, msg: "Error, Project Detail must include a description"});
        }


        connection.query(`SELECT * FROM project_details WHERE ProjectID = ${projectID} AND DetailID = ${projectDetailID}`, (error, results) => {
            if (error) {
                return reject(error);
            }
            
            /*Check if that detail exists*/
            if (results.length === 0) {
                return reject ({status: 404, msg : "Error, detail with that ProjectID and DetailID is not in the database"});
            }

            updateSQL = 
            `
                UPDATE project_details 
                SET Description = \'${informationToUpdate.Description}\'
                WHERE ProjectID = ${projectID} AND DetailID = ${projectDetailID};
            `

            connection.query(updateSQL, (error, results) => {
                if (error) {
                    return reject(error);
                }

                /*return the updated detail id in the database */
                connection.query(`SELECT * FROM project_details WHERE ProjectID = ${projectID} AND DetailID = ${projectDetailID}`, (error, results) => {
                    if (error) {
                        return reject(error);
                    }


                    if(typeof informationToUpdate.Images === 'undefined') {
                        return resolve();
                    }
                    else {
                        /*remove all images associated with projectID+detailID in database */
                        connection.query(`DELETE FROM images WHERE ProjectID = ${projectID} AND DetailID = ${projectDetailID}`, (error, results) => {
                            if (error) {
                                return reject(error);
                            }

                            /*Change the URL and Image title */

                            for (let i = 0; i < informationToUpdate.Images.length; i++){                                
                                let imageInsertionSQL = 
                                `
                                    INSERT INTO Images (ProjectID, DetailID, Image_Title, Image_URL) 
                                    VALUES (${projectID}, ${projectDetailID}, \'${informationToUpdate.Images[i].Title}\', \'${informationToUpdate.Images[i].URL}\')
                                `
    
                                connection.query(imageInsertionSQL, (error, results) => {
                                    if (error) {
                                        return reject(error);
                                    }
                                    else if(i == informationToUpdate.Images.length - 1){
                                        return resolve();
                                    }
                                })
                            }
                        })
                    }
                })
            })
        })
    })
}

/*Helper functions*/
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

module.exports = { editProjectDetailByID };