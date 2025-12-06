(() => {
    let total = 0;
    let scores = {};
    async function fetchContentPage(groupId) { return new DOMParser().parseFromString(await (await fetch(`https://codeforces.com/group/${groupId}/contests`)).text(), "text/html"); }
    async function fetchStanding(url) {
        let check = false;
        let standings = {};
        let unstandings = {};
        new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html").querySelectorAll(".standings tr").forEach(row => {
            if (!row.querySelector(".rated-user")) return;
            const tds = row.querySelectorAll("td");
            const handle = tds[1].querySelector("a").innerText.trim();
            let solved = [];
            for (let i = 4; i < tds.length; i++) {
                if (tds[i].querySelector(".cell-accepted")) solved.push(1);
                else solved.push(0);
            }
            if (!check) {
                total += solved.length;
                check = true;
            }
            if (tds[1].innerText.includes("*")) unstandings[handle] ??= solved;
            else standings[handle] ??= solved;
        });
        new Set([...Object.keys(standings), ...Object.keys(unstandings)]).forEach(handle => {
            let allCounter = 0;
            let standingsCounter = 0;
            let unstandingsCounter = 0;
            let standArr = standings[handle] || [];
            let unstandArr = unstandings[handle] || [];
            for (let i = 0; i < standArr.length; i++) {
                if (standArr[i] === 1 || unstandArr[i] === 1) allCounter++;
                standingsCounter += standArr[i] || 0;
                unstandingsCounter += unstandArr[i] || 0;
            }
            if (!scores[handle]) scores[handle] = { all: 0, standings: 0, unstandings: 0 };
            scores[handle].all += allCounter;
            scores[handle].standings += standingsCounter;
            scores[handle].unstandings += unstandingsCounter;
        });
    }
    function download(result) {
        let csv = "Handle,All,Standings,UnStandings,Percentage\n";
        result.forEach(row => { csv += `${row.handle},${row.solved.all},${row.solved.standings},${row.solved.unstandings},${(row.solved.all / total) * 100}\n`; });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Codeforces Counter.csv";
        a.click();
        URL.revokeObjectURL(url);
    }
    async function run() {
        const match = window.location.href.match(/group\/([^\/]+)/);
        const groupId = match ? match[1] : null;
        if (!groupId) return;
        const content = await fetchContentPage(groupId);
        let contentLinks = [];
        content.querySelectorAll("table tr").forEach(row => {
            const cols = row.querySelectorAll("td");
            if (cols.length === 0) return;
            const link = cols[0].querySelector("a");
            if (!link) return;
            contentLinks.push(link.href);
        });
        await Promise.all(contentLinks.map(link => fetchStanding(link + "/standings")));
        let result = Object.entries(scores).map(([handle, solved]) => ({ handle, solved })).sort((a, b) => b.solved.all - a.solved.all);
        download(result);
        console.log(total);
    }
    run();
})();