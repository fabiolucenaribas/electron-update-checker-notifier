import { app, dialog, shell } from 'electron';
import type TypedEmitter from 'typed-emitter';

import axios from 'axios';
import { EventEmitter } from "events";
import gh from 'github-url-to-object';
import * as path from 'path';
import { gt as isVersionGreaterThan, gte as isVersionGreaterThanEqualTo, parse as parseVersion, SemVer } from "semver";
import { Language, Languages } from './languages';

let format = require('@stdlib/string-format');

export type UpdateCheckerNotifierEvents = {
    error: (error: Error, message?: string) => void
    "checking-for-update": () => void
    "update-not-available": (info: UpdateInfo) => void
    "update-available": (info: UpdateInfo) => void
    "this-is-last-update": (info: UpdateInfo) => void
}

export interface UpdateInfo {
    readonly currentVersion: string;
    readonly version: string;
    readonly descriptionRelease: string;
    readonly preRelease: boolean;
}

export interface Options {
    repository?: string,
    token?: string,
    debug?: boolean,
    enablePreRelease?: boolean,
    enableNewVersionAvailableDialog?: boolean,
    enableErrorDialog?: boolean,
    enableLatestVersionDialog?: boolean,
    language?: Language,
    logger?: Logger
}

export interface Logger {
    info(message?: any): void

    warn(message?: any): void

    error(message?: any): void

    debug?(message: string): void
}

interface GithubReleaseObject {
    tag_name: string,
    body: string,
    html_url: string,
    prerelease: boolean
}

export class UpdateCheckerNotifier extends (EventEmitter as new () => TypedEmitter<UpdateCheckerNotifierEvents>) {

    /**
     * The current application version.
     */
    readonly currentVersion!: SemVer

    /**
     * Optional, use repository field from your package.json when not specified
     * `user/repo`
     */
    public repository!: string

    /**
     * Optional, GitHub api access token
     */
    public token!: string;

    /**
     * Optional, default `false`, allows to check for updates during development as well
     * @default false
     */
    public debug = false

    /**
    * Optional, notify pre-release version
    * @default false
    */
    public enablePreRelease = false

    /**
     * Optional, notify when new version available, otherwise remain silent 
     * @default true
     */
    public enableNewVersionAvailableDialog = true

    /**
     * Optional, notifies you when you are already running the latest version.
     * @default false
     */
    public enableLatestVersionDialog = false

    /**
     * Optional, notifies you when an error occurs
     * @default false
     */
    public enableErrorDialog = false

    /**
     * Optional, default Language.EN
     * @default Language.EN
     */
    get language(): Language {
        return this._language
    }

    set language(value: Language) {
        this._language = value;
    }

    private _language: Language = Language.EN;

    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger(): Logger | null {
        return this._logger
    }

    set logger(value: Logger | null) {
        this._logger = value == null ? new NoOpLogger() : value
    }

    private _logger: Logger = console

    private translation: any

    constructor() {
        super();
        this.loadTranslation();

        const currentVersionString = app.getVersion();
        const currentVersion = parseVersion(currentVersionString);

        if (currentVersion == null) {
            throw Error(format(this.translation.error.currentVersionInvalid, currentVersionString));
        }
        this.currentVersion = currentVersion;
    }

    updateNotification(options?: Options) {
        this.loadOptions(options);
        this.loadTranslation();

        if (app.isReady()) {
            this.checkForUpdates()
        } else {
            app.on('ready', () => {
                this.checkForUpdates()
            })
        }
    }

    private loadOptions(options?: Options) {
        if (!options) return

        if (options.repository)
            this.repository = options.repository

        if (options.token)
            this.token = options.token

        if (options.debug)
            this.debug = options.debug

        if (options.enablePreRelease)
            this.enablePreRelease = options.enablePreRelease

        if (options.enableNewVersionAvailableDialog)
            this.enableNewVersionAvailableDialog = options.enableNewVersionAvailableDialog

        if (options.enableErrorDialog)
            this.enableErrorDialog = options.enableErrorDialog

        if (options.enableLatestVersionDialog)
            this.enableLatestVersionDialog = options.enableLatestVersionDialog

        if (options.language)
            this.language = options.language

        if (options.logger)
            this.logger = options.logger

    }

