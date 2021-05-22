export interface Listener<T> {
    (event: T): Promise<void>;
}

export interface Disposable {
    dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class MyEventEmitter<T> {
    private listeners: Listener<T>[] = [];

    subscribe = (listener: Listener<T>): Disposable => {
        this.listeners.push(listener);
        return {
            dispose: (): void => this.unsubscribe(listener),
        };
    };

    unsubscribe = (listener: Listener<T>): void => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    };

    emit = async (event: T): Promise<void> => {
        await Promise.allSettled(
            this.listeners.map((listener) => listener(event))
        );
    };

    unsubscribeAll = (): void => {
        this.listeners = [];
    };
}
