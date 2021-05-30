import { LocalBrowser } from "../../../../src/adapters/browser/local-browser";

describe("a browser local environment", () => {
    describe("when initialising", () => {
        describe("checks is using the right browser", () => {
            let alertSpy: jest.SpyInstance;
            let localBrowser: LocalBrowser;

            beforeEach(() => {
                jest.clearAllMocks();
                localBrowser = new LocalBrowser();
                alertSpy = jest.spyOn(window, "alert").mockReturnValue();
            });

            it("for any other user agent", () => {
                localBrowser.init();
                expect(alertSpy).toHaveBeenCalledWith(
                    expect.stringContaining("Your browser is not supported")
                );
            });

            it.each([
                [
                    "Chrome",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                ],
                [
                    "Firefox",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0",
                ],
            ])("for %s", (testName, userAgent) => {
                jest.spyOn(navigator, "userAgent", "get").mockReturnValue(
                    userAgent
                );
                localBrowser.init();
                expect(alertSpy).not.toBeCalled();
            });
        });
    });

    test("failing to get access to a webcam/device stream will throw", async () => {
        (navigator as any).mediaDevices = {
            getUserMedia: jest
                .fn()
                .mockRejectedValue(new Error("error getting user media")),
        };
        const alertSpy = jest.spyOn(window, "alert").mockReturnValue();
        const localBrowser = new LocalBrowser();
        const promise = localBrowser.getLocalStream();
        await expect(promise).rejects.toThrow("error getting user media");
        expect(alertSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                "You need to give access to the webcam + audio to start the app"
            )
        );
    });
});
