"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProgressDetails = exports.statusToMark = exports.generateProgressSummary = exports.generateProgressReport = void 0;
var generateProgressReport = function (subprojects, checksStatusLookup) {
    var report = {
        completed: [],
        expected: [],
        failed: [],
        missing: [],
        needAction: [],
        running: [],
        succeeded: [],
    };
    var lookup = {};
    subprojects.forEach(function (proj) {
        proj.checks.forEach(function (check) {
            var _a, _b, _c, _d, _e, _f;
            /* eslint-disable security/detect-object-injection */
            if (!(check.id in lookup)) {
                lookup[check.id] = true;
                (_a = report.expected) === null || _a === void 0 ? void 0 : _a.push(check.id);
                if (check.id in checksStatusLookup) {
                    var status_1 = checksStatusLookup[check.id];
                    if (status_1 === "success") {
                        (_b = report.completed) === null || _b === void 0 ? void 0 : _b.push(check.id);
                        (_c = report.succeeded) === null || _c === void 0 ? void 0 : _c.push(check.id);
                    }
                    if (status_1 === "failure") {
                        (_d = report.completed) === null || _d === void 0 ? void 0 : _d.push(check.id);
                        (_e = report.failed) === null || _e === void 0 ? void 0 : _e.push(check.id);
                    }
                    if (status_1 === "pending") {
                        (_f = report.running) === null || _f === void 0 ? void 0 : _f.push(check.id);
                    }
                }
            }
            /* eslint-enable security/detect-object-injection */
        });
    });
    return report;
};
exports.generateProgressReport = generateProgressReport;
var generateProgressSummary = function (subprojects, checksStatusLookup) {
    var _a, _b;
    var report = (0, exports.generateProgressReport)(subprojects, checksStatusLookup);
    var message = "Progress: ".concat((_a = report.completed) === null || _a === void 0 ? void 0 : _a.length, " completed, ").concat((_b = report.running) === null || _b === void 0 ? void 0 : _b.length, " pending");
    return message;
};
exports.generateProgressSummary = generateProgressSummary;
var statusToMark = function (check, checksStatusLookup) {
    if (check in checksStatusLookup) {
        if (checksStatusLookup[check] == "success") {
            return "✅";
        }
        if (checksStatusLookup[check] == "failure") {
            return "❌";
        }
    }
    else {
        return "⌛";
    }
    return "❓";
};
exports.statusToMark = statusToMark;
/**
 * Generates a progress report for currently finished checks
 * which will be posted in the status check report.
 *
 * @param subprojects The subprojects that the PR matches.
 * @param checksStatusLookup The lookup table for checks status.
 */
var generateProgressDetails = function (subprojects, checksStatusLookup) {
    var progress = "";
    // these are the required subprojects
    subprojects.forEach(function (subproject) {
        progress += "Summary for sub-project ".concat(subproject.id, "\n");
        // for padding
        var longestLength = Math.max.apply(Math, (subproject.checks.map(function (check) { return check.id.length; })));
        subproject.checks.forEach(function (check) {
            var mark = (0, exports.statusToMark)(check.id, checksStatusLookup);
            var status = (check.id in checksStatusLookup) ? checksStatusLookup[check.id] : 'no_status';
            status = status || 'undefined';
            progress += "".concat(check.id.padEnd(longestLength, ' '), " | ").concat(mark, " | ").concat(status.padEnd(12, ' '), "\n");
        });
        progress += "\n\n";
    });
    progress += "\n";
    progress += "## Currently received checks\n";
    var longestLength = 1;
    for (var availableCheck in checksStatusLookup) {
        longestLength = Math.max(longestLength, availableCheck.length);
    }
    for (var availableCheck in checksStatusLookup) {
        var mark = (0, exports.statusToMark)(availableCheck, checksStatusLookup);
        var status_2 = (availableCheck in checksStatusLookup) ? checksStatusLookup[availableCheck] : 'no_status';
        status_2 = status_2 || 'undefined';
        progress += "".concat(availableCheck.padEnd(longestLength, ' '), " | ").concat(mark, " | ").concat(status_2.padEnd(12, ' '), "\n");
    }
    progress += "\n";
    return progress;
};
exports.generateProgressDetails = generateProgressDetails;
