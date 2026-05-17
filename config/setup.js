import { connectDB } from "./db.js";
import mongoose from "mongoose";

await connectDB();
// const client = mongoose.connection.getClient();

try {
    const db = mongoose.connection.db;
    console.log("Schema addded to all collection");

    db.createCollection("users", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "name", "email", "rootDirId"],
                properties: {
                    "_id": {
                        "bsonType": "objectId"
                    },
                    "email": {
                        "bsonType": "string"
                    },
                    "name": {
                        "bsonType": "string"
                    },
                    "password": {
                        "bsonType": "string"
                    },
                    "picture": {
                        "bsonType": "string"
                    },
                    "role": {
                        "bsonType": "string"
                    },
                    "rootDirId": {
                        "bsonType": "objectId"
                    },
                    maxStorageinBytes: {
                        bsonType: "long"
                    },
                    "deleted": {
                        "bsonType": "bool"
                    },
                    "__v": {
                        "bsonType": 'number'
                    }
                },
                additionalProperties: false,
            }
        }
    })

    db.createCollection("files", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "ext", "name", "parentDirId", "userId"],
                properties: {
                    "_id": {
                        "bsonType": "objectId"
                    },
                    "ext": {
                        "bsonType": "string"
                    },
                    "name": {
                        "bsonType": "string"
                    },
                    "parentDirId": {
                        "bsonType": "objectId"
                    },
                    "userId": {
                        "bsonType": "objectId"
                    },
                    "size": {
                        "bsonType": "number"
                    },
                    "createdAt": {
                        "bsonType": "date"
                    },
                    "updatedAt": {
                        "bsonType": "date"
                    },
                    "__v": {
                        "bsonType": 'number'
                    }
                },
                additionalProperties: false,
            }
        }
    })

    db.createCollection("directories", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "parentDirId", "userId"],
                properties: {
                    "_id": {
                        "bsonType": "objectId"
                    },
                    "name": {
                        "bsonType": "string"
                    },
                    "parentDirId": {
                        "bsonType": [
                            "null",
                            "objectId"
                        ]
                    },
                    "userId": {
                        "bsonType": "objectId"
                    },
                    "size": {
                        "bsonType": "number"
                    },
                    "createdAt": {
                        "bsonType": "date"
                    },
                    "updatedAt": {
                        "bsonType": "date"
                    },
                    "__v": {
                        "bsonType": 'number'
                    }
                },
                additionalProperties: false,
            }
        }
    })

    console.log("Schema addded to all collection");
} catch (error) {
    console.log(error);

    console.log("Error connecting to DB");
} finally {
    // console.log("Closing connection to DB");
    // await client.close();
}




