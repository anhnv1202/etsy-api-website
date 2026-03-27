const descriptionText = `ListingHub is a private internal tool built for one Etsy shop. It helps us read listings, receipts, inventory, and shop information to reduce manual operations and improve reporting. This tool is not a public buyer app and is used only by authorized internal users. We request only minimum required scopes, handle OAuth tokens securely, and follow Etsy API Terms of Use.`;

const scopePresets = {
  readonly: ["shops_r", "listings_r", "transactions_r"],
  sellerops: ["shops_r", "shops_w", "listings_r", "listings_w", "transactions_r"],
};

function setDescription() {
  const textArea = document.getElementById("app-description");
  if (!textArea) return;
  textArea.value = descriptionText;
}

function copyDescription() {
  const textArea = document.getElementById("app-description");
  const status = document.getElementById("copy-status");
  if (!textArea || !status) return;

  textArea.select();
  textArea.setSelectionRange(0, 99999);

  navigator.clipboard
    .writeText(textArea.value)
    .then(() => {
      status.textContent = "Copied. You can paste this into Etsy now.";
    })
    .catch(() => {
      status.textContent = "Clipboard blocked. Copy manually from the box.";
    });
}

function applyPreset(presetKey) {
  const selected = scopePresets[presetKey] || [];
  const checkboxes = document.querySelectorAll("input[name='scope']");
  checkboxes.forEach((cb) => {
    cb.checked = selected.includes(cb.value);
  });
  buildAuthorizeUrl();
}

function selectedScopes() {
  const scopes = [];
  document.querySelectorAll("input[name='scope']:checked").forEach((input) => {
    scopes.push(input.value);
  });
  return scopes;
}

function buildAuthorizeUrl() {
  const key = document.getElementById("etsy-key")?.value.trim();
  const redirect = document.getElementById("redirect-uri")?.value.trim();
  const state = document.getElementById("oauth-state")?.value.trim() || "devstate123";
  const challenge = document.getElementById("code-challenge")?.value.trim() || "S256_CODE_CHALLENGE_PLACEHOLDER";
  const result = document.getElementById("oauth-result");

  if (!result) return;

  const scopes = selectedScopes();
  if (!key || !redirect || scopes.length === 0) {
    result.value = "Fill Keystring, Redirect URI, and choose at least one scope.";
    return;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: key,
    redirect_uri: redirect,
    scope: scopes.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  result.value = `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

function copyOAuthUrl() {
  const result = document.getElementById("oauth-result");
  const status = document.getElementById("oauth-copy-status");
  if (!result || !status) return;

  navigator.clipboard
    .writeText(result.value)
    .then(() => {
      status.textContent = "Authorize URL copied.";
    })
    .catch(() => {
      status.textContent = "Could not copy automatically. Copy manually.";
    });
}

function attachEvents() {
  const copyBtn = document.getElementById("copy-description");
  const buildBtn = document.getElementById("build-oauth-url");
  const copyOAuthBtn = document.getElementById("copy-oauth-url");
  const readonlyBtn = document.getElementById("preset-readonly");
  const sellerOpsBtn = document.getElementById("preset-sellerops");

  if (copyBtn) copyBtn.addEventListener("click", copyDescription);
  if (buildBtn) buildBtn.addEventListener("click", buildAuthorizeUrl);
  if (copyOAuthBtn) copyOAuthBtn.addEventListener("click", copyOAuthUrl);
  if (readonlyBtn) readonlyBtn.addEventListener("click", () => applyPreset("readonly"));
  if (sellerOpsBtn) sellerOpsBtn.addEventListener("click", () => applyPreset("sellerops"));

  document.querySelectorAll("input[name='scope']").forEach((input) => {
    input.addEventListener("change", buildAuthorizeUrl);
  });
}

setDescription();
attachEvents();
applyPreset("readonly");