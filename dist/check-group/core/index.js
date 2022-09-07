"use strict";
/**
 * @module Core
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchConfig = exports.CheckGroup = void 0;
var utils_1 = require("../utils");
var core = __importStar(require("@actions/core"));
var config_getter_1 = require("./config_getter");
Object.defineProperty(exports, "fetchConfig", { enumerable: true, get: function () { return config_getter_1.fetchConfig; } });
var utils_2 = require("../utils");
var utils_3 = require("../utils");
/**
 * The orchestration class.
 */
var CheckGroup = /** @class */ (function () {
    function CheckGroup(pullRequestNumber, config, context, sha) {
        this.pullRequestNumber = pullRequestNumber;
        this.config = config;
        this.context = context;
        this.sha = sha;
    }
    CheckGroup.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filenames, subprojs, expectedChecks, interval, tries, conclusion, loop;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.files()];
                    case 1:
                        filenames = _a.sent();
                        core.info("Files are: ".concat(JSON.stringify(filenames)));
                        subprojs = (0, utils_2.matchFilenamesToSubprojects)(filenames, this.config.subProjects);
                        core.debug("Matching subprojects are: ".concat(JSON.stringify(subprojs)));
                        if (core.isDebug()) {
                            expectedChecks = collectExpectedChecks(subprojs);
                            core.debug("Expected checks are: ".concat(JSON.stringify(expectedChecks)));
                        }
                        interval = parseInt(core.getInput('interval'));
                        core.info("Check interval: ".concat(interval));
                        tries = 0;
                        conclusion = undefined;
                        loop = setInterval(function (that) {
                            return __awaiter(this, void 0, void 0, function () {
                                var postedChecks, summary, details, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            if (conclusion === "success") {
                                                core.info("Required checks were successful!");
                                                clearInterval(loop);
                                            }
                                            tries += 1;
                                            return [4 /*yield*/, getPostedChecks(that.context, that.sha)];
                                        case 1:
                                            postedChecks = _a.sent();
                                            core.debug("postedChecks: ".concat(JSON.stringify(postedChecks)));
                                            conclusion = (0, utils_3.satisfyExpectedChecks)(subprojs, postedChecks);
                                            summary = (0, utils_1.generateProgressSummary)(subprojs, postedChecks);
                                            details = (0, utils_1.generateProgressDetails)(subprojs, postedChecks, that.config);
                                            core.info("".concat(that.config.customServiceName, " conclusion: '").concat(conclusion, "' after ").concat(tries, " tries:\n").concat(summary, "\n").concat(details));
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_1 = _a.sent();
                                            core.setFailed(error_1);
                                            clearInterval(loop);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        }, interval * 1000, this);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a list of files that are modified in
     * a pull request.
     */
    CheckGroup.prototype.files = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequestFiles, filenames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.octokit.paginate(this.context.octokit.pulls.listFiles, this.context.repo({ "pull_number": this.pullRequestNumber }), function (response) { return response.data; })];
                    case 1:
                        pullRequestFiles = _a.sent();
                        filenames = [];
                        pullRequestFiles.forEach(function (pullRequestFile) {
                            filenames.push(pullRequestFile.filename);
                        });
                        return [2 /*return*/, filenames];
                }
            });
        });
    };
    return CheckGroup;
}());
exports.CheckGroup = CheckGroup;
/**
 * Fetches a list of already finished
 * checks.
 */
var getPostedChecks = function (context, sha) { return __awaiter(void 0, void 0, void 0, function () {
    var checkRuns, checkNames;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, context.octokit.paginate(context.octokit.checks.listForRef, context.repo({ ref: sha }), function (response) { return response.data; })];
            case 1:
                checkRuns = _a.sent();
                core.debug("checkRuns: ".concat(JSON.stringify(checkRuns)));
                checkNames = {};
                checkRuns.forEach(function (checkRun) {
                    var conclusion = checkRun.conclusion ? checkRun.conclusion : "pending";
                    checkNames[checkRun.name] = conclusion;
                });
                return [2 /*return*/, checkNames];
        }
    });
}); };
var collectExpectedChecks = function (configs) {
    // checks: subprojects[]
    var requiredChecks = {};
    configs.forEach(function (config) {
        config.checks.forEach(function (check) {
            if (check.id in requiredChecks) {
                requiredChecks[check.id].push(config.id);
            }
            else {
                requiredChecks[check.id] = [config.id];
            }
        });
    });
    return requiredChecks;
};
