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
					apiKey: "6f08f2a8-cb5e-40e6-a3f5-75be9ea69082",
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
					apiKey: "6f08f2a8-cb5e-40e6-a3f5-75be9ea69082",
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
