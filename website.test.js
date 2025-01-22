const supertest = require("supertest");
const app = require("./app/app.js");

describe( "GET /api", () => {
    it('Should return a 200 status code', async () => {
        const res = await request(app).get('/api');
        expect(res.statusCode).toEqual(200);
    })
})