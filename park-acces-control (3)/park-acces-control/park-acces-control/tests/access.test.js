process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/martel_db_test';
process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
process.env.CAMERA_KEY = process.env.CAMERA_KEY || 'dev_camera_key';

const request = require('supertest');
const mongoose = require('mongoose');
let server;
const AccessToken = require('../src/models/AccessToken');
const PendingRequest = require('../src/models/PendingRequest');

beforeAll(async () => {
    // require server after setting env
    server = require('../server').server;
    await mongoose.connection.dropDatabase();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close();
});

describe('Access control basic flows', () => {
    test('login returns token', async () => {
        const res = await request(server).post('/api/auth/login').send({ username: 'admin', password: 'password' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('create request validation fails when missing fields', async () => {
        const res = await request(server).post('/api/access/request').send({ destination: 'Bodega A' });
        expect(res.statusCode).toBe(400);
    });

    test('approve flow and LPR matching', async () => {
        // create pending
        const pending = await PendingRequest.create({ requestId: 'req-1', visitorName: 'Juan', destination: 'B', hostName: 'Host', placas: 'ABC-123' });
        // login
        const login = await request(server).post('/api/auth/login').send({ username: 'admin', password: 'password' });
        const token = login.body.token;
        // approve
        const ap = await request(server).post(`/api/access/approve/${pending._id}`).set('Authorization', `Bearer ${token}`).send();
        expect(ap.statusCode).toBe(200);
        expect(ap.body.token).toBeDefined();
        // lpr match
        const lpr = await request(server).post('/api/access/lpr').set('x-camera-key', 'dev_camera_key').send({ placas: 'abc 123' });
        expect(lpr.statusCode).toBe(200);
        expect(lpr.body.granted).toBe(true);
    }, 20000);
});