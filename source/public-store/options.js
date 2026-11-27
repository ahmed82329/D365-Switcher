/*
 * D365 Company & Environment Switcher
 * Copyright © 2026 Ahmed Imam. All Rights Reserved.
 * Proprietary software. See LICENSE.txt.
 */
const api = typeof browser !== "undefined" ? browser : chrome;
const $ = (id) => document.getElementById(id);
let companies=[]; let environments=[];
function setStatus(message,kind=""){const el=$("status");el.textContent=message;el.className=`status ${kind}`.trim();}
function normalizeCode(v){return String(v).trim().toUpperCase();}
function normalizeEnvironment(name,url){const parsed=new URL(String(url).trim());if(parsed.protocol!=="https:")throw new Error("Environment URLs must use HTTPS.");if(parsed.username||parsed.password)throw new Error("Credentials are not allowed in environment URLs.");return {name:String(name).trim(),url:parsed.href};}
function validateAll(nextCompanies,nextEnvironments){
 if(!Array.isArray(nextCompanies)||!Array.isArray(nextEnvironments))throw new Error("Configuration must contain companies and environments arrays.");
 const cleanCompanies=nextCompanies.map(c=>({code:normalizeCode(c.code),description:String(c.description??"").trim()}));
 if(cleanCompanies.some(c=>!c.code||!c.description||!/^[A-Z0-9._-]{1,20}$/.test(c.code)))throw new Error("Each company needs a valid code and description.");
 if(new Set(cleanCompanies.map(c=>c.code.toLowerCase())).size!==cleanCompanies.length)throw new Error("Company codes must be unique.");
 const cleanEnvironments=nextEnvironments.map(e=>normalizeEnvironment(e.name,e.url));
 if(cleanEnvironments.some(e=>!e.name))throw new Error("Each environment needs a name.");
 const origins=cleanEnvironments.map(e=>new URL(e.url).origin.toLowerCase());if(new Set(origins).size!==origins.length)throw new Error("Environment hosts must be unique.");
 return {companies:cleanCompanies,environments:cleanEnvironments};
}
async function save(message="Saved."){const clean=validateAll(companies,environments);companies=clean.companies;environments=clean.environments;await api.storage.local.set({companies,environments});render();setStatus(message,"ok");}
function actionButton(text,action,index,kind=""){const b=document.createElement("button");b.type="button";b.textContent=text;b.dataset.action=action;b.dataset.index=String(index);if(kind)b.className=kind;return b;}
function render(){
 const er=$("environmentRows");er.replaceChildren();environments.forEach((e,i)=>{const tr=document.createElement("tr");const n=document.createElement("td");n.textContent=e.name;const u=document.createElement("td");u.textContent=e.url;const a=document.createElement("td");a.className="compact";a.append(actionButton("Edit","edit-environment",i)," ",actionButton("Remove","remove-environment",i,"danger"));tr.append(n,u,a);er.append(tr);});
 if(!environments.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=3;td.className="muted";td.textContent="No environments configured.";tr.append(td);er.append(tr);}
 const cr=$("companyRows");cr.replaceChildren();companies.forEach((c,i)=>{const tr=document.createElement("tr");const code=document.createElement("td");code.textContent=c.code;const d=document.createElement("td");d.textContent=c.description;const a=document.createElement("td");a.className="compact";a.append(actionButton("Edit","edit-company",i)," ",actionButton("Remove","remove-company",i,"danger"));tr.append(code,d,a);cr.append(tr);});
 if(!companies.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=3;td.className="muted";td.textContent="No companies configured.";tr.append(td);cr.append(tr);}
}
async function init(){const saved=await api.storage.local.get(["companies","environments"]);companies=Array.isArray(saved.companies)?saved.companies:structuredClone(D365_DEFAULTS.companies);environments=Array.isArray(saved.environments)?saved.environments:structuredClone(D365_DEFAULTS.environments);$("variantNote").textContent=D365_DEFAULTS.variantNote;render();}
$("environmentForm").addEventListener("submit",async e=>{e.preventDefault();try{const item=normalizeEnvironment($("environmentName").value,$("environmentUrl").value);const raw=$("environmentEditIndex").value;if(raw==="")environments.push(item);else environments[Number(raw)]=item;$("environmentForm").reset();$("environmentEditIndex").value="";$("saveEnvironment").textContent="Add";await save("Environment saved.");}catch(err){setStatus(err.message,"error");}});
$("companyForm").addEventListener("submit",async e=>{e.preventDefault();try{const item={code:normalizeCode($("companyCode").value),description:$("companyDescription").value.trim()};const raw=$("companyEditIndex").value;if(raw==="")companies.push(item);else companies[Number(raw)]=item;$("companyForm").reset();$("companyEditIndex").value="";$("saveCompany").textContent="Add";await save("Company saved.");}catch(err){setStatus(err.message,"error");}});
document.addEventListener("click",async e=>{const b=e.target.closest("button[data-action]");if(!b)return;const i=Number(b.dataset.index);try{if(b.dataset.action==="edit-environment"){const x=environments[i];$("environmentName").value=x.name;$("environmentUrl").value=x.url;$("environmentEditIndex").value=String(i);$("saveEnvironment").textContent="Update";}else if(b.dataset.action==="remove-environment"){if(confirm(`Remove ${environments[i].name}?`)){environments.splice(i,1);await save("Environment removed.");}}else if(b.dataset.action==="edit-company"){const x=companies[i];$("companyCode").value=x.code;$("companyDescription").value=x.description;$("companyEditIndex").value=String(i);$("saveCompany").textContent="Update";}else if(b.dataset.action==="remove-company"){if(confirm(`Remove ${companies[i].code}?`)){companies.splice(i,1);await save("Company removed.");}}}catch(err){setStatus(err.message,"error");}});
$("exportConfig").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({schemaVersion:1,product:"D365 Company & Environment Switcher",companies,environments},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="d365-switcher-configuration.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("Configuration exported.","ok");});
$("importButton").addEventListener("click",()=>$("importFile").click());
$("importFile").addEventListener("change",async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1024*1024)throw new Error("Import file is too large.");const parsed=JSON.parse(await file.text());const clean=validateAll(parsed.companies,parsed.environments);companies=clean.companies;environments=clean.environments;await save("Configuration imported.");}catch(err){setStatus(`Import failed: ${err.message}`,"error");}finally{e.target.value="";}});
$("restoreDefaults").addEventListener("click",async()=>{if(!confirm("Replace both lists with this build's defaults?"))return;companies=structuredClone(D365_DEFAULTS.companies);environments=structuredClone(D365_DEFAULTS.environments);await save("Defaults restored.");});
init().catch(err=>setStatus(err.message,"error"));
