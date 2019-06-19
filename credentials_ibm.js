// Issuing Credentials via IBM
require('dotenv').config();

const Agent = require('openssi-websdk').Agent;

const account_url = process.env.IBM_CREDENTIAL_URL;
const agent_name = process.env.IBM_CREDENTIAL_AGENT_NAME;
const agent_password = process.env.IBM_CREDENTIAL_AGENT_PASSWORD;

// Check values on console
console.log(account_url);
console.log(agent_name);
console.log(agent_password);

const agent = new Agent(account_url, agent_name, agent_password);

// Only need to run this once against an account
const publishSchema = async () => {
    const name = "Mycelia Creative Passport";
    const version = "0.0.3";
    const attributes = [
        'persona_name',
        'email',
        'date',
        'myceliaID'
    ];

    const cred_schema = await agent.createCredentialSchema(name, version, attributes);
    console.log(`Schema info: ${JSON.stringify(cred_schema, 0, 1)}`);
    return "done";
}

// Only need to run this once against an account
const publishProofSchema = async () => {
    const name = "Creative Passport Login request";
    const version = "0.0.1";
    const requested_attributes = {
        myceliaID: {
            name: 'myceliaID'
        },
        email: {
            name: 'email',
            restrictions: []
        }
    };

    const proof_schema = await agent.createProofSchema(name, version, requested_attributes);
    console.log(`Schema info: ${JSON.stringify(proof_schema, 0, 1)}`);
    return "done";
}

const checkAgent = async () => {
    // Check the username and password by hitting the API
    const agentInfo = await agent.getIdentity();
    console.log(`Agent info: ${JSON.stringify(agentInfo, 0, 1)}`);
    return "done";
}

const publishCredentialDefinition = async () => {
    const schema_id = "4qN9JsboqtsscYLKzTw6wS:2:Mycelia Creative Passport:0.0.3";
    const cred_def = await agent.createCredentialDefinition(schema_id);
    console.log(`Agent info: ${JSON.stringify(cred_def, 0, 1)}`);
    return "done";
}

// print process.argv
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

switch (process.argv[2]) {
    case 'checkAgent':
        checkAgent();
        break;
    case 'publishSchema':
        publishSchema();
        break;
    case 'publishDefinition':
        publishCredentialDefinition();
        break;
    case 'publishProofSchema':
        publishProofSchema();
        break;
    default:
        break;
}
//checkAgent();