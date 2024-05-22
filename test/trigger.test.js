/* globals describe, it */

// require("should");

const zapier = require("zapier-platform-core");
const App = require("../index");

const appTester = zapier.createAppTester(App);

describe("triggers", () => {
	describe("web hook trigger", () => {
		it("should create a new webhook", async () => {
			const bundle = {
				authData: {
					apiKey: "a9a5d437-5902-4248-94cc-8ba7027819be",
				},
				targetUrl: "https://github.com/zapier/zapier-platform-cli",
			};

			const response = await appTester(
				App.triggers.createFolder.operation.performSubscribe,
				bundle
			);
			expect(response.message).toBe("Created new webhook config");
			expect(response).toHaveProperty("webhookConfigId");
		});

		// it("should delete webhook", async () => {
		// 	const bundle = {
		// 		authData: {
		// 			apiKey: "a97b5f02-bb0d-4338-8ffa-32c05c92a377",
		// 		},
		// 	};

		// 	const response = await appTester(
		// 		App.triggers.asset.operation.performUnsubscribe,
		// 		bundle
		// 	);

		// 	expect(response.message).toBe(
		// 		"Successfully deleted webhook config and all related data"
		// 	);
		// });
	});
});
