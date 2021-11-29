export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface Size {
    readonly width: number;
    readonly height: number;
}

export interface Rectangle extends Size, Point {

}


export const DEFAULT_EMPTY_RECT: Rectangle = {
    x: 0, y: 0, height: 0, width: 0,
}