const { z } = require('zod');
const schema = z.object({ title: z.string() });
const parsed = schema.safeParse({});
console.log('success:', parsed.success);
console.log('error:', parsed.error);
console.log('errors:', parsed.error ? parsed.error.errors : 'N/A');
console.log('issues:', parsed.error ? parsed.error.issues : 'N/A');
