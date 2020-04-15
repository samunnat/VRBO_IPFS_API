import express from "express";

import {
  getLatestFolder,
  publishFolder,
  deleteFolder
} from "../../utils/ipfsClient";

const router = express.Router();

router.post("/pull", (req, res) => {
  console.log(req.body);

  const { folderHash, propertyID } = req.body;

  getLatestFolder(folderHash, propertyID)
    .then((success: boolean) => {
      if (success) {
        res.status(200).send(`Successfully pulled folder ${propertyID}`);

        publishFolder(`/${propertyID}`);
      } else {
        res.status(500).send(`Failed to pull folder ${propertyID}`);
      }
    })
    .catch(err => {
      res.status(500).send(`Failed to pull folder ${propertyID}: ${err}`);
    });
});

router.post("/delete", (req, res) => {
  console.log(req.body);

  const { propertyID } = req.body;

  deleteFolder(`/${propertyID}`).then((success: boolean) => {
    if (success) {
      res.status(200).send(`Successfully deleted ${propertyID}`);
    } else {
      res.status(500).send(`Failure deleting ${propertyID}`);
    }
  });
});

export default router;
