/*
 * D365 Company & Environment Switcher
 * Copyright © 2026 Ahmed Imam. All Rights Reserved.
 * Proprietary software. See LICENSE.txt.
 */
const api = typeof browser !== "undefined" ? browser : chrome;
const $ = (id) => document.getElementById(id);
let state = { tab: null, url: null, companies: [], environments: [] };

function esc(value) { return String(value ?? ""); }
function setStatus(message, kind = "") { const el=$("status"); el.textContent=message; el.className=`status ${kind}`.trim(); }
function isDynamicsHost(hostname) { return /(^|\.)operations(?:\.[a-z0-9-]+)?\.dynamics\.com$/i.test(hostname); }
function matchesConfiguredHost(url) { return state.environments.some((e) => { try { return new URL(e.url).host.toLowerCase() === url.host.toLowerCase(); } catch { return false; } }); }
function addOptions(select, items, valueFn, textFn, placeholder) {
  select.replaceChildren(); const first=document.createElement("option"); first.value=""; first.textContent=placeholder; select.append(first);
  items.forEach((item,index)=>{const option=document.createElement("option"); option.value=String(index); option.textContent=textFn(item); option.dataset.actual=valueFn(item); select.append(option);});
  select.disabled = items.length === 0;
}
async function initialize() {
  setStatus("");
  try {
    const [tab] = await api.tabs.query({active:true,currentWindow:true}); state.tab=tab||null; state.url=tab?.url ? new URL(tab.url) : null;
    const saved = await api.storage.local.get(["companies","environments"]);
    state.companies = Array.isArray(saved.companies) ? saved.companies : D365_DEFAULTS.companies;
    state.environments = Array.isArray(saved.environments) ? saved.environments : D365_DEFAULTS.environments;
    const env=$("environment"), company=$("company");
    addOptions(env,state.environments,e=>e.url,e=>e.name,"Select environment…");
    addOptions(company,state.companies,c=>c.code,c=>`${c.code} — ${c.description}`,"Select company…");
    if (!state.url) { $("context").textContent="The active tab URL is unavailable."; return; }
    const currentEnv = state.environments.findIndex(e=>{try{return new URL(e.url).host.toLowerCase()===state.url.host.toLowerCase();}catch{return false;}});
    const cmp = state.url.searchParams.get("cmp"); const currentCompany=state.companies.findIndex(c=>c.code.toLowerCase()===(cmp||"").toLowerCase());
    if(currentEnv>=0) env.value=String(currentEnv); if(currentCompany>=0) company.value=String(currentCompany);
    const envText=currentEnv>=0?state.environments[currentEnv].name:state.url.hostname;
    const companyText=currentCompany>=0?`${state.companies[currentCompany].code} — ${state.companies[currentCompany].description}`:(cmp||"not detected");
    $("context").textContent=`Current: ${envText} | ${companyText}`;
    if(!state.environments.length || !state.companies.length) setStatus("Open Manage lists to complete setup.");
  } catch (error) { console.error(error); setStatus("Unable to read the active tab or saved configuration.","error"); }
}
$("environment").addEventListener("change", async (event)=>{
  const index=Number(event.target.value); if(!Number.isInteger(index)||!state.environments[index]||!state.tab) return;
  try {
    const configured=new URL(state.environments[index].url); let target=new URL(configured.href);
    if(state.url && (isDynamicsHost(state.url.hostname)||matchesConfiguredHost(state.url))){target.pathname=state.url.pathname; target.search=state.url.search; target.hash=state.url.hash;}
    setStatus(`Opening ${state.environments[index].name}…`); await api.tabs.update(state.tab.id,{url:target.href}); window.close();
  } catch(error){console.error(error);setStatus("The selected environment URL is invalid.","error");}
});
$("company").addEventListener("change", async (event)=>{
  const index=Number(event.target.value); if(!Number.isInteger(index)||!state.companies[index]||!state.tab||!state.url) return;
  if(!(isDynamicsHost(state.url.hostname)||matchesConfiguredHost(state.url))){setStatus("Open a configured D365 environment before switching company.","error");return;}
  try { const target=new URL(state.url.href); target.searchParams.set("cmp",state.companies[index].code); setStatus(`Switching to ${state.companies[index].code}…`); await api.tabs.update(state.tab.id,{url:target.href}); window.close(); }
  catch(error){console.error(error);setStatus("Unable to switch company.","error");}
});
$("manage").addEventListener("click",()=>api.runtime.openOptionsPage());
$("refresh").addEventListener("click",initialize);
initialize();
