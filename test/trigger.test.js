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
					apiKey: "9410ee81-fcaa-4532-a18a-8d7bd4e3686c",
				},
				targetUrl: "https://github.com/zapier/zapier-platform-cli",
			};

			const response = await appTester(
				App.triggers.asset.operation.performSubscribe,
				bundle
			);
			expect(response.message).toBe("Created new webhook config");
			expect(response).toHaveProperty("webhookConfigId");
		});

		it("should delete webhook", async () => {
			const bundle = {
				authData: {
					apiKey: "9410ee81-fcaa-4532-a18a-8d7bd4e3686c",
				},
			};

			const response = await appTester(
				App.triggers.asset.operation.performUnsubscribe,
				bundle
			);

			expect(response.message).toBe(
				"Successfully deleted webhook config and all related data"
			);
		});
	});
});
