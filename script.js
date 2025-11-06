// Simple client-side prototype logic (no backend).
// Stores data in localStorage so you can test flows.

const state = {
  user: null,
  dietHTML: null,
  history: []
}

// Elements
const authSection = document.getElementById('authSection')
const dashboard = document.getElementById('dashboard')
const btnCreate = document.getElementById('btnCreate')
const inpName = document.getElementById('inpName')
const inpEmail = document.getElementById('inpEmail')
const uName = document.getElementById('uName')
const subStatus = document.getElementById('subStatus')
const btnPay = document.getElementById('btnPay')
const btnLogin = document.getElementById('btnLogin')
const menuBtns = document.querySelectorAll('.menu-btn')
const tabs = document.querySelectorAll('.tab')
const dietaContent = document.getElementById('dietaContent')
const btnDownloadDiet = document.getElementById('btnDownloadDiet')
const historyList = document.getElementById('historyList')
const ingInput = document.getElementById('ingInput')
const genRecipe = document.getElementById('genRecipe')
const recipeResult = document.getElementById('recipeResult')
const fileExam = document.getElementById('fileExam')
const btnProcessExam = document.getElementById('btnProcessExam')
const examResult = document.getElementById('examResult')

// helpers
function saveState(){ localStorage.setItem('dougfit_state', JSON.stringify(state)) }
function loadState(){ const s = localStorage.getItem('dougfit_state'); if(s){ Object.assign(state, JSON.parse(s)) } }
function showTab(name){
  menuBtns.forEach(b=> b.classList.toggle('active', b.dataset.tab===name))
  tabs.forEach(t=> t.classList.toggle('active', t.id===name))
}

// initial diet template (uses Tairan plan as base)
function generateDietTemplate(meta={weight:70}){
  const kcal = 3200
  const prot = Math.round(meta.weight * 2.2)
  return `
  <div class="card">
    <h3>Dieta — Meta ~${kcal} kcal/dia</h3>
    <p class="muted">Peso considerado: ${meta.weight} kg · Proteína alvo: ${prot} g/dia</p>
    <h4>Horários (ajustados)</h4>
    <ul>
      <li>07:00 — Café da manhã (ex: ovos, aveia, banana)</li>
      <li>10:00 — Lanche</li>
      <li>12:30 — Almoço</li>
      <li>17:00 — Lanche</li>
      <li>19:30 — Pré-treino</li>
      <li>20:30 — Treino</li>
      <li>22:00 — Pós-treino (hipercalórico)</li>
      <li>23:00 — Ceia (caseína/ricota)</li>
    </ul>
    <p class="muted">Suplementos recomendados: Creatina 5g/dia, Whey, Hipercalórico, Multivitamínico, Ômega-3.</p>
  </div>`
}

// populate initial state
loadState()
if(state.dietHTML===null) state.dietHTML = generateDietTemplate({weight:70})

// Event: create user (simulated)
btnCreate.addEventListener('click', ()=>{
  const name = inpName.value.trim() || 'Aluno'
  const email = inpEmail.value.trim() || 'email@exemplo.com'
  state.user = {name, email, subscribed:false}
  state.history = state.history || []
  state.history.push({date: new Date().toLocaleString(), type:'Conta criada', details: 'Usuário criado no protótipo.'})
  saveState()
  enterDashboard()
})

// Enter dashboard
function enterDashboard(){
  authSection.classList.add('hidden')
  dashboard.classList.remove('hidden')
  uName.textContent = state.user.name || 'Aluno'
  subStatus.textContent = state.user.subscribed ? 'Ativa' : 'Não assinado'
  dietaContent.innerHTML = state.dietHTML
  renderHistory()
  showTab('treino')
}

// Pay button (simulated)
btnPay.addEventListener('click', ()=>{
  if(!state.user){ alert('Cadastre-se primeiro (simulado).'); return; }
  const ok = confirm('Simular pagamento recorrente via PayPal por R$29,90/mês? (simulado)')
  if(ok){
    state.user.subscribed = true
    state.history.push({date: new Date().toLocaleString(), type:'Pagamento', details:'Assinatura mensal ativada (simulada)'})
    saveState()
    subStatus.textContent = 'Ativa'
    alert('Assinatura simulada ativada. O sistema irá liberar atualizações mensais automaticamente.')
  }
})

// menu switching
menuBtns.forEach(b=> b.addEventListener('click', ()=> showTab(b.dataset.tab)) )

