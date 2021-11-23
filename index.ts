import * as gcp from "@pulumi/gcp";

let greeting = new gcp.cloudfunctions.HttpCallbackFunction(
  "greeting",
  (req, res) => {
    // Change this code to fit your needs!
    res.send(`Greetings from ${req.body.name || "Google Cloud Functions"}!`);
  }
);

export let url = greeting.httpsTriggerUrl;
