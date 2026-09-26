const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const equipmentHome = $('#equipmentHome');
const equipmentChoices = $('#equipmentChoices');
const shinGuardsComing = $('#shinGuardsComing');

function showEquipmentHome() {
  leaveStandalonePhotoFit();
  window.ShinFit?.clearPhotos();
  equipmentHome.hidden = false;
  equipmentChoices.hidden = false;
  shinGuardsComing.hidden = true;
  $$('.app-view').forEach(element => { element.hidden = true; });
  document.body.classList.remove('camera-open');
  window.scrollTo({top:0, behavior:'smooth'});
}

function showStickFinder() {
  leaveStandalonePhotoFit();
  window.ShinFit?.clearPhotos();
  equipmentHome.hidden = true;
  $$('.app-view').forEach(element => { element.hidden = false; });
  window.scrollTo({top:0, behavior:'smooth'});
}

$('#openStickFinder').addEventListener('click', showStickFinder);
$('#openShinGuards').addEventListener('click', () => {
  equipmentChoices.hidden = true;
  shinGuardsComing.hidden = false;
  window.scrollTo({top:0, behavior:'smooth'});
});
$('#backToEquipment').addEventListener('click', showEquipmentHome);
$('#returnToEquipment').addEventListener('click', showEquipmentHome);
$$('.app-view .brand').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showEquipmentHome();
}));

