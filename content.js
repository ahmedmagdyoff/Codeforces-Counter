(() => {
    let allScores = {};
    let standingsScores = {};
    let unstandingsScores = {};
    // async function fetchContentPage(groupId) { return new DOMParser().parseFromString(await (await fetch(`https://codeforces.com/group/${groupId}/contests`)).text(), "text/html"); }
    async function fetchStanding(url) {
        new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html").querySelectorAll(".standings tr").forEach(row => {
            if (!row.querySelector(".rated-user")) return;
            const tds = row.querySelectorAll("td");
            const handle = tds[1].querySelector("a").innerText.trim();
            const solved = parseInt(tds[2].innerText.trim());
            if (tds[1].innerText.includes("*")) {
                if (!unstandingsScores[handle]) unstandingsScores[handle] = 0;
                unstandingsScores[handle] += solved;
            } else {
                if (!standingsScores[handle]) standingsScores[handle] = 0;
                standingsScores[handle] += solved;
            }
        });
    }
    // function downloadCSV(result, name) {
    //     let csv = "handle,solved\n";
    //     result.forEach(row => { csv += `${row.handle},${row.solved}\n`; });
    //     const blob = new Blob([csv], { type: "text/csv" });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = `${name}.csv`;
    //     a.click();
    //     URL.revokeObjectURL(url);
    // }
    async function run() {
        // const match = window.location.href.match(/group\/([^\/]+)/);
        // const groupId = match ? match[1] : null;
        // if (!groupId) return;
        // const content = await fetchContentPage(groupId);
        let contentLinks = ['https://codeforces.com/group/ad1tgTiYqR/contest/648466'];
        // content.querySelectorAll("table tr").forEach(row => {
        //     const cols = row.querySelectorAll("td");
        //     if (cols.length === 0) return;
        //     const link = cols[0].querySelector("a");
        //     if (!link) return;
        //     contentLinks.push(link.href);
        // });
        await Promise.all(contentLinks.map(link => fetchStanding(link + "/standings")));
        let allResult = Object.entries(allScores).map(([handle, solved]) => ({ handle, solved })).sort((a, b) => b.solved - a.solved);
        let standingsResult = Object.entries(standingsScores).map(([handle, solved]) => ({ handle, solved })).sort((a, b) => b.solved - a.solved);
        let unstandingsResult = Object.entries(unstandingsScores).map(([handle, solved]) => ({ handle, solved })).sort((a, b) => b.solved - a.solved);
        console.table(allResult);
        console.table(standingsResult);
        console.table(unstandingsResult);
        // downloadCSV(standingsResult, "standingsResult");
        // downloadCSV(unstandingsResult, "unstandingsResult");
    }
    run();
})();