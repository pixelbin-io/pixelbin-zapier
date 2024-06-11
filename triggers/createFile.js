var hookID = "";
const eventIds = [];

const subscribeHook = async (z, bundle) => {
	const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
	const { v4: uuidv4 } = require("uuid");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();
	const eventIds = [];

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	try {
		let temp = await defaultPixelBinClient.assets.listFilesPaginator({
			onlyFiles: true,
			path: "",
		});
		const { items, page } = await temp.next();
		if (items.length) {
			console.log("PICKED_UP_ITEM_FILES", items[0]);
		}
	} catch (error) {
		throw error;
	}

	const fetchEvents = {
		url: `${process.env.BASE_URL}/service/platform/notification/v1.0/events`,
		method: "GET",
	};

	try {
		let response = await z.request(fetchEvents);

		if (response.status === 200) {
			const temp = [...response.data];

			const obj = temp.find(
				(item) => item.name === "file" && item.type === "create"
			);
			eventIds.push(obj._id);
		} else {
			throw new Error(`Failed to retrieve events. Status: ${response.status}`);
		}
	} catch (error) {
		z.console.log("Error fetching events: " + error.message);
		throw error;
	}

	const testWebHook = {
		url: `${process.env.BASE_URL}/service/platform/notification/v1.0/webhook-configs/test`,
		method: "POST",
		body: {
			url: "https://www.example.com",
			secret: "",
		},
	};

	try {
		let testHookResponse = await z.request(testWebHook);
		if (testHookResponse.status === 200) {
			try {
				const webhookConfigResponse = await z.request({
					url: `${process.env.BASE_URL}/service/platform/notification/v1.0/webhook-configs`,
					method: "POST",
					body: {
						events: [...eventIds],
						isActive: true,
						name: uuidv4(),
						secret: "",
						url: bundle.targetUrl,
					},
				});

				if (webhookConfigResponse.status === 200) {
					hookID = webhookConfigResponse.data.webhookConfigId;
					return webhookConfigResponse.data;
				} else {
					throw new Error(
						`Failed to create webhook configuration. Status: ${webhookConfigResponse.status}`
					);
				}
			} catch (error) {
				z.console.log("Error creating webhook configuration: " + error.message);
				throw error;
			}
		}
	} catch (error) {
		z.console.log("Error creating test WEBHOOK: " + error.message);
		throw new Error(
			`Failed to create a test webhook configuration. Status: ${error}`
		);
	}
};

const performList = async (z, bundle) => {
	const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	body = {
		event: {
			name: "file",
			type: "create",
			traceId: "8f2937c8-92f7-47c3-a8eb-71c50408fa3d",
		},
		payload: {
			orgId: 7671,
			type: "file",
			name: "pb_result.png",
			path: "",
			fileId: "pb_result.png",
			access: "public-read",
			tags: [],
			metadata: {
				source: "direct",
			},
			format: "png",
			assetType: "image",
			size: 538309,
			width: 2660,
			height: 1360,
			context: {
				steps: [],
				req: {
					headers: {},
					query: {},
				},
				meta: {
					format: "png",
					size: 538309,
					width: 2660,
					height: 1360,
					space: "srgb",
					channels: 4,
					depth: "uchar",
					density: 144,
					isProgressive: false,
					resolutionUnit: "inch",
					hasProfile: true,
					hasAlpha: true,
					extension: "png",
					contentType: "image/png",
					assetType: "image",
					isImageAsset: true,
					isAudioAsset: false,
					isVideoAsset: false,
					isRawAsset: false,
					isTransformationSupported: true,
				},
			},
			isOriginal: true,
		},
		public_id: `${process.env.CDN_URL}/v2/polished-hat-8f9bd4/original/dummy_image.png`,
	};

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);
	let temp = await defaultPixelBinClient.assets.listFilesPaginator({
		onlyFiles: true,
		path: "",
	});
	const { items, page } = await temp.next();

	if (items.length) {
		body.public_id = items[0].url;
		body.payload.name = items[0].name;
		body.payload.path = items[0].path;
		body.payload.fileId = items[0].fileId;
		body.payload.tags = [...items[0].tags];
		body.payload.format = items[0].format;
		body.payload.assetType = items[0].assetType;
		body.payload.size = items[0].size;
		body.payload.width = items[0].width;
		body.payload.height = items[0].height;
		body.payload.context.meta.extension = items[0].format;
		body.payload.assetType = items[0].assetType;
		body.payload.context.meta.size = items[0].size;
		body.payload.context.meta.width = items[0].width;
		body.payload.context.meta.height = items[0].height;
	}

	return [{ ...body }];
};