    private async checkForUpdates() {
        if (!app.isPackaged && !this.debug) {
            this._logger.info(this.translation.warn.skipCheckForUpdates)
            return
        }

        if (!this.repository) {
            const pkg = require(path.join(app.getAppPath(), 'package.json'))
            const ghObj = gh(pkg.repository)

            if (!ghObj) {
                let error = new Error(this.translation.error.urlNotFound);
                this.error(error);
                this._logger.error(this.translation.error.urlNotFound)
                throw error;
            }

            this.repository = ghObj.user + '/' + ghObj.repo
        }

        let latestRelease: null | GithubReleaseObject = null;

        try {
            this.emit("checking-for-update")
            this._logger.info(this.translation.info.checkingForUpdate);

            const { data: releases } = await axios.get(`https://api.github.com/repos/${this.repository}/releases`,
                {
                    headers: this.token ? { authorization: `token ${this.token}` } : {},
                },
            )

            latestRelease = releases[0] as GithubReleaseObject
        } catch (error) {
            this.error(error);
            this._logger.error(this.translation.error.checkingUpdate)

            if (this.enableErrorDialog) {
                this.showDialog(this.translation.error.checkingUpdate, 'error');
            }
        }

        if (!latestRelease) return

        const latestVersion = parseVersion(latestRelease.tag_name);

        if (latestVersion == null) {
            let error = Error(format(this.translation.error.lastVersionInvalid, latestRelease.tag_name))
            this.error(error);
            throw error;
        }

        if (latestRelease.prerelease && !this.enablePreRelease) {
            this._logger.info(this.translation.info.skippingPreRelease);
            return
        }

        const updateInfo: UpdateInfo = { version: latestVersion.version, currentVersion: this.currentVersion.version, descriptionRelease: latestRelease.body, preRelease: latestRelease.prerelease };

        if (isVersionGreaterThan(latestVersion, this.currentVersion)) {
            this.emit("update-available", updateInfo)
            this._logger.info(format(this.translation.info.newVersionAvailableMessage, latestVersion.version));

            if (this.enableNewVersionAvailableDialog) {
                this.showUpdateDialog(latestRelease);
            }
        } else if (isVersionGreaterThanEqualTo(this.currentVersion, latestVersion)) {
            this.emit("this-is-last-update", updateInfo)
            this._logger.info(this.translation.info.runningLastVersion);

            if (this.enableLatestVersionDialog) {
                this.showDialog(this.translation.info.runningLastVersion);
            }
        } else {
            this.emit("update-not-available", updateInfo)
            this._logger.info(this.translation.warn.updateNotAvailable);
        }
    }

    private showUpdateDialog(release: GithubReleaseObject) {
        let detail = this.translation.dialogNewVersionAvailableDetail.trim();

        dialog.showMessageBox(
            {
                title: app.getName(),
                type: 'info',
                message: this.translation.dialogNewVersionAvailableMessage,
                detail: format(detail, app.getVersion(), release.tag_name),
                buttons: [this.translation.download, this.translation.later],
                defaultId: 0,
                cancelId: 1,
            }
        ).then(({ response }) => {
            if (response === 0) {
                setImmediate(() => {
                    shell.openExternal(release.html_url)
                })
            }
        }).catch((error) => {
            this._logger.error(error)
            throw new Error(error)
        })
    }

    private showDialog = (detail: string, type: ('none' | 'info' | 'error' | 'question' | 'warning') = 'info') => {
        dialog.showMessageBox(
            {
                title: app.getName(),
                message: this.translation.updateChecker,
                buttons: [this.translation.close],
                defaultId: 0,
                cancelId: 0,
                type,
                detail,
            }
        )
    }

    private error(error: any) {
        this.emit('error', error)
        this._logger.error(error)
    }

    private loadTranslation() {
        const translation = Languages[this._language]
        this.translation = translation ? translation : Languages[Language.EN]
    };
}


/** @private */
class NoOpLogger implements Logger {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(message?: any) {
        // ignore
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(message?: any) {
        // ignore
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(message?: any) {
        // ignore
    }
}