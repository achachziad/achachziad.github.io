const checkEmailIsValid = (email) => {
  let emailReg = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailReg.test(email);
};

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await setEmail();
  });
});

async function setEmail() {
  const responseText = document.getElementById("message-response");
  const email = document.getElementById("Email").value.trim();
  const message = document.getElementById("Message").value.trim();

  if (!email || !message) {
    responseText.innerText = "Merci de remplir les deux champs.";
    return;
  }
  if (!checkEmailIsValid(email)) {
    responseText.innerText = "Adresse e-mail invalide.";
    return;
  }

  // Pas d’envoi externe par défaut : on propose un mailto
  const subject = encodeURIComponent("[Portfolio] Nouveau message");
  const body = encodeURIComponent(`De: ${email}\n\n${message}`);
  const mailto = `mailto:achach.ziad.pro@gmail.com?subject=${subject}&body=${body}`;

  responseText.innerText = "Ouverture de votre client e-mail…";
  window.location.href = mailto;

  setTimeout(resetTheForm, 1500);
}

function resetTheForm() {
  document.getElementById("message-response").innerText = "";
  document.getElementById("Email").value = "";
  document.getElementById("Message").value = "";
}
