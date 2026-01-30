import { StateBase } from './src/index';
import * as dotenv from 'dotenv';

// Load .env from the test folder or root
dotenv.config({ path: '../statebase-test/.env' });

const API_KEY = process.env.STATEBASE_API_KEY || '';
const BASE_URL = process.env.STATEBASE_API_URL || 'https://api.statebase.org';

async function runTest() {
    console.log('--- StateBase TS SDK Logic Test ---');
    console.log('URL:', BASE_URL);

    if (!API_KEY) {
        console.error('Error: STATEBASE_API_KEY not set');
        process.exit(1);
    }

    const sb = new StateBase(API_KEY, BASE_URL);

    try {
        // 1. Health
        const health = await sb.health();
        console.log('[+] Health:', health.status);

        // 2. Create Session
        const session = await sb.createSession({
            agent_id: 'ts-sdk-test',
            metadata: { runtime: 'node' },
            initial_state: { step: 0 }
        });
        console.log('[+] Created Session:', session.id);

        // 3. Add Turn
        const turn = await sb.createTurn(session.id, {
            input: 'Hello from TypeScript',
            output: 'Acknowledged',
            reasoning: 'Testing SDK DX'
        });
        console.log('[+] Added Turn:', turn.id);

        // 4. Update State
        const updated = await sb.updateState(session.id, { step: 1, last_tool: 'ts_sdk' });
        console.log('[+] Updated State. New version:', updated.version);

        // 5. Create Memory
        const memory = await sb.createMemory({
            session_id: session.id,
            content: 'TypeScript developers prefer strong typing and automation.',
            type: 'fact',
            tags: ['typescript', 'dx']
        });
        console.log('[+] Created Memory:', memory.id);

        // 6. Search Memory
        console.log('Waiting for embedding...');
        await new Promise(r => setTimeout(r, 2000));
        const searchResults = await sb.searchMemories('How do TS devs feel about typing?');
        console.log('[+] Search found:', searchResults.length, 'results');
        if (searchResults.length > 0) {
            console.log('    Top match score:', searchResults[0].score);
        }

        // 7. Get Context
        const context = await sb.getContext(session.id, { query: 'dev preferences' });
        console.log('[+] Context retrieved. Memory count:', context.memories.length);

        console.log('\n--- ALL TESTS PASSED ---');
    } catch (error: any) {
        console.error('\n[X] TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runTest();
