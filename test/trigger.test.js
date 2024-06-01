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
					apiKey: "33da89d7-790d-418f-a3c9-a50dfb9b5277",
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

		it("should delete webhook", async () => {
			const bundle = {
				authData: {
					apiKey: "33da89d7-790d-418f-a3c9-a50dfb9b5277",
				},
			};

			const response = await appTester(
				App.triggers.createFolder.operation.performUnsubscribe,
				bundle
			);

			expect(response.message).toBe(
				"Successfully deleted webhook config and all related data"
			);
		});
	});
});
