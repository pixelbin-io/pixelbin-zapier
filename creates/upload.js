const zapier = require("zapier-platform-core");

const perform = async (z, bundle) => {
	zapier.tools.env.inject();
	const bodyData = {
		url: bundle.inputData.url,
		path: bundle.inputData.path
			? `/${bundle.inputData.path}`
			: "/__zapier/uploads",
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
		url: `${process.env.BASE_URL}/service/platform/assets/v1.0/upload/url`,
		method: "POST",
		headers: {
			accept: "application/json",
			"Content-Type": "application/json",
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
module.exports = {
	key: "uploadFile",
	noun: "File",
	display: {
		label: "Upload File to Pixelbin",
		description: "Uploads an image to Pixelbin.io and returns url",
	},
	operation: {
		perform,
		inputFields: [
			{
				key: "url",
				required: true,
				type: "string",
				helpText: "Image to be uploaded.",
			},
			{
				key: "path",
				required: false,
				type: "string",
				helpText:
					"Path to upload image at. e.g folderName or parentFolder/childFolder. If not provided default folder __zapier/uploads will be used.",
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
			orgId: 226275,
			type: "file",
			name: "dummy_image.png",
			path: "__zapier/uploads",
			fileId: "__zapier/uploads/dummy_image.png",
			access: "public-read",
			metadata: {
				source: "direct",
			},
			format: "docx",
			assetType: "raw",
			size: 815478,
			width: null,
			height: null,
			context: {
				steps: [],
				req: {
					headers: {},
					query: {},
				},
				meta: {
					extension: null,
					format: "docx",
					contentType:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					size: 815478,
					assetType: "raw",
					isImageAsset: false,
					isAudioAsset: false,
					isVideoAsset: false,
					isRawAsset: true,
					isTransformationSupported: false,
					width: null,
					height: null,
				},
			},
			isOriginal: true,
			_id: "7ba2143d-8d96-472a-b337-33d60bda103e",
			url: "https://cdn.pixelbin.io/v2/muddy-lab-41820d/original/__zapier_Uploads/dummy_image.png",
		},
	},
};
