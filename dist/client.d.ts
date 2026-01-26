export interface StateBaseConfig {
    apiKey: string;
    baseUrl?: string;
}
export declare class StateBase {
    private client;
    constructor(config: StateBaseConfig);
    createSession(agentId: string, options?: {
        metadata?: any;
        initialState?: any;
        ttlSeconds?: number;
    }): Promise<any>;
    getSession(sessionId: string): Promise<any>;
    createTurn(sessionId: string, input: string, output: string, options?: {
        metadata?: any;
        reasoning?: string;
    }): Promise<any>;
    createMemory(sessionId: string, content: string, type?: string): Promise<any>;
    searchMemories(query: string, sessionId?: string): Promise<any>;
}
