/**
    Supertest will allow us to streamline the test HTTP requests allowing us to structure it simpler like below
 */

const request = require("supertest");
const app = require("./app/app.js");

describe( "GET /api", () => {
    it('Should return a 200 status code', async () => {
        const res = await request(app).get('/api');
        expect(res.statusCode).toEqual(200);
    })
})