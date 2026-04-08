const { TextDecoder, TextEncoder, ReadableStream, WritableStream, TransformStream, MessageChannel, MessagePort } = require('node:worker_threads');
const streams = require('node:stream/web');

if (!global.TextDecoder) global.TextDecoder = TextDecoder;
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.ReadableStream) global.ReadableStream = streams.ReadableStream;
if (!global.WritableStream) global.WritableStream = streams.WritableStream;
if (!global.TransformStream) global.TransformStream = streams.TransformStream;
if (!global.MessagePort) global.MessagePort = MessagePort;
if (!global.MessageChannel) global.MessageChannel = MessageChannel;
