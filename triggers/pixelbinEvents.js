var hookID = "";
const eventIds = [];

const subscribeHook = async (z, bundle) => {
	const { v4: uuidv4 } = require("uuid");
	const eventIds = [];

	const fetchEvents = {
		url: `https://api.pixelbinz0.de/service/platform/notification/v1.0/events`,
		method: "GET",
	};

	try {
		let response = await z.request(fetchEvents);

		if (response.status === 200) {
			const temp = [...response.data];
			if (bundle.inputData.fileUpload) {
				const obj = temp.find(
					(item) => item.name === "file" && item.type === "create"
				);
				eventIds.push(obj._id);
			}
			if (bundle.inputData.fileDelete) {
				const obj = temp.find(
					(item) => item.name === "file" && item.type === "delete"
				);
				eventIds.push(obj._id);
			}
			if (bundle.inputData.folderCreate) {
				const obj = temp.find(
					(item) => item.name === "folder" && item.type === "create"
				);
				eventIds.push(obj._id);
			}
			z.console.log("ID_ARRAY", eventIds);
		} else {
			throw new Error(`Failed to retrieve events. Status: ${response.status}`);
		}
	} catch (error) {
		z.console.log("Error fetching events: " + error.message);
		throw error;
	}

	const testWebHook = {
		url: `https://api.pixelbinz0.de/service/platform/notification/v1.0/webhook-configs/test`,
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
					url: `https://api.pixelbinz0.de/service/platform/notification/v1.0/webhook-configs`,
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
		z.console.log("Error creating TEST WEBHOOK: " + error.message);
		throw new Error(
			`Failed to create a test webhook configuration. Status: ${error}`
		);
	}
};

const unsubscribeHook = (z, bundle) => {
	// bundle.subscribeData contains the parsed response JSON from the subscribe request.
	// You can build requests and our client will helpfully inject all the variables
	// you need to complete. You can also register middleware to control this.
	const options = {
		url: `https://api.pixelbinz0.de/service/platform/notification/v1.0/webhook-configs/${hookID}`,
		method: "DELETE",
	};

	// You may return a promise or a normal data structure from any perform method.
	return z
		.request(options)
		.then((response) => {
			// Check if response is successful
			if (response.status === 200) {
				// Return data if successful
				return response.data;
			} else {
				// Throw an error if response is not successful
				throw new Error(`Failed to delete. Status: ${response.status}`);
			}
		})
		.catch((error) => {
			// Handle the error here
			z.console.log("Failed to delete" + error.message);
			// You can return an empty array or any default data structure here
			return [];
		});
};

const deletePropertiesRecursive = (obj) => {
	for (const key in obj) {
		if (typeof obj[key] === "object" && obj[key] !== null) {
			// Recursively check nested objects
			deletePropertiesRecursive(obj[key]);
		} else {
			// Delete the property if it matches any of the properties to delete
			if (key === "querystring" || key === "s3Bucket" || key === "s3Key") {
				delete obj[key];
			}
		}
	}
};

const performList = (z, bundle) => {
	return [
		{
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
		},
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
				url: "https://cdn.pixelbinz0.de/v2/still-bonus-205d85/original/pb_result.png",
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
		},
		{
			event: {
				name: "folder",
				type: "create",
				traceId: "c19e8dfc-b94f-4bc5-8725-d3ff361035e1",
			},
			payload: {
				_id: "d8e0394c-2235-422e-bd48-53c4cf1ae0f4",
				name: "folderName",
				path: "",
				isActive: true,
			},
		},
	];
};

const getDataFromWebHook = async (z, bundle) => {
	const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	const orgDetails =
		await defaultPixelBinClient.organization.getAppOrgDetails();
	// Iterate through each object in the array
	[bundle.cleanedRequest].forEach((obj) => {
		// Delete specified properties from the first layer
		delete obj.querystring;
		delete obj.s3Bucket;
		delete obj.s3Key;

		// Delete specified properties recursively
		deletePropertiesRecursive(obj);
	});

	let obj = { ...bundle.cleanedRequest };
	// let cloudName = getGlobalData("cloudName");

	if (obj.event.name === "file") {
		obj = {
			...obj,
			public_id: `https://cdn.pixelbinz0.de/v2/${orgDetails?.org?.cloudName}/original/${obj.payload.fileId}`,
		};
	}
	// Return the modified array

	return [{ ...obj }];
};

// We recommend writing your triggers separate like this and rolling them
// into the App definition at the end.
module.exports = {
	key: "asset",

	// You’ll want to provide some helpful display labels and descriptions
	// for users. Zapier will put them into the UI.
	noun: "Asset",
	display: {
		label: "Storage Monitor",
		description:
			"Triggers when an image is uploaded or deleted, or a new folder is created in PixelBin.io.",
	},

	// `operation` is where the business logic goes.
	operation: {
		// `inputFields` can define the fields a user could provide,
		// we’ll pass them in as `bundle.inputData` later.
		inputFields: [
			{
				key: "fileUpload",
				required: true,
				type: "boolean",
				label: "Image Upload",
				helpText: "triggers when image is uploaded in PixelBin.io",
			},
			{
				key: "fileDelete",
				required: true,
				type: "boolean",
				label: "Image Delete",
				helpText: "triggers when image is deleted from PixelBin.io",
			},
			{
				key: "folderCreate",
				required: true,
				type: "boolean",
				label: "Folder Create",
				helpText: "triggers when image is deleted from PixelBin.io",
			},
		],

		type: "hook",

		performSubscribe: subscribeHook,
		performUnsubscribe: unsubscribeHook,
		perform: getDataFromWebHook,
		// performList: performList,
	},
};
