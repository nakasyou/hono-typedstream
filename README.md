<img height="300" align="right" alt="image" src="https://github.com/user-attachments/assets/fcff202f-79bf-4028-a54e-5f5e8f9e3e4c" />

# hono-typedstream

`hono-typedstream` is a lightweight helper that lets Hono handlers stream JSON values line by line while keeping end-to-end TypeScript safety. The server utility turns a `ReadableStream` or `AsyncGenerator` into a Hono response, and the client utilities reconstruct each JSON line as typed objects.

## Features

- **Type-safe streaming**: Share the same generic type between server and client thanks to `TypedResponse` support.
- **Simple API surface**: Call `typedStream` on the server and `receiveTypedStream` on the client—no manual plumbing required.
- **Built for Hono**: Leverages `streamText`, works smoothly with `testClient`, and fits naturally into existing Hono apps.

## Installation

### npm

https://www.npmjs.com/packages/hono-typedstream

```
npm install hono-typedstream # npm
yarn add hono-typedstream # yarn
pnpm add hono-typedstream # pnpm
bun add hono-typedstream # bun
deno add npm:hono-typedstream # deno
```

### jsr

The package is published to [jsr.io/@ns/hono-typedstream](https://jsr.io/@ns/hono-typedstream).

```
npx jsr add @ns/hono-typedstream # npm
yarn add jsr:@ns/hono-typedstream # yarn
yarn add @ns/hono-typedstream@jsr:0.1.0 # yarn (alt)
yarn dlx jsr add @ns/hono-typedstream # yarn (older)
pnpm add jsr:@ns/hono-typedstream # pnpm
pnpm dlx jsr add @ns/hono-typedstream # pnpm (older)
bunx jsr add @ns/hono-typedstream # bun
deno add jsr:@ns/hono-typedstream # deno
```

```ts
import { typedStream } from 'hono-typedstream'
import { receiveTypedStream } from 'hono-typedstream/client'
```

## Usage

### Server: `typedStream`

`typedStream` accepts a `ReadableStream` or `AsyncGenerator`, serializes each chunk as JSON, and streams it to the client.

```ts
import { Hono } from 'hono'
import { typedStream } from 'hono-typedstream'

const app = new Hono()

app.get('/events', c =>
  typedStream(c, async function* () {
    yield { message: 'Hello' }
    yield { message: 'World' }
  })
)

// You can provide a ReadableStream directly
app.get('/numbers', c => {
  const stream = new ReadableStream<number>({
    start(controller) {
      for (let i = 0; i < 5; i++) controller.enqueue(i)
      controller.close()
    },
  })
  return typedStream(c, stream)
})

export type AppType = typeof app
```

### Client: `receiveTypedStream`

```ts
import { hc } from 'hono/client'
import { receiveTypedStream } from 'hono-typedstream/client'
import type { AppType } from './server.ts'

const client = hc<AppType>('/')

const res = await client.events.$get()

for await (const chunk of receiveTypedStream(res)) {
  console.log(chunk.message)
}
```
