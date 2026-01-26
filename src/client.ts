import axios, { AxiosInstance } from 'axios';

export interface StateBaseConfig {
    apiKey: string;
    baseUrl?: string;
}

export class StateBase {
    private client: AxiosInstance;

    constructor(config: StateBaseConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://api.statebase.org',
            headers: {
                'X-API-Key': config.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    // --- Sessions ---
    async createSession(agentId: string, options?: { metadata?: any; initialState?: any; ttlSeconds?: number }) {
        const payload = {
            agent_id: agentId,
            metadata: options?.metadata,
            initial_state: options?.initialState,
            ttl_seconds: options?.ttlSeconds
        };
        const res = await this.client.post('/v1/sessions', payload);
        return res.data;
    }

    async getSession(sessionId: string) {
        const res = await this.client.get(`/v1/sessions/${sessionId}`);
        return res.data;
    }

    // --- Turns ---
    async createTurn(sessionId: string, input: string, output: string, options?: { metadata?: any; reasoning?: string }) {
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
    async createMemory(sessionId: string, content: string, type: string = 'general') {
        const payload = {
            session_id: sessionId,
            content,
            type
        };
        const res = await this.client.post('/v1/memories', payload);
        return res.data;
    }

    async searchMemories(query: string, sessionId?: string) {
        const params: any = { query };
        if (sessionId) params.session_id = sessionId;
        const res = await this.client.get('/v1/memories/search', { params });
        return res.data;
    }
}
