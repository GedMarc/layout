import "jquery";

declare global {
    namespace JQueryLayout {
        type PaneName = "north" | "south" | "east" | "west" | "center";
        type BorderPaneName = Exclude<PaneName, "center">;
        type Breakpoint = "xl" | "lg" | "md" | "sm" | "xs";
        type ButtonAction = "toggle" | "open" | "close" | "pin" | "toggle-slide" | "open-slide";
        type PaneSize = number | `${number}%` | "auto";
        type Speed = number | "slow" | "normal" | "fast" | null;
        type CallbackResult = boolean | "abort" | void;
        type NamedCallback = string;
        type ElementTarget = JQuery.Selector | Element | JQuery;

        interface Insets {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        }

        interface Dimensions {
            innerWidth: number;
            innerHeight: number;
            outerWidth: number;
            outerHeight: number;
            layoutWidth: number;
            layoutHeight: number;
            offsetLeft?: number;
            offsetTop?: number;
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
            width?: number;
            height?: number;
            inset?: Required<Insets>;
            css?: Record<string, string | number>;
            tagName?: string;
        }

        interface ResponsiveSizes extends Record<Breakpoint, number> {}

        interface ResponsiveOptions {
            enabled?: boolean;
            when?: Breakpoint;
            sizes?: Partial<ResponsiveSizes>;
        }

        interface EffectSettings {
            duration?: Speed;
            easing?: string;
            direction?: "up" | "down" | "left" | "right" | string;
            [key: string]: unknown;
        }

        interface EffectDefinition {
            all?: EffectSettings;
            north?: EffectSettings;
            south?: EffectSettings;
            east?: EffectSettings;
            west?: EffectSettings;
            center?: EffectSettings;
        }

        type Effects = Record<string, EffectDefinition>;

        interface ZIndexes {
            pane_normal?: number;
            content_mask?: number;
            resizer_normal?: number;
            pane_sliding?: number;
            pane_animate?: number;
            resizer_drag?: number;
        }

        interface ErrorMessages {
            pane?: string;
            selector?: string;
            addButtonError?: string;
            containerMissing?: string;
            centerPaneMissing?: string;
            noContainerHeight?: string;
            callbackError?: string;
        }

        interface PaneTips {
            Open?: string;
            Close?: string;
            Resize?: string;
            Slide?: string;
            Pin?: string;
            Unpin?: string;
            noRoomToOpen?: string;
            minSizeWarning?: string;
            maxSizeWarning?: string;
        }

        interface ContentState {
            top?: number;
            bottom?: number;
            height?: number;
            numFooters?: number;
            hiddenFooters?: number;
            spaceAbove?: number;
            spaceBelow?: number;
        }

        interface PaneState extends Partial<Dimensions> {
            childIdx: number;
            size?: number;
            minSize?: number;
            maxSize?: number;
            isClosed?: boolean;
            isOpen?: boolean;
            isVisible?: boolean;
            isHidden?: boolean;
            isResizing?: boolean;
            isMoving?: boolean;
            isSliding?: boolean;
            isShowing?: boolean;
            isHiding?: boolean;
            noRoom?: boolean;
            noVerticalRoom?: boolean;
            wasOpen?: boolean;
            autoResize?: boolean;
            responded?: boolean;
            resizerLength?: number;
            resizerPosition?: { min?: number; max?: number };
            content?: ContentState;
            pins?: ElementTarget[];
            [key: string]: unknown;
        }

        interface StateDataPane {
            size?: PaneSize;
            initClosed?: boolean;
            initHidden?: boolean;
            children?: Record<string, StateData>;
            [key: string]: unknown;
        }

        type StateData = Partial<Record<PaneName, StateDataPane>>;

        interface LayoutState {
            id: string;
            initialized: boolean;
            paneResizing: boolean;
            panesSliding: Partial<Record<BorderPaneName, boolean>>;
            container: Dimensions;
            north: PaneState;
            south: PaneState;
            east: PaneState;
            west: PaneState;
            center: PaneState;
            creatingLayout?: boolean;
            stateData?: StateData;
            [key: string]: unknown;
        }

        type PaneCallback = (
            pane: PaneName,
            paneElement: JQuery,
            state: PaneState,
            options: PaneOptions,
            layoutName: string
        ) => CallbackResult;

        type LayoutCallback = (
            instance: Instance,
            state: LayoutState,
            options: Options,
            layoutName: string
        ) => CallbackResult;

        type PaneCallbackOption = PaneCallback | NamedCallback | null;
        type LayoutCallbackOption = LayoutCallback | NamedCallback | null;

        interface PaneOptions {
            applyDemoStyles?: boolean;
            responsive?: ResponsiveOptions;
            responsiveAnimate?: boolean;
            closable?: boolean;
            resizable?: boolean;
            slidable?: boolean;
            initClosed?: boolean;
            initHidden?: boolean;
            paneSelector?: string;
            contentSelector?: string;
            contentIgnoreSelector?: string;
            findNestedContent?: boolean;
            paneClass?: string;
            resizerClass?: string;
            togglerClass?: string;
            buttonClass?: string;
            size?: PaneSize;
            minSize?: PaneSize;
            maxSize?: PaneSize;
            minWidth?: number;
            minHeight?: number;
            spacing_open?: number;
            spacing_closed?: number;
            togglerLength_open?: number | "100%";
            togglerLength_closed?: number | "100%";
            togglerAlign_open?: number | "top" | "left" | "bottom" | "right" | "middle" | "center";
            togglerAlign_closed?: number | "top" | "left" | "bottom" | "right" | "middle" | "center";
            togglerContent_open?: string | Element | JQuery;
            togglerContent_closed?: string | Element | JQuery;
            resizerDblClickToggle?: boolean;
            autoResize?: boolean;
            autoReopen?: boolean;
            resizerDragOpacity?: number;
            draggableIframeFix?: boolean | string;
            resizerCursor?: string;
            maskContents?: boolean;
            maskObjects?: boolean;
            maskZindex?: number | null;
            resizingGrid?: false | [number, number];
            livePaneResizing?: boolean;
            liveContentResizing?: boolean;
            liveResizingTolerance?: number;
            sliderCursor?: string;
            slideTrigger_open?: "click" | "dblclick" | "mouseenter";
            slideTrigger_close?: "click" | "mouseleave";
            slideDelay_open?: number;
            slideDelay_close?: number;
            hideTogglerOnSlide?: boolean;
            preventQuickSlideClose?: boolean;
            preventPrematureSlideClose?: boolean;
            tips?: PaneTips;
            showOverflowOnHover?: boolean;
            enableCursorHotkey?: boolean;
            customHotkey?: string | number;
            customHotkeyModifier?: "SHIFT" | "CTRL" | "CTRL+SHIFT";
            fxName?: string;
            fxName_open?: string;
            fxName_close?: string;
            fxName_size?: string;
            fxSpeed?: Speed;
            fxSpeed_open?: Speed;
            fxSpeed_close?: Speed;
            fxSpeed_size?: Speed;
            fxSettings?: EffectSettings;
            fxSettings_open?: EffectSettings;
            fxSettings_close?: EffectSettings;
            fxSettings_size?: EffectSettings;
            animatePaneSizing?: boolean;
            children?: Options | Options[] | null;
            containerSelector?: string;
            initChildren?: boolean;
            destroyChildren?: boolean;
            resizeChildren?: boolean;
            triggerEventsOnLoad?: boolean;
            triggerEventsDuringLiveResize?: boolean;
            onshow?: PaneCallbackOption;
            onshow_start?: PaneCallbackOption;
            onshow_end?: PaneCallbackOption;
            onhide?: PaneCallbackOption;
            onhide_start?: PaneCallbackOption;
            onhide_end?: PaneCallbackOption;
            onopen?: PaneCallbackOption;
            onopen_start?: PaneCallbackOption;
            onopen_end?: PaneCallbackOption;
            onclose?: PaneCallbackOption;
            onclose_start?: PaneCallbackOption;
            onclose_end?: PaneCallbackOption;
            onresize?: PaneCallbackOption;
            onresize_start?: PaneCallbackOption;
            onresize_end?: PaneCallbackOption;
            onsizecontent?: PaneCallbackOption;
            onsizecontent_start?: PaneCallbackOption;
            onsizecontent_end?: PaneCallbackOption;
            onswap?: PaneCallbackOption;
            onswap_start?: PaneCallbackOption;
            onswap_end?: PaneCallbackOption;
            ondrag?: PaneCallbackOption;
            ondrag_start?: PaneCallbackOption;
            ondrag_end?: PaneCallbackOption;
        }

        interface StateManagementOptions {
            enabled?: boolean;
            autoSave?: boolean | ((instance: Instance, state: StateData) => void);
            autoLoad?: boolean | StateData | ((instance: Instance) => StateData | void);
            includeChildren?: boolean;
            stateKeys?: string | string[];
            storageKey?: string;
        }

        interface Options {
            name?: string;
            instanceKey?: string;
            containerClass?: string;
            inset?: Insets | null;
            outset?: Insets | null;
            scrollToBookmarkOnLoad?: boolean;
            resizeWithWindow?: boolean;
            resizeWithWindowDelay?: number;
            resizeWithWindowMaxDelay?: number;
            maskPanesEarly?: boolean;
            initPanes?: boolean;
            showErrorMessages?: boolean;
            showDebugMessages?: boolean;
            zIndex?: number | null;
            zIndexes?: ZIndexes;
            errors?: ErrorMessages;
            effects?: Effects;
            panes?: PaneOptions;
            north?: PaneOptions;
            south?: PaneOptions;
            east?: PaneOptions;
            west?: PaneOptions;
            center?: PaneOptions;
            stateManagement?: StateManagementOptions;
            autoBindCustomButtons?: boolean;
            onresizeall?: LayoutCallbackOption;
            onresizeall_start?: LayoutCallbackOption;
            onresizeall_end?: LayoutCallbackOption;
            onload?: LayoutCallbackOption;
            onload_start?: LayoutCallbackOption;
            onload_end?: LayoutCallbackOption;
            onunload?: LayoutCallbackOption;
            onunload_start?: LayoutCallbackOption;
            onunload_end?: LayoutCallbackOption;
            /** Flat plugin options such as `west__size` are accepted at runtime. */
            [flatOption: `${string}__${string}`]: unknown;
        }

        interface PaneAlias {
            name: PaneName;
            pane: JQuery;
            options: PaneOptions;
            state: PaneState;
            children: ChildLayouts;
        }

        type ChildLayouts = Record<string, Instance> | null;
        type Children = Record<PaneName, ChildLayouts>;
        type PaneElements = Partial<Record<PaneName, JQuery | false>>;
        type BorderPaneElements = Partial<Record<BorderPaneName, JQuery | false>>;
        type PaneInput = PaneName | JQuery.Event;
        type BorderPaneInput = BorderPaneName | JQuery.Event;

        interface StateReadOptions {
            stateKeys?: string | string[];
            includeChildren?: boolean;
        }

        interface StateLoadOptions {
            animate?: boolean;
            includeChildren?: boolean;
        }

        interface MaskOptions {
            objectsOnly?: boolean;
            animation?: boolean;
            resizing?: boolean;
            sliding?: boolean;
        }

        interface Instance {
            options: Options & Record<PaneName, PaneOptions>;
            state: LayoutState;
            container: JQuery;
            panes: PaneElements;
            contents: PaneElements;
            resizers: BorderPaneElements;
            togglers: BorderPaneElements;
            children: Children;
            hasParentLayout: boolean;
            destroyed?: boolean;
            north: PaneAlias | false;
            south: PaneAlias | false;
            east: PaneAlias | false;
            west: PaneAlias | false;
            center: PaneAlias | false;
            hide(pane: BorderPaneInput, noAnimation?: boolean): void;
            show(pane: BorderPaneInput, openPane?: boolean, noAnimation?: boolean, noAlert?: boolean): void;
            toggle(pane: BorderPaneInput, slide?: boolean): void;
            open(pane: BorderPaneInput, slide?: boolean, noAnimation?: boolean, noAlert?: boolean): void;
            close(pane: BorderPaneInput, force?: boolean, noAnimation?: boolean, skipCallback?: boolean): void;
            slideOpen(pane: BorderPaneInput): void;
            slideClose(pane: BorderPaneInput): void;
            slideToggle(pane: BorderPaneInput): void;
            setSizeLimits(pane: BorderPaneName, slide?: boolean): void;
            _sizePane(pane: BorderPaneInput, size: PaneSize, skipCallback?: boolean, noAnimation?: boolean, force?: boolean): void;
            sizePane(pane: BorderPaneInput, size: PaneSize, skipCallback?: boolean, noAnimation?: boolean, force?: boolean): void;
            sizeContent(panes?: PaneInput | string, remeasure?: boolean): void;
            swapPanes(pane1: BorderPaneInput, pane2: BorderPaneName): void;
            showMasks(pane: BorderPaneName, options?: MaskOptions): void;
            hideMasks(force?: boolean): void;
            initContent(pane: PaneName, resize?: boolean): void;
            addPane(pane: PaneName, force?: boolean): void;
            removePane(pane: PaneInput, remove?: boolean, skipResize?: boolean, destroyChild?: boolean): void;
            createChildren(pane: PaneInput, options?: Options | Options[]): void;
            refreshChildren(pane: PaneName, newChild?: Instance): void;
            enableClosable(pane: BorderPaneInput): void;
            disableClosable(pane: BorderPaneInput): void;
            enableSlidable(pane: BorderPaneInput): void;
            disableSlidable(pane: BorderPaneInput): void;
            enableResizable(pane: BorderPaneInput): void;
            disableResizable(pane: BorderPaneInput): void;
            allowOverflow(element: ElementTarget): void;
            resetOverflow(element: ElementTarget): void;
            destroy(destroyChildren?: boolean): Instance;
            initPanes(): boolean;
            resizeAll(refresh?: boolean | JQuery.Event): boolean | void;
            runCallbacks(eventName: string, pane?: PaneName | boolean, skipBoundEvents?: boolean): unknown;
            bindButton(selector: ElementTarget, action: ButtonAction, pane: BorderPaneName): Instance;
            saveState(keys?: string | string[] | StateReadOptions): StateData;
            deleteState(): void;
            readStoredState(): StateData;
            loadStoredState(): StateData;
            loadState(data: StateData, options?: boolean | StateLoadOptions): void;
            readState(options?: string | string[] | StateReadOptions): StateData;
        }

        interface Plugins {
            draggable: boolean;
            effects: { core: boolean; slide: unknown };
            stateManagement?: boolean;
            buttons?: boolean;
            [name: string]: unknown;
        }

        interface Config {
            optionRootKeys: string[];
            allPanes: PaneName[];
            borderPanes: BorderPaneName[];
            oppositeEdge: Record<BorderPaneName, BorderPaneName>;
            [key: string]: unknown;
        }

        interface StateApi {
            saveState(instance: Instance, keys?: string | string[] | StateReadOptions): StateData;
            deleteState(instance: Instance): void;
            readStoredState(instance: Instance): StateData;
            loadStoredState(instance: Instance): StateData;
            loadState(instance: Instance, data: StateData, options?: boolean | StateLoadOptions): void;
            readState(instance: Instance, options?: string | string[] | StateReadOptions): StateData;
        }

        interface ButtonsApi {
            config: { borderPanes: BorderPaneName[] };
            init(instance: Instance): void;
            get(instance: Instance, selector: ElementTarget, pane: BorderPaneName, action: string): JQuery;
            bind(instance: Instance, selector: ElementTarget, action: ButtonAction, pane: BorderPaneName): Instance;
            addToggle(instance: Instance, selector: ElementTarget, pane: BorderPaneName, slide?: boolean): Instance;
            addSlideToggle(instance: Instance, selector: ElementTarget, pane: BorderPaneName): Instance;
            addOpen(instance: Instance, selector: ElementTarget, pane: BorderPaneName, slide?: boolean): Instance;
            addClose(instance: Instance, selector: ElementTarget, pane: BorderPaneName): Instance;
            addPin(instance: Instance, selector: ElementTarget, pane: BorderPaneName): Instance;
            setPinState(instance: Instance, element: JQuery, pane: BorderPaneName, pinned: boolean): void;
        }

        interface Static {
            version: "2.0.0";
            revision: number;
            defaults: Options & Record<PaneName, PaneOptions>;
            effects: Effects;
            config: Config;
            callbacks: Record<string, (...args: any[]) => unknown>;
            plugins: Plugins;
            state: StateApi;
            buttons: ButtonsApi;
            onCreate: Array<(instance: Instance) => void>;
            onLoad: Array<(instance: Instance) => void>;
            onReady: Array<(instance: Instance) => void>;
            onDestroy: Array<(instance: Instance) => void>;
            onUnload: Array<(instance: Instance) => void>;
            afterOpen: Array<(instance: Instance) => void>;
            afterClose: Array<(instance: Instance) => void>;
            getParentPaneElem(element: ElementTarget): JQuery | null;
            getParentPaneInstance(element: ElementTarget): PaneAlias | null;
            getParentLayoutInstance(element: ElementTarget): Instance | null;
            getEventObject(event: unknown): JQuery.Event | null;
            parsePaneName(eventOrPane: PaneInput): PaneName | "error";
            scrollbarWidth(): number;
            scrollbarHeight(): number;
            getScrollbarSize(dimension: "width" | "height"): number;
            getScrollbarSize(): { width: number; height: number };
            disableTextSelection(): void;
            enableTextSelection(): void;
            showInvisibly(element: JQuery, force?: boolean): Record<string, string>;
            getElementDimensions(element: JQuery, inset?: Insets): Dimensions;
            getElementStyles(element: JQuery, list: string): Record<string, string>;
            cssWidth(element: JQuery, outerWidth: number): number;
            cssHeight(element: JQuery, outerHeight: number): number;
            cssNum(element: ElementTarget, property: string, allowAuto?: boolean): number | "auto";
            borderWidth(element: ElementTarget, side: string): number;
            isMouseOverElem(event: JQuery.Event, element?: ElementTarget): boolean;
            transformData(hash: object, addKeys?: boolean): Record<string, unknown>;
            msg(info: object | string, popup?: boolean | string | object, debugTitle?: string | object, debugOptions?: object): void;
        }
    }

    interface JQuery {
        /** Creates a layout or returns the existing instance for the first matched container. */
        layout(options?: JQueryLayout.Options): JQueryLayout.Instance | null | false;
    }

    interface JQueryStatic {
        layout: JQueryLayout.Static;
    }
}

declare const layoutJQuery: JQueryStatic;
export = layoutJQuery;


