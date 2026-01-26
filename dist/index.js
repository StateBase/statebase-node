"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateBase = void 0;
const axios_1 = __importDefault(require("axios"));
class StateBase {
    constructor(apiKey, baseURL = 'https://api.statebase.org', timeout = 30000) {
        this.client = axios_1.default.create({
            baseURL,
            timeout,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }
    // Sessions
    async createSession(request) {
        const { data } = await this.client.post('/v1/sessions', request);
        return data;
    }
    async getSession(sessionId) {
        const { data } = await this.client.get(`/v1/sessions/${sessionId}`);
        return data;
    }
    async deleteSession(sessionId) {
        await this.client.delete(`/v1/sessions/${sessionId}`);
    }
    // Turns
    async createTurn(sessionId, request) {
        const { data } = await this.client.post(`/v1/sessions/${sessionId}/turns`, request);
        return data;
    }
    // State
    async getState(sessionId) {
        const { data } = await this.client.get(`/v1/sessions/${sessionId}/state`);
        return data;
    }
    async updateState(sessionId, request) {
        const { data } = await this.client.patch(`/v1/sessions/${sessionId}/state`, request);
        return data;
    }
    async replaceState(sessionId, request) {
        const { data } = await this.client.put(`/v1/sessions/${sessionId}/state`, request);
        return data;
    }
    // Memories
    async createMemory(request) {
        const { data } = await this.client.post('/v1/memories', request);
        return data;
    }
    async searchMemories(query, options) {
        const { data } = await this.client.get('/v1/memories/search', {
            params: {
                query,
                ...options,
            },
        });
        return data.data;
    }
    // Health
    async health() {
        const { data } = await this.client.get('/health');
        return data;
    }
}
exports.StateBase = StateBase;
exports.default = StateBase;
