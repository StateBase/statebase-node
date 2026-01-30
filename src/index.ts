import axios, { AxiosInstance } from 'axios';

/**
 * StateBase TypeScript SDK
 * The Reliability Layer for Production AI Agents
 */

// --- Interfaces & Models ---

export interface SessionCreateRequest {
    agent_id: string;
    user_id?: string;
    metadata?: Record<string, any>;
    initial_state?: Record<string, any>;
    ttl_seconds?: number;
}

export interface SessionResponse {
    object: 'session';
    id: string;
    agent_id: string;
    user_id?: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
    state: Record<string, any>;
    memory_count: number;
    turn_count: number;
    ttl_expires_at?: string;
}

export interface TurnInput {
    type: 'text' | 'image' | 'tool_call' | string;
    content: string;
}

export interface TurnOutput {
    type: 'text' | 'image' | 'tool_result' | string;
    content: string;
}

export interface TurnCreateRequest {
    input: TurnInput | string;
    output: TurnOutput | string;
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
    state_before?: Record<string, any>;
    state_after?: Record<string, any>;
    created_at: string;
}

export interface MemoryCreateRequest {
    content: string;
    type?: string;
    session_id: string;
    tags?: string[];
    metadata?: Record<string, any>;
    embed?: boolean;
}

export interface MemoryResponse {
    object: 'memory';
    id: string;
    content: string;
    type: string;
    session_id: string;
    tags: string[] | null;
    metadata: Record<string, any> | null;
    embedding_id: string | null;
    vector_available: boolean;
    created_at: string;
}

export interface MemorySearchResult {
    id: string;
    session_id: string;
    content: string;
    type: string;
    score: number;
}

export interface MemorySearchResponse {
    data: MemorySearchResult[];
    query: string;
}

export interface ContextRequest {
    query?: string;
    memory_limit?: number;
    turn_limit?: number;
}

export interface ContextResponse {
    state: Record<string, any>;
    memories: any[];
    recent_turns: any[];
}

export interface StateGetResponse {
    session_id: string;
    version: number;
    state: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface EntityCreateRequest {
    session_id: string;
    entity_type: string;
    entity_id: string;
    attributes: Record<string, any>;
}

export interface EntityResponse {
    object: 'entity';
    id: string;
    session_id: string;
    entity_type: string;
    entity_id: string;
    attributes: Record<string, any>;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface TraceResponse {
    object: 'trace';
    id: string;
    session_id: string;
    event_type: string;
    metadata: Record<string, any>;
    timestamp: string;
}

// --- Main Client ---

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

    // --- Sessions ---
    async createSession(request: SessionCreateRequest): Promise<SessionResponse> {
        const { data } = await this.client.post<SessionResponse>('/v1/sessions', request);
        return data;
    }

    async getSession(sessionId: string): Promise<SessionResponse> {
        const { data } = await this.client.get<SessionResponse>(`/v1/sessions/${sessionId}`);
        return data;
    }

    async listSessions(options?: { agent_id?: string; limit?: number; starting_after?: string }): Promise<{ data: SessionResponse[], has_more: boolean }> {
        const { data } = await this.client.get('/v1/sessions', { params: options });
        return data;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await this.client.delete(`/v1/sessions/${sessionId}`);
    }

    async getContext(sessionId: string, request?: ContextRequest): Promise<ContextResponse> {
        const { data } = await this.client.post<ContextResponse>(
            `/v1/sessions/${sessionId}/context`,
            request || {}
        );
        return data;
    }

    // --- Turns ---
    async createTurn(sessionId: string, request: TurnCreateRequest): Promise<TurnResponse> {
        // Handle string inputs for better DX
        const payload = { ...request };
        if (typeof payload.input === 'string') payload.input = { type: 'text', content: payload.input };
        if (typeof payload.output === 'string') payload.output = { type: 'text', content: payload.output };

        const { data } = await this.client.post<TurnResponse>(
            `/v1/sessions/${sessionId}/turns`,
            payload
        );
        return data;
    }

    async listTurns(sessionId: string, options?: { limit?: number, starting_after?: string }): Promise<{ data: TurnResponse[], has_more: boolean }> {
        const { data } = await this.client.get(`/v1/sessions/${sessionId}/turns`, { params: options });
        return data;
    }

    // --- State & Reliability ---
    async getState(sessionId: string): Promise<StateGetResponse> {
        const { data } = await this.client.get<StateGetResponse>(`/v1/sessions/${sessionId}/state`);
        return data;
    }

    async updateState(sessionId: string, state: Record<string, any>): Promise<StateGetResponse> {
        const { data } = await this.client.patch<StateGetResponse>(`/v1/sessions/${sessionId}/state`, { state });
        return data;
    }

    async rollbackState(sessionId: string, version: number): Promise<StateGetResponse> {
        const { data } = await this.client.post<StateGetResponse>(`/v1/sessions/${sessionId}/state/rollback`, { version });
        return data;
    }

    // --- Memories ---
    async createMemory(request: MemoryCreateRequest): Promise<MemoryResponse> {
        const { data } = await this.client.post<MemoryResponse>('/v1/memories', request);
        return data;
    }

    async searchMemories(
        query: string,
        options?: {
            session_id?: string;
            types?: string;
            tags?: string;
            limit?: number;
            threshold?: number;
        }
    ): Promise<MemorySearchResult[]> {
        const { data } = await this.client.get<MemorySearchResponse>('/v1/memories', {
            params: {
                query,
                top_k: options?.limit,
                ...options,
            },
        });
        return data.data;
    }

    // --- Entities ---
    async createEntity(request: EntityCreateRequest): Promise<EntityResponse> {
        const { data } = await this.client.post<EntityResponse>('/v1/entities', request);
        return data;
    }

    async getEntity(entityId: string): Promise<EntityResponse> {
        const { data } = await this.client.get<EntityResponse>(`/v1/entities/${entityId}`);
        return data;
    }

    // --- Traces ---
    async listTraces(options?: { session_id?: string; limit?: number }): Promise<{ data: TraceResponse[] }> {
        const { data } = await this.client.get('/v1/traces', { params: options });
        return data;
    }

    // --- Health ---
    async health(): Promise<any> {
        const { data } = await this.client.get('/health');
        return data;
    }
}

export default StateBase;
