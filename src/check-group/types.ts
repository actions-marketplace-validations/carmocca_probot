/**
 * Check Group data types
 * @module CheckGroupTypes
 */

/**
 * The status of the current running checks
 * which will then be converted to the report
 * posted on the check.
 */
export interface ProgressReport {
  completed?: string[];
  expected?: string[];
  failed?: string[];
  missing?: string[];
  needAction?: string[];
  running?: string[];
  succeeded?: string[];
}

export interface SubProjPath {
  location: string;
  hit?: boolean;
  matches?: string[];
}

export interface SubProjCheck {
  /**
   * The ID of the check which should
   * match how they are posted on GitHub.
   */
  id: string;
  /**
   * If the check has been satified.
   *
   * Note: This field should get filled when the
   * app is analyzing the pull requests.
   */
  satisfied?: boolean;
  /**
   * The currently posted status of the check.
   */
  status?: string;
}

export interface SubProjConfig {
  /**
   * The ID for the sub-project
   */
  id: string;
  /**
   * The paths that defines
   * this sub-project within
   * the repository.
   */
  paths: SubProjPath[];
  /**
   * A list of check IDs that
   * are expected to pass for
   * the sub-project.
   */
  checks: SubProjCheck[];
}

/**
 * The information to show on the check status detail
 * page to help developers understand the issues.
 *
 * TODO(@tianhaoz95): add field for details
 * TODO(@tianhaoz95): rename the field names to be more specific
 * TODO(@tianhaoz95): add a enum field to indicate the type warning/fatal/etc
 */
export interface DebugInfo {
  /**
   * A bit to indicate if there is an error in config
   * parsing phase since this is not considered as a
   * fatal error.
   *
   * ! Deprecate this field as it is not being used.
   */
  configError?: boolean;
  /**
   * A message to indicate the error in config parsing
   * which can be helpful for debugging.
   */
  configErrorMsg?: string;
}

export interface CheckGroupConfig {
  /**
   * The sub-project configurations.
   */
  subProjects: SubProjConfig[];
  /**
   * The name that will be displayed on the GitHub
   * pull request check list. This requested to be
   * customizable in #457 to make it more informative
   * for developers that are less familiar with the
   * workflows.
   */
  customServiceName: string;
  /**
   * Extra debug information that will be used to
   * help developers to debug issues.
   */
  debugInfo: DebugInfo[];
}

/**
 * The result of the processing pipeline.
 */
export type CheckResult = 'all_passing' | 'has_failure' | 'pending';

export interface CheckRunData {
  name: string;
  status: string;
  conclusion: string | undefined;
}
