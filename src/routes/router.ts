import express from "express";

let router = express.Router();

import saveFile from "../controllers/users/save_file";
import getSavedPartitionedJsonOfUser from "../controllers/users/get_saved_partitioned_json_of_user";
import processTranslations from "../controllers/translate/process_translations";
import processCliException from "../controllers/cli/process_exceptions";

import multer from "multer";
let upload = multer({ dest: "uploads/" });

router.post(":fileType/save-file", upload.single("sourceFile"), saveFile);

router.get("/get-partitioned-json-of-user", getSavedPartitionedJsonOfUser);

router.post("/process-translation", processTranslations);

router.post("/log-exception", processCliException);

export default router;
