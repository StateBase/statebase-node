# StateBase TypeScript SDK

Official TypeScript/JavaScript SDK for [StateBase](https://statebase.org) - The Reliability Layer for Production AI Agents.

[![npm version](https://badge.fury.io/js/statebase-sdk.svg)](https://badge.fury.io/js/statebase-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Installation

```bash
npm install statebase-sdk
# or
yarn add statebase-sdk
```

## 🚀 Quick Start

### API Key
Get your API key regarding your instance or from [statebase.org](https://statebase.org).

### Usage

```typescript
import { StateBase } from 'statebase-sdk';

// 1. Initialize client with Config object
const client = new StateBase({
    apiKey: 'sb_live_...'
});

async function main() {
    // 2. Create a Session (Agent ID is first arg)
    const session = await client.createSession('support-agent-v1', {
        initialState: { 
            status: 'active',
            user_preference: 'unknown'
        }
    });
    console.log(`Session Created: ${session.id}`);

    // 3. Add Long-term Memory
    await client.createMemory(
        session.id, 
        'User prefers dark mode UI', 
        'preference' // type
    );

    // 4. Log a Turn
    await client.createTurn(
        session.id,
        'How do I switch themes?', // input
        'You can toggle dark mode in settings.', // output
        { 
            metadata: { model: 'gpt-4' } 
        }
    );

    // 5. Search Memories
    const memories = await client.searchMemories(
        'theme preference', 
        session.id
    );
    console.log('Found memory:', memories[0]);
}

main();
```

## 🛠 Features

- **Strict Typing**: Full TypeScript definitions included.
- **Persistent Memory**: Vector-embedded memory storage.
- **State Management**: Reliable state tracking.
- **Observability**: Complete trace logging.
- **Zero Config**: Works with any JS framework (Node.js, Next.js, etc).

## 📚 Documentation

Visit [docs.statebase.org](https://docs.statebase.org) for full API docs.

## 📄 License

MIT
