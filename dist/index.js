"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const server_1 = __importDefault(require("./configs/server"));
const router_1 = __importDefault(require("./routes/router"));
const init_1 = __importDefault(require("./controllers/database/init"));
const morgan_1 = __importDefault(require("morgan"));
const langSyncServerApp = (0, express_1.default)();
(() => __awaiter(void 0, void 0, void 0, function* () { return yield (0, init_1.default)(); }))();
langSyncServerApp.use((0, morgan_1.default)(":method :url :status - :response-time ms"));
langSyncServerApp.use(express_1.default.json());
langSyncServerApp.use(express_1.default.urlencoded({ extended: true }));
langSyncServerApp.use("/", router_1.default);
langSyncServerApp.listen(server_1.default.port, () => {
    console.log(`server is running on localhost:${server_1.default.port}`);
});
//# sourceMappingURL=index.js.map