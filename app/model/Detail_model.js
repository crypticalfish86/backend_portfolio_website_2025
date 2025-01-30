/*
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint

    TODO:
        -ADD PARAMITARIZED QUERIES AT SOME POINT BEFORE DEPLOYING API
        (CHANGE THINGS TO connection.execute)

        -REFACTOR TO .THEN PROMISES TO IMPROVE READABILITY (and therefore maintainability)

 */
const connection = require('../../database/connection.js');

/*
    PATCH /api/projectDetail/:projectID/:projectDetailID
    Replaces a project_detail with new description and images (note for front end: requires COMPLETE replacement so new description, image title and image url)
*/
const editProjectDetailByID = (projectID, projectDetailID, informationToUpdate) => {
    return new Promise((resolve, reject) => {
        // Validate projectID and projectDetailID are integers
        if (!/^-?\d+$/.test(projectID)) {
            return reject({ status: 400, msg: "Error, ProjectID must be an integer" });
        }
        if (!/^-?\d+$/.test(projectDetailID)) {
            return reject({ status: 400, msg: "Error, ProjectDetailID must be an integer" });
        }

        // Validate that the required properties are present
        if (!hasAllRequiredProperties(informationToUpdate, ['Description'])) {
            return reject({ status: 400, msg: "Error, Project Detail must include a description" });
        }

        // Check if the project detail exists
        const selectDetailSQL = `SELECT * FROM project_details WHERE ProjectID = ? AND DetailID = ?`;
        connection.query(selectDetailSQL, [projectID, projectDetailID], (error, results) => {
            if (error) {
                return reject(error);
            }

            if (results.length === 0) {
                return reject({ status: 404, msg: "Error, detail with that ProjectID and DetailID is not in the database" });
            }

            // Update the project detail description
            const updateDetailSQL = `
                UPDATE project_details 
                SET Description = ?
                WHERE ProjectID = ? AND DetailID = ?;
            `;
            const updateDetailParams = [informationToUpdate.Description, projectID, projectDetailID];

            connection.query(updateDetailSQL, updateDetailParams, (error, results) => {
                if (error) {
                    return reject(error);
                }

                // If no images are provided, resolve the promise
                if (typeof informationToUpdate.Images === 'undefined') {
                    return resolve();
                }

                // Delete all images associated with the projectID and detailID
                const deleteImagesSQL = `DELETE FROM images WHERE ProjectID = ? AND DetailID = ?`;
                connection.query(deleteImagesSQL, [projectID, projectDetailID], (error, results) => {
                    if (error) {
                        return reject(error);
                    }

                    // Insert the new images
                    const insertImagePromises = informationToUpdate.Images.map((image) => {
                        const insertImageSQL = `
                            INSERT INTO Images (ProjectID, DetailID, Image_Title, Image_URL) 
                            VALUES (?, ?, ?, ?)
                        `;
                        const insertImageParams = [projectID, projectDetailID, image.Title, image.URL];

                        return new Promise((resolve, reject) => {
                            connection.query(insertImageSQL, insertImageParams, (error, results) => {
                                if (error) {
                                    return reject(error);
                                }
                                resolve();
                            });
                        });
                    });

                    // Wait for all image insertions to complete
                    Promise.all(insertImagePromises)
                        .then(() => resolve())
                        .catch((error) => reject(error));
                });
            });
        });
    });
};

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

module.exports = { editProjectDetailByID };