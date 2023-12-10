import express from "express";

let router = express.Router();

import saveFile from "../controllers/users/save_file";
import fileOperationOfUser from "../controllers/users/file_operation_of_user";
import processTranslations from "../controllers/translate/process_translations";
import processCliException from "../controllers/cli/process_exceptions";

import multer from "multer";
import userInfo from "../controllers/users/user_info";
let upload = multer({ dest: "uploads/" });

router.post("/:fileType/save-file", upload.single("sourceFile"), saveFile);

router.get("/file-operation-of-user", fileOperationOfUser);

router.post("/process-translation", processTranslations);

router.post("/log-exception", processCliException);

router.post("/user-info", userInfo);

export default router;
