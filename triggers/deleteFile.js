const subscribeHook = async (z, bundle) => {
	const Util = require("../utils");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	const eventIds = await Util.fetchEvents(z, [
		{ name: "file", type: "delete" },
	]);

	return await Util.createWebhook(z, eventIds, bundle);
};

//In the function below, we generate sample data to demonstrate to the user while testing the trigger. Additionally, we fetch some data in real time from Pixelbin to provide the user with a comprehensive view.
const performList = (z, bundle) => {
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();
	return [
		{
			event: {
				name: "file",
				type: "delete",
				traceId: "c0fe84e6-bf21-46dc-9030-bb3f98ad46f2",
			},
			payload: {
				_id: "c51338bf-ae85-4161-bfdc-c8456251c0ad",
				name: "pb_result.png",
				path: "",
				fileId: "pb_result.png",
				format: "png",
				assetType: "image",
				access: "public-read",
				size: 538309,
				isActive: true,
				tags: [],
				metadata: {
					source: "direct",
				},
				url: `${process.env.CDN_URL}/v2/still-bonus-205d85/original/pb_result.png`,
				meta: {},
				kvStore: [],
				height: 1360,
				width: 2660,
				createdAt: "2024-05-14T13:16:11.423Z",
				updatedAt: "2024-05-14T13:16:11.423Z",
				context: {
					req: {
						query: {},
						headers: {},
					},
					meta: {
						size: 538309,
						depth: "uchar",
						space: "srgb",
						width: 2660,
						format: "png",
						height: 1360,
						density: 144,
						channels: 4,
						hasAlpha: true,
						assetType: "image",
						extension: "png",
						hasProfile: true,
						isRawAsset: false,
						contentType: "image/png",
						isAudioAsset: false,
						isImageAsset: true,
						isVideoAsset: false,
						isProgressive: false,
						resolutionUnit: "inch",
						isTransformationSupported: true,
					},
					steps: [],
				},
			},
			public_id: `${process.env.CDN_URL}/v2/polished-hat-8f9bd4/original/dummy_image.png`,
		},
	];
};

const unsubscribeHook = (z, bundle) => {
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();
	id = bundle.subscribeData.webhookConfigId;
	const options = {
		url: `${process.env.BASE_URL}/service/platform/notification/v1.0/webhook-configs/${id}`,
		method: "DELETE",
	};
	return z
		.request(options)
		.then((response) => {
			if (response.status === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to delete. Status: ${response.status}`);
			}
		})
		.catch((error) => {
			z.console.log("Failed to delete" + error.message);

			return [];
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
	key: "deleteFile",

	noun: "File",
	display: {
		label: "Deleted File",
		description: "Triggers when an image is deleted from PixelBin.io.",
	},

	operation: {
		inputFields: [],

		type: "hook",

		sample: {
			event: {
				name: "file",
				type: "delete",
				traceId: "c0fe84e6-bf21-46dc-9030-bb3f98ad46f2",
			},
			payload: {
				_id: "c51338bf-ae85-4161-bfdc-c8456251c0ad",
				name: "pb_result.png",
				path: "",
				fileId: "pb_result.png",
				format: "png",
				assetType: "image",
				access: "public-read",
				size: 538309,
				isActive: true,
				tags: [],
				metadata: {
					source: "direct",
				},
				url: `${process.env.CDN_URL}/v2/still-bonus-205d85/original/pb_result.png`,
				meta: {},
				kvStore: [],
				height: 1360,
				width: 2660,
				createdAt: "2024-05-14T13:16:11.423Z",
				updatedAt: "2024-05-14T13:16:11.423Z",
				context: {
					req: {
						query: {},
						headers: {},
					},
					meta: {
						size: 538309,
						depth: "uchar",
						space: "srgb",
						width: 2660,
						format: "png",
						height: 1360,
						density: 144,
						channels: 4,
						hasAlpha: true,
						assetType: "image",
						extension: "png",
						hasProfile: true,
						isRawAsset: false,
						contentType: "image/png",
						isAudioAsset: false,
						isImageAsset: true,
						isVideoAsset: false,
						isProgressive: false,
						resolutionUnit: "inch",
						isTransformationSupported: true,
					},
					steps: [],
				},
			},
			public_id: `https://cdn.pixelbin.io/v2/polished-hat-8f9bd4/original/dummy_image.png`,
		},

		performSubscribe: subscribeHook,
		performUnsubscribe: unsubscribeHook,
		perform: getDataFromWebHook,
		performList: performList,
	},
};
