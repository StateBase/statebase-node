# StateBase TypeScript SDK

Official TypeScript/JavaScript SDK for [StateBase](https://statebase.org) - AI Agent State & Memory Infrastructure.

## Installation

```bash
npm install statebase-sdk
# or
yarn add statebase-sdk
```

## Quick Start

```typescript
import StateBase from 'statebase-sdk';

// Initialize client
const client = new StateBase('your-api-key');

// Create a session
const session = await client.createSession({
  agent_id: 'my-agent',
  initial_state: { user_name: 'Alice' }
});

// Create a turn
const turn = await client.createTurn(session.id, {
  input: { type: 'text', content: 'Hello!' },
  output: { type: 'text', content: 'Hi Alice! How can I help you today?' }
});

// Update state
await client.updateState(session.id, {
  updates: { last_greeting: 'Hello' }
});

// Create a memory
const memory = await client.createMemory({
  content: 'User prefers morning meetings',
  memory_type: 'preference',
  session_id: session.id,
  tags: ['scheduling', 'preferences']
});

// Search memories
const results = await client.searchMemories('meeting preferences', {
  session_id: session.id
});
```

## JavaScript (CommonJS)

```javascript
const StateBase = require('statebase-sdk').default;

const client = new StateBase('your-api-key');

client.createSession({
  agent_id: 'my-agent'
}).then(session => {
  console.log('Session created:', session.id);
});
```

## Features

- **Full TypeScript support** with type definitions
- **Sessions**: Manage conversation contexts
- **Turns**: Record agent interactions
- **State**: Persistent state management
- **Memory**: Semantic memory storage and search
- **Promise-based** async API

## Documentation

Visit [docs.statebase.org](https://docs.statebase.org) for complete documentation.

## License

MIT
