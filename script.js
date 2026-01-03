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
    
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.classList.add('fade-out');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('popupOverlay');
    overlay.addEventListener('click', hidePopup);
    initSwipers();
});

function goToStep1() {
    showStep(1);
}

function goToStep2() {
    if (!swiperA) {
        alert('로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    selectedWords.A = A_WORDS[swiperA.realIndex];
    showStep(2);
}

function goToStep3() {
    if (!swiperB) {
        alert('로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    selectedWords.B = B_WORDS[swiperB.realIndex];
    showStep(3);
}

function goToStep4() {
    if (!swiperC) {
        alert('로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    selectedWords.C = C_WORDS[swiperC.realIndex];
    
    const elA = document.getElementById('wordA');
    const elB = document.getElementById('wordB');
    const elC = document.getElementById('wordC');

    elA.textContent = selectedWords.A + '/';
    elB.textContent = selectedWords.B + '\\';
    elC.textContent = selectedWords.C + '_';

    fitTextToWidth(elA, 44);
    fitTextToWidth(elB, 44);
    fitTextToWidth(elC, 44);

    sendToGoogleSheet();

    showPopup(
        '<span style="font-weight: 600;">당신만의 언어 조각을 만드시겠어요?</span><br><span style="font-size: 14px; font-weight: 100; color: #555; line-height: 1.3; display: block; margin-top: 12px;">Would you like to create<br>your own fragment of language?</span>',
        {
            actionLabel: '확인',
            onAction: () => {
                showResultWithLoading();
            },
            duration: 0
        }
    );
}

function showResultWithLoading() {
    showStep(4);
    
    const resultContainer = document.getElementById('resultContainer');
    const loadingState = document.getElementById('loadingState');
    const loadingBar = document.getElementById('loadingBar');
    const footerButtons = document.querySelectorAll('.footer-fixed .btn');
    
    resultContainer.style.display = 'none';
    loadingState.style.display = 'block';
    
    // 버튼 비활성화
    footerButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    const startTime = Date.now();
    const duration = 3500; // 3.5초
    
    const animateLoading = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        loadingBar.style.width = (progress * 100) + '%';
        
        if (progress < 1) {
            requestAnimationFrame(animateLoading);
        } else {
            // 로딩 완료 - 이미지 표시
            loadingState.style.display = 'none';
            resultContainer.style.display = 'block';
            
            // 버튼 활성화
            footerButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
        }
    };
    
    requestAnimationFrame(animateLoading);
}

function fitTextToWidth(el, maxSizePx, minSizePx = 24) {
    let size = maxSizePx;
    el.style.fontSize = size + 'px';
    const parentWidth = el.parentElement.clientWidth;
    while (el.scrollWidth > parentWidth && size > minSizePx) {
        size -= 2;
        el.style.fontSize = size + 'px';
    }
}

function resetToLanding() {
    // 모든 요소 초기화
    if (swiperA) swiperA.slideToLoop(0, 0);
    if (swiperB) swiperB.slideToLoop(0, 0);
    if (swiperC) swiperC.slideToLoop(0, 0);

    selectedWords = { A: '', B: '', C: '' };
    
    // 로고 숨기고 랜딩페이지 복구
    const logoHeader = document.getElementById('logoHeader');
    const landingPage = document.getElementById('landingPage');
    if (logoHeader) logoHeader.classList.remove('show');
    if (landingPage) landingPage.classList.remove('fade-out');
    
    // 페이지 새로고침
    location.reload();
}

function showStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    const targetStep = document.getElementById('step' + stepNumber);
    const logoHeader = document.getElementById('logoHeader');
    
    // 모든 step에서 active 제거
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // 대상 step에 active 추가
    setTimeout(() => {
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }, 10);
    
    // 로고 표시 (step 1 이상에서만)
    if (stepNumber >= 1 && logoHeader) {
        logoHeader.classList.add('show');
    }
}

function saveImage() {
    const resultContainer = document.getElementById('resultContainer');
    
    html2canvas(resultContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        canvas.toBlob(blob => {
            const timestamp = new Date().getTime();
            const filename = `fragment_${timestamp}.png`;
            const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isiOS) {
                const reader = new FileReader();
                reader.onload = () => {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = reader.result;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                reader.readAsDataURL(blob);
            } else {
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
    if (swiperA) swiperA.slideToLoop(0, 0);
    if (swiperB) swiperB.slideToLoop(0, 0);
    if (swiperC) swiperC.slideToLoop(0, 0);

    selectedWords = { A: '', B: '', C: '' };
    showStep(1);
}

window.addEventListener('load', function() {
    setTimeout(() => {
        showPopup(
            '<span style="font-weight: 600;">당신이 세 개의 기둥(A-B-C)에서<br>가장 먼저 발견했거나, 우연히 읽히는 단어를<br>하나씩 선택해보세요.</span><br><span style="font-size: 14px; font-weight: 100; color: #555; line-height: 1.3; display: block; margin-top: 12px;">From the three columns(A-B-C),<br>select one word from each —<br>the word you notice first,<br>or the one that happens to be read.</span>',
            { 
                actionLabel: '확인', 
                onAction: () => {
                    showStep(1);
                },
                duration: 0 
            }
        );
    }, 2500);
});

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

const A_WORDS = ['SPLIT','BRANCH','EXIT','DIVERGENCE','ROUTE','MULTIPLE','VARIANT'];
const B_WORDS = ['MISPLACED','INVERTED','SHIFTED','WRONG','OFF-FRAME','DISLOCATED','MISREAD'];
const C_WORDS = ['DEFERRED','WAITING','SUSPENDED','ALMOST','AFTER','NOT YET','DELAY'];

let swiperA, swiperB, swiperC;

function initSwipers() {
    swiperA = buildWheelSwiper('wheelA', A_WORDS);
    swiperB = buildWheelSwiper('wheelB', B_WORDS);
    swiperC = buildWheelSwiper('wheelC', C_WORDS);
}

function updateWheelSlideStyles(swiper) {
    const slides = swiper.slides;
    slides.forEach((slide, index) => {
        const distance = Math.abs(index - swiper.activeIndex);
        if (distance === 0) {
            slide.style.opacity = '1';
            slide.style.transform = 'scale(1)';
            slide.style.fontSize = '26px';
        } else if (distance === 1) {
            slide.style.opacity = '0.85';
            slide.style.transform = 'scale(0.98)';
            slide.style.fontSize = '22px';
        } else {
            slide.style.opacity = '0.6';
            slide.style.transform = 'scale(0.95)';
            slide.style.fontSize = '20px';
        }
    });
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
        slidesPerView: 5,
        spaceBetween: 43,
        centeredSlides: true,
        loop: true,
        speed: 220,
        freeMode: false,
        resistanceRatio: 0.35,
        mousewheel: true,
        allowTouchMove: true,
        touchReleaseOnEdges: true,
        threshold: 5,
        on: {
            slideChange: function() {
                updateWheelSlideStyles(this);
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            },
            init: function() {
                updateWheelSlideStyles(this);
            }
        }
    });
}
