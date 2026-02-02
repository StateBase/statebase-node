<div align="center">

# StateBase TypeScript SDK

**Official TypeScript/JavaScript client for StateBase API**

[![npm version](https://badge.fury.io/js/statebase.svg)](https://badge.fury.io/js/statebase)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[Documentation](https://docs.statebase.org/typescript) • [API Reference](https://docs.statebase.org/api) • [Examples](./examples) • [Changelog](./CHANGELOG.md)

</div>

---

## Installation

```bash
# npm
npm install statebase

# yarn
yarn add statebase

# pnpm
pnpm add statebase
```

### Requirements

- Node.js 16 or higher
- TypeScript 5.0+ (for TypeScript projects)

---

## Quick Start

```typescript
import { StateBase } from 'statebase';

// Initialize client
const sb = new StateBase({ apiKey: 'sb_live_xxxxxxxx' });

// Create a session
const session = await sb.sessions.create({
  agentId: 'customer-support',
  initialState: { status: 'new', userId: 'user_123' }
});

// Update state
await sb.sessions.updateState({
  sessionId: session.id,
  state: { status: 'in_progress' },
  reasoning: 'User provided ticket details'
});

// Add a conversation turn
const turn = await sb.sessions.addTurn({
  sessionId: session.id,
  input: "My order hasn't arrived",
  output: "I'll help you track your order. Can you provide the order number?"
});

// Search memories
const memories = await sb.memory.search({
  query: 'user communication preferences',
  sessionId: session.id
});

// Rollback if needed
await sb.sessions.rollback({
  sessionId: session.id,
  version: -1,
  reason: 'Agent made an error'
});
```

---

## Features

### ✅ Complete API Coverage

- Sessions (create, read, update, delete)
- State management with versioning
- Conversation turns
- Semantic memory (add, search)
- Decision traces
- Instant rollback

### ✅ Developer-Friendly

- Full TypeScript support with type definitions
- Promise-based async/await API
- Comprehensive error handling
- Automatic retries with exponential backoff
- Request/response interceptors

### ✅ Production-Ready

- Connection pooling
- Timeout configuration
- Rate limit handling
- Browser and Node.js support

---

## Usage

### Authentication

```typescript
import { StateBase } from 'statebase';

// Option 1: Pass API key directly
const sb = new StateBase({ apiKey: 'sb_live_xxxxxxxx' });

// Option 2: Use environment variable
// Set STATEBASE_API_KEY in your environment
const sb = new StateBase();

// Option 3: Custom configuration
const sb = new StateBase({
  apiKey: 'your_key',
  baseUrl: 'https://your-instance.com',
  timeout: 30000, // 30 seconds
  maxRetries: 3
});
```

### Sessions

```typescript
// Create session
const session = await sb.sessions.create({
  agentId: 'support-bot',
  initialState: { user: 'alice' },
  ttlSeconds: 86400 // 24 hours
});

// Get session
const session = await sb.sessions.get({ sessionId: 'sess_abc123' });

// Update state
await sb.sessions.updateState({
  sessionId: 'sess_abc123',
  state: { step: 'collect_info' },
  reasoning: 'Moved to next step'
});

// Delete session
await sb.sessions.delete({ sessionId: 'sess_abc123' });

// List sessions
const sessions = await sb.sessions.list({
  agentId: 'support-bot',
  limit: 10
});
```

### Conversation Turns

```typescript
// Add turn
const turn = await sb.sessions.addTurn({
  sessionId: 'sess_abc123',
  input: "What's my order status?",
  output: 'Your order #12345 is out for delivery',
  metadata: { model: 'gpt-4', tokens: 150 }
});

// Get turn history
const turns = await sb.sessions.getTurns({
  sessionId: 'sess_abc123',
  limit: 20
});
```

### Memory

```typescript
// Add memory
const memory = await sb.memory.add({
  sessionId: 'sess_abc123',
  content: 'User prefers email over SMS',
  type: 'preference',
  tags: ['communication', 'preference']
});

// Search memories
const results = await sb.memory.search({
  query: 'how does user want to be contacted?',
  sessionId: 'sess_abc123',
  topK: 5,
  threshold: 0.7
});

// Get memory by ID
const memory = await sb.memory.get({ memoryId: 'mem_xyz789' });

// Delete memory
await sb.memory.delete({ memoryId: 'mem_xyz789' });
```

### Rollback

```typescript
// Rollback to previous version
await sb.sessions.rollback({
  sessionId: 'sess_abc123',
  version: -1, // or specific version number like 5
  reason: 'Agent hallucinated'
});

// Rollback to specific version
await sb.sessions.rollback({
  sessionId: 'sess_abc123',
  version: 3,
  reason: 'Revert to known good state'
});
```

### Traces

```typescript
// List traces for a session
const traces = await sb.traces.list({
  sessionId: 'sess_abc123',
  limit: 100
});

// Get specific trace
const trace = await sb.traces.get({ traceId: 'trace_123' });

// Filter traces by action
const traces = await sb.traces.list({
  sessionId: 'sess_abc123',
  action: 'state_update'
});
```

---

## Advanced Usage

### Error Handling

```typescript
import { StateBase, StateBaseError } from 'statebase';

const sb = new StateBase({ apiKey: 'your_key' });

try {
  const session = await sb.sessions.create({ agentId: 'bot' });
} catch (error) {
  if (error instanceof StateBaseError) {
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Details:`, error.details);
  }
}
```

### Custom Configuration

```typescript
const sb = new StateBase({
  apiKey: 'your_key',
  baseUrl: 'https://api.statebase.org',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  enableLogging: true
});
```

### Request Interceptors

```typescript
sb.interceptors.request.use((config) => {
  // Add custom headers
  config.headers['X-Custom-Header'] = 'value';
  return config;
});

