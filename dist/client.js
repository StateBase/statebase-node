"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateBase = void 0;
const axios_1 = __importDefault(require("axios"));
class StateBase {
    constructor(config) {
        this.client = axios_1.default.create({
            baseURL: config.baseUrl || 'https://api.statebase.org',
            headers: {
                'X-API-Key': config.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }
    // --- Sessions ---
    async createSession(agentId, options) {
        const payload = {
            agent_id: agentId,
            metadata: options?.metadata,
            initial_state: options?.initialState,
            ttl_seconds: options?.ttlSeconds
        };
        const res = await this.client.post('/v1/sessions', payload);
        return res.data;
    }
    async getSession(sessionId) {
        const res = await this.client.get(`/v1/sessions/${sessionId}`);
        return res.data;
    }
    // --- Turns ---
    async createTurn(sessionId, input, output, options) {
        const payload = {
            input: { type: 'text', content: input },
            output: { type: 'text', content: output },
            metadata: options?.metadata,
            reasoning: options?.reasoning
        };
        const res = await this.client.post(`/v1/sessions/${sessionId}/turns`, payload);
        return res.data;
    }
    // --- Memories ---
    async createMemory(sessionId, content, type = 'general') {
        const payload = {
            session_id: sessionId,
            content,
            type
        };
        const res = await this.client.post('/v1/memories', payload);
        return res.data;
    }
    async searchMemories(query, sessionId) {
        const params = { query };
        if (sessionId)
            params.session_id = sessionId;
        const res = await this.client.get('/v1/memories/search', { params });
        return res.data;
    }
}
exports.StateBase = StateBase;
