const subscribeHook = async (z, bundle) => {
	const Util = require("../utils");
	const zapier = require("zapier-platform-core");
	zapier.tools.env.inject();

	const eventIds = await Util.fetchEvents(z, [
		{ name: "folder", type: "create" },
	]);

	return await Util.createWebhook(z, eventIds, bundle);
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

//In the function below, we generate sample data to demonstrate to the user while testing the trigger. Additionally, we fetch some data in real time from Pixelbin to provide the user with a comprehensive view.
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
			pageSize: "1",
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
