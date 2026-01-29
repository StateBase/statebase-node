import axios, { AxiosInstance } from 'axios';

export interface SessionCreateRequest {
    agent_id: string;
    metadata?: Record<string, any>;
    initial_state?: Record<string, any>;
    ttl_seconds?: number;
}

export interface SessionResponse {
    object: 'session';
    id: string;
    agent_id: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
    state: Record<string, any>;
    memory_count: number;
    turn_count: number;
    ttl_expires_at?: string;
}

export interface TurnInput {
    type: string;
    content: string;
}

export interface TurnOutput {
    type: string;
    content: string;
}

export interface TurnCreateRequest {
    input: TurnInput;
    output: TurnOutput;
    metadata?: Record<string, any>;
    reasoning?: string;
}

export interface TurnResponse {
    object: 'turn';
    id: string;
    session_id: string;
    turn_number: number;
    input: TurnInput;
    output: TurnOutput;
    metadata?: Record<string, any>;
    reasoning?: string;
    state_before: Record<string, any>;
    state_after: Record<string, any>;
    created_at: string;
}

export interface MemoryCreateRequest {
    content: string;
    type?: string;
    session_id?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface MemoryResponse {
    object: 'memory';
    id: string;
    content: string;
    memory_type: string;
    session_id?: string;
    tags: string[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface StateUpdateRequest {
    state: Record<string, any>;
    reasoning?: string;
}

export interface StateReplaceRequest {
    state: Record<string, any>;
    reasoning?: string;
}

export class StateBase {
    private client: AxiosInstance;

    constructor(
        apiKey: string,
        baseURL: string = 'https://api.statebase.org',
        timeout: number = 30000
    ) {
        this.client = axios.create({
            baseURL,
            timeout,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    // Sessions
    async createSession(request: SessionCreateRequest): Promise<SessionResponse> {
        const { data } = await this.client.post<SessionResponse>('/v1/sessions', request);
        return data;
    }

    async getSession(sessionId: string): Promise<SessionResponse> {
        const { data } = await this.client.get<SessionResponse>(`/v1/sessions/${sessionId}`);
        return data;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await this.client.delete(`/v1/sessions/${sessionId}`);
    }

    // Turns
    async createTurn(sessionId: string, request: TurnCreateRequest): Promise<TurnResponse> {
        const { data } = await this.client.post<TurnResponse>(
            `/v1/sessions/${sessionId}/turns`,
            request
        );
        return data;
    }

    // State
    async getState(sessionId: string): Promise<Record<string, any>> {
        const { data } = await this.client.get(`/v1/sessions/${sessionId}/state`);
        return data;
    }

    async updateState(sessionId: string, request: StateUpdateRequest): Promise<Record<string, any>> {
        const { data } = await this.client.patch(`/v1/sessions/${sessionId}/state`, request);
        return data;
    }

    async replaceState(sessionId: string, request: StateReplaceRequest): Promise<Record<string, any>> {
        const { data } = await this.client.put(`/v1/sessions/${sessionId}/state`, request);
        return data;
    }

    // Memories
    async createMemory(request: MemoryCreateRequest): Promise<MemoryResponse> {
        const { data } = await this.client.post<MemoryResponse>('/v1/memories', request);
        return data;
    }

    async searchMemories(
        query: string,
        options?: {
            session_id?: string;
            type?: string;
            limit?: number;
        }
    ): Promise<MemoryResponse[]> {
        const { data } = await this.client.get<{ data: MemoryResponse[] }>('/v1/memories/search', {
            params: {
                query,
                ...options,
            },
        });
        return data.data;
    }

    // Health
    async health(): Promise<Record<string, any>> {
        const { data } = await this.client.get('/health');
        return data;
    }
}

export default StateBase;
