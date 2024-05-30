"use strict";

// You want to make a request to an endpoint that is either specifically designed
// to test auth, or one that every user will have access to. eg: `/me`.
// By returning the entire request object, you have access to the request and
// response data for testing purposes. Your connection label can access any data
// from the returned response using the `json.` prefix. eg: `{{json.username}}`.

const test = (z, bundle) => {
	const url = `https://api.pixelbinz0.de/service/platform/organization/v1.0/apps/info`;
	return z
		.request({
			url: url,
		})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error("Error while testing:", error);
			throw error;
		});
};

// This function runs after every outbound request. You can use it to check for
// errors or modify the response. You can have as many as you need. They'll need
// to each be registered in your index.js file.
const handleBadResponses = (response, z, bundle) => {
	// console.log("IN BAD RESPONSE" + response.status);
	if (response.status === 401) {
		// console.log("IN ERROR 2", response);
		throw new z.errors.Error(
			// This message is surfaced to the user
			"The API Key you supplied is incorrect ",
			"AuthenticationError",
			response
		);
	}

	return response;
};

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.

const includeApiKey = (request, z, bundle) => {
	const url = require("url");
	const querystring = require("querystring");
	const crypto = require("crypto-js");

	const sha256 = crypto.SHA256;
	const hmacSHA256 = crypto.HmacSHA256;

	function hmac(key, string, encoding) {
		return hmacSHA256(string, key).toString();
	}

	function hash(string, encoding) {
		return sha256(string).toString();
	}

	// This function assumes the string has already been percent encoded
	function encodeRfc3986(urlEncodedString) {
		return urlEncodedString.replace(/[!'()*]/g, function (c) {
			return "%" + c.charCodeAt(0).toString(16).toUpperCase();
		});
	}

	function encodeRfc3986Full(str) {
		return str;
		// return encodeRfc3986(encodeURIComponent(str));
	}

	const HEADERS_TO_IGNORE = {
		authorization: true,
		connection: true,
		"x-amzn-trace-id": true,
		"user-agent": true,
		expect: true,
		"presigned-expires": true,
		range: true,
	};

	const HEADERS_TO_INCLUDE = ["x-ebg-.*", "host"];

	// request: { path | body, [host], [method], [headers], [service], [region] }
	class RequestSigner {
		constructor(request) {
			if (typeof request === "string") {
				request = url.parse(request);
			}

			let headers = (request.headers = request.headers || {});
			this.request = request;

			if (!request.method && request.body) {
				request.method = "POST";
			}

			if (!headers.Host && !headers.host) {
				headers.Host = request.hostname || request.host;

				// If a port is specified explicitly, use it as is
				if (request.port) {
					headers.Host += ":" + request.port;
				}
			}
			if (!request.hostname && !request.host) {
				request.hostname = headers.Host || headers.host;
			}
		}

		prepareRequest() {
			this.parsePath();

			let request = this.request;
			let headers = request.headers;
			let query;

			if (request.signQuery) {
				this.parsedPath.query = query = this.parsedPath.query || {};

				if (query["x-ebg-param"]) {
					this.datetime = query["x-ebg-param"];
				} else {
					query["x-ebg-param"] = this.getDateTime();
				}
			} else {
				if (!request.doNotModifyHeaders) {
					if (!request.doNotModifyHeaders) {
						if (headers["x-ebg-param"]) {
							this.datetime = headers["x-ebg-param"] || headers["x-ebg-param"];
						} else {
							headers["x-ebg-param"] = this.getDateTime();
						}
					}

					delete headers["x-ebg-signature"];
					delete headers["X-Ebg-Signature"];
				}
			}
		}

		sign() {
			if (!this.parsedPath) {
				this.prepareRequest();
			}
			if (this.request.signQuery) {
				this.parsedPath.query["x-ebg-signature"] = this.signature();
			} else {
				this.request.headers["x-ebg-signature"] = this.signature();
			}

			this.request.path = this.formatPath();
			return this.request;
		}

		getDateTime() {
			if (!this.datetime) {
				let headers = this.request.headers;
				let date = new Date(headers.Date || headers.date || new Date());

				this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, "");
			}
			return this.datetime;
		}

		getDate() {
			return this.getDateTime().substr(0, 8);
		}

		signature() {
			let kCredentials = "1234567";
			let strTosign = this.stringToSign();
			return `v1:${hmac(kCredentials, strTosign, "hex")}`;
		}

		stringToSign() {
			return [this.getDateTime(), hash(this.canonicalString(), "hex")].join(
				"\n"
			);
		}

		canonicalString() {
			if (!this.parsedPath) {
				this.prepareRequest();
			}

			let pathStr = this.parsedPath.path;
			let query = this.parsedPath.query;
			let headers = this.request.headers;
			let queryStr = "";
			let normalizePath = true;
			let decodePath = this.request.doNotEncodePath;
			let decodeSlashesInPath = false;
			let firstValOnly = false;
			let bodyHash = hash(this.request.body || "", "hex");

			if (query) {
				let reducedQuery = Object.keys(query).reduce(function (obj, key) {
					if (!key) {
						return obj;
					}
					obj[encodeRfc3986Full(key)] = !Array.isArray(query[key])
						? query[key]
						: firstValOnly
						? query[key][0]
						: query[key];
					return obj;
				}, {});
				let encodedQueryPieces = [];
				Object.keys(reducedQuery)
					.sort()
					.forEach(function (key) {
						if (!Array.isArray(reducedQuery[key])) {
							encodedQueryPieces.push(
								key + "=" + encodeRfc3986Full(reducedQuery[key])
							);
						} else {
							reducedQuery[key]
								.map(encodeRfc3986Full)
								.sort()
								.forEach(function (val) {
									encodedQueryPieces.push(key + "=" + val);
								});
						}
					});
				queryStr = encodedQueryPieces.join("&");
			}
			if (pathStr !== "/") {
				if (normalizePath) {
					pathStr = pathStr.replace(/\/{2,}/g, "/");
				}
				pathStr = pathStr
					.split("/")
					.reduce(function (path, piece) {
						if (normalizePath && piece === "..") {
							path.pop();
						} else if (!normalizePath || piece !== ".") {
							if (decodePath)
								piece = decodeURIComponent(piece.replace(/\+/g, " "));
							path.push(encodeRfc3986Full(piece));
						}
						return path;
					}, [])
					.join("/");
				if (pathStr[0] !== "/") pathStr = "/" + pathStr;
				if (decodeSlashesInPath) pathStr = pathStr.replace(/%2F/g, "/");
			}

			let canonicalReq = [
				this.request.method || "GET",
				pathStr,
				queryStr,
				this.canonicalHeaders() + "\n",
				this.signedHeaders(),
				bodyHash,
			].join("\n");
			return canonicalReq;
		}

		canonicalHeaders() {
			let headers = this.request.headers;

			function trimAll(header) {
				return header.toString().trim().replace(/\s+/g, " ");
			}
			return Object.keys(headers)
				.filter(function (key) {
					let notInIgnoreHeader = HEADERS_TO_IGNORE[key.toLowerCase()] == null;
					if (notInIgnoreHeader) {
						let foundMatch = false;
						for (let t in HEADERS_TO_INCLUDE) {
							foundMatch =
								foundMatch || new RegExp(HEADERS_TO_INCLUDE[t], "ig").test(key);
						}
						return foundMatch;
					} else {
						return false;
					}
				})
				.sort(function (a, b) {
					return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
				})
				.map(function (key) {
					return key.toLowerCase() + ":" + trimAll(headers[key]);
				})
				.join("\n");
		}

		signedHeaders() {
			return Object.keys(this.request.headers)
				.map(function (key) {
					return key.toLowerCase();
				})
				.filter(function (key) {
					let notInIgnoreHeader = HEADERS_TO_IGNORE[key.toLowerCase()] == null;
					if (notInIgnoreHeader) {
						let foundMatch = false;
						for (let t in HEADERS_TO_INCLUDE) {
							foundMatch =
								foundMatch || new RegExp(HEADERS_TO_INCLUDE[t], "ig").test(key);
						}
						return foundMatch;
					} else {
						return false;
					}
				})
				.sort()
				.join(";");
		}

		parsePath() {
			let path = this.request.path || "/";

			// So if there are non-reserved chars (and it's not already all % encoded), just encode them all
			if (/[^0-9A-Za-z;,/?:@&=+$\-_.!~*'()#%]/.test(path)) {
				path = encodeURI(decodeURI(path));
			}

			let queryIx = path.indexOf("?");
			let query = null;

			if (queryIx >= 0) {
				query = querystring.parse(path.slice(queryIx + 1));
				path = path.slice(0, queryIx);
			}

			this.parsedPath = {
				path: path,
				query: query,
			};
		}

		formatPath() {
			let path = this.parsedPath.path;
			let query = this.parsedPath.query;

			if (!query) {
				return path;
			}

			// Services don't support empty query string keys
			if (query[""] != null) {
				delete query[""];
			}

			return path + "?" + encodeRfc3986(querystring.stringify(query));
		}
	}

	// var sToken = "Bearer " + btoa(z.collectionVariables.get("API_TOKEN"));
	// z.request.headers.add({ key: "Authorization", value: sToken });

	request.headers.Authorization = `Bearer ${btoa(bundle.authData.apiKey)}`;
	const { host, pathname, search } = new URL(request.url);

	let signingOptions = {
		method: request.method.toUpperCase(),
		host: host,
		path: pathname + search,
		body: request.body ? request.body.toString() : null,
		headers: request.headers,
	};
	if (
		signingOptions["body"] &&
		request.headers["content-type"] === "multipart/form-data"
	) {
		delete signingOptions["body"];
	}

	let updatedReqData = new RequestSigner(signingOptions).sign();

	// z.request.headers.remove("x-ebg-param");
	request.headers["x-ebg-param"] = Buffer.from(
		updatedReqData.headers["x-ebg-param"]
	).toString("base64");

	request.headers["x-ebg-signature"] =
		updatedReqData.headers["x-ebg-signature"];
	return request;
};

