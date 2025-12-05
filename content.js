(() => {
    let allScores = {};
    async function fetchContentPage(groupId) { return new DOMParser().parseFromString(await (await fetch(`https://codeforces.com/group/${groupId}/contests`)).text(), "text/html"); }
    async function fetchStanding(url) {
        let standings = {};
        let unstandings = {};
        new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html").querySelectorAll(".standings tr").forEach(row => {
            if (!row.querySelector(".rated-user")) return;
            const tds = row.querySelectorAll("td");
            const handle = tds[1].querySelector("a").innerText.trim();
            let solvedArray = [];
            for (let i = 4; i < tds.length; i++) {
                if (tds[i].querySelector(".cell-accepted")) solvedArray.push(1);
                else solvedArray.push(0);
            }
            if (tds[1].innerText.includes("*")) {
                if (!unstandings[handle]) unstandings[handle] = solvedArray;
            } else {
                if (!standings[handle]) standings[handle] = solvedArray;
            }
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
            if (!allScores[handle]) allScores[handle] = { allCounter: 0, standingsCounter: 0, unstandingsCounter: 0 };
            allScores[handle].allCounter += allCounter;
            allScores[handle].standingsCounter += standingsCounter;
            allScores[handle].unstandingsCounter += unstandingsCounter;
        });
    }
    function downloadCSV(result) {
        let csv = "handle,allCounter,standingsCounter,unstandingsCounter\n";
        result.forEach(row => { csv += `${row.handle},${row.solved.allCounter},${row.solved.standingsCounter},${row.solved.unstandingsCounter}\n`; });
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
        let result = Object.entries(allScores).map(([handle, solved]) => ({ handle, solved })).sort((a, b) => b.solved.allCounter - a.solved.allCounter);
        downloadCSV(result);
    }
    run();
})();