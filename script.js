let buildingId = 0;

function formatNumber(num) {
    if (isNaN(num)) return "0";
    let rounded = Math.round(num * 100) / 100;
    return Number(rounded).toLocaleString();
}

function addBuilding() {
    const name = prompt("동 이름을 입력하세요:");
    if (!name || !name.trim()) return;

    buildingId++;
    const container = document.createElement("div");
    container.className = "building";
    container.id = "building-" + buildingId;

    container.innerHTML = `
        <div class="building-header">
            <h2>🏢 ${name}</h2>
            <button class="btn-delete" onclick="removeBuilding(${buildingId})">동 삭제</button>
        </div>
        <div class="building-content">
            <div class="info-side">
                <h3>📍 기본 정보</h3>
                <table>
                    <tr><td style="text-align:left">모듈 수량</td><td><input type="number" class="moduleCount"></td></tr>
                    <tr><td style="text-align:left">모듈 단면적 (m²)</td><td><input type="number" class="moduleArea"></td></tr>
                    <tr><td style="text-align:left">모듈 중량 (kg)</td><td><input type="number" class="moduleWeight"></td></tr>
                    <tr><td style="text-align:left">적재하중 (kg/m²)</td><td><input type="number" class="targetLoad"></td></tr>
                </table>
            </div>
            <div class="calc-side">
                <h3>📐 수평투영면적 <small style="font-weight:normal; color:#64748b;">√(a²-b²) × c × mult</small></h3>
                <table>
                    <thead><tr><th>a</th><th>b</th><th>c</th><th>mult</th><th>결과</th><th></th></tr></thead>
                    <tbody class="projection-terms"></tbody>
                </table>
                <button class="btn-add-term" onclick="addProjection(${buildingId})">+ 항 추가</button>

                <h3 style="margin-top:20px;">📦 부피 <small style="font-weight:normal; color:#64748b;">a × b × c × mult / div</small></h3>
                <table>
                    <thead><tr><th>a</th><th>b</th><th>c</th><th>mult</th><th>div</th><th>결과</th><th></th></tr></thead>
                    <tbody class="volume-terms"></tbody>
                </table>
                <button class="btn-add-term" onclick="addVolume(${buildingId})">+ 항 추가</button>
            </div>
        </div>
        
        <div class="summary-bar" id="summary-${buildingId}">
            <div class="summary-item">설치면적 <b class="res-area">0 m²</b></div>
            <div class="summary-item">수평투영면적 <b class="res-proj">0 m²</b></div>
            <div class="summary-item">부피 <b class="res-vol">0 m³</b></div>
            <div class="summary-item">모듈전체중량 <b class="res-module-total">0 kg</b></div>
            <div class="summary-item">구조물중량 (계산값) <b class="res-struct">0 kg</b></div>
            <div class="summary-item">전체중량 <b class="res-total">0 kg</b></div>
        </div>
        <div class="error"></div>
    `;
    document.getElementById("buildings").appendChild(container);
}

function removeBuilding(id) {
    const el = document.getElementById("building-" + id);
    if (el) el.remove();
}

function addProjection(id) {
    const tbody = document.querySelector(`#building-${id} .projection-terms`);
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="number"></td><td><input type="number"></td><td><input type="number"></td>
        <td><input type="number" value="1"></td><td class="result">0</td>
        <td><button class="btn-delete" onclick="this.closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
}

function addVolume(id) {
    const tbody = document.querySelector(`#building-${id} .volume-terms`);
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="number"></td><td><input type="number"></td><td><input type="number"></td>
        <td><input type="number" value="1"></td><td><input type="number" value="1"></td><td class="result">0</td>
        <td><button class="btn-delete" onclick="this.closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
}

