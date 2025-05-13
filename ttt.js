// AWS IoT Core with Cognito Identity Pool Authentication
// Make sure to install these npm packages:
// npm install mqtt @aws-sdk/client-cognito-identity @aws-sdk/credential-provider-cognito-identity @aws-sdk/signature-v4 @aws-crypto/sha256-js

import * as mqtt from 'mqtt';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

// Configuration
const CONFIG = {
  IDENTITY_POOL_ID: 'ap-southeast-2:16b827db-8ac4-4cfa-839c-fc1d7bda7cda', // Your Identity Pool ID
  REGION: 'ap-southeast-2', // Your AWS region
  IOT_ENDPOINT: 'a2xhp106oe6s98-ats.iot.ap-southeast-2.amazonaws.com', // Find this in IoT Core console
  TOPIC: 'topic/test' // The MQTT topic to publish/subscribe to
};

// 1. Create a credentials provider using Cognito Identity Pool
const createCredentialsProvider = () => {
  return fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: CONFIG.REGION }),
    identityPoolId: CONFIG.IDENTITY_POOL_ID
  });
};

// 2. Generate a signed WebSocket URL for IoT Core
async function getSignedWebSocketUrl() {
  const credentialsProvider = createCredentialsProvider();
  const credentials = await credentialsProvider();
  
  const signer = new SignatureV4({
    credentials: credentials,
    region: CONFIG.REGION,
    service: 'iotdevicegateway',
    sha256: Sha256
  });
  
  const signedRequest = await signer.presign(
    {
      method: 'GET',
      headers: {
        'host': CONFIG.IOT_ENDPOINT
      },
      protocol: 'wss',
      hostname: CONFIG.IOT_ENDPOINT,
      path: '/mqtt',
      query: {
        'X-Amz-Expires': '300' // URL expires in 5 minutes
      }
    },
    {
      expiresIn: 300 // 5 minutes
    }
  );
  
  // Convert signed request to WebSocket URL
  const websocketUrl = signedRequest.protocol + '//' + signedRequest.hostname + 
                       signedRequest.path + '?' + 
                       Object.entries(signedRequest.query)
                         .map(([k, v]) => `${k}=${v}`)
                         .join('&');
  
  return websocketUrl;
}

// 3. Connect to IoT Core using MQTT over WebSockets
async function connectMqttClient() {
  try {
    const websocketUrl = await getSignedWebSocketUrl();
    const clientId = 'client-' + Math.floor(Math.random() * 100000);
    
    console.log('Connecting to IoT Core...');
    
    const client = mqtt.connect(websocketUrl, {
      clientId: clientId,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30000
    });
    
    return client;
  } catch (error) {
    console.error('Failed to connect:', error);
    throw error;
  }
}

// 4. Set up event handlers and use the MQTT client
async function setupMqttClient() {
  const client = await connectMqttClient();
  
  return new Promise((resolve, reject) => {
    // Handle connection
    client.on('connect', function() {
      console.log('Connected to AWS IoT Core');
      resolve(client);
    });
    
    // Handle errors
    client.on('error', function(error) {
      console.error('MQTT client error:', error);
      reject(error);
    });
    
    // Handle close
    client.on('close', function() {
      console.log('Connection to AWS IoT Core closed');
    });
    
    // Set a timeout for connection
    setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 10000);
  });
}

// 5. Subscribe to a topic
function subscribeToTopic(client, topic) {
  return new Promise((resolve, reject) => {
    client.subscribe(topic, function(err) {
      if (!err) {
        console.log(`Subscribed to ${topic}`);
        resolve();
      } else {
        console.error('Subscription error:', err);
        reject(err);
      }
    });
  });
}

// 6. Publish a message to a topic
function publishMessage(client, topic, message) {
  return new Promise((resolve, reject) => {
    client.publish(topic, JSON.stringify(message), function(err) {
      if (!err) {
        console.log(`Published message to ${topic}`);
        resolve();
      } else {
        console.error('Publish error:', err);
        reject(err);
      }
    });
  });
}

// 7. Main function to run the example
async function main() {
  try {
    // Connect to IoT Core
    const client = await setupMqttClient();
    
    // Set up message handler
    client.on('message', function(topic, message) {
      console.log(`Received message on ${topic}: ${message.toString()}`);
    });
    
    // Subscribe to topic
    await subscribeToTopic(client, CONFIG.TOPIC);
    
    // Publish a test message
    const message = {
      message: 'Hello from Cognito authenticated client!',
      timestamp: new Date().toISOString()
    };
    
    await publishMessage(client, CONFIG.TOPIC, message);
    
    // Keep the connection open
    console.log('Client is running. Press Ctrl+C to exit.');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the example
main().catch(console.error);