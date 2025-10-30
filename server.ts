/**
 * Hono TypedStream Server Module for server-side usage.
 * @module
 */

import type { Context, TypedResponse } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { streamText } from 'hono/streaming'
import type { TYPED_STREAM_KEY } from './shared.ts'

/**
 * Creates a newline-delimited JSON response that can be consumed as a typed stream.
 * @param c Hono context carrying request-specific metadata.
 * @param streamable Readable stream or async generator that produces JSON-serializable chunks.
 * @returns Typed streaming response for Hono.
 * @example
 * const app = new Hono()
 * app.get('/events', c =>
 *   typedStream(c, async function* () {
 *     yield { type: 'tick', at: Date.now() }
 *   })
 * )
 */
export const typedStream = <C extends Context, T>(
  c: C,
  streamable: ReadableStream<T> | ((c: C) => AsyncGenerator<T, void, unknown>)
): Response & TypedResponse<T, StatusCode, TYPED_STREAM_KEY> => {
  return streamText(
    c,
    async cb => {
      const generator = typeof streamable === 'function' ? streamable(c) : streamable
      for await (const chunk of generator) {
        cb.writeln(JSON.stringify(chunk))
      }
    }
  ) as (Response & TypedResponse<T, StatusCode, TYPED_STREAM_KEY>)
}