function calculateAll() {
    let totalInstall = 0, totalProjection = 0, totalVolume = 0, totalWeight = 0;

    document.querySelectorAll(".building").forEach(building => {
        const errorDiv = building.querySelector(".error");
        errorDiv.innerText = "";

        const N = Number(building.querySelector(".moduleCount").value) || 0;
        const A = Number(building.querySelector(".moduleArea").value) || 0;
        const Wm = Number(building.querySelector(".moduleWeight").value) || 0;
        const targetLoad = Number(building.querySelector(".targetLoad").value) || 0;

        const installArea = N * A;
        const moduleTotal = Wm * N;
        const total = targetLoad * installArea;
        const structureWeight = total - moduleTotal;

        let projectionSum = 0;
        building.querySelectorAll(".projection-terms tr").forEach(row => {
            const ins = row.querySelectorAll("input");
            const a = Number(ins[0].value) || 0, b = Number(ins[1].value) || 0,
                c = Number(ins[2].value) || 0, mult = Number(ins[3].value) || 0;
            const inside = a * a - b * b;
            if (inside < 0) { errorDiv.innerText = "⚠️ 수평투영면적 √ 내부 음수!"; return; }
            const res = Math.sqrt(inside) * c * mult;
            row.querySelector(".result").innerText = formatNumber(res);
            projectionSum += res;
        });

        let volumeSum = 0;
        building.querySelectorAll(".volume-terms tr").forEach(row => {
            const ins = row.querySelectorAll("input");
            const a = Number(ins[0].value) || 0, b = Number(ins[1].value) || 0,
                c = Number(ins[2].value) || 0, mult = Number(ins[3].value) || 0, div = Number(ins[4].value) || 0;
            if (div === 0) return;
            const res = (a * b * c * mult) / div;
            row.querySelector(".result").innerText = formatNumber(res);
            volumeSum += res;
        });

        building.querySelector(".res-area").innerText = formatNumber(installArea) + " m²";
        building.querySelector(".res-proj").innerText = formatNumber(projectionSum) + " m²";
        building.querySelector(".res-vol").innerText = formatNumber(volumeSum) + " m³";
        building.querySelector(".res-module-total").innerText = formatNumber(moduleTotal) + " kg";
        building.querySelector(".res-struct").innerText = formatNumber(structureWeight) + " kg";
        building.querySelector(".res-total").innerText = formatNumber(total) + " kg";

        totalInstall += installArea; totalProjection += projectionSum;
        totalVolume += volumeSum; totalWeight += total;
    });

    const totalLoad = totalInstall !== 0 ? totalWeight / totalInstall : 0;
    document.getElementById("total-summary").innerHTML = `
        <table>
            <tr><td>총 설치면적</td><td>${formatNumber(totalInstall)} m²</td></tr>
            <tr><td>총 수평투영면적</td><td>${formatNumber(totalProjection)} m²</td></tr>
            <tr><td>총 부피</td><td>${formatNumber(totalVolume)} m³</td></tr>
            <tr><td>총 중량</td><td>${formatNumber(totalWeight)} kg</td></tr>
            <tr><td>전체 적재하중</td><td>${formatNumber(totalLoad)} kg/m²</td></tr>
        </table>
    `;
}


// 기존 calculateAll 함수를 보존하면서 기능을 확장합니다.
const originalCalculateAll = calculateAll;

