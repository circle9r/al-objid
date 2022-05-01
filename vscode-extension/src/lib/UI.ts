import { window } from "vscode";
import { LogLevel, Output } from "../features/Output";
import { AppManifest } from "./types";
import { CONFIG_FILE_NAME } from "./ObjIdConfig";
import { EXTENSION_NAME, LABELS } from "./constants";
import { EventLogEntry } from "./BackendTypes";

const CONSTANTS = {
    BACKEND: {
        CANNOT_COMMUNICATE: "Cannot communicate with the back-end API.",
    },

    AUTHORIZATION: {
        INCORRECT_KEY: "The authorization key you have provided is incorrect.",
        CANNOT_DEAUTHORIZE: "You cannot deauthorize app"
    }
};

export const UI = {
    general: {
        showNoWorkspacesOpenInfo: () =>
            window.showInformationMessage("There are no AL folders open. Nothing to do."),
        showReleaseNotes: (version: string) =>
            window.showInformationMessage(`AL Object ID Ninja has been updated to version ${version}.`,
                LABELS.BUTTON_SHOW_RELEASE_NOTES),
        showReleaseNotesNotAvailable: (version: string) =>
            window.showInformationMessage(`Release notes are not available for version ${version}`),
        showBackEndConfigurationError: () =>
            window.showErrorMessage("IMPORTANT! You are using a self-hosted back end but you have not configured the polling back-end URL. Your AL Object ID Ninja may not work correctly or may not work at all.", LABELS.BUTTON_LEARN_MORE),
    },

    backend: {
        showEndpointNotFoundError: (endpoint: string, isDefault: boolean) => {
            let message = CONSTANTS.BACKEND.CANNOT_COMMUNICATE;
            message += isDefault
                ? ` Make sure you are using the latest version of ${EXTENSION_NAME} extension or manually configure the API endpoint.`
                : " Make sure the API is available at the configured endpoint.";

            message += `\n\nEndpoint: ${endpoint}`;
            window.showErrorMessage(message);
        },
        showEndpointUnauthorizedError: (isDefault: boolean) => {
            let message = CONSTANTS.BACKEND.CANNOT_COMMUNICATE;
            message += isDefault
                ? " Your app authorization key may be missing or wrong, or your API key may be misconfigured."
                : " Make sure your API key is valid."
            window.showErrorMessage(message);
        }
    },

    sync: {
        showSuccessInfo: (manifest?: AppManifest) =>
            window.showInformationMessage(`Object IDs${manifest ? ` for ${manifest.name}` : ""} are now in sync with the Azure back end.`),
        showAreYouSure: async () =>
            window.showQuickPick(Object.values(LABELS.SYNC_ARE_YOU_SURE), {
                placeHolder: "Are you sure you want to replace existing object ID assignments?"
            }),
        showRepoNotClean: (name: string) =>
            window.showWarningMessage(
                `Repository ${name} is dirty or has staged content. To perform automatic synchronization, all your repositories must be clean.`,
                "OK",
                LABELS.BUTTON_LEARN_MORE),
        showHowToAutoSync: async () =>
            window.showQuickPick(Object.values(LABELS.AUTO_SYNC_PICK), {
                placeHolder: "How do you want to auto-sync your workspace?"
            }),
    },

    nextId: {
        showNoBackEndConsumptionInfo: async (name: string) =>
            window.showInformationMessage(
                `Azure back end has no information about consumed object IDs for ${name}. Do you want to synchronize?`,
                LABELS.BUTTON_SYNCHRONIZE,
                "No",
                LABELS.BUTTON_LEARN_MORE),
        showNumbersAboutToRunOut: (name: string, type: string, remaining: number) =>
            window.showWarningMessage(`Only ${remaining} IDs remain for ${type} objects in ${name} app.`, "OK", LABELS.BUTTON_DONT_SHOW_AGAIN),
        showDisabledOnlyForAppAndType: (name: string, type: string) =>
            window.showInformationMessage(`This warning is now disabled for ${type} objects in ${name} app. You will keep seeing it for other object types and other apps. If you want to disable it completely, switch off the "Show Range Warnings" configuration setting.`, "OK"),
        showNoMoreNumbersWarning: async () =>
            window.showWarningMessage("No more numbers are available for assignment. Do you want to synchronize?", LABELS.BUTTON_SYNCHRONIZE, "No"),
        showNoBackEndConsumptionInfoAlreadySaidNo: async () =>
            window.showInformationMessage(
                "You have already clicked 'No' for another app. Would you like to...",
                LABELS.BUTTON_DONT_ASK,
                "Keep reminding me for each app"
            ),
    },

    git: {
        showNotRepoWarning: (manifest: AppManifest, operation: string) =>
            window.showWarningMessage(`There is no Git repository for application "${manifest.name}. You cannot ${operation} for an app unless you use Git to track it.`, LABELS.BUTTON_LEARN_MORE),
        showNotCleanWarning: async (manifest: AppManifest, operation: string) =>
            window.showWarningMessage(`Git repository for application "${manifest.name}" is not clean. Please commit, stash, or undo your changes before ${operation}."`, LABELS.BUTTON_LEARN_MORE),
        showNoCurrentBranchError: async (name: string) =>
            window.showErrorMessage(`We could not detect your current branch for ${name}. This can happen if you use an old version of Git or if your repository is in detached head state. Please, make sure to use latest version of Git, or to check out to an actual branch, and then retry.`, LABELS.BUTTON_LEARN_MORE),
    },

    authorization: {
        showAlreadyAuthorizedError: async (manifest: AppManifest) =>
            window.showErrorMessage(`Application "${manifest.name}" is already authorized. You must first deauthorize it if you want to authorize it again.`),
        showIncorrectKeyWarning: (manifest: AppManifest) =>
            window.showWarningMessage(`${CONSTANTS.AUTHORIZATION.INCORRECT_KEY} ${CONSTANTS.AUTHORIZATION.CANNOT_DEAUTHORIZE} "${manifest.name}".`),
        showNotAuthorizedWarning: (manifest: AppManifest) =>
            window.showWarningMessage(`${CONSTANTS.AUTHORIZATION.CANNOT_DEAUTHORIZE} "${manifest.name}" because it is not authorized.`),
        showNoKeyError: (manifest: AppManifest) =>
            window.showErrorMessage(`You do not have an authorization key configured for app "${manifest.name}". Please make sure that ${CONFIG_FILE_NAME} file is present in the root folder of your app.`),
        showAuthorizationSuccessfulInfo: (manifest: AppManifest) =>
            window.showInformationMessage(`You have successfully authorized app "${manifest.name}" and we have committed it to your local Git repository. Please, push your changes to remote and create a pull request (if necessary) to share the authorization key with other developers on your team.`),
        showDeauthorizationSuccessfulInfo: (manifest: AppManifest) =>
            window.showInformationMessage(`You have successfully deauthorized app "${manifest.name}". Please make sure that ${CONFIG_FILE_NAME} file is present in the root folder of your app.`),
        showDeauthorizationFailedWarning: (manifest: AppManifest, error: string) =>
            window.showWarningMessage(`An error occurred while deleting the authorization file for app "${manifest.name}": ${error}`),
        showDeletedAuthorization: async (manifest: AppManifest) =>
            window.showErrorMessage(`Authorization file for ${manifest.name} was just deleted, and the app is still authorized. Please, make sure you understand the consequences.`, LABELS.BUTTON_LEARN_MORE),
        showUnauthorizedBranch: async (branch: string, manifest: AppManifest) =>
            window.showWarningMessage(`The ${branch} branch of ${manifest.name} does not contain authorization file and you won't be able to assign new object IDs.`, LABELS.BUTTON_LEARN_MORE),
    },

    log: {
        showMessage: (event: EventLogEntry, appName: string) => {
            if (!event || !event.user) {
                return;
            }
            let message = "";
            switch (event.eventType) {
                case "authorize":
                    message = `${event.user} authorized ${appName}.`;
                    break;
                case "deauthorize":
                    message = `${event.user} authorized ${appName}.`;
                    break;
                case "getNext":
                    message = `${event.user} created ${event.data.type} ${event.data.id} in ${appName}.`;
                    break;
                case "syncFull":
                    message = `${event.user} performed full synchronization for ${appName}.`;
                    break;
                case "syncMerge":
                    message = `${event.user} performed update synchronization for ${appName}.`;
                    break;
            }
            if (!message) {
                return;
            }
            Output.instance.log(message, LogLevel.Info);
            window.showInformationMessage(message)
        },
    }
}
