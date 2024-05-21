var hookID = "";
const eventIds = [];

const subscribeHook = async (z, bundle) => {
	const eventIds = [];

	const fetchEvents = {
		url: "https://api.pixelbinz0.de/service/platform/notification/v1.0/events",
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

	try {
		const webhookConfigResponse = await z.request({
			url: "https://api.pixelbinz0.de/service/platform/notification/v1.0/webhook-configs",
			method: "POST",
			body: {
				events: [...eventIds],
				isActive: true,
				name: bundle.inputData.webhookName,
				secret: bundle.inputData.secret,
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
			public_id: `https://api.pixelbinz0.de/v2/${orgDetails?.org?.cloudName}/original/${obj.payload.fileId}`,
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
			"Triggers whenever an image is uploaded or deleted, or a new folder is created in PixelBin.io.",
	},

	// `operation` is where the business logic goes.
	operation: {
		// `inputFields` can define the fields a user could provide,
		// we’ll pass them in as `bundle.inputData` later.
		inputFields: [
			{
				key: "webhookName",
				label: "Webhook Name",
				required: true,
				type: "string",
				helpText:
					"Provide name for the new webhook to be created (while testing this trigger, new webhook will be created in PixelBin.io).",
			},
			{
				key: "secret",
				required: false,
				type: "password",
				type: "string",
				helpText: "Provide the secret key for a webhook to be created.",
			},
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
	},
};
