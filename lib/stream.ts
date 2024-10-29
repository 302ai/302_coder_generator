export async function* readStream(response: ReadableStream) {
  let reader = response.pipeThrough(new TextDecoderStream()).getReader()
  let done = false

  while (!done) {
    let { value, done: streamDone } = await reader.read();
    done = streamDone;

    if (value) yield value;
  }

  reader.releaseLock();
}
