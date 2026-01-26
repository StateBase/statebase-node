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
    memory_type?: string;
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
    updates: Record<string, any>;
    reasoning?: string;
}
export interface StateReplaceRequest {
    state: Record<string, any>;
    reasoning?: string;
}
export declare class StateBase {
    private client;
    constructor(apiKey: string, baseURL?: string, timeout?: number);
    createSession(request: SessionCreateRequest): Promise<SessionResponse>;
    getSession(sessionId: string): Promise<SessionResponse>;
    deleteSession(sessionId: string): Promise<void>;
    createTurn(sessionId: string, request: TurnCreateRequest): Promise<TurnResponse>;
    getState(sessionId: string): Promise<Record<string, any>>;
    updateState(sessionId: string, request: StateUpdateRequest): Promise<Record<string, any>>;
    replaceState(sessionId: string, request: StateReplaceRequest): Promise<Record<string, any>>;
    createMemory(request: MemoryCreateRequest): Promise<MemoryResponse>;
    searchMemories(query: string, options?: {
        session_id?: string;
        memory_type?: string;
        limit?: number;
    }): Promise<MemoryResponse[]>;
    health(): Promise<Record<string, any>>;
}
export default StateBase;
