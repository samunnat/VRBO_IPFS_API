import { performance } from "perf_hooks";

import IPFS from "ipfs-http-client";
// import logger from './logger';

const ipfsConfig = { protocol: "http", host: "127.0.0.1", port: "5001" };

/**
 * IPFS HTTP Client that interfaces with user's locally running node
 */
const ipfsClient = IPFS(ipfsConfig);

interface LogObject {
  status: number;
  error: string;
  statusText: string;
  authData?: any;
}

const logError = function(logObj: LogObject): void {
  console.log(logObj.error);
  // var authData;
  // Auth.currentSession().then(data => {
  //     authData = data.getIdToken();
  // }).catch(err => {
  //     authData = err;
  // });

  // logObj.authData = authData;

  // logger.push({
  //     tag: 'error',
  //     page: 'IPFS',
  //     details: logObj
  // });
};

/**
 * Updates VRBO_Capstone folder to the latest version
 * @param folderHash IPFS hash of the latest folder version ("/ipfs/...")
 * @param folderName Name of root folder (e.g. "Property1")
 * @returns Whether the folder retrieval/update succeeded or not
 */
export const getLatestFolder = function(
  folderHash: string,
  folderName: string
): Promise<boolean> {
  console.log(`trying to get ${folderHash}`);

  const start = performance.now();

  return ipfsClient.files
    .cp(`/ipfs/${folderHash}`, `/${folderName}_tmp`)
    .then(() => {
      return ipfsClient.files.stat(`/${folderName}`).catch(() => {
        return false;
      });
    })
    .then((folderInfo: any) => {
      if (!folderInfo) {
        // Property's folder doesn't exist on node - can skip its deletion step
        return true;
      }

      return ipfsClient.files.rm(`/${folderName}`, { recursive: true });
    })
    .then(() => {
      return ipfsClient.files.mv(`/${folderName}_tmp`, `/${folderName}`);
    })
    .then(() => {
      console.log(`successfully got ${folderName}`);
      return true;
    })
    .catch(err => {
      logError({
        status: 500,
        error: err,
        statusText: `getLatestFolder FAILURE: ${folderName}`
      });

      return false;
    })
    .finally(() => {
      const end = performance.now();

      console.log(
        `getting IPFS Folder ${folderName} ran for ${end - start} milliseconds.`
      );
    });
};

/**
 * Will update the key-value store of property_id->ipfs_hash with current folder's hash
 * and broadcast the new folder hash to the IPFS DHT
 * @param folderPath IPFS MFS path to folder (e.g. '/Property1')
 * @returns Whether publish was successful or not
 */
export const publishFolder = function(folderPath: string): Promise<string> {
  const start = performance.now();

  let folderHash = null;

  return getFileHash(folderPath)
    .then((hash: string) => {
      if (!hash) {
        return false;
      }

      folderHash = hash;

      console.log(`Providing ${folderPath}: ${hash}`);
      return ipfsClient.dht.provide(hash, { recursive: true });
    })
    .then(() => {
      console.log("Successfully broadcast record to the dht");

      return folderHash;
    })
    .catch((err: any) => {
      logError({
        status: 500,
        error: err,
        statusText: `publishFolder FAILURE: ${folderPath}`
      });

      return null;
    })
    .finally(() => {
      const end = performance.now();
      console.log(
        `publishing IPFS Folder ${folderPath} ran for ${end -
          start} milliseconds.`
      );
    });
};

/**
 * Returns the CID of a file/folder stored in IPFS MFS
 * @param ipfsFilePath MFS path to file/folder (e.g. '/21' or '/21/test.jpg')
 * @returns CID hash of file/folder
 */
const getFileHash = function(ipfsFilePath: string): Promise<string> {
  return ipfsClient.files
    .stat(ipfsFilePath)
    .then((fileInfo: any) => {
      const fileHash = fileInfo.cid.toString();
      return fileHash;
    })
    .catch((err: any) => {
      logError({
        status: 500,
        error: err,
        statusText: `getFileHash FAILURE ${ipfsFilePath}`
      });

      return null;
    });
};

export const deleteFolder = function(folderPath: string): Promise<boolean> {
  return ipfsClient.files
    .rm(folderPath, { recursive: true })
    .then(() => {
      return true;
    })
    .catch((err: any) => {
      if (err.message.includes("file does not exist")) {
        return true;
      }

      logError({
        status: 500,
        error: err,
        statusText: `deleteFolder FAILURE: ${folderPath}`
      });

      return false;
    });
};
