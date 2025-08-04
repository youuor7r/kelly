// Kelly 수익률 계산 함수 (손익비 기반)
function kellyAnnualReturn(numTradesPerYear, b, p) {
    const q = 1 - p;
    let fStar;
    
    try {
        fStar = (b * p - q) / b;
    } catch (error) {
        return { error: '손익비 b는 0이 될 수 없습니다.' };
    }
    
    if (fStar <= 0 || fStar > 1) { // 1 초과도 레버리지로 간주하여 일단 f*만 표시
        return {
            kellyFraction: fStar,
            growthPerTradeLog: 0.0,
            annualGrowthRate: 0.0
        };
    }
    
    const g = p * Math.log(1 + fStar * b) + q * Math.log(1 - fStar);
    const totalLogGrowth = g * numTradesPerYear;
    const annualReturn = Math.exp(totalLogGrowth) - 1;
    
    return {
        kellyFraction: Math.round(fStar * 1000000) / 1000000,
        growthPerTradeLog: Math.round(g * 100000000) / 100000000,
        annualGrowthRate: Math.round(annualReturn * 100 * 1000) / 1000
    };
}

// Kelly 비율 계산 함수 (수익률 기반 - 기존)
function kellyFractionFromReturns(p, winReturn, lossReturn) {
    const q = 1 - p;
    const b = winReturn / 100; // 승리 시 수익률
    const a = lossReturn / 100; // 패배 시 손실률
    
    if (a === 0 || b === 0) {
        return { error: '수익률과 손실률은 0이 될 수 없습니다.' };
    }
    
    // 기존 공식: f* = (p * b - q * a) / b
    const fStar = (p * b - q * a) / b;

    return {
        kellyFraction: Math.round(fStar * 1000000) / 1000000,
    };
}

// Kelly 비율 계산 함수 (이미지 기반 - f = p/a - q/b)
function kellyFractionFromImage(p, winReturn, lossReturn) {
    const q = 1 - p;
    const b = winReturn / 100; // 승리 시 수익률
    const a = lossReturn / 100; // 패배 시 손실률

    if (a === 0 || b === 0) {
        return { error: '수익률과 손실률은 0이 될 수 없습니다.' };
    }
    
    const fStar = (p / a) - (q / b);

    return {
        kellyFraction: Math.round(fStar * 1000000) / 1000000,
    };
}


// --- DOM 요소들 ---
// 계산기 1
const numTradesInput = document.getElementById('numTrades');
const profitLossRatioInput = document.getElementById('profitLossRatio');
const winRateInput = document.getElementById('winRate');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');

// 계산기 2 (수익률 기반 - 공식 선택 가능)
const winRateInput2 = document.getElementById('winRate2');
const winReturnInput = document.getElementById('winReturn');
const lossReturnInput = document.getElementById('lossReturn');
const calculateBtn2 = document.getElementById('calculateBtn2');
const resultDiv2 = document.getElementById('result2');

// --- 이벤트 리스너 ---
// 계산기 1: 계산 버튼 클릭 이벤트
calculateBtn.addEventListener('click', function() {
    const numTrades = parseFloat(numTradesInput.value);
    const b = parseFloat(profitLossRatioInput.value);
    const p = parseFloat(winRateInput.value);
    
    if (isNaN(numTrades) || isNaN(b) || isNaN(p)) {
        showError('모든 입력값을 숫자로 입력해주세요.', resultDiv);
        return;
    }
    
    if (numTrades <= 0) {
        showError('연간 거래 횟수는 0보다 커야 합니다.', resultDiv);
        return;
    }
    
    if (b <= 0) {
        showError('손익비는 0보다 커야 합니다.', resultDiv);
        return;
    }
    
    if (p < 0 || p > 1) {
        showError('승률은 0과 1 사이의 값이어야 합니다.', resultDiv);
        return;
    }
    
    const result = kellyAnnualReturn(numTrades, b, p);
    
    if (result.error) {
        showError(result.error, resultDiv);
    } else {
        showResult1(result);
    }
});

