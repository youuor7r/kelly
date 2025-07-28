// Kelly 수익률 계산 함수
function kellyAnnualReturn(numTradesPerYear, b, p) {
    const q = 1 - p;

    // Kelly 비율 (최적 투자 비중)
    let fStar;
    try {
        fStar = (b * p - q) / b;
    } catch (error) {
        return { error: '손익비 b는 0이 될 수 없습니다.' };
    }

    // 베팅 비율이 비합리적이면 return 0
    if (fStar <= 0 || fStar >= 1) {
        return {
            kellyFraction: fStar,
            growthPerTradeLog: 0.0,
            annualGrowthRate: 0.0
        };
    }

    // 1회 거래 기대 로그 수익률
    const g = p * Math.log(1 + fStar * b) + q * Math.log(1 - fStar);

    // 연간 기대 수익률 (복리)
    const totalLogGrowth = g * numTradesPerYear;
    const annualReturn = Math.exp(totalLogGrowth) - 1;

    return {
        kellyFraction: Math.round(fStar * 1000000) / 1000000,
        growthPerTradeLog: Math.round(g * 100000000) / 100000000,
        annualGrowthRate: Math.round(annualReturn * 100 * 1000) / 1000 // 퍼센트(%) 단위
    };
}

// DOM 요소들
const numTradesInput = document.getElementById('numTrades');
const profitLossRatioInput = document.getElementById('profitLossRatio');
const winRateInput = document.getElementById('winRate');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');

// 계산 버튼 클릭 이벤트
calculateBtn.addEventListener('click', function() {
    // 입력값 가져오기
    const numTrades = parseFloat(numTradesInput.value);
    const b = parseFloat(profitLossRatioInput.value);
    const p = parseFloat(winRateInput.value);

    // 입력값 검증
    if (!numTrades || !b || !p) {
        showError('모든 입력값을 입력해주세요.');
        return;
    }

    if (numTrades <= 0) {
        showError('연간 거래 횟수는 0보다 커야 합니다.');
        return;
    }

    if (b <= 0) {
        showError('손익비는 0보다 커야 합니다.');
        return;
    }

    if (p < 0 || p > 1) {
        showError('승률은 0과 1 사이의 값이어야 합니다.');
        return;
    }

    // Kelly 계산 실행
    const result = kellyAnnualReturn(numTrades, b, p);

    // 결과 표시
    if (result.error) {
        showError(result.error);
    } else {
        showResult(result);
    }
});

// 결과 표시 함수
function showResult(result) {
    const { kellyFraction, growthPerTradeLog, annualGrowthRate } = result;
    
    let html = '';
    
    // Kelly 비율
    html += `
        <div class="result-item">
            <h4>Kelly 비율 (f*)</h4>
            <div class="value">${(kellyFraction * 100).toFixed(2)}%</div>
            <div class="description">최적 투자 비중 (자본의 ${(kellyFraction * 100).toFixed(2)}%를 투자)</div>
        </div>
    `;

    // 1회 거래 기대 로그 수익률
    html += `
        <div class="result-item">
            <h4>1회 거래 기대 로그 수익률</h4>
            <div class="value">${growthPerTradeLog.toFixed(6)}</div>
            <div class="description">로그 스케일에서의 1회 거래 기대 수익률</div>
        </div>
    `;

    // 연간 수익률
    const annualColor = annualGrowthRate > 0 ? '#38a169' : '#e53e3e';
    html += `
        <div class="result-item">
            <h4>연간 예상 수익률</h4>
            <div class="value" style="color: ${annualColor}">${annualGrowthRate > 0 ? '+' : ''}${annualGrowthRate.toFixed(3)}%</div>
            <div class="description">Kelly 기준에 따른 연간 복리 수익률</div>
        </div>
    `;

    // 추가 정보
    if (kellyFraction <= 0) {
        html += `
            <div class="result-item" style="border-left-color: #e53e3e;">
                <h4>⚠️ 주의사항</h4>
                <div class="value" style="color: #e53e3e;">Kelly 비율이 0 이하</div>
                <div class="description">현재 조건에서는 거래를 하지 않는 것이 최적입니다.</div>
            </div>
        `;
    } else if (kellyFraction >= 1) {
        html += `
            <div class="result-item" style="border-left-color: #e53e3e;">
                <h4>⚠️ 주의사항</h4>
                <div class="value" style="color: #e53e3e;">Kelly 비율이 100% 이상</div>
                <div class="description">현재 조건에서는 레버리지를 사용하는 것이 최적입니다.</div>
            </div>
        `;
    }

    resultDiv.innerHTML = html;
}

// 에러 표시 함수
function showError(message) {
    resultDiv.innerHTML = `
        <div class="error">
            <h4>❌ 오류</h4>
            <p>${message}</p>
        </div>
    `;
}

// Enter 키로도 계산 가능하도록 설정
[numTradesInput, profitLossRatioInput, winRateInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateBtn.click();
        }
    });
});

// 입력값 변경 시 실시간 계산 (선택사항)
function setupRealTimeCalculation() {
    const inputs = [numTradesInput, profitLossRatioInput, winRateInput];
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // 입력값이 모두 유효한 경우에만 자동 계산
            const numTrades = parseFloat(numTradesInput.value);
            const b = parseFloat(profitLossRatioInput.value);
            const p = parseFloat(winRateInput.value);
            
            if (numTrades > 0 && b > 0 && p >= 0 && p <= 1) {
                const result = kellyAnnualReturn(numTrades, b, p);
                if (!result.error) {
                    showResult(result);
                }
            }
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 기본값으로 계산 실행
    const result = kellyAnnualReturn(12, 2.0, 0.65);
    if (!result.error) {
        showResult(result);
    }
    
    // 실시간 계산 설정 (선택사항)
    // setupRealTimeCalculation();
}); 