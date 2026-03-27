// ===== 設定日期欄位最大值為今天 =====
(function initDateMax() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  document.getElementById('birthdate').setAttribute('max', `${yyyy}-${mm}-${dd}`);
})();

// ===== [localStorage] 頁面載入時自動還原上次輸入的生日與結果 =====
(function restoreFromStorage() {
  const saved = localStorage.getItem('dogBirthdate');
  if (!saved) return;

  const input = document.getElementById('birthdate');
  input.value = saved;

  // 自動重新執行換算以還原結果
  const birthDate = new Date(saved);
  const today     = new Date();
  if (birthDate > today) return;

  const ageResult  = calcAge(birthDate, today);
  const ageInYears = ageResult.totalDays / 365.25;
  if (ageInYears < 0.01) return;

  const humanAge = 16 * Math.log(ageInYears) + 31;
  if (humanAge < 0) return;

  renderResult(ageResult, humanAge);
})();

// ===== 換算主函式 =====
function calculate() {
  const birthdateInput = document.getElementById('birthdate').value;
  const resultBox      = document.getElementById('resultBox');
  const errorMsg       = document.getElementById('errorMsg');

  // 清除上次結果
  resultBox.classList.remove('visible');
  errorMsg.classList.remove('visible');

  // 驗證輸入
  if (!birthdateInput) {
    showError('請先選擇狗狗的出生日期！🐾');
    return;
  }

  const birthDate = new Date(birthdateInput);
  const today     = new Date();

  if (birthDate > today) {
    showError('出生日期不能是未來的日期，狗狗還沒出生嗎？🥚');
    return;
  }

  // 計算實際年齡（精確到月）
  const ageResult = calcAge(birthDate, today);

  // 計算人類年齡（需要年齡 > 0）
  const ageInYears = ageResult.totalDays / 365.25;

  if (ageInYears < 0.01) {
    showError('狗狗年齡太小，無法換算喔！請確認出生日期 🐣');
    return;
  }

  const humanAge = 16 * Math.log(ageInYears) + 31;

  if (humanAge < 0) {
    showError('狗狗還太小（不足 1 個月），換算結果不在有效範圍 🐣');
    return;
  }

  // 顯示結果
  renderResult(ageResult, humanAge);

  // ===== [localStorage] 儲存生日與換算結果 =====
  localStorage.setItem('dogBirthdate', birthdateInput);
}

// ===== 計算年齡細節 =====
function calcAge(birthDate, today) {
  let years  = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth()    - birthDate.getMonth();
  let days   = today.getDate()     - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years  -= 1;
    months += 12;
  }

  const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays };
}

// ===== 渲染換算結果 =====
function renderResult(ageResult, humanAge) {
  const { years, months } = ageResult;

  // 組合狗狗年齡文字
  let dogAgeText = '';
  let dogAgeUnit = '';

  if (years > 0 && months > 0) {
    dogAgeText = `${years}歲 ${months}個月`;
    dogAgeUnit = '';
  } else if (years > 0) {
    dogAgeText = `${years}`;
    dogAgeUnit = '歲';
  } else {
    dogAgeText = `${months}`;
    dogAgeUnit = '個月';
  }

  document.getElementById('dogAge').textContent    = dogAgeText;
  document.getElementById('dogAgeUnit').textContent = dogAgeUnit;

  const humanAgeRounded = Math.round(humanAge * 10) / 10;
  document.getElementById('humanAge').textContent    = humanAgeRounded;
  document.getElementById('humanAgeUnit').textContent = '歲';

  // 描述文字
  document.getElementById('resultDesc').textContent = getLifeStageDesc(humanAge);

  // 顯示結果區塊（觸發動畫需先移除再加）
  const resultBox = document.getElementById('resultBox');
  resultBox.classList.remove('visible');
  void resultBox.offsetWidth; // reflow 觸發動畫重播
  resultBox.classList.add('visible');
}

// ===== 生命階段描述 =====
function getLifeStageDesc(humanAge) {
  if (humanAge < 13)  return '🐣 牠還是個可愛的小寶寶，需要細心呵護！';
  if (humanAge < 20)  return '🌱 青春期的狗狗，活力充沛、好奇心旺盛！';
  if (humanAge < 40)  return '🌟 正值壯年，是最活躍的黃金時期！';
  if (humanAge < 60)  return '🍂 成熟穩重的中年，依然精神奕奕！';
  if (humanAge < 75)  return '🌙 步入銀髮期，更需要溫柔的陪伴與照顧。';
  return                     '👴 長壽的老犬，每一天都是珍貴的禮物 ❤️';
}

// ===== 顯示錯誤訊息 =====
function showError(msg) {
  const errorEl = document.getElementById('errorMsg');
  errorEl.textContent = msg;
  errorEl.classList.remove('visible');
  void errorEl.offsetWidth;
  errorEl.classList.add('visible');
}

// ===== Enter 鍵觸發換算 =====
document.getElementById('birthdate').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') calculate();
});