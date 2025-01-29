/**
    Supertest will allow us to streamline the test HTTP requests allowing us to structure it simpler like below

    -describe: groups tests
    -it: is a specific single test
    -expect: returns true if returned value from function is same as parameter
    -toHaveProperty: accepts a key value pair as 2 seperate arguments (for this specifically we use the endpoint as the key and the returned body as the value)

    
    request(app): 
        -allows us to make requests to the app (by default the expect will be the status code)
        -Can chain a .then() as expect also returns the server response
        -We can isolate the body of the response to determine what the API has given us and run tests on it in the .then()
 */

const request = require("supertest");
const app = require("./app/app.js");

describe( "GET /api", () => {
    it('Should return a 200 status code', async () => {
            return request(app).get('/api').expect(200);
    })

    it('Should return a JSON object with all the endpoints in its body', async () => {
        return request(app).get('/api').expect(200)
        .then((response) => {
            expect(typeof response.body).toBe('object');
            expect(response.body).toHaveProperty('GET /api', expect.any(Object));
            expect(response.body).toHaveProperty('GET /api/project_titles', expect.any(Object));
            expect(response.body).toHaveProperty('GET /api/project_titles/:title', expect.any(Object));
        })
    })
})

describe( "GET /api/projects", () => {
    it('Should return a 200 status code', async () => {
        return request(app).get('/api/projects').expect(200);
    })

    it('Response body should be an array of objects', async () => {
        return request(app).get('/api/projects').expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBe(true);
        })
    })

    it('Response body should contain all attributes for Project', async () => {
        return request(app).get('/api/projects').expect(200)
        .then((response) => {
            response.body.forEach((tuple) => {
                expect(tuple).toHaveProperty('ProjectID');
                expect(tuple).toHaveProperty('Title');
                expect(tuple).toHaveProperty('Finished');
                expect(tuple).toHaveProperty('Program');
                expect(tuple).toHaveProperty('Complexity');
                expect(tuple).toHaveProperty('ProjectLink');
            })
        })
    })

    it('Response body should filter by show_only parameters', async () => {
        return request(app).get('/api/projects?show_only=Program&show_only_attribute=Java').expect(200)
        .then((response) => {
            response.body.forEach((tuple) => {
                expect(tuple.Program === 'Java');
            })
        })
    })

    it('Response body should order projects in descending order when given the parameter to', async () => {
        return request(app).get('/api/projects?sort_by=Complexity&order_by=DESC').expect(200)
        .then((response) => {
            let previousTupleComplexityValue = response.body[0].Complexity;

            response.body.forEach((tuple) => {
                expect(previousTupleComplexityValue >= tuple.Complexity);
                previousTupleComplexityValue = tuple.Complexity;
            })
        })
    })

    it('Response body should order projects in ascending order when given the parameter to', async () => {
        return request(app).get('/api/projects?sort_by=Date&order_by=ASC').expect(200)
        .then((response) => {
            let previousTupleDateValue = new Date(response.body[0].Date).getTime();

            response.body.forEach((tuple) => {
                expect(new Date(tuple.Date).getTime() >= previousTupleDateValue)
                previousTupleDateValue = new Date(tuple.Date).getTime();
            })
        })
    })

    it('Should return a 400 error if sql injection is attempted', async () => {
        return request(app).get('/api/projects?sort_by=Select').expect(400);
    })
})

describe("GET /api/projects/:projectID", () => {
    it('Should return a status code of 200', async () => {
        return request(app).get('/api/projects/1').expect(200);
    })

    it('Should return all information about a project', async () => {
        return request(app).get('/api/projects/2').expect(200)
        .then((response) => {
            response.body.forEach((tuple) => {
                expect(tuple).toHaveProperty('Title');
                expect(tuple).toHaveProperty('Finished');
                expect(tuple).toHaveProperty('Program');
                expect(tuple).toHaveProperty('Complexity');
                expect(tuple).toHaveProperty('ProjectLink');
                expect(tuple).toHaveProperty('DetailID');
                expect(tuple).toHaveProperty('Description');
                expect(tuple).toHaveProperty('Image_Title');
                expect(tuple).toHaveProperty('Image_URL');
            })
        })
    })

    it('Should return a 404 error when a project of that ID doesn\'t exist', async () => {
        return request(app).get('/api/projects/10000').expect(404);
    })

    it('Should return a 400 error when SQL injection is attempted', async () => {
        return request(app).get('/api/projects/select').expect(400);
    })
})