sb.interceptors.response.use(
  (response) => {
    // Handle successful response
    return response;
  },
  (error) => {
    // Handle error
    console.error('Request failed:', error);
    throw error;
  }
);
```

---

## Integration Examples

### With Next.js (App Router)

```typescript
// app/api/chat/route.ts
import { StateBase } from 'statebase';
import { NextRequest, NextResponse } from 'next/server';

const sb = new StateBase({ apiKey: process.env.STATEBASE_API_KEY });

export async function POST(request: NextRequest) {
  const { message, sessionId } = await request.json();

  // Add turn
  const turn = await sb.sessions.addTurn({
    sessionId,
    input: message,
    output: '' // Will update after LLM response
  });

  // Your LLM logic here
  const response = await callLLM(message);

  // Update state
  await sb.sessions.updateState({
    sessionId,
    state: { lastResponse: response }
  });

  return NextResponse.json({ response });
}
```

### With Express.js

```typescript
import express from 'express';
import { StateBase } from 'statebase';

const app = express();
const sb = new StateBase({ apiKey: process.env.STATEBASE_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    // Get context
    const turns = await sb.sessions.getTurns({ sessionId, limit: 10 });

    // Your agent logic
    const response = await processMessage(message, turns);

    // Save turn
    await sb.sessions.addTurn({
      sessionId,
      input: message,
      output: response
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### With LangChain.js

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { StateBase } from 'statebase';

const sb = new StateBase({ apiKey: 'your_key' });
const llm = new ChatOpenAI();

// Create session
const session = await sb.sessions.create({ agentId: 'langchain-bot' });

async function chat(message: string) {
  // Get context from StateBase
  const turns = await sb.sessions.getTurns({ sessionId: session.id, limit: 10 });
  const context = turns.map(t => `User: ${t.input}\nBot: ${t.output}`).join('\n');

  // Call LLM
  const response = await llm.predict(`${context}\nUser: ${message}\nBot:`);

  // Save turn
  await sb.sessions.addTurn({
    sessionId: session.id,
    input: message,
    output: response
  });

  return response;
}
```

### With Vercel AI SDK

```typescript
import { StateBase } from 'statebase';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

const sb = new StateBase({ apiKey: process.env.STATEBASE_API_KEY });
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  // Get context from StateBase
  const context = await sb.sessions.get({ sessionId });

  // Stream response
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: `Context: ${JSON.stringify(context.state)}` },
      ...messages
    ]
  });

  const stream = OpenAIStream(response, {
    onCompletion: async (completion) => {
      // Save turn after streaming completes
      await sb.sessions.addTurn({
        sessionId,
        input: messages[messages.length - 1].content,
        output: completion
      });
    }
  });

  return new StreamingTextResponse(stream);
}
```

---

## API Reference

### Client

```typescript
class StateBase {
  constructor(config?: {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    enableLogging?: boolean;
  });
}
```

### Sessions

```typescript
sb.sessions.create(params: { agentId: string; initialState?: object; ttlSeconds?: number }): Promise<Session>
sb.sessions.get(params: { sessionId: string }): Promise<Session>
sb.sessions.updateState(params: { sessionId: string; state: object; reasoning?: string }): Promise<Session>
sb.sessions.delete(params: { sessionId: string }): Promise<void>
sb.sessions.list(params?: { agentId?: string; limit?: number }): Promise<Session[]>
sb.sessions.addTurn(params: { sessionId: string; input: string; output: string; metadata?: object }): Promise<Turn>
sb.sessions.getTurns(params: { sessionId: string; limit?: number }): Promise<Turn[]>
sb.sessions.rollback(params: { sessionId: string; version: number; reason?: string }): Promise<Session>
```

### Memory

```typescript
sb.memory.add(params: { sessionId: string; content: string; type?: string; tags?: string[] }): Promise<Memory>
sb.memory.search(params: { query: string; sessionId?: string; topK?: number; threshold?: number }): Promise<Memory[]>
sb.memory.get(params: { memoryId: string }): Promise<Memory>
sb.memory.delete(params: { memoryId: string }): Promise<void>
```

### Traces

```typescript
sb.traces.list(params: { sessionId: string; limit?: number; action?: string }): Promise<Trace[]>
sb.traces.get(params: { traceId: string }): Promise<Trace>
```

---

## TypeScript Types

```typescript
interface Session {
  id: string;
  agentId: string;
  state: object;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Turn {
  id: string;
  sessionId: string;
  input: string;
  output: string;
  metadata?: object;
  createdAt: string;
}

interface Memory {
  id: string;
  sessionId: string;
  content: string;
  type: string;
  tags: string[];
  score?: number;
  createdAt: string;
}

interface Trace {
  id: string;
  sessionId: string;
  action: string;
  timestamp: string;
  details: object;
}
```

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/StateBase/statebase-node.git
cd statebase-node

# Install dependencies
npm install

# Build
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- sessions.test.ts
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

---

## Support

- **Documentation**: [docs.statebase.org/typescript](https://docs.statebase.org/typescript)
- **Issues**: [GitHub Issues](https://github.com/StateBase/statebase-node/issues)
- **Discord**: [discord.gg/statebase](https://discord.gg/statebase)
- **Email**: support@statebase.org

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

<div align="center">

**[StateBase](https://statebase.org)** • **[Documentation](https://docs.statebase.org)** • **[API Reference](https://docs.statebase.org/api)**

</div>
