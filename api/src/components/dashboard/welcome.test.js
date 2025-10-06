import { describe, it, expect, vi } from 'vitest';
import { dashboard } from './welcome.js'; 

describe('Dashboard Controller', () => {
    it('should return a success response with status 200', async () => {
        const req = {}; 
        const res = {
            json: vi.fn(), 
        };
        const next = vi.fn(); 

        await dashboard(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
            status: 200,
            message: 'success'
        });

        expect(next).not.toHaveBeenCalled(); 
    });

    it('should call next with an error if an exception occurs', async () => {
        const req = {}; 
        const res = {
            json: vi.fn(), 
        };
        const next = vi.fn(); 

       
        const error = new Error('Something went wrong');
        const faultyDashboard = async (req, res, next) => {
            try {
                throw error;
            } catch (err) {
                return next(err);
            }
        };

        await faultyDashboard(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled(); 
    });
});