// Download diet as HTML file (client-side)
btnDownloadDiet.addEventListener('click', ()=>{
  const blob = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>Dieta</title></head><body>${state.dietHTML}</body></html>`], {type:'text/html'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'dieta_tairan.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
})

// render history
function renderHistory(){
  historyList.innerHTML = ''
  state.history = state.history || []
  if(state.history.length===0){
    historyList.innerHTML = '<p class="muted">Nenhum histórico ainda.</p>'
    return
  }
  state.history.slice().reverse().forEach(entry=>{
    const el = document.createElement('div'); el.className='entry card'
    el.innerHTML = `<strong>${entry.type}</strong> <div class="muted" style="font-size:13px">${entry.date}</div><div>${entry.details}</div>`
    historyList.appendChild(el)
  })
}

// Simulated AI recipe generator (local lightweight logic)
function generateRecipeFromIngredients(text){
  // simple parser: split by comma, pick main protein/carbs/veg
  const items = text.split(',').map(s=> s.trim().toLowerCase()).filter(Boolean)
  if(items.length===0) return {error:'Nenhum ingrediente fornecido.'}
  // heuristics
  const proteins = items.filter(i=> /(frango|peixe|carne|atum|ovo|tofu)/.test(i))
  const carbs = items.filter(i=> /(batata|arroz|massa|aveia|pão|mandioca|batata doce|batata-doce|macarrão)/.test(i))
  const vegs = items.filter(i=> /(espinafre|alface|tomate|cenoura|brócolis|couve|abobrinha|cebola|pimentão)/.test(i))
  const spices = ['sal, pimenta, azeite, alho, cebola']
  const protein = proteins[0] || items[0]
  const carb = carbs[0] || (items.find(i=>/\d/.test(i)) ? items.find(i=>/\d/.test(i)) : items.find(i=>![protein].includes(i)))
  const veg = vegs[0] || items.find(i=> i!==protein && i!==carb) || 'salada verde'
  const name = `${protein.charAt(0).toUpperCase()+protein.slice(1)} com ${carb || 'acompanhamento'} e ${veg}`
  const time = protein ? 35 : 20
  const steps = [
    `1. Tempere o ${protein} com sal, pimenta e alho. Deixe marinar 10 min.`,
    `2. Cozinhe ${carb} (ou asse se for batata doce) por ~20 minutos até ficar macio.`,
    `3. Grelhe ou asse o ${protein} por 8-12 minutos (dependendo do corte).`,
    `4. Refogue ${veg} rapidamente com azeite e finalize com pimenta.`,
    `5. Monte o prato: ${protein}, ${carb} e ${veg}. Sirva imediatamente.`
  ]
  const nutrition = {
    calories: Math.round(400 + (proteins.length?200:0) + (carbs.length?150:0)),
    protein_g: proteins.length?35:20,
    carbs_g: carbs.length?60:30,
    fat_g: 12
  }
  return {name, time, steps, nutrition, spices:spices.join(', ')}
}

// Generate recipe handler
genRecipe.addEventListener('click', ()=>{
  const text = ingInput.value.trim()
  recipeResult.classList.remove('hidden')
  const res = generateRecipeFromIngredients(text)
  if(res.error){ recipeResult.innerHTML = `<div class="muted">${res.error}</div>`; return }
  recipeResult.innerHTML = `<h3>${res.name}</h3>
    <p class="muted">Tempo de preparo: ${res.time} min · Temperos sugeridos: ${res.spices}</p>
    <h4>Ingredientes sugeridos</h4>
    <ul>${text.split(',').map(s=>`<li>${s.trim()}</li>`).join('')}</ul>
    <h4>Modo de Preparo</h4>
    <ol>${res.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <h4>Nutrição estimada</h4>
    <p class="muted">Calorias ≈ ${res.nutrition.calories} kcal · Proteína ≈ ${res.nutrition.protein_g} g · Carbs ≈ ${res.nutrition.carbs_g} g</p>
  `
})

// Exam processing simulation: reads file name and "updates" diet
btnProcessExam.addEventListener('click', ()=>{
  if(!state.user){ alert('Cadastre-se primeiro.'); return; }
  const f = fileExam.files[0]
  if(!f){ alert('Selecione um arquivo de exame (imagem ou pdf).'); return; }
  // Simulate processing: extract weight heuristically from filename (e.g., "bio_72kg.pdf")
  const name = f.name.toLowerCase()
  let weight = 70
  const match = name.match(/(\d{2})\s?kg/)
  if(match) weight = parseInt(match[1],10)
  // create a new diet based on weight
  const newDiet = generateDietTemplate({weight})
  state.dietHTML = newDiet
  state.history.push({date:new Date().toLocaleString(), type:'Exame processado', details:`Arquivo ${f.name} processado. Nova dieta para ${weight} kg.`})
  saveState()
  dietaContent.innerHTML = state.dietHTML
  renderHistory()
  examResult.classList.remove('hidden')
  examResult.innerHTML = `<strong>Exame processado:</strong> ${f.name}<div class="muted">Dieta atualizada para ${weight} kg (simulado)</div>`
  showTab('dieta')
})

// load saved session if present
if(state.user){ enterDashboard() }
