import { Browser, expect, Page, test } from "@playwright/test";

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

const openNewPage = async (browser: Browser) => {
    const page = await browser.newContext().then((c) => c.newPage());
    await page.goto("https://localhost:9000/remote-room-tester.html");
    return page;
};

async function checkPeerIsVisible(userPage: Page, peer: string) {
    const peerName = userPage.getByText(peer);
    await expect(peerName).toBeVisible();
    const peerId = await peerName
        .evaluate((n) => n.id)
        .then((s) => s.replace("name-", ""));
    const peerVideoSrcOb = await userPage
        .locator(`#video-${peerId}`)
        .evaluate((n) => (n as HTMLVideoElement).srcObject);
    expect(peerVideoSrcOb).not.toBeNull();
}

test("app network layer", async ({ browser }) => {
    const alicePage = await openNewPage(browser);
    await alicePage.locator("#name").fill("alice");
    await alicePage.locator("#testRemoteRoom").click();
    await expect(alicePage.locator("#type")).toHaveValue("peer");

    await expect(alicePage.getByText("bob")).not.toBeVisible();

    const bobPage = await openNewPage(browser);
    await bobPage.locator("#name").fill("bob");
    await bobPage.locator("#testRemoteRoom").click();
    await expect(bobPage.locator("#type")).toHaveValue("peer");

    await checkPeerIsVisible(bobPage, "alice");
    await checkPeerIsVisible(alicePage, "bob");

    const charliePage = await openNewPage(browser);
    await charliePage.locator("#name").fill("charlie");
    await charliePage.locator("#testRemoteRoom").click();
    await expect(charliePage.locator("#type")).toHaveValue("peer");

    await checkPeerIsVisible(charliePage, "alice");
    await checkPeerIsVisible(charliePage, "bob");
    await checkPeerIsVisible(bobPage, "charlie");
    await checkPeerIsVisible(alicePage, "charlie");
});
