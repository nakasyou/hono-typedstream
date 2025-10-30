import {
  JSONParserStream,
  receiveTypedStream,
  TextLineSplitterStream,
} from '@ns/hono-typedstream/client'
import { assertEquals } from '@std/assert'
import { Hono } from 'hono'
import { typedStream } from '@ns/hono-typedstream'
import { testClient } from 'hono/testing'

Deno.test('TextLineSplitterStream splits lines correctly', async () => {
  const source = new ReadableStream<string>({
    start(controller) {
      controller.enqueue('aa')
      controller.enqueue('bb\ncc\ndd')
      controller.enqueue('ee\naa\n')
      controller.close()
    },
  }).pipeThrough(new TextLineSplitterStream())

  assertEquals(await Array.fromAsync(source), ['aabb', 'cc', 'ddee', 'aa'])
})

Deno.test('JSONParserStream parses JSON correctly', async () => {
  const source = new ReadableStream<string>({
    start(controller) {
      controller.enqueue('{"key": "value1"}')
      controller.enqueue('{"key": "value2"}')
      controller.enqueue('{"key": "value3"}')
      controller.close()
    },
  }).pipeThrough(new JSONParserStream<{ key: string }>())

  assertEquals(await Array.fromAsync(source), [
    { key: 'value1' },
    { key: 'value2' },
    { key: 'value3' },
  ])
})

Deno.test('receiveTypedStream', async () => {
  const app = new Hono().get('/', (c) =>
    typedStream(c, async function* () {
      yield { message: 'Hello' }
      yield { message: 'World' }
    }))

  const res = await testClient<typeof app>(app).index.$get()

  const reader = receiveTypedStream(res)

  const results: Array<{ message: string }> = []
  for await (const chunk of reader) {
    results.push(chunk)
  }

  assertEquals(results, [
    { message: 'Hello' },
    { message: 'World' },
  ])
})
