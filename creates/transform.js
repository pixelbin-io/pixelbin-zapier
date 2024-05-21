const sample = require("../samples/sample_issue");

const perform = async (z, bundle) => {
	const response = await z.request({
		url: `https://api.pixelbinz0.de/service/platform/assets/v1.0/upload/url`,
		method: "POST",
		headers: {
			accept: "application/json",
			"Content-Type": "application/json",
			// Add more headers as required
		},
		body: JSON.stringify({
			url: bundle.inputData.url,
			path: "/__zapier_Transfomation",
			tags: bundle.inputData.tags,
			// Assuming filename is static as per your example
			access: "public-read", // Assuming access is static as per your example
			metadata: {}, // Assuming metadata is empty as per your example
			overwrite: true, // Use provided value or default to false
			filenameOverride: true,
		}),
	});

	url = response.data.url;
	let replacement = bundle.inputData.transformationString;
	url = url.replace("original", replacement);
	return { url: url };
};

module.exports = {
	key: "transform",
	noun: "transform",

	display: {
		label: "Transform Resource",
		description: "Creates a PixeBin.io URL of the transformed resource.",
	},

	operation: {
		perform,
		inputFields: [
			{
				key: "url",
				required: true,
				type: "string",
				helpText: "URL of the image to upload.",
			},
			// {
			// 	key: "path",
			// 	required: true,
			// 	type: "string",
			// 	helpText: "Path where the image will be stored.",
			// },
			{
				key: "transformationString",
				label: "Tranformation String",
				required: true,
				type: "string",
				helpText:
					"Transformations to be applied as per given string e.g t.resize(w:128,h:128)\n.You can visit [Here](https://www.pixelbin.io/docs/transformations/) to see all available options for transformations. ",
			},
			// {
			// 	key: "filename",
			// 	required: false,
			// 	type: "string",
			// 	helpText:
			// 		"Name of the file to be uploaded. If not provided, default name will be used.",
			// },
			{
				key: "tags",
				required: false,
				type: "string",
				list: true,
				helpText: "Tags associated with the image.",
			},
			// {
			// 	key: "overwrite",
			// 	required: false,
			// 	type: "boolean",
			// 	helpText: "Whether to overwrite the file if it already exists.",
			// },
			// {
			// 	key: "filenameOverride",
			// 	required: false,
			// 	type: "boolean",
			// 	helpText: "Whether to override the filename if it already exists.",
			// },
		],
		sample: sample,
	},
};
