const subscribeHook = async (z, bundle) => {
	const { v4: uuidv4 } = require("uuid");
	const Util = require("../utils");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	const eventIds = await Util.fetchEvents(z, [
		{ name: "file", type: "create" },
		{ name: "file", type: "delete" },
		{ name: "file", type: "update" },
		{ name: "folder", type: "create" },
		{ name: "folder", type: "update" },
	]);

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
						name: `(${bundle.meta.zap.id})-${uuidv4()}`,
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

const getDynamicDropdownChoices = async (z, bundle) => {
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();
	const fetchEvents = {
		url: `${process.env.BASE_URL}/service/platform/notification/v1.0/events`,
		method: "GET",
	};

	try {
		let response = await z.request(fetchEvents);

		if (response.status === 200) {
			const items = [...response.data];
			return items.map((item) => ({
				label: `${item.name} ${item.type}`,
				value: `${item.name}${item.type}`,
			}));
		} else {
			throw new Error(`Failed to retrieve events. Status: ${response.status}`);
		}
	} catch (error) {
		z.console.log("Error fetching events: " + error.message);
		throw error;
	}
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

const performList = async (z, bundle) => {
	const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();
	const { v4: uuidv4 } = require("uuid");
	orgId = "";

	try {
		const orgDetails =
			await defaultPixelBinClient.organization.getAppOrgDetails();
		orgId = orgDetails.app.orgId;
	} catch (error) {
		console.log("error", error);
	}

	orgDetails = {};

	folderCreateData = {
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
	};
	fileCreateData = {
		event: {
			name: "file",
			type: "create",
			traceId: "8f2937c8-92f7-47c3-a8eb-71c50408fa3d",
		},
		payload: {
			orgId: orgId,
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
	fileDeleteData = {
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
	};
	fileUpdateData = {
		event: {
			name: "file",
			type: "update",
			traceId: "c0fe84e6-bf21-46dc-9030-bb3f79ad46f2",
		},
		payload: {
			_id: "c0fe84e6-bf21-46dc-9030-bb1198ad46f2",
			name: "brywb",
			path: "",
			fileId: "brywb",
			format: "jpeg",
			assetType: "image",
			access: "public-read",
			size: 205458,
			isActive: true,
			tags: [],
			metadata: {
				source: "direct",
			},
			url: "https://cdn.pixelbin.io/v2/muddy-lab-41820d/original/brywb",
			meta: {},
			kvStore: [],
			height: 1390,
			width: 1163,
			createdAt: "2024-05-16T03:48:33.796Z",
			updatedAt: "2024-06-07T11:36:50.136Z",
			context: {
				req: {
					query: {},
					headers: {},
				},
				meta: {
					size: 205458,
					depth: "uchar",
					space: "srgb",
					width: 1163,
					format: "jpeg",
					height: 1390,
					density: 300,
					channels: 3,
					hasAlpha: false,
					assetType: "image",
					extension: "jpeg",
					hasProfile: false,
					isRawAsset: false,
					contentType: "image/jpeg",
					isAudioAsset: false,
					isImageAsset: true,
					isVideoAsset: false,
					isProgressive: false,
					resolutionUnit: "inch",
					chromaSubsampling: "4:2:0",
					isTransformationSupported: true,
				},
				steps: [],
			},
		},
		public_id:
			"https://cdn.pixelbin.io/v2/muddy-lab-41820d/original/duumy_image.png",
	};
	folderUpdateData = {
		_id: "c0fe84e6-bf21-46dc-9030-bb3f98ad56d2",
		name: "__zapier_Transformation",
		path: "",
		isActive: false,
	};

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	if (bundle.inputData.dynamic_dropdown.includes("folderCreate")) {
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: "",
			});
			const { items, page } = await temp.next();

			if (items.length) {
				folderCreateData._id = items[0]._id;
				folderCreateData.name = items[0].name;
				folderCreateData.path = items[0].path;
			}
		} catch (error) {
			throw error;
		}
	}

	if (bundle.inputData.dynamic_dropdown.includes("fileCreate")) {
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFiles: true,
				path: "",
			});
			const { items, page } = await temp.next();

			if (items.length) {
				fileCreateData.public_id = items[0].url;
				fileCreateData.payload.name = items[0].name;
				fileCreateData.payload.path = items[0].path;
				fileCreateData.payload.fileId = items[0].fileId;
				fileCreateData.payload.tags = [...items[0].tags];
				fileCreateData.payload.format = items[0].format;
				fileCreateData.payload.assetType = items[0].assetType;
				fileCreateData.payload.size = items[0].size;
				fileCreateData.payload.width = items[0].width;
				fileCreateData.payload.height = items[0].height;
				fileCreateData.payload.context.meta.extension = items[0].format;
				fileCreateData.payload.assetType = items[0].assetType;
				fileCreateData.payload.context.meta.size = items[0].size;
				fileCreateData.payload.context.meta.width = items[0].width;
				fileCreateData.payload.context.meta.height = items[0].height;
			}
		} catch (error) {
			throw error;
		}
	}

	if (bundle.inputData.dynamic_dropdown.includes("fileUpdate")) {
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFiles: true,
				path: "",
			});
			const { items, page } = await temp.next();

			if (items.length) {
				fileUpdateData.public_id = items[0].url;
				fileUpdateData.payload.name = items[0].name;
				fileUpdateData.payload.path = items[0].path;
				fileUpdateData.payload.fileId = items[0].fileId;
				fileUpdateData.payload.tags = [...items[0].tags];
				fileUpdateData.payload.format = items[0].format;
				fileUpdateData.payload.assetType = items[0].assetType;
				fileUpdateData.payload.size = items[0].size;
				fileUpdateData.payload.width = items[0].width;
				fileUpdateData.payload.height = items[0].height;
				fileUpdateData.payload.context.meta.extension = items[0].format;
				fileUpdateData.payload.assetType = items[0].assetType;
				fileUpdateData.payload.context.meta.size = items[0].size;
				fileUpdateData.payload.context.meta.width = items[0].width;
				fileUpdateData.payload.context.meta.height = items[0].height;
			}
		} catch (error) {
			throw error;
		}
	}

	if (bundle.inputData.dynamic_dropdown.includes("folderUpdate")) {
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: "",
			});
			const { items, page } = await temp.next();

			if (items.length) {
				folderUpdateData._id = items[0]._id;
				folderUpdateData.name = items[0].name;
				folderUpdateData.path = items[0].path;
			}
		} catch (error) {
			throw error;
		}
	}

	tempBody = [];

	if (bundle.inputData.dynamic_dropdown.includes("fileCreate"))
		tempBody.push({ ...fileCreateData });
	if (bundle.inputData.dynamic_dropdown.includes("fileDelete"))
		tempBody.push({ ...fileDeleteData });
	if (bundle.inputData.dynamic_dropdown.includes("folderCreate"))
		tempBody.push({ ...folderCreateData });
	if (bundle.inputData.dynamic_dropdown.includes("fileUpdate"))
		tempBody.push({ ...fileUpdateData });

	return [...tempBody];
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

	return [{ ...obj, public_id_image_: "" }];
};

module.exports = {
	key: "asset",
	noun: "Asset",
	display: {
		label: "New Storage Event",
		description:
			"Triggers when an image is uploaded, updated or deleted, or a new folder is created in PixelBin.io.",
	},
	operation: {
		inputFields: [
			{
				key: "dynamic_dropdown",
				label: "Select Items",
				required: true,
				type: "string",
				choices: {
					fileCreate: "File Create",
					fileDelete: "File Delete",
					fileUpdate: "File Update",
					folderCreate: "Folder Create",
					folderUpdate: "Folder Update",
				},
				list: true,
			},
		],

		type: "hook",
		sample: {
			event: {
				name: "file",
				type: "create",
				traceId: "8f2937c8-92f7-47c3-a8eb-71c50408fa3d",
			},
			payload: {
				orgId: 7216,
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
			public_id_image_: "",
		},
		performSubscribe: subscribeHook,
		performUnsubscribe: unsubscribeHook,
		perform: getDataFromWebHook,
		performList: performList,
	},
};
