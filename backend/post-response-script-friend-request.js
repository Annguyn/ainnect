const testCase = pm.iterationData.get("id");
const group = pm.iterationData.get("group");
const desc = pm.iterationData.get("description");
const expectedStatus = Number(pm.iterationData.get("expectedStatus"));
const expectedError = pm.iterationData.get("expectedError") || "";
const expectedMessage = pm.iterationData.get("expectedMessage") || "";
const expectedDetailFields = (pm.iterationData.get("expectedDetailFields") || "").split("|").filter(x => x);
const expectedDetailMessages = (pm.iterationData.get("expectedDetailMessages") || "").split("|").filter(x => x);

pm.test(`[${testCase}] HTTP status = ${expectedStatus}`, function () {
    pm.response.to.have.status(expectedStatus);
});

let json = null;
try {
    json = pm.response.json();
} catch (e) {
    console.warn(`[${testCase}] Response is not valid JSON`, e);
    pm.test(`[${testCase}] Response is valid JSON`, function () {
        pm.expect.fail("Response is not valid JSON: " + e.message);
    });
}

console.log("==== POST /friend-request ====");
console.log("TC:", testCase, "| Group:", group);
console.log("Desc:", desc);
console.log("Status:", pm.response.code);
console.log("Body:", JSON.stringify(json, null, 2));
console.log("==============================");

if (!json) {
    return;
}

// Determine response format: ApiResponse or ErrorResponse
const isApiResponseFormat = json.hasOwnProperty("result") && json.hasOwnProperty("message") && json.hasOwnProperty("data");
const isErrorResponseFormat = json.hasOwnProperty("status") && json.hasOwnProperty("error") && json.hasOwnProperty("message");

// Validate expectedError
if (expectedError && expectedError !== "") {
    pm.test(`[${testCase}] Validate error/result field = '${expectedError}'`, function () {
        let actualError = null;
        
        if (isApiResponseFormat) {
            // ApiResponse format: { result: "SUCCESS"/"ERROR", message: "...", data: {...} }
            actualError = json.result;
        } else if (isErrorResponseFormat) {
            // ErrorResponse format: { status: 400, error: "Bad Request", message: "...", details: null }
            // For ErrorResponse, we compare with "error" field, but expectedError might be "ERROR" or "Bad Request"
            // Check if expectedError matches error field or if it's a generic "ERROR"
            if (expectedError === "ERROR") {
                // If expectedError is "ERROR", check if error field exists (any error is fine)
                actualError = json.error ? "ERROR" : null;
            } else {
                // Compare exact error message
                actualError = json.error;
            }
        } else {
            // Try to find error field in any format
            actualError = json.error || json.result || json.status || json.errorCode;
        }
        
        if (actualError !== null && actualError !== undefined) {
            // Case-insensitive comparison for error codes like "ERROR", "SUCCESS"
            if (expectedError.toUpperCase() === "ERROR" || expectedError.toUpperCase() === "SUCCESS") {
                pm.expect(String(actualError).toUpperCase()).to.eql(expectedError.toUpperCase());
            } else {
                // Exact match for specific error messages like "Bad Request"
                pm.expect(String(actualError)).to.eql(expectedError);
            }
        } else {
            console.warn(`[${testCase}] Không tìm thấy field error/result trong response.`);
            pm.expect.fail(`Expected error field '${expectedError}' but not found in response`);
        }
    });
}

if (expectedMessage && expectedMessage !== "") {
    pm.test(`[${testCase}] Validate message contains '${expectedMessage}'`, function () {
        let actualMessage = null;
        
        if (isApiResponseFormat) {
            actualMessage = json.message;
            if (json.data && json.data.message) {
                actualMessage = json.data.message;
            }
        } else if (isErrorResponseFormat) {
            actualMessage = json.message;
        } else {
            actualMessage = json.message || json.errorMessage || json.detail || json.description;
        }
        
        if (actualMessage && typeof actualMessage === "string") {
            const messageLower = actualMessage.toLowerCase();
            const expectedLower = expectedMessage.toLowerCase();
            pm.expect(messageLower.includes(expectedLower), 
                `Message '${actualMessage}' should contain '${expectedMessage}'`).to.be.true;
        } else {
            console.warn(`[${testCase}] Không tìm thấy field message dạng string trong response.`);
            pm.expect.fail(`Expected message containing '${expectedMessage}' but message field not found`);
        }
    });
}

if (expectedDetailFields.length > 0 && expectedDetailMessages.length > 0) {
    pm.test(`[${testCase}] Validate detail fields/messages`, function () {
        const details = json.details || json.errors || [];
        
        if (!details || (Array.isArray(details) && details.length === 0) || 
            (typeof details === "object" && Object.keys(details).length === 0)) {
            console.warn(`[${testCase}] Details field is empty or not found.`);
            return;
        }
        
        expectedDetailFields.forEach((field, idx) => {
            const expectedMsg = expectedDetailMessages[idx] || "";
            
            if (Array.isArray(details)) {
                const found = details.find(d => 
                    (d.field === field || d.name === field) &&
                    (!expectedMsg || (d.message && d.message.includes(expectedMsg)))
                );
                pm.expect(found, `Expect detail for field '${field}'`).to.exist;
            } else if (typeof details === "object") {
                // details is an object like { field1: "message1", field2: "message2" }
                pm.expect(details).to.have.property(field);
                if (expectedMsg) {
                    pm.expect(String(details[field])).to.include(expectedMsg);
                }
            }
        });
    });
}

// Additional validation for success cases
if (expectedStatus === 200 && isApiResponseFormat) {
    pm.test(`[${testCase}] Success response has valid structure`, function () {
        pm.expect(json.result).to.be.oneOf(["SUCCESS", "ERROR"]);
        pm.expect(json).to.have.property("message");
        pm.expect(json).to.have.property("data");
    });
    
    if (json.data && json.data.success !== undefined) {
        pm.test(`[${testCase}] Response data.success matches result`, function () {
            if (json.result === "SUCCESS") {
                pm.expect(json.data.success).to.be.true;
            } else if (json.result === "ERROR") {
                pm.expect(json.data.success).to.be.false;
            }
        });
    }
}

if (expectedStatus === 400 || expectedStatus === 401 || expectedStatus === 500) {
    pm.test(`[${testCase}] Error response has valid structure`, function () {
        if (isErrorResponseFormat) {
            pm.expect(json.status).to.eql(expectedStatus);
            pm.expect(json).to.have.property("error");
            pm.expect(json).to.have.property("message");
        } else if (isApiResponseFormat) {
            pm.expect(json.result).to.eql("ERROR");
            pm.expect(json).to.have.property("message");
        }
    });
}

pm.test(`[${testCase}] Response time is acceptable (< 5000ms)`, function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

