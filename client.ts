/**
 * Client Module to receive TypedStream responses.
 * @module
 */
import type { ClientResponse } from 'hono/client'
import type { StatusCode } from 'hono/utils/http-status'
import type { TYPED_STREAM_KEY } from './shared.ts'

/**
 * Splits a text stream into individual lines using newline delimiters.
 * @example
 * const readable = new ReadableStream({
 *   start(controller) {
 *     const encoder = new TextEncoder()
 *     controller.enqueue(encoder.encode('one\ntwo\n'))
 *     controller.close()
 *   }
 * })
 * const lines = readable
 *   .pipeThrough(new TextDecoderStream())
 *   .pipeThrough(new TextLineSplitterStream())
 * for await (const line of lines) {
 *   console.log(line) // "one", then "two"
 * }
 */
export class TextLineSplitterStream extends TransformStream<string, string> {
  constructor() {
    let buffer = ''
    super({
      transform(chunk, controller) {
        buffer += chunk
        let idx = buffer.indexOf('\n')
        while (idx !== -1) {
          const line = buffer.slice(0, idx)
          controller.enqueue(line.endsWith('\r') ? line.slice(0, -1) : line)
          buffer = buffer.slice(idx + 1)
          idx = buffer.indexOf('\n')
        }
      },
      flush(controller) {
        if (buffer) {
          controller.enqueue(buffer)
        }
      }
    })
  }
}

/**
 * Parses newline-delimited JSON chunks into strongly typed objects.
 * @example
 * const readable = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue(JSON.stringify({ ok: true }))
 *     controller.close()
 *   }
 * })
 * const objects = readable
 *   .pipeThrough(new JSONParserStream<{ ok: boolean }>())
 * for await (const result of objects) {
 *   console.log(result.ok) // true
 * }
 */
export class JSONParserStream<T> extends TransformStream<string, T> {
  constructor() {
    super({
      transform(chunk, controller) {
        try {
          const json = JSON.parse(chunk)
          controller.enqueue(json)
        } catch (error) {
          controller.error(error)
        }
      }
    })
  }
}

/**
 * Consumes a typed streaming response from the server and returns a readable JSON object stream.
 * @param res Response returned by the Hono client request.
 * @returns Readable stream of typed JSON objects.
 * @example
 * const res = await client.api.events.$get()
 * const dataStream = receiveTypedStream(res)
 * for await (const payload of dataStream) {
 *   console.log(payload.type)
 * }
 */
export const receiveTypedStream = <T>(
  res: ClientResponse<T, StatusCode, TYPED_STREAM_KEY>
) => {
  if (!res.body) {
    throw new Error('Response body is null')
  }
  const reader = res.body.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineSplitterStream())
    .pipeThrough(new JSONParserStream<T>())

  return reader
}
