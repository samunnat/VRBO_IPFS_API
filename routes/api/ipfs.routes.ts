const express = require('express');

const { getLatestFolder, publishFolder, deleteFolder } = require('../../utils/ipfsClient');

const router = express.Router();

router.post("/pull", (req, res) => {
  console.log(req.body);

  const [folderHash, propertyID] = req.body;

  getLatestFolder(folderHash, propertyID)
  .then((success: boolean) => {
    if (success) {
      res.status(200).send(`Successfully pulled ${propertyID} folder`);

      publishFolder(`/${propertyID}`);
    }
    else {
      res.status(500).send(`Failed to pull ${propertyID} folder`);
    }
  })
  .catch((err) => {
    res.status(500).send(`Failed to pull ${propertyID} folder`);
  });
});

router.post("/delete", (req, res) => {
  console.log(req.body);

  const [propertyID] = req.body;

  deleteFolder(propertyID)
  .then((success: boolean) => {
    if (success) {
      res.status(200).send(`Successfully deleted ${propertyID}`);
    }
    else {
      res.status(500).send(`Failure deleting ${propertyID}`);
    }
  })
})

module.exports = router;