// 계산기 2: 계산 버튼 클릭 이벤트
calculateBtn2.addEventListener('click', function() {
    const p = parseFloat(winRateInput2.value);
    const winReturn = parseFloat(winReturnInput.value);
    const lossReturn = parseFloat(lossReturnInput.value);
    
    // 선택된 공식 확인
    const selectedFormula = document.querySelector('input[name="formula"]:checked').value;
    
    if (isNaN(p) || isNaN(winReturn) || isNaN(lossReturn)) {
        showError('모든 입력값을 숫자로 입력해주세요.', resultDiv2);
        return;
    }
    
    if (winReturn <= 0 || lossReturn <= 0) {
        showError('수익률과 손실률은 0보다 커야 합니다.', resultDiv2);
        return;
    }
    
    if (p < 0 || p > 1) {
        showError('승률은 0과 1 사이의 값이어야 합니다.', resultDiv2);
        return;
    }
    
    let result;
    if (selectedFormula === 'standard') {
        result = kellyFractionFromReturns(p, winReturn, lossReturn);
    } else {
        result = kellyFractionFromImage(p, winReturn, lossReturn);
    }
    
    if (result.error) {
        showError(result.error, resultDiv2);
    } else {
        showResult2(result, selectedFormula);
    }
});

// --- 결과 표시 함수 ---
// 계산기 1 결과 표시
function showResult1(result) {
    const { kellyFraction, growthPerTradeLog, annualGrowthRate } = result;
    
    let html = `
        <div class="result-item">
            <h4>Kelly 비율 (f*)</h4>
            <div class="value">${(kellyFraction * 100).toFixed(2)}%</div>
            <div class="description">최적 투자 비중</div>
        </div>
        <div class="result-item">
            <h4>1회 거래 기대 로그 수익률</h4>
            <div class="value">${growthPerTradeLog.toFixed(6)}</div>
            <div class="description">로그 스케일 기대 수익률</div>
        </div>
        <div class="result-item">
            <h4>연간 예상 수익률</h4>
            <div class="value" style="color: ${annualGrowthRate >= 0 ? '#38a169' : '#e53e3e'}">${annualGrowthRate >= 0 ? '+' : ''}${annualGrowthRate.toFixed(3)}%</div>
            <div class="description">연간 복리 수익률</div>
        </div>
    `;
    
    if (kellyFraction <= 0) {
        html += createWarningMessage('Kelly 비율이 0 이하', '현재 조건에서는 거래를 하지 않는 것이 최적입니다.');
    } else if (kellyFraction > 1) {
        html += createWarningMessage('Kelly 비율이 100% 초과', '레버리지를 사용하는 것이 최적일 수 있습니다. (위험성 높음)');
    }
    
    resultDiv.innerHTML = html;
}

// 계산기 2 결과 표시
function showResult2(result, formula) {
    const { kellyFraction } = result;
    
    const formulaText = formula === 'standard' 
        ? 'f* = (p × b - q × a) / b' 
        : 'f* = p/a - q/b';
    
    let html = `
        <div class="result-item">
            <h4>Kelly 비율 (f*)</h4>
            <div class="value">${(kellyFraction * 100).toFixed(2)}%</div>
            <div class="description">최적 투자 비중 (${formulaText} 사용)</div>
        </div>
    `;
    
    if (kellyFraction <= 0) {
        html += createWarningMessage('Kelly 비율이 0 이하', '현재 조건에서는 거래를 하지 않는 것이 최적입니다.');
    } else if (kellyFraction > 1) {
        html += createWarningMessage('Kelly 비율이 100% 초과', '레버리지를 사용하는 것이 최적일 수 있습니다. (위험성 높음)');
    }
    
    resultDiv2.innerHTML = html;
}

// --- 유틸리티 함수 ---
// 에러 메시지 표시 함수
function showError(message, targetDiv) {
    targetDiv.innerHTML = `
        <div class="error">
            <h4>❌ 오류</h4>
            <p>${message}</p>
        </div>
    `;
}

// 경고 메시지 생성 함수
function createWarningMessage(title, description) {
    return `
        <div class="result-item" style="border-left-color: #dd6b20;">
            <h4>⚠️ 주의: ${title}</h4>
            <div class="description" style="color: #dd6b20;">${description}</div>
        </div>
    `;
}

// Enter 키로 계산
function setupEnterKey(inputs, button) {
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                button.click();
            }
        });
    });
}

setupEnterKey([numTradesInput, profitLossRatioInput, winRateInput], calculateBtn);
setupEnterKey([winRateInput2, winReturnInput, lossReturnInput], calculateBtn2);

// --- 페이지 로드 시 초기화 ---
document.addEventListener('DOMContentLoaded', function() {
    // 기본값으로 계산 실행
    calculateBtn.click();
    calculateBtn2.click();
});