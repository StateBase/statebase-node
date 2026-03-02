import { StateBase } from '../src/index';

describe('StateBase TS SDK Basic Tests', () => {
    const API_KEY = 'sb_test_empty';
    const BASE_URL = 'https://api.statebase.org';

    it('should initialize correctly', () => {
        const sb = new StateBase(API_KEY, BASE_URL);
        expect(sb).toBeDefined();
        expect(sb.sessions).toBeDefined();
        expect(sb.memory).toBeDefined();
    });

    it('should have health method', async () => {
        const sb = new StateBase(API_KEY, BASE_URL);
        expect(typeof sb.health).toBe('function');
    });
});