describe("POST /api/projects", () => {
    it('Should return with a 400 error if the request body is empty', async () => {
        return request(app).post('/api/projects').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, does not have required properties, new projects need at least: \'Title\', \'Complexity\' and a \'project_details\' array")
        })
    })

    it('Should return with a 400 error if one of the neccessary attributes is missing', async () => {
        return request(app).post('/api/projects').send({Title: 'test', Complexity: 1}).expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, does not have required properties, new projects need at least: \'Title\', \'Complexity\' and a \'project_details\' array")
        })
    })

    it('Should return with a 400 error if project details is an empty array', async () => {
        return request(app).post('/api/projects').send({Title: 'test', Complexity: 1, project_details: []}).expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, need at least one project_details object to add to this project")
        })
    })

    it('Should return with a 400 error if project details doesn\'t have all neccessary details', async () => {
        return request(app).post('/api/projects').send({Title: 'test', Complexity: 1, project_details: [{ProjectID: 1, DetailID: 1, Description: "test"}, {ProjectID: 1, Description: "test2"}]})
        .expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, project details does not have required properties on all details, project_details need at least: \'ProjectID\',\'DetailID\',\'Description\'")
        })
    })

    it('Should return with a 400 error if images exists and doesn\'t have all neccessary details', async () => {
        return request(app).post('/api/projects').send({Title: 'test', Complexity: 1, project_details: [{ProjectID: 1, DetailID: 1, Description: "test"}], Images: [{ProjectID: 1, DetailID: 2}]})
        .expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, images included that do not have required properties, images needs at least: \'ProjectID\', \'DetailID\', \'Image_Title\', \'Image_URL\'")
        })
    })

    it('Should return a 201 status and the project you added in respones body if project is successfully added', async () => {
        return request(app).post('/api/projects').send({Title: 'testThatShouldGoThrough', Complexity: 1, project_details: [{ProjectID: 21, DetailID: 1, Description: "testDetailsThatShouldGoThrough"}]})
        .expect(201)
        .then((response) => {
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('Title');
            expect(response.body[0]).toHaveProperty('Finished');
            expect(response.body[0]).toHaveProperty('Program');
            expect(response.body[0]).toHaveProperty('Complexity');
            expect(response.body[0]).toHaveProperty('ProjectLink');
        })
    })
})

describe("PATCH /api/projects/:projectID", () => {

    it('Should return with a 400 error if the projectID is anything but an integer', async () => {
        return request(app).patch('/api/projects/asdlfkjasdfl').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, ProjectID must be an integer");
        })
    })

    it('Should return with a 400 error if the request body is empty', async () => {
        return request(app).patch('/api/projects/1').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, Please specify at least one attribute to update");
        })
    })

    it('Should return with a 404 error if a project by that ProjectID is not in the database', async () => {
        return request(app).patch('/api/projects/99999').send({Title: 'test'}).expect(404)
    })

    it('Should successfully update the project with the values in the request body', async () => {
        return request(app).patch('/api/projects/1').send({Title: 'Successfully updated!'}).expect(200)
        .then((response) => {
            expect(response.body.Title).toBe("Successfully updated!")
        })
    })
})

describe("PATCH /api/projectDetail/:projectID/:projectDetailID", () => {
    it('Should return with a 400 error if the projectID is anything but an integer', async () => {
        return request(app).patch('/api/projectDetail/asdf/1').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, ProjectID must be an integer")
        })
    })

    it('Should return with a 400 error if the projectDetailID is anything but an integer', async () => {
        return request(app).patch('/api/projectDetail/1/asdf').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, ProjectDetailID must be an integer")
        })
    })


    it('Should return with a 400 error if the request body does not contain a new description', async () => {
        return request(app).patch('/api/projectDetail/1/1').send().expect(400)
        .then((response) => {
            expect(response.body.error).toBe("Error, Project Detail must include a description");
        })
    })

    it('Should return with a 404 error if a detail with that ProjectID is not in the database', async () => {
        return request(app).patch('/api/projectDetail/99999/1').send({Description: 'test'}).expect(404)
        .then((response) => {
            expect(response.body.error).toBe("Error, detail with that ProjectID and DetailID is not in the database");
        })
    })

    it('Should return with a 404 error if a detail with that DetailID of that ProjectID is not in the database', async () => {
        return request(app).patch('/api/projectDetail/1/99999').send({Description: 'test'}).expect(404)
        .then((response) => {
            expect(response.body.error).toBe("Error, detail with that ProjectID and DetailID is not in the database");
        })
    })

    it('Should successfully update an image free request body with a new description', async () => {
        return request(app).patch('/api/projectDetail/1/1').send({Description: 'Successfully updated No img'}).expect(200);
    })

    it('Should successfully update an request body with both description and images', async () => {
        return request(app).patch('/api/projectDetail/1/1').send({Description: 'Successfully updated with img', Images: [{Title: 'img1', URL: 'URL1'}, {Title: 'img2', URL: "URL2"}]}).expect(200)
    })
})