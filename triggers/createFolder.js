const subscribeHook = async (z, bundle) => {
	const { v4: uuidv4 } = require("uuid");
	const Util = require("../utils");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	const eventIds = await Util.fetchEvents(z, [
		{ name: "folder", type: "create" },
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

	body = {
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
		path: "",
	};

	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	try {
		let temp = await defaultPixelBinClient.assets.listFilesPaginator({
			onlyFolders: true,
			path: "",
		});
		const { items, page } = await temp.next();

		if (items.length) {
			body.payload.id = items[0]._id;
			body.payload.name = items[0].name;
			body.path = items[0].path;
		}
	} catch (error) {
		throw error;
	}

	return [{ ...body }];
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
	return [
		{ ...bundle.cleanedRequest, path: bundle.cleanedRequest.payload.path },
	];
};

module.exports = {
	key: "createFolder",

	noun: "Folder",
	display: {
		label: "New Folder Create",
		description: "Triggers when a new folder is created in PixelBin.io.",
	},

	operation: {
		inputFields: [],
		type: "hook",
		sample: {
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
			path: "",
		},
		performSubscribe: subscribeHook,
		performUnsubscribe: unsubscribeHook,
		perform: getDataFromWebHook,
		performList: performList,
	},
};
