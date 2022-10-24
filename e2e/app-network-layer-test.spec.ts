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

async function checkVideoIsStarted(userPage: Page, peerVideoId: string) {
    const peerVideoSrcOb = await userPage
        .locator(peerVideoId)
        .evaluate((n) => (n as HTMLVideoElement).srcObject);
    expect(peerVideoSrcOb).not.toBeNull();
}

async function checkPeerIsVisible(userPage: Page, peerSettings: PeerSettings) {
    const peerType = peerSettings.name.toLowerCase().includes("tv")
        ? "tv"
        : "peer";

    const peerName = userPage.getByText(peerSettings.name);
    await expect(peerName).toBeVisible();

    const peerId = await peerName
        .evaluate((n) => n.id)
        .then((s) => s.replace("name-", ""));

    await expect(userPage.locator(`#color-${peerId}`)).toHaveText(
        peerSettings.color
    );
    await expect(userPage.locator(`#type-${peerId}`)).toHaveText(peerType);

    const peerVideoId = `#video-${peerId}`;
    await checkVideoIsStarted(userPage, peerVideoId);
}

interface PeerSettings {
    color: string;
    name: string;
}
const setUserSettingsAndLaunch = async (
    peerSettings: PeerSettings,
    page: Page
) => {
    await page.getByText("What's your name?").fill(peerSettings.name);
    await page.getByText("Choose avatar color:").fill(peerSettings.color);
    await page.getByText("Connect").click();
};

test("app network layer", async ({ browser }) => {
    const alicePage = await openNewPage(browser);
    const aliceSettings = {
        name: "alice",
        color: "#000000",
    };
    await setUserSettingsAndLaunch(aliceSettings, alicePage);

    await expect(alicePage.getByText("Type")).toHaveValue("peer");
    await expect(alicePage.getByText("Virtual World")).toHaveValue("Started");
    await checkVideoIsStarted(alicePage, "#localVideo");

    await expect(alicePage.getByText("bob")).not.toBeVisible();
    await expect(alicePage.getByText("charlie")).not.toBeVisible();

    const bobPage = await openNewPage(browser);
    const bobSettings = {
        name: "bob",
        color: "#ffffff",
    };
    await setUserSettingsAndLaunch(bobSettings, bobPage);
    await expect(bobPage.getByText("Type")).toHaveValue("peer");

    await checkPeerIsVisible(bobPage, aliceSettings);
    await checkPeerIsVisible(alicePage, bobSettings);

    const charliePage = await openNewPage(browser);
    const charlieSettings = {
        name: "charlie",
        color: "#ff0000",
    };
    await setUserSettingsAndLaunch(charlieSettings, charliePage);
    await expect(charliePage.getByText("Type")).toHaveValue("peer");

    await checkPeerIsVisible(charliePage, aliceSettings);
    await checkPeerIsVisible(charliePage, bobSettings);
    await checkPeerIsVisible(bobPage, charlieSettings);
    await checkPeerIsVisible(alicePage, charlieSettings);
});
