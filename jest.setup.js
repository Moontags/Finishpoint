// Polyfill ReadableStream/WritableStream for undici and Next.js API route tests
try {
	const streams = require('web-streams-polyfill/ponyfill');
	if (!global.ReadableStream) global.ReadableStream = streams.ReadableStream;
	if (!global.WritableStream) global.WritableStream = streams.WritableStream;
	if (!global.TransformStream) global.TransformStream = streams.TransformStream;
} catch {}
// Polyfill TextDecoder/TextEncoder for undici and Next.js API route tests
try {
	const { TextDecoder, TextEncoder } = require('util');
	if (!global.TextDecoder) global.TextDecoder = TextDecoder;
	if (!global.TextEncoder) global.TextEncoder = TextEncoder;
} catch {}
require('@testing-library/jest-dom');
jest.mock('next/router', () => require('next-router-mock'));