calculateAll = function () {
    // 1. 기존 계산 로직 실행
    originalCalculateAll();

    // 2. 풀이 과정을 표시할 컨테이너 생성 (없으면 생성)
    let detailSection = document.getElementById('calculation-details');
    if (!detailSection) {
        detailSection = document.createElement('div');
        detailSection.id = 'calculation-details';
        detailSection.style.cssText = "margin-top:30px; padding:25px; background:#fff; border-radius:12px; border:1px solid #e2e8f0; color:#334155; line-height:1.8;";
        document.querySelector('.app-container').appendChild(detailSection);
    }

    let detailHtml = `<h2 style="color:#1e293b; border-bottom:2px solid #f1f5f9; padding-bottom:10px; margin-bottom:20px;">📝 상세 계산 과정</h2>`;

    // 3. 각 동(Building)별 데이터 수집 및 풀이 작성
    document.querySelectorAll(".building").forEach((building, index) => {
        const name = building.querySelector("h2").innerText;
        const N = Number(building.querySelector(".moduleCount").value) || 0;
        const A = Number(building.querySelector(".moduleArea").value) || 0;
        const Wm = Number(building.querySelector(".moduleWeight").value) || 0;
        const targetLoad = Number(building.querySelector(".targetLoad").value) || 0;

        const installArea = N * A;
        const moduleTotal = Wm * N;
        const totalWeight = targetLoad * installArea;
        const structureWeight = totalWeight - moduleTotal;

        detailHtml += `<div style="margin-bottom:30px; padding:15px; border-left:4px solid #2563eb; background:#f8fafc;">
            <h3 style="margin-top:0;"> ${name}</h3>`;

        // 1. 설치 면적
        detailHtml += `<p><b>1. 설치 면적 :</b> ${formatNumber(N)}ea(모듈수량) × ${formatNumber(A)}m²(모듈단면적) = <b>${formatNumber(installArea)}m²</b></p>`;

        // 2. 수평투영면적 (mult가 1이면 생략)
        let projExps = [];
        building.querySelectorAll(".projection-terms tr").forEach(row => {
            const ins = row.querySelectorAll("input");
            const a = ins[0].value || 0, b = ins[1].value || 0, c = ins[2].value || 0, mult = Number(ins[3].value) || 1;

            // mult가 1이 아닐 때만 수식에 표시
            let multStr = (mult !== 1) ? ` × ${mult}` : "";
            projExps.push(`((√${a}² - ${b}²) × ${c}${multStr})`);
        });
        const projResult = building.querySelector(".res-proj").innerText;
        detailHtml += `<p><b>2. 수평투영면적 :</b> ${projExps.length > 0 ? projExps.join(' + ') : '0'} = <b>${projResult}</b></p>`;

        // 3. 부피 (mult, div가 1이면 생략)
        let volExps = [];
        building.querySelectorAll(".volume-terms tr").forEach(row => {
            const ins = row.querySelectorAll("input");
            const a = ins[0].value || 0, b = ins[1].value || 0, c = ins[2].value || 0,
                mult = Number(ins[3].value) || 1, div = Number(ins[4].value) || 1;

            // mult와 div가 1이 아닐 때만 수식에 표시
            let multStr = (mult !== 1) ? ` × ${mult}` : "";
            let divStr = (div !== 1) ? ` / ${div}` : "";
            volExps.push(`(${a} × ${b} × ${c}${multStr}${divStr})`);
        });
        const volResult = building.querySelector(".res-vol").innerText;
        detailHtml += `<p><b>3. 부피 :</b> ${volExps.length > 0 ? volExps.join(' + ') : '0'} = <b>${volResult}</b></p>`;

        // 4. 중량
        detailHtml += `<p><b>4. 중량 :</b> 모듈 중량 ${formatNumber(Wm)}kg(장당) × ${formatNumber(N)}ea = ${formatNumber(moduleTotal)}kg(모듈전체중량) + ${formatNumber(structureWeight)}kg(구조물중량) = <b>${formatNumber(totalWeight)}kg</b></p>`;

        // 5. 적재하중
        const loadResult = installArea !== 0 ? (totalWeight / installArea).toFixed(2) : 0;
        detailHtml += `<p><b>5. 적재하중 :</b> ${formatNumber(totalWeight)}kg / ${formatNumber(installArea)}m² = <b>${loadResult} kg/m²</b></p>`;

        detailHtml += `</div>`;
    });

    detailSection.innerHTML = detailHtml;

    // 계산 완료 후 상세 화면으로 스크롤 이동
    detailSection.scrollIntoView({ behavior: 'smooth' });
};