const unsubscribeHook = (z, bundle, retries = 4) => {
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	const options = {
		url: `${process.env.BASE_URL}/service/platform/notification/v1.0/webhook-configs/${hookID}`,
		method: "DELETE",
	};

	return z
		.request(options)
		.then((response) => {
			if (response.status === 200) {
				return response.data;
			} else {
				return unsubscribeHook(z, bundle, retries - 1);
			}
		})
		.catch((error) => {
			if (retries > 0) {
				return unsubscribeHook(z, bundle, retries - 1);
			} else {
				throw new Error(`Failed to delete after 5 attempts: ${error.message}`);
			}
		});
};

const deletePropertiesRecursive = (obj) => {
	for (const key in obj) {
		if (typeof obj[key] === "object" && obj[key] !== null) {
			deletePropertiesRecursive(obj[key]);
		} else {
			if (key === "querystring" || key === "s3Bucket" || key === "s3Key") {
				delete obj[key];
			}
		}
	}
};

const getDataFromWebHook = async (z, bundle) => {
	const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	const orgDetails =
		await defaultPixelBinClient.organization.getAppOrgDetails();

	[bundle.cleanedRequest].forEach((obj) => {
		delete obj.querystring;
		delete obj.s3Bucket;
		delete obj.s3Key;

		deletePropertiesRecursive(obj);
	});

	let obj = { ...bundle.cleanedRequest };

	if (obj.event.name === "file") {
		obj = {
			...obj,
			public_id: `${process.env.CDN_URL}/v2/${orgDetails?.org?.cloudName}/original/${obj.payload.fileId}`,
		};
	}

	return [{ ...obj }];
};

module.exports = {
	key: "createFile",

	noun: "File",
	display: {
		label: "New File Upload",
		description: "Triggers when an image is uploaded to PixelBin.io.",
	},

	operation: {
		inputFields: [],

		type: "hook",
		sample: {
			event: {
				name: "file",
				type: "create",
				traceId: "8f2937c8-92f7-47c3-a8eb-71c50408fa3d",
			},
			payload: {
				orgId: 7671,
				type: "file",
				name: "pb_result.png",
				path: "",
				fileId: "pb_result.png",
				access: "public-read",
				tags: [],
				metadata: {
					source: "direct",
				},
				format: "png",
				assetType: "image",
				size: 538309,
				width: 2660,
				height: 1360,
				context: {
					steps: [],
					req: {
						headers: {},
						query: {},
					},
					meta: {
						format: "png",
						size: 538309,
						width: 2660,
						height: 1360,
						space: "srgb",
						channels: 4,
						depth: "uchar",
						density: 144,
						isProgressive: false,
						resolutionUnit: "inch",
						hasProfile: true,
						hasAlpha: true,
						extension: "png",
						contentType: "image/png",
						assetType: "image",
						isImageAsset: true,
						isAudioAsset: false,
						isVideoAsset: false,
						isRawAsset: false,
						isTransformationSupported: true,
					},
				},
				isOriginal: true,
			},
			public_id: `https://cdn.pixelbin.io/v2/polished-hat-8f9bd4/original/dummy_image.png`,
		},
		performSubscribe: subscribeHook,
		performUnsubscribe: unsubscribeHook,
		perform: getDataFromWebHook,
		performList: performList,
	},
};
