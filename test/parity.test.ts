import { StateBase } from '../src/index';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from statebase-test
dotenv.config({ path: path.join(__dirname, '../../statebase-test/.env') });

const API_KEY = process.env.STATEBASE_API_KEY || '';
const BASE_URL = process.env.STATEBASE_API_URL || 'https://api.statebase.org';

async function runTest() {
    console.log('--- StateBase TS SDK Parity Test ---');
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

        // 2. Sessions.create
        const session = await sb.sessions.create({
            agent_id: 'ts-parity-test',
            initial_state: { status: 'testing' }
        });
        console.log('[+] Created Session:', session.id);

        // 3. Sessions.addTurn
        const turn = await sb.sessions.addTurn(session.id, {
            input: 'Parity check',
            output: 'Logic synced'
        });
        console.log('[+] Added Turn:', turn.id);

        // 4. Sessions.getContext
        const context = await sb.sessions.getContext(session.id, { query: 'parity' });
        console.log('[+] Context state status:', context.state.status);

        // 5. Memory.add
        const memory = await sb.memory.add({
            session_id: session.id,
            content: 'TS SDK and Python SDK are now twins.',
            type: 'fact'
        });
        console.log('[+] Created Memory:', memory.id);

        // 6. Memory.search
        console.log('Waiting for embedding...');
        await new Promise(r => setTimeout(r, 2000));
        const searchResults = await sb.memory.search('twins');
        console.log('[+] Search found:', searchResults.length, 'results');

        // 7. Cleanup
        await sb.sessions.delete(session.id);
        console.log('[+] Cleaned up session');

        console.log('\n--- PARITY TESTS PASSED ---');
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
