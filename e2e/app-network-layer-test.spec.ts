import { test, expect } from "@playwright/test";

test.use({
    permissions: ["microphone", "camera"],
    channel: "chrome",
    launchOptions: {
        args: [
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
        ],
    },
});

test("app network layer", async ({ browser }) => {
    const aliceBrowser = await browser.newContext();
    const alicePage = await aliceBrowser.newPage();
    await alicePage.goto("https://localhost:9000/remote-room-tester.html");
    await alicePage.locator("#name").fill("alice");
    await alicePage.locator("#testRemoteRoom").click();
    await expect(alicePage.locator("#type")).toHaveValue("peer");

    await expect(alicePage.getByText("bob")).not.toBeVisible();

    const bobBrowser = await browser.newContext();
    const bobPage = await bobBrowser.newPage();
    await bobPage.goto("https://localhost:9000/remote-room-tester.html");
    await bobPage.locator("#name").fill("bob");
    await bobPage.locator("#testRemoteRoom").click();
    await expect(bobPage.locator("#type")).toHaveValue("peer");

    const aliceName = bobPage.getByText("alice");
    await expect(aliceName).toBeVisible();
    const aliceId = await aliceName
        .evaluate((n) => n.id)
        .then((s) => s.replace("name-", ""));
    const aliceVideoSrcOb = await bobPage
        .locator(`#video-${aliceId}`)
        .evaluate((n) => (n as HTMLVideoElement).srcObject);
    expect(aliceVideoSrcOb).not.toBeNull();

    const bobName = alicePage.getByText("bob");
    await expect(bobName).toBeVisible();
    const bobId = await bobName
        .evaluate((n) => n.id)
        .then((s) => s.replace("name-", ""));
    const bobVideoSrcOb = await alicePage
        .locator(`#video-${bobId}`)
        .evaluate((n) => (n as HTMLVideoElement).srcObject);
    expect(bobVideoSrcOb).not.toBeNull();

    const charlieBrowser = await browser.newContext();
    const charliePage = await charlieBrowser.newPage();
    await charliePage.goto("https://localhost:9000/remote-room-tester.html");
    await charliePage.locator("#name").fill("charlie");
    await charliePage.locator("#testRemoteRoom").click();
    await expect(charliePage.locator("#type")).toHaveValue("peer");

    // await new Promise(() => {});
});
