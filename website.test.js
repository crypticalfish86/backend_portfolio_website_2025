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