const API_URL = "http://localhost:5000/api";

document.getElementById("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const username=document.getElementById("username").value;
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  const role=document.getElementById("role").value;
  const res=await fetch(`${API_URL}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,email,password,role})});
  const data=await res.json();alert(data.message||data.error);
});

document.getElementById("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  const res=await fetch(`${API_URL}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const data=await res.json();alert(data.message||data.error);
});

document.getElementById("verifyForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const email=document.getElementById("email").value;
  const code=document.getElementById("code").value;
  const res=await fetch(`${API_URL}/auth/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code})});
  const data=await res.json();alert(data.message||data.error);
});