module.exports = {
	config: {
		// "custom" is the catch-all auth type. The user supplies some info and Zapier can
		// make authenticated requests with it
		type: "custom",

		// Define any input app's auth requires here. The user will be prompted to enter
		// this info when they connect their account.
		fields: [
			{
				key: "apiKey",
				label: "API Key",
				required: true,
				type: "password",
				helpText:
					"1. Go to [console.pixelbin.io](https://console.pixelbin.io/choose-org?redirectTo=settings/apps) and create a free account (you will need to confirm your email).\n2. After that, you can find your API token [here](https://console.pixelbin.io/choose-org?redirectTo=settings/apps).",
			},
		],

		// The test method allows Zapier to verify that the credentials a user provides
		// are valid. We'll execute this method whenever a user connects their account for
		// the first time.
		test,

		// This template string can access all the data returned from the auth test. If
		// you return the test object, you'll access the returned data with a label like
		// `{{json.X}}`. If you return `response.data` from your test, then your label can
		// be `{{X}}`. This can also be a function that returns a label. That function has
		// the standard args `(z, bundle)` and data returned from the test can be accessed
		// in `bundle.inputData.X`.
		connectionLabel: "{{json.app.name}} ({{json.org.name}})",
	},
	befores: [includeApiKey],
	afters: [handleBadResponses],
};
