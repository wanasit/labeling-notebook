/// <reference types="react-scripts" />

type AnyObject = { [key: string]: any }; //TODO: replace anything using this


declare module 'react-image-annotation' {
    export = <any>{};
}

declare module 'jsoneditor-react' {
    export class JsonEditor extends React.Component<JsonEditorProps> {
        jsonEditor: any;
    }

    type Mode = 'tree' | 'view' | 'form' | 'code' | 'text';

    interface JsonEditorProps {
        value: any;
        /** Set the editor mode. Default 'tree' */
        mode?: Mode;
        /** Initial field name for root node */
        name?: string;
        /** Validate the JSON object against a JSON schema. */
        schema?: any;
        /** Schemas that are referenced using the $ref property */
        schemaRefs?: object;
        /**
         * If true, object keys in 'tree', 'view' or 'form' mode list be listed alphabetically
         * instead by their insertion order.
         * */
        sortObjectKeys?: boolean;

        /** Set a callback function triggered when json in the JSONEditor change */
        onChange?: (value: any) => void;
        /**
         * Set a callback function triggered when an error occurs.
         * Invoked with the error as first argument.
         * The callback is only invoked for errors triggered by a users action,
         * like switching from code mode to tree mode or clicking
         * the Format button whilst the editor doesn't contain valid JSON.
         */
        onError?: (error: any) => void;
        /** Set a callback function triggered right after the mode is changed by the user. */
        onModeChange?: (mode: Mode) => void;
        onClassName?: (args: { path: any; field: str; value: any }) => void;

        /** Provide a version of the Ace editor. Only applicable when mode is code */
        ace?: object;
        /** Provide a instance of ajv,the library used for JSON schema validation. */
        ajv?: object;
        /** Set the Ace editor theme, uses included 'ace/theme/jsoneditor' by default. */
        theme?: string;
        /**
         * Enables history, adds a button Undo and Redo to the menu of the JSONEditor.
         * Only applicable when mode is 'tree' or 'form'. Default to false
         */
        history?: boolean;
        /**
         * Adds navigation bar to the menu
         * the navigation bar visualize the current position on the
         * tree structure as well as allows breadcrumbs navigation. Default to true
         */
        navigationBar?: boolean;
        /**
         * Adds status bar to the buttom of the editor
         * the status bar shows the cursor position and a count of the selected characters.
         * Only applicable when mode is 'code' or 'text'. Default to true
         */
        statusBar?: boolean;
        /** Enables a search box in the upper right corner of the JSONEditor. Default to true */
        search?: boolean;
        /** Create a box in the editor menu where the user can switch between the specified modes. */
        allowedModes?: Mode[];

        /** Html element, or react element to render */
        tag?: string | HTMLElement;
        /** html element custom props */
        htmlElementProps?: object;
        /** callback to get html element reference */
        innerRef?: (ref: any) => void;
    }
}

declare module 'react-keyed-file-browser' {
    //#region icons
    export interface IIcons {
        File?: JSX.Element,
        Image?: JSX.Element,
        Video?: JSX.Element,
        Audio?: JSX.Element,
        Archive?: JSX.Element,
        Word?: JSX.Element,
        Excel?: JSX.Element,
        PowerPoint?: JSX.Element,
        Text?: JSX.Element,
        PDF?: JSX.Element,
        Rename?: JSX.Element,
        Folder?: JSX.Element,
        FolderOpen?: JSX.Element,
        Delete?: JSX.Element,
        Loading?: JSX.Element,
        Download?: JSX.Element,
    }

    export const Icons = {
        FontAwesome: (version: 4 | 5) => IIcons
    }

    //#endregion icons

    export interface FileBrowserFile {
        key: string,
        modified?: number | string,
        size?: number | string,
    }

    export interface FileBrowserFolder extends FileBrowserFile {
    }

    //#region props
    export interface TableHeaderRenderProps {
        select?: (fileKey: string) => void,
        fileKey?: string,

        connectDropTarget?: (headerElem: JSX.Element) => JSX.Element,
        isOver?: boolean,
        isSelected?: boolean,

        browserProps?: {
            createFiles?: (files: FileBrowserFile[], prefix: string) => void
            moveFolder?: (oldFolderKey: string, newFolderKey: string) => void,
            moveFile?: (oldFileKey: string, newFileKey: string) => void,
        },
    }

    export interface FilterRendererProps {
        value: string,
        updateFilter: (newValue: string) => void,
    }

    export interface FileBrowserProps {
        files: FileBrowserFile[],
        actions?: JSX.Element,
        showActionBar?: boolean,
        canFilter?: boolean,
        noFilesMessage?: string | JSX.Element,

        group?: () => void,
        sort?: () => void,

        icons?: IIcons,

        nestChildren?: boolean,
        renderStyle?: 'list' | 'table',

        startOpen?: boolean,

        headerRenderer?: (() => JSX.Element) | null,
        headerRendererProps?: TableHeaderRenderProps,
        filterRenderer?: () => JSX.Element,
        filterRendererProps?: FilterRendererProps,
        fileRenderer?: () => JSX.Element,
        fileRendererProps?: AnyObject,
        folderRenderer?: () => JSX.Element,
        folderRendererProps?: AnyObject,
        detailRenderer?: () => JSX.Element,
        detailRendererProps?: AnyObject,
        actionRenderer?: () => JSX.Element,
        confirmDeletionRenderer?: () => void,
        confirmMultipleDeletionRenderer?: () => void,

        onCreateFiles?: (files: File[], prefix: string) => void
        onCreateFolder?: (key: string) => void,
        onMoveFile?: (oldFileKey: string, newFileKey: string) => void,
        onMoveFolder?: (oldFolderKey: string, newFolderKey: string) => void,
        onRenameFile?: (oldFileKey: string, newFileKey: string) => void,
        onRenameFolder?: (oldFolderKey: string, newFolderKey: string) => void,
        onDeleteFile?: (fileKey: string) => void,
        onDeleteFolder?: (folderKey: string) => void,
        onDownloadFile?: (keys: string[]) => void,

        onSelect?: (fileOrFolder: FileBrowserFile | FileBrowserFolder) => void,
        onSelectFile?: (file: FileBrowserFile) => void,
        onSelectFolder?: (folder: FileBrowserFolder) => void,

        onPreviewOpen?: (file: FileBrowserFile) => void,
        onPreviewClose?: (file: FileBrowserFile) => void,

        onFolderOpen?: (folder: FileBrowserFolder) => void,
        onFolderClose?: (folder: FileBrowserFolder) => void,
    }

    //#endregion props

    export class FileBrowser extends React.Component<FileBrowserProps> {
    }

    export default FileBrowser;
}