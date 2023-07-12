const fetch = require('node-fetch');

async function query(title, db) {
  const data = { inputs: title };
	const response = await fetch(
		"https://api-inference.huggingface.co/models/prompthero/openjourney",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.arrayBuffer();
	return Buffer.from(result);
}
module.exports = query