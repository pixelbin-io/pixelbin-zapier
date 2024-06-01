const perform = async (z, bundle) => {
	const bodyData = {
		url: bundle.inputData.url,
		path: bundle.inputData.path
			? `/${bundle.inputData.path}`
			: "/__zapier_Uploads",
		access: "public-read",
		tags: bundle.inputData.tags,
		metadata: {},
		overwrite: bundle.inputData.overwrite || false,
		filenameOverride: bundle.inputData.filenameOverride || true,
	};

	// Check if bundle.inputData.filename exists, if not, extract filename from the URL
	if (bundle.inputData.filename) {
		bodyData.name = bundle.inputData.filename;
	} else {
		// Extract filename from URL
		const urlParts = bundle.inputData.url.split("/");
		const filenameFromUrl = urlParts[urlParts.length - 1];
		bodyData.name = filenameFromUrl;
	}

	const response = await z.request({
		url: `https://api.pixelbinz0.de/service/platform/assets/v1.0/upload/url`,
		method: "POST",
		headers: {
			accept: "application/json",
			"Content-Type": "application/json",
			// Add more headers as required
		},
		body: JSON.stringify(bodyData),
	});

	const responseData = response.data;

	// Check if the "tags" property exists and is an empty array
	if (
		responseData.tags &&
		Array.isArray(responseData.tags) &&
		responseData.tags.length === 0
	) {
		delete responseData.tags;
	}

	return responseData;
};
// Register the action in Zapier
module.exports = {
	key: "uploadFile",
	noun: "File",
	display: {
		label: "Upload File to Pixelbin",
		description: "Uploads a file to Pixelbin.io.",
	},
	operation: {
		perform,
		inputFields: [
			{
				key: "url",
				// required: true,
				type: "string",
				helpText: "URL of an image to upload.",
			},
			{
				key: "path",
				required: false,
				type: "string",
				helpText:
					"Path to upload image at. e.g folderName or parentFolder/childFolder. If not provided default folder __zapier_Uploads will be used.",
			},
			{
				key: "filename",
				required: false,
				type: "string",
				helpText:
					"Name of the file to be uploaded. If not provided, default name will be used.",
			},
			{
				key: "tags",
				required: false,
				type: "string",
				list: true,
				helpText: "Tags associated with the image.",
			},
			{
				key: "overwrite",
				required: false,
				type: "boolean",
				helpText: "Whether to overwrite the file if it already exists.",
			},
			{
				key: "filenameOverride",
				label: "Override FileName",
				required: false,
				type: "boolean",
				helpText: "Whether to override the filename if it already exists.",
			},
		],
		sample: {
			id: "1",
			url: "https://example.com/image.png",
			path: "/path/to/image",
			tags: ["tag1", "tag2"],
		},
	},
};
