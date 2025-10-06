import request from 'supertest';
import express from 'express';
import userRouter from './user.route.js'; // Adjust path
import userService from './user.service.js'; // Adjust path
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./user.service.js'); // Mock userService

const app = express();
app.use(express.json());
app.use('/users', userRouter); 

describe('User Routes', () => {
    beforeEach(() => {
        vi.restoreAllMocks(); 
    });

    describe('GET /users', () => {
        it('should return a list of users', async () => {
            userService.getAllUsers.mockResolvedValue([[], 0]);

            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Users fetched successfully',
                users: [],
                total: 0,
                page: 1,
                limit: 10,
            });
        });
    });

    describe('GET /users/:id', () => {
        it('should return a user by ID', async () => {
            userService.getUserById.mockResolvedValue({ id: '1', name: 'John Doe' });

            const response = await request(app).get('/users/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: '1', name: 'John Doe' });
        });

        it('should return 404 if user not found', async () => {
            userService.getUserById.mockResolvedValue(null);

            const response = await request(app).get('/users/99');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            userService.createUser.mockResolvedValue({ id: '1', name: 'John Doe' });

            const response = await request(app)
                .post('/users')
                .send({ firstName: 'John',lastName: 'Doe',email:'jdoe@email.com',roleName:'employee' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ id: '1', name: 'John Doe' });
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user', async () => {
            userService.updateUser.mockResolvedValue({ id: '1', name: 'Jane Doe' });

            const response = await request(app)
                .put('/users/1')
                .send({ name: 'Jane Doe' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: '1', name: 'Jane Doe' });
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user and return 204', async () => {
            userService.deleteUser.mockResolvedValue();

            const response = await request(app).delete('/users/1');

            expect(response.status).toBe(204);
        });
    });

    describe('GET /users/active/all', () => {
        it('should return active users', async () => {
            userService.getActiveUsers.mockResolvedValue([[], 0]);

            const response = await request(app).get('/users/active/all');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Active users fetched successfully',
                users: [],
                total: 0,
                page: 1,
                limit: 10,
            });
        });
    });

    describe('PUT /users/status/make-an-admin', () => {
        it('should update user to admin', async () => {
            userService.updateUserToAdmin.mockResolvedValue({ id: '1', role: 'admin' });

            const response = await request(app)
                .put('/users/status/make-an-admin')
                .send({ email: 'test@example.com', roleId: '123' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'User status and role updated successfully',
                user: { id: '1', role: 'admin' },
            });
        });

        it('should return 400 if email or roleId is missing', async () => {
            const response = await request(app)
                .put('/users/status/make-an-admin')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Email and role ID are required' });
        });

        it('should return 404 if user is not found', async () => {
            userService.updateUserToAdmin.mockRejectedValue(new Error('User not found'));

            const response = await request(app)
                .put('/users/status/make-an-admin')
                .send({ email: 'test@example.com', roleId: '123' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });
    });

    describe('GET /users/employee/getByEmail', () => {
        it('should return user by email', async () => {
            userService.getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

            const response = await request(app).get('/users/employee/getByEmail?email=test@example.com');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: '1', email: 'test@example.com' });
        });

        it('should return 400 if email is missing', async () => {
            const response = await request(app).get('/users/employee/getByEmail');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Email is required' });
        });

        it('should return 404 if user is not found', async () => {
            userService.getUserByEmail.mockRejectedValue(new Error('User not found'));

            const response = await request(app).get('/users/employee/getByEmail?email=notfound@example.com');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });
    });

    describe('GET /users/api/filter', () => {
        it('should return filtered users', async () => {
            userService.filterUsers.mockResolvedValue([[], 0]);

            const response = await request(app)
                .get('/users/api/filter?roleName=admin&keyword=test');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Users filtered successfully',
                users: [],
                total: 0,
                page: 1,
                limit: 10,
            });
        });
    });
});
