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

export interface ContextMemory {
    content: string;
    type: string;
    score: number;
}

export interface ContextTurn {
    role: 'user' | 'assistant';
    content: string;
}

export interface ContextResponse {
    state: Record<string, any>;
    memories: ContextMemory[];
    recent_turns: ContextTurn[];
}

export interface StateGetResponse {
    session_id: string;
    version: number;
    state: Record<string, any>;
    created_at?: string;
    updated_at: string;
}

// --- Namespaces ---

class SessionsNamespace {
    constructor(private client: AxiosInstance) { }

    /**
     * Creates a new agent session for storing state and memory.
     */
    async create(request: SessionCreateRequest): Promise<SessionResponse> {
        const { data } = await this.client.post<SessionResponse>('/v1/sessions', request);
        return data;
    }

    /**
     * Retrieves a session by its identifier.
     */
    async get(sessionId: string): Promise<SessionResponse> {
        const { data } = await this.client.get<SessionResponse>(`/v1/sessions/${sessionId}`);
        return data;
    }

    /**
     * Lists all sessions with optional filtering.
     */
    async list(options?: { agent_id?: string; limit?: number; starting_after?: string }): Promise<{ data: SessionResponse[], has_more: boolean }> {
        const { data } = await this.client.get('/v1/sessions', { params: options });
        return data;
    }

    /**
     * Deletes a session and all its associated data.
     */
    async delete(sessionId: string): Promise<void> {
        await this.client.delete(`/v1/sessions/${sessionId}`);
    }

    /**
     * Optimized call for agent prompts. Fetches State, Memories, and Turns in a single call.
     */
    async getContext(sessionId: string, request?: ContextRequest): Promise<ContextResponse> {
        const { data } = await this.client.post<ContextResponse>(
            `/v1/sessions/${sessionId}/context`,
            request || {}
        );
        return data;
    }

    /**
     * Adds an interaction turn to the session history.
     */
    async addTurn(sessionId: string, request: TurnCreateRequest): Promise<TurnResponse> {
        const payload = { ...request };
        if (typeof payload.input === 'string') payload.input = { type: 'text', content: payload.input };
        if (typeof payload.output === 'string') payload.output = { type: 'text', content: payload.output };

        const { data } = await this.client.post<TurnResponse>(
            `/v1/sessions/${sessionId}/turns`,
            payload
        );
        return data;
    }

    /**
     * Retrieves the turn history for a session.
     */
    async listTurns(sessionId: string, options?: { limit?: number, starting_after?: string }): Promise<{ data: TurnResponse[], has_more: boolean }> {
        const { data } = await this.client.get(`/v1/sessions/${sessionId}/turns`, { params: options });
        return data;
    }

    /**
     * Retrieves the current state of a session.
     */
    async getState(sessionId: string): Promise<StateGetResponse> {
        const { data } = await this.client.get<StateGetResponse>(`/v1/sessions/${sessionId}/state`);
        return data;
    }

    /**
     * Updates the session state.
     */
    async updateState(sessionId: string, state: Record<string, any>, reasoning?: string): Promise<StateGetResponse> {
        const { data } = await this.client.patch<StateGetResponse>(`/v1/sessions/${sessionId}/state`, { state, reasoning });
        return data;
    }

    /**
     * Reverts the session to a previous state version.
     */
    async rollback(sessionId: string, version: number): Promise<StateGetResponse> {
        const { data } = await this.client.post<StateGetResponse>(`/v1/sessions/${sessionId}/state/rollback`, { version });
        return data;
    }

    /**
     * Creates a new session from a specific version of an existing session.
     */
    async fork(sessionId: string, version?: number): Promise<SessionResponse> {
        const { data } = await this.client.post<SessionResponse>(`/v1/sessions/${sessionId}/fork`, { version });
        return data;
    }
}

class MemoryNamespace {
    constructor(private client: AxiosInstance) { }

    /**
     * Manually adds a memory fact to StateBase.
     */
    async add(request: MemoryCreateRequest): Promise<MemoryResponse> {
        const { data } = await this.client.post<MemoryResponse>('/v1/memories', request);
        return data;
    }

    /**
     * Performs a semantic search across memories.
     */
    async search(
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
}

// --- Main Client ---

export class StateBase {
    private client: AxiosInstance;
    public sessions: SessionsNamespace;
    public memory: MemoryNamespace;

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

        this.sessions = new SessionsNamespace(this.client);
        this.memory = new MemoryNamespace(this.client);
    }

    /**
     * Check if the API is reachable and healthy.
     */
    async health(): Promise<any> {
        const { data } = await this.client.get('/health');
        return data;
    }
}

export default StateBase;
