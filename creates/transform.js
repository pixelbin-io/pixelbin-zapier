const zapier = require("zapier-platform-core");

const perform = async (z, bundle) => {
	zapier.tools.env.inject();
	imageTobeTransformed = "";
	if (bundle.inputData.url.includes(`${process.env.CDN_URL}`)) {
		imageTobeTransformed = bundle.inputData.url;
	} else {
		try {
			const response = await z.request({
				url: `${process.env.BASE_URL}/service/platform/assets/v1.0/upload/url`,
				method: "POST",
				headers: {
					accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: bundle.inputData.url,
					path: "/__zapier_Transformation",
					tags: bundle.inputData.tags,
					access: "public-read",
					metadata: {},
					overwrite: bundle.inputData.overwrite || true,
					filenameOverride: bundle.inputData.filenameOverride || true,
				}),
			});
			imageTobeTransformed = response.data.url;
		} catch (error) {
			throw new Error(`FAILED to upload image: ${error}`);
		}
	}

	let replacement = bundle.inputData.transformationString;
	imageTobeTransformed = imageTobeTransformed.replace("original", replacement);

	testImageUrl = {
		url: imageTobeTransformed,
		method: "GET",
	};

	let retries = 5;

	async function getStatus() {
		retries -= 1;
		const response = await z.request(testImageUrl);

		try {
			statusCode = response.status;

			if (statusCode === 200) {
				return { url: imageTobeTransformed };
			}
			if (statusCode === 202) {
				setTimeout(() => {
					getStatus();
				}, 5000);
			} else throw reponse;
		} catch (error) {
			throw error;
		}
	}

	return getStatus();
};

module.exports = {
	key: "transform",
	noun: "Image",

	display: {
		label: "Transform Resource",
		description: "Transforms Image using Pixelbin.io",
	},

	operation: {
		perform,
		inputFields: [
			{
				key: "url",
				required: true,
				type: "string",
				label: "Image / Url",
				helpText: "Image to be transformed.",
			},
			{
				key: "transformationString",
				label: "Tranformation String",
				required: true,
				type: "string",
				helpText:
					"Transformations to be applied as per given string e.g t.resize(w:128,h:128)\n.You can visit [Here](https://www.pixelbin.io/docs/transformations/) to see all available options for transformations. ",
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
				required: false,
				type: "boolean",
				helpText: "Whether to override the filename if it already exists.",
			},
		],
		sample: {
			url: "https://cdn.pixelbin.io/v2/muddy-lab-41820d/t.resize(w:128,h:128)/dummy_image.png",
			url_resize: "w:128,h:128",
		},
	},
};
