let selectedWords = {
    A: '',
    B: '',
    C: ''
};

function showPopup(message, options = {}) {
    const overlay = document.getElementById('popupOverlay');
    const messageElement = document.getElementById('popupMessage');
    const actionBtn = document.getElementById('popupAction');

    messageElement.innerHTML = message;
    overlay.classList.add('show');

    // 액션 버튼 설정
    if (options.actionLabel && typeof options.onAction === 'function') {
        actionBtn.textContent = options.actionLabel;
        actionBtn.style.display = 'inline-block';
        actionBtn.onclick = () => {
            options.onAction();
            hidePopup();
        };
    } else {
        actionBtn.style.display = 'none';
        actionBtn.onclick = null;
    }

    // 자동 닫힘 (기본 3000ms)
    const duration = options.duration ?? 3000;
    if (duration > 0) {
        setTimeout(() => {
            hidePopup();
        }, duration);
    }
}

function hidePopup() {
    const overlay = document.getElementById('popupOverlay');
    overlay.classList.remove('show');
}

// 팝업 클릭 시 닫기
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('popupOverlay');
    overlay.addEventListener('click', hidePopup);
    initSwipers();
});

function goToStep2() {
    if (!swiperA || !swiperB || !swiperC) {
        alert('로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    selectedWords.A = A_WORDS[swiperA.realIndex];
    selectedWords.B = B_WORDS[swiperB.realIndex];
    selectedWords.C = C_WORDS[swiperC.realIndex];

    showStep(2);
    showPopup(
        '세 단어의 조합은 당신에게만 해당되는<br>‘분기된 의미 조각(a fragment of divergent meaning)<br>또는 언어 조각(a fragment of language)’이 됩니다.',
        {
            actionLabel: '생성하기',
            onAction: () => goToStep3(),
            duration: 0 // 자동 닫힘 없음, 사용자 액션 필요
        }
    );
}

function goToStep3() {
    const elA = document.getElementById('wordA');
    const elB = document.getElementById('wordB');
    const elC = document.getElementById('wordC');

    elA.textContent = selectedWords.A + '/';
    elB.textContent = selectedWords.B + '\\';
    elC.textContent = selectedWords.C + '_';

    // 폰트 크기 자동 조절
    fitTextToWidth(elA, 44);
    fitTextToWidth(elB, 44);
    fitTextToWidth(elC, 44);

    // Google Sheets로 데이터 전송
    sendToGoogleSheet();

    showStep(3);
    showPopup('모든 시점은 부분적이고,<br>어느 하나의 해석도 완결되지 않는다.', 3500);
}

function fitTextToWidth(el, maxSizePx, minSizePx = 24) {
    let size = maxSizePx;
    el.style.fontSize = size + 'px';
    // el의 부모 폭을 기준으로 넘침을 확인
    const parentWidth = el.parentElement.clientWidth;
    // white-space: nowrap 상태에서 scrollWidth로 측정
    while (el.scrollWidth > parentWidth && size > minSizePx) {
        size -= 2;
        el.style.fontSize = size + 'px';
    }
}

function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step' + stepNumber).classList.add('active');
}

function saveImage() {
    const resultContainer = document.getElementById('resultContainer');
    
    // html2canvas를 사용하여 결과물을 이미지로 변환
    html2canvas(resultContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: resultContainer.offsetWidth,
        height: resultContainer.offsetHeight
    }).then(canvas => {
        // Canvas를 Blob으로 변환
        canvas.toBlob(blob => {
            const timestamp = new Date().getTime();
            const filename = `fragment_${timestamp}.png`;
            const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isiOS) {
                // iOS: data URL을 사용해 직접 다운로드 시도
                const reader = new FileReader();
                reader.onload = () => {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = reader.result; // data URL
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                reader.readAsDataURL(blob);
            } else {
                // 기타 플랫폼: Blob URL로 다운로드
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = filename;
                link.href = url;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }, 'image/png');
    }).catch(error => {
        console.error('이미지 생성 중 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다.');
    });
}

function reset() {
    // 휠 위치 초기화
    if (swiperA) swiperA.slideToLoop(0, 0);
    if (swiperB) swiperB.slideToLoop(0, 0);
    if (swiperC) swiperC.slideToLoop(0, 0);

    selectedWords = { A: '', B: '', C: '' };

    // 첫 화면으로 이동
    showStep(1);
}

// 페이지 로드 시 첫 번째 단계 표시 및 초기 팝업
window.addEventListener('load', function() {
    showStep(1);
    setTimeout(() => {
        showPopup(
            '세 개의 기둥(A,B,C)에서 가장 먼저 보이거나,<br>마음에 걸리거나,<br>우연히 읽히는 단어를 하나씩 선택하세요.',
            { actionLabel: '확인', onAction: () => {}, duration: 0 }
        );
    }, 300);
});

// Google Sheets로 데이터 전송 함수
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwE4d-RHW3Ji5QXzJbRmnhxuW-D2pi-UHUvN01U2anfDVO2hwIuUmZpcJfD4_gpmqBQ/exec';

function sendToGoogleSheet() {
    const now = new Date();
    const timestamp = now.toLocaleString('ko-KR');
    
    const data = {
        timestamp: timestamp,
        poleA: selectedWords.A,
        poleB: selectedWords.B,
        poleC: selectedWords.C
    };
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .catch(error => console.error('데이터 전송 실패:', error));
}

// ---- Swiper-based wheel logic ----
const A_WORDS = ['SPLIT','BRANCH','EXIT','DIVERGENCE','ROUTE','MULTIPLE','VARIANT'];
const B_WORDS = ['MISPLACED','INVERTED','SHIFTED','WRONG','OFF-FRAME','DISLOCATED','MISREAD'];
const C_WORDS = ['DEFERRED','WAITING','SUSPENDED','ALMOST','AFTER','NOT YET','DELAY'];

let swiperA, swiperB, swiperC;

function initSwipers() {
    swiperA = buildWheelSwiper('wheelA', A_WORDS);
    swiperB = buildWheelSwiper('wheelB', B_WORDS);
    swiperC = buildWheelSwiper('wheelC', C_WORDS);
}

function buildWheelSwiper(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const wrapper = container.querySelector('.swiper-wrapper');
    wrapper.innerHTML = '';
    items.forEach(text => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.textContent = text;
        wrapper.appendChild(slide);
    });

    return new Swiper('#' + containerId, {
        direction: 'vertical',
        slidesPerView: 3,
        spaceBetween: 36, // 간격을 더 넓혀 위아래 단어를 여유 있게 분리
        centeredSlides: true,
        loop: true,
        speed: 220,
        freeMode: false,
        resistanceRatio: 0.35,
        mousewheel: true,
        allowTouchMove: true,
        touchReleaseOnEdges: true,
        threshold: 5,
    });
}