const productFamilies = [
  { brand:'CCM', name:'Ribcor Trigger 60', kick:'Low', tiers:['recreational','developing'], prices:{Youth:89.99,Junior:99.99,Intermediate:109.99,Senior:109.99}, flexes:[20,30,40,50,55,65,70,75,85], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks' },
  { brand:'CCM', name:'Tacks XF 70', kick:'Mid', tiers:['recreational','developing'], prices:{Youth:109.99,Junior:119.99,Intermediate:129.99,Senior:129.99}, flexes:[30,40,50,55,65,70,75,85], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks' },
  { brand:'Bauer', name:'Vapor League', kick:'Low', tiers:['developing','competitive'], prices:{Youth:119.99,Junior:149.99,Intermediate:179.99,Senior:189.99}, flexes:[20,30,40,50,55,65,70,77,87], url:'https://ca.bauer.com/collections/hockey-sticks' },
  { brand:'CCM', name:'Tacks XF', kick:'Mid', tiers:['developing','competitive'], prices:{Youth:149.99,Junior:179.99,Intermediate:229.99,Senior:229.99}, flexes:[30,40,50,55,65,70,75,85], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks' },
  { brand:'CCM', name:'Ribcor Trigger Unleashed', kick:'Low', tiers:['developing','competitive'], prices:{Youth:159.99,Junior:189.99,Intermediate:239.99,Senior:239.99}, flexes:[20,30,40,50,55,65,70,75,85,95], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks' },
  { brand:'Bauer', name:'Nexus Tracer', kick:'Mid', tiers:['competitive','elite'], prices:{Youth:179.99,Junior:164.99,Intermediate:277.49,Senior:299.99}, flexes:[30,40,50,55,65,70,77,87], url:'https://ca.bauer.com/products/nexus-tracer-stick-senior' },
  { brand:'CCM', name:'Ribcor Trigger Unleashed XT', kick:'Low', tiers:['competitive','elite'], prices:{Youth:199.99,Junior:229.99,Intermediate:289.99,Senior:299.99}, flexes:[30,40,50,55,65,70,75,85,95], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks' },
  { brand:'Bauer', name:'Vapor Twitch', kick:'Low', tiers:['competitive','elite'], prices:{Youth:199.99,Junior:289.99,Intermediate:399.99,Senior:419.99}, flexes:[30,40,50,55,65,70,77,87], url:'https://ca.bauer.com/collections/hockey-sticks' },
  { brand:'CCM', name:'Tacks XF Pro', kick:'Mid', tiers:['elite'], prices:{Youth:239.99,Junior:299.99,Intermediate:399.99,Senior:419.99}, flexes:[30,40,50,55,65,70,75,80,85,95], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks' },
  { brand:'CCM', name:'Jetspeed FT9 Pro', kick:'Hybrid', tiers:['elite'], prices:{Youth:239.99,Junior:309.99,Intermediate:409.99,Senior:439.99}, flexes:[10,20,30,40,50,55,65,70,75,80,85,95], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/JetSpeed-Sticks' },
  { brand:'CCM', name:'Ribcor Trigger Unleashed Pro', kick:'Low', tiers:['elite'], prices:{Youth:239.99,Junior:309.99,Intermediate:409.99,Senior:439.99}, flexes:[20,30,40,50,55,65,70,75,80,85,95], url:'https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks' },
  { brand:'Bauer', name:'Vapor Flylite', kick:'Low', tiers:['elite'], prices:{Youth:239.99,Junior:309.99,Intermediate:409.99,Senior:439.99}, flexes:[20,30,40,50,55,65,70,77,87], url:'https://ca.bauer.com/collections/hockey-sticks' },
  { brand:'Bauer', name:'Supreme Fuse', kick:'Mid', tiers:['elite'], prices:{Youth:239.99,Junior:309.99,Intermediate:409.99,Senior:439.99}, flexes:[30,40,50,55,65,70,77,87], url:'https://ca.bauer.com/collections/hockey-sticks' }
  ,{ brand:'Warrior', name:'Alpha LX3', kick:'Hybrid', tiers:['developing','competitive'], prices:{Youth:119.99,Junior:179.99,Intermediate:239.99,Senior:249.99}, flexes:[20,30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'Warrior', name:'Alpha LX3 Pro', kick:'Hybrid', tiers:['competitive','elite'], prices:{Youth:199.99,Junior:299.99,Intermediate:399.99,Senior:429.99}, flexes:[30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'Warrior', name:'Covert QR6', kick:'Low', tiers:['developing','competitive'], prices:{Youth:119.99,Junior:179.99,Intermediate:239.99,Senior:249.99}, flexes:[20,30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'Warrior', name:'Covert QR6 Pro', kick:'Low', tiers:['competitive','elite'], prices:{Youth:199.99,Junior:299.99,Intermediate:399.99,Senior:429.99}, flexes:[30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'Warrior', name:'Novium 2', kick:'Mid', tiers:['developing','competitive'], prices:{Youth:119.99,Junior:179.99,Intermediate:239.99,Senior:249.99}, flexes:[30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'Warrior', name:'Novium 2 Pro', kick:'Mid', tiers:['competitive','elite'], prices:{Youth:199.99,Junior:299.99,Intermediate:399.99,Senior:429.99}, flexes:[30,40,50,55,63,70,75,85], url:'https://www.warrior.com/hockey/sticks/' }
  ,{ brand:'TRUE', name:'HZRDUS Smoke', kick:'Low', tiers:['competitive','elite'], prices:{Youth:129.99,Junior:199.99,Intermediate:339.99,Senior:369.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://www.true-sports.com/en-ca/' }
  ,{ brand:'TRUE', name:'HZRDUS 7X4', kick:'Low', tiers:['developing','competitive'], prices:{Youth:109.99,Junior:169.99,Intermediate:229.99,Senior:249.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://www.true-sports.com/en-ca/' }
  ,{ brand:'Sherwood', name:'CODE Photon 3', kick:'Hybrid', tiers:['recreational','developing'], prices:{Youth:89.99,Junior:119.99,Intermediate:139.99,Senior:149.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'CODE Photon 2', kick:'Hybrid', tiers:['developing','competitive'], prices:{Youth:109.99,Junior:159.99,Intermediate:199.99,Senior:219.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'CODE Photon 1', kick:'Hybrid', tiers:['competitive','elite'], prices:{Youth:159.99,Junior:229.99,Intermediate:299.99,Senior:329.99}, flexes:[30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'CODE Photon Pro', kick:'Hybrid', tiers:['elite'], prices:{Youth:199.99,Junior:299.99,Intermediate:399.99,Senior:429.99}, flexes:[30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'REKKER Morph 3', kick:'Low', tiers:['recreational','developing'], prices:{Youth:79.99,Junior:109.99,Intermediate:139.99,Senior:149.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'REKKER Morph 2', kick:'Low', tiers:['developing','competitive'], prices:{Youth:109.99,Junior:159.99,Intermediate:209.99,Senior:229.99}, flexes:[20,30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
  ,{ brand:'Sherwood', name:'REKKER Morph 1', kick:'Low', tiers:['competitive','elite'], prices:{Youth:159.99,Junior:239.99,Intermediate:319.99,Senior:349.99}, flexes:[30,40,50,55,65,75,85], url:'https://sherwoodhockey.com/collections/hockey-sticks' }
];

// Exact model and size pages checked against official catalogs on 2026-09-23.
const stickProductLinks = {
  "CCM|Ribcor Trigger 60|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTR60-JR.html",
  "CCM|Ribcor Trigger 60|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTR60-IN.html",
  "CCM|Ribcor Trigger 60|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTR60-SR.html",
  "CCM|Tacks XF 70|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF70-JR.html",
  "CCM|Tacks XF 70|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF70-IN.html",
  "CCM|Tacks XF 70|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF70-SR.html",
  "CCM|Tacks XF|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF-JR.html",
  "CCM|Tacks XF|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF-IN.html",
  "CCM|Tacks XF|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXF-SR.html",
  "CCM|Ribcor Trigger Unleashed|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNL-JR.html",
  "CCM|Ribcor Trigger Unleashed|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNL-IN.html",
  "CCM|Ribcor Trigger Unleashed|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNL-SR.html",
  "Bauer|Nexus Tracer|Junior": "https://ca.bauer.com/products/nexus-tracer-stick-junior",
  "Bauer|Nexus Tracer|Intermediate": "https://ca.bauer.com/products/nexus-tracer-stick-intermediate",
  "Bauer|Nexus Tracer|Senior": "https://ca.bauer.com/products/nexus-tracer-stick-senior",
  "CCM|Ribcor Trigger Unleashed XT|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLXT-JR.html",
  "CCM|Ribcor Trigger Unleashed XT|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLXT-IN.html",
  "CCM|Ribcor Trigger Unleashed XT|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLXT-SR.html",
  "Bauer|Vapor Twitch|Junior": "https://ca.bauer.com/products/bauer-twitch-grip-stick-junior",
  "CCM|Tacks XF Pro|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXFP-JR.html",
  "CCM|Tacks XF Pro|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXFP-IN.html",
  "CCM|Tacks XF Pro|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Tacks-Sticks/HSXFP-SR.html",
  "CCM|Jetspeed FT9 Pro|Youth": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/JetSpeed-Sticks/HSFT9P-YT.html",
  "CCM|Jetspeed FT9 Pro|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/JetSpeed-Sticks/HSFT9P-JR.html",
  "CCM|Jetspeed FT9 Pro|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/JetSpeed-Sticks/HSFT9P-IN.html",
  "CCM|Jetspeed FT9 Pro|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/JetSpeed-Sticks/HSFT9P-SR.html",
  "CCM|Ribcor Trigger Unleashed Pro|Youth": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLP-YT.html",
  "CCM|Ribcor Trigger Unleashed Pro|Junior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLP-JR.html",
  "CCM|Ribcor Trigger Unleashed Pro|Intermediate": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLP-IN.html",
  "CCM|Ribcor Trigger Unleashed Pro|Senior": "https://ca.ccmhockey.com/en/Sticks/Shop-All-Sticks/Ribcor-Sticks/HSTRUNLP-SR.html",
  "Bauer|Vapor Flylite|Youth": "https://ca.bauer.com/products/bauer-vapor-flylite-grip-stick-youth",
  "Bauer|Vapor Flylite|Junior": "https://ca.bauer.com/products/bauer-vapor-flylite-grip-stick-junior",
  "Bauer|Vapor Flylite|Intermediate": "https://ca.bauer.com/products/bauer-vapor-flylite-grip-stick-intermediate",
  "Bauer|Vapor Flylite|Senior": "https://ca.bauer.com/products/bauer-vapor-flylite-grip-stick-senior",
  "Bauer|Supreme Fuse|Youth": "https://ca.bauer.com/products/bauer-supreme-fuse-grip-stick-youth",
  "Bauer|Supreme Fuse|Junior": "https://ca.bauer.com/products/bauer-supreme-fuse-grip-stick-junior",
  "Bauer|Supreme Fuse|Intermediate": "https://ca.bauer.com/products/bauer-supreme-fuse-grip-stick-intermediate",
  "Bauer|Supreme Fuse|Senior": "https://ca.bauer.com/products/bauer-supreme-fuse-grip-stick-senior",
  "Sherwood|CODE Photon 3|Intermediate": "https://sherwoodhockey.com/products/sherwood-code-photon-3-intermediate-hockey-stick",
  "Sherwood|CODE Photon 3|Senior": "https://sherwoodhockey.com/products/sherwood-code-photon-3-senior-hockey-stick",
  "Sherwood|CODE Photon 2|Intermediate": "https://sherwoodhockey.com/products/sherwood-code-photon-2-intermediate-hockey-stick",
  "Sherwood|CODE Photon 2|Senior": "https://sherwoodhockey.com/products/sherwood-code-photon-2-senior-hockey-stick",
  "Sherwood|CODE Photon 1|Intermediate": "https://sherwoodhockey.com/products/sherwood-code-photon-1-intermediate-hockey-stick",
  "Sherwood|CODE Photon 1|Senior": "https://sherwoodhockey.com/products/sherwood-code-photon-1-senior-hockey-stick",
  "Sherwood|CODE Photon Pro|Junior": "https://sherwoodhockey.com/products/sherwood-code-photon-pro-junior-hockey-stick",
  "Sherwood|CODE Photon Pro|Intermediate": "https://sherwoodhockey.com/products/sherwood-code-photon-pro-intermediate-hockey-stick",
  "Sherwood|CODE Photon Pro|Senior": "https://sherwoodhockey.com/products/sherwood-code-photon-pro-senior-hockey-stick",
  "Sherwood|REKKER Morph 3|Intermediate": "https://sherwoodhockey.com/products/sherwood-rekker-morph-3-intermediate-hockey-stick",
  "Sherwood|REKKER Morph 3|Senior": "https://sherwoodhockey.com/products/sherwood-rekker-morph-3-senior-hockey-stick",
  "Sherwood|REKKER Morph 2|Intermediate": "https://sherwoodhockey.com/products/sherwood-rekker-morph-2-intermediate-hockey-stick",
  "Sherwood|REKKER Morph 2|Senior": "https://sherwoodhockey.com/products/sherwood-rekker-morph-2-senior-hockey-stick",
  "Sherwood|REKKER Morph 1|Junior": "https://sherwoodhockey.com/products/sherwood-rekker-morph-1-junior-hockey-stick",
  "Sherwood|REKKER Morph 1|Intermediate": "https://sherwoodhockey.com/products/sherwood-rekker-morph-1-intermediate-hockey-stick",
  "Sherwood|REKKER Morph 1|Senior": "https://sherwoodhockey.com/products/sherwood-rekker-morph-1-senior-hockey-stick",
  "TRUE|HZRDUS 7X4|Senior": "https://www.true-sports.com/en-ca/hzrdus-7x4-senior-hockey-stick.html",
  "TRUE|HZRDUS 7X4|Intermediate": "https://www.hockeymonkey.ca/true-hockey-stick-hzrdus-7x4-int.html"
};

function productDestination(product, fit, profile) {
  const key = `${product.brand}|${product.name}|${fit.stickClass}`;
  const direct = stickProductLinks[key];
  if (direct) return {url:direct, label:'View this model ↗', kind:'product'};
  const hand = profile.hand === 'left' ? 'left handed' : profile.hand === 'right' ? 'right handed' : '';
  const query = `${product.brand} ${product.name} ${fit.stickClass} hockey stick ${product.optionFlex} flex ${hand} Canada`.trim();
  return {url:'https://www.google.com/search?q='+encodeURIComponent(query), label:'Search this model ↗', kind:'search'};
}

const state = { step: 1, results: [], fit: null, visibleCount: 5, sort: 'match' };
const form = $('#fitForm');
const kg = $('#weightKg');
const lb = $('#weightLb');
const cm = $('#heightCm');
const ft = $('#heightFt');
const inch = $('#heightIn');

function round(value, places = 1) { const factor = 10 ** places; return Math.round(value * factor) / factor; }
function syncWeight(source) {
  if (source === 'kg' && kg.value) lb.value = round(Number(kg.value) * 2.2046226218);
  if (source === 'lb' && lb.value) kg.value = round(Number(lb.value) / 2.2046226218);
}
function syncHeight(source) {
  if (source === 'cm' && cm.value) {
    const total = Number(cm.value) / 2.54;
    ft.value = Math.floor(total / 12);
    inch.value = round(total % 12);
  } else if (ft.value && inch.value !== '') {
    cm.value = round((Number(ft.value) * 12 + Number(inch.value)) * 2.54);
  }
}
kg.addEventListener('input', () => syncWeight('kg'));
lb.addEventListener('input', () => syncWeight('lb'));
cm.addEventListener('input', () => syncHeight('cm'));
ft.addEventListener('input', () => syncHeight('imperial'));
inch.addEventListener('input', () => syncHeight('imperial'));

function selected(name) { return form.elements[name].value; }
function validateStepOne() {
  let valid = true;
  const checks = [[$('#age'),5,75],[$('#experience'),0,60]];
  checks.forEach(([input,min,max]) => {
    const bad = input.value === '' || Number(input.value) < min || Number(input.value) > max;
    input.closest('.field').classList.toggle('invalid', bad); valid = valid && !bad;
  });
  const weightBad = !kg.value || Number(kg.value) < 18 || Number(kg.value) > 180;
  kg.closest('.measure-card').classList.toggle('invalid', weightBad); valid = valid && !weightBad;
  const heightBad = !cm.value || Number(cm.value) < 100 || Number(cm.value) > 215;
  cm.closest('.measure-card').classList.toggle('invalid', heightBad); valid = valid && !heightBad;
  return valid;
}

function showStep(step) {
  state.step = step;
  $$('.form-step').forEach(panel => panel.classList.toggle('active', Number(panel.dataset.step) === step));
  $$('#fit .steps li').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === step);
    dot.classList.toggle('done', index + 1 < step);
    if (index + 1 < step) $('span', dot).textContent = '✓'; else $('span', dot).textContent = index + 1;
  });
  $('#backButton').hidden = step === 1;
  $('#nextButton').innerHTML = step === 3 ? 'See my matches <span>→</span>' : 'Continue <span>→</span>';
  $('#formActions').style.display = step === 4 ? 'none' : 'flex';
  if (step === 4) buildResults();
  if (window.innerWidth < 760) $('#fit .steps').scrollIntoView({behavior:'smooth',block:'start'});
}

function nearest(value, options) { return options.reduce((a,b) => Math.abs(b-value) < Math.abs(a-value) ? b : a); }
function collectProfile() {
  return { age:Number($('#age').value), experience:Number($('#experience').value), kg:Number(kg.value), lb:Number(lb.value), cm:Number(cm.value), position:selected('position'), level:selected('level'), release:selected('release'), blade:selected('blade'), hand:selected('hand'), feel:selected('feel'), budget:Number(selected('budget')) };
}
function calculateFit(p) {
  let rawFlex = p.lb * (p.age < 13 ? .48 : .5);
  if (p.level === 'recreational') rawFlex -= 4;
  if (p.level === 'developing') rawFlex -= 2;
  if (p.level === 'elite') rawFlex += 2;
  if (p.experience < 2) rawFlex -= 3;
  if (p.feel === 'easy') rawFlex -= 4;
  if (p.feel === 'stiff') rawFlex += 4;
  rawFlex = Math.max(10, Math.min(95, rawFlex));
  const availableFlexes = [10,20,30,35,40,50,55,60,65,70,75,77,80,85,87,95,100];
  const flex = nearest(rawFlex, availableFlexes);
  const softer = availableFlexes.filter(x => x < flex).pop() || flex;
  const firmer = availableFlexes.find(x => x > flex) || flex;
  let stickClass = flex <= 30 ? 'Youth' : flex <= 50 ? 'Junior' : flex <= 65 ? 'Intermediate' : 'Senior';
  let lengthIn = p.cm / 2.54 - 9;
  if (p.position === 'defense') lengthIn += .75;
  lengthIn = Math.max(30, Math.min(66, Math.round(lengthIn * 2) / 2));
  const kick = {quick:'Low',load:'Mid',blend:'Hybrid'}[p.release] || 'Compare';
  const curve = {allround:'P29 / P92',toe:'P28',mid:'P88'}[p.blade] || 'Compare blade shapes';
  return { flex, flexRange:`${softer} to ${flex === softer ? firmer : flex}`, stickClass, lengthIn, lengthCm:Math.round(lengthIn*2.54), kick, curve };
}

const tierScore = {recreational:1,developing:2,competitive:3,elite:4};
function reviewsFor(product, stickClass) {
  return (window.stickReviewData?.records || []).filter(r => r.brand === product.brand && r.model === product.name && r.sizes.includes(stickClass) && r.count > 0 && r.rating > 0 && r.rating <= 5)
    .sort((a,b) => Number(a.combined)-Number(b.combined) || a.source.localeCompare(b.source));
}
function customerReviews(product, stickClass) {
  const reviews = reviewsFor(product,stickClass);
  if (!reviews.length) return '';
  const row = r => `<a href="${r.url}" target="_blank" rel="noopener">${r.rating.toFixed(2).replace(/0$/, '')}/5 · ${r.count} ${r.count === 1 ? 'review' : 'reviews'} · ${r.source} ↗</a><small>${r.scope}${r.count < 5 ? ' · Few reviews' : ''}</small>`;
  return `<div class="customer-reviews"><b>Customer reviews</b>${row(reviews[0])}${reviews.length > 1 ? `<details><summary>Other source</summary>${reviews.slice(1).map(row).join('')}</details>` : ''}</div>`;
}
function rankProducts(profile, fit) {
  const desiredTier = tierScore[profile.level];
  return productFamilies.map(product => {
    const price = product.prices[fit.stickClass];
    const optionFlex = nearest(fit.flex, product.flexes);
    const flexGap = Math.abs(optionFlex-fit.flex);
    const hasFlex = flexGap <= 3;
    const productTier = Math.max(...product.tiers.map(t => tierScore[t]));
    let score = 100;
    score -= Math.min(28, Math.abs(productTier-desiredTier)*10);
    score -= fit.kick === 'Compare' || product.kick === fit.kick ? 0 : (fit.kick === 'Hybrid' ? 4 : 13);
    score -= flexGap * 2.5;
    const review = reviewsFor(product,fit.stickClass)[0];
    return {...product, price, score:Math.round(score), productTier, hasFlex, optionFlex, review};
  }).filter(p => Number.isFinite(p.price) && (profile.budget === 999 || p.price <= profile.budget) && (!profile.reviewsOnly || p.review?.rating > 4)).sort((a,b) => b.score-a.score).slice(0,15)
    .map((product,index) => ({...product, matchRank:index+1}));
}

function reasonFor(product, profile, fit) {
  const response = {Low:'bending nearer the blade to help release the puck quickly',Mid:'bending nearer the middle of the long shaft you hold',Hybrid:'a mix of shaft bending and release characteristics'}[product.kick];
  const budgetText = profile.budget === 999 ? 'matches your unrestricted price selection' : 'fits your selected budget';
  const flexText = product.hasFlex ? '' : ` Closest listed flex is ${product.optionFlex}.`;
  const preference = fit.kick === 'Compare' ? 'You chose Not sure. Ask a store fitter to help you compare how this stick feels.' : product.kick === fit.kick ? 'Matches the shooting feel you selected.' : 'A different shooting feel to compare in store.';
  return `${product.kick} kick offers ${response}; ${budgetText}. ${preference}${flexText}`;
}
function badgeFor(product, index, profile) {
  if (product === state.results[0]) return '<span class="badge best">First to compare</span>';
  if (product.price === Math.min(...state.results.map(x=>x.price))) return '<span class="badge">Budget pick</span>';
  if (product.productTier === 4) return '<span class="badge level">Elite option</span>';
  return '<span class="badge">Alternative</span>';
}
function renderProducts(sort='match') {
  state.sort = sort;
  let products = [...state.results];
  if (sort === 'match') products.sort((a,b)=>a.matchRank-b.matchRank);
  if (sort === 'price') products.sort((a,b)=>a.price-b.price);
  if (sort === 'level') products.sort((a,b)=>a.productTier-b.productTier || b.score-a.score);
  if (sort === 'reviews') products.sort((a,b)=>(b.review?.rating ?? -1)-(a.review?.rating ?? -1) || (b.review?.count ?? 0)-(a.review?.count ?? 0) || a.matchRank-b.matchRank);
  products = products.slice(0,state.visibleCount);
  const profile = state.profile, fit = state.fit;
  $('#stickResults').innerHTML = products.map((p,index) => `
    <article class="stick-card">
      <div class="stick-rank" aria-label="Recommendation ${p.matchRank}">#${p.matchRank}</div>
      <div class="stick-main">
        <div class="badges">${badgeFor(p,index,profile)}<span class="badge">${p.brand}</span></div>
        <h4>${p.name} ${fit.stickClass}</h4>
        <p>${reasonFor(p,profile,fit)}</p>
        <div class="spec-row"><span>Level <b>${p.tiers.map(t=>t[0].toUpperCase()+t.slice(1)).join(' / ')}</b></span><span>Kick <b>${p.kick}</b></span><span>Available flex <b>${p.optionFlex}${p.hasFlex ? '' : '*'}</b></span></div>
        ${customerReviews(p,fit.stickClass)}
      </div>
      <div class="stick-buy"><small>REFERENCE CAD</small><strong>$${p.price.toFixed(2)}</strong><a href="${productDestination(p,fit,profile).url}" target="_blank" rel="noopener" aria-label="${productDestination(p,fit,profile).kind === 'product' ? 'View' : 'Search for'} ${p.brand} ${p.name} ${fit.stickClass}">${productDestination(p,fit,profile).label}</a></div>
    </article>`).join('') || '<p>No options meet these filters. Try turning off the review filter or changing your budget.</p>';
  $('#budgetResultsNote').textContent = `${state.results.length} options${profile.budget === 999 ? ' across all prices' : ` at CAD $${profile.budget} or less`}. Prices exclude tax and shipping.`;
  const more = $('#showMoreButton');
  const remaining = state.results.length-state.visibleCount;
  more.hidden = remaining <= 0;
  more.innerHTML = `Show ${Math.min(5,Math.max(0,remaining))} more <span>↓</span>${remaining > 0 ? ` <small>${remaining} remaining</small>` : ''}`;
}
function buildResults() {
  const p = collectProfile();
  const fit = calculateFit(p);
  state.profile = p; state.fit = fit; state.results = rankProducts(p,fit); state.visibleCount = 5; state.sort = 'match';
  $('#reviewsOnly').checked = false;
  const position = p.position === 'defense' ? 'defense' : 'forward';
  $('#resultTitle').textContent = `${p.level[0].toUpperCase()+p.level.slice(1)} ${position} · ${fit.kick === 'Compare' ? 'compare release feels' : fit.kick.toLowerCase() + ' kick preference'}`;
  $('#resultSummary').textContent = p.feel === 'easy' ? 'A softer setup designed to help generate release with less force.' : p.feel === 'stiff' ? 'A firmer setup for a player who deliberately wants more resistance.' : 'A balanced setup that is easy to load without giving up stability.';
  $('#resultFlex').textContent = fit.flex;
  $('#flexRange').textContent = `Comparison range ${fit.flexRange}`;
  $('#resultLength').innerHTML = `${fit.lengthIn}<span>″</span>`;
  $('#lengthMetric').textContent = `${fit.lengthCm} cm shaft · on skates`;
  $('#resultClass').textContent = fit.stickClass;
  $('#classDetail').textContent = `Confirm ${fit.flex} flex stock length`;
  $('#resultKick').textContent = fit.kick;
  $('#curveDetail').textContent = `${fit.curve} · try before choosing`;
  $('#heroFlex').textContent = fit.flex;
  $('#heroLength').innerHTML = `${fit.lengthIn}<span>″</span>`;
  const cutWarning = fit.lengthIn < (fit.stickClass === 'Junior' ? 54 : fit.stickClass === 'Intermediate' ? 57 : fit.stickClass === 'Senior' ? 60 : 48);
  $('#fitNote').innerHTML = `<b>Fit check:</b> In skates, the top should usually land between the chin and nose. ${p.position === 'defense' ? 'Your result leans slightly longer for reach and defensive play.' : 'Your result stays near the middle of the range for control.'} ${cutWarning ? 'If the stock shaft needs cutting, it will feel stiffer than its printed flex. Test it before cutting.' : 'Avoid adding length unless the exact stock shaft is too short.'}`;
  $('#sortResults').value = 'match'; renderProducts();
}

const photoFitState = { stream:null, captured:false, stickTop:null, nose:null, chin:null };
let aiPhoto = '', aiController = null;
async function refreshAIStatus() {
  try {
    const response = await fetch('/api/photo-fit', {cache:'no-store'});
    const status = await response.json();
    $('#sendAIPhoto').disabled = status.enabled !== true;
    $('#aiFitMessage').textContent = status.enabled ? '' : 'AI check is not configured yet. Manual check is available.';
  } catch {
    $('#sendAIPhoto').disabled = true;
    $('#aiFitMessage').textContent = 'AI check is unavailable. Manual check is available.';
  }
}

function assessGuidedStickFit(stickTopY,canvasHeight,noseY,chinY) {
  if (![stickTopY,canvasHeight,noseY,chinY].every(Number.isFinite) || canvasHeight<=0 || noseY<0 || chinY<=noseY || chinY>canvasHeight || stickTopY<0 || stickTopY>canvasHeight) return {status:'unclear',title:'Check the photo markers',detail:'Mark the actual nose, chin and stick top. Retake if the face or complete stick is not visible.'};
  if (stickTopY < noseY) return {status:'long',title:'The stick may be too long',detail:'The marked stick top is above the marked nose. Confirm the length in person before cutting.'};
  if (stickTopY > chinY) return {status:'short',title:'The stick may be too short',detail:'The marked stick top is below the marked chin. Compare a longer stick in store.'};
  return {status:'good',title:'Your stick length looks right',detail:'Your marks put the stick top between your chin and nose. This assumes you have skates on and the stick is upright with its blade toe (front tip) on the floor.'};
}

function stopFitCamera() {
  if (photoFitState.stream) photoFitState.stream.getTracks().forEach(track => track.stop());
  photoFitState.stream = null; $('#fitCameraVideo').srcObject = null;
}

function setCapturedMode(captured) {
  $('#aiPhotoPanel').hidden = !captured;
  $('#aiPhotoConsent').checked = false;
  if (!captured) { aiPhoto = ''; aiController?.abort(); aiController = null; }
  photoFitState.captured = captured; photoFitState.stickTop = null;
  photoFitState.nose = null; photoFitState.chin = null;
  $('#fitCameraVideo').hidden = captured; $('#fitCameraCanvas').hidden = !captured;
  $('#fitCameraOverlay').hidden = captured; $('#stickTopHint').hidden = !captured;
  $('#captureFitPhoto').hidden = captured; $('#retakeFitPhoto').hidden = !captured; $('#finishPhotoFit').hidden = !captured;
  $('#finishPhotoFit').disabled = true;
  $('#cameraInstruction').textContent = captured ? 'Mark the actual points on the photo' : 'Skates on. Stand straight. Hold the stick upright.';
  $('#stickTopHint').textContent = '1 of 3: Tap the tip of the nose';
}

let cameraRequest = 0;
async function openFitCamera() {
  refreshAIStatus();
  stopFitCamera();
  const request = ++cameraRequest;
  const modal = $('#cameraModal'), result = $('#photoFitResult');
  result.hidden = true; modal.hidden = false; document.body.classList.add('camera-open'); setCapturedMode(false);
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
    const stream = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1080},height:{ideal:1920}}});
    if (request !== cameraRequest) { stream.getTracks().forEach(track => track.stop()); return; }
    photoFitState.stream = stream;
    const video = $('#fitCameraVideo'); video.srcObject = photoFitState.stream; await video.play();
  } catch (error) {
    if (request !== cameraRequest) return;
    stopFitCamera(); modal.hidden = true; document.body.classList.remove('camera-open');
    result.hidden = false; result.className = 'photo-fit-result warning';
    result.innerHTML = '<span class="photo-verdict">Camera unavailable</span><h4>Allow camera access</h4><p>Photo Fit needs camera permission and an HTTPS connection. On iPhone, open Safari Settings for this site and allow Camera, then try again.</p>';
  }
}

function closeFitCamera() { cameraRequest++; stopFitCamera(); $('#cameraModal').hidden = true; document.body.classList.remove('camera-open'); const canvas=$('#fitCameraCanvas'); canvas.width=0; canvas.height=0; setCapturedMode(false); }
function resetPhotoFit() { closeFitCamera(); $('#photoFitResult').hidden = true; const canvas=$('#fitCameraCanvas'); canvas.width=0; canvas.height=0; }

$('#openFitCamera').addEventListener('click',openFitCamera);
$('#closeFitCamera').addEventListener('click',closeFitCamera);
window.addEventListener('pagehide', resetPhotoFit);
$('#captureFitPhoto').addEventListener('click', () => {
  const video = $('#fitCameraVideo'), canvas = $('#fitCameraCanvas');
  if (!video.videoWidth || !video.videoHeight) return;
  const rect=video.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const scale=Math.max(rect.width/video.videoWidth,rect.height/video.videoHeight);
  const sw=rect.width/scale, sh=rect.height/scale;
  canvas.width=Math.round(sw); canvas.height=Math.round(sh);
  canvas.getContext('2d').drawImage(video,(video.videoWidth-sw)/2,(video.videoHeight-sh)/2,sw,sh,0,0,canvas.width,canvas.height);
  stopFitCamera(); setCapturedMode(true);
  const scaled = document.createElement('canvas');
  const ratio = Math.min(1,1600 / Math.max(canvas.width,canvas.height));
  scaled.width = Math.round(canvas.width * ratio); scaled.height = Math.round(canvas.height * ratio);
  scaled.getContext('2d').drawImage(canvas,0,0,scaled.width,scaled.height);
  aiPhoto = scaled.toDataURL('image/jpeg',0.8);
  scaled.width = 0; scaled.height = 0;
});
$('#sendAIPhoto').addEventListener('click', async () => {
  if (!aiPhoto || aiController) return;
  if (!$('#aiPhotoConsent').checked) { $('#aiFitMessage').textContent = 'Confirm photo sharing first.'; return; }
  const controller = new AbortController(); aiController = controller;
  const button = $('#sendAIPhoto'); button.disabled = true;
  $('#aiFitMessage').textContent = 'Checking your photo…';
  try {
    const response = await fetch('/api/photo-fit', {method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({image:aiPhoto,consent:true})});
    const data = await response.json();
    if (controller.signal.aborted) return;
    if (!response.ok) throw new Error(data.error || 'AI check is unavailable. Use the manual check.');
    const titles = {short:'Stick appears short',starting_range:'Your stick length looks right',long:'Stick appears long',retake:'Retake this photo'};
    if (!titles[data.status] || typeof data.reason !== 'string' || typeof data.next_step !== 'string') throw new Error('AI returned an unclear result. Use the manual check.');
    closeFitCamera();
    const result = $('#photoFitResult'); result.hidden = false; result.className = 'photo-fit-result ' + (data.status === 'starting_range' ? 'good' : 'adjust');
    result.replaceChildren();
    const looksRight = data.status === 'starting_range';
    for (const [tag,text] of [['span','AI length check · Beta'],['h4',titles[data.status]],['p',looksRight ? 'The top of your stick is between your chin and nose with skates on.' : data.reason],['p',looksRight ? '' : data.next_step],['p',looksRight ? 'This checks length only. Try the stick to confirm it feels comfortable.' : 'A photo estimate only. Confirm flex, blade lie and comfort in person before cutting or buying.']].filter(([,text])=>text)) {
      const node = document.createElement(tag); node.textContent = text; result.append(node);
    }
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  } catch (error) {
    if (!controller.signal.aborted) $('#aiFitMessage').textContent = error.message;
  } finally {
    if (aiController === controller) aiController = null;
    button.disabled = false;
  }
});
$('#retakeFitPhoto').addEventListener('click',openFitCamera);
$('#fitCameraCanvas').addEventListener('click', event => {
  if (!photoFitState.captured) return;
  const canvas = event.currentTarget, rect = canvas.getBoundingClientRect();
  if (photoFitState.stickTop) return;
  const scale=Math.min(rect.width/canvas.width,rect.height/canvas.height);
  const point={x:(event.clientX-rect.left-(rect.width-canvas.width*scale)/2)/scale,y:(event.clientY-rect.top-(rect.height-canvas.height*scale)/2)/scale};
  if (point.x<0 || point.y<0 || point.x>canvas.width || point.y>canvas.height) return;
  const key=!photoFitState.nose?'nose':!photoFitState.chin?'chin':'stickTop';
  if (key==='chin' && point.y<=photoFitState.nose.y) { $('#stickTopHint').textContent='Tap the chin below the nose, or choose Retake'; return; }
  photoFitState[key]=point;
  const context = canvas.getContext('2d');
  context.beginPath(); context.arc(point.x,point.y,Math.max(3,canvas.width*.006),0,Math.PI*2);
  context.fillStyle='#1ee6d1'; context.fill(); context.lineWidth=Math.max(3,canvas.width*.004); context.strokeStyle='#071426'; context.stroke();
  $('#stickTopHint').textContent=key==='nose'?'2 of 3: Tap the bottom of the chin':key==='chin'?'3 of 3: Tap the top of the stick':'All points marked. See result or Retake to correct.';
  $('#finishPhotoFit').disabled=!photoFitState.stickTop;
});
$('#finishPhotoFit').addEventListener('click', () => {
  const canvas=$('#fitCameraCanvas'), fit=assessGuidedStickFit(photoFitState.stickTop?.y,canvas.height,photoFitState.nose?.y,photoFitState.chin?.y), result=$('#photoFitResult');
  closeFitCamera(); result.hidden=false; result.className=`photo-fit-result ${fit.status==='good'?'good':'adjust'}`;
  result.innerHTML=`<span class="photo-verdict">${fit.status==='good'?'Good photo fit':'Adjustment recommended'}</span><h4>${fit.title}</h4><p>${fit.detail}</p><p class="flex-limit"><b>Photo scope:</b> standing length only. Flex and blade lie need a separate check with a coach or store fitter.</p>`;
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
  photoFitState.captured=false; photoFitState.stickTop=null;
});

$('#nextButton').addEventListener('click', () => {
  if (state.step === 1 && !validateStepOne()) return;
  if (state.step < 4) showStep(state.step+1);
});
$('#backButton').addEventListener('click', () => showStep(Math.max(1,state.step-1)));
$('#editButton').addEventListener('click', () => showStep(1));
$('#restartButton').addEventListener('click', () => { form.reset(); kg.value=36; syncWeight('kg'); cm.value=157; syncHeight('cm'); resetPhotoFit(); showStep(1); });
$('#sortResults').addEventListener('change', e => renderProducts(e.target.value));
$('#reviewsOnly').addEventListener('change', e => {
  state.profile.reviewsOnly = e.target.checked;
  state.results = rankProducts(state.profile,state.fit);
  state.visibleCount = 5;
  renderProducts(state.sort);
});
$('#showMoreButton').addEventListener('click', () => { state.visibleCount = Math.min(15,state.visibleCount+5); renderProducts(state.sort); });
function leaveStandalonePhotoFit() {
  resetPhotoFit();
  $('#photoFitResultsSlot').append($('#photoFitTool'));
  $('#standalonePhotoFit').hidden = true;
  if (location.hash === '#photo-fit') history.replaceState(null, '', location.pathname + location.search);
}
function showStandalonePhotoFit() {
  resetPhotoFit();
  window.ShinFit?.clearPhotos();
  equipmentHome.hidden = true;
  $$('.app-view').forEach(element => { element.hidden = true; });
  $('#standalonePhotoFit').hidden = false;
  $('#standalonePhotoSlot').append($('#photoFitTool'));
  history.replaceState(null, '', '#photo-fit');
  window.scrollTo({top:0, behavior:'smooth'});
  $('#standalonePhotoTitle').focus({preventScroll:true});
}
$('#homePhotoFit').addEventListener('click', showStandalonePhotoFit);
$('#photoButton').addEventListener('click', showStandalonePhotoFit);
$('#startPhotoFit').addEventListener('click', showStandalonePhotoFit);
$('#photoBackHome').addEventListener('click', showEquipmentHome);
window.addEventListener('hashchange', () => {
  if (location.hash === '#photo-fit') showStandalonePhotoFit();
  else if (!$('#standalonePhotoFit').hidden) showEquipmentHome();
});
$('#shareButton').addEventListener('click', async () => {
  const shareData = { title:'HockeyFit', text:'Find a better starting point for hockey stick length and flex with this free community tool.', url:window.location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); const toast=$('#toast'); toast.textContent='HockeyFit link copied.'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2200); }
  } catch (error) { if (error.name !== 'AbortError') console.warn('Sharing was not available.', error); }
});

window.HockeyFit = { calculateFit, rankProducts, productFamilies, assessGuidedStickFit };
showStep(1);
if (location.hash === '#photo-fit') showStandalonePhotoFit();
