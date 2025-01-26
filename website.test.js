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