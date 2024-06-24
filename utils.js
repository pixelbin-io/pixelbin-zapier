const { v4: uuidv4 } = require("uuid");
const zapier = require("zapier-platform-core");
zapier.tools.env.inject();

class Util {
	static async fetchEvents(z, eventsToReturn) {
		const fetchEventsRequest = {
			url: `${process.env.BASE_URL}/service/platform/notification/v1.0/events`,
			method: "GET",
		};
		const eventIds = [];

		try {
			let response = await z.request(fetchEventsRequest);

			if (response.status === 200) {
				const tempResponse = [...response.data];

				eventsToReturn.forEach((elementToFind) => {
					const temp = tempResponse.find(
						(item) =>
							item.name === elementToFind.name &&
							item.type === elementToFind.type
					);
					eventIds.push(temp._id);
				});

				return eventIds;
			} else {
				throw new Error(
					`Failed to retrieve events. Status: ${response.status}`
				);
			}
		} catch (error) {
			console.log("Error fetching events: " + error.message);
			throw error;
		}
	}

	static async createWebhook(z, eventIds, bundleData) {
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
							name: `(${bundleData.meta.zap.id})-${uuidv4()}`,
							secret: "",
							url: bundleData.targetUrl,
						},
					});

					if (webhookConfigResponse.status === 200) {
						return webhookConfigResponse.data;
					} else {
						throw new Error(
							`Status: ${webhookConfigResponse.status} Message: ${webhookConfigResponse.message}`
						);
					}
				} catch (error) {
					z.console.log(
						"Error creating webhook configuration: " + error.message
					);
					throw error;
				}
			}
		} catch (error) {
			z.console.log("Error creating test WEBHOOK: " + error.message);
			throw new Error(
				`Failed to create a test webhook configuration. Status: ${error}`
			);
		}
	}

	static async deleteWebhook(z, bundle, retries = 4) {
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
					if (retries > 0) {
						return unsubscribeHook(z, bundle, retries - 1);
					} else {
						throw new Error(
							`Failed to delete after 5 attempts: ${error.message}`
						);
					}
				}
			})
			.catch((error) => {
				if (retries > 0) {
					return unsubscribeHook(z, bundle, retries - 1);
				} else {
					throw new Error(
						`Failed to delete after 5 attempts: ${error.message}`
					);
				}
			});
	}
}

module.exports = Util;